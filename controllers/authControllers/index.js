const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const { serialize } = require("cookie");

const keys = require("../../config/keys");
const User = require("../../models/User");

const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

const validateForgotPasswordInput = require("../../validation/forget-password");

const {
  generateVerificationToken,
  generateResetPasswordToken,
} = require("../../utils/tokenUtils");

const {
  sendVerificationEmail,
  sendResetPasswordEmail,
} = require("../../utils/emailUtils");

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

const registerUser = async (req, res) => {
  try {
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const recaptchaResult = await verifyRecaptcha(req.body.recaptchaToken);

    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      return res
        .status(400)
        .json({ status: false, msg: "Recaptcha verification failed" });
    }

    let isUser = await User.findOne({ email: req.body.email });

    if (isUser) {
      return res
        .status(400)
        .json({ status: false, msg: "Email is already registered." });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      const verificationToken = generateVerificationToken();
      const verificationTokenExpires = new Date(Date.now() + 5 * 60 * 1000);

      const newUser = {
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        company_name: req.body.companyName,
        country: req.body.country,
        city: req.body.city,
        street: req.body.street,
        zipcode: req.body.zipcode,
        email: req.body.email,
        password: hashedPassword,
        verification_token: verificationToken,
        verification_token_expires: verificationTokenExpires,
      };

      await User.create(newUser)
        .then(() => {
          res.json({
            status: true,
            msg: "You have been registered successfully! Check your email.",
          });
        })
        .catch((error) => {
          console.log(error);
        });

      await sendVerificationEmail(req.body.email, verificationToken);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

const verifyEmail = async (req, res) => {
  try {
    // Find the verify email token in the database
    const isToken = await User.findOne({
      verification_token: req.query.token,
      verification_token_expires: { $gt: new Date() },
    });

    if (!isToken) {
      return res.status(400).json({
        status: false,
        msg: "Invalid or expired verify token",
      });
    }

    if (isToken.is_verified) {
      return res.status(400).json({
        status: true,
        msg: "Your email has already been verified",
      });
    }

    await User.findOneAndUpdate(
      { _id: isToken._id },
      { $set: { is_verified: true } },
      { new: true }
    )
      .then(() => {
        res.json({
          status: true,
          msg: "Your email is verified successfully",
        });
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const recaptchaResult = await verifyRecaptcha(req.body.recaptchaToken);

    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      return res
        .status(400)
        .json({ status: false, msg: "Recaptcha verification failed" });
    }

    let isUser = await User.findOne({ email: req.body.email });

    if (!isUser) {
      return res
        .status(400)
        .json({ status: false, msg: "Invalid email or password." });
    }

    if (isUser.block) {
      return res
        .status(400)
        .json({ status: false, msg: "Your account is blocked by admin." });
    }

    const isMatch = await bcrypt.compare(req.body.password, isUser.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ status: false, msg: "Invalid email or password." });
    }

    const payload = {
      id: isUser._id,
      fullName: isUser.full_name,
      email: isUser.email,
    };

    jwt.sign(payload, keys.secretOrKey, { expiresIn: "1d" }, (err, token) => {
      if (err) throw err;

      const serialized = serialize("procurement_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });

      res.setHeader("Set-Cookie", serialized);

      return res.status(200).json({
        status: true,
        token: "Bearer " + token,
        msg: "You have successfully logged in!",
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

const logoutUser = async (req, res) => {
  try {
    const serialized = serialize("procurement_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    });

    res.setHeader("Set-Cookie", serialized);

    return res.status(200).json({
      status: true,
      msg: "You have successfully logged out!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { errors, isValid } = validateForgotPasswordInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    let isUser = await User.findOne({ email: req.body.email });

    if (!isUser) {
      return res.status(400).json({
        status: false,
        msg: "User not found. Please register first.",
      });
    }

    // Generate a reset password token and set expiration time (e.g., 1 hour from now)
    const resetPasswordToken = generateResetPasswordToken();
    const resetPasswordTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);

    const userData = {
      reset_verification_token: resetPasswordToken,
      reset_verification_token_expires: resetPasswordTokenExpires,
    };

    await User.findOneAndUpdate(
      { _id: isUser._id },
      { $set: userData },
      { new: true }
    ).then((user) =>
      res.json({
        status: true,
        msg: "Reset password email sent. Check your email for instructions.",
      })
    );

    await sendResetPasswordEmail(req.body.email, resetPasswordToken);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

const checkTokenValidity = async (req, res) => {
  try {
    // Find the reset token in the database
    const isToken = await User.findOne({
      email: req.body.email,
      reset_verification_token: req.body.verificationToken,
      reset_verification_token_expires: { $gt: new Date() },
    });

    if (!isToken) {
      return res.status(400).json({
        status: false,
        msg: "Invalid or expired reset password token",
      });
    }

    // Token is valid, send success response
    res.json({ status: true, msg: "Token is valid" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    await User.findOneAndUpdate(
      { reset_verification_token: req.body.token },
      { $set: { password: hashedPassword } },
      { new: true }
    ).then((user) =>
      res.json({
        status: true,
        msg: "Password reset successfull!",
      })
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

const sendVerifyEmail = async (req, res) => {
  try {
    let isUser = await User.findOne({ email: req.body.email });

    if (!isUser) {
      return res.status(400).json({
        status: false,
        msg: "User not found. Please register first.",
      });
    }

    // Generate a reset password token and set expiration time (e.g., 1 hour from now)
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date(Date.now() + 5 * 60 * 1000);

    const userData = {
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires,
    };

    await User.findOneAndUpdate(
      { _id: isUser._id },
      { $set: userData },
      { new: true }
    ).then((user) =>
      res.json({
        status: true,
        msg: "We have sent you email to verify. Check your email for instructions.",
      })
    );

    await sendVerificationEmail(req.body.email, verificationToken);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, msg: "An error occurred." });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  forgotPassword,
  checkTokenValidity,
  resetPassword,
  sendVerifyEmail,
};
