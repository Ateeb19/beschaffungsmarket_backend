const { Types } = require("mongoose");
const SubCategory = require("../../models/Sub_Category");
const Post = require("../../models/Post");

const { uploadFile } = require("../../utils/uploadFile");

const validatePostInput = require("../../validation/post");

const getMyPosts = async (req, res) => {
  try {
    const totalDataCount = await Post.countDocuments({
      user: req.user.id,
    });

    const myPostsData = await Post.find({ user: req.user.id })
      .sort({
        created_time: -1,
      })
      .limit(req.body.itemsPerPage)
      .skip((req.body.currentPage - 1) * req.body.itemsPerPage);

    return res
      .status(200)
      .json({ results: myPostsData, totalDataCount: totalDataCount });
  } catch (error) {
    console.log(error);
  }
};

const getAllPosts = async (req, res) => {
  try {
    const userConditions = [{ block: false }];
    const postConditions = [{ block: false }];

    if (req.body.filterKeyword) {
      postConditions.push({
        $or: [
          { title: { $regex: req.body.filterKeyword, $options: "i" } },
          { description: { $regex: req.body.filterKeyword, $options: "i" } },
        ],
      });
    }

    if (req.body.filterPostType) {
      postConditions.push({ type: req.body.filterPostType });
    }

    if (req.body.filterCountry) {
      userConditions.push({ country: req.body.filterCountry });
    }

    if (Types.ObjectId.isValid(req.body.filterSubCategory)) {
      userConditions.push({
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

      userConditions.push({
        company_category: {
          $elemMatch: { category: { $in: subCategoryIds } },
        },
      });
    }

    const userQuery = userConditions.length > 0 ? { $and: userConditions } : {};

    const userList = await User.find(userQuery).select("_id");

    const userIds = userList.map((user) => user._id);

    postConditions.push({
      user: { $in: userIds },
    });

    const postQuery = postConditions.length > 0 ? { $and: postConditions } : {};

    const totalDataCount = await Post.countDocuments(postQuery);

    const postData = await Post.find(postQuery)
      .select("type title description created_time")
      .populate("user", ["country"])
      .sort({ created_time: -1 })
      .limit(req.body.itemsPerPage)
      .skip((req.body.currentPage - 1) * req.body.itemsPerPage);

    return res.status(200).json({
      results: postData,
      totalDataCount: totalDataCount,
    });
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

const getPostingInfo = async (req, res) => {
  try {
    const { postingId } = req.body;

    if (!Types.ObjectId.isValid(postingId)) {
      return res.status(400).json({ status: false, msg: "Something is wrong" });
    }

    const isPost = await Post.findById(postingId).populate("user", ["block"]);

    if (!isPost) {
      return res.status(400).json({ status: false, msg: "Something is wrong" });
    }

    if (isPost.block || isPost.user.block) {
      return res.status(400).json({ status: false, msg: "Something is wrong" });
    } else {
      await Post.findOneAndUpdate(
        { _id: postingId },
        { $inc: { view: 1 } },
        { new: true }
      );

      let premiumUser = false;
      let postInfo;

      if (req.user.id) {
        const userInfo = await User.findById(req.user.id).select("is_premium");

        if (userInfo.is_premium !== 0) {
          premiumUser = true;
        }
      }

      const sponsorList = await User.aggregate([
        { $match: { is_premium: 2, block: false } }, // Match only the Premium+ companies
        { $sample: { size: 3 } }, // Randomly select 3 documents
        {
          $lookup: {
            from: "sub_categories", // Reference the sub_categories collection
            localField: "company_category.category",
            foreignField: "_id",
            as: "company_category",
          },
        },
        {
          $project: {
            company_logo: 1,
            company_name: 1,
            company_category: 1,
            is_premium: 1,
          },
        }, // Project only necessary fields
      ]);

      if (premiumUser) {
        postInfo = await Post.findById(postingId)
          .select("type title description file view")
          .populate({
            path: "user",
            select: [
              "company_name",
              "contact_first_name",
              "contact_last_name",
              "contact_position",
              "contact_email",
              "contact_phone_number",
              "contact_img",
              "country",
              "city",
              "street",
              "zipcode",
              "company_logo",
              "is_premium",
              "company_category",
            ],
            populate: {
              path: "company_category.category",
              populate: {
                path: "main_category",
                model: "main_categories",
              },
            },
          });
      } else {
        postInfo = await Post.findById(postingId)
          .select("type title description view")
          .populate({
            path: "user",
            select: {
              _id: 0,
              country: 1,
            },
          });
      }

      return res.status(200).json({
        status: true,
        sponsorList,
        postInfoData: { ...postInfo._doc, premiumUser },
      });
    }
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

const getLikePosts = async (req, res) => {
  try {
    const skip = (req.body.currentPage - 1) * req.body.itemsPerPage;
    const limit = req.body.itemsPerPage;

    let userInfo = await User.findById(req.user.id).populate({
      path: "like_posts.post",
      populate: {
        path: "user",
        select: "country block",
      },
      select: "type title description block created_time",
    });

    if (userInfo && userInfo.like_posts) {
      // Filter out posts where block is false
      userInfo.like_posts = userInfo.like_posts.filter(
        (likePost) =>
          likePost.post && // Ensure post exists
          !likePost.post.block && // Post is not blocked
          likePost.post.user && // Ensure user exists
          !likePost.post.user.block // User is not blocked
      );

      userInfo.like_posts.sort((a, b) => {
        return new Date(b.post.created_time) - new Date(a.post.created_time);
      });
    }

    const totalDataCount = userInfo.like_posts.length;

    const paginatedPosting = userInfo.like_posts.slice(skip, skip + limit);

    return res.status(200).json({
      results: paginatedPosting,
      totalDataCount: totalDataCount,
    });
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const userInfo = await User.findById(req.user.id);

    const myPostingCount = await Post.countDocuments({
      user: req.user.id,
    });

    if (userInfo.is_premium === 0) {
      return res.status(400).json({
        status: false,
        msg: "You can't create posting. Please upgrade your membership",
      });
    }

    if (userInfo.is_premium === 1 && myPostingCount >= 10) {
      return res.status(400).json({
        status: false,
        msg: "You can't create posting more than 10. Please upgrade your membership",
      });
    }

    if (userInfo.is_premium === 2 && myPostingCount >= 20) {
      return res.status(400).json({
        status: false,
        msg: "You can't create posting more than 20.",
      });
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/svg+xml",
      "application/pdf",
    ];

    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    let fileNames = [];
    if (req.files) {
      for (let i = 0; i < req.files.length; i++) {
        if (req.files[i] && !allowedTypes.includes(req.files[i].mimetype)) {
          return res.status(400).json({
            status: false,
            msg: "Some of post files are invalid",
          });
        }

        if (req.files[i] && req.files[i].size >= 10 * 1024 * 1024) {
          return res.status(400).json({
            status: false,
            msg: "Some of post files are too large. Maximum size is 10MB",
          });
        }

        const fileName = await uploadFile(req.files[i]);

        fileNames.push(fileName);
      }
    }

    const newPost = new Post({
      user: req.user.id,
      type: req.body.type,
      title: req.body.title,
      description: req.body.description,
      file: fileNames,
    });

    await newPost.save().then((post) =>
      res.json({
        status: true,
        msg: "You have successfully created a new post!",
      })
    );
  } catch (error) {
    console.log(error);
  }
};

const deletePost = async (req, res) => {
  try {
    await Post.findOneAndRemove({ _id: req.body.postId })
      .then(() => {
        res.json({
          status: true,
          msg: "Post data deleted successfully.",
        });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
};

const getRandomPosts = async (req, res) => {
  try {
    const postData = await Post.find({
      block: false,
      created_time: {
        $gte: new Date().setDate(new Date().getDate() - 30),
      },
    }).populate({
      path: "user",
      select:
        "company_logo company_name country city street zipcode is_premium block",
    });

    // Filter out posts where the user is blocked
    const filteredPosts = postData.filter(
      (post) => post.user && !post.user.block // Ensure user exists and is not blocked
    );

    const randomPosts = filteredPosts
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);

    return res.status(200).json(randomPosts);
  } catch (error) {
    return res.status(400).json({ status: false, msg: error.message });
  }
};

module.exports = {
  getMyPosts,
  getAllPosts,
  getPostingInfo,
  getLikePosts,
  createPost,
  deletePost,

  getRandomPosts,
};
