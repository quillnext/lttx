
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFirestore, collection, getDocs, query, limit, startAfter, where, documentId } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { FaSearch, FaPlane, FaCompass, FaTimes, FaMapMarkerAlt, FaRupeeSign } from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";
import AskQuestionModal from "@/app/components/AskQuestionModal";
import SearchLayout from "./SearchLayout";
import { motion, AnimatePresence } from "framer-motion";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";

const db = getFirestore(app);

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
  const [aiContext, setAiContext] = useState(null); // New state for search metadata
  const [hasMore, setHasMore] = useState(true);
  const [visibleCards, setVisibleCards] = useState({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const cardRefs = useRef({});

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
    if (!pricing) return "799/session";
    const numeric = pricing.match(/\d+(\.\d+)?/)?.[0] || "799";
    return `${numeric}/session`;
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
        body: JSON.stringify({ query: queryText })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.details || err.error || 'Search failed');
      }
      
      const { matches, context } = await response.json();

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

        // Merge search metadata (score/reason) and sort
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
      // Fallback to standard fetching if semantic search fails
      fetchExperts(true); 
    } finally {
      setIsAiSearching(false);
      setLoading(false);
    }
  };

  const fetchExperts = async (isReset = false) => {
    if (searchQuery && !isReset) return; 

    if (loading || (!hasMore && !isReset)) return;
    
    setLoading(true);
    try {
      let q;
      if (isReset) {
        q = query(collection(db, "Profiles"), where("isPublic", "==", true), limit(9));
        setExperts([]); 
        setLastDoc(null);
      } else {
        q = query(collection(db, "Profiles"), where("isPublic", "==", true), limit(9), startAfter(lastDoc));
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
    setVisibleCards({});
  }, [languageFilter, locationFilter, specializationFilter, experts]);

  const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages || []))].map(toSentenceCase);
  const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean).map(toSentenceCase);
  const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))].map(toSentenceCase);

  const truncateTagline = (tagline) => {
    if (!tagline) return "";
    return tagline.length > 150 ? `${tagline.substring(0, 130)}...` : tagline;
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.dataset.id;
          setVisibleCards((prev) => ({
            ...prev,
            [id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1 }
    );

    Object.values(cardRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [filteredExperts]);

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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-16">
      {modalExpert && (
        <AskQuestionModal
          expert={modalExpert}
          onClose={() => setModalExpert(null)}
          initialQuestion={searchQuery}
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
        {!aiContext && (
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 text-center">
                Real Experts. Real Answers.
                </h1>
                <p className="text-center text-muted-foreground mb-4 text-sm sm:text-base">
                Get answers from a trusted circle of verified travel experts across every domain.
                </p>
            </div>
        )}

        <div className="mb-6">
          <div className="relative flex items-center gap-2 mb-4">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm" />
            <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
              <input
                type="text"
                placeholder="Search queries (e.g., family trip to dubai, visa for usa)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-3 text-sm border border-input rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="bg-[#36013F] text-white py-2 px-6 rounded-full hover:bg-opacity-90 transition-all text-sm flex items-center gap-2 whitespace-nowrap"
              >
                <FaPlane className="text-yellow-400 rotate-315" />
                <span className="hidden sm:inline">Find Experts</span>
              </button>
            </form>
          </div>

          {!aiContext && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="flex-1 relative">
                <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                    <option value="">Language</option>
                    {uniqueLanguages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                    ))}
                </select>
                </div>
                <div className="flex-1 relative">
                <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                    <option value="">Location</option>
                    {uniqueLocations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                    ))}
                </select>
                </div>
                <div className="flex-1 relative">
                <select
                    value={specializationFilter}
                    onChange={(e) => setSpecializationFilter(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                    <option value="">Expertise</option>
                    {uniqueSpecializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                    ))}
                </select>
                </div>
                <div className="flex-1 flex items-center">
                <button
                    onClick={handleClearFilters}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-xs font-semibold"
                >
                    <FaTimes />
                    Reset
                </button>
                </div>
            </div>
          )}
        </div>

        {/* Search Loading */}
        {isAiSearching && (
            <div className="flex flex-col justify-center items-center py-12 gap-4">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#36013F] border-t-transparent"></div>
                    <FaCompass className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#36013F] w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[#36013F] font-medium animate-pulse text-lg">
                    Curating your personal list of experts...
                </span>
            </div>
        )}

        {/* Context Layout */}
        {!isAiSearching && aiContext && filteredExperts.length > 0 && (
            <SearchLayout 
                experts={filteredExperts} 
                context={aiContext} 
                query={searchTerm}
                onBookClick={setModalExpert}
                openLightbox={(src) => openLightbox(src && src !== "" ? src : "/default.jpg")}
            />
        )}

        {/* Standard Directory Layout (Fallback or No Search) */}
        {!isAiSearching && !aiContext && (
            <>
                {filteredExperts.length === 0 && (
                <div className="text-center text-muted-foreground py-12 text-sm bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-lg text-gray-600 mb-2">No experts found matching your criteria.</p>
                    <button onClick={handleClearFilters} className="text-primary hover:underline">Clear filters and try again</button>
                </div>
                )}

                {/* Desktop View */}
                <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                <AnimatePresence>
                    {filteredExperts.map((expert, index) => (
                    <motion.div
                        key={`desktop-expert-${expert.id}`}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="rounded-2xl shadow-md p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 bg-white group hover:-translate-y-1"
                    >
                        <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => openLightbox(expert.photo && expert.photo !== "" ? expert.photo : "/default.jpg")}
                            className="relative w-[70px] h-[70px] shrink-0 overflow-hidden rounded-full border-2 border-[#F4D35E] shadow-sm group-hover:border-[#36013F] transition-colors"
                        >
                            <Image
                            src={expert.photo && expert.photo !== "" ? expert.photo : "/default.jpg"}
                            alt={expert.fullName || "Expert Profile"}
                            fill
                            sizes="70px"
                            className="object-cover object-center rounded-full"
                            priority={false}
                            />
                        </button>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-lg font-bold text-gray-900 truncate">
                                {expert.fullName || "Unknown Expert"}
                            </h2>
                            <span className={`capitalize text-[10px] font-bold px-2 py-0.5 rounded-full border ${expert.profileType === 'agency' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                {expert.profileType}
                            </span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {truncateTagline(expert.tagline) || "No tagline provided"}
                            </p>
                        </div>
                        </div>
                        
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mb-4">
                            <div className="text-center px-2 border-r border-gray-200 w-1/2">
                                <span className="block text-xs text-gray-500 uppercase tracking-wide">Experience</span>
                                <span className="block font-bold text-gray-900">
                                    {expert.profileType === 'agency' ? getYears(expert.yearsActive) : (calculateTotalExperience(expert.experience) || "0+")} Yrs
                                </span>
                            </div>
                            <div className="text-center px-2 w-1/2">
                                <span className="block text-xs text-gray-500 uppercase tracking-wide">Rate</span>
                                <span className="block font-bold text-gray-900 flex items-center justify-center gap-1">
                                    <FaRupeeSign size={10}/> {formatPricing(expert.pricing).split('/')[0]}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-4">
                        <div className="flex flex-wrap gap-1.5 h-14 overflow-hidden">
                            {expert.expertise?.slice(0, 5).map((expertise) => (
                            <span
                                key={expertise}
                                className="bg-gray-100 text-gray-700 border border-gray-200 text-xs px-2 py-1 rounded-md"
                            >
                                {expertise}
                            </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <FaMapMarkerAlt className="text-[#36013F]" />
                            <span className="truncate">{expert.location || "Location N/A"}</span>
                        </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <Link href={expert.profileType === 'agency' ? `/agency/${expert.username}` : `/experts/${expert.username}`} className="flex-1">
                            <button className="w-full border border-[#36013F] text-[#36013F] py-2 rounded-xl hover:bg-[#36013F] hover:text-white transition-all text-sm font-medium">
                            View Profile
                            </button>
                        </Link>
                        <button
                            onClick={() => setModalExpert(expert)}
                            className="flex-1 bg-[#F4D35E] text-[#36013F] py-2 rounded-xl hover:bg-[#e0c040] transition-all text-sm font-bold shadow-sm"
                        >
                            {expert.profileType === 'agency' ? 'Get Quote' : 'Ask Query'}
                        </button>
                        </div>
                    </motion.div>
                    ))}
                </AnimatePresence>
                </div>

                {/* Mobile View */}
                <div className="sm:hidden space-y-4 max-w-7xl mx-auto">
                <AnimatePresence>
                    {filteredExperts.map((expert, index) => (
                    <motion.aside
                        key={`mobile-expert-${expert.id}`}
                        ref={(el) => (cardRefs.current[expert.id] = el)}
                        data-id={expert.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={visibleCards[expert.id] ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="space-y-4"
                    >
                        <div
                        className={`${
                            expert.profileType === 'agency' ? 'animate-gradientShift2' : 'animate-gradientShift'
                        } text-primary-foreground rounded-3xl shadow-lg p-6 text-center relative overflow-hidden`}
                        >
                        <div className="absolute top-0 right-0 bg-white/10 w-24 h-24 rounded-bl-full z-0"></div>
                        <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">
                            {expert.profileType === 'agency' ? 'Agency' : 'Expert'}
                        </span>
                        
                        <div className="mb-4 relative z-10 mt-4">
                            <button
                            onClick={() => openLightbox(expert.photo && expert.photo !== "" ? expert.photo : "/default.jpg")}
                            className="w-24 h-24 rounded-full border-4 border-white/30 object-cover mx-auto shadow-xl overflow-hidden"
                            >
                            <Image
                                src={expert.photo && expert.photo !== "" ? expert.photo : "/default.jpg"}
                                alt={expert.fullName || "Expert Profile"}
                                width={96}
                                height={96}
                                className="rounded-full object-cover mx-auto"
                                priority={false}
                            />
                            </button>
                        </div>

                        <h1 className="text-xl font-bold font-serif relative z-10">
                            {expert.fullName || "Unknown Expert"}
                        </h1>
                        <p className="text-xs opacity-90 mt-1 relative z-10 mb-3 line-clamp-2 px-4">
                            {truncateTagline(expert.tagline)}
                        </p>

                        <div className="flex justify-center gap-4 my-4 relative z-10">
                            <div className="text-center">
                                <p className="text-lg font-bold leading-none">{expert.profileType === 'agency' ? getYears(expert.yearsActive) : (calculateTotalExperience(expert.experience) || "0+")}</p>
                                <p className="text-[10px] opacity-75 uppercase">Years Exp</p>
                            </div>
                            <div className="w-px bg-white/30"></div>
                            <div className="text-center">
                                <p className="text-lg font-bold leading-none flex items-center gap-0.5"><FaRupeeSign size={12}/>{formatPricing(expert.pricing).split('/')[0]}</p>
                                <p className="text-[10px] opacity-75 uppercase">Per Session</p>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4 relative z-10">
                            <Link href={expert.profileType === 'agency' ? `/agency/${expert.username}` : `/experts/${expert.username}`} className="flex-1">
                            <button className="w-full bg-white/20 backdrop-blur-sm border border-white/40 text-white py-2.5 rounded-xl hover:bg-white/30 transition-all text-sm font-semibold">
                                View Profile
                            </button>
                            </Link>
                            <button
                            onClick={() => setModalExpert(expert)}
                            className="flex-1 bg-white text-[#36013F] py-2.5 rounded-xl hover:bg-opacity-90 transition-all text-sm font-bold shadow-md"
                            >
                            {expert.profileType === 'agency' ? 'Get Quote' : 'Ask Query'}
                            </button>
                        </div>
                        </div>
                    </motion.aside>
                    ))}
                </AnimatePresence>
                </div>

                {hasMore && !searchQuery && (
                <div ref={loadMoreRef} className="h-10 flex justify-center items-center mt-8">
                    {loading && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                            Loading more...
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
