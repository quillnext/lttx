import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { sendWhatsAppReply } from "@/lib/aisensy";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br/>");

const plainText = (value = "") => String(value || "").trim();

const optionalLabels = {
  nextSteps: "Next Steps You Should Take",
  dayWiseStructure: "Day-wise Structure Suggestion",
  stayStrategy: "Stay Strategy",
  routeLogic: "Route Logic",
  reworkedVersion: "Reworked Version Suggestion",
  bestOption: "Best Option",
  whyThisWorks: "Why this works",
  areaVerdict: "Area Verdict",
};

const isUnderstandingChunk = (value = "") =>
  /^((what i understand from your plan)|understanding|diagnosis)\s*:/i.test(value.trim());

const parsePrescriptionReply = (reply) => {
  if (!reply) return null;
  if (typeof reply === "object") return reply;

  try {
    const parsed = JSON.parse(reply);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const getUnderstandingText = (reply, caseTitle) => {
  const understanding = plainText(reply)
    .split(/\n{2,}/)
    .find(isUnderstandingChunk);

  if (understanding) {
    return understanding.replace(/^.*?:\s*/s, "").trim();
  }

  return caseTitle
    ? `The expert understood that you need guidance for: ${caseTitle}`
    : "The expert reviewed your travel request and prepared the recommendation below.";
};

const getReplyItems = (reply) => {
  const chunks = plainText(reply)
    .split(/\n{2,}/)
    .map((item) => item.replace(/^-+\s*/gm, "").trim())
    .filter((item) => !isUnderstandingChunk(item))
    .filter(Boolean);

  return (chunks.length ? chunks : [plainText(reply)])
    .map((item, index) => `<div style="border:1px solid #eee3f0;border-radius:16px;padding:18px;margin-top:14px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="42" valign="top">
            <div style="width:36px;height:36px;border-radius:10px;background:#36013F;color:#F4D35E;text-align:center;line-height:36px;font-size:14px;font-weight:700;">${index + 1}</div>
          </td>
          <td valign="top" style="padding-left:12px;">
            <div style="font-size:14px;line-height:24px;color:#65566a;">${escapeHtml(item)}</div>
          </td>
        </tr>
      </table>
    </div>`)
    .join("");
};

const sectionBlock = ({ eyebrow, title, body, background = "#ffffff", border = "#eee3f0", color = "#65566a" }) => {
  if (!plainText(body)) return "";

  return `<div style="margin-top:18px;background:${background};border:1px solid ${border};border-radius:18px;padding:20px;">
    <div style="font-size:11px;line-height:16px;text-transform:uppercase;letter-spacing:1.4px;color:${color};font-weight:800;">${escapeHtml(eyebrow)}</div>
    <div style="font-size:18px;line-height:24px;color:#36013F;font-weight:800;margin-top:6px;">${escapeHtml(title)}</div>
    <div style="font-size:14px;line-height:25px;color:${color};margin-top:10px;">${escapeHtml(body)}</div>
  </div>`;
};

const renderPrescriptionEmail = (prescription) => {
  const {
    diagnosis,
    coreAdvice,
    risks,
    optimizedApproach,
    confidence,
    optionalSections = {},
    nextStepCta,
  } = prescription;
  const visibleOptionalSections = Object.entries(optionalSections).filter(([, value]) =>
    plainText(value)
  );

  const riskItems = Array.isArray(risks)
    ? risks
        .filter((risk) => plainText(risk))
        .map((risk) => `<li style="font-size:14px;line-height:24px;color:#8a2d2d;margin-bottom:8px;">${escapeHtml(risk)}</li>`)
        .join("")
    : "";

  const optionalHtml = visibleOptionalSections
    .map(([key, value]) => `<div style="margin-top:14px;">
      <div style="font-size:10px;line-height:14px;text-transform:uppercase;letter-spacing:1.2px;color:#9a6b00;font-weight:800;">${escapeHtml(optionalLabels[key] || key)}</div>
      <div style="font-size:14px;line-height:24px;color:#4f3600;font-weight:600;margin-top:4px;">${escapeHtml(value)}</div>
    </div>`)
    .join("");

  return `<div style="padding:24px;">
    ${sectionBlock({
      eyebrow: "What I understand from your plan",
      title: "Trip Diagnosis",
      body: diagnosis,
      background: "#ffffff",
      border: "#eee3f0",
      color: "#66516c",
    })}

    ${sectionBlock({
      eyebrow: "Expert Recommendation",
      title: "Recommended Direction",
      body: coreAdvice,
      background: "#ffffff",
      border: "#e7f5ec",
      color: "#476654",
    })}

    ${riskItems ? `<div style="margin-top:18px;background:#fff8f8;border:1px solid #ffe0e0;border-radius:18px;padding:20px;">
      <div style="font-size:11px;line-height:16px;text-transform:uppercase;letter-spacing:1.4px;color:#c24141;font-weight:800;">What to Avoid</div>
      <div style="font-size:18px;line-height:24px;color:#36013F;font-weight:800;margin-top:6px;">Watch-outs</div>
      <ul style="padding-left:20px;margin:12px 0 0;">${riskItems}</ul>
    </div>` : ""}

    ${sectionBlock({
      eyebrow: "Better Way to Plan",
      title: "Optimized Approach",
      body: optimizedApproach,
      background: "#f4f6ff",
      border: "#dfe5ff",
      color: "#33407a",
    })}

    ${optionalHtml ? `<div style="margin-top:18px;background:#fffaf0;border:1px solid #f4d35e;border-radius:18px;padding:20px;">
      <div style="font-size:11px;line-height:16px;text-transform:uppercase;letter-spacing:1.4px;color:#9a6b00;font-weight:800;">Service-specific Direction</div>
      ${optionalHtml}
    </div>` : ""}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;border-top:1px solid #f1e9f3;padding-top:20px;">
      <tr>
        <td valign="middle">
          <div style="display:inline-block;background:#faf6fb;border:1px solid #eee3f0;border-radius:999px;padding:10px 16px;font-size:11px;line-height:16px;text-transform:uppercase;letter-spacing:1px;color:#7b6a80;font-weight:800;">
            Confidence: <span style="color:#36013F;">${escapeHtml(confidence || "Situational")}</span>
          </div>
        </td>
        <td class="stack" align="right" valign="middle">
          <div style="display:inline-block;background:#36013F;color:#ffffff;border-radius:999px;padding:12px 18px;font-size:13px;line-height:18px;font-weight:800;">
            ${escapeHtml(nextStepCta || "Want this turned into a full plan? Upgrade to Master Plan.")}
          </div>
        </td>
      </tr>
    </table>
  </div>`;
};

const renderReplyEmail = (reply) => {
  const prescription = parsePrescriptionReply(reply);
  if (prescription) {
    return renderPrescriptionEmail(prescription);
  }

  const understandingText = getUnderstandingText(reply);
  const replyItems = getReplyItems(reply);

  return `<div style="padding:24px;">
    <div>
      <div style="font-size:17px;line-height:24px;font-weight:700;color:#36013F;margin-bottom:12px;">Understanding</div>
      <div style="background:#faf6fb;border:1px solid #eee3f0;border-radius:16px;padding:20px;font-size:14px;line-height:26px;color:#64556a;">
        ${escapeHtml(understandingText)}
      </div>
    </div>

    <div style="margin-top:28px;">
      <div style="font-size:17px;line-height:24px;font-weight:700;color:#36013F;margin-bottom:4px;">Prescribed Strategy</div>
      ${replyItems}
    </div>
  </div>`;
};

const emailTemplate = ({ userName, expertName, caseTitle, serviceType, reply, year, type }) => {
  const isAdmin = type === "admin";
  const subjectLabel = serviceType || "Travel Request";
  const displayName = userName || "Traveller";
  const replyHtml = renderReplyEmail(reply);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @media only screen and (max-width: 640px) {
      .email-shell { width: 100% !important; border-radius: 0 !important; }
      .email-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .stack { display: block !important; width: 100% !important; text-align: left !important; padding-top: 12px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:32px 12px;background:#f7f4f8;font-family:Arial,Helvetica,sans-serif;color:#36013F;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table role="presentation" class="email-shell" width="720" cellpadding="0" cellspacing="0" style="max-width:720px;background:#ffffff;border:1px solid #ece3ee;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(54,1,63,0.06);">
          <tr>
            <td height="4" style="height:4px;background:#36013F;border-right:220px solid #F4D35E;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td class="email-pad" style="padding:28px 32px;border-bottom:1px solid #f1e9f3;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="54" valign="middle">
                          <div style="width:44px;height:44px;border-radius:12px;background:#36013F;color:#F4D35E;text-align:center;line-height:44px;font-size:18px;font-weight:700;">XM</div>
                        </td>
                        <td valign="middle">
                          <div style="font-size:22px;font-weight:800;line-height:24px;color:#36013F;">XMyTravel</div>
                          <div style="font-size:13px;line-height:20px;color:#7b6a80;">Expert Travel Advisory</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td class="stack" align="right" valign="middle">
                    <div style="display:inline-block;background:#faf6fb;border:1px solid #eee3f0;border-radius:12px;padding:10px 16px;text-align:right;">
                      <div style="font-size:11px;line-height:14px;text-transform:uppercase;letter-spacing:1.5px;color:#8d7b91;font-weight:700;">Status</div>
                      <div style="font-size:13px;line-height:20px;color:#36013F;font-weight:700;">${isAdmin ? "Admin Notification" : "Expert Reviewed"}</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="email-pad" style="padding:32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="top">
                    <div style="font-size:13px;line-height:20px;color:#85758a;">${isAdmin ? "Traveller" : "Prepared For"}</div>
                    <div style="font-size:24px;line-height:32px;font-weight:800;color:#36013F;">${escapeHtml(displayName)}</div>
                  </td>
                  <td class="stack" align="right" valign="top">
                    <div style="display:inline-block;min-width:180px;background:#faf6fb;border:1px solid #eee3f0;border-radius:12px;padding:12px 16px;text-align:left;">
                      <div style="font-size:12px;line-height:18px;color:#85758a;">Request Type</div>
                      <div style="font-size:14px;line-height:22px;font-weight:700;color:#36013F;">${escapeHtml(subjectLabel)}</div>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="margin-top:28px;background:#36013F;border-radius:20px;padding:24px;">
                <div style="font-size:11px;line-height:16px;text-transform:uppercase;letter-spacing:1.5px;color:#F4D35E;font-weight:700;">User Request</div>
                <div style="font-size:28px;line-height:36px;color:#ffffff;font-weight:800;margin-top:8px;">${escapeHtml(caseTitle || subjectLabel)}</div>
                <div style="font-size:14px;line-height:26px;color:#d8ccd9;margin-top:10px;">${isAdmin ? `Expert ${escapeHtml(expertName)} has replied to this traveller request.` : `Your request has been reviewed by ${escapeHtml(expertName)}.`}</div>
              </div>

              <div style="margin-top:32px;border:1px solid #ece3ee;border-radius:22px;overflow:hidden;">
                <div style="padding:22px 24px;background:#faf6fb;border-bottom:1px solid #ece3ee;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="52" valign="middle">
                        <div style="width:40px;height:40px;border-radius:12px;background:#36013F;color:#F4D35E;text-align:center;line-height:40px;font-size:16px;font-weight:700;">RP</div>
                      </td>
                      <td valign="middle">
                        <div style="font-size:20px;line-height:26px;font-weight:800;color:#36013F;">Expert Recommendation</div>
                        <div style="font-size:13px;line-height:20px;color:#7b6a80;">Personalized travel analysis and planning strategy</div>
                      </td>
                    </tr>
                  </table>
                </div>

                ${replyHtml}
                <div style="padding:0 24px 24px;">
                  <div style="margin-top:28px;">
                    <div style="font-size:17px;line-height:24px;font-weight:700;color:#36013F;margin-bottom:12px;">Important Notes</div>
                    <div style="background:#fff8f8;border:1px solid #ffe0e0;border-radius:14px;padding:16px;font-size:14px;line-height:26px;color:#7b5050;">
                      ${isAdmin ? "Please review this response in the admin dashboard if any follow-up is required." : "Keep this recommendation handy while sharing more trip details or moving to the next planning step."}
                    </div>
                  </div>

                  <div style="margin-top:28px;">
                    <div style="font-size:17px;line-height:24px;font-weight:700;color:#36013F;margin-bottom:12px;">Recommended Next Step</div>
                    <div style="background:#fffaf0;border:1px solid #f4d35e;border-radius:16px;padding:20px;font-size:14px;line-height:26px;color:#6b5a20;">
                      ${isAdmin ? `Traveller: ${escapeHtml(displayName)}<br/>Expert: ${escapeHtml(expertName)}` : "Share your preferred travel style, budget, dates, and must-see places to receive deeper itinerary support."}
                    </div>
                  </div>
                </div>
              </div>

              <div style="margin-top:32px;background:#36013F;border-radius:22px;padding:30px;text-align:center;">
                <div style="width:48px;height:48px;margin:0 auto;border-radius:12px;background:#F4D35E;color:#36013F;text-align:center;line-height:48px;font-size:18px;font-weight:800;">MP</div>
                <div style="font-size:28px;line-height:34px;color:#ffffff;font-weight:800;margin-top:18px;">Upgrade To Master Plan</div>
                <div style="font-size:14px;line-height:28px;color:#d8ccd9;max-width:500px;margin:14px auto 0;">
                  Unlock detailed itineraries, hotel recommendations, hidden gems, visa guidance, transport strategy, and complete travel planning assistance.
                </div>
                <a href="https://xmytravel.com" style="display:inline-block;background:#F4D35E;color:#36013F;text-decoration:none;padding:13px 22px;border-radius:12px;font-size:14px;font-weight:700;margin-top:22px;">Continue To Master Plan</a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#1f0123;padding:30px 32px;text-align:center;">
              <div style="font-size:22px;line-height:28px;color:#F4D35E;font-weight:800;">XMyTravel</div>
              <div style="font-size:13px;line-height:24px;color:#cdbed1;margin-top:10px;">Personalized Travel Planning For Smarter Journeys</div>
              <div style="font-size:12px;line-height:20px;color:#9f8ca3;margin-top:18px;">&copy; ${year} XMyTravel &bull; xmytravel.com &bull; info@xmytravel.com</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const userEmail = body.userEmail || body.user_email || "";
    const userPhone = body.userPhone || body.user_phone || "";
    const userName = body.userName || body.user_name || "Traveller";
    const expertName = body.expertName || body.expert_name || "XMyTravel Expert";
    const serviceType = body.serviceType || body.service_type || "";
    const caseTitle = body.question || body.requestTitle || serviceType || body.subject || "Travel request";
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

    // Extract CTA text from prescription JSON if available
    let nextStepCta = "";
    try {
      const parsed = typeof reply === "string" ? JSON.parse(reply) : reply;
      if (parsed?.nextStepCta) nextStepCta = parsed.nextStepCta;
    } catch { /* plain text reply, no CTA */ }

    const year = new Date().getFullYear();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Fire all sends in parallel — email + optional WhatsApp
    const sends = [
      // Admin notification email
      sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `Expert Reply Submitted by ${expertName}`,
        html: emailTemplate({ userName, expertName, caseTitle, serviceType, reply, year, type: "admin" }),
      }),
    ];

    // User email
    if (userEmail && emailRegex.test(userEmail)) {
      sends.push(
        sendEmail({
          to: userEmail,
          subject: `Reply from ${expertName} on XMyTravel`,
          html: emailTemplate({ userName, expertName, caseTitle, serviceType, reply, year, type: "user" }),
        })
      );
    }

    // WhatsApp via AiSensy (non-blocking — failure doesn't fail the whole response)
    let whatsappResult = { success: false, error: "No phone provided" };
    if (userPhone && process.env.AISENSY_API_KEY && process.env.AISENSY_CAMPAIGN_REPLY) {
      whatsappResult = await sendWhatsAppReply({
        phone: userPhone,
        userName,
        expertName,
        serviceType,
        nextStepCta,
      });
      if (!whatsappResult.success) {
        console.warn("WhatsApp send skipped/failed:", whatsappResult.error);
      }
    }

    await Promise.all(sends);

    return NextResponse.json(
      {
        success: true,
        userEmailSent: Boolean(userEmail && emailRegex.test(userEmail)),
        adminEmailSent: true,
        whatsappSent: whatsappResult.success,
        whatsappError: whatsappResult.success ? undefined : whatsappResult.error,
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
