
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
    const { query, action = 'initial', sectionType } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!process.env.API_KEY) {
      console.error("API_KEY is missing in environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // --- ACTION: INITIAL SEARCH (Match Experts + Basic Summary) ---
    if (action === 'initial') {
      // 1. Fetch all public expert profiles
      const profilesRef = db.collection("Profiles");
      const snapshot = await profilesRef.where("isPublic", "==", true).get();

      const profiles = snapshot.docs.map((doc) => {
        const data = doc.data();
        const yearsExp = data.profileType === 'agency' 
          ? (parseInt(data.yearsActive) || 0) 
          : calculateYearsOfExperience(data.experience);

        return {
          id: doc.id,
          name: data.fullName || "Unknown",
          tagline: data.tagline || "",
          about: (data.about || "").substring(0, 300),
          location: data.location || "Global",
          expertise: (data.expertise || []).slice(0, 5),
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

      const prompt = `
        Act as an intelligent travel consultant matchmaker.
        User Query: "${query}"

        Goal: 
        1. Identify the best travel experts from the provided list.
        2. Assign a "Match Score" (0-100) and a short "Match Reason".
        3. Provide a very brief "Query Summary" (Budget, Season, Visa Hint).

        Available Profiles:
        ${JSON.stringify(profiles)}
      `;

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
                    score: { type: Type.INTEGER },
                    reason: { type: Type.STRING }
                  },
                  required: ["id", "score", "reason"]
                }
              },
              context: {
                type: Type.OBJECT,
                properties: {
                  querySummary: {
                    type: Type.OBJECT,
                    properties: {
                      budgetRange: { type: Type.STRING },
                      bestSeason: { type: Type.STRING },
                      visaStatus: { type: Type.STRING }
                    },
                    required: ["budgetRange", "bestSeason", "visaStatus"]
                  },
                  matchReason: { type: Type.STRING, description: "General summary of why experts were chosen." }
                },
                required: ["querySummary", "matchReason"]
              }
            },
            required: ["matches", "context"]
          }
        }
      });

      return NextResponse.json(JSON.parse(response.text));
    }

    // --- ACTION: SECTION GENERATION (On Demand) ---
    if (action === 'section') {
      let sectionPrompt = "";
      let schemaProperties = {};
      let requiredFields = [];

      switch (sectionType) {
        case 'related_questions':
          sectionPrompt = `Generate 3 related travel questions for: "${query}". just small and medium lenght of question not big pormpt and all.`;
          schemaProperties = {
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
            }
          };
          requiredFields = ["relatedQuestions"];
          break;

        case 'insights':
          sectionPrompt = `Provide 6 short, critical insights or "things to know before planning" for: "${query}". Keep them punchy. max character limit is 50 `;
          schemaProperties = {
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          };
          requiredFields = ["insights"];
          break;

        case 'visa':
          sectionPrompt = `Provide a specific "Visa Snapshot" for: "${query}". Give a title and 3-4 bullet points about requirements/complexity.max character limit is 100 `;
          schemaProperties = {
            visaSnapshot: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                points: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "points"]
            }
          };
          requiredFields = ["visaSnapshot"];
          break;

        case 'mistakes':
          sectionPrompt = `List 3 common travel mistakes people make regarding: "${query}". just bullet points not big answer. max character limit is 150 `;
          schemaProperties = {
            mistakes: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          };
          requiredFields = ["mistakes"];
          break;

        case 'peer_plans':
          sectionPrompt = `Generate 3 hypothetical "Peer Plans" (what other travelers are booking) relevant to: "${query}".just bullet points not big answer. max character limit is 150`;
          schemaProperties = {
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
          };
          requiredFields = ["peerPlans"];
          break;

        default:
          return NextResponse.json({ error: "Invalid section type" }, { status: 400 });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: sectionPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: schemaProperties,
            required: requiredFields
          }
        }
      });

      return NextResponse.json(JSON.parse(response.text));
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("AI Search Error:", error);
    return NextResponse.json({ 
      error: "Failed to perform AI search", 
      details: error.message 
    }, { status: 500 });
  }
}
