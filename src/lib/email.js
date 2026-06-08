
import nodemailer from "nodemailer";

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email configuration missing");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.zoho.in",
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") !== "false",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    logger: process.env.NODE_ENV === "development",
    debug: process.env.NODE_ENV === "development",
  });
};

export async function sendEmail({ to, cc, bcc, subject, text, html }) {
  if (!to) {
    throw new Error("Email recipient is required");
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"XmyTravel Team" <${process.env.EMAIL_USER}>`,
      to,
      cc,
      bcc,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
