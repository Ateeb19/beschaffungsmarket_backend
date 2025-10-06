const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/authMiddleware");

const {
  getAllMessagesByChatId,
} = require("../../controllers/messageControllers");

router.post("/", authMiddleware, getAllMessagesByChatId);

module.exports = router;
