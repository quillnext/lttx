import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { profileData } = await request.json();

    if (!profileData) {
      return NextResponse.json({ error: "No profile data provided" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      You are a premium travel brand strategist. Based on the following expert profile data, generate highly polished, conversion-optimized sections for their Profile 2.0.
      
      Expert Data:
      Name: ${profileData.fullName}
      Tagline: ${profileData.tagline}
      About: ${profileData.about}
      Experience: ${JSON.stringify(profileData.experience || profileData.professionalJourney)}
      Expertise: ${profileData.expertise?.join(", ")}
      
      Tasks:
      1. Generate "bio": A short, punchy summary (30-50 words) that highlights their unique edge.
      2. Generate "about": A detailed, professional narrative (100-150 words) that tells their story and experience.
      3. Generate "whyConsult": 4 specific value propositions (one-liners).
      4. Generate "experienceDNA": 
         - "destinations": 4 specific regions they are experts in.
         - "themes": 4 specialized travel styles (e.g., Adventure-Luxe, Slow Travel).
      
      Return ONLY valid JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bio: { type: Type.STRING },
            about: { type: Type.STRING },
            whyConsult: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            experienceDNA: {
              type: Type.OBJECT,
              properties: {
                destinations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                themes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["destinations", "themes"]
            }
          },
          required: ["bio", "about", "whyConsult", "experienceDNA"]
        },
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const generatedData = JSON.parse(response.text);

    return NextResponse.json({ success: true, data: generatedData });
  } catch (error) {
    console.error("Profile generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate profile sections.", message: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
