import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const SERVICE_CONFIG = {
  "ASK A QUESTION": {
    persona: "You are a travel expert replying directly to someone who asked you a specific question on a platform. Keep it conversational.",
    tone: "Write like you're replying to a message from someone you know. Short sentences. Direct. No bullet-point lists of country facts.",
    schema: `{
  "answer": "Your direct answer. 80-150 words. First-person, warm but to the point. Reference their specific destination and situation.",
  "keyPoint": "The single most important thing they need to know. One crisp sentence.",
  "watchOut": "One concrete risk or catch specific to their plan or destination. Max 35 words. Not generic safety advice.",
  "readyToBook": true or false
}`,
  },

  "1:1 STRATEGIC CONSULTATION": {
    persona: "You are a travel expert preparing your notes before a 30-minute consultation call with this traveller.",
    tone: "Write like an expert reviewing a client brief before a call — honest, strategic, prepared. Not salesy.",
    schema: `{
  "situationRead": "Your honest interpretation of their core situation. 2-3 sentences. No filler phrases.",
  "coreRecommendation": "Your main strategic recommendation. 100-150 words. Reference their destination, dates, and group type specifically.",
  "structureSuggestion": "How you'd structure the trip. 50-70 words. Be specific about cities, timing, pacing.",
  "bookNow": ["max 2 concrete things they should lock in before the call"],
  "holdOff": "What to wait on and why. Max 30 words.",
  "callAgenda": "The 2-3 specific things to cover in the consultation. Max 50 words."
}`,
  },

  "THE MASTER PLAN": {
    persona: "You are a travel expert writing a detailed trip planning recommendation for a client who has given you their brief.",
    tone: "Write like a planner who has read every detail they shared. Specific, structured, confident. Reference actual cities and places.",
    schema: `{
  "planVerdict": "Your honest overall verdict on their trip concept. 2-3 sentences. Be direct.",
  "dayStructure": "Day-by-day flow with specific places and the logic behind the split. 80-120 words. Reference actual cities.",
  "stayStrategy": "Where to base themselves and why. Reference specific areas or neighborhoods. 40-60 words.",
  "howToMove": "Transport logic between places. Practical — trains, flights, drives. 30-50 words.",
  "mustDos": ["3 specific, non-generic experiences for their exact destination and trip type"],
  "budgetNote": "Honest budget reality check. 30-40 words. Only include if budget data was provided, otherwise empty string.",
  "verdict": "Your one-line expert verdict on whether this plan is solid or needs a change."
}`,
  },

  "CUSTOM LUXE PACKAGE": {
    persona: "You are a luxury travel specialist who has just received a premium package request. You're responding with your initial concept.",
    tone: "Write like a specialist who has done this destination many times. Focus on experience and feel, not logistics.",
    schema: `{
  "packageConcept": "The package concept you'd build. 80-100 words. Describe the experience, pacing, and vibe — not the itinerary.",
  "stayIdeas": "2-3 property concepts by style and area, not brand names. 40-60 words.",
  "signatureExperiences": ["2-3 specific experiences that define this destination at this price point"],
  "whatINeedFromYou": "Specific information you still need to properly scope this package. Max 40 words.",
  "timeline": "Realistic timeline to put this package together. One sentence."
}`,
  },
};

export async function POST(request) {
  try {
    const { question, sessionData } = await request.json();

    if (!question) {
      return NextResponse.json({ error: "No question data provided" }, { status: 400 });
    }

    const serviceType = question.serviceType || question.service_type || "ASK A QUESTION";
    const config = SERVICE_CONFIG[serviceType] || SERVICE_CONFIG["ASK A QUESTION"];

    const fd = question.formData || {};

    // Build context block — only include non-empty fields
    const destination = fd.destination || fd.dest || question.destination || "";
    const startDate = fd.startDate || "";
    const endDate = fd.endDate || "";
    const dateRange = startDate && endDate
      ? `${startDate} to ${endDate}`
      : fd.dates || fd.trip_dates || question.trip_dates || "";
    const who = fd.who || "";
    const pax = fd.pax || "";
    const budget = fd.budget || "";
    const helpWith = Array.isArray(fd.helpWith) ? fd.helpWith.join(", ") : (fd.helpWith || "");
    const tripType = Array.isArray(fd.type) ? fd.type.join(", ") : (fd.type || "");
    const structure = Array.isArray(fd.structure) ? fd.structure.join(", ") : (fd.structure || "");
    const booked = fd.booked || "";
    const mainQuestion = question.question || fd.confusion || fd.question || fd.context || fd.exp || "";
    const mustHaves = fd.mustHaves || fd.exp || "";
    const hotelStyle = fd.hotelStyle || "";
    const flightPref = fd.flightPreference || "";
    const pacePref = fd.pacePreference || "";
    const specialOccasion = fd.specialOccasion || "";
    const specialNeeds = fd.specialNeeds || "";

    const contextLines = [
      destination       && `Destination: ${destination}`,
      dateRange         && `Travel dates: ${dateRange}`,
      who               && `Who: ${who}${pax ? ` (${pax} people)` : ""}`,
      budget            && `Budget: ${budget}`,
      helpWith          && `Needs help with: ${helpWith}`,
      tripType          && `Trip style: ${tripType}`,
      structure         && `Wants expert to structure: ${structure}`,
      booked            && `Already booked: ${booked}`,
      mustHaves         && `Must-haves / constraints: ${mustHaves}`,
      hotelStyle        && `Hotel preference: ${hotelStyle}`,
      flightPref        && `Flight preference: ${flightPref}`,
      pacePref          && `Pace preference: ${pacePref}`,
      specialOccasion   && `Special occasion: ${specialOccasion}`,
      specialNeeds      && `Dietary / accessibility needs: ${specialNeeds}`,
    ].filter(Boolean).join("\n");

    const sessionContext = sessionData && Object.keys(sessionData).length > 0
      ? `\nSearch context from their session: ${JSON.stringify(sessionData)}`
      : "";

    const prompt = `
${config.persona}

TONE RULES (follow strictly):
- ${config.tone}
- Never start a sentence with "I'd recommend", "I would suggest", "Great question", "Absolutely", "Certainly", "I hope this helps"
- No generic travel advice that could apply to any destination
- If you don't have enough data to be specific, say so — don't fake specificity
- No markdown. No headers. No bullet lists in string fields.

SERVICE TYPE: ${serviceType}

WHAT THE TRAVELLER ASKED / DESCRIBED:
${mainQuestion || "See context below."}

THEIR DETAILS:
${contextLines || "No additional details provided."}
${sessionContext}

Return ONLY valid JSON matching this exact schema:
${config.schema}

Rules for the JSON output:
- All string values: plain text only, no markdown
- Arrays: only include items that are genuinely specific to this traveller's situation
- If a field is not applicable (e.g. budgetNote with no budget), use empty string
- Do not add keys that are not in the schema
`.trim();

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const generatedData = JSON.parse(response.text);

    return NextResponse.json({ success: true, data: generatedData, serviceType });
  } catch (error) {
    console.error("Prescription generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate prescription draft." },
      { status: 500 }
    );
  }
}
