"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import AskQuestionModal from "@/app/components/AskQuestionModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import slugify from "slugify";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/pages/Footer";

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

    // Enhanced filtering to prioritize exact or near-exact question matches
    const filteredQuestions = searchTerm
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
            .sort((a, b) => b.score - a.score || b.rawTimestamp - a.rawTimestamp) // Sort by score, then recency
        : [];

    const featuredQuestion = filteredQuestions.length > 0 ? filteredQuestions[0] : null;
    const allQuestions = featuredQuestion
        ? filteredQuestions.filter((q) => q.id !== featuredQuestion.id)
        : filteredQuestions;

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
            router.push(`/aaq/${slug}`);
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

                {featuredQuestion ? (
                    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="p-5">
                            <h1 className="text-3xl text-gray-700 mb-4">{featuredQuestion.question}</h1>
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
                        ) : allQuestions.length === 0 && filteredQuestions.length > 0 ? (
                            <div className="text-center bg-white p-8 rounded-lg shadow-sm border">
                                <p className="text-lg font-medium text-gray-700">No additional questions found.</p>
                                <p className="text-gray-500">The featured question above is the only match.</p>
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
                    <Link href="/aaq" className="text-[#36013F] font-semibold hover:underline">
                        View all Questions
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}
