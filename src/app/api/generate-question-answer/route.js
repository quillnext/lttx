import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { question, userContext } = await request.json();

    if (!question) {
      return NextResponse.json({ error: "No question provided" }, { status: 400 });
    }

    const prompt = `
You are a travel expert replying directly to someone who asked you a specific question on a platform.

TRAVELLER'S QUESTION:
"${question}"

USER CONTEXT (if available):
${userContext || "None provided."}

TONE RULES (follow strictly):
- Write a conversational, warm, and professional answer.
- Keep it direct and helpful. Use 1 or 2 short paragraphs, around 80-150 words total.
- Do not use generic filler opening sentences (like "That's a great question!", "I'd be happy to help", "Certainly!"). Start directly with the answer/advice.
- Avoid listing country facts or generic safety tips. Focus on specific travel suggestions.
- Do not include any calls to action (CTA), booking links, or next step instructions in the response text.

Return ONLY a direct plain text answer. No JSON formatting, no markdown headers, just the message.
`.trim();

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const answer = response.text?.trim() || "";

    return NextResponse.json({ success: true, answer });
  } catch (error) {
    console.error("Question answer generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate answer draft." },
      { status: 500 }
    );
  }
}
