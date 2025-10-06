const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const postRoutes = require("./postRoutes");
const productRoutes = require("./productRoutes");
const certificateRoutes = require("./certificateRoutes");
const categoryRoutes = require("./categoryRoutes");
const chatRoutes = require("./chatRoutes");
const messageRoutes = require("./messageRoutes");
const newsRoutes = require("./newsRoutes");
const feedbackRoutes = require("./feedbackRoutes");
const jobRoutes = require("./jobRoutes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/products", productRoutes);
router.use("/certificates", certificateRoutes);
router.use("/categories", categoryRoutes);
router.use("/chats", chatRoutes);
router.use("/messages", messageRoutes);
router.use("/news", newsRoutes);
router.use("/feedbacks", feedbackRoutes);
router.use("/jobs", jobRoutes);

module.exports = router;
