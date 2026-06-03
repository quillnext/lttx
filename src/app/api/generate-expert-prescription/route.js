import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { question, sessionData } = await request.json();

    if (!question) {
      return NextResponse.json({ error: "No question data provided" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Extract rich context from formData (leads from ProfileServiceDrawer)
    const fd = question.formData || {};
    const destination = fd.destination || fd.dest || "";
    const startDate = fd.startDate || "";
    const endDate = fd.endDate || "";
    const dateRange = startDate && endDate ? `${startDate} to ${endDate}` : fd.dates || fd.trip_dates || question.trip_dates || "";
    const who = fd.who || "";
    const pax = fd.pax || "";
    const budget = fd.budget || "";
    const helpWith = Array.isArray(fd.helpWith) ? fd.helpWith.join(", ") : fd.helpWith || "";
    const tripType = Array.isArray(fd.type) ? fd.type.join(", ") : fd.type || "";
    const structure = Array.isArray(fd.structure) ? fd.structure.join(", ") : fd.structure || "";
    const booked = fd.booked || "";
    const mustHaves = fd.mustHaves || fd.exp || "";
    const bookingDetails = fd.bookingDetails || "";
    const mainQuestion = question.question || fd.confusion || fd.question || fd.context || "";
    const serviceType = question.serviceType || "Consultation";

    // Build a human-readable context block — only include non-empty fields
    const contextLines = [
      destination && `Destination: ${destination}`,
      dateRange && `Travel dates: ${dateRange}`,
      who && `Who: ${who}${pax ? ` (${pax} travellers)` : ""}`,
      budget && `Budget level: ${budget}`,
      helpWith && `Needs help with: ${helpWith}`,
      tripType && `Trip style: ${tripType}`,
      structure && `Wants structured: ${structure}`,
      booked && `Already booked: ${booked}`,
      bookingDetails && `Booking details: ${bookingDetails}`,
      mustHaves && `Must-haves / constraints: ${mustHaves}`,
    ].filter(Boolean).join("\n");

    const sessionContext = sessionData && Object.keys(sessionData).length > 0
      ? `\nSearch session context: ${JSON.stringify(sessionData)}`
      : "";

    const prompt = `
You are a senior travel expert writing a DRAFT reply for another expert to review before sending.

CRITICAL RULES:
- Be specific to THIS traveller's actual destination, dates, group, and budget — not generic
- Write like a real expert who read their situation carefully, not an AI generating templated text
- No filler phrases ("Great question!", "Absolutely!", "I hope this helps")
- No bullet-point lists of generic country facts — give opinions and judgment calls
- Short sentences. Direct language. Human warmth without being salesy
- If destination or dates are missing, acknowledge the gap rather than guessing broadly
- This draft will be edited by the expert before sending

SERVICE TYPE: ${serviceType}

WHAT THE TRAVELLER ASKED / IS CONFUSED ABOUT:
${mainQuestion}

THEIR DETAILS:
${contextLines || "No additional details provided."}
${sessionContext}

YOUR TASKS — return ONLY valid JSON with this exact schema:
{
  "diagnosis": "string (max 300 chars) — natural interpretation of their core problem or confusion, specific to their situation",
  "coreAdvice": "string — the main expert recommendation. Clear, direct, specific to their destination and situation. 80-150 words.",
  "risks": ["string (max 120 chars each, up to 3 items — concrete, specific watch-outs for their plan/destination/timing)"],
  "optimizedApproach": "string — a short, actionable restructuring of their plan. 30-60 words. Practical, not preachy.",
  "confidence": "High" | "Medium" | "Situational",
  "optionalSections": {
    "nextSteps": "string (for consultation/ask-a-question service types)",
    "dayWiseStructure": "string (for master plan)",
    "stayStrategy": "string (for master plan)",
    "routeLogic": "string (for master plan)",
    "reworkedVersion": "string (for itinerary review)",
    "bestOption": "string (for flight choice)",
    "whyThisWorks": "string (for flight choice)",
    "areaVerdict": "Good" | "Avoid" | "Conditional" (for hotel check)
  },
  "ctaOptions": ["string", "string", "string"]
}

For ctaOptions, generate exactly 3 smart, specific follow-up suggestions tailored to:
1. What service type this is
2. The actual destination and situation
3. What would logically come next for this specific traveller

Examples of GOOD ctaOptions (specific, action-oriented):
- "Book a Master Plan session to turn this Japan advice into a day-by-day structure"
- "Schedule a 30-minute call to lock in your final route before you book flights"
- "You're ready to book — confirm these hotels and the itinerary holds"

Examples of BAD ctaOptions (generic, avoid these):
- "Book a consultation"
- "Get more help"
- "You're all set"
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const generatedData = JSON.parse(response.text);

    return NextResponse.json({ success: true, data: generatedData });
  } catch (error) {
    console.error("Prescription generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate prescription draft." },
      { status: 500 }
    );
  }
}
