const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/authMiddleware");

const {
  getAllNews,
  closeNews,
  getAllNotifications,
} = require("../../controllers/newsControllers");

router.get("/", authMiddleware, getAllNews);

router.post("/close", authMiddleware, closeNews);

router.post("/notifications", authMiddleware, getAllNotifications);

module.exports = router;
