const axios = require("axios");
const Feedback = require("../../models/Feedback");

const { uploadFile } = require("../../utils/uploadFile");

const validateFeedbackInput = require("../../validation/feedback");

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

const sendFeedback = async (req, res) => {
  try {
    const { errors, isValid } = validateFeedbackInput(req.body, req.file);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const recaptchaResult = await verifyRecaptcha(req.body.recaptchaToken);

    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      return res
        .status(400)
        .json({ status: false, msg: "Recaptcha verification failed" });
    }

    let newFeedback = {
      name: req.body.name,
      phone_number: req.body.phoneNumber,
      email: req.body.email,
      subject: req.body.subject,
      title: req.body.title,
      description: req.body.description,
    };

    if (req.file) {
      const fileName = await uploadFile(req.file);

      newFeedback.file = fileName;
    }

    await Feedback.create(newFeedback).then(() =>
      res.json({
        status: true,
        msg: "You have successfully sent!",
      })
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  sendFeedback,
};
