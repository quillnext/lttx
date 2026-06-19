
import React from "react";
import QuestionClient from "./QuestionClient";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

// Force dynamic rendering since we are fetching data that might change
export const dynamic = "force-dynamic";

// Helper function to decode slug back to search term
const fromSlug = (slug) => {
  return decodeURIComponent(slug.replace(/-+/g, ' '));
};

// Simple Levenshtein distance for better matching
const levenshteinDistance = (a, b) => {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  return matrix[b.length][a.length];
};

async function fetchData(slug) {
  const searchTermFromUrl = slug ? fromSlug(slug) : "";
  const searchTermLower = searchTermFromUrl.toLowerCase();
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
      .slice(0, 5)
      .map((expert, index) => ({ ...expert, rank: index + 1 }));

    // Find the triggered question for Metadata
    let featuredQuestion = null;
    if (searchTermFromUrl) {
      const withScores = sortedQuestions.map(question => {
        const questionText = question.question?.toLowerCase() || '';
        const isExactMatch = questionText === searchTermLower;
        const levenshteinScore = levenshteinDistance(questionText, searchTermLower);

        let score = 0;
        if (isExactMatch) score += 100;
        score += (100 - Math.min(levenshteinScore, 100)) / 2;

        return { ...question, score };
      }).filter(q => q.score > 0).sort((a, b) => b.score - a.score);

      if (withScores.length > 0) {
        featuredQuestion = withScores[0];
      }
    }

    return {
      questions: sortedQuestions,
      topExperts: topExpertsList,
      expertProfileMap: newExpertProfileMap,
      featuredQuestion
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      questions: [],
      topExperts: [],
      expertProfileMap: {},
      featuredQuestion: null
    };
  }
}

// Helper for SEO truncation
const truncateStr = (text, limit) => {
  if (!text || text.length <= limit) return text;
  const truncated = text.slice(0, limit);
  // Optional: Back up to the last space to avoid cutting words
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > limit * 0.8 ? truncated.slice(0, lastSpace) : truncated) + "...";
};

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { featuredQuestion } = await fetchData(resolvedParams.slug);

  if (featuredQuestion) {
    const rawTitle = featuredQuestion.question || "Travel Question";
    const rawDesc = featuredQuestion.reply || "Expert travel answer by verified professionals.";

    return {
      title: truncateStr(`${rawTitle} | Xmytravel`, 60),
      description: truncateStr(rawDesc, 160),
      openGraph: {
        title: truncateStr(rawTitle, 60),
        description: truncateStr(rawDesc, 160),
        type: 'article',
      },
      alternates: {
        canonical: `https://www.xmytravel.com/aaq/${resolvedParams.slug}`,
      },
    };
  }

  return {
    title: "Already Answered Questions | Xmytravel",
    description: "Browse verified travel questions and expert answers for visa, flight and itinerary tips.",
  };
}

import JsonLd from "@/app/components/JsonLd";

export default async function Page({ params }) {
  // Next.js 15 requires awaiting params
  const resolvedParams = await params;
  const { questions, topExperts, expertProfileMap, featuredQuestion } = await fetchData(resolvedParams.slug);

  // Generate FAQ Schema if featuredQuestion exists
  const faqSchema = featuredQuestion ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": featuredQuestion.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": featuredQuestion.reply || "Answer pending from travel experts."
      }
    }]
  } : null;

  return (
    <>
      {faqSchema && <JsonLd schema={faqSchema} />}
      <QuestionClient
        initialQuestions={JSON.parse(JSON.stringify(questions))}
        initialTopExperts={JSON.parse(JSON.stringify(topExperts))}
        initialExpertProfileMap={JSON.parse(JSON.stringify(expertProfileMap))}
        slug={resolvedParams.slug}
      />
    </>
  );
}