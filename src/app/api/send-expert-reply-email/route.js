import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br/>");

const emailTemplate = ({ userName, expertName, caseTitle, reply, year, type }) => `
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
    .box {
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
          <h2>Hello ${escapeHtml(userName)},</h2>
          <p>Great news! <strong>${escapeHtml(expertName)}</strong> has responded to your travel request on XMyTravel.</p>
          ${caseTitle ? `<div class="box"><p><strong>Your Request:</strong><br/>${escapeHtml(caseTitle)}</p></div>` : ""}
          <div class="box"><p><strong>Expert Response:</strong><br/>${escapeHtml(reply)}</p></div>
          <p>We hope this helps you move forward with your travel plans.</p>
          <p>Thank you for choosing XMyTravel. - XMyTravel Team</p>
        ` : `
          <h2>Hello Admin,</h2>
          <p>An expert has responded to a traveller request on XMyTravel.</p>
          ${caseTitle ? `<p><strong>Request:</strong><br/>${escapeHtml(caseTitle)}</p>` : ""}
          <p><strong>Expert Response:</strong><br/>${escapeHtml(reply)}</p>
          <p><strong>User:</strong> ${escapeHtml(userName)}</p>
          <p><strong>Expert:</strong> ${escapeHtml(expertName)}</p>
          <p>Please review this response in the Admin Dashboard. - XMyTravel Admin Notification</p>
        `
      }
      <p class="footer">
        &copy; ${year} XMyTravel &bull; <a href="https://xmytravel.com">xmytravel.com</a><br/>
        For support: <a href="mailto:info@xmytravel.com">info@xmytravel.com</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

export async function POST(request) {
  try {
    const body = await request.json();
    const userEmail = body.userEmail || body.user_email || "";
    const userName = body.userName || body.user_name || "Traveller";
    const expertName = body.expertName || body.expert_name || "XMyTravel Expert";
    const caseTitle = body.question || body.requestTitle || body.serviceType || body.subject || "Travel request";
    const reply = body.reply || body.response || "";

    if (!reply) {
      return NextResponse.json(
        { error: "Missing required field: reply" },
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailPromises = [
      sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `Expert Reply Submitted by ${expertName}`,
        html: emailTemplate({
          userName,
          expertName,
          caseTitle,
          reply,
          year,
          type: "admin",
        }),
      }),
    ];

    if (userEmail) {
      if (!emailRegex.test(userEmail)) {
        return NextResponse.json(
          { error: "Invalid user email address" },
          { status: 400 }
        );
      }

      emailPromises.push(
        sendEmail({
          to: userEmail,
          subject: `Reply from ${expertName} on XMyTravel`,
          html: emailTemplate({
            userName,
            expertName,
            caseTitle,
            reply,
            year,
            type: "user",
          }),
        })
      );
    }

    await Promise.all(emailPromises);

    return NextResponse.json(
      {
        success: true,
        userEmailSent: Boolean(userEmail),
        adminEmailSent: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending expert reply email:", error.message);
    return NextResponse.json(
      { error: "Failed to send expert reply email" },
      { status: 500 }
    );
  }
}
