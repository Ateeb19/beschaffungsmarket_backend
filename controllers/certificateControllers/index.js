const Certificate = require("../../models/Certificate");

const { uploadFile } = require("../../utils/uploadFile");

const validateCertificateInput = require("../../validation/certificate");

const getMyCertificates = async (req, res) => {
  try {
    const totalDataCount = await Certificate.countDocuments({
      user: req.user.id,
    });

    const myCertificatesData = await Certificate.find({ user: req.user.id })
      .sort({
        created_time: -1,
      })
      .limit(req.body.itemsPerPage)
      .skip((req.body.currentPage - 1) * req.body.itemsPerPage);

    return res
      .status(200)
      .json({ results: myCertificatesData, totalDataCount: totalDataCount });
  } catch (error) {
    console.log(error);
  }
};

const addCertificate = async (req, res) => {
  try {
    const { errors, isValid } = validateCertificateInput(req.body, req.file);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const userInfo = await User.findById(req.user.id);

    const totalDataCount = await Certificate.countDocuments({
      user: req.user.id,
    });

    if (userInfo.is_premium === 0) {
      return res.status(400).json({
        status: false,
        msg: "Please upgrade your membership to upload certificate",
      });
    }

    if (userInfo.is_premium === 1 && totalDataCount > 4) {
      return res.status(400).json({
        status: false,
        msg: "You have reached your limit of 5 uploads. Please upgrade your membership for additional uploads",
      });
    }

    if (userInfo.is_premium === 2 && totalDataCount > 19) {
      return res.status(400).json({
        status: false,
        msg: "You have reached the maximum limit of 20 uploads",
      });
    }

    let newCertificate = {
      user: req.user.id,
      title: req.body.title,
    };

    const imageName = await uploadFile(req.file);

    newCertificate.image = imageName;

    await Certificate.create(newCertificate).then(() =>
      res.json({
        status: true,
        msg: "You have successfully created a new certificate!",
      })
    );
  } catch (error) {
    console.log(error);
  }
};

const editCertificate = async (req, res) => {
  try {
    const { errors, isValid } = validateCertificateInput(req.body, req.file);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    let certificateData = {
      user: req.user.id,
      title: req.body.title,
    };

    const imageName = await uploadFile(req.file);

    certificateData.image = imageName;

    await Certificate.findOneAndUpdate(
      { _id: req.body.certificateId },
      { $set: certificateData },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      msg: "Certificate Data is updated successfully.",
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteCertificate = async (req, res) => {
  try {
    await Certificate.findOneAndRemove({ _id: req.body.certificateId })
      .then(() => {
        res.json({
          status: true,
          msg: "Certificate data deleted successfully.",
        });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getMyCertificates,
  addCertificate,
  editCertificate,
  deleteCertificate,
};
