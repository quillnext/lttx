
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const baseTemplate = ({ name, email, phone, purpose, message, year, isAdmin, isExpert }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Inter', sans-serif; background: #f3f3f3; color: #333; margin: 0; padding: 40px 0; }
    .container {
      max-width: 600px;
      margin: auto;
      background: #fff;
      padding: 0;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e2e2;
      overflow: hidden;
    }
    .content {
      padding: 32px;
    }
    .cta-button {
      background: #36013F;
      color: white;
      padding: 12px 24px;
      border-radius: 30px;
      text-decoration: none;
      display: inline-block;
      margin-top: 16px;
    }
    .footer {
      font-size: 13px;
      color: #888;
      text-align: center;
      margin-top: 40px;
      line-height: 1.6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      font-size: 14px;
    }
    table td {
      padding: 8px 12px;
      border: 1px solid #e0e0e0;
    }
    h2 {
      color: #36013F;
      margin-bottom: 16px;
    }
    p {
      line-height: 1.6;
      font-size: 15px;
    }
    a {
      color: #36013F;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://www.xmytravel.com/emailbanner.jpeg" style="width: 100%; display: block; border-radius: 16px 16px 0 0;" alt="Banner" />
    <div class="content">
      ${
        isAdmin
          ? `
        <h2>📩 New Form Submission Received</h2>
        <p>You’ve received a new lead via the XMyTravel platform. Here are the submission details:</p>
        <table>
          <tr><td><strong>Name</strong></td><td>${name}</td></tr>
          <tr><td><strong>Email</strong></td><td>${email}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${phone}</td></tr>
          <tr><td><strong>Purpose</strong></td><td>${purpose}</td></tr>
          <tr><td><strong>Message</strong></td><td>${message}</td></tr>
        </table>
        <p>Please review this submission in the Admin Dashboard. – XMyTravel Admin Notification</p>
      `
          : `
        <h2>Hello ${name},</h2>
        ${
          isExpert
            ? `
          <p>Thank you for your interest in becoming a verified travel expert on <strong>XMyTravel</strong>.</p>
          <p>We’re thrilled to have you consider joining our invite-only network of premium travel consultants.</p>
          <p>To complete your application, click the button below:</p>
          <a class="cta-button" href="https://xmytravel.com/complete-profile" target="_blank">Complete Your Profile</a>
          <p style="font-size: 13px; margin-top: 16px;">Or copy and paste this link in your browser:<br><a href="https://xmytravel.com/complete-profile">https://xmytravel.com/complete-profile</a></p>
          <p>Thank you for choosing XMyTravel! – XMyTravel Team</p>
        `
            : `
          <p>Thank you for contacting <strong>XMyTravel</strong>. We've received your query and will get back to you shortly.</p>
          <p>We appreciate your time and interest in our platform.</p>
          <p>Thank you for choosing XMyTravel! – XMyTravel Team</p>
        `
        }
      `
      }
      ${!isAdmin ? `<p class="footer">This is an automated confirmation from XMyTravel. Please do not reply to this email.</p>` : ""}
      <p class="footer">
        © ${year} XMyTravel. All rights reserved.<br />
        <a href="https://xmytravel.com" target="_blank">www.xmytravel.com</a><br />
        For support, email <a href="mailto:info@xmytravel.com">info@xmytravel.com</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

export async function POST(request) {
  try {
    const formData = await request.json();
    const { name, email, phone, purpose, message } = formData;

    // Validate required fields
    if (!name || !email || !phone || !purpose || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
    const isExpert = purpose === "Join as an Expert";

    // USER EMAIL
    const userHTML = baseTemplate({ ...formData, year, isAdmin: false, isExpert });
    await transporter.sendMail({
      from: `"XMyTravel Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: isExpert
        ? "Complete Your Profile – XMyTravel Expert Invitation"
        : "Thanks for Contacting XMyTravel",
      html: userHTML,
    });

    // ADMIN EMAIL
    const adminHTML = baseTemplate({ ...formData, year, isAdmin: true, isExpert });
    await transporter.sendMail({
      from: `"XMyTravel Team" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      cc: process.env.ADMIN_EMAIL_CC,
      bcc: process.env.ADMIN_EMAIL_BCC,
      subject: `📥 New Lead Submission: ${purpose}`,
      html: adminHTML,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error sending expert form emails:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}