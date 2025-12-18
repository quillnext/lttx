
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

async function generateWithRetry(ai, params, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error) {
      const isOverloaded = error.status === 503 || error.status === 429 || error.message?.includes('overloaded');
      
      // If overloaded, log warning and retry
      if (isOverloaded && i < retries - 1) {
        const delay = 3000 * Math.pow(2, i); // 3s, 6s, 12s...
        console.warn(`AI Model ${params.model} overloaded. Retrying attempt ${i + 1} in ${delay}ms...`);
        await retryDelay(delay);
        continue;
      }
      
      // If overloaded and it's the last retry for the primary model, try fallback
      if (isOverloaded && i === retries - 1 && params.model === "gemini-2.5-flash") {
         console.warn(`AI Model overloaded after ${retries} attempts. Fallback to gemini-flash-lite-latest.`);
         try {
            return await ai.models.generateContent({ ...params, model: "gemini-flash-lite-latest" });
         } catch (fallbackError) {
            console.error("Fallback model also failed.");
            throw fallbackError; 
         }
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
      const simplifiedProfiles = fullProfiles.map(p => ({
        id: p.id,
        loc: p.location, 
        tags: p.expertise,
        svc: p.services,
        tag: p.tagline?.substring(0, 50) 
      }));

      const prompt = `
        Query: "${query}"
        Task: Match top experts & analyze intent.
        
        1. Context: Give succinct 'budgetRange' (e.g. "ruppee 50-100"), 'bestSeason' (e.g. "Oct-Mar"), 'visaStatus' (e.g. "On Arrival").
        2. Pointers: Pick relevant IDs from ['visa', 'weather', 'budget', 'transport', 'itinerary', 'related_questions', 'indian_perspective'].
           - If query mentions a location (City/Country), ALWAYS include 'indian_perspective'.
           - "Dubai Visa" -> ['visa', 'related_questions', 'indian_perspective']
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

      const disputeSchema = {
        type: Type.OBJECT,
        properties: {
            percentage: { type: Type.INTEGER },
            text: { type: Type.STRING }
        },
        required: ["percentage", "text"]
      };

      // Helper for specific dispute instructions based on section
      const getDisputeInst = (topic) => `
        Estimate 'dispute' object: 
        1. 'percentage' (int 20-95): How much online info is generic vs. reality for ${topic}.
        2. 'text' (string): A single, unified sentence. and it should be relavant with currect section as well."
        Agenda: Mention specific pain points (e.g. scams, delays, hidden costs) found in internet reviews. keep max 15 words.
        Context: ${topic}.
      `;

      switch (sectionType) {
        case 'indian_perspective':
          sectionPrompt = `Query: "${query}". Analyze how this location/topic is for Indian Travelers.
          1. 'pros': 3 items (e.g. "Vegetarian food available", "Desi community", "Easy visa").
          2. 'cons': 3 items (e.g. "High flight costs", "Cultural gap", "Strict laws").
          3. 'verdict': A single feedback summary from an Indian perspective (max 15 words).
          ${getDisputeInst('misconceptions about safety or food for Indians')}`;
          schemaProperties = {
            indianPerspective: {
              type: Type.OBJECT,
              properties: {
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                verdict: { type: Type.STRING }
              },
              required: ["pros", "cons", "verdict"]
            },
            dispute: disputeSchema
          };
          requiredFields = ["indianPerspective", "dispute"];
          break;

        case 'related_questions':
          sectionPrompt = `Query: "${query}". max 5 FAQs with extremely short teaser answers (max 12 words).`;
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

        case 'visa':
          sectionPrompt = `Query: "${query}". Visa Status (2 words) + 3 brief rules (max 6 words each). ${getDisputeInst('visa on arrival rejection rates or hidden documentation')}`;
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
          sectionPrompt = `Query: "${query}". 
          1. 'season': Explicitly state the "Best Time to Visit" (e.g., "Best: Nov-Feb"). 
          2. 'temperature': Range in Celsius.
          3. 'advice': 3 to 5 packing keywords. 
          ${getDisputeInst('unpredictable micro-climates or extreme seasonal severity')}`;
          
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
          sectionPrompt = `Query: "${query}". Currency, Daily Spend, 3 short cost tips (max 5 words). ${getDisputeInst('tourist pricing scams or hidden taxes')}`;
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
          sectionPrompt = `Query: "${query}". Best Route (short), Local Travel (short). ${getDisputeInst('unreliable timetables or taxi mafia issues')}`;
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
          sectionPrompt = `Query: "${query}".
          1. Analyze destination scale. If it's a City (e.g. Paris, Dubai), set 'duration' to 3-5 Days. If it's a Country/Region (e.g. Vietnam, Bali, Europe), set 'duration' to 7-14 Days.
          2. Focus: A short theme (e.g. "Adventure & Culture").
          3. DayByDay: Generate an array of strings covering the FULL calculated duration.
          ${getDisputeInst('rushed itineraries or unrealistic travel times')}`;
          
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
