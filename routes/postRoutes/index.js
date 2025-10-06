const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/authMiddleware");
const premiumMiddleware = require("../../middlewares/premiumMiddleware");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const {
  getMyPosts,
  getAllPosts,
  getPostingInfo,
  getLikePosts,
  createPost,
  deletePost,

  getRandomPosts,
} = require("../../controllers/postControllers");

router.post("/", authMiddleware, getMyPosts);

router.post("/all", getAllPosts);

router.post("/get-posting-info", premiumMiddleware, getPostingInfo);

router.post("/like-posts", authMiddleware, getLikePosts);

router.post("/create", upload.array("file"), authMiddleware, createPost);

router.post("/delete", authMiddleware, deletePost);

router.get("/random", getRandomPosts);

module.exports = router;
