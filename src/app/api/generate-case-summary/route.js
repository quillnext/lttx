import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { caseData } = await request.json();

    if (!caseData) {
      return NextResponse.json({ error: "No case data provided" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      You are a premium luxury travel strategist. Based on the following traveler's case details, write a highly professional, punchy, single-sentence summary of the case (max 20-30 words) for the expert.
      
      Traveler Name: ${caseData.userName || "Unknown"}
      Service Type: ${caseData.serviceType || "Custom travel request"}
      Destination: ${caseData.destination || "Not specified"}
      Dates: ${caseData.dates || "Not specified"}
      Traveler Type: ${caseData.who || "Not specified"}
      Budget/Style: ${caseData.budget || "Not specified"}
      Preferences/Vibe: ${caseData.type || "Not specified"}
      Core Help Needed: ${caseData.problem || "Not specified"}
      
      Requirements for the summary:
      - Highly professional, analytical, and elegant tone.
      - Start with a clear definition of the request, highlighting destination, style, and core problem.
      - Keep it under 250 characters.
      - Do NOT wrap in quotes. Do NOT include introductory text.
      
      Example: A 7-day family strategic itinerary consultation for Japan focusing on cultural exploration, slow-paced luxury, and culinary highlights.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const summary = response.text.trim().replace(/^"|"$/g, "");

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("Case summary generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate case summary." },
      { status: 500 }
    );
  }
}
