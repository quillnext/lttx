

"use client";

import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import { app } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";
import { FaSearch, FaChevronDown, FaThumbsUp, FaThumbsDown, FaTrophy } from "react-icons/fa";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import Navbar from "../components/Navbar";
import Footer from "../pages/Footer";

const db = getFirestore(app);

const truncateByChars = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

export default function FAQPage() {
  const [groupedQuestions, setGroupedQuestions] = useState([]);
  const [topExperts, setTopExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expertProfileMap, setExpertProfileMap] = useState({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const openLightbox = (imageSrc) => {
    setSelectedImage(imageSrc);
    setIsLightboxOpen(true);
  };

  const groupQuestions = (questionList) => {
    const grouped = {};
    questionList.forEach((q) => {
      const questionKey = q.question?.trim().toLowerCase() || "";
      if (!grouped[questionKey]) {
        grouped[questionKey] = {
          originalQuestion: q.question,
          answerGroups: {},
          maxTimestamp: 0,
        };
      }
      const group = grouped[questionKey];
      group.maxTimestamp = Math.max(group.maxTimestamp, q.rawTimestamp);

      const replyKey = q.reply?.trim() || "";
      if (!group.answerGroups[replyKey]) {
        group.answerGroups[replyKey] = {
          reply: q.reply,
          experts: new Set(),
          totalLikes: 0,
          totalDislikes: 0,
          ids: [],
          timestamps: [],
        };
      }
      const ag = group.answerGroups[replyKey];
      ag.experts.add(q.expertName);
      ag.totalLikes += q.likes || 0;
      ag.totalDislikes += q.dislikes || 0;
      ag.ids.push(q.id);
      ag.timestamps.push(q.rawTimestamp);
    });

    Object.keys(grouped).forEach((key) => {
      grouped[key].answerGroupsArray = Object.values(grouped[key].answerGroups).map((ag) => ({
        ...ag,
        minTimestamp: Math.min(...ag.timestamps),
        timestamp:
          new Date(Math.min(...ag.timestamps)).toLocaleDateString("en-GB") +
          " " +
          new Date(Math.min(...ag.timestamps)).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      }));
    });

    return Object.values(grouped).sort((a, b) => b.maxTimestamp - a.maxTimestamp);
  };

  useEffect(() => {
    const fetchQuestionsAndUsernames = async () => {
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

        const grouped = groupQuestions(questionList);

        const answerCountMap = questionList.reduce((map, q) => {
          map[q.expertName] = (map[q.expertName] || 0) + 1;
          return map;
        }, {});

        const uniqueExpertNames = [...new Set(questionList.map((q) => q.expertName))].filter(Boolean);
        const profilePromises = uniqueExpertNames.map(async (expertName) => {
          const qProfile = query(collection(db, "Profiles"), where("fullName", "==", expertName));
          const profileSnapshot = await getDocs(qProfile);
          let username = null, profilePhoto = null, tagline = null;
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
          .slice(0, 10)
          .map((expert, index) => ({ ...expert, rank: index + 1 }));

        setExpertProfileMap(newExpertProfileMap);
        setGroupedQuestions(grouped);
        setTopExperts(topExpertsList);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    const q = query(
      collection(db, "Questions"),
      where("isPublic", "==", true),
      where("status", "==", "answered")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questionList = snapshot.docs.map((docSnap) => {
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
      const grouped = groupQuestions(questionList);
      setGroupedQuestions(grouped);
    }, (error) => {
      console.error("Error with real-time listener:", error.message);
    });

    fetchQuestionsAndUsernames();
    return () => unsubscribe();
  }, []);

  const filteredGroups = groupedQuestions.filter(
    (group) =>
      group.originalQuestion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.answerGroupsArray.some(
        (ag) =>
          ag.reply?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          Array.from(ag.experts).some((expert) =>
            expert?.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
  );

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handleLikeDislike = async (ids, action) => {
    try {
      const updates = ids.map((id) =>
        updateDoc(doc(db, "Questions", id), {
          [action === "like" ? "likes" : "dislikes"]: increment(1),
        })
      );
      await Promise.all(updates);
    } catch (error) {
      console.error(`Error updating ${action}:`, error.message);
    }
  };

  return (
<>
<Navbar/>
    <div className="min-h-screen font-sans bg-gray-100">
      {isLightboxOpen && (
        <Lightbox
          mainSrc={selectedImage}
          onCloseRequest={() => setIsLightboxOpen(false)}
          imageTitle={selectedImage.includes("default.jpg") ? "Default Profile Image" : "Expert Profile Image"}
        />
      )}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        

        <header className="text-center mb-12 mt-20">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#36013F] mb-3">
            Already Answered Questions
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Explore questions already answered by our community of insightful experts.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Optionally handle search submission if needed
            }}
            className="relative w-full max-w-2xl mx-auto mt-8"
          >
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions, answers, or experts..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36013F] focus:border-transparent transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search FAQs"
            />
            <button type="submit" className="hidden">Search</button>
          </form>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 order-2 lg:order-1">
            {loading ? (
              <div className="flex justify-center items-center gap-3 text-gray-600 p-8">
                <svg
                  className="animate-spin h-6 w-6 text-[#36013F]"
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
                <span className="text-lg font-medium">Loading Insights...</span>
              </div>
            ) : paginatedGroups.length === 0 ? (
              <div className="text-center bg-white p-8 rounded-lg shadow-sm border">
                <p className="text-lg font-medium text-gray-700">No questions found.</p>
                <p className="text-gray-500">Try adjusting your search or check back later.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedGroups.map((group) => (
                  <details
                    key={group.originalQuestion}
                    className="group bg-white rounded-lg shadow-sm transition-all duration-300 overflow-hidden border border-gray-200 hover:shadow-lg hover:border-[#F4D35E]"
                  >
                    <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-[#36013F] hover:bg-gray-50">
                      <span className="text-lg pr-4">{group.originalQuestion}</span>
                      <FaChevronDown className="w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-180 group-open:text-[#36013F]" />
                    </summary>
                    <div className="p-5 border-t border-gray-200">
                      {group.answerGroupsArray.map((ag) => {
                        const expertsArray = Array.from(ag.experts);
                        const isSingleExpert = ag.experts.size === 1;
                        const singleExpertName = isSingleExpert ? expertsArray[0] : null;
                        const profile = isSingleExpert && singleExpertName
                          ? (expertProfileMap[singleExpertName] || { username: null, profilePhoto: "/default.jpg", tagline: "No tagline available" })
                          : null;

                        return (
                          <div key={ag.reply} className="border-b border-gray-100 pb-4 last:border-b-0">
                            <p className="mb-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {ag.reply || "No answer available yet."}
                            </p>
                            <div className="flex flex-wrap justify-between items-center gap-4">
                              <div className="flex items-center gap-3">
                                {isSingleExpert && profile && (
                                  <button
                                    onClick={() => openLightbox(profile.profilePhoto)}
                                    className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-[#F4D35E] flex-shrink-0"
                                  >
                                    <Image
                                      src={profile.profilePhoto}
                                      alt={`${singleExpertName || "Expert"}'s profile photo`}
                                      fill
                                      sizes="40px"
                                      className="object-cover"
                                      onError={(e) => (e.target.src = "/default.jpg")}
                                    />
                                  </button>
                                )}
                                <div>
                                  {isSingleExpert ? (
                                    <>
                                      <span className="text-sm text-gray-500">Answered by</span>
                                      {profile && profile.username ? (
                                        <Link
                                          href={`/experts/${profile.username}`}
                                          className="block text-[#36013F] font-bold hover:underline"
                                        >
                                          {singleExpertName}
                                        </Link>
                                      ) : (
                                        <p className="font-bold text-gray-600">{singleExpertName || "Unknown Expert"}</p>
                                      )}
                                    </>
                                  ) : (
                                    <p className="font-bold text-gray-600">Verified by {ag.experts.size}+ experts</p>
                                  )}
                                </div>
                              </div>
                              {/* <div className="flex items-center gap-6">
                                <button
                                  onClick={() => handleLikeDislike(ag.ids, "like")}
                                  className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                                  aria-label="Like this answer"
                                >
                                  <FaThumbsUp className="w-5 h-5" />
                                  <span className="font-semibold">{ag.totalLikes}</span>
                                </button>
                                <button
                                  onClick={() => handleLikeDislike(ag.ids, "dislike")}
                                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                                  aria-label="Dislike this answer"
                                >
                                  <FaThumbsDown className="w-5 h-5" />
                                  <span className="font-semibold">{ag.totalDislikes}</span>
                                </button>
                              </div> */}
                              <p className="text-xs text-gray-500 self-end">{ag.timestamp}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                ))}
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
            )}
          </div>

          <aside className="lg:col-span-1 order-1 lg:order-2">
            <div className="sticky top-20">
              {!loading && topExperts.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-[#36013F] mb-4 md:ml-10">
                    Top Insightful Experts
                  </h2>
                  <div className="space-y-4">
                    {topExperts.map((expert) => {
                      const profile = expertProfileMap[expert.expertName] || {
                        username: null,
                        profilePhoto: "/default.jpg",
                        tagline: "No tagline available",
                      };
                      return (
                        <div
                          key={expert.expertName}
                          className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-[#36013F] hover:shadow-md transition-shadow w-full md:w-[80%] mx-auto"
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
                            {profile.username ? (
                              <Link
                                href={`/experts/${profile.username}`}
                                className="text-xs text-blue-600 hover:underline mt-1"
                              >
                                <p className="text-sm font-semibold text-[#36013F]">
                                  {expert.expertName}
                                </p>
                              </Link>
                            ) : (
                              <p className="text-sm font-semibold text-[#36013F]">
                                {expert.expertName || "Unknown Expert"}
                              </p>
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

        {/* <div className="text-center mt-8">
          <Link href="/faq" className="text-[#36013F] font-semibold hover:underline">
            View all Questions
          </Link>
        </div> */}
      </div>
    </div>

    <Footer/>
    </>
  );
}