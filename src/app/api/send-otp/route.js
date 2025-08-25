
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { adminDb, serverTimestamp } from "../../../lib/firebaseAdmin"; 
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const otpEmailTemplate = ({ userName, otp, year }) => `
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
  </style>
</head>
<body>
  <div class="container">
    <img src="https://www.xmytravel.com/emailbanner.jpeg" style="width:100%; display:block; border-radius:16px 16px 0 0;" alt="Banner" />
    <div class="content">
      <h2>Hello ${userName || "Traveler"},</h2>
      <p>Your one-time password (OTP) for email verification on XMyTravel is:</p>
      <p style="font-size: 24px; font-weight: bold; color: #36013F;">${otp}</p>
      <p>This OTP is valid for 5 minutes. Please enter it to verify your email.</p>
      <p>Thank you for using XMyTravel! – XMyTravel Team</p>
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
    const { email, userName } = await request.json();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    // Store OTP in Firestore
    await adminDb.collection("otps").doc(email).set({
      otp,
      expiry,
      createdAt: serverTimestamp(),
    });

    // Send OTP email
    await transporter.sendMail({
      from: `"XMyTravel Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Email Verification - XMyTravel",
      html: otpEmailTemplate({ userName, otp, year: new Date().getFullYear() }),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}