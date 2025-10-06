const { randomBytes } = require("crypto");

// Helper function to generate a verification token using crypto
function generateVerificationToken() {
  // Generate a 32-character hexadecimal token
  return randomBytes(16).toString("hex");
}

function generateResetPasswordToken() {
  return randomBytes(32).toString("hex");
}

module.exports = {
  generateVerificationToken,
  generateResetPasswordToken,
};
