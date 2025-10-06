const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const NotificationSchema = new Schema({
  content: {
    type: String,
    required: true,
  },

  created_time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Notification = mongoose.model(
  "notifications",
  NotificationSchema
);
