"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { FaSearch, FaChevronDown, FaExternalLinkAlt } from "react-icons/fa";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import Navbar from "../components/Navbar";
import Footer from "../pages/Footer";
import slugify from "slugify";
import PrescriptionUserView from "../components/PrescriptionUserView";
import { useRouter } from "next/navigation";

const truncateByChars = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// Helper function to convert search term to URL-friendly slug using slugify
const toSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true, // Remove special characters
    remove: /[*+~.()'"!:@]/g, // Remove additional special characters
    trim: true,
    replacement: '-', 
  }).substring(0, 100); 
};

export default function FAQPage({
  initialQuestions = [],
  initialTopExperts = [],
  initialExpertProfileMap = {}
}) {
  const router = useRouter();
  const [groupedQuestions, setGroupedQuestions] = useState([]);
  const [topExperts, setTopExperts] = useState(initialTopExperts);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expertProfileMap, setExpertProfileMap] = useState(initialExpertProfileMap);
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
          expertIds: new Set(),
          totalLikes: 0,
          totalDislikes: 0,
          ids: [],
          timestamps: [],
        };
      }
      const ag = group.answerGroups[replyKey];
      ag.experts.add(q.expertName);
      ag.expertIds.add(q.expertId);
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
    if (initialQuestions && initialQuestions.length > 0) {
      setGroupedQuestions(groupQuestions(initialQuestions));
    }
  }, [initialQuestions]);

  useEffect(() => {
    const channel = supabase
      .channel("public-answered-questions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "questions",
          filter: "is_public=eq.true",
        },
        async () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

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
      for (const id of ids) {
        const { data: row } = await supabase
          .from("questions")
          .select("likes, dislikes")
          .eq("id", id)
          .single();
        if (row) {
          const count = (action === "like" ? row.likes : row.dislikes) || 0;
          await supabase
            .from("questions")
            .update({ [action === "like" ? "likes" : "dislikes"]: count + 1 })
            .eq("id", id);
        }
      }
    } catch (error) {
      console.error(`Error updating ${action}:`, error);
    }
  };

  return (
    <>
      <Navbar />
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
                          <div className="relative border-l-2 border-gray-100 ml-4 pl-6 sm:pl-8 space-y-6 my-2">
                            {group.answerGroupsArray.map((ag) => {
                              const expertsArray = Array.from(ag.experts);
                              const expertIdsArray = ag.expertIds ? Array.from(ag.expertIds) : [];
                              const isSingleExpert = ag.expertIds ? ag.expertIds.size === 1 : ag.experts.size === 1;
                              const singleExpertId = isSingleExpert && expertIdsArray.length > 0 ? expertIdsArray[0] : null;
                              const singleExpertName = isSingleExpert ? expertsArray[0] : null;
                              const profile = isSingleExpert && singleExpertId
                                ? (expertProfileMap[singleExpertId] || { username: null, photo: "/default.jpg", tagline: "No tagline available" })
                                : null;

                              return (
                                <div key={ag.reply} className="relative bg-gray-50/50 p-4 sm:p-5 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:shadow-md">
                                  {/* Timeline avatar / connector dot */}
                                  <div className="absolute -left-[35px] sm:-left-[43px] top-5 w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm flex items-center justify-center">
                                    {isSingleExpert && profile ? (
                                      <Image
                                        src={profile.photo || "/default.jpg"}
                                        alt={`${singleExpertName || "Expert"}'s avatar`}
                                        width={24}
                                        height={24}
                                        className="object-cover w-full h-full cursor-pointer"
                                        onClick={() => profile.photo && openLightbox(profile.photo)}
                                      />
                                    ) : (
                                      <span className="text-[8px] font-bold text-gray-600 bg-gray-300 w-full h-full flex items-center justify-center">EXP</span>
                                    )}
                                  </div>

                                  <div className="mb-4">
                                    {(() => {
                                      try {
                                        const parsed = JSON.parse(ag.reply);
                                        return <PrescriptionUserView prescription={parsed} />;
                                      } catch (e) {
                                        return <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{ag.reply || "No answer available yet."}</p>;
                                      }
                                    })()}
                                  </div>

                                  <div className="flex flex-wrap justify-between items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                                    <div>
                                      {isSingleExpert ? (
                                        <div className="text-sm">
                                          <span className="text-gray-500">Answered by </span>
                                          {profile && profile.username ? (
                                            <Link
                                              href={`/experts/${profile.username}`}
                                              className="inline-block text-[#36013F] font-bold hover:underline"
                                            >
                                              {singleExpertName}
                                            </Link>
                                          ) : (
                                            <span className="font-bold text-gray-600">{singleExpertName || "Unknown Expert"}</span>
                                          )}
                                        </div>
                                      ) : (
                                        <p className="text-sm font-bold text-gray-600">Verified by {ag.experts.size}+ experts</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <p className="text-xs text-gray-500">{ag.timestamp}</p>
                                      <Link
                                        href={`/aaq/${toSlug(group.originalQuestion)}`}
                                        className="text-[#36013F] hover:text-[#F4D35E] p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                        title="View full page"
                                      >
                                        <FaExternalLinkAlt className="w-3.5 h-3.5" />
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
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
                        const profile = expertProfileMap[expert.expertId] || {
                          username: null,
                          photo: "/default.jpg",
                          tagline: "No tagline available",
                        };
                        return (
                          <div
                            key={expert.expertId}
                            className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-[#36013F] hover:shadow-md transition-shadow w-full md:w-[80%] mx-auto"
                          >
                            <button
                              onClick={() => openLightbox(profile.photo || "/default.jpg")}
                              className="relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#36013F]"
                            >
                              <Image
                                src={profile.photo || "/default.jpg"}
                                alt={`${expert.expertName || "Expert"}'s profile photo`}
                                fill
                                sizes="56px"
                                className="object-cover object-center"
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
        </div>
      </div>

      <Footer />
    </>
  );
}
