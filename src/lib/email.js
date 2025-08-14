
import nodemailer from "nodemailer";

export async function sendEmail({ to, cc, bcc, subject, text, html }) {
  console.log(`Preparing to send email to: ${to}`);
  console.log(`Using email user: ${process.env.EMAIL_USER ? process.env.EMAIL_USER : 'NOT SET'}`);

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.in',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      logger: true, // Enable logging for more details
      debug: process.env.NODE_ENV === 'development', // More verbose logs in dev
    });

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

    console.log(`Email sent successfully to ${Array.isArray(to) ? to.join(", ") : to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    console.error("Nodemailer error details:", JSON.stringify(error, null, 2));
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
