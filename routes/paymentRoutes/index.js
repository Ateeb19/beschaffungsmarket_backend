const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

const { stripeWebhook } = require("../../controllers/paymentControllers");

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

module.exports = router;
