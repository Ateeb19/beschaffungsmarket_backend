const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ChatSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },

  receiver: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  created_time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Chat = mongoose.model("chats", ChatSchema);
