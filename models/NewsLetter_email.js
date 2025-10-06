const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const NewsLetterEmailSchema = new Schema({
  email: {
    type: String,
    require: true,
  },

  created_time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = NewsLetterEmail = mongoose.model(
  "newsletter_emails",
  NewsLetterEmailSchema
);
