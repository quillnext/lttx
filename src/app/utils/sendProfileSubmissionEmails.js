// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: "smtp.zoho.in",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const emailTemplate = ({ data, year, isAdmin }) => {
//   const {
//     fullName, email, phone, tagline, location, languages,
//     responseTime, pricing, about, services, regions,
//     experience, companies, certifications, generatedReferralCode
//   } = data;

//   return `
//   <!DOCTYPE html>
//   <html>
//     <head>
//       <meta charset="UTF-8" />
//       <style>
//         body { font-family: 'Inter', sans-serif; background: #f3f3f3; color: #333; padding: 40px 0; }
//         .container {
//           max-width: 600px;
//           margin: auto;
//           background: #fff;
//           border-radius: 16px;
//           border: 1px solid #e2e2e2;
//           overflow: hidden;
//           box-shadow: 0 8px 24px rgba(0,0,0,0.08);
//         }
//         .content { padding: 32px; }
//         .footer {
//           font-size: 13px;
//           color: #888;
//           text-align: center;
//           margin-top: 40px;
//         }
//         table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
//         td { padding: 8px 12px; border: 1px solid #e0e0e0; }
//         h2 { color: #36013F; margin-bottom: 16px; }
//         p { font-size: 15px; line-height: 1.6; }
//         a { color: #36013F; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <img src="https://www.xmytravel.com/emailbanner.jpeg" style="width:100%; display:block; border-radius:16px 16px 0 0;" alt="Banner" />
//         <div class="content">
//           ${isAdmin ? `
//             <h2>📥 New Profile Submission</h2>
//             <p>You’ve received a new profile form submission:</p>
//             <table>
//               <tr><td><strong>Full Name</strong></td><td>${fullName}</td></tr>
//               <tr><td><strong>Email</strong></td><td>${email}</td></tr>
//               <tr><td><strong>Phone</strong></td><td>${phone}</td></tr>
//               <tr><td><strong>Tagline</strong></td><td>${tagline}</td></tr>
//               <tr><td><strong>Location</strong></td><td>${location}</td></tr>
//               <tr><td><strong>Languages</strong></td><td>${languages}</td></tr>
//               <tr><td><strong>Response Time</strong></td><td>${responseTime}</td></tr>
//               <tr><td><strong>Pricing</strong></td><td>${pricing}</td></tr>
//               <tr><td><strong>About</strong></td><td>${about}</td></tr>
//               <tr><td><strong>Services</strong></td><td>${services.join(", ")}</td></tr>
//               <tr><td><strong>Regions</strong></td><td>${regions.join(", ")}</td></tr>
//               <tr><td><strong>Experience</strong></td><td>${experience.join(", ")}</td></tr>
//               <tr><td><strong>Companies</strong></td><td>${companies}</td></tr>
//               <tr><td><strong>Certifications</strong></td><td>${certifications}</td></tr>
//               <tr><td><strong>Referral Code</strong></td><td>${generatedReferralCode}</td></tr>
//             </table>
//           ` : `
//             <h2>Hello ${fullName},</h2>
//             <p>Thank you for submitting your profile request on <strong>XmyTravel</strong>.</p>
//             <p>Our team will review your information and notify you once it's approved.</p>
//           `}
//           <p class="footer">
//             © ${year} XmyTravel • <a href="https://xmytravel.com">xmytravel.com</a><br/>
//             For support: <a href="mailto:info@xmytravel.com">info@xmytravel.com</a>
//           </p>
//         </div>
//       </div>
//     </body>
//   </html>
//   `;
// };

// export async function sendProfileSubmissionEmails(formData) {
//   const year = new Date().getFullYear();

//   try {
//     // Send to User
//     const userHTML = emailTemplate({ data: formData, year, isAdmin: false });
//     await transporter.sendMail({
//       from: `"XmyTravel Team" <${process.env.EMAIL_USER}>`,
//       to: formData.email,
//       subject: "Profile Submission Received – XmyTravel",
//       html: userHTML,
//     });

//     // Send to Admin
//     const adminHTML = emailTemplate({ data: formData, year, isAdmin: true });
//     await transporter.sendMail({
//       from: `"XmyTravel Team" <${process.env.EMAIL_USER}>`,
//       to: process.env.ADMIN_EMAIL,
//       cc: process.env.ADMIN_EMAIL_CC,
//       bcc: process.env.ADMIN_EMAIL_BCC,
//       subject: `🔎 New Profile Request: ${formData.fullName}`,
//       html: adminHTML,
//     });
//   } catch (error) {
//     console.error("Error sending emails:", error);
//     throw new Error("Failed to send notification emails");
//   }
// }

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
});

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
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
        td { padding: 8px 12px; border: 1px solid #e0e0e0; }
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
              <tr><td><strong>Full Name</strong></td><td>${fullName}</td></tr>
              <tr><td><strong>Email</strong></td><td>${email}</td></tr>
              <tr><td><strong>Phone</strong></td><td>${phone}</td></tr>
              <tr><td><strong>Tagline</strong></td><td>${tagline}</td></tr>
              <tr><td><strong>Location</strong></td><td>${location}</td></tr>
              <tr><td><strong>Languages</strong></td><td>${languages}</td></tr>
              <tr><td><strong>Response Time</strong></td><td>${responseTime}</td></tr>
              <tr><td><strong>Pricing</strong></td><td>${pricing}</td></tr>
              <tr><td><strong>About</strong></td><td>${about}</td></tr>
              <tr><td><strong>Services</strong></td><td>${services.join(", ")}</td></tr>
              <tr><td><strong>Regions</strong></td><td>${regions.join(", ")}</td></tr>
              <tr><td><strong>Companies</strong></td><td>${companies}</td></tr>
              <tr><td><strong>Certifications</strong></td><td>${certifications}</td></tr>
              <tr><td><strong>Referral Code</strong></td><td>${generatedReferralCode}</td></tr>
            </table>
          ` : `
            <h2>Hello ${fullName},</h2>
            <p>Thank you for submitting your profile request on <strong>XmyTravel</strong>.</p>
            <p>Our team will review your information and notify you once it's approved.</p>
          `}
          <p class="footer">
            © ${year} XmyTravel • <a href="https://xmytravel.com">xmytravel.com</a><br/>
            For support: <a href="mailto:info@xmytravel.com">info@xmytravel.com</a>
          </p>
        </div>
      </div>
    </body>
  </html>
  `;
};

export async function sendProfileSubmissionEmails(formData) {
  const year = new Date().getFullYear();

  try {
    // Send to User
    const userHTML = emailTemplate({ data: formData, year, isAdmin: false });
    await transporter.sendMail({
      from: `"XmyTravel Team" <${process.env.EMAIL_USER}>`,
      to: formData.email,
      subject: "Profile Submission Received – XmyTravel",
      html: userHTML,
    });

    // Send to Admin
    const adminHTML = emailTemplate({ data: formData, year, isAdmin: true });
    await transporter.sendMail({
      from: `"XmyTravel Team" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      cc: process.env.ADMIN_EMAIL_CC,
      bcc: process.env.ADMIN_EMAIL_BCC,
      subject: `🔎 New Profile Request: ${formData.fullName}`,
      html: adminHTML,
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    throw new Error("Failed to send notification emails");
  }
}