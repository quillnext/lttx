import React from "react";
import AAQClient from "./AAQClient";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

// Force dynamic rendering since we are fetching data that might change
export const dynamic = "force-dynamic";

async function fetchData() {
  const supabase = createSupabaseAdminClient();
  try {
    const { data: querySnapshot, error } = await supabase
      .from("questions")
      .select("*")
      .eq("is_public", true)
      .eq("status", "answered");

    if (error) throw error;

    const questionList = (querySnapshot || []).map((data) => {
      const rawDate = new Date(data.created_at || Date.now());
      return {
        id: data.id,
        question: data.question,
        reply: data.reply,
        expertName: data.expert_name?.trim(),
        expertId: data.expert_id,
        status: data.status,
        isPublic: data.is_public,
        likes: data.likes || 0,
        dislikes: data.dislikes || 0,
        timestamp:
          rawDate.toLocaleDateString("en-GB") +
          " " +
          rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        rawTimestamp: rawDate.getTime(),
      };
    });

    const sortedQuestions = questionList.sort((a, b) => b.rawTimestamp - a.rawTimestamp);

    const answerCountMap = questionList.reduce((map, q) => {
      if (q.expertId) {
        map[q.expertId] = (map[q.expertId] || 0) + 1;
      }
      return map;
    }, {});

    const uniqueExpertIds = [...new Set(questionList.map((q) => q.expertId))].filter(Boolean);
    const profilePromises = uniqueExpertIds.map(async (expertId) => {
      const { data: profileSnapshot } = await supabase
        .from("profiles")
        .select("username, photo_url, tagline, full_name")
        .eq("id", expertId);

      let username = null, photo = null, tagline = null, fullName = null;
      if (profileSnapshot && profileSnapshot.length > 0) {
        const doc = profileSnapshot[0];
        username = doc.username;
        photo = doc.photo_url;
        tagline = doc.tagline || "No tagline available";
        fullName = doc.full_name;
      }
      return { expertId, username, photo, tagline, expertName: fullName || "Unknown Expert", answerCount: answerCountMap[expertId] || 0 };
    });

    const profileResults = await Promise.all(profilePromises);
    const newExpertProfileMap = profileResults.reduce((map, result) => {
      if (result.expertId) {
        map[result.expertId] = {
          username: result.username,
          photo: result.photo || "/default.jpg",
          tagline: result.tagline,
        };
      }
      return map;
    }, {});

    const topExpertsList = profileResults
      .sort((a, b) => b.answerCount - a.answerCount)
      .slice(0, 10)
      .map((expert, index) => ({ ...expert, rank: index + 1 }));

    return {
      questions: sortedQuestions,
      topExperts: topExpertsList,
      expertProfileMap: newExpertProfileMap,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      questions: [],
      topExperts: [],
      expertProfileMap: {},
    };
  }
}

export default async function Page() {
  const { questions, topExperts, expertProfileMap } = await fetchData();

  return (
    <AAQClient
      initialQuestions={JSON.parse(JSON.stringify(questions))}
      initialTopExperts={JSON.parse(JSON.stringify(topExperts))}
      initialExpertProfileMap={JSON.parse(JSON.stringify(expertProfileMap))}
    />
  );
}
