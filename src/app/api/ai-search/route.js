
import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error("Firebase Admin Init Error:", error);
  }
}

const db = getFirestore();

function calculateYearsOfExperience(experience) {
  if (!Array.isArray(experience) || experience.length === 0) return 0;
  const today = new Date();
  let earliestStart = new Date();
  let hasValidDate = false;

  experience.forEach((exp) => {
    if (exp.startDate) {
      const startDate = new Date(exp.startDate);
      if (!isNaN(startDate.getTime())) { // Check if date is valid
        if (startDate.getTime() < earliestStart.getTime()) {
          earliestStart = startDate;
          hasValidDate = true;
        }
      }
    }
  });

  if (!hasValidDate) return 0;
  const diffTime = Math.abs(today.getTime() - earliestStart.getTime());
  const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365)); 
  return diffYears;
}

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!process.env.API_KEY) {
      console.error("API_KEY is missing in environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // 1. Fetch all public expert profiles
    const profilesRef = db.collection("Profiles");
    const snapshot = await profilesRef.where("isPublic", "==", true).get();

    const profiles = snapshot.docs.map((doc) => {
      const data = doc.data();
      
      const yearsExp = data.profileType === 'agency' 
        ? (parseInt(data.yearsActive) || 0) 
        : calculateYearsOfExperience(data.experience);

      // Sanitize data to save tokens and avoid errors
      return {
        id: doc.id,
        name: data.fullName || "Unknown",
        tagline: data.tagline || "",
        about: (data.about || "").substring(0, 300), // Truncate long descriptions
        location: data.location || "Global",
        expertise: (data.expertise || []).slice(0, 5), // Limit array items
        services: (data.services || []).slice(0, 5),
        regions: (data.regions || []).slice(0, 5),
        profileType: data.profileType || "expert",
        pricing: data.pricing || "Not specified",
        yearsOfExperience: yearsExp,
      };
    });

    if (profiles.length === 0) {
      return NextResponse.json({ matches: [], context: null });
    }

    // 2. Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 3. Construct Prompt
    const prompt = `
      Act as an intelligent travel consultant matchmaker for Xmytravel.
      
      User Query: "${query}"

      Your Goal: 
      1. Identify the best travel experts from the list based on expertise, location, and services.
      2. For EACH matched expert, assign a "Match Score" (percentage 0-100) based on relevance to the query.
      3. Write a short, specific "Match Reason" for EACH expert explaining exactly why they fit this user's specific request.
      4. Generate specific "Consultation Context" to convince the user they need an expert. 
      
      IMPORTANT: For the context (insights, answers, visa), DO NOT give the full helpful answer. 
      Instead, give a "Teaser" answer that implies complexity and ends with a reason to ask an expert.
      
      Available Profiles:
      ${JSON.stringify(profiles)}
    `;

    // 4. Call Gemini with Schema
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: {
              type: Type.ARRAY,
              items: { 
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  score: { type: Type.INTEGER, description: "Relevance score from 0 to 100" },
                  reason: { type: Type.STRING, description: "Specific 1-sentence reason why this expert matches the query" }
                },
                required: ["id", "score", "reason"]
              },
              description: "List of matched experts sorted by score descending (max 10)"
            },
            context: {
              type: Type.OBJECT,
              properties: {
                querySummary: {
                  type: Type.OBJECT,
                  properties: {
                    budgetRange: { type: Type.STRING, description: "Short budget hint (e.g. '₹1.5L - ₹2.5L varies by route')" },
                    bestSeason: { type: Type.STRING, description: "Best time to visit" },
                    visaStatus: { type: Type.STRING, description: "Short visa hint (e.g. 'Schengen Required')" }
                  },
                  required: ["budgetRange", "bestSeason", "visaStatus"]
                },
                matchReason: { type: Type.STRING, description: "One sentence general summary of why experts were chosen." },
                relatedQuestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      teaserAnswer: { type: Type.STRING }
                    },
                    required: ["question", "teaserAnswer"]
                  }
                },
                insights: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "4 short bullet points about complexity."
                },
                visaSnapshot: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    points: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["title", "points"]
                },
                mistakes: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                peerPlans: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      desc: { type: Type.STRING }
                    },
                    required: ["title", "desc"]
                  }
                }
              },
              required: ["querySummary", "matchReason", "relatedQuestions", "insights", "visaSnapshot", "mistakes"]
            }
          },
          required: ["matches", "context"]
        }
      }
    });

    // 5. Parse and Return
    let jsonText = response.text;
    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    const result = JSON.parse(jsonText);
    return NextResponse.json({ 
      matches: result.matches || [],
      context: result.context
    });

  } catch (error) {
    console.error("AI Search Error:", error);
    return NextResponse.json({ 
      error: "Failed to perform AI search", 
      details: error.message 
    }, { status: 500 });
  }
}
