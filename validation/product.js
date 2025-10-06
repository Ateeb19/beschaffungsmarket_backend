const Validator = require("validator");
const isEmpty = require("./is-empty");

const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

module.exports = function validateProductInput(data, file) {
  let errors = {};

  data.title = !isEmpty(data.title) ? data.title : "";

  if (Validator.isEmpty(data.title)) {
    errors.title = "Title field is required";
  }

  if (file && !allowedTypes.includes(file.mimetype)) {
    errors.file = "File is invalid";
  }

  if (file && file.size >= 10 * 1024 * 1024) {
    errors.file = "File size is too large. Maximum size is 10MB";
  }

  if (!file) {
    errors.file = "File is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
