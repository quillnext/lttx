"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaSearch, FaChevronDown, FaExternalLinkAlt } from "react-icons/fa";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import AskQuestionModal from "@/app/components/AskQuestionModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import slugify from "slugify";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/pages/Footer";
import PrescriptionUserView from "@/app/components/PrescriptionUserView";

const truncateByChars = (text, maxLength) => {
    if (!text) return "";
    if (text.length > maxLength) return text.substring(0, maxLength) + "...";
    return text;
};

// Helper function to convert search term to URL-friendly slug using slugify
const toSlug = (text) => {
    return slugify(text, {
        lower: true,
        strict: true, // Remove special characters
        remove: /[*+~.()'"!:@]/g, // Remove additional special characters
        trim: true,
        replacement: '-', // Replace spaces with hyphens
    }).substring(0, 100); // Limit slug length for URL safety
};

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

export default function QuestionClient({
    initialQuestions = [],
    initialTopExperts = [],
    initialExpertProfileMap = {},
    slug = ""
}) {
    const router = useRouter();

    // If slug is provided, we can derive the search term from it
    // But we typically want to respect what's passed or the URL
    const searchTermFromUrl = slug ? fromSlug(slug) : "";

    const [questions, setQuestions] = useState(initialQuestions);
    const [topExperts, setTopExperts] = useState(initialTopExperts);
    // If we have initial data, we aren't loading
    const [loading, setLoading] = useState(initialQuestions.length === 0);
    const [searchTerm, setSearchTerm] = useState(searchTermFromUrl);
    const [expertProfileMap, setExpertProfileMap] = useState(initialExpertProfileMap);
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
        // strict check if slug changed or if we need to update search term
        setSearchTerm(searchTermFromUrl);
    }, [searchTermFromUrl]);

    // We are NOT fetching data here anymore because it is passed from the server
    // IF for some reason initialQuestions is empty, we might want to fetch, 
    // but for this refactor we assume server provides it or we accept empty state.
    // The original component fetched on mount. 
    // If we want to support client-side fallback, we could add it, but 
    // for SEO purposes server-side data is critical.

    // However, removing the fetch entirely might break if this component is used elsewhere without props.
    // But it is under [slug]/page.js, so it should always get props.
    // We'll keep it simple and rely on props.

    const groupQuestions = (questionList) => {
        const grouped = {};
        questionList.forEach((q) => {
            const questionKey = q.question?.trim().toLowerCase() || "";
            if (!grouped[questionKey]) {
                grouped[questionKey] = {
                    originalQuestion: q.question,
                    answerGroups: {},
                    maxTimestamp: 0,
                    maxScore: q.score || 0,
                };
            }
            const group = grouped[questionKey];
            group.maxTimestamp = Math.max(group.maxTimestamp, q.rawTimestamp || 0);
            group.maxScore = Math.max(group.maxScore, q.score || 0);

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
            ag.timestamps.push(q.rawTimestamp || 0);
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

        return Object.values(grouped);
    };

    // Enhanced filtering to prioritize exact or near-exact question matches
    const scoredQuestions = searchTerm
        ? questions
            .map((question) => {
                const questionText = question.question?.toLowerCase() || '';
                const replyText = question.reply?.toLowerCase() || '';
                const expertName = question.expertName?.toLowerCase() || '';
                const searchLower = searchTerm.toLowerCase();

                // Check for exact or near-exact match in question
                const isExactMatch = questionText === searchLower;
                const levenshteinScore = levenshteinDistance(questionText, searchLower);
                const questionMatch = questionText.includes(searchLower);
                const replyMatch = replyText.includes(searchLower);
                const expertMatch = expertName.includes(searchLower);

                // Prioritize exact match, then Levenshtein distance, then partial matches
                let score = 0;
                if (isExactMatch) score += 100; // High score for exact match
                score += (100 - Math.min(levenshteinScore, 100)) / 2; // Weighted Levenshtein score
                if (questionMatch && !isExactMatch) score += 30; // Partial question match
                if (replyMatch) score += 20; // Reply match
                if (expertMatch) score += 10; // Expert name match

                return { ...question, score };
            })
            .filter((question) => question.score > 0)
        : [];

    const groupedQuestions = groupQuestions(scoredQuestions);
    const sortedGroups = groupedQuestions.sort((a, b) => b.maxScore - a.maxScore || b.maxTimestamp - a.maxTimestamp);

    const featuredGroup = sortedGroups.length > 0 ? sortedGroups[0] : null;
    const allGroups = featuredGroup
        ? sortedGroups.filter((g) => g.originalQuestion?.toLowerCase().trim() !== featuredGroup.originalQuestion?.toLowerCase().trim())
        : sortedGroups;

    const totalPages = Math.ceil(allGroups.length / itemsPerPage) || 1;
    const paginatedGroups = allGroups.slice(
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
            router.push(`/aaq/${slug}`);
        } else {
            toast.error("Please enter a search query.");
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <Navbar />
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
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 mt-12">
                <header className="text-center mb-12 hidden">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[#36013F] mb-3">
                        Search Results
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                        Explore questions matching your search query answered by our community of insightful experts.
                    </p>
                    <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto mt-8">
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

                {featuredGroup ? (
                    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="p-5">
                            <h1 className="text-3xl text-gray-700 mb-6">{featuredGroup.originalQuestion}</h1>
                            <div className="relative border-l-2 border-gray-100 ml-4 pl-6 sm:pl-8 space-y-6 my-2">
                                {featuredGroup.answerGroupsArray.map((ag) => {
                                    const expertsArray = Array.from(ag.experts);
                                    const expertIdsArray = ag.expertIds ? Array.from(ag.expertIds) : [];
                                    const isSingleExpert = ag.expertIds ? ag.expertIds.size === 1 : ag.experts.size === 1;
                                    const singleExpertId = isSingleExpert && expertIdsArray.length > 0 ? expertIdsArray[0] : null;
                                    const singleExpertName = isSingleExpert ? expertsArray[0] : null;
                                    const profile = isSingleExpert && singleExpertId
                                        ? (expertProfileMap[singleExpertId] || { username: null, photo: "/default.jpg", tagline: "No tagline available" })
                                        : { username: null, photo: "/default.jpg", tagline: "No tagline available" };

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
                                                    {isSingleExpert && (
                                                        <button
                                                            onClick={() =>
                                                                setModalExpert({
                                                                    fullName: singleExpertName,
                                                                    username: profile.username,
                                                                    profilePhoto: profile.photo || "/default.jpg",
                                                                    tagline: profile.tagline,
                                                                })
                                                            }
                                                            className="bg-[#36013F] text-white py-1 px-3 rounded-full hover:bg-opacity-90 transition-all text-xs cursor-pointer"
                                                        >
                                                            Ask a New Question
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                ) : (
                    !loading && (
                        <div className="text-center bg-white p-8 rounded-lg shadow-sm border mb-8">
                            <p className="text-lg font-medium text-gray-700">No matching questions found.</p>
                            <p className="text-gray-500">Try adjusting your search query.</p>
                        </div>
                    )
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
                        ) : allGroups.length === 0 && sortedGroups.length > 0 ? (
                            <div className="text-center bg-white p-8 rounded-lg shadow-sm border">
                                <p className="text-lg font-medium text-gray-700">No additional questions found.</p>
                                <p className="text-gray-500">The featured question above is the only match.</p>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-2xl font-bold text-[#36013F] mb-4">More Answered Questions</h2>
                                <div className="space-y-4">
                                    {paginatedGroups.map((group) => {
                                        return (
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
                                                                : { username: null, photo: "/default.jpg", tagline: "No tagline available" };

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
                                                                            {isSingleExpert && (
                                                                                <button
                                                                                    onClick={() =>
                                                                                        setModalExpert({
                                                                                            fullName: singleExpertName,
                                                                                            username: profile.username,
                                                                                            profilePhoto: profile.photo || "/default.jpg",
                                                                                            tagline: profile.tagline,
                                                                                        })
                                                                                    }
                                                                                    className="bg-[#36013F] text-white py-1 px-3 rounded-full hover:bg-opacity-90 transition-all text-xs cursor-pointer"
                                                                                >
                                                                                    Ask a New Question
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
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
                                                expertProfileMap[expert.expertId] || {
                                                    username: null,
                                                    photo: "/default.jpg",
                                                    profilePhoto: "/default.jpg",
                                                    tagline: "No tagline available",
                                                };
                                            return (
                                                <div
                                                    key={expert.expertId}
                                                    className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-primary hover:shadow-md transition-shadow w-full md:w-[80%] mx-auto"
                                                >
                                                    <button
                                                        onClick={() => openLightbox(profile.photo || profile.profilePhoto || "/default.jpg")}
                                                        className="relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#36013F]"
                                                    >
                                                        <Image
                                                            src={profile.photo || profile.profilePhoto || "/default.jpg"}
                                                            alt={`${expert.expertName || "Expert"}'s profile photo`}
                                                            fill
                                                            sizes="56px"
                                                            className="object-cover object-center"
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
                    <Link href="/aaq" className="text-[#36013F] font-semibold hover:underline">
                        View all Questions
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}
