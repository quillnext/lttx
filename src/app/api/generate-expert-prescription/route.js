import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { question, sessionData } = await request.json();

    if (!question) {
      return NextResponse.json({ error: "No question data provided" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      You are a world-class travel expert. Based on the user's travel query and context, generate a structured "Prescription" draft.
      
      User Question: ${question.question}
      User Type: ${question.userType || 'Unknown'}
      Service Type: ${question.serviceType || 'Consultation'}
      
      Additional Context: ${JSON.stringify(sessionData || {})}

      Tasks:
      1. Diagnosis: A 300-character interpretation of the user's core problem or confusion. (Label: "What I understand from your plan")
      2. Core Advice: The main expert recommendation. Clear, authoritative, and actionable.
      3. Key Corrections: Up to 3 critical risks or things to avoid (max 120 chars each).
      4. Optimized Approach: A short actionable restructuring of their plan.
      5. Confidence Score: Choose from "High", "Medium", or "Situational".
      6. Optional Sections: Add service-specific direction when relevant:
         - Consultation: nextSteps
         - Master Plan: dayWiseStructure, stayStrategy, routeLogic
         - Itinerary Review: reworkedVersion
         - Flight Choice: bestOption, whyThisWorks
         - Hotel Check: areaVerdict ("Good", "Avoid", or "Conditional")

      Return ONLY valid JSON matching this schema:
      {
        "diagnosis": "string",
        "coreAdvice": "string",
        "risks": ["string"],
        "optimizedApproach": "string",
        "confidence": "High" | "Medium" | "Situational",
        "optionalSections": {
          "nextSteps": "string",
          "dayWiseStructure": "string",
          "stayStrategy": "string",
          "routeLogic": "string",
          "reworkedVersion": "string",
          "bestOption": "string",
          "whyThisWorks": "string",
          "areaVerdict": "Good" | "Avoid" | "Conditional"
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
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
