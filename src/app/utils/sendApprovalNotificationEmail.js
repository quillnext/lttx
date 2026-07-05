import { sendEmail } from "@/lib/email";
import { buildEmailFooter } from "@/app/utils/emailComponents";
import {
  sendWhatsAppProfileApprovedToExpert,
  sendWhatsAppProfileApprovedToAdmin
} from "@/lib/aisensy";

export async function sendApprovalNotificationEmail({
  fullName,
  email,
  slug,
  generatedReferralCode,
  username,
  actionLink,
  phone
}) {
  console.log("Preparing approval email notifications for:", email);

  const profileUrl = `https://www.xmytravel.com/experts/${slug}`;
  const year = new Date().getFullYear();
  const footer = buildEmailFooter({ expertUsername: slug, year });

  // Define login credentials section with Set Password link
  const loginCredentialsSection = `
    <p>Your profile has been approved! To set up your account password and log in to your dashboard, please click the button below:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${actionLink || 'https://xmytravel.com/expert-login'}" class="cta-button" style="background: #36013F; color: white; padding: 12px 24px; border-radius: 24px; display: inline-block; text-decoration: none; font-weight: bold;">Set Your Password & Log In</a>
    </div>
    <p><strong>Your Login Details:</strong></p>
    <p>Username: ${username || "N/A"}<br>Email: ${email}</p>
    <p>If the button doesn't work, copy and paste this link into your browser:<br/>
    <a href="${actionLink || 'https://xmytravel.com/expert-login'}">${actionLink || 'https://xmytravel.com/expert-login'}</a></p>
  `;

  const expertHtml = `
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
            <h2 style="color:#36013F">Hello ${fullName || "Travel Expert"},</h2>
            <p>🎉 Congratulations! Your expert profile has been reviewed and officially approved by our team.</p>
            <p>Your profile is now live on <strong>XmyTravel</strong> and ready to be discovered by travellers around the world.</p>
            ${loginCredentialsSection}
            <p>You can access your live public profile below:</p>
            <div style="text-align: center; margin: 16px 0;">
              <a href="${profileUrl}" style="color: #36013F; font-weight: bold; text-decoration: underline;">View Live Profile</a>
            </div>
            <p style="margin-top: 24px; font-size: 15px;">
              If you know someone with proven expertise in the travel domain, you can refer them to join XmyTravel.
              Here’s your referral code: ${generatedReferralCode || "N/A"}
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

  const adminHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
          a { color: #36013F; }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="https://www.xmytravel.com/emailbanner.jpeg" style="width:100%; display:block; border-radius:16px 16px 0 0;" alt="Banner" />
          <div class="content">
            <h2 style="color: #36013F;">✅ Expert Profile Approved</h2>
            <p>An expert profile has been reviewed and officially approved:</p>
            <p>
              <strong>Name:</strong> ${fullName || "N/A"}<br/>
              <strong>Email:</strong> ${email || "N/A"}<br/>
              <strong>Phone:</strong> ${phone || "N/A"}<br/>
              <strong>Profile URL:</strong> <a href="${profileUrl}">${profileUrl}</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const notificationPromises = [
    // Send Approval Email to Expert
    sendEmail({
      to: email,
      subject: "Your Expert Profile Is Live on XmyTravel",
      html: expertHtml,
    }),
    // Send Approval Email to Admin
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      cc: process.env.ADMIN_EMAIL_CC,
      bcc: process.env.ADMIN_EMAIL_BCC,
      subject: `✅ Profile Approved: ${fullName}`,
      html: adminHtml,
    })
  ];

  // Send WhatsApp to Expert
  if (phone) {
    notificationPromises.push(
      sendWhatsAppProfileApprovedToExpert({
        phone,
        userName: fullName,
        profileUrl,
        actionLink
      }).catch(err => console.error("WhatsApp Expert Approval notification failed:", err))
    );
  }

  // Send WhatsApp to Admin
  if (process.env.ADMIN_PHONE) {
    notificationPromises.push(
      sendWhatsAppProfileApprovedToAdmin({
        phone: process.env.ADMIN_PHONE,
        userName: fullName,
        email
      }).catch(err => console.error("WhatsApp Admin Approval notification failed:", err))
    );
  }

  try {
    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("Error sending profile approval notifications:", error);
  }
}