const Validator = require("validator");
const isEmpty = require("./is-empty");

const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

module.exports = function validateUpdateUserProfileInput(data, file) {
  let errors = {};

  data.firstName = !isEmpty(data.firstName) ? data.firstName : "";
  data.lastName = !isEmpty(data.lastName) ? data.lastName : "";

  if (Validator.isEmpty(data.firstName)) {
    errors.firstName = "First Name field is required";
  }

  if (Validator.isEmpty(data.lastName)) {
    errors.lastName = "Last Name field is required";
  }

  if (file && !allowedTypes.includes(file.mimetype)) {
    errors.file = "File is invalid";
  }

  if (file && file.size >= 10 * 1024 * 1024) {
    errors.file = "File size is too large. Maximum size is 10MB";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
