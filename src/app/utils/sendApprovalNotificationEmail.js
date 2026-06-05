import { sendEmail } from "@/lib/email";
import { buildEmailFooter } from "@/app/utils/emailComponents";

export async function sendApprovalNotificationEmail({ fullName, email, slug, generatedReferralCode, username, password }) {
  console.log("Preparing approval email for:", email);

  const profileUrl = `https://www.xmytravel.com/experts/${slug}`;
  const year = new Date().getFullYear();
  const footer = buildEmailFooter({ expertUsername: slug, year });

  // Define login credentials section without password
  const loginCredentialsSection = `
    <p>Your profile has been approved! You can log in to your dashboard at <a href="https://xmytravel.com/expert-login">https://xmytravel.com/expert-login</a>.</p>
    <p><strong>Your Login Details:</strong></p>
    <p>Username: ${username}<br>Email: ${email}</p>
    <p>If you are a new user, please use the <a href="https://xmytravel.com/expert-forgot-password">password reset link</a> to set your password, or contact support at <a href="mailto:info@xmytravel.com">info@xmytravel.com</a>.</p>
  `;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
          @media only screen and (max-width:600px){
            body { padding: 0 !important; }
            .container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
            .content { padding: 20px !important; }
            img { max-width: 100% !important; height: auto !important; }
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
          <div style="padding: 0 8px 8px;">
            ${footer}
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: "Your Expert Profile Is Live on XmyTravel",
    html,
  });
}