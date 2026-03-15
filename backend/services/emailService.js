const transporter = require("../utils/mailer");

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Student Login OTP",
    html: `<h2>Your OTP is ${otp}</h2>`,
  });
};

module.exports = sendOTP;