
import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { mapSupabaseProfile } from "@/lib/supabaseProfile";
import { adminDb } from "@/lib/firebaseAdmin";
import crypto from "crypto";

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

// Optimized helper for serverless timeouts
async function generateWithRetry(ai, params, retries = 1) {
  for (let i = 0; i <= retries; i++) {
    try {
      // Use gemini-3-flash-preview for maximum speed to avoid Vercel 10s limit
      const response = await ai.models.generateContent({
        ...params,
        model: "gemini-3-flash-preview",
        config: {
          ...params.config,
          thinkingConfig: { thinkingBudget: 0 } // Disable thinking to reduce latency
        }
      });
      return response;
    } catch (error) {
      const isRetryable = error.status === 503 || error.status === 429 || error.message?.includes('overloaded');
      if (isRetryable && i < retries) {
        console.warn(`AI Busy. Retrying immediately... Attempt ${i + 1}`);
        continue;
      }
      throw error;
    }
  }
}

export async function POST(request) {
  try {
    const { query, action = 'initial', sectionType, searchId } = await request.json();

    if (!process.env.API_KEY) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const supabase = createSupabaseAdminClient();

    // --- ACTION: INITIAL SEARCH ---
    if (action === 'initial') {
      const { data: profileRows, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_public", true);

      if (profilesError) throw profilesError;

      // Normalize query
      const normalizedQuery = query.trim().toLowerCase();

      // Check cache first — skip gracefully if table doesn't exist yet
      let existingSearches = null;
      try {
        const { data, error: existingSearchError } = await supabase
          .from("recent_searches")
          .select("*")
          .eq("query", normalizedQuery)
          .order("timestamp", { ascending: false })
          .limit(1);

        if (existingSearchError && !existingSearchError.message?.includes("schema cache") && existingSearchError.code !== "42P01") {
          throw existingSearchError;
        }
        existingSearches = data;
      } catch (cacheErr) {
        if (!cacheErr.message?.includes("schema cache") && cacheErr.code !== "42P01") throw cacheErr;
        // Table missing — skip cache entirely, continue to AI search
      }

      if (existingSearches?.length) {
        const data = existingSearches[0];

        // Optional TTL (24 hours)
        const isExpired =
          new Date() - new Date(data.timestamp) > 24 * 60 * 60 * 1000;

        if (!isExpired) {
          return NextResponse.json({
            matches: data.matches || [],
            context: data.context || null,
            searchId: data.id,
            cached: true
          });
        }
      }

      // 1. Fetch Full Data for Client Response
      const fullProfiles = (profileRows || []).map((row) => {
        const data = mapSupabaseProfile(row);
        const yearsExp = data.profileType === 'agency'
          ? (parseInt(data.yearsActive) || 0)
          : calculateYearsOfExperience(data.experience);

        return {
          id: data.id,
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

      // 2. TOKEN OPTIMIZATION: Send minimal data to AI
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
        
        1. Context: 
           - Give succinct 'budgetRange' (e.g. "ruppee 50-100"), 'bestSeason' (e.g. "Oct-Mar"), 'visaStatus' (e.g. "On Arrival").
           - Generate a detailed, structured, and helpful 'answer' to the travel query or question (approx 100-150 words). Provide clear, direct travel advice, key recommendations, and highlights.
        2. Pointers: Pick relevant IDs from ['visa', 'weather', 'budget', 'transport', 'common_problems', 'related_questions', 'indian_perspective'].
           - If query mentions a location (City/Country), ALWAYS include 'indian_perspective' and 'common_problems'.
        3. Matches: Return 'id', 'score' (0-100), 'reason' (max 8 words).

        Experts: ${JSON.stringify(simplifiedProfiles)}
      `;

      const response = await generateWithRetry(ai, {
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
                  answer: { type: Type.STRING },
                  relevantPointers: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  matchReason: { type: Type.STRING }
                },
                required: ["querySummary", "answer", "matchReason", "relevantPointers"]
              }
            },
            required: ["matches", "context"]
          }
        }
      });

      const aiResponse = JSON.parse(response.text);

      // Merge AI matches with full profile data and sort
      const sortedAiExperts = aiResponse.matches
        .map(match => {
          const fullProfile = fullProfiles.find(p => p.id === match.id);
          return fullProfile ? { ...fullProfile, matchScore: match.score, aiMatchReason: match.reason } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.matchScore - a.matchScore);

      let searchId = null;

      // Save to recent_searches and return the ID for section caching.
      if (aiResponse.context) {
        // Generate URL-friendly slug
        const slug = normalizedQuery
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

        // Simplify experts for storage
        const expertsToStore = sortedAiExperts.slice(0, 5).map(e => ({
          id: e.id,
          fullName: e.fullName,
          username: e.username || null,
          photo: e.photo || null,
          matchScore: e.matchScore,
          aiMatchReason: e.aiMatchReason || null
        }));

        try {
          const { data: savedSearch, error: saveSearchError } = await supabase
            .from("recent_searches")
            .insert({
              query: normalizedQuery,
              slug: slug,
              matches: sortedAiExperts.map(e => ({
                id: e.id,
                score: e.matchScore,
                reason: e.aiMatchReason
              })),
              context: aiResponse.context,
              experts: expertsToStore,
              relevant_pointers_count: aiResponse.context.relevantPointers?.length || 0,
              unlocked_sections_count: 0,
              is_indexed: false,
              timestamp: new Date().toISOString()
            })
            .select("id")
            .single();

          if (!saveSearchError && savedSearch?.id) {
            searchId = savedSearch.id;
          } else {
            console.warn("Supabase save to recent_searches failed, using local UUID generation:", saveSearchError?.message || saveSearchError);
          }
        } catch (sbErr) {
          console.warn("Supabase save threw error, using local UUID generation:", sbErr.message || sbErr);
        }

        // Generate fallback searchId locally if Supabase table didn't exist or write failed
        if (!searchId) {
          searchId = crypto.randomUUID();
        }

        // Write to Firestore RecentSearches
        if (searchId) {
          try {
            await adminDb.collection("RecentSearches").doc(searchId).set({
              query: normalizedQuery,
              slug: slug,
              matches: sortedAiExperts.map(e => ({
                id: e.id,
                score: e.matchScore,
                reason: e.aiMatchReason
              })),
              context: aiResponse.context,
              experts: expertsToStore,
              relevant_pointers_count: aiResponse.context.relevantPointers?.length || 0,
              unlocked_sections_count: 0,
              isIndexed: false,
              timestamp: new Date().toISOString(),
              sections: {}
            });
            console.log(`Saved search to Firestore RecentSearches: ${searchId}`);
          } catch (firestoreErr) {
            console.error("Failed to save to Firestore RecentSearches:", firestoreErr);
          }
        }
      }

      return NextResponse.json({ ...aiResponse, searchId });
    }

    // --- ACTION: SECTION GENERATION ---
    if (action === 'section') {
      // 1. Check if section is already cached in Supabase or Firestore
      if (searchId) {
        try {
          const { data: searchRow, error: searchError } = await supabase
            .from("recent_searches")
            .select("sections")
            .eq("id", searchId)
            .single();

          if (!searchError && searchRow?.sections?.[sectionType]) {
            console.log(`Cache Hit for section: ${sectionType} (searchId: ${searchId})`);
            return NextResponse.json(searchRow.sections[sectionType]);
          }
        } catch (err) {
          console.error("Failed to check Supabase section cache:", err);
        }

        try {
          // Fallback: Check Firestore
          const docSnap = await adminDb.collection("RecentSearches").doc(searchId).get();
          if (docSnap.exists) {
            const data = docSnap.data();
            if (data?.sections?.[sectionType]) {
              console.log(`Firestore Cache Hit for section: ${sectionType} (searchId: ${searchId})`);
              return NextResponse.json(data.sections[sectionType]);
            }
          }
        } catch (fsCacheErr) {
          console.error("Failed to check Firestore section cache:", fsCacheErr);
        }
      }

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

      const getDisputeInst = (topic) => `
        Estimate dispute object:
        1. percentage (int 20–95): Indian travellers misled by online info for ${topic}.
        2. text (string, max 15 words): Primary reason for dispute.
      `;

      switch (sectionType) {
        case 'indian_perspective':
          sectionPrompt = `Query: "${query}". Analyze for Indian Travelers.
          1. 'pros': 3 items.
          2. 'cons': 3 items.
          ${getDisputeInst('safety or food for Indians')}`;
          schemaProperties = {
            indianPerspective: {
              type: Type.OBJECT,
              properties: {
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                verdict: { type: Type.STRING }
              },
              required: ["pros", "cons"]
            },
            dispute: disputeSchema
          };
          requiredFields = ["indianPerspective", "dispute"];
          break;

        case 'related_questions':
          sectionPrompt = `Query: "${query}". max 3 FAQs with extremely short answers (max 10 words).`;
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
          sectionPrompt = `Query: "${query}". Visa Status (2 words) + 3 brief rules. ${getDisputeInst('visa rejection rates')}`;
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
          sectionPrompt = `Query: "${query}". Best Time + Temp + Packing. ${getDisputeInst('unpredictable weather')}`;
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
          sectionPrompt = `Query: "${query}". Currency, Daily Spend, 3 cost tips. ${getDisputeInst('pricing scams')}`;
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
          sectionPrompt = `Query: "${query}". Best Route, Local Travel. ${getDisputeInst('transport issues')}`;
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

        case 'common_problems':
          sectionPrompt = `Query: "${query}". List 5 common problems, pitfalls or scams travelers face here. ${getDisputeInst('common travel scams')}`;
          schemaProperties = {
            commonProblems: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                list: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      problem: { type: Type.STRING },
                      solution: { type: Type.STRING }
                    },
                    required: ["problem", "solution"]
                  }
                }
              },
              required: ["title", "list"]
            },
            dispute: disputeSchema
          };
          requiredFields = ["commonProblems", "dispute"];
          break;

        default:
          return NextResponse.json({ error: "Invalid section" }, { status: 400 });
      }

      const response = await generateWithRetry(ai, {
        contents: sectionPrompt,
        config: {
          // Use gemini-3-flash-preview for section generation too
          model: "gemini-3-flash-preview",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: schemaProperties,
            required: requiredFields
          }
        }
      });

      const sectionData = JSON.parse(response.text);

      // Async: Update recent_searches with new section data
      if (searchId) {
        let currentData = null;
        let isSupabaseSuccess = false;

        try {
          const { data: currentDataSb, error: currentSearchError } = await supabase
            .from("recent_searches")
            .select("query, sections, unlocked_sections_count, relevant_pointers_count")
            .eq("id", searchId)
            .single();

          if (!currentSearchError && currentDataSb) {
            currentData = currentDataSb;
            isSupabaseSuccess = true;
          }
        } catch (err) {
          console.error("Failed to read section data from Supabase:", err);
        }

        // Fallback: Read from Firestore if Supabase read failed or was empty
        if (!currentData) {
          try {
            const docSnap = await adminDb.collection("RecentSearches").doc(searchId).get();
            if (docSnap.exists) {
              const fsDoc = docSnap.data();
              currentData = {
                query: fsDoc.query,
                sections: fsDoc.sections || {},
                unlocked_sections_count: fsDoc.unlocked_sections_count || 0,
                relevant_pointers_count: fsDoc.relevant_pointers_count || 3
              };
            }
          } catch (fsErr) {
            console.error("Failed to read section data from Firestore:", fsErr);
          }
        }

        if (currentData) {
          try {
            const currentSections = currentData.sections || {};
            const nextSections = {
              ...currentSections,
              [sectionType]: sectionData,
            };

            let updatedUnlockedCount = currentData.unlocked_sections_count || 0;
            let shouldUpdateUnlockedCount = false;

            // Only increment if this is a new section being added
            if (!currentSections[sectionType]) {
              updatedUnlockedCount = (currentData.unlocked_sections_count || 0) + 1;
              shouldUpdateUnlockedCount = true;
            }

            const totalNeeded = currentData.relevant_pointers_count || 3;
            const isQueryTooShort = (currentData.query || "").length < 8;
            const hasSpamKeywords = ["test", "asdf", "dummy", "hack"].some(kw =>
              (currentData.query || "").toLowerCase().includes(kw)
            );
            const isHighQuality = !isQueryTooShort && !hasSpamKeywords;

            // Update Supabase if it was successful initially
            if (isSupabaseSuccess) {
              try {
                await supabase
                  .from("recent_searches")
                  .update({
                    sections: nextSections,
                    unlocked_sections_count: updatedUnlockedCount,
                    is_indexed: isHighQuality && updatedUnlockedCount >= Math.min(totalNeeded, 3)
                  })
                  .eq("id", searchId);
              } catch (sbUpdateErr) {
                console.error("Failed to update section in Supabase:", sbUpdateErr);
              }
            }

            // Mirror section update to Firestore RecentSearches
            try {
              const docRef = adminDb.collection("RecentSearches").doc(searchId);
              await docRef.update({
                sections: nextSections,
                unlocked_sections_count: updatedUnlockedCount,
                isIndexed: isHighQuality && updatedUnlockedCount >= Math.min(totalNeeded, 3)
              });
              console.log(`Updated section ${sectionType} in Firestore RecentSearches: ${searchId}`);
            } catch (firestoreErr) {
              console.error("Failed to update Firestore RecentSearches section:", firestoreErr);
            }
          } catch (err) {
            console.error("Failed to process section update:", err);
          }
        }
      }

      return NextResponse.json(sectionData);
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
