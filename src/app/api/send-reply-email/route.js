
// import { NextResponse } from "next/server";
// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: 'smtp.zoho.in',
//       port: 465,
//       secure: true,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
// });

// const emailTemplate = ({ userName, expertName, question, reply, year, type }) => `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8" />
//   <style>
//     body { font-family: 'Inter', sans-serif; background: #f3f3f3; color: #333; padding: 40px 0; }
//     .container {
//       max-width: 600px;
//       margin: auto;
//       background: #fff;
//       border-radius: 16px;
//       border: 1px solid #e2e2e2;
//       overflow: hidden;
//       box-shadow: 0 8px 24px rgba(0,0,0,0.08);
//     }
//     .content { padding: 32px; }
//     .footer {
//       font-size: 13px;
//       color: #888;
//       text-align: center;
//       margin-top: 40px;
//     }
//     h2 { color: #36013F; margin-bottom: 16px; }
//     p { font-size: 15px; line-height: 1.6; }
//     a { color: #36013F; }
//     .question-box, .reply-box {
//       background-color: #fff;
//       padding: 16px;
//       border-radius: 8px;
//       margin-bottom: 16px;
//       border: 1px solid #ddd;
//     }
//   </style>
// </head>
// <body>
//   <div class="container">
//     <img src="https://www.xmytravel.com/emailbanner.jpeg" style="width:100%; display:block; border-radius:16px 16px 0 0;" alt="Banner" />
//     <div class="content">
//       ${
//         type === "user" ? `
//           <h2>Hello ${userName},</h2>
//           <p>Great news! <strong>${expertName}</strong> has responded to your question on XMyTravel.</p>
//           <div class="question-box">
//             <p><strong>Your Question:</strong><br/>"${question}"</p>
//           </div>
//           <div class="reply-box">
//             <p><strong>Expert’s Response:</strong><br/>"${reply}"</p>
//           </div>
//           <p>We hope this answer helps you move forward with your travel plans!</p>
//           <p>Thank you for choosing XMyTravel. – XMyTravel Team</p>
//         ` :
//         type === "admin" ? `
//           <h2>Hello Admin,</h2>
//           <p>An expert has responded to a user’s question on XMyTravel.</p>
//           <p><strong>Question:</strong><br/>"${question}"</p>
//           <p><strong>Expert’s Response:</strong><br/>"${reply}"</p>
//           <p><strong>User:</strong> ${userName}</p>
//           <p><strong>Expert:</strong> ${expertName}</p>
//           <p>Please review this response in the Admin Dashboard. – XMyTravel Admin Notification</p>
//         ` : ""
//       }
//       <p class="footer">
//         © ${year} XMyTravel • <a href="https://xmytravel.com">xmytravel.com</a><br/>
//         For support: <a href="mailto:info@xmytravel.com">info@xmytravel.com</a>
//       </p>
//     </div>
//   </div>
// </body>
// </html>
// `;

// export async function POST(request) {
//   try {

//     const { userEmail, userName, expertName, question, reply } = await request.json();

//     if (!userEmail || !userName || !expertName || !question || !reply) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(userEmail)) {
//       return NextResponse.json(
//         { error: "Invalid email address" },
//         { status: 400 }
//       );
//     }

//     if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
//       return NextResponse.json(
//         { error: "Email configuration missing" },
//         { status: 500 }
//       );
//     }

//     const year = new Date().getFullYear();

//     await transporter.sendMail({
//       from: `"XMyTravel Team" <${process.env.EMAIL_USER}>`,
//       to: userEmail,
//       subject: `Reply to Your Question from ${expertName} on XMyTravel`,
//       html: emailTemplate({
//         userName,
//         expertName,
//         question,
//         reply,
//         year,
//         type: "user",
//       }),
//     });

//     // Send the email to the admin
//     await transporter.sendMail({
//       from: `"XMyTravel Team" <${process.env.EMAIL_USER}>`,
//       to: process.env.ADMIN_EMAIL,
//       subject: "Expert Reply: Response to User Question on XMyTravel",
//       html: emailTemplate({
//         userName,
//         expertName,
//         question,
//         reply,
//         year,
//         type: "admin",
//       }),
//     });

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error("Error sending reply email:", error.message);
//     return NextResponse.json(
//       { error: "Failed to send reply email" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { sendReplyEmails } from "./sendEmails";

export async function POST(request) {
  try {
    const { userEmail, userName, expertName, question, reply } = await request.json();

    if (!userEmail || !userName || !expertName || !question || !reply) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Check config
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Email configuration missing" }, { status: 500 });
    }

    // ✅ Respond to frontend immediately
    const response = NextResponse.json({ success: true });
    
    // ⏳ Trigger background email logic (non-blocking)
    sendReplyEmails({ userEmail, userName, expertName, question, reply }).catch(err =>
      console.error("Failed to send emails:", err)
    );

    return response;
  } catch (err) {
    console.error("Error in POST /api/reply:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
