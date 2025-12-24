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
      You are a resume parser. Extract data from the provided resume document and map it to the specific JSON structure below.
      
      Target Audience: The user is applying to be a Travel Expert or Agency.
      
      Guidelines:
      1. Extract "fullName", "email".
      2. Extract "phone": The full international phone number including country code (e.g., +919876543210).
      3. Extract "tagline": A short professional headline (max 10 words).
      4. Extract "about": A professional summary (max 100 words).
      5. Extract "languages": An array of languages spoken.
      6. Extract "experience": An array of objects with "title", "company", "startDate" (YYYY-MM), and "endDate" (YYYY-MM or "Present").
      7. Extract "expertise": Map skills to an array of strings. Max 5 items.
      8. Extract "location": City and Country string.
      9. Generate a unique "username" based on their name (e.g., "johndoe_travel").
      10. Set "responseTime" to "in 20 mins".
      11. Set "pricing" to "₹799/session".
      12. Extract "certifications": An array of strings.
      13. For agencies, extract "registeredAddress", "website", "employeeCount", "licenseNumber".
      
      Return ONLY valid JSON matching this schema:
      {
        "fullName": "string",
        "email": "string",
        "phone": "string",
        "location": "string",
        "tagline": "string",
        "about": "string",
        "languages": ["string"],
        "expertise": ["string"],
        "username": "string",
        "responseTime": "string",
        "pricing": "string",
        "certifications": ["string"],
        "experience": [
          {
            "title": "string",
            "company": "string",
            "startDate": "YYYY-MM",
            "endDate": "YYYY-MM" 
          }
        ],
        "registeredAddress": "string",
        "website": "string",
        "employeeCount": "string",
        "licenseNumber": "string"
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