const AISENSY_API_URL =
  process.env.AISENSY_API_URL || "https://backend.aisensy.com/campaign/t1/api/v2";

const compactParams = (params = []) =>
  params.map((value) => String(value ?? "").trim()).filter(Boolean);

export const normalizePhone = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  if (digits.length === 10) return `91${digits}`;
  if (digits.length >= 11) return digits;
  return null;
};

export const sendAiSensyCampaign = async ({
  phone,
  campaignName,
  userName = "Traveller",
  templateParams = [],
  source = "xmytravel-app",
  media = {},
  buttons = [],
}) => {
  const apiKey = process.env.AISENSY_API_KEY;

  if (!apiKey || !campaignName) {
    return {
      success: false,
      skipped: true,
      error: "AiSensy API key or campaign name not configured",
    };
  }

  const destination = normalizePhone(phone);
  if (!destination) {
    return { success: false, skipped: true, error: `Invalid phone number: ${phone || "empty"}` };
  }

  try {
    const response = await fetch(AISENSY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey,
        campaignName,
        destination,
        userName,
        templateParams: compactParams(templateParams),
        source,
        media,
        buttons,
        carouselCards: [],
        location: {},
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("AiSensy request failed:", data?.message || response.statusText);
      return { success: false, error: data?.message || "AiSensy request failed", data };
    }

    return { success: true, data };
  } catch (error) {
    console.error("AiSensy send error:", error.message);
    return { success: false, error: error.message };
  }
};

export const sendWhatsAppReply = ({
  phone,
  userName,
  expertName,
  serviceType,
  nextStepCta,
  campaign,
}) =>
  sendAiSensyCampaign({
    phone,
    campaignName: campaign || process.env.AISENSY_CAMPAIGN_REPLY,
    userName: userName || "Traveller",
    templateParams: [
      userName || "Traveller",
      expertName || "XMyTravel Expert",
      serviceType || "Travel Request",
      nextStepCta || "Check your email for the full recommendation.",
    ],
    source: "expert-reply-api",
  });

export const sendWhatsAppQuestionSubmitted = ({
  phone,
  userName,
  expertName,
  question,
  campaign,
}) =>
  sendAiSensyCampaign({
    phone,
    campaignName: campaign || process.env.AISENSY_CAMPAIGN_QUESTION_SUBMITTED,
    userName: userName || "Traveller",
    templateParams: [
      userName || "Traveller",
      expertName || "XMyTravel Expert",
      String(question || "your travel question").slice(0, 120),
    ],
    source: "question-submission-api",
  });

export const sendWhatsAppProfileSubmitted = ({
  phone,
  fullName,
  profileType,
  campaign,
}) =>
  sendAiSensyCampaign({
    phone,
    campaignName: campaign || process.env.AISENSY_CAMPAIGN_PROFILE_SUBMITTED,
    userName: fullName || "Partner",
    templateParams: [
      fullName || "Partner",
      profileType === "agency" ? "agency" : "expert",
      "Our team will review your application and notify you after approval.",
    ],
    source: "profile-submission-api",
  });

export const sendWhatsAppProfileApproved = ({
  phone,
  fullName,
  profileType,
  profileUrl,
  campaign,
}) =>
  sendAiSensyCampaign({
    phone,
    campaignName: campaign || process.env.AISENSY_CAMPAIGN_PROFILE_APPROVED,
    userName: fullName || "Partner",
    templateParams: [
      fullName || "Partner",
      profileType === "agency" ? "agency" : "expert",
      profileUrl || "https://www.xmytravel.com",
    ],
    source: "profile-approval-api",
  });
