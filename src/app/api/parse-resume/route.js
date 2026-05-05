import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to base64 for Gemini
    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString("base64");
    const mimeType = file.type;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      You are a resume parser for high-end travel experts. Extract data from the provided resume document and map it to the specific JSON structure below.
      
      Target Audience: The user is applying to be a Travel Expert or Agency.
      
      Guidelines:
      1. Extract "fullName", "email".
      2. Extract "phone": The full international phone number including country code (e.g., +919876543210).
      3. Extract "tagline": A short professional headline (max 10 words).
      4. "bio": A short, punchy, persona-driven summary (30-50 words).
      5. "about": A longer professional description focusing on methodology and philosophy (max 100 words).
      6. "quote": A personal philosophy related to travel (e.g. "Travel should be an effortless extension of your existence.").
      7. "whyConsult": An array of 4 distinct value propositions (e.g. "Access to private estates in Italy").
      8. "professionalJourney": An array of objects with "title", "company", "period" (e.g. "2019 - Present"), and "desc" (brief outcome).
      9. "experienceDNA": An object with "destinations" (list of 4 scouted regions) and "themes" (list of 4 specialized styles).
      10. "languages": An array of languages spoken.
      11. "expertise": Map skills to an array of strings. Max 5 items.
      12. "location": City and Country string.
      13. Generate a unique "username" based on their name (e.g., "johndoe_xmytravel").
      14. Set "responseTime" to "Respond in 20 mins".
      15. Set "pricing" to "₹799/session".
      
      Return ONLY valid JSON matching this schema:
      {
        "fullName": "string",
        "email": "string",
        "phone": "string",
        "location": "string",
        "tagline": "string",
        "bio": "string",
        "about": "string",
        "quote": "string",
        "whyConsult": ["string"],
        "professionalJourney": [
          { "title": "string", "company": "string", "period": "string", "desc": "string" }
        ],
        "experienceDNA": {
           "destinations": ["string"],
           "themes": ["string"]
        },
        "languages": ["string"],
        "expertise": ["string"],
        "username": "string",
        "responseTime": "string",
        "pricing": "string"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: mimeType, data: base64Data } },
            { text: prompt },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const parsedData = JSON.parse(response.text);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { error: "Failed to process resume. Please try filling the form manually." },
      { status: 500 }
    );
  }
}