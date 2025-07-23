import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailTemplate = ({ userName, subject, message, year, type }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Inter', sans-serif; background: #f3f3f3; color: #333; padding: 40px 0; }
    .container {
      max-width: 600px;
      margin: auto;
      background: #fff;
      border-radius: 16px;
      border: 1px solid #e2e2e2;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
    .content { padding: 32px; }
    .footer {
      font-size: 13px;
      color: #888;
      text-align: center;
      margin-top: 40px;
    }
    h2 { color: #36013F; margin-bottom: 16px; }
    p { font-size: 15px; line-height: 1.6; }
    a { color: #36013F; }
    .message-box {
      background-color: #fff;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      border: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://www.xmytravel.com/emailbanner.jpeg" style="width:100%; display:block; border-radius:16px 16px 0 0;" alt="Banner" />
    <div class="content">
      ${
        type === "user" ? `
          <h2>Hello ${userName},</h2>
          <p>Thank you for reaching out to XMyTravel! We have received your message.</p>
          <div class="message-box">
            <p><strong>Subject:</strong><br/>${subject}</p>
            <p><strong>Message:</strong><br/>${message}</p>
          </div>
          <p>We appreciate your input and will connect with you shortly. Thank you for choosing XMyTravel!</p>
          <p>– XMyTravel Team</p>
        ` :
        type === "admin" ? `
          <h2>Hello Admin,</h2>
          <p>A new contact message has been received on XMyTravel.</p>
          <div class="message-box">
           
            <p><strong>Subject:</strong><br/>${subject}</p>
            <p><strong>Message:</strong><br/>${message}</p>
          </div>
          <p>Please review this message in the Admin Dashboard. – XMyTravel Admin Notification</p>
        ` : ""
      }
      <p class="footer">
        © ${year} XMyTravel • <a href="https://xmytravel.com">xmytravel.com</a><br/>
        For support: <a href="mailto:info@xmytravel.com">info@xmytravel.com</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

export async function POST(request) {
  try {
    const { userEmail, userName, subject, message } = await request.json();

    if (!userEmail || !userName || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Email configuration missing" },
        { status: 500 }
      );
    }

    const year = new Date().getFullYear();

    // Send email to user
    await transporter.sendMail({
      from: `"XMyTravel Team" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Thank You for Contacting XMyTravel`,
      html: emailTemplate({
        userName,
        subject,
        message,
        year,
        type: "user",
      }),
    });

    // Send email to admin
    await transporter.sendMail({
      from: `"XMyTravel Team" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Message on XMyTravel: ${subject}`,
      html: emailTemplate({
        userName,
        subject,
        message,
        year,
        type: "admin",
      }),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error sending contact email:", error.message);
    return NextResponse.json(
      { error: "Failed to send contact email" },
      { status: 500 }
    );
  }
}