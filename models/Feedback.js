const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const FeedbackSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  phone_number: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  subject: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  file: {
    type: String,
  },

  read: {
    type: Boolean,
    default: false,
  },

  created_time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Feedback = mongoose.model("feedbacks", FeedbackSchema);
