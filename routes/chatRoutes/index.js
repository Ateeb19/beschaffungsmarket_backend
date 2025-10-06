const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/authMiddleware");

const {
  getAllChats,
  createChat,
} = require("../../controllers/chatControllers");

router.get("/", authMiddleware, getAllChats);

router.post("/create", authMiddleware, createChat);

module.exports = router;
