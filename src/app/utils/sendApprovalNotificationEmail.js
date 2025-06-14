
// src/app/utils/sendApprovalNotificationEmail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendApprovalNotificationEmail({ fullName, email, slug, generatedReferralCode, username, password }) {
  console.log("Sending email with config:", {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? "****" : "undefined",
  });

  const profileUrl = `https://xmytravel.com/experts/${slug}`;
  const year = new Date().getFullYear();

  // Conditionally include the password in the email
  const loginCredentialsSection = password
    ? `
      <p><strong>Your Login Credentials:</strong></p>
      <p>Username: ${username}<br>Password: ${password}</p>
      <p>Please use these credentials to log in to your dashboard at <a href="https://xmytravel.com/user-login">https://xmytravel.com/user-login</a>.</p>
    `
    : `
      <p>Your profile has been approved! You can log in to your dashboard using your existing credentials at <a href="https://xmytravel.com/user-login">https://xmytravel.com/user-login</a>.</p>
    `;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            background: #f3f3f3;
            padding: 20px;
            margin: 0;
          }
          .container {
            max-width: 600px;
            margin: auto;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #ddd;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }
          .banner {
            display: block;
            width: 100%;
            margin: 0;
            padding: 0;
            border-radius: 12px 12px 0 0;
          }
          .content {
            padding: 32px;
          }
          .cta-button {
            background: #36013F;
            color: white;
            padding: 12px 24px;
            border-radius: 24px;
            display: inline-block;
            margin-top: 20px;
            text-decoration: none;
          }
          .footer {
            text-align: center;
            font-size: 13px;
            color: #888;
            margin-top: 40px;
            margin-bottom: 40px;
            line-height: 1.6;
          }
          a {
            color: #36013F;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="https://www.xmytravel.com/emailbanner.jpeg" class="banner" alt="XmyTravel Banner" />
          <div class="content">
            <h2 style="color:#36013F">Hello ${fullName},</h2>
            <p>🎉 Congratulations! Your expert profile has been reviewed and officially approved by our team.</p>
            <p>Your profile is now live on <strong>XmyTravel</strong> and ready to be discovered by travellers around the world.</p>
            ${loginCredentialsSection}
            <p>You can access your profile below:</p>
            <a href="${profileUrl}" class="cta-button">View My Profile</a>
            <p style="font-size: 13px; margin-top: 16px;">
              Or copy and paste this link:<br />
              <a href="${profileUrl}">${profileUrl}</a>
            </p>
            <p style="margin-top: 24px; font-size: 15px;">
              If you know someone with proven expertise in the travel domain, you can refer them to join XmyTravel.
              Here’s your referral code: ${generatedReferralCode}
            </p>
            <p style="margin-top: 24px; font-size: 15px;">
              <a href="https://xmytravel.com/experts/refer">Know an Experienced Travel Expert?</a>
            </p>
            <p style="margin-top: 12px; font-size: 14px;">
              Thank you for joining the XmyTravel community. We’re excited to have your expertise featured on our platform.
            </p>
          </div>
          <div class="footer">
            © ${year} XmyTravel. All rights reserved.<br />
            <a href="https://xmytravel.com">www.xmytravel.com</a><br />
            For support, email <a href="mailto:info@xmytravel.com">info@xmytravel.com</a>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"XmyTravel Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Expert Profile Is Live on XmyTravel",
      html,
    });
    console.log("Approval email sent successfully to:", email);
  } catch (error) {
    console.error("Failed to send approval email:", error);
    throw new Error(`Failed to send approval email: ${error.message}`);
  }
}