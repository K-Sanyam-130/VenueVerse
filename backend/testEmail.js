const nodemailer = require("nodemailer");
require("dotenv").config();

async function test() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  let info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: "YOUR_EMAIL@gmail.com",
    subject: "Test Email",
    text: "If you receive this, SMTP works!",
  });

  console.log("Sent:", info.messageId);
}

test();
