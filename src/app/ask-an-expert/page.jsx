"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFirestore, collection, getDocs, query, limit, startAfter } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaTimes, FaLanguage, FaCheckCircle } from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";
import AskQuestionModal from "@/app/components/AskQuestionModal";
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
  const [modalExpert, setModalExpert] = useState(null); // Initially null, will be set to open modal
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [visibleCards, setVisibleCards] = useState({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  const cardRefs = useRef({});

  const keywords = useMemo(() => {
    return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
  }, [searchParams]);

  const initialQuestion = useMemo(() => {
    return searchParams.get("question") || "";
  }, [searchParams]);

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

  const normalizeText = (text) => {
    if (!text || typeof text !== "string") return "";
    const stopWords = ["i", "and", "or", "but", "a", "an", "the", "in", "to", "for", "with", "guidance", "estimate", "months"];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .split(" ")
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .join(" ")
      .trim();
  };

  const synonyms = {
    flights: ["air travel", "airline", "flight booking"],
    budget: ["cost-effective", "affordable", "cheap"],
    family: ["family travel", "group travel"],
    cost: ["price", "pricing", "budget"],
    india: ["south asia", "indian subcontinent"],
  };

  const getSynonymTerms = (term) => {
    return [term, ...(synonyms[term] || [])];
  };

  const calculateSimilarityScore = (searchTerms, expert) => {
    if (!searchTerms || !Array.isArray(searchTerms) || searchTerms.length === 0) return 0;

    const weights = {
      expertise: 2.0,
      services: 2.0,
      regions: 1.5,
      location: 1.0,
      languages: 0.5,
      about: 0.5,
      certifications: 0.5,
    };

    const searchableFields = {
      expertise: expert.expertise?.map(normalizeText).join(" ") || "",
      services: expert.services?.map(normalizeText).join(" ") || "",
      regions: expert.regions?.map(normalizeText).join(" ") || "",
      location: normalizeText(expert.location) || "",
      languages: expert.languages?.map(normalizeText).join(" ") || "",
      about: normalizeText(expert.about) || "",
      certifications: normalizeText(expert.certifications) || "",
    };

    let totalScore = 0;
    let totalPossibleScore = 0;

    searchTerms.forEach(term => {
      const termsToCheck = getSynonymTerms(term);
      Object.entries(searchableFields).forEach(([field, value]) => {
        const weight = weights[field] || 0.5;
        totalPossibleScore += weight;
        if (termsToCheck.some(synonym => value.includes(synonym))) {
          totalScore += weight;
        }
      });
    });

    const score = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;
    console.log(`Similarity score for ${expert.fullName}: ${score}%`); // Debugging
    return score;
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const formattedKeywords = normalizeText(searchTerm)
        .split(" ")
        .filter(Boolean)
        .join(",");
      router.push(`/ask-an-expert?keywords=${encodeURIComponent(formattedKeywords)}`);
    } else {
      router.push("/ask-an-expert");
    }
  };

  const openLightbox = (imageSrc) => {
    setSelectedImage(imageSrc);
    setIsLightboxOpen(true);
  };

  // Open modal with the first expert or a placeholder on component mount
  useEffect(() => {
    if (experts.length > 0) {
      setModalExpert(experts[0]); // Open modal with the first expert
    } else {
      // Placeholder expert object if no experts are loaded yet
      setModalExpert({
        fullName: "Select an Expert",
        username: "",
        photo: "/default.jpg",
      });
    }
  }, [experts]);

  useEffect(() => {
    if (keywords.length > 0) {
      setSearchTerm(keywords.join(" "));
    } else {
      setSearchTerm("");
    }
    console.log("Keywords from URL:", keywords); // Debugging
  }, [keywords]);

  const fetchExperts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const profilesQuery = lastDoc
        ? query(collection(db, "Profiles"), limit(9), startAfter(lastDoc))
        : query(collection(db, "Profiles"), limit(9));
      const querySnapshot = await getDocs(profilesQuery);
      const expertsData = querySnapshot.docs.map((doc) => {
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
        };
      });

      const uniqueExpertsData = expertsData.filter(
        newExpert => !experts.some(existingExpert => existingExpert.id === newExpert.id)
      );

      setExperts(prev => [...prev, ...uniqueExpertsData]);
      setFilteredExperts(prev => {
        const combined = [...prev, ...uniqueExpertsData];
        const seenIds = new Set();
        return combined.filter(expert => {
          if (seenIds.has(expert.id)) return false;
          seenIds.add(expert.id);
          return true;
        });
      });
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === 9);
      console.log("Fetched experts:", expertsData); // Debugging
    } catch (error) {
      console.error("Error fetching experts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  useEffect(() => {
    let result = experts;

    if (searchTerm || languageFilter || locationFilter || specializationFilter) {
      const searchTerms = normalizeText(searchTerm)
        .split(" ")
        .filter(term => term);
      console.log("Search terms:", searchTerms); // Debugging

      result = result
        .map(expert => {
          const similarityScore = calculateSimilarityScore(searchTerms, expert);
          const matchesLanguage = languageFilter
            ? expert.languages?.some(lang => normalizeText(lang).includes(normalizeText(languageFilter)))
            : true;
          const matchesLocation = locationFilter
            ? normalizeText(expert.location).includes(normalizeText(locationFilter))
            : true;
          const matchesSpecialization = specializationFilter
            ? expert.expertise?.some(exp => normalizeText(exp).includes(normalizeText(specializationFilter)))
            : true;

          return { expert, similarityScore, matchesFilters: matchesLanguage && matchesLocation && matchesSpecialization };
        })
        .filter(({ expert, similarityScore, matchesFilters }) => {
          const passes = matchesFilters && (searchTerms.length === 0 || similarityScore >= 10);
          console.log(`Expert ${expert.fullName} passes: ${passes}, Score: ${similarityScore}%`); // Fixed ReferenceError
          return passes;
        })
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .map(({ expert }) => expert)
        .slice(0, 6); // Limit to 6 experts when search is active
    }

    const seenIds = new Set();
    const uniqueFilteredExperts = result.filter(expert => {
      if (seenIds.has(expert.id)) return false;
      seenIds.add(expert.id);
      return true;
    });

    setFilteredExperts(uniqueFilteredExperts);
    console.log("Filtered experts:", uniqueFilteredExperts); // Debugging
    setVisibleCards({});
  }, [searchTerm, languageFilter, locationFilter, specializationFilter, experts]);

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
    router.push("/ask-an-expert");
    setVisibleCards({});
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
  }, [hasMore, loading]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-16">
      {modalExpert && (
        <AskQuestionModal
          expert={modalExpert}
          onClose={() => setModalExpert(null)}
          initialQuestion={initialQuestion}
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
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 text-center">
          Real Experts. Real Answers. For Your Real Travel Plans.
        </h1>
        <p className="text-center text-muted-foreground mb-4 text-sm sm:text-base">
          Get answers from a trusted circle of verified travel experts across every domain from visas to vacations.
        </p>

        <div className="mb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            <div className="flex-1 relative">
              <FaGlobe className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs hidden md:block" />
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full pl-7 pr-1 py-1 text-xs border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Language</option>
                {uniqueLanguages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 relative">
              <FaMapMarkerAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs hidden md:block" />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-7 pr-1 py-1 text-xs border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Location</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 relative">
              <FaUserTag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs hidden md:block" />
              <select
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="w-full pl-7 pr-1 py-1 text-xs border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full flex items-center justify-center gap-5 px-2 py-1 animate-gradientShift text-primary-foreground rounded-full hover:bg-opacity-90 transition-all text-xs"
              >
                <FaTimes />
                Clear
              </button>
            </div>
          </div>

          <div className="relative flex items-center gap-2">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm" />
            <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
              <input
                type="text"
                placeholder="Search keywords (e.g., family india flights)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="animate-gradientShift text-primary-foreground py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all text-sm"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {filteredExperts.length === 0 && (
          <div className="text-center text-muted-foreground py-8 text-sm">
            <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Desktop View */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
          <AnimatePresence>
            {filteredExperts.map((expert, index) => (
              <motion.div
                key={`desktop-expert-${expert.id}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="rounded-xl shadow-lg p-4 border border-input hover:shadow-xl transition-shadow bg-card"
              >
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => openLightbox(expert.photo && expert.photo !== "" ? expert.photo : "/default.jpg")}
                    className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-primary shadow-sm"
                  >
                    <Image
                      src={expert.photo && expert.photo !== "" ? expert.photo : "/default.jpg"}
                      alt={expert.fullName || "Expert Profile"}
                      fill
                      sizes="60px"
                      className="object-cover object-center rounded-full"
                      priority={false}
                    />
                  </button>
                  <div className="flex-1">
                    <h2 className="text-base font-semibold text-card-foreground">
                      {expert.fullName || "Unknown Expert"}
                    </h2>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {truncateTagline(expert.tagline) || "No tagline provided"}
                    </p>
                  </div>
                  <div className="flex justify-center items-center py-1 space-y-0.5">
                    <div className="text-secondary border-2 border-secondary rounded-lg px-2 w-[48px] flex flex-col items-center py-1">
                      <h1 className="font-bold text-center text-base text-secondary-foreground">
                        {calculateTotalExperience(expert.experience) || "0+"}
                      </h1>
                      <span className="font-semibold text-xs text-center text-secondary-foreground">YEARS</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {expert.expertise?.map((expertise) => (
                      <span
                        key={expertise}
                        className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full"
                      >
                        {expertise}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <p className="flex items-center gap-1.5">
                      <FaRupeeSign className="text-primary" />
                      {formatPricing(expert.pricing)}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FaLanguage className="text-primary" />
                      {toSentenceCase(expert.languages) || "English, Hindi"}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FaMapMarkerAlt className="text-primary" />
                      {expert.location || "Delhi, India"}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FaClock className="text-primary" />
                      {expert.responseTime || "10 mins"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/experts/${expert.username}`} className="flex-1">
                    <button className="w-full bg-primary text-primary-foreground py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
                      View Profile
                    </button>
                  </Link>
                  <button
                    onClick={() => setModalExpert(expert)}
                    className="flex-1 bg-secondary text-secondary-foreground py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
                  >
                    Ask Question
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
                <div className="animate-gradientShift bg-black/30 rounded-3xl shadow-lg p-6 text-center relative">
                  <div className="mb-4 relative">
                    <button
                      onClick={() => openLightbox(expert.photo && expert.photo !== "" ? expert.photo : "/default.jpg")}
                      className="w-28 h-28 rounded-full border-4 border-secondary object-cover mx-auto shadow-md overflow-hidden"
                    >
                      <Image
                        src={expert.photo && expert.photo !== "" ? expert.photo : "/default.jpg"}
                        alt={expert.fullName || "Expert Profile"}
                        width={112}
                        height={112}
                        className="rounded-full object-cover mx-auto shadow-md"
                        priority={false}
                      />
                    </button>
                    <div className="flex justify-center items-center py-1 absolute top-0 right-0 space-y-0.5">
                      <div className="text-secondary border-2 border-white rounded-lg px-2 w-[48px] flex flex-col items-center">
                        <h1 className="font-bold text-center text-base text-white">
                          {calculateTotalExperience(expert.experience) || "0+"}
                        </h1>
                        <span className="font-semibold text-xs text-center text-white">YEARS</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mt-1 text-primary-foreground">@{expert.username || "unknown"}</p>
                  <h1
                    className="text-xl font-semibold text-primary-foreground"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    {expert.fullName || "Unknown Expert"}
                  </h1>
                  {expert.title && (
                    <p className="text-sm mt-1 text-primary-foreground">{expert.title}</p>
                  )}
                  {expert.tagline && (
                    <p className="text-sm mt-1 text-primary-foreground">{truncateTagline(expert.tagline) || "No tagline provided"}</p>
                  )}
                  <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1 mt-2 rounded-full">
                    <FaCheckCircle className="w-4 h-4" />
                    Verified by Xmytravel
                  </span>
                  <div className="mt-4 text-sm text-left space-y-2 text-primary-foreground">
                    {expert.location && (
                      <p className="flex items-center gap-2">
                        <FaMapMarkerAlt className="w-4 h-4 text-secondary border border-secondary rounded-[50%]" />
                        {expert.location || "Delhi, India"}
                      </p>
                    )}
                    {expert.languages && (
                      <p className="flex items-center gap-2">
                        <FaLanguage className="w-4 h-4 text-secondary border border-secondary rounded-[50%]" />
                        Languages: {toSentenceCase(expert.languages) || "English, Hindi"}
                      </p>
                    )}
                    {expert.responseTime && (
                      <p className="flex items-center gap-2">
                        <FaClock className="w-4 h-4 text-secondary border border-secondary rounded-[50%]" />
                        {expert.responseTime || "10 mins"}
                      </p>
                    )}
                    {expert.pricing && (
                      <p className="flex items-center gap-2">
                        <FaRupeeSign className="w-4 h-4 text-secondary border border-secondary rounded-[50%]" />
                        {formatPricing(expert.pricing)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/experts/${expert.username}`} className="flex-1">
                      <button className="w-full bg-white text-primary py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
                        View Profile
                      </button>
                    </Link>
                    <button
                      onClick={() => setModalExpert(expert)}
                      className="flex-1 bg-secondary text-secondary-foreground py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
                    >
                      Ask Question
                    </button>
                  </div>
                </div>
              </motion.aside>
            ))}
          </AnimatePresence>
        </div>

        {hasMore && (
          <div ref={loadMoreRef} className="h-10 flex justify-center items-center mt-4">
            {loading && <p className="text-muted-foreground">Loading more experts...</p>}
          </div>
        )}
      </div>
    </div>
  );
}