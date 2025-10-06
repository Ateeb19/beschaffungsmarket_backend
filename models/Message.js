const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const MessageSchema = new Schema({
  chat_id: {
    type: Schema.Types.ObjectId,
    ref: "chats",
    require: true,
  },

  sender: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },

  message: {
    type: String,
    require: true,
  },

  file: {
    type: Array,
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

module.exports = Message = mongoose.model("messages", MessageSchema);
