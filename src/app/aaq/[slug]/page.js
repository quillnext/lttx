
import React from "react";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { app } from "@/lib/firebase";
import slugify from "slugify";
import QuestionClient from "./QuestionClient";

// Force dynamic rendering since we are fetching data that might change
export const dynamic = "force-dynamic";

const db = getFirestore(app);

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

  try {
    const q = query(
      collection(db, "Questions"),
      where("isPublic", "==", true),
      where("status", "==", "answered")
    );
    const querySnapshot = await getDocs(q);

    const questionList = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const rawDate = new Date(data.createdAt || Date.now());
      return {
        id: docSnap.id,
        ...data,
        timestamp:
          rawDate.toLocaleDateString("en-GB") +
          " " +
          rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        rawTimestamp: rawDate.getTime(),
      };
    });

    const sortedQuestions = questionList.sort((a, b) => b.rawTimestamp - a.rawTimestamp);

    const answerCountMap = questionList.reduce((map, q) => {
      map[q.expertName] = (map[q.expertName] || 0) + 1;
      return map;
    }, {});

    const uniqueExpertNames = [...new Set(questionList.map((q) => q.expertName))].filter(Boolean);
    const profilePromises = uniqueExpertNames.map(async (expertName) => {
      const q = query(collection(db, "Profiles"), where("fullName", "==", expertName));
      const profileSnapshot = await getDocs(q);
      let username = null;
      let profilePhoto = null;
      let tagline = null;
      profileSnapshot.forEach((doc) => {
        username = doc.data().username;
        profilePhoto = doc.data().profilePhoto || doc.data().photo;
        tagline = doc.data().tagline || "No tagline available";
      });
      return { expertName, username, profilePhoto, tagline, answerCount: answerCountMap[expertName] || 0 };
    });

    const profileResults = await Promise.all(profilePromises);
    const newExpertProfileMap = profileResults.reduce((map, result) => {
      if (result.expertName) {
        map[result.expertName] = {
          username: result.username,
          profilePhoto: result.profilePhoto || "/default.jpg",
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
    // Logic similar to filteredQuestions in Client
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

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { featuredQuestion } = await fetchData(resolvedParams.slug);

  if (featuredQuestion) {
    return {
      title: `${featuredQuestion.question} - Let's Talk Travel`,
      description: featuredQuestion.reply ? featuredQuestion.reply.substring(0, 160) : "Expert answer on Let's Talk Travel",
      openGraph: {
        title: featuredQuestion.question,
        description: featuredQuestion.reply ? featuredQuestion.reply.substring(0, 160) : "Expert answer on Let's Talk Travel",
        type: 'article',
      },
      alternates: {
        canonical: `https://www.xmytravel.com/aaq/${resolvedParams.slug}`,
      },
    };
  }

  return {
    title: "Ask a Question - Let's Talk Travel",
    description: "Find answers to your travel questions from our experts.",
  };
}

export default async function Page({ params }) {
  // Next.js 15 requires awaiting params
  const resolvedParams = await params;
  const { questions, topExperts, expertProfileMap } = await fetchData(resolvedParams.slug);

  // Pass data to Client Component
  // JSON.parse(JSON.stringify(...)) is a safe way to ensure only plain objects are passed 
  // (though here we should already have plain objects from the mapper)

  return (
    <QuestionClient
      initialQuestions={JSON.parse(JSON.stringify(questions))}
      initialTopExperts={JSON.parse(JSON.stringify(topExperts))}
      initialExpertProfileMap={JSON.parse(JSON.stringify(expertProfileMap))}
      slug={resolvedParams.slug}
    />
  );
}