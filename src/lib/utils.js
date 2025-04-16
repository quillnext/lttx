
import nodemailer from "nodemailer";

export async function sendEmail({ to, cc, bcc, subject, text }) {
  try {
    // Create a transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email with CC and BCC
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to, // Can be a string or array of emails
      cc, // Optional: string or array of emails
      bcc, // Optional: string or array of emails
      subject,
      text,
    });

    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}