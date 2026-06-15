/**
 * AiSensy WhatsApp API helper
 *
 * Required env vars:
 *   AISENSY_API_KEY          — your AiSensy project API key
 *   AISENSY_CAMPAIGN_REPLY   — approved template campaign name for expert reply notification
 *
 * Template variables expected by AISENSY_CAMPAIGN_REPLY (in order):
 *   {{1}} - user name
 *   {{2}} - expert name
 *   {{3}} - service type  (e.g. "1:1 Strategic Consultation")
 *   {{4}} - next step CTA (e.g. "Book a Master Plan session...")
 *
 * Example approved template body:
 *   "Hi {{1}}, your expert {{2}} has replied to your {{3}} request on XmyTravel.
 *    Check your email for the full recommendation.
 *    Next step: {{4}}"
 */

const AISENSY_API_URL = "https://backend.aisensy.com/campaign/t1/api/v2";

/**
 * Normalize a phone number to E.164 without the + prefix (AiSensy wants digits only).
 * Assumes Indian number if no country code is detected.
 */
export const normalizePhone = (phone = "") => {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  // Already has country code (10+ digits, starts with country code)
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return "91" + digits.slice(1);
  if (digits.length === 10) return "91" + digits;
  // International: trust as-is if 11+ digits
  if (digits.length >= 11) return digits;
  return null;
};

/**
 * Send a WhatsApp message via AiSensy campaign template.
 *
 * @param {Object} opts
 * @param {string} opts.phone        - raw phone number (will be normalized)
 * @param {string} opts.userName     - traveller name  (template param 1)
 * @param {string} opts.expertName   - expert name     (template param 2)
 * @param {string} opts.serviceType  - service type    (template param 3)
 * @param {string} opts.nextStepCta  - CTA text        (template param 4)
 * @param {string} [opts.campaign]   - override campaign name
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendWhatsAppReply = async ({
  phone,
  userName,
  expertName,
  serviceType,
  nextStepCta,
  campaign,
}) => {
  const apiKey = process.env.AISENSY_API_KEY;
  const campaignName = campaign || process.env.AISENSY_CAMPAIGN_REPLY;

  if (!apiKey || !campaignName) {
    return { success: false, error: "AiSensy API key or campaign name not configured" };
  }

  const destination = normalizePhone(phone);
  if (!destination) {
    return { success: false, error: `Invalid phone number: ${phone}` };
  }

  const payload = {
    apiKey,
    campaignName,
    destination,
    userName: userName || "Traveller",
    templateParams: [
      userName || "Traveller",
      expertName || "XmyTravel Expert",
      serviceType || "Travel Request",
      nextStepCta || "Check your email for the full recommendation.",
    ],
    source: "expert-reply-api",
    media: {},
    buttons: [],
    carouselCards: [],
    location: {},
  };

  try {
    const res = await fetch(AISENSY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("AiSensy error:", res.status, data);
      return { success: false, error: data?.message || `AiSensy request failed (${res.status})` };
    }

    return { success: true, data };
  } catch (err) {
    console.error("AiSensy send error:", err.message);
    return { success: false, error: err.message };
  }
};

const sendAiSensyCampaign = async ({
  phone,
  campaign,
  userName,
  templateParams,
  source,
}) => {
  const apiKey = process.env.AISENSY_API_KEY;

  if (!apiKey || !campaign) {
    return { success: false, error: "AiSensy API key or campaign name not configured" };
  }

  const destination = normalizePhone(phone);
  if (!destination) {
    return { success: false, error: `Invalid phone number: ${phone}` };
  }

  const payload = {
    apiKey,
    campaignName: campaign,
    destination,
    userName: userName || "Traveller",
    templateParams,
    source,
    media: {},
    buttons: [],
    carouselCards: [],
    location: {},
  };

  try {
    const res = await fetch(AISENSY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("AiSensy error:", res.status, data);
      return { success: false, error: data?.message || `AiSensy request failed (${res.status})` };
    }

    return { success: true, data };
  } catch (err) {
    console.error("AiSensy send error:", err.message);
    return { success: false, error: err.message };
  }
};

export const sendWhatsAppServiceRequestToUser = async ({
  phone,
  userName,
  expertName,
  serviceType,
  question,
  campaign,
}) =>
  sendAiSensyCampaign({
    phone,
    campaign:
      campaign ||
      process.env.AISENSY_CAMPAIGN_REQUEST_USER ||
      process.env.AISENSY_CAMPAIGN_QUESTION_SUBMITTED,
    userName: userName || "Traveller",
    templateParams: [
      userName || "Traveller",
      expertName || "XmyTravel Expert",
      serviceType || "Travel Request",
      question || "Your service request has been submitted.",
    ],
    source: "service-request-user-api",
  });

export const sendWhatsAppServiceRequestToExpert = async ({
  phone,
  userName,
  expertName,
  serviceType,
  question,
  campaign,
}) =>
  sendAiSensyCampaign({
    phone,
    campaign:
      campaign ||
      process.env.AISENSY_CAMPAIGN_REQUEST_EXPERT ||
      process.env.AISENSY_CAMPAIGN_QUESTION_SUBMITTED,
    userName: expertName || "XmyTravel Expert",
    templateParams: [
      expertName || "XmyTravel Expert",
      userName || "Traveller",
      serviceType || "Travel Request",
      question || "A traveller has submitted a new service request.",
    ],
    source: "service-request-expert-api",
  });
