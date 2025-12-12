
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
      if (!isNaN(startDate.getTime())) { 
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

// Helper to handle AI retries with exponential backoff
const retryDelay = (ms) => new Promise(res => setTimeout(res, ms));

async function generateWithRetry(ai, params, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error) {
      // Retry on 503 Service Unavailable or 429 Too Many Requests
      if ((error.status === 503 || error.status === 429 || error.message?.includes('overloaded')) && i < retries - 1) {
        console.warn(`AI Model overloaded. Retrying attempt ${i + 1}...`);
        await retryDelay(2000 * (i + 1)); // 2s, 4s wait
        continue;
      }
      throw error;
    }
  }
}

export async function POST(request) {
  try {
    const { query, action = 'initial', sectionType } = await request.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    if (!process.env.API_KEY) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // --- ACTION: INITIAL SEARCH ---
    if (action === 'initial') {
      const profilesRef = db.collection("Profiles");
      const snapshot = await profilesRef.where("isPublic", "==", true).get();

      // 1. Fetch Full Data for Client Response
      const fullProfiles = snapshot.docs.map((doc) => {
        const data = doc.data();
        const yearsExp = data.profileType === 'agency' 
          ? (parseInt(data.yearsActive) || 0) 
          : calculateYearsOfExperience(data.experience);

        return {
          id: doc.id,
          fullName: data.fullName || "Unknown",
          tagline: data.tagline || "",
          location: data.location || "Global",
          expertise: (data.expertise || []).slice(0, 5),
          services: (data.services || []).slice(0, 5),
          regions: (data.regions || []).slice(0, 5),
          profileType: data.profileType || "expert",
          pricing: data.pricing || "Not specified",
          yearsOfExperience: yearsExp,
          photo: data.photo,
          username: data.username
        };
      });

      if (fullProfiles.length === 0) {
        return NextResponse.json({ matches: [], context: null });
      }

      // 2. TOKEN OPTIMIZATION: Send minimal data to AI to prevent Rate Limits/Overload
      // Only sending fields relevant for matching. Removing bio, contacts, images.
      const simplifiedProfiles = fullProfiles.map(p => ({
        id: p.id,
        loc: p.location, // Abbreviated keys to save tokens
        tags: p.expertise,
        svc: p.services,
        tag: p.tagline?.substring(0, 50) // Truncate tagline
      }));

      const prompt = `
        Query: "${query}"
        Task: Match top 6 experts & analyze intent.
        
        1. Context: Give succinct 'budgetRange' (e.g. "$50-100"), 'bestSeason' (e.g. "Oct-Mar"), 'visaStatus' (e.g. "On Arrival").
        2. Pointers: Pick relevant IDs from ['visa', 'weather', 'budget', 'transport', 'itinerary', 'related_questions'].
           - "Dubai Visa" -> ['visa', 'related_questions']
           - "Bali Trip" -> All.
        3. Matches: Return 'id', 'score' (0-100), 'reason' (max 8 words).

        Experts: ${JSON.stringify(simplifiedProfiles)}
      `;

      const response = await generateWithRetry(ai, {
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
                  relevantPointers: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  matchReason: { type: Type.STRING }
                },
                required: ["querySummary", "matchReason", "relevantPointers"]
              }
            },
            required: ["matches", "context"]
          }
        }
      });

      return NextResponse.json(JSON.parse(response.text));
    }

    // --- ACTION: SECTION GENERATION ---
    if (action === 'section') {
      let sectionPrompt = "";
      let schemaProperties = {};
      let requiredFields = [];

      // Constraint: Dispute text MUST NOT contain the percentage number.
      // Instruction: "Keep it short" to save tokens.
      const disputeInst = "Estimate 'dispute' object: 'percentage' (int) of misleading generic/AI info vs reality, and 'text' (string). IMPORTANT: 'text' MUST describe the discrepancy WITHOUT stating the number/percentage again. Keep text under 10 words.";

      const disputeSchema = {
        type: Type.OBJECT,
        properties: {
            percentage: { type: Type.INTEGER },
            text: { type: Type.STRING }
        },
        required: ["percentage", "text"]
      };

      switch (sectionType) {
        case 'related_questions':
          sectionPrompt = `Query: "${query}". 3 FAQs with extremely short teaser answers (max 12 words). ${disputeInst}`;
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
            },
            dispute: disputeSchema
          };
          requiredFields = ["relatedQuestions", "dispute"];
          break;

        case 'visa':
          sectionPrompt = `Query: "${query}". Visa Status (2 words) + 3 brief rules (max 6 words each). ${disputeInst}`;
          schemaProperties = {
            visaSnapshot: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                points: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "points"]
            },
            dispute: disputeSchema
          };
          requiredFields = ["visaSnapshot", "dispute"];
          break;

        case 'weather':
          sectionPrompt = `Query: "${query}". Season, Temp, 3 packing keywords. ${disputeInst}`;
          schemaProperties = {
            weatherInfo: {
                type: Type.OBJECT,
                properties: {
                    season: { type: Type.STRING },
                    temperature: { type: Type.STRING },
                    advice: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["season", "temperature", "advice"]
            },
            dispute: disputeSchema
          };
          requiredFields = ["weatherInfo", "dispute"];
          break;

        case 'budget':
          sectionPrompt = `Query: "${query}". Currency, Daily Spend, 3 short cost tips (max 5 words). ${disputeInst}`;
          schemaProperties = {
            budgetInfo: {
                type: Type.OBJECT,
                properties: {
                    currency: { type: Type.STRING },
                    dailyEstimate: { type: Type.STRING },
                    tips: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["currency", "dailyEstimate", "tips"]
            },
            dispute: disputeSchema
          };
          requiredFields = ["budgetInfo", "dispute"];
          break;

        case 'transport':
          sectionPrompt = `Query: "${query}". Best Route (short), Local Travel (short). ${disputeInst}`;
          schemaProperties = {
            transportInfo: {
                type: Type.OBJECT,
                properties: {
                    bestRoute: { type: Type.STRING },
                    localTravel: { type: Type.STRING }
                },
                required: ["bestRoute", "localTravel"]
            },
            dispute: disputeSchema
          };
          requiredFields = ["transportInfo", "dispute"];
          break;

        case 'itinerary':
          sectionPrompt = `Query: "${query}". Duration, Focus, 3 day highlights (very brief). ${disputeInst}`;
          schemaProperties = {
            itinerarySuggestion: {
                type: Type.OBJECT,
                properties: {
                    duration: { type: Type.STRING },
                    focus: { type: Type.STRING },
                    dayByDay: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["duration", "focus", "dayByDay"]
            },
            dispute: disputeSchema
          };
          requiredFields = ["itinerarySuggestion", "dispute"];
          break;

        default:
          return NextResponse.json({ error: "Invalid section" }, { status: 400 });
      }

      const response = await generateWithRetry(ai, {
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
    const isOverloaded = error.status === 503 || error.message?.includes('overloaded');
    return NextResponse.json({ 
      error: isOverloaded ? "Service Busy" : "Search Failed", 
      details: isOverloaded ? "Server busy, please retry." : error.message 
    }, { status: isOverloaded ? 503 : 500 });
  }
}
