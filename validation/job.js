const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateJobInput(data) {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.phoneNumber = !isEmpty(data.phoneNumber) ? data.phoneNumber : "";
  data.message = !isEmpty(data.message) ? data.message : "";
  data.recaptchaToken = !isEmpty(data.recaptchaToken)
    ? data.recaptchaToken
    : "";

  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }

  if (!/^\+\d{1,3}\d{10}$/.test(data.phoneNumber)) {
    errors.phoneNumber = "Phone Number format is wrong";
  }

  if (Validator.isEmpty(data.phoneNumber)) {
    errors.phoneNumber = "Phone Number field is required";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(data.message)) {
    errors.message = "Message field is required";
  }

  if (Validator.isEmpty(data.recaptchaToken)) {
    errors.recaptchaToken = "Recaptcha Token is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
