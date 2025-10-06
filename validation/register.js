const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  data.firstName = !isEmpty(data.firstName) ? data.firstName : "";
  data.lastName = !isEmpty(data.lastName) ? data.lastName : "";
  data.companyName = !isEmpty(data.companyName) ? data.companyName : "";
  data.country = !isEmpty(data.country) ? data.country : "";
  data.city = !isEmpty(data.city) ? data.city : "";
  data.street = !isEmpty(data.street) ? data.street : "";
  data.zipcode = !isEmpty(data.zipcode) ? data.zipcode : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.recaptchaToken = !isEmpty(data.recaptchaToken)
    ? data.recaptchaToken
    : "";

  if (Validator.isEmpty(data.firstName)) {
    errors.firstName = "First Name field is required";
  }

  if (Validator.isEmpty(data.lastName)) {
    errors.lastName = "Last Name field is required";
  }

  if (Validator.isEmpty(data.companyName)) {
    errors.companyName = "Company Name field is required";
  }

  if (Validator.isEmpty(data.country)) {
    errors.country = "Country field is required";
  }

  if (Validator.isEmpty(data.city)) {
    errors.city = "City field is required";
  }

  if (Validator.isEmpty(data.street)) {
    errors.street = "Street field is required";
  }

  if (!/^\d{5}$/.test(data.zipcode)) {
    errors.zipcode = "Please enter a valid zipcode";
  }

  if (Validator.isEmpty(data.zipcode)) {
    errors.zipcode = "Zipcode field is required";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password cannot be less than 8 characters.";
  }

  if (Validator.isEmpty(data.recaptchaToken)) {
    errors.recaptchaToken = "Recaptcha Token is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
