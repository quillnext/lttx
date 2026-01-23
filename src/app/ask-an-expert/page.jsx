
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFirestore, collection, getDocs, query, limit, startAfter, where, documentId } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { FaSearch, FaPlane, FaTimes, FaMapMarkerAlt, FaStar, FaFilter, FaRupeeSign, FaSuitcase, FaPassport, FaCheckCircle, FaUserTie, FaBuilding, FaArrowRight, FaCommentDots, FaRegidCard } from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";
import AskQuestionModal from "@/app/components/AskQuestionModal";
import SearchLayout from "./SearchLayout";
import { motion, AnimatePresence } from "framer-motion";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { toast } from "react-toastify";

const db = getFirestore(app);

// Skeleton Component for better UX during AI Search
const SearchSkeleton = () => (
  <div className="w-full space-y-8 animate-pulse max-w-7xl mx-auto px-4">
    {/* Progress Bar Container */}
    <div className="w-full max-w-2xl mx-auto mb-8 text-center space-y-2">
      <span className="text-[#36013F] text-sm font-medium">Finding the best experts for you...</span>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#36013F] w-1/3 animate-progress-bar"></div>
      </div>
    </div>

    {/* 1. Query Summary Skeleton */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-12 bg-gray-200 rounded-full w-full md:w-1/2 mt-4"></div>
      </div>
      <div className="flex flex-col gap-4 pl-0 md:pl-10">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100"></div>
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* 2. Expert Grid Skeleton */}
    <div className="bg-[#36013F] p-8 md:p-10 rounded-2xl opacity-90">
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 bg-white/20 rounded w-1/3"></div>
        <div className="h-6 bg-white/20 rounded w-1/6"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl p-5 h-[180px] flex flex-row relative overflow-hidden gap-4">
            <div className="w-32 bg-gray-200 rounded-xl h-full flex-shrink-0"></div>
            <div className="flex-1 space-y-3 py-2">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-50 rounded-xl mt-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function ExpertsDirectory() {
  const [experts, setExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [modalExpert, setModalExpert] = useState(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiContext, setAiContext] = useState(null);

  const [searchId, setSearchId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Capture search query from URL
  const searchQuery = useMemo(() => {
    return searchParams.get("search") || searchParams.get("keywords") || searchParams.get("question") || "";
  }, [searchParams]);

  const getYears = (yearsStr) => {
    if (!yearsStr || typeof yearsStr !== 'string') return "0+";
    const match = yearsStr.match(/\d+\+?/);
    return match ? match[0] : "0+";
  };

  const toSentenceCase = (input) => {
    if (!input) return "";
    if (Array.isArray(input)) {
      return input.map(item => toSentenceCase(item)).join(", ");
    }
    if (typeof input !== "string") return "";
    return input
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const calculateTotalExperience = (experience) => {
    if (!Array.isArray(experience) || experience.length === 0) return "0+";
    const today = new Date();
    let earliestStart = null, latestEnd = null;
    experience.forEach(exp => {
      const startDate = exp.startDate ? new Date(exp.startDate) : null;
      const endDate = exp.endDate === "Present" ? today : exp.endDate ? new Date(exp.endDate) : null;
      if (startDate && (!earliestStart || startDate < earliestStart)) earliestStart = startDate;
      if (endDate && (!latestEnd || endDate > latestEnd)) latestEnd = endDate;
    });
    if (!earliestStart || !latestEnd || latestEnd < earliestStart) return "0+";
    const totalMonths = (latestEnd.getFullYear() - earliestStart.getFullYear()) * 12 + (latestEnd.getMonth() - earliestStart.getMonth());
    const years = Math.floor(totalMonths / 12);
    return `${years}+`;
  };

  const formatPricing = (pricing) => {
    if (!pricing) return "799";
    const numeric = pricing.match(/\d+(\.\d+)?/)?.[0] || "799";
    return `${numeric}`;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/ask-an-expert?search=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push("/ask-an-expert");
    }
  };

  const openLightbox = (imageSrc) => {
    setSelectedImage(imageSrc);
    setIsLightboxOpen(true);
  };

  const formatDocData = (doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      fullName: toSentenceCase(data.fullName),
      tagline: toSentenceCase(data.tagline),
      languages: Array.isArray(data.languages) ? data.languages : [],
      location: toSentenceCase(data.location),
      expertise: Array.isArray(data.expertise) ? data.expertise.map(toSentenceCase) : [],
      pricing: data.pricing,
      responseTime: data.responseTime,
      username: data.username,
      photo: data.photo,
      about: toSentenceCase(data.about),
      certifications: toSentenceCase(data.certifications),
      services: Array.isArray(data.services) ? data.services.map(toSentenceCase) : [],
      regions: Array.isArray(data.regions) ? data.regions.map(toSentenceCase) : [],
      experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
        ...exp,
        company: toSentenceCase(exp.company),
        title: toSentenceCase(exp.title),
      })) : [],
      email: data.email || "",
      profileType: data.profileType || 'expert',
      yearsActive: data.yearsActive || '',
    };
  };

  const performAiSearch = async (queryText) => {
    setIsAiSearching(true);
    setLoading(true);
    setExperts([]);
    setFilteredExperts([]);
    setAiContext(null);
    setHasMore(false);

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, action: 'initial' })
      });

      // Handle serverless timeouts (504) or bad gateway (502)
      if (!response.ok) {
        let errorMessage = "Search failed";
        try {
          const err = await response.json();
          errorMessage = err.details || err.error || errorMessage;
        } catch (e) {
          // If response is not JSON (e.g., Vercel's timeout HTML page)
          if (response.status === 504) errorMessage = "Search timed out. Showing all experts instead.";
          else errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }


      const result = await response.json();
      const { matches, context, searchId: newSearchId } = result;

      if (newSearchId) setSearchId(newSearchId);

      if (matches && matches.length > 0) {
        const expertIds = matches.map(m => m.id);
        const chunks = [];
        for (let i = 0; i < expertIds.length; i += 10) {
          chunks.push(expertIds.slice(i, i + 10));
        }

        let allAiExperts = [];
        for (const chunk of chunks) {
          if (chunk.length === 0) continue;
          const q = query(collection(db, "Profiles"), where(documentId(), "in", chunk));
          const querySnapshot = await getDocs(q);
          const chunkData = querySnapshot.docs.map(doc => formatDocData(doc));
          allAiExperts = [...allAiExperts, ...chunkData];
        }

        const sortedAiExperts = matches
          .map(match => {
            const profile = allAiExperts.find(e => e.id === match.id);
            if (!profile) return null;
            return {
              ...profile,
              matchScore: match.score,
              aiMatchReason: match.reason
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.matchScore - a.matchScore);

        setExperts(sortedAiExperts);
        setFilteredExperts(sortedAiExperts);
        setAiContext(context);
      } else {
        setExperts([]);
        setFilteredExperts([]);
        setAiContext(null);
      }

    } catch (error) {
      console.error("Search Error:", error.message);
      toast.error(error.message);
      fetchExperts(true); // Fallback to standard directory view
    } finally {
      setIsAiSearching(false);
      setLoading(false);
    }
  };

  const loadSectionData = async (sectionType) => {
    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, action: 'section', sectionType })
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error(`Error loading ${sectionType}:`, error);
      return null;
    }
  };

  const fetchExperts = async (isReset = false) => {
    if (searchQuery && !isReset) return;

    if (loading || (!hasMore && !isReset)) return;

    setLoading(true);
    try {
      let q;
      if (isReset) {
        q = query(collection(db, "Profiles"), where("isPublic", "==", true), limit(30));
        setExperts([]);
        setLastDoc(null);
      } else {
        q = query(collection(db, "Profiles"), where("isPublic", "==", true), limit(30), startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const expertsData = querySnapshot.docs.map(formatDocData);

      if (isReset) {
        setExperts(expertsData);
        setFilteredExperts(expertsData);
      } else {
        setExperts(prev => {
          const newExperts = [...prev, ...expertsData];
          const seen = new Set();
          return newExperts.filter(e => {
            const duplicate = seen.has(e.id);
            seen.add(e.id);
            return !duplicate;
          });
        });
        setFilteredExperts(prev => {
          const newExperts = [...prev, ...expertsData];
          const seen = new Set();
          return newExperts.filter(e => {
            const duplicate = seen.has(e.id);
            seen.add(e.id);
            return !duplicate;
          });
        });
      }

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === 9);
    } catch (error) {
      console.error("Error fetching experts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchTerm(searchQuery);

    if (searchQuery) {
      performAiSearch(searchQuery);
    } else {
      setAiContext(null);
      fetchExperts(true);
    }
  }, [searchQuery]);

  useEffect(() => {
    let result = experts;

    if (languageFilter || locationFilter || specializationFilter) {
      result = result.filter(expert => {
        const matchesLanguage = languageFilter
          ? expert.languages?.some(lang => lang.toLowerCase().includes(languageFilter.toLowerCase()))
          : true;
        const matchesLocation = locationFilter
          ? expert.location?.toLowerCase().includes(locationFilter.toLowerCase())
          : true;
        const matchesSpecialization = specializationFilter
          ? expert.expertise?.some(exp => exp.toLowerCase().includes(specializationFilter.toLowerCase()))
          : true;

        return matchesLanguage && matchesLocation && matchesSpecialization;
      });
    }

    setFilteredExperts(result);
  }, [languageFilter, locationFilter, specializationFilter, experts]);

  const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages || []))].map(toSentenceCase);
  const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean).map(toSentenceCase);
  const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))].map(toSentenceCase);

  const truncateTagline = (tagline) => {
    if (!tagline) return "";
    return tagline.length > 70 ? `${tagline.substring(0, 70)}...` : tagline;
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setLanguageFilter("");
    setLocationFilter("");
    setSpecializationFilter("");
    setAiContext(null);
    router.push("/ask-an-expert");
    fetchExperts(true);
  };

  useEffect(() => {
    if (searchQuery) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) fetchExperts();
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    observerRef.current = observer;
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loading, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-4 lg:px-2 mt-16">
      {modalExpert && (
        <AskQuestionModal
          expert={modalExpert}
          onClose={() => setModalExpert(null)}
          initialQuestion={searchQuery}
          sessionId={searchId}
        />
      )}
      {isLightboxOpen && (
        <Lightbox
          mainSrc={selectedImage}
          onCloseRequest={() => setIsLightboxOpen(false)}
          imageTitle={selectedImage.includes("default.jpg") ? "Default Profile Image" : "Expert Profile Image"}
        />
      )}
      <div className="max-w-7xl mx-auto mt-5">

        {/* Header */}
        {!aiContext && !isAiSearching && (
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-3xl font-bold text-[#36013F] mb-3 tracking-tight">
              Real Experts. Real Answers. For Your Real Travel Plans.
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-sm">
              Get answers from a trusted circle of verified travel experts across every domain from visas to vacations.
            </p>
          </div>
        )}

        {/* Search & Filter Bar - Non Sticky */}
        <div className="mb-8 bg-gray-50 py-2 relative">
          <div className="relative flex items-center gap-2 mb-4 max-w-3xl mx-auto">
            <div className="relative w-full shadow-sm rounded-full group focus-within:shadow-md transition-shadow">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#36013F]">
                <FaSearch />
              </div>
              <form onSubmit={handleSearchSubmit} className="flex w-full">
                <input
                  type="text"
                  placeholder="Where do you want to go? (e.g., Dubai Visa, Bali Honeymoon)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-32 py-4 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:border-[#36013F] transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#36013F] text-white px-6 rounded-full hover:bg-[#4a0150] transition-colors text-sm font-semibold flex items-center gap-2"
                >
                  <Image src="/favicon.svg" alt="xmytravel search" width={25} height={25} />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </form>
            </div>
          </div>

          {!aiContext && !isAiSearching && (
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {[
                { val: languageFilter, set: setLanguageFilter, opts: uniqueLanguages, ph: "Language" },
                { val: locationFilter, set: setLocationFilter, opts: uniqueLocations, ph: "Location" },
                { val: specializationFilter, set: setSpecializationFilter, opts: uniqueSpecializations, ph: "Expertise" }
              ].map((filter, idx) => (
                <div key={idx} className="relative group">
                  <select
                    value={filter.val}
                    onChange={(e) => filter.set(e.target.value)}
                    className="appearance-none bg-white pl-4 pr-10 py-2.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-full focus:outline-none focus:border-[#36013F] hover:border-gray-300 shadow-sm cursor-pointer min-w-[120px]"
                  >
                    <option value="">{filter.ph}</option>
                    {filter.opts.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none" />
                </div>
              ))}

              {(languageFilter || locationFilter || specializationFilter) && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-all text-xs font-semibold"
                >
                  <FaTimes /> Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search Skeleton Loader */}
        {isAiSearching && <SearchSkeleton />}

        {/* Context Layout */}
        {!isAiSearching && aiContext && filteredExperts.length > 0 && (
          <SearchLayout

            experts={filteredExperts}
            context={aiContext}
            query={searchTerm}
            searchId={searchId}
            onBookClick={setModalExpert}
            openLightbox={(src) => openLightbox(src && src !== "" ? src : "/default.jpg")}
            loadSectionData={loadSectionData}
          />
        )}

        {/* Standard Directory Layout */}
        {!isAiSearching && !aiContext && (
          <>
            {filteredExperts.length === 0 && !loading && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 mx-auto max-w-lg">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
                  <FaSearch />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">No experts found</h3>
                <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or search term.</p>
                <button onClick={handleClearFilters} className="text-[#36013F] font-semibold text-sm hover:underline">Reset all filters</button>
              </div>
            )}

            {/* Grid Layout - Responsive: 1 col mobile, 2 col tablet, 3 col desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto px-2">
              <AnimatePresence>
                {filteredExperts.map((expert, index) => (
                  <motion.div
                    key={`expert-${expert.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {/* Revised Card Design - Horizontal Ticket Style with Left Accent */}
                    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-row gap-0 h-full min-h-[170px] border-l-4 border-l-[#36013F]">

                      {/* Left Section: Avatar & Verified */}
                      <div className="w-[85px] sm:w-[100px] flex flex-col items-center pt-5 pb-3 px-2 bg-gray-50/50 border-r border-gray-100 shrink-0">
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-2">
                          <Image
                            src={expert.photo || "/default.jpg"}
                            alt={expert.fullName}
                            fill
                            className="rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Verified Badge Icon */}
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm" title="Verified">
                            <FaCheckCircle className="text-blue-500 w-4 h-4" />
                          </div>
                        </div>

                        <div className="text-center mt-auto">
                          <span className="block text-sm font-bold text-[#36013F] leading-none">
                            {expert.profileType === 'agency' ? getYears(expert.yearsActive) : calculateTotalExperience(expert.experience)}
                          </span>
                          <span className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider">Years Exp</span>
                        </div>
                      </div>

                      {/* Right Section: Content */}
                      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                        {/* Header Info */}
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <h3 className="text-base font-bold text-gray-900 leading-tight truncate group-hover:text-[#36013F] transition-colors">
                                {expert.fullName}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${expert.profileType === 'agency' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                  {expert.profileType === 'agency' ? 'Agency' : 'Expert'}
                                </span>
                                <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                                  <FaMapMarkerAlt className="text-gray-400 w-3 h-3 shrink-0" />
                                  <span className="truncate max-w-[100px]">{toSentenceCase(expert.location) || "Global"}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Tagline */}
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                            {truncateTagline(expert.tagline || expert.about)}
                          </p>

                          {/* Expertise Pills */}
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {expert.expertise && expert.expertise.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md border border-gray-200 truncate max-w-[100px]">
                                {tag}
                              </span>
                            ))}
                            {expert.expertise && expert.expertise.length > 2 && (
                              <span className="text-[10px] px-1.5 py-0.5 text-gray-400 font-medium">+{expert.expertise.length - 2}</span>
                            )}
                          </div>
                        </div>

                        {/* Footer: Price & Action */}
                        <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex items-end justify-between gap-2">
                          <div>
                            <p className="text-[9px] text-gray-400 uppercase tracking-wide">Consultation</p>
                            <div className="flex items-center text-sm font-bold text-[#36013F]">
                              <FaRupeeSign className="w-2.5 h-2.5 mr-0.5" />
                              {formatPricing(expert.pricing)}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link href={expert.profileType === 'agency' ? `/agency/${expert.username}` : `/experts/${expert.username}`}>
                              <button className="px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-[#36013F] transition-colors">
                                View
                              </button>
                            </Link>
                            <button
                              onClick={() => setModalExpert(expert)}
                              className="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#36013F] to-[#5a1066] rounded-lg shadow-sm hover:shadow-md hover:to-[#36013F] transition-all flex items-center gap-1.5"
                            >
                              {expert.profileType === 'agency' ? 'Quote' : 'Ask'}
                              <FaArrowRight className="w-2 h-2 opacity-80" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {hasMore && !searchQuery && (
              <div ref={loadMoreRef} className="h-20 flex justify-center items-center mt-4">
                {loading && (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <div className="animate-spin h-6 w-6 border-2 border-[#36013F] border-t-transparent rounded-full"></div>
                    <span className="text-xs font-medium">Loading more experts...</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
