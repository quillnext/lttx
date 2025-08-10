import { NextResponse } from "next/server";
import { sendEmail } from "../../../lib/email"; // Adjust the path if needed

// Email template function (same as yours)
const emailTemplate = ({
  userName,
  expertName,
  question,
  userEmail,
  userPhone,
  year,
  type,
  dashboardLink,
}) => `
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
  </style>
</head>
<body>
  <div class="container">
    <img src="https://www.xmytravel.com/emailbanner.jpeg" style="width:100%; display:block; border-radius:16px 16px 0 0;" alt="Banner" />
    <div class="content">
      ${
        type === "user"
          ? `
        <h2>Hello ${userName},</h2>
        <p>Thank you for reaching out to travel expert <strong>${expertName}</strong> on XMyTravel!</p>
        <p>We're excited to connect you with experienced guidance for your travel needs.</p>
        <p><strong>Your Question:</strong><br/>"${question}"</p>
        <p>Our expert will review your query and get back to you shortly.</p>
        <p>Thank you for using XMyTravel! – XMyTravel Team</p>
      `
          : type === "expert"
          ? `
        <h2>Hello ${expertName},</h2>
        <p>You've received a new question from a traveler on your XMyTravel profile.</p>
        <p><strong>Question:</strong><br/>"${question}"</p>
        <p><strong>From:</strong> ${userName}</p>
        <p>To reply, login to your expert dashboard:</p>
        <a class="cta-button" href="${dashboardLink}" target="_blank">Reply Now</a>
        <p style="font-size: 13px; margin-top: 16px;">
          Or copy and paste this link in your browser:<br/>
          <a href="${dashboardLink}">${dashboardLink}</a>
        </p>
        <p>We look forward to your expert insights! – XMyTravel System</p>
      `
          : type === "admin"
          ? `
        <h2>Hello Admin,</h2>
        <p>A new user inquiry has been submitted on XMyTravel.</p>
        <p><strong>Question:</strong><br/>"${question}"</p>
        <p><strong>User:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Phone:</strong> ${userPhone}</p>
        <p><strong>Expert Assigned:</strong> ${expertName}</p>
        <p>Please review this submission in the Admin Dashboard. – XMyTravel Admin Notification</p>
      `
          : ""
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
    const {
      userEmail,
      userName,
      expertEmail,
      expertName,
      question,
      userPhone,
    } = await request.json();

    // Validation
    if (!userEmail || !userName || !expertEmail || !expertName || !question || !userPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail) || !emailRegex.test(expertEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Email configuration missing" }, { status: 500 });
    }

    const year = new Date().getFullYear();
    const dashboardLink = "https://xmytravel.com/expert-dashboard";

    // Fire-and-forget emails
    setTimeout(() => {
      Promise.allSettled([
        // Email to User
        sendEmail({
          to: userEmail,
          subject: "Your Question Has Been Submitted to XMyTravel",
          html: emailTemplate({
            userName,
            expertName,
            question,
            userEmail,
            userPhone,
            year,
            type: "user",
            dashboardLink,
          }),
        }),

        // Email to Expert
        sendEmail({
          to: expertEmail,
          subject: "New Question from a Traveler on XMyTravel",
          html: emailTemplate({
            userName,
            expertName,
            question,
            userEmail,
            userPhone,
            year,
            type: "expert",
            dashboardLink,
          }),
        }),

        // Email to Admin
        sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: "New User Inquiry Submitted on XMyTravel",
          html: emailTemplate({
            userName,
            expertName,
            question,
            userEmail,
            userPhone,
            year,
            type: "admin",
            dashboardLink,
          }),
        }),
      ]).then((results) => {
        results.forEach((result, i) => {
          if (result.status === "rejected") {
            console.error(`Email #${i + 1} failed:`, result.reason);
          }
        });
      });
    }, 100); // Let response go first

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in /send-question-emails:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
