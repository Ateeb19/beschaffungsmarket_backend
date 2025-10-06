const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/authMiddleware");
const premiumMiddleware = require("../../middlewares/premiumMiddleware");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
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
} = require("../../controllers/userControllers");

router.get("/get-company-types", getCompanyTypes);

router.get("/get-company-segments", getCompanySegments);

router.get("/get-company-main-categories", getCompanyMainCategories);

router.get("/get-company-sub-categories", getCompanySubCategories);

router.post("/get-cities", getCityListByCountry);

router.get("/getuserinfo", authMiddleware, getUserInfo);

router.post(
  "/update-user-profile",
  upload.single("avatarImg"),
  authMiddleware,
  updateUserProfile
);

router.post(
  "/update-company-profile",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  authMiddleware,
  updateCompanyProfile
);

router.post(
  "/update-company-contact-info",
  upload.single("avatarImg"),
  authMiddleware,
  updateCompanyContactInfo
);

router.post("/change-password", authMiddleware, changePassword);

router.post("/get-companies", getCompanies);

router.post("/get-company-info", premiumMiddleware, getCompanyInfo);

router.post("/add-like-post", authMiddleware, addLikePost);

router.get("/counter-data", getCounterData);

router.get("/random-sponsor-data", premiumMiddleware, getRandomSponsors);

router.post("/save-newsletter-email", saveNewsLetterEmail);

router.post("/upload-file-API", upload.single("file"), uploadFileAPI);

router.get(
  "/update-email-notification",
  authMiddleware,
  updateEmailNotification
);

router.get("/update-news-notification", authMiddleware, updateNewsNotification);

module.exports = router;
