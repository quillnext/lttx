// /api/send-admin-prompt/route.js
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailTemplate = ({ expertName, question, suggestedAnswer, profileType, year, dashboardLink }) => `
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
    .header-text {
      text-align: center;
      font-size: 14px;
      color: #555;
      margin: 16px 0;
    }
    .footer {
      font-size: 13px;
      color: #888;
      text-align: center;
      margin-top: 40px;
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
    h2 { color: #36013F; margin-bottom: 16px; }
    p { font-size: 15px; line-height: 1.6; }
    a { color: #36013F; }
    .question-box, .suggested-answer-box {
      background-color: #f9f9f9;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      border-left: 4px solid #36013F;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="https://www.xmytravel.com/emailbanner.jpeg" style="width:100%; display:block; border-radius:16px 16px 0 0;" alt="Banner" />
    <div class="header-text">
      Powered by the X - Project T.R.U.T.H. (Travel Reliability & Unified Truth Hub)
    </div>
    <div class="content">
      <h2>Hello ${expertName},</h2>
      <p>Here’s today’s TRUTH question - part of Xmytravel’s mission to remove travel misinformation and highlight authentic, experience-backed answers from real experts like you.</p>
      <div class="question-box">
        <p><strong>Question:</strong><br/>"${question}"</p>
      </div>
      <div class="suggested-answer-box">
        <p><strong>Suggested Answer:</strong><br/>"${suggestedAnswer}"</p>
        <p><em>You can use this answer or provide your own expertise.</em></p>
      </div>
      <p>To respond, login to your dashboard:</p>
      <a class="cta-button" href="${dashboardLink}" target="_blank">Reply Now</a>
      <p style="font-size: 13px; margin-top: 16px;">
        Or copy and paste this link in your browser:<br/>
        <a href="${dashboardLink}">${dashboardLink}</a>
      </p>
      <p>We appreciate your contribution! – XMyTravel Admin</p>
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
    const {
      expertEmail,
      expertName,
      question,
      suggestedAnswer,
      profileType,
    } = await request.json();

    if (!expertEmail || !expertName || !question || !suggestedAnswer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(expertEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        { error: "Email configuration missing" },
        { status: 500 }
      );
    }

    const year = new Date().getFullYear();
    const dashboardLink = "https://xmytravel.com/expert-dashboard";

    await transporter.sendMail({
      from: `"XMyTravel Admin" <${process.env.EMAIL_USER}>`,
      to: expertEmail,
      subject: `Today’s T.R.U.T.H. Question: ${question.substring(0, 50)}${question.length > 50 ? '...' : ''}`,
      html: emailTemplate({
        expertName,
        question,
        suggestedAnswer,
        profileType,
        year,
        dashboardLink,
      }),
    });

    return NextResponse.json({ success: true, message: "Admin prompt email sent" }, { status: 200 });
  } catch (error) {
    console.error("Error sending admin prompt email:", error.message);
    return NextResponse.json({ error: `Failed to send email: ${error.message}` }, { status: 500 });
  }
}