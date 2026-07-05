import { sendEmail } from "@/lib/email";
import { buildSimpleFooter } from "./emailComponents";
import {
  sendWhatsAppProfileSubmittedToExpert,
  sendWhatsAppProfileSubmittedToAdmin
} from "@/lib/aisensy";

const renderRow = (label, val) => {
  if (!val) return '';
  if (Array.isArray(val)) {
    const filtered = val.filter(Boolean);
    if (filtered.length === 0) return '';
    return `<tr><td style="padding: 8px 12px; border: 1px solid #e0e0e0;"><strong>${label}</strong></td><td style="padding: 8px 12px; border: 1px solid #e0e0e0;">${filtered.join(", ")}</td></tr>`;
  }
  const cleanStr = String(val).trim();
  if (!cleanStr || cleanStr === 'undefined' || cleanStr === 'null') return '';
  return `<tr><td style="padding: 8px 12px; border: 1px solid #e0e0e0;"><strong>${label}</strong></td><td style="padding: 8px 12px; border: 1px solid #e0e0e0;">${cleanStr}</td></tr>`;
};

const emailTemplate = ({ data, year, isAdmin }) => {
  const {
    fullName, email, phone, tagline, location, languages,
    responseTime, pricing, about, services, regions,
    experience, companies, certifications, generatedReferralCode
  } = data;

  return `
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
        @media only screen and (max-width:600px){
          body { padding: 0 !important; }
          .container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; }
          .content { padding: 20px !important; }
          img { max-width: 100% !important; height: auto !important; }
        }
        .footer {
          font-size: 13px;
          color: #888;
          text-align: center;
          margin-top: 40px;
        }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
        h2 { color: #36013F; margin-bottom: 16px; }
        p { font-size: 15px; line-height: 1.6; }
        a { color: #36013F; }
      </style>
    </head>
    <body>
      <div class="container">
        <img src="https://www.xmytravel.com/emailbanner.jpeg" style="width:100%; display:block; border-radius:16px 16px 0 0;" alt="Banner" />
        <div class="content">
          ${isAdmin ? `
            <h2>📥 New Profile Submission</h2>
            <p>You’ve received a new profile form submission:</p>
            <table>
              ${renderRow("Full Name", fullName)}
              ${renderRow("Email", email)}
              ${renderRow("Phone", phone)}
              ${renderRow("Tagline", tagline)}
              ${renderRow("Location", location)}
              ${renderRow("Languages", languages)}
              ${renderRow("Response Time", responseTime)}
              ${renderRow("Pricing", pricing)}
              ${renderRow("About", about)}
              ${renderRow("Services", services)}
              ${renderRow("Regions", regions)}
              ${renderRow("Companies", companies)}
              ${renderRow("Certifications", certifications)}
              ${renderRow("Referral Code", generatedReferralCode)}
            </table>
          ` : `
            <h2>Hello ${fullName || "Travel Expert"},</h2>
            <p>Thank you for submitting your profile request on <strong>XmyTravel</strong>.</p>
            <p>Our team will review your information and notify you once it's approved.</p>
          `}
          ${buildSimpleFooter({ year })}
        </div>
      </div>
    </body>
  </html>
  `;
};

export async function sendProfileSubmissionEmails(formData) {
  const year = new Date().getFullYear();

  const emailPromises = [
    // Send to User Email
    sendEmail({
      to: formData.email,
      subject: "Profile Submission Received – XmyTravel",
      html: emailTemplate({ data: formData, year, isAdmin: false }),
    }),
    // Send to Admin Email
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      cc: process.env.ADMIN_EMAIL_CC,
      bcc: process.env.ADMIN_EMAIL_BCC,
      subject: `🔎 New Profile Request: ${formData.fullName}`,
      html: emailTemplate({ data: formData, year, isAdmin: true }),
    })
  ];

  // Send WhatsApp to Expert
  if (formData.phone) {
    emailPromises.push(
      sendWhatsAppProfileSubmittedToExpert({
        phone: formData.phone,
        userName: formData.fullName,
      }).catch(err => console.error("WhatsApp Expert Submission notification failed:", err))
    );
  }

  // Send WhatsApp to Admin
  if (process.env.ADMIN_PHONE) {
    emailPromises.push(
      sendWhatsAppProfileSubmittedToAdmin({
        phone: process.env.ADMIN_PHONE,
        userName: formData.fullName,
        email: formData.email,
      }).catch(err => console.error("WhatsApp Admin Submission notification failed:", err))
    );
  }

  try {
    await Promise.all(emailPromises);
  } catch (error) {
    console.error("Error sending profile submission emails:", error);
    throw new Error("Failed to send notification emails");
  }
}
