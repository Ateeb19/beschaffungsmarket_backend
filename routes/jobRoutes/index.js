const express = require("express");
const router = express.Router();

const { sendJobForm } = require("../../controllers/jobControllers");

router.post("/send", sendJobForm);

module.exports = router;
