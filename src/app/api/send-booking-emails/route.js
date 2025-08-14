import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

const emailTemplate = ({
  userName,
  expertName,
  bookingDate,
  bookingTime,
  year,
  type,
  dashboardLink,
  userEmail,
  userPhone,
  userMessage,
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
        <p>Your booking with travel expert <strong>${expertName}</strong> has been confirmed!</p>
        <p><strong>Booking Details:</strong></p>
        <p>Date: ${bookingDate}</p>
        <p>Time: ${bookingTime}</p>
        ${userMessage ? `<p><strong>Your Points to discuss:</strong><br/>"${userMessage}"</p>` : ""}
        <p>Thank you for booking with XMyTravel! You’ll receive further details soon.</p>
        <p>– XMyTravel Team</p>
      `
          : type === "expert"
          ? `
        <h2>Hello ${expertName},</h2>
        <p>You have a new booking on your XMyTravel profile.</p>
        <p><strong>Booking Details:</strong></p>
        <p>Date: ${bookingDate}</p>
        <p>Time: ${bookingTime}</p>
        ${userMessage ? `<p><strong>Points to discuss:</strong><br/>"${userMessage}"</p>` : ""}
        <p>To manage this booking, log in to your expert dashboard:</p>
        <a class="cta-button" href="${dashboardLink}" target="_blank">View Booking</a>
        <p style="font-size: 13px; margin-top: 16px;">
          Or copy and paste this link in your browser:<br/>
          <a href="${dashboardLink}">${dashboardLink}</a>
        </p>
        <p>We look forward to your expert insights! – XMyTravel System</p>
      `
          : type === "admin"
          ? `
        <h2>Hello Admin,</h2>
        <p>A new booking has been made on XMyTravel.</p>
        <p><strong>Booking Details:</strong></p>
        <p><strong>User:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Phone:</strong> ${userPhone}</p>
        <p><strong>Expert:</strong> ${expertName}</p>
        <p><strong>Date:</strong> ${bookingDate}</p>
        <p><strong>Time:</strong> ${bookingTime}</p>
        ${userMessage ? `<p><strong>User Message:</strong><br/>"${userMessage}"</p>` : ""}
        <p>Please review this booking in the Admin Dashboard. – XMyTravel Admin Notification</p>
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
      userPhone,
      userMessage,
      expertEmail,
      expertName,
      bookingDate,
      bookingTime,
    } = await request.json();

    // Validation
    if (!userEmail || !userName || !userPhone || !expertEmail || !expertName || !bookingDate || !bookingTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail) || !emailRegex.test(expertEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (!/^\+?[1-9]\d{1,14}$/.test(userPhone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
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
          subject: "Your Booking Confirmation with XMyTravel",
          html: emailTemplate({
            userName,
            expertName,
            bookingDate,
            bookingTime,
            userMessage,
            year,
            type: "user",
            dashboardLink,
          }),
        }),

        // Email to Expert (excluding user phone)
        sendEmail({
          to: expertEmail,
          subject: "New Booking on XMyTravel",
          html: emailTemplate({
            userName,
            expertName,
            bookingDate,
            bookingTime,
            userMessage,
            year,
            type: "expert",
            dashboardLink,
          }),
        }),

        // Email to Admin (including user details)
        sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: "New Booking Notification on XMyTravel",
          html: emailTemplate({
            userName,
            expertName,
            bookingDate,
            bookingTime,
            userEmail,
            userPhone,
            userMessage,
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
    console.error("Error in /send-booking-emails:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}