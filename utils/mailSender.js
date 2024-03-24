const sgMail = require("@sendgrid/mail");

require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const sendGridEmail = process.env.SENDGRID_EMAIL;

const mailSender = async (email, title, body) => {
  const msg = {
    to: email,
    from: sendGridEmail,
    subject: title,
    text: body,
    html: body,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = mailSender;
