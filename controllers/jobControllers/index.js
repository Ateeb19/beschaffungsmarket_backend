const axios = require("axios");

const validateJobInput = require("../../validation/job");

const { sendJobFormEmail } = require("../../utils/emailUtils");

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

const sendJobForm = async (req, res) => {
  try {
    const { errors, isValid } = validateJobInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const recaptchaResult = await verifyRecaptcha(req.body.recaptchaToken);

    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      return res
        .status(400)
        .json({ status: false, msg: "Recaptcha verification failed" });
    }

    await sendJobFormEmail(req.body);

    return res.status(200).json({
      status: true,
      msg: "Job application sent successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  sendJobForm,
};
