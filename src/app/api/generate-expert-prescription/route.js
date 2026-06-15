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

  "Itinerary Review": {
    persona: "You are a travel expert reviewing a traveller's itinerary before they lock it in.",
    tone: "Be direct. Spot what's wrong immediately and say it clearly. Don't hedge or soften bad news about a bad plan.",
    schema: `{
  "verdict": "Your honest verdict on the overall itinerary. 2-3 sentences. Is it good, rushed, illogical?",
  "issues": ["up to 3 specific problems — be concrete, reference actual days or cities if possible"],
  "fixes": "How to improve it. 50-80 words. Reference specific days or cities.",
  "reworkedVersion": "A brief restructured version if the itinerary needs changing. 50-80 words. If it's fine, write empty string.",
  "verdict1Line": "One-line final verdict — proceed as-is, minor tweaks, or needs a rework."
}`,
  },

  "Hotel/Area Check": {
    persona: "You are a travel expert checking whether a hotel area suits this specific traveller.",
    tone: "Give a clear verdict. Don't hedge. Say Good, Avoid, or Conditional and explain why for their trip type.",
    schema: `{
  "areaVerdict": "Good" or "Avoid" or "Conditional",
  "reasoning": "Why this area works or doesn't for their specific trip type and priorities. 50-80 words.",
  "bestFor": "Who this area is actually best for, if it's not right for them. 20-30 words.",
  "alternative": "A better area or neighbourhood to consider if applicable. 20-30 words.",
  "finalNote": "One practical tip about this area — transport, noise, access, hidden issue. Max 25 words."
}`,
  },

  "Flight Choice": {
    persona: "You are a travel expert helping someone decide between flight options.",
    tone: "Give a direct recommendation. Don't list pros and cons forever — tell them which one to book and why.",
    schema: `{
  "recommendation": "Which option to pick and why. 50-80 words. Be specific about the airline, timing, or routing logic.",
  "reasoning": "The key deciding factor — what made this the right call over the others. 30-40 words.",
  "watchOut": "One thing to check before confirming — baggage policy, transit visa, layover time, etc. Max 30 words.",
  "verdict": "One sentence. Book it now, wait for a better deal, or avoid?"
}`,
  },

  "Packing Checklist": {
    persona: "You are a travel expert building a practical packing checklist for this specific trip.",
    tone: "Be specific to their destination, season, and trip type. No generic lists that apply to any destination.",
    schema: `{
  "essentials": ["5-7 destination-specific must-haves they should not forget"],
  "clothing": ["4-5 specific clothing recommendations based on their weather and trip type"],
  "documents": ["3-4 documents or cards specific to their destination — visa, insurance, local currency, etc."],
  "proTip": "One non-obvious, destination-specific packing tip. Max 40 words.",
  "packingVerdict": "One sentence summary of what kind of packing this trip actually needs — light, moderate, heavy."
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
    const mainQuestion = question.question || fd.confusion || fd.question || fd.context || fd.exp || fd.itinerary?.substring(0, 500) || fd.flightOptions || "";
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
      fd.hotelArea      && `Hotel / area being checked: ${fd.hotelArea}`,
      fd.route          && `Flight route: ${fd.route}`,
      fd.flightOptions  && `Flight options: ${fd.flightOptions?.substring(0, 300)}`,
      fd.mattersMost    && `Priorities: ${Array.isArray(fd.mattersMost) ? fd.mattersMost.join(", ") : fd.mattersMost}`,
      fd.focus          && `Review focus: ${Array.isArray(fd.focus) ? fd.focus.join(", ") : fd.focus}`,
      fd.travelMonth    && `Travel month: ${fd.travelMonth}`,
      fd.duration       && `Trip duration: ${fd.duration}`,
      fd.tripType       && `Trip type: ${fd.tripType}`,
      fd.preferences    && `Preferences: ${fd.preferences}`,
    ].filter(Boolean).join("\n");

    const sessionContext = sessionData && Object.keys(sessionData).length > 0
      ? `\nSearch context from their session: ${JSON.stringify(sessionData)}`
      : "";

    const prompt = `
${config.persona}

TONE RULES (follow strictly):
- ${config.tone}
- Give all answers like an expert in that specific area for accurate answers.
- Never start a sentence with "I'd recommend", "I would suggest", "I recommend", "I suggest", "My recommendation is", "Great question", "Absolutely", "Certainly", "I hope this helps", "As an expert"
- Do not repeat the words "recommend", "recommendation", "suggest", or "suggestion" multiple times. Use direct, authoritative action verbs instead (e.g., "Choose", "Book", "Stay", "Avoid").
- Do not include any calls to action (CTA), booking links, next step instructions, or invitations to book/consult in the response text. Focus purely on strategic travel advice.
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
