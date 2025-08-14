import nodemailer from "nodemailer";

export async function sendEmail({ to, cc, bcc, subject, text, html }) {
  try {
 
    // Create a transporter using Zoho
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.in',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Prepare email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      cc,
      bcc,
      subject,
      text,
    };

    // Add HTML if provided
    if (html) {
      mailOptions.html = html;
    }

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully to ${Array.isArray(to) ? to.join(", ") : to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}