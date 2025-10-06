const Validator = require("validator");
const isEmpty = require("./is-empty");

const { Types } = require("mongoose");

module.exports = function validatePostInput(data) {
  let errors = {};

  data.receiverId = !isEmpty(data.receiverId) ? data.receiverId : "";
  data.title = !isEmpty(data.title) ? data.title : "";
  data.message = !isEmpty(data.message) ? data.message : "";

  if (!Types.ObjectId.isValid(data.receiverId)) {
    errors.receiverId = "ReceiverId field is not valid";
  }

  if (Validator.isEmpty(data.receiverId)) {
    errors.receiverId = "ReceiverId field is required";
  }

  if (Validator.isEmpty(data.title)) {
    errors.title = "Title field is required";
  }

  if (Validator.isEmpty(data.message)) {
    errors.message = "Message field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
