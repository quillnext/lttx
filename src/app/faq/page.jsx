"use client";

import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { app } from "@/lib/firebase";
import Link from "next/link";
import { FaSearch, FaChevronDown } from "react-icons/fa";

const db = getFirestore(app);

export default function FAQPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expertUsernameMap, setExpertUsernameMap] = useState({});

  useEffect(() => {
    const fetchQuestionsAndUsernames = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Questions"));
        const questionList = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const rawDate = new Date(data.createdAt || Date.now()); // Fallback to current time if createdAt is missing

          return {
            id: docSnap.id,
            ...data,
            timestamp:
              rawDate.toLocaleDateString("en-GB") +
              " " +
              rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
            rawTimestamp: rawDate.getTime(), // Add raw timestamp for sorting
          };
        });

        const sortedQuestions = questionList.sort((a, b) => b.rawTimestamp - a.rawTimestamp);

        const uniqueExpertNames = [...new Set(sortedQuestions.map((q) => q.expertName))].filter(Boolean);
        const usernamePromises = uniqueExpertNames.map(async (expertName) => {
          const q = query(collection(db, "Profiles"), where("fullName", "==", expertName));
          const profileSnapshot = await getDocs(q);
          let username = null;
          profileSnapshot.forEach((doc) => {
            username = doc.data().username;
          });
          return { expertName, username };
        });

        const usernameResults = await Promise.all(usernamePromises);
        const newExpertUsernameMap = usernameResults.reduce((map, result) => {
          if (result.username) {
            map[result.expertName] = result.username;
          } else {
            console.warn(`No username found for expertName: ${result.expertName}`);
          }
          return map;
        }, {});

        console.log("Expert Username Map:", newExpertUsernameMap); // Debug log
        setExpertUsernameMap(newExpertUsernameMap);
        setQuestions(sortedQuestions);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsAndUsernames();
  }, []);

  const filteredQuestions = questions.filter((question) =>
    question.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.reply?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.expertName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 text-gray-800 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#36013F]">Frequently Asked Questions</h1>
          <div className="relative w-full max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search questions, answers, or experts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-600">
            <svg
              className="animate-spin h-5 w-5 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Loading FAQs...
          </div>
        ) : filteredQuestions.length === 0 ? (
          <p className="text-gray-600 text-center">No FAQs found.</p>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const username = expertUsernameMap[q.expertName] || null;
              console.log(`Question ID: ${q.id}, Expert: ${q.expertName}, Username: ${username}`); // Debug log

              return (
                <details key={q.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer bg-[#F4D35E] text-[#36013F] font-semibold hover:bg-[#e0c54e] transition-colors">
                    <span className="text-lg">{q.question}</span>
                    <FaChevronDown className="w-5 h-5 transition-transform transform group-open:rotate-180" />
                  </summary>
                  <div className="px-6 py-4 text-gray-700 bg-gray-50">
                    <p className="mb-4">{q.reply || "No answer available yet"}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Answered by:</span>
                      {username ? (
                        <Link href={`/experts/${username}`}>
                          <span className="text-[#36013F] font-medium hover:underline">
                            {q.expertName}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-gray-500">Unknown Expert</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{q.timestamp}</p>
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}