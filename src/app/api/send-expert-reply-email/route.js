import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { sendWhatsAppReply } from "@/lib/aisensy";
import { buildEmailFooter } from "@/app/utils/emailComponents";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br/>");

// For URL attributes (src/href) — only escape quotes and angle brackets, keep & as-is
// so Firebase/Supabase storage URLs with query tokens are not broken
const escapeUrl = (url = "") =>
  String(url)
    .replace(/"/g, "%22")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E");

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
    optionalSections = {},
    nextStepCta,
  } = prescription;

  const visibleOptionalSections = Object.entries(optionalSections).filter(([, value]) => plainText(value));

  const riskItems = Array.isArray(risks)
    ? risks.filter((r) => plainText(r))
        .map((r) => `<li style="font-size:14px;line-height:24px;color:#8a2d2d;margin-bottom:8px;">${escapeHtml(r)}</li>`)
        .join("")
    : "";

  const optionalHtml = visibleOptionalSections
    .map(([key, value]) => `<div style="margin-top:14px;">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.2px;color:#9a6b00;font-weight:800;">${escapeHtml(optionalLabels[key] || key)}</div>
      <div style="font-size:14px;line-height:24px;color:#4f3600;font-weight:600;margin-top:4px;">${escapeHtml(value)}</div>
    </div>`).join("");

  return `<div style="padding:20px 16px;">
    ${sectionBlock({ eyebrow: "What the expert understood", title: "Situation Read", body: diagnosis, background: "#faf6fb", border: "#eee3f0", color: "#66516c" })}
    ${sectionBlock({ title: "Recommended Direction", body: coreAdvice, background: "#f3fbf6", border: "#c8e6d4", color: "#2d6048" })}
    ${riskItems ? `<div style="margin-top:16px;background:#fff8f8;border:1px solid #ffe0e0;border-radius:16px;padding:18px;">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.4px;color:#c24141;font-weight:800;">Watch-outs</div>
      <ul style="padding-left:18px;margin:10px 0 0;">${riskItems}</ul>
    </div>` : ""}
    ${optionalHtml ? `<div style="margin-top:16px;background:#fffaf0;border:1px solid #f4d35e;border-radius:16px;padding:18px;">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.4px;color:#9a6b00;font-weight:800;">Additional Direction</div>
      ${optionalHtml}
    </div>` : ""}
    ${nextStepCta ? `<div style="margin-top:20px;background:#36013F;color:#ffffff;border-radius:14px;padding:16px 18px;font-size:14px;line-height:22px;font-weight:800;text-align:center;word-break:break-word;">
      ${escapeHtml(nextStepCta)}
    </div>` : ""}
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

const emailTemplate = ({ userName, expertName, expertPhoto, caseTitle, serviceType, reply, year, type }) => {
  const isAdmin = type === "admin";
  const subjectLabel = serviceType || "Travel Request";
  const displayName = userName || "Traveller";
  const replyHtml = renderReplyEmail(reply);

  const expertAvatar = expertPhoto
    ? `<img src="${escapeUrl(expertPhoto)}" alt="${escapeHtml(expertName)}" width="44" height="44"
        style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid #F4D35E;display:inline-block;vertical-align:middle;margin-right:10px;" />`
    : `<div style="width:44px;height:44px;border-radius:50%;background:#36013F;color:#F4D35E;text-align:center;line-height:44px;font-size:18px;font-weight:800;display:inline-block;vertical-align:middle;margin-right:10px;">${escapeHtml((expertName || "E").charAt(0).toUpperCase())}</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin:0; padding:0; background:#f4f1f6; font-family:Arial,Helvetica,sans-serif; }
    @media only screen and (max-width:600px) {
      .shell { width:100% !important; border-radius:0 !important; }
      .pad { padding:16px !important; }
      .hero-title { font-size:20px !important; line-height:28px !important; }
      .case-title { font-size:16px !important; line-height:24px !important; }
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1f6;padding:24px 12px;">
    <tr><td align="center">

      <table role="presentation" class="shell" width="600" cellpadding="0" cellspacing="0"
        style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #ece3ee;">

        <!-- TOP BAR -->
        <tr>
          <td height="5" style="height:5px;background:linear-gradient(90deg,#36013F 70%,#F4D35E 100%);font-size:0;">&nbsp;</td>
        </tr>

        <!-- HEADER: logo + expert -->
        <tr>
          <td class="pad" style="padding:20px 24px;border-bottom:1px solid #f0eaf2;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td valign="middle">
                  <div style="font-size:20px;font-weight:800;color:#36013F;line-height:1;">XMyTravel</div>
                  <div style="font-size:11px;color:#9a8ea0;margin-top:3px;">Expert Travel Advisory</div>
                </td>
                <td align="right" valign="middle" style="padding-left:16px;">
                  ${isAdmin
                    ? `<span style="background:#faf6fb;border:1px solid #eee3f0;border-radius:8px;padding:6px 12px;font-size:11px;color:#7b6a80;font-weight:700;">Admin Notification</span>`
                    : `<div style="text-align:right;">
                        <div style="display:inline-block;vertical-align:middle;">${expertAvatar}</div>
                        <div style="display:inline-block;vertical-align:middle;text-align:left;">
                          <div style="font-size:12px;font-weight:800;color:#36013F;">${escapeHtml(expertName)}</div>
                          <div style="font-size:10px;color:#9a8ea0;text-transform:uppercase;letter-spacing:0.8px;">Your Expert</div>
                        </div>
                      </div>`
                  }
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td class="pad" style="padding:24px;">

            <!-- Prepared for + service type -->
            <div style="margin-bottom:20px;">
              <div style="font-size:12px;color:#9a8ea0;">${isAdmin ? "Traveller" : "Prepared for"}</div>
              <div style="font-size:22px;font-weight:800;color:#36013F;line-height:1.2;margin-top:2px;">${escapeHtml(displayName)}</div>
              <div style="display:inline-block;margin-top:8px;background:#faf6fb;border:1px solid #eee3f0;border-radius:8px;padding:5px 12px;font-size:12px;font-weight:700;color:#7b6a80;">${escapeHtml(subjectLabel)}</div>
            </div>

            <!-- Case hero -->
            <div style="background:#36013F;border-radius:16px;padding:20px;margin-bottom:24px;">
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#F4D35E;font-weight:700;margin-bottom:6px;">User Request</div>
              <div class="case-title" style="font-size:20px;line-height:28px;color:#ffffff;font-weight:800;word-break:break-word;">${escapeHtml(caseTitle || subjectLabel)}</div>
              <div style="font-size:13px;line-height:22px;color:#d8ccd9;margin-top:8px;">
                ${isAdmin ? `Expert ${escapeHtml(expertName)} has replied to this request.` : `Your request has been reviewed by ${escapeHtml(expertName)}.`}
              </div>
            </div>

            <!-- Prescription card -->
            <div style="border:1px solid #ece3ee;border-radius:18px;overflow:hidden;">
              <div style="padding:16px 20px;background:#faf6fb;border-bottom:1px solid #ece3ee;">
                <div style="font-size:16px;font-weight:800;color:#36013F;">Expert Recommendation</div>
                <div style="font-size:12px;color:#9a8ea0;margin-top:2px;">Personalised travel analysis and planning strategy</div>
              </div>
              ${replyHtml}
            </div>

            <!-- Footer (no expert card) -->
            <div style="margin-top:28px;">
              ${buildEmailFooter({ year })}
            </div>

          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const userEmail = body.userEmail || body.user_email || "";
    const userPhone = body.userPhone || body.user_phone || "";
    const userName = body.userName || body.user_name || "Traveller";
    const expertName = body.expertName || body.expert_name || "XMyTravel Expert";
    const expertPhoto = body.expertPhoto || body.expert_photo || "";
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
        html: emailTemplate({ userName, expertName, expertPhoto, caseTitle, serviceType, reply, year, type: "admin" }),
      }),
    ];

    // User email
    if (userEmail && emailRegex.test(userEmail)) {
      sends.push(
        sendEmail({
          to: userEmail,
          subject: `Reply from ${expertName} on XMyTravel`,
          html: emailTemplate({ userName, expertName, expertPhoto, caseTitle, serviceType, reply, year, type: "user" }),
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
