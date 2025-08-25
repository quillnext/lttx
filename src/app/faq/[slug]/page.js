
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { app } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import AskQuestionModal from "@/app/components/AskQuestionModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const db = getFirestore(app);

const truncateByChars = (text, maxLength) => {
  if (!text) return "";
  if (text.length > maxLength) return text.substring(0, maxLength) + "...";
  return text;
};

// Helper function to convert search term to URL-friendly slug
const toSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

// Helper function to decode slug back to search term
const fromSlug = (slug) => {
  return decodeURIComponent(slug.replace(/-+/g, ' '));
};

export default function FaqSlugPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug || "";
  const searchTermFromUrl = slug ? fromSlug(slug) : "";
  const [questions, setQuestions] = useState([]);
  const [topExperts, setTopExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(decodeURIComponent(searchTermFromUrl));
  const [expertProfileMap, setExpertProfileMap] = useState({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalExpert, setModalExpert] = useState(null);
  const itemsPerPage = 10;

  const openLightbox = (imageSrc) => {
    setSelectedImage(imageSrc);
    setIsLightboxOpen(true);
  };

  useEffect(() => {
    setSearchTerm(decodeURIComponent(searchTermFromUrl));
  }, [searchTermFromUrl]);

  useEffect(() => {
    const fetchQuestionsAndUsernames = async () => {
      console.log("Fetching data for search term:", searchTermFromUrl);
      setLoading(true);
      try {
        const q = query(
          collection(db, "Questions"),
          where("isPublic", "==", true),
          where("status", "==", "answered")
        );
        const querySnapshot = await getDocs(q);
        console.log("Query Snapshot Size:", querySnapshot.size);
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

        setExpertProfileMap(newExpertProfileMap);
        setQuestions(sortedQuestions);
        setTopExperts(topExpertsList);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        toast.error("Failed to load search results.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsAndUsernames();
  }, []);

  const filteredQuestions = searchTerm
    ? questions.filter(
        (question) =>
          question.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.reply?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          question.expertName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const featuredQuestion = filteredQuestions.length > 0 ? filteredQuestions[0] : null;
  const allQuestions = featuredQuestion
    ? questions.filter((q) => q.id !== featuredQuestion.id)
    : questions;

  const totalPages = Math.ceil(allQuestions.length / itemsPerPage) || 1;
  const paginatedQuestions = allQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const slug = toSlug(searchTerm);
      router.push(`/faq/${slug}`);
    } else {
      toast.error("Please enter a search query.");
    }
  };

  const profile = featuredQuestion
    ? expertProfileMap[featuredQuestion.expertName] || {
        username: null,
        profilePhoto: "/default.jpg",
        tagline: "No tagline available",
      }
    : null;

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      {isLightboxOpen && (
        <Lightbox
          mainSrc={selectedImage}
          onCloseRequest={() => setIsLightboxOpen(false)}
          imageTitle={selectedImage.includes("default.jpg") ? "Default Profile Image" : "Expert Profile Image"}
        />
      )}
      {modalExpert && (
        <AskQuestionModal
          expert={modalExpert}
          onClose={() => setModalExpert(null)}
          initialQuestion=""
        />
      )}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      

        {featuredQuestion && (
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="p-5">
              <p className="text-3xl text-gray-700 mb-4">{featuredQuestion.question}</p>
              <p className="mb-6 text-gray-700 leading-relaxed whitespace-pre-wrap">{featuredQuestion.reply || "No answer available yet."}</p>
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openLightbox(profile.profilePhoto || "/default.jpg")}
                    className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-[#F4D35E] flex-shrink-0"
                  >
                    <Image
                      src={profile.profilePhoto || "/default.jpg"}
                      alt={`${featuredQuestion.expertName || "Expert"}'s profile photo`}
                      fill
                      sizes="40px"
                      className="object-cover"
                      onError={(e) => (e.target.src = "/default.jpg")}
                    />
                  </button>
                  <div>
                    <span className="text-sm text-gray-500">Answered by</span>
                    {profile.username ? (
                      <Link
                        href={`/experts/${profile.username}`}
                        className="block text-[#36013F] font-bold hover:underline"
                      >
                        {featuredQuestion.expertName}
                      </Link>
                    ) : (
                      <p className="font-bold text-gray-600">{featuredQuestion.expertName || "Unknown Expert"}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() =>
                    setModalExpert({
                      fullName: featuredQuestion.expertName,
                      username: profile.username,
                      profilePhoto: profile.profilePhoto || "/default.jpg",
                      tagline: profile.tagline,
                    })
                  }
                  className="bg-[#36013F] text-white py-1.5 px-4 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
                >
                  Ask a New Question
                </button>
              </div>
            </div>
          </section>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 order-1 lg:order-2">
            {loading ? (
              <div className="flex justify-center items-center gap-3 text-gray-600 p-8">
                <svg
                  className="animate-spin h-6 w-6 text-[#36013F]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="text-lg font-medium">Loading Insights...</span>
              </div>
            ) : allQuestions.length === 0 ? (
              <div className="text-center bg-white p-8 rounded-lg shadow-sm border">
                <p className="text-lg font-medium text-gray-700">No questions found.</p>
                <p className="text-gray-500">Try checking back later.</p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-[#36013F] mb-4">More Answered Questions</h2>
                <div className="space-y-4">
                  {paginatedQuestions.map((q) => {
                    const profile = expertProfileMap[q.expertName] || {
                      username: null,
                      profilePhoto: "/default.jpg",
                      tagline: "No tagline available",
                    };
                    return (
                      <details
                        key={q.id}
                        className="group bg-white rounded-lg shadow-sm transition-all duration-300 overflow-hidden border border-gray-200 hover:shadow-lg hover:border-[#F4D35E]"
                      >
                        <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-[#36013F] hover:bg-gray-50">
                          <span className="text-lg pr-4">{q.question}</span>
                          <FaChevronDown className="w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-180 group-open:text-[#36013F]" />
                        </summary>
                        <div className="p-5 border-t border-gray-200">
                          <p className="mb-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {q.reply || "No answer available yet."}
                          </p>
                          <div className="flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => openLightbox(profile.profilePhoto || "/default.jpg")}
                                className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-[#F4D35E] flex-shrink-0"
                              >
                                <Image
                                  src={profile.profilePhoto || "/default.jpg"}
                                  alt={`${q.expertName || "Expert"}'s profile photo`}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                  onError={(e) => (e.target.src = "/default.jpg")}
                                />
                              </button>
                              <div>
                                <span className="text-sm text-gray-500">Answered by</span>
                                {profile.username ? (
                                  <Link
                                    href={`/experts/${profile.username}`}
                                    className="block text-[#36013F] font-bold hover:underline"
                                  >
                                    {q.expertName}
                                  </Link>
                                ) : (
                                  <p className="font-bold text-gray-600">{q.expertName || "Unknown Expert"}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setModalExpert({
                                  fullName: q.expertName,
                                  username: profile.username,
                                  profilePhoto: profile.profilePhoto || "/default.jpg",
                                  tagline: profile.tagline,
                                })
                              }
                              className="bg-[#36013F] text-white py-1.5 px-4 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
                            >
                              Ask a New Question
                            </button>
                          </div>
                        </div>
                      </details>
                    );
                  })}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 sm:gap-4 mt-8">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white text-[#36013F] rounded-lg border border-[#36013F] font-semibold hover:bg-[#36013F] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="font-medium text-gray-700 text-sm sm:text-base">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white text-[#36013F] rounded-lg border border-[#36013F] font-semibold hover:bg-[#36013F] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:col-span-1">
              {!loading && topExperts.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-[#36013F] mb-4 md:ml-10">
                    Top Insightful Experts
                  </h2>
                  <div className="space-y-4">
                    {topExperts.map((expert) => {
                      const profile =
                        expertProfileMap[expert.expertName] || {
                          username: null,
                          profilePhoto: "/default.jpg",
                          tagline: "No tagline available",
                        };
                      return (
                        <div
                          key={expert.expertName}
                          className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-primary hover:shadow-md transition-shadow w-full md:w-[80%] mx-auto"
                        >
                          <button
                            onClick={() => openLightbox(profile.profilePhoto)}
                            className="relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#36013F]"
                          >
                            <Image
                              src={profile.profilePhoto}
                              alt={`${expert.expertName || "Expert"}'s profile photo`}
                              fill
                              sizes="56px"
                              className="object-cover object-center"
                              onError={(e) => (e.target.src = "/default.jpg")}
                            />
                          </button>
                          <div className="flex flex-col">
                            {profile.username && (
                              <Link
                                href={`/experts/${profile.username}`}
                                className="text-xs text-blue-600 hover:underline mt-1"
                              >
                                <p className="text-sm font-semibold text-[#36013F]">
                                  {expert.expertName}
                                </p>
                              </Link>
                            )}
                            <p className="text-xs text-gray-600">{truncateByChars(profile.tagline, 50)}</p>
                            <p className="text-xs text-gray-500">{expert.answerCount} Answers</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </main>

        <div className="text-center mt-8">
          <Link href="/faq" className="text-[#36013F] font-semibold hover:underline">
            View all Questions
          </Link>
        </div>
      </div>
    </div>
  );
}
