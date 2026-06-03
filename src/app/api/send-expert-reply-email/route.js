import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { sendWhatsAppReply } from "@/lib/aisensy";
import { buildEmailFooter } from "@/app/utils/emailComponents";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

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

const emailTemplate = ({ userName, expertName, expertPhoto, expertUsername, caseTitle, serviceType, reply, year, type }) => {
  const isAdmin = type === "admin";
  const subjectLabel = serviceType || "Travel Request";
  const displayName = userName || "Traveller";
  const replyHtml = renderReplyEmail(reply);
  const footer = buildEmailFooter({ expertName: isAdmin ? "" : expertName, expertPhoto: isAdmin ? "" : expertPhoto, expertUsername: isAdmin ? "" : expertUsername, year });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    @media only screen and (max-width: 600px) {
      .xmt-shell  { width: 100% !important; border-radius: 0 !important; }
      .xmt-pad    { padding: 16px !important; }
      .xmt-hero-title { font-size: 20px !important; line-height: 28px !important; }
      .xmt-case-title { font-size: 16px !important; }
      .xmt-h1    { font-size: 18px !important; line-height: 26px !important; }
      .xmt-stack { display: block !important; width: 100% !important; text-align: left !important; padding: 12px 0 0 !important; }
      .xmt-rp-title { font-size: 16px !important; }
      .xmt-logo-img { width: 120px !important; height: auto !important; }
      body { padding: 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:20px 8px;background:#f7f4f8;font-family:Arial,Helvetica,sans-serif;color:#36013F;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table role="presentation" class="xmt-shell" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #ece3ee;border-radius:24px;overflow:hidden;">

          <!-- Top accent bar -->
          <tr>
            <td height="4" style="height:4px;background:#36013F;border-right:160px solid #F4D35E;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header: logo + expert photo -->
          <tr>
            <td class="xmt-pad" style="padding:20px 24px;border-bottom:1px solid #f1e9f3;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle">
                    <img src="https://www.xmytravel.com/logolttx.svg" alt="XMyTravel" class="xmt-logo-img" width="140" height="auto" style="display:block;max-width:140px;height:auto;" />
                    <div style="font-size:11px;color:#7b6a80;margin-top:4px;">Expert Travel Advisory</div>
                  </td>
                  <td class="xmt-stack" align="right" valign="middle">
                    ${isAdmin
                      ? `<div style="display:inline-block;background:#faf6fb;border:1px solid #eee3f0;border-radius:12px;padding:8px 14px;text-align:right;">
                           <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#8d7b91;font-weight:700;">Status</div>
                           <div style="font-size:13px;color:#36013F;font-weight:700;">Admin Notification</div>
                         </div>`
                      : expertPhoto
                        ? `<div style="text-align:center;">
                             <img src="${escapeUrl(expertPhoto)}" alt="${escapeHtml(expertName)}" width="52" height="52"
                               style="border-radius:50%;object-fit:cover;border:3px solid #F4D35E;display:block;margin:0 auto 5px;" />
                             <div style="font-size:11px;font-weight:800;color:#36013F;">${escapeHtml(expertName)}</div>
                             <div style="font-size:9px;color:#9a8ea0;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Your Expert</div>
                           </div>`
                        : `<div style="text-align:center;">
                             <div style="width:44px;height:44px;border-radius:50%;background:#36013F;color:#F4D35E;text-align:center;line-height:44px;font-size:18px;font-weight:800;margin:0 auto 5px;">${escapeHtml(expertName.charAt(0).toUpperCase())}</div>
                             <div style="font-size:11px;font-weight:800;color:#36013F;">${escapeHtml(expertName)}</div>
                             <div style="font-size:9px;color:#9a8ea0;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Your Expert</div>
                           </div>`
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="xmt-pad" style="padding:24px;">

              <!-- Prepared for + request type -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td valign="top">
                    <div style="font-size:12px;color:#85758a;">${isAdmin ? "Traveller" : "Prepared For"}</div>
                    <div class="xmt-h1" style="font-size:22px;line-height:30px;font-weight:800;color:#36013F;">${escapeHtml(displayName)}</div>
                  </td>
                  <td class="xmt-stack" align="right" valign="top">
                    <div style="display:inline-block;background:#faf6fb;border:1px solid #eee3f0;border-radius:12px;padding:10px 14px;text-align:left;">
                      <div style="font-size:11px;color:#85758a;">Request Type</div>
                      <div style="font-size:13px;font-weight:700;color:#36013F;">${escapeHtml(subjectLabel)}</div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Dark hero banner -->
              <div style="background:#36013F;border-radius:16px;padding:20px;">
                <div style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#F4D35E;font-weight:700;">User Request</div>
                <div class="xmt-hero-title" style="font-size:22px;line-height:30px;color:#ffffff;font-weight:800;margin-top:6px;word-break:break-word;">${escapeHtml(caseTitle || subjectLabel)}</div>
                <div style="font-size:13px;line-height:22px;color:#d8ccd9;margin-top:8px;">${isAdmin ? `Expert ${escapeHtml(expertName)} has replied to this traveller request.` : `Your request has been reviewed by ${escapeHtml(expertName)}.`}</div>
              </div>

              <!-- Prescription card -->
              <div style="margin-top:24px;border:1px solid #ece3ee;border-radius:18px;overflow:hidden;">
                <div style="padding:16px 20px;background:#faf6fb;border-bottom:1px solid #ece3ee;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="44" valign="middle">
                        <div style="width:36px;height:36px;border-radius:10px;background:#36013F;color:#F4D35E;text-align:center;line-height:36px;font-size:14px;font-weight:700;">RP</div>
                      </td>
                      <td valign="middle" style="padding-left:10px;">
                        <div class="xmt-rp-title" style="font-size:18px;font-weight:800;color:#36013F;">Expert Recommendation</div>
                        <div style="font-size:12px;color:#7b6a80;">Personalized travel analysis and planning strategy</div>
                      </td>
                    </tr>
                  </table>
                </div>
                ${replyHtml}
              </div>

              <!-- Footer -->
              <div style="margin-top:28px;">
                ${footer}
              </div>
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
    let expertPhoto = body.expertPhoto || body.expert_photo || "";
    let expertUsername = body.expertUsername || body.expert_username || "";
    const serviceType = body.serviceType || body.service_type || "";

    // Server-side fallback: fetch expert photo + username from Supabase if client didn't pass it
    if (!expertPhoto || !expertUsername) {
      try {
        const supabase = createSupabaseAdminClient();
        let query = supabase.from("profiles").select("photo_url, photo, username");
        if (expertUsername) {
          query = query.ilike("username", expertUsername);
        } else if (expertName && expertName !== "XMyTravel Expert") {
          query = query.ilike("full_name", expertName);
        }
        const { data } = await query.maybeSingle();
        if (data) {
          expertPhoto = expertPhoto || data.photo_url || data.photo || "";
          expertUsername = expertUsername || data.username || "";
        }
      } catch { /* non-critical — fall back to initial letter */ }
    }

    // Ensure the photo URL is absolute (Supabase sometimes stores relative paths)
    if (expertPhoto && !expertPhoto.startsWith("http")) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      expertPhoto = supabaseUrl
        ? `${supabaseUrl}/storage/v1/object/public/${expertPhoto}`
        : "";
    }
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
        html: emailTemplate({ userName, expertName, expertPhoto, expertUsername, caseTitle, serviceType, reply, year, type: "admin" }),
      }),
    ];

    // User email
    if (userEmail && emailRegex.test(userEmail)) {
      sends.push(
        sendEmail({
          to: userEmail,
          subject: `Reply from ${expertName} on XMyTravel`,
          html: emailTemplate({ userName, expertName, expertPhoto, expertUsername, caseTitle, serviceType, reply, year, type: "user" }),
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
