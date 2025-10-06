const { sendEmail } = require("./sendEmail");

// Helper function to send a verification email
async function sendVerificationEmail(email, verificationToken) {
  try {
    const subject = "Email Verification";
    const body = `Click the following link to verify your email: https://beschaffungsmarkt.com/email-verify?token=${verificationToken}`;

    // Send the email
    const options = {
      to: email,
      subject,
      html: body,
    };
    await sendEmail(options);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    throw new Error("Error sending verification email");
  }
}

// Helper function to send a reset password email
async function sendResetPasswordEmail(email, resetPasswordToken) {
  try {
    const subject = "Password Reset";
    const body = `Click the following link to reset your password: https://beschaffungsmarkt.com/password-email-verify?token=${resetPasswordToken}`;

    // Send the email
    const options = {
      to: email,
      subject,
      html: body,
    };
    await sendEmail(options);
    console.log("Reset password email sent successfully");
  } catch (error) {
    console.error("Error sending reset password email:", error.message);
    throw new Error("Error sending reset password email");
  }
}

// send job form
async function sendJobFormEmail(jobFormData) {
  try {
    const subject = "New Job Form Submission";

    const body = `
      <div>
        <p>Name: ${jobFormData.name}</p>
        <p>Email: ${jobFormData.email}</p>
        <p>Phone Number: ${jobFormData.phoneNumber}</p>
        <p style="white-space: pre-wrap;">${jobFormData.message}</p>
       <div/>
    `;

    // Send the email
    const options = {
      to: "mh.sezen@googlemail.com",
      subject,
      html: body,
    };
    await sendEmail(options);
    console.log("Job Form email sent successfully");
  } catch (error) {
    console.error("Error sending job form email:", error.message);
    throw new Error("Error sending job form email");
  }
}

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendJobFormEmail,
};
