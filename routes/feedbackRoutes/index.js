const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { sendFeedback } = require("../../controllers/feedbackControllers");

router.post("/send", upload.single("file"), sendFeedback);

module.exports = router;
