const express = require("express");
const router = express.Router();

const {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  forgotPassword,
  checkTokenValidity,
  resetPassword,
  sendVerifyEmail,
} = require("../../controllers/authControllers");

router.post("/register", registerUser);

router.get("/verify-email", verifyEmail);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.post("/forgot-password", forgotPassword);

router.post("/password-email-verify", checkTokenValidity);

router.post("/reset-password", resetPassword);

router.post("/send-verify-email", sendVerifyEmail);

module.exports = router;
