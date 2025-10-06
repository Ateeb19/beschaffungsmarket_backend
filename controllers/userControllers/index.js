const bcrypt = require("bcryptjs");
const axios = require("axios");
const { Types } = require("mongoose");

const User = require("../../models/User");
const CompanyType = require("../../models/Company_Type");
const CompanySegment = require("../../models/Company_Segment");
const MainCategory = require("../../models/Main_Category");
const SubCategory = require("../../models/Sub_Category");
const NewsLetterEmail = require("../../models/NewsLetter_email");

const validateUpdateUserProfileInput = require("../../validation/update-user-profile");
const validateUpdateCompanyProfileInput = require("../../validation/update-company-profile");

const validateNewsLetterEmailInput = require("../../validation/news-letter-email");

const { uploadFile } = require("../../utils/uploadFile");

const Product = require("../../models/Product");
const Certificate = require("../../models/Certificate");
const Post = require("../../models/Post");

async function verifyRecaptcha(token) {
  const response = await axios.post(
    "https://www.google.com/recaptcha/api/siteverify",
    null,
    {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
      },
    }
  );

  return response.data;
}

const getCompanyTypes = async (req, res) => {
  try {
    const companyTypeData = await CompanyType.find();

    return res.status(200).json(companyTypeData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

const getCompanySegments = async (req, res) => {
  try {
    const companySegmentData = await CompanySegment.find();

    return res.status(200).json(companySegmentData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

const getCompanyMainCategories = async (req, res) => {
  try {
    const mainCategoryData = await MainCategory.find();

    return res.status(200).json(mainCategoryData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

const getCompanySubCategories = async (req, res) => {
  try {
    const subCategoryData = await SubCategory.find();

    return res.status(200).json(subCategoryData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

const getCityListByCountry = async (req, res) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${
        req.body.cityKeyword
      }&types=(cities)&components=country:${
        req.body.countryName === "Germany" ? "DE" : "TR"
      }&key=${process.env.GOOGLE_API}`,
      {
        maxContentLength: 10 * 1024 * 1024, // setting a limit of 10MB for response payload size
      }
    );

    const cityNames = await response.data.predictions.map((city) => {
      return {
        label: city.structured_formatting.main_text,
        value: city.structured_formatting.main_text,
      };
    });

    return res.json(cityNames);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

const getUserInfo = async (req, res) => {
  try {
    let userInfo = await User.findById(req.user.id)
      .select(
        "-verification_token -verification_token_expires -reset_verification_token -reset_verification_token_expires"
      )
      .populate("company_segment.segment")
      .populate("company_category.category");

    return res.status(200).json(userInfo);
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { errors, isValid } = validateUpdateUserProfileInput(
      req.body,
      req.file
    );

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const userData = await User.findById(req.user.id);

    if (!userData) {
      return res.status(400).json({
        status: false,
        msg: "Something is wrong",
      });
    }

    let updateUserData = {
      first_name: req.body.firstName,
      last_name: req.body.lastName,
    };

    if (req.body.avatarImg === "false") {
      updateUserData.avatar = "";
    }

    if (req.file) {
      const avatarName = await uploadFile(req.file);

      updateUserData.avatar = avatarName;
    }

    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: updateUserData },
      { new: true }
    )
      .then(() => {
        res.json({
          status: true,
          msg: "Profile is updated successfully",
        });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

const updateCompanyProfile = async (req, res) => {
  try {
    const { errors, isValid } = validateUpdateCompanyProfileInput(
      req.body,
      req.files["logo"] ? req.files["logo"][0] : null,
      req.files["banner"] ? req.files["banner"][0] : null
    );

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const userData = await User.findById(req.user.id);

    if (!userData) {
      return res.status(400).json({
        status: false,
        msg: "User is not existed",
      });
    }

    if (userData.is_premium === 0 && req.body.companyDescription2) {
      return res.status(400).json({
        status: false,
        msg: "You are not premium user (description2)",
      });
    }

    if (userData.is_premium === 0 && JSON.parse(req.body.category).length > 1) {
      return res.status(400).json({
        status: false,
        msg: "Free users can only select 1 category",
      });
    }

    if (userData.is_premium !== 0 && JSON.parse(req.body.category).length > 5) {
      return res.status(400).json({
        status: false,
        msg: "Users can't select more than 5 categories",
      });
    }

    if (userData.is_premium === 0 && JSON.parse(req.body.keyword).length > 0) {
      return res.status(400).json({
        status: false,
        msg: "You can't have keyword",
      });
    }

    if (userData.is_premium === 1 && JSON.parse(req.body.keyword).length > 50) {
      return res.status(400).json({
        status: false,
        msg: "You can't have more than 50 keywords. Please upgrade your membership",
      });
    }

    if (
      userData.is_premium === 2 &&
      JSON.parse(req.body.keyword).length > 100
    ) {
      return res.status(400).json({
        status: false,
        msg: "You can't have more than 100 keywords",
      });
    }

    if (
      userData.is_premium === 0 &&
      req.files["banner"] &&
      req.files["banner"][0].mimetype === "video/mp4"
    ) {
      return res.status(400).json({
        status: false,
        msg: "You can upload only image as banner because you are not a premium user",
      });
    }

    let segmentData = JSON.parse(req.body.companySegment).map((item) => ({
      segment: item._id,
    }));

    let categoryData = JSON.parse(req.body.category).map((item) => ({
      category: item._id,
    }));

    let updateUserData = {
      company_name: req.body.companyName,
      company_description: req.body.companyDescription,
      company_description2: req.body.companyDescription2,
      company_type: req.body.companyType ? req.body.companyType : null,
      company_segment: segmentData,
      company_category: categoryData,
      country: req.body.country,
      city: req.body.city,
      street: req.body.street,
      zipcode: req.body.zipcode,
      taxpayer_id: req.body.taxpayerID,
      fax_number: req.body.faxNumber,
      website: req.body.website,
      hscode: req.body.hscode,
      founded_year: req.body.foundedYear,
      employee_number: req.body.employeeNumber,
      keyword: JSON.parse(req.body.keyword),
    };

    if (req.body.logo === "false") {
      updateUserData.company_logo = "";
    }

    if (req.body.banner === "false") {
      updateUserData.company_banner = "";
    }

    if (req.files["logo"] && req.files["logo"][0]) {
      const logoName = await uploadFile(req.files["logo"][0]);

      updateUserData.company_logo = logoName;
    }

    if (req.files["banner"] && req.files["banner"][0]) {
      const bannerName = await uploadFile(req.files["banner"][0]);

      updateUserData.company_banner = bannerName;
    }

    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: updateUserData },
      { new: true }
    )
      .then(() => {
        res.json({
          status: true,
          msg: "Profile is updated successfully",
        });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

const updateCompanyContactInfo = async (req, res) => {
  try {
    if (
      req.body.email &&
      !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(req.body.email)
    ) {
      return res.status(400).json({
        status: false,
        msg: "Please enter a valid email address.",
      });
    }

    if (
      req.body.phoneNumber &&
      !/^\+[1-9][0-9\s\-()]{6,14}$/.test(req.body.phoneNumber)
    ) {
      return res.status(400).json({
        status: false,
        msg: "Please enter a valid phone number.",
      });
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/svg+xml",
    ];

    if (req.file && !allowedTypes.includes(req.file.mimetype)) {
      errors.file = "File is invalid";
    }

    if (req.file && req.file.size >= 10 * 1024 * 1024) {
      return res.status(400).json({
        status: false,
        msg: "Contact Image is too large. Maximum size is 10MB",
      });
    }

    const userData = await User.findById(req.user.id);

    if (!userData) {
      return res.status(400).json({
        status: false,
        msg: "Something is wrong",
      });
    }

    let updateContactData = {
      contact_first_name: req.body.firstName,
      contact_last_name: req.body.lastName,
      contact_position: req.body.position,
      contact_email: req.body.email,
      contact_phone_number: req.body.phoneNumber,
    };

    if (req.body.avatarImg === "false") {
      updateContactData.contact_img = "";
    }

    if (req.file) {
      const avatarName = await uploadFile(req.file);

      updateContactData.contact_img = avatarName;
    }

    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: updateContactData },
      { new: true }
    )
      .then(() => {
        res.json({
          status: true,
          msg: "Contact Info is updated successfully",
        });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const userData = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(
      req.body.currentPassword,
      userData.password
    );

    if (!isMatch) {
      return res
        .status(400)
        .json({ status: false, msg: "Current password is not correct" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: { password: hashedPassword } },
      { new: true }
    ).then((user) => {
      return res.status(200).json({
        status: true,
        msg: "Password reset successfull!",
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

const getCompanies = async (req, res) => {
  try {
    const conditions = [{ block: false }];

    if (req.body.filterKeyword) {
      conditions.push({
        $or: [
          { company_name: { $regex: req.body.filterKeyword, $options: "i" } },
          { keyword: { $regex: req.body.filterKeyword, $options: "i" } },
        ],
      });
    }

    if (req.body.filterCountry) {
      conditions.push({ country: req.body.filterCountry });
    }

    if (Types.ObjectId.isValid(req.body.filterSubCategory)) {
      conditions.push({
        company_category: {
          $elemMatch: { category: Types.ObjectId(req.body.filterSubCategory) },
        },
      });
    }

    if (Types.ObjectId.isValid(req.body.filterMainCategory)) {
      const subCategories = await SubCategory.find({
        main_category: req.body.filterMainCategory,
      });

      const subCategoryIds = subCategories.map((subCat) => subCat._id);

      conditions.push({
        company_category: {
          $elemMatch: { category: { $in: subCategoryIds } },
        },
      });
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};

    // Get total count of documents matching the query
    const totalDataCount = await User.countDocuments(query);

    // Fetch the main list of 10 companies
    const companyList = await User.find(query)
      .select(
        "company_name company_description company_description2 company_logo is_premium"
      )
      .sort({ is_premium: -1 })
      .sort("company_name")
      .limit(req.body.itemsPerPage)
      .skip((req.body.currentPage - 1) * req.body.itemsPerPage);

    const companyListWithProducts = await Promise.all(
      companyList.map(async (company) => {
        const products = await Product.find({ user: company._id });

        return {
          ...company._doc,
          products,
        };
      })
    );

    // Fetch all Premium+ companies
    const allSponsorCompanies = await User.find({
      is_premium: 2,
      block: false,
    }).select(
      "company_name company_description company_description2 company_logo is_premium"
    );

    // Filter out Premium+ companies that are already in the main list
    const mainCompanyIds = companyList.map((company) => company._id.toString());
    const filteredSponsorCompanies = allSponsorCompanies.filter(
      (company) => !mainCompanyIds.includes(company._id.toString())
    );

    // Randomly select 3 Premium+ companies from the filtered list
    const selectedSponsorCompanyList = filteredSponsorCompanies
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const selectedSponsorCompanyListWithProducts = await Promise.all(
      selectedSponsorCompanyList.map(async (company) => {
        const products = await Product.find({ user: company._id });

        return {
          ...company._doc,
          products,
        };
      })
    );

    return res.status(200).json({
      sponsorList: selectedSponsorCompanyListWithProducts,
      companyList: companyListWithProducts,
      totalDataCount: totalDataCount,
    });
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

const getCompanyInfo = async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ status: false, msg: "Something is wrong" });
    }

    let premiumUser = false;

    if (req.user.id) {
      const userInfo = await User.findById(req.user.id).select("is_premium");

      if (userInfo.is_premium !== 0) {
        premiumUser = true;
      }
    }

    const companySelectFields = premiumUser
      ? "company_name company_description company_description2 company_type company_segment company_category contact_first_name contact_last_name contact_position contact_email contact_phone_number contact_img country city street zipcode website founded_year employee_number company_logo company_banner is_premium"
      : "company_name company_description company_description2 company_type company_segment company_category country city street zipcode founded_year employee_number company_logo";

    const companyInfo = await User.findById(companyId)
      .select(companySelectFields)
      .populate({
        path: "company_category.category",
        populate: {
          path: "main_category",
          model: "main_categories",
        },
      })
      .populate("company_type")
      .populate("company_segment.segment");

    if (!companyInfo || companyInfo.block) {
      return res.status(400).json({ status: false, msg: "Something is wrong" });
    }

    const products = await Product.find({ user: companyId });

    const certificates = await Certificate.find({ user: companyId });

    const result = { ...companyInfo._doc, products, certificates, premiumUser };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

const addLikePost = async (req, res) => {
  try {
    let userInfo = await User.findById(req.user.id);

    if (!Types.ObjectId.isValid(req.body.postId)) {
      return res.status(400).json({ status: false, msg: "Something is wrong" });
    }

    const isPostIndex = userInfo.like_posts.findIndex(
      (item) => item.post.toString() === req.body.postId
    );

    if (isPostIndex !== -1) {
      userInfo.like_posts.splice(isPostIndex, 1);

      await userInfo.save();

      return res.status(200).json({
        status: true,
        msg: "Posting removed from favorites successfully",
      });
    } else {
      userInfo.like_posts.push({ post: req.body.postId });

      await userInfo.save();

      return res.status(200).json({
        status: true,
        msg: "Posting added from favorites successfully",
      });
    }
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

const getCounterData = async (req, res) => {
  try {
    const companyCount = await User.countDocuments();

    const postingCount = await Post.countDocuments();

    return res.status(200).json({ companyCount, postingCount });
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

const getRandomSponsors = async (req, res) => {
  try {
    let premiumUser = false;

    if (req.user.id) {
      const userInfo = await User.findById(req.user.id).select("is_premium");

      if (userInfo.is_premium !== 0) {
        premiumUser = true;
      }
    }

    const sponsorSelectFields = premiumUser
      ? "company_name company_description company_description2 company_logo contact_first_name contact_last_name contact_position contact_img country city street zipcode"
      : "company_name company_description company_description2 company_logo country city street zipcode";

    const sponsorData = await User.find({ is_premium: 2, block: false }).select(
      sponsorSelectFields
    );

    const randomSponsors = sponsorData
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    return res.status(200).json({ result: randomSponsors, premiumUser });
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

const saveNewsLetterEmail = async (req, res) => {
  try {
    const { errors, isValid } = validateNewsLetterEmailInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const recaptchaResult = await verifyRecaptcha(req.body.recaptchaToken);

    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      return res
        .status(400)
        .json({ status: false, msg: "Recaptcha verification failed" });
    }

    let isNewsLetterEmail = await NewsLetterEmail.findOne({
      email: req.body.email,
    });

    if (isNewsLetterEmail) {
      return res
        .status(400)
        .json({ status: false, msg: "Email is already saved." });
    } else {
      const newNewsLetterEmail = {
        email: req.body.email,
      };

      await NewsLetterEmail.create(newNewsLetterEmail)
        .then(() => {
          res.json({
            status: true,
            msg: "Thank you for Newsletter Registration.",
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

const uploadFileAPI = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file" });
    }

    const fileName = await uploadFile(req.file);

    return res.json({
      status: true,
      fileName: fileName,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

const updateEmailNotification = async (req, res) => {
  try {
    const userInfo = await User.findById(req.user.id);

    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: { email_notification: !userInfo.email_notification } },
      { new: true }
    ).then((user) => {
      return res.status(200).json({
        status: true,
        msg: user.email_notification
          ? "Email Notification is enable now!"
          : "Email Notification is disable now!",
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

const updateNewsNotification = async (req, res) => {
  try {
    const userInfo = await User.findById(req.user.id);

    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: { news_notification: !userInfo.news_notification } },
      { new: true }
    ).then((user) => {
      return res.status(200).json({
        status: true,
        msg: user.news_notification
          ? "News Notification is enable now!"
          : "News Notification is disable now!",
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

module.exports = {
  getCompanyTypes,
  getCompanySegments,
  getCompanyMainCategories,
  getCompanySubCategories,
  getCityListByCountry,
  getUserInfo,
  updateUserProfile,
  updateCompanyProfile,
  updateCompanyContactInfo,
  changePassword,
  getCompanies,
  getCompanyInfo,
  addLikePost,
  getCounterData,
  getRandomSponsors,
  saveNewsLetterEmail,
  uploadFileAPI,
  updateEmailNotification,
  updateNewsNotification,
};
