
// // // // // // // // // "use client";

// // // // // // // // // import { useState, useEffect, useMemo } from "react";
// // // // // // // // // import Image from "next/image";
// // // // // // // // // import Link from "next/link";
// // // // // // // // // import { getFirestore, collection, getDocs } from "firebase/firestore";
// // // // // // // // // import { app } from "@/lib/firebase";
// // // // // // // // // import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaTimes, FaLanguage } from "react-icons/fa";
// // // // // // // // // import { useSearchParams, useRouter } from "next/navigation";
// // // // // // // // // import AskQuestionModal from "@/app/components/AskQuestionModal";
// // // // // // // // // import TinderCard from 'react-tinder-card';
// // // // // // // // // import { motion } from 'framer-motion';
// // // // // // // // // import Lightbox from 'react-image-lightbox'; // Import the lightbox library
// // // // // // // // // import 'react-image-lightbox/style.css'; // Import lightbox styles

// // // // // // // // // const db = getFirestore(app);

// // // // // // // // // export default function ExpertsDirectory() {
// // // // // // // // //   const [experts, setExperts] = useState([]);
// // // // // // // // //   const [filteredExperts, setFilteredExperts] = useState([]);
// // // // // // // // //   const [searchTerm, setSearchTerm] = useState("");
// // // // // // // // //   const [languageFilter, setLanguageFilter] = useState("");
// // // // // // // // //   const [locationFilter, setLocationFilter] = useState("");
// // // // // // // // //   const [specializationFilter, setSpecializationFilter] = useState("");
// // // // // // // // //   const [modalExpert, setModalExpert] = useState(null);
// // // // // // // // //   const [isLightboxOpen, setIsLightboxOpen] = useState(false); // State for lightbox
// // // // // // // // //   const [selectedImage, setSelectedImage] = useState(""); // State for selected image
// // // // // // // // //   const searchParams = useSearchParams();
// // // // // // // // //   const router = useRouter();

// // // // // // // // //   const keywords = useMemo(() => {
// // // // // // // // //     return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
// // // // // // // // //   }, [searchParams]);

// // // // // // // // //   const toSentenceCase = (input) => {
// // // // // // // // //     if (!input) return "";
// // // // // // // // //     if (Array.isArray(input)) {
// // // // // // // // //       return input.map(item => toSentenceCase(item)).join(", ");
// // // // // // // // //     }
// // // // // // // // //     if (typeof input !== "string") return "";
// // // // // // // // //     return input
// // // // // // // // //       .toLowerCase()
// // // // // // // // //       .split(" ")
// // // // // // // // //       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
// // // // // // // // //       .join(" ");
// // // // // // // // //   };

// // // // // // // // //   const calculateTotalExperience = (experience) => {
// // // // // // // // //     if (!Array.isArray(experience) || experience.length === 0) return "0+ years of experience";
// // // // // // // // //     const today = new Date();
// // // // // // // // //     let totalMonths = 0;

// // // // // // // // //     experience.forEach(exp => {
// // // // // // // // //       const startDate = exp.startDate ? new Date(exp.startDate) : null;
// // // // // // // // //       const endDate = exp.endDate === "Present" ? today : exp.endDate ? new Date(exp.endDate) : null;
// // // // // // // // //       if (startDate && endDate && endDate >= startDate) {
// // // // // // // // //         const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
// // // // // // // // //         totalMonths += months;
// // // // // // // // //       }
// // // // // // // // //     });

// // // // // // // // //     const years = Math.floor(totalMonths / 12);
// // // // // // // // //     return `${years}+`;
// // // // // // // // //   };

// // // // // // // // //   const formatPricing = (pricing) => {
// // // // // // // // //     if (!pricing) return "799/session";
// // // // // // // // //     const numeric = pricing.match(/\d+(\.\d+)?/)?.[0] || "799";
// // // // // // // // //     return `${numeric}/session`;
// // // // // // // // //   };

// // // // // // // // //   const normalizeText = (text) => {
// // // // // // // // //     if (!text || typeof text !== "string") return "";
// // // // // // // // //     return text
// // // // // // // // //       .toLowerCase()
// // // // // // // // //       .replace(/[^a-z0-9\s]/g, " ")
// // // // // // // // //       .replace(/\s+/g, " ")
// // // // // // // // //       .trim();
// // // // // // // // //   };

// // // // // // // // //   const handleSearchSubmit = (e) => {
// // // // // // // // //     e.preventDefault();
// // // // // // // // //     if (searchTerm.trim()) {
// // // // // // // // //       const formattedKeywords = normalizeText(searchTerm)
// // // // // // // // //         .split(" ")
// // // // // // // // //         .filter(Boolean)
// // // // // // // // //         .join(",");
// // // // // // // // //       router.push(`/ask-an-expert?keywords=${encodeURIComponent(formattedKeywords)}`);
// // // // // // // // //     } else {
// // // // // // // // //       router.push("/ask-an-expert");
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   const onSwipe = (direction, expertId) => {
// // // // // // // // //     setFilteredExperts(prev => prev.filter(expert => expert.id !== expertId));
// // // // // // // // //   };

// // // // // // // // //   // Open lightbox with the selected image
// // // // // // // // //   const openLightbox = (imageSrc) => {
// // // // // // // // //     setSelectedImage(imageSrc);
// // // // // // // // //     setIsLightboxOpen(true);
// // // // // // // // //   };

// // // // // // // // //   useEffect(() => {
// // // // // // // // //     if (keywords.length > 0) {
// // // // // // // // //       setSearchTerm(keywords.join(" "));
// // // // // // // // //     } else {
// // // // // // // // //       setSearchTerm("");
// // // // // // // // //     }
// // // // // // // // //   }, [keywords]);

// // // // // // // // //   useEffect(() => {
// // // // // // // // //     const fetchExperts = async () => {
// // // // // // // // //       try {
// // // // // // // // //         const querySnapshot = await getDocs(collection(db, "Profiles"));
// // // // // // // // //         const expertsData = querySnapshot.docs.map((doc) => {
// // // // // // // // //           const data = doc.data();
// // // // // // // // //           return {
// // // // // // // // //             id: doc.id,
// // // // // // // // //             fullName: toSentenceCase(data.fullName),
// // // // // // // // //             tagline: toSentenceCase(data.tagline),
// // // // // // // // //             languages: Array.isArray(data.languages) ? data.languages : [],
// // // // // // // // //             location: toSentenceCase(data.location),
// // // // // // // // //             expertise: Array.isArray(data.expertise) ? data.expertise.map(toSentenceCase) : [],
// // // // // // // // //             pricing: data.pricing,
// // // // // // // // //             responseTime: data.responseTime,
// // // // // // // // //             username: data.username,
// // // // // // // // //             photo: data.photo,
// // // // // // // // //             about: toSentenceCase(data.about),
// // // // // // // // //             certifications: toSentenceCase(data.certifications),
// // // // // // // // //             services: Array.isArray(data.services) ? data.services.map(toSentenceCase) : [],
// // // // // // // // //             regions: Array.isArray(data.regions) ? data.regions.map(toSentenceCase) : [],
// // // // // // // // //             experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
// // // // // // // // //               ...exp,
// // // // // // // // //               company: toSentenceCase(exp.company),
// // // // // // // // //               title: toSentenceCase(exp.title),
// // // // // // // // //             })) : [],
// // // // // // // // //             email: data.email || "",
// // // // // // // // //           };
// // // // // // // // //         });
// // // // // // // // //         setExperts(expertsData);
// // // // // // // // //         setFilteredExperts(expertsData);
// // // // // // // // //       } catch (error) {
// // // // // // // // //         console.error("Error fetching experts:", error);
// // // // // // // // //       }
// // // // // // // // //     };
// // // // // // // // //     fetchExperts();
// // // // // // // // //   }, []);

// // // // // // // // //   useEffect(() => {
// // // // // // // // //     let result = experts;

// // // // // // // // //     if (searchTerm) {
// // // // // // // // //       const searchTerms = normalizeText(searchTerm)
// // // // // // // // //         .split(" ")
// // // // // // // // //         .filter(term => term);
      
// // // // // // // // //       result = result
// // // // // // // // //         .map(expert => {
// // // // // // // // //           const searchableFields = [
// // // // // // // // //             normalizeText(expert.fullName),
// // // // // // // // //             normalizeText(expert.tagline),
// // // // // // // // //             normalizeText(expert.about),
// // // // // // // // //             normalizeText(expert.certifications),
// // // // // // // // //             ...expert.languages.map(normalizeText),
// // // // // // // // //             normalizeText(expert.location),
// // // // // // // // //             ...expert.services.map(normalizeText),
// // // // // // // // //             ...expert.expertise.map(normalizeText),
// // // // // // // // //             ...expert.regions.map(normalizeText),
// // // // // // // // //             ...expert.experience.map(exp => `${normalizeText(exp.company)} ${normalizeText(exp.title)}`),
// // // // // // // // //           ].filter(Boolean).join(" ");
          
// // // // // // // // //           const matchCount = searchTerms.reduce((count, term) => {
// // // // // // // // //             return count + (searchableFields.includes(term) ? 1 : 0);
// // // // // // // // //           }, 0);
          
// // // // // // // // //           return { expert, matchCount };
// // // // // // // // //         })
// // // // // // // // //         .filter(({ matchCount }) => matchCount > 0)
// // // // // // // // //         .sort((a, b) => b.matchCount - a.matchCount)
// // // // // // // // //         .map(({ expert }) => expert);
// // // // // // // // //     }

// // // // // // // // //     if (languageFilter) {
// // // // // // // // //       result = result.filter((expert) =>
// // // // // // // // //         expert.languages?.some(lang => normalizeText(lang).includes(normalizeText(languageFilter)))
// // // // // // // // //       );
// // // // // // // // //     }

// // // // // // // // //     if (locationFilter) {
// // // // // // // // //       result = result.filter((expert) =>
// // // // // // // // //         normalizeText(expert.location).includes(normalizeText(locationFilter))
// // // // // // // // //       );
// // // // // // // // //     }

// // // // // // // // //     if (specializationFilter) {
// // // // // // // // //       result = result.filter((expert) =>
// // // // // // // // //         expert.expertise?.some((expertise) =>
// // // // // // // // //           normalizeText(expertise).includes(normalizeText(specializationFilter))
// // // // // // // // //         )
// // // // // // // // //       );
// // // // // // // // //     }

// // // // // // // // //     setFilteredExperts(result);
// // // // // // // // //   }, [searchTerm, languageFilter, locationFilter, specializationFilter, experts]);

// // // // // // // // //   const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages || []))].map(toSentenceCase);
// // // // // // // // //   const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean).map(toSentenceCase);
// // // // // // // // //   const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))].map(toSentenceCase);

// // // // // // // // //   const truncateTagline = (tagline) => {
// // // // // // // // //     if (!tagline) return "";
// // // // // // // // //     return tagline.length > 150 ? `${tagline.substring(0, 130)}...` : tagline;
// // // // // // // // //   };

// // // // // // // // //   const handleClearFilters = () => {
// // // // // // // // //     setSearchTerm("");
// // // // // // // // //     setLanguageFilter("");
// // // // // // // // //     setLocationFilter("");
// // // // // // // // //     setSpecializationFilter("");
// // // // // // // // //     router.push("/expert");
// // // // // // // // //   };

// // // // // // // // //   return (
// // // // // // // // //     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-16">
// // // // // // // // //       {modalExpert && (
// // // // // // // // //         <AskQuestionModal expert={modalExpert} onClose={() => setModalExpert(null)} />
// // // // // // // // //       )}
// // // // // // // // //       {isLightboxOpen && (
// // // // // // // // //         <Lightbox
// // // // // // // // //           mainSrc={selectedImage}
// // // // // // // // //           onCloseRequest={() => setIsLightboxOpen(false)}
// // // // // // // // //           imageTitle={selectedImage.includes('default.jpg') ? 'Default Profile Image' : 'Expert Profile Image'}
// // // // // // // // //         />
// // // // // // // // //       )}
// // // // // // // // //       <div className="max-w-7xl mx-auto">
// // // // // // // // //         <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
// // // // // // // // //         Real Experts. Real Answers. For Your Real Travel Plans.
// // // // // // // // //         </h1>
// // // // // // // // //         <p className="text-center text-gray-600 mb-4 text-sm sm:text-base">
// // // // // // // // //           Get answers from a trusted circle of verified travel experts across every domain from visas to vacations.
// // // // // // // // //         </p>

// // // // // // // // //         <div className="mb-4">
// // // // // // // // //           <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
// // // // // // // // //             <div className="flex-1 relative">
// // // // // // // // //               <FaGlobe className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // // // // // // //               <select
// // // // // // // // //                 value={languageFilter}
// // // // // // // // //                 onChange={(e) => setLanguageFilter(e.target.value)}
// // // // // // // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // // // // //               >
// // // // // // // // //                 <option value="">Language</option>
// // // // // // // // //                 {uniqueLanguages.map((lang) => (
// // // // // // // // //                   <option key={lang} value={lang}>
// // // // // // // // //                     {lang}
// // // // // // // // //                   </option>
// // // // // // // // //                 ))}
// // // // // // // // //               </select>
// // // // // // // // //             </div>
// // // // // // // // //             <div className="flex-1 relative">
// // // // // // // // //               <FaMapMarkerAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // // // // // // //               <select
// // // // // // // // //                 value={locationFilter}
// // // // // // // // //                 onChange={(e) => setLocationFilter(e.target.value)}
// // // // // // // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // // // // //               >
// // // // // // // // //                 <option value="">Location</option>
// // // // // // // // //                 {uniqueLocations.map((loc) => (
// // // // // // // // //                   <option key={loc} value={loc}>
// // // // // // // // //                     {loc}
// // // // // // // // //                   </option>
// // // // // // // // //                 ))}
// // // // // // // // //               </select>
// // // // // // // // //             </div>
// // // // // // // // //             <div className="flex-1 relative">
// // // // // // // // //               <FaUserTag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // // // // // // //               <select
// // // // // // // // //                 value={specializationFilter}
// // // // // // // // //                 onChange={(e) => setSpecializationFilter(e.target.value)}
// // // // // // // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // // // // //               >
// // // // // // // // //                 <option value="">Expertise</option>
// // // // // // // // //                 {uniqueSpecializations.map((spec) => (
// // // // // // // // //                   <option key={spec} value={spec}>
// // // // // // // // //                     {spec}
// // // // // // // // //                   </option>
// // // // // // // // //                 ))}
// // // // // // // // //               </select>
// // // // // // // // //             </div>
// // // // // // // // //             <div className="flex-1 flex items-center">
// // // // // // // // //               <button
// // // // // // // // //                 onClick={handleClearFilters}
// // // // // // // // //                 className="w-full flex items-center justify-center gap-5 px-2 py-1 bg-[#36013F] text-white rounded-full hover:bg-opacity-90 transition-all text-xs"
// // // // // // // // //               >
// // // // // // // // //                 <FaTimes />
// // // // // // // // //                 Clear
// // // // // // // // //               </button>
// // // // // // // // //             </div>
// // // // // // // // //           </div>
         
// // // // // // // // //           <div className="relative flex items-center gap-2">
// // // // // // // // //             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
// // // // // // // // //             <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
// // // // // // // // //               <input
// // // // // // // // //                 type="text"
// // // // // // // // //                 placeholder="Search keywords (e.g., visa travel documentation)"
// // // // // // // // //                 value={searchTerm}
// // // // // // // // //                 onChange={(e) => setSearchTerm(e.target.value)}
// // // // // // // // //                 className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // // // // //               />
// // // // // // // // //               <button
// // // // // // // // //                 type="submit"
// // // // // // // // //                 className="bg-[#36013F] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all text-sm"
// // // // // // // // //               >
// // // // // // // // //                 Search
// // // // // // // // //               </button>
// // // // // // // // //             </form>
// // // // // // // // //           </div>
// // // // // // // // //         </div>

// // // // // // // // //         {filteredExperts.length === 0 && (
// // // // // // // // //           <div className="text-center text-gray-600 py-8 text-sm">
// // // // // // // // //             <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
// // // // // // // // //           </div>
// // // // // // // // //         )}

// // // // // // // // //         <div className="relative">
// // // // // // // // //           <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
// // // // // // // // //             {filteredExperts.map((expert) => (
// // // // // // // // //               <motion.div
// // // // // // // // //                 key={expert.id}
// // // // // // // // //                 className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow"
// // // // // // // // //                 initial={{ opacity: 0, y: 20 }}
// // // // // // // // //                 animate={{ opacity: 1, y: 0 }}
// // // // // // // // //                 transition={{ duration: 0.3 }}
// // // // // // // // //               >
// // // // // // // // //                 <div className="flex items-center gap-3 mb-3">
// // // // // // // // //                   <button
// // // // // // // // //                     onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
// // // // // // // // //                     className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-[#36013F] shadow-sm"
// // // // // // // // //                   >
// // // // // // // // //                     <Image
// // // // // // // // //                       src={expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg'}
// // // // // // // // //                       alt={expert.fullName || 'Expert Profile'}
// // // // // // // // //                       fill
// // // // // // // // //                       sizes="60px"
// // // // // // // // //                       className="object-cover object-center rounded-full"
// // // // // // // // //                       priority={false}
// // // // // // // // //                     />
// // // // // // // // //                   </button>
// // // // // // // // //                   <div className="flex-1">
// // // // // // // // //                     <h2 className="text-base font-semibold text-gray-800">
// // // // // // // // //                       {expert.fullName || 'Unknown Expert'}
// // // // // // // // //                     </h2>
// // // // // // // // //                     <p className="text-xs text-gray-600 line-clamp-2">
// // // // // // // // //                       {truncateTagline(expert.tagline) || 'No tagline provided'}
// // // // // // // // //                     </p>
// // // // // // // // //                     {/* <p className="text-xs font-medium text-[#36013F]  py-1 rounded-full mt-1">
// // // // // // // // //                       {calculateTotalExperience(expert.experience) || 'No experience provided'} years of experience
// // // // // // // // //                     </p> */}
// // // // // // // // //                   </div>
// // // // // // // // //                       <div className="flex justify-center items-center py-5 space-y-0.5">
// // // // // // // // //   <div className="text-primary border-2 border-primary rounded-lg px-2 w-[48px] flex flex-col items-center">
// // // // // // // // //     <h1 className="font-bold text-center text-base">{calculateTotalExperience(expert.experience) || 'No experience provided'}</h1>
// // // // // // // // //     <span className="font-semibold text-xs text-center">YEARS</span>
// // // // // // // // //   </div>
// // // // // // // // // </div>
// // // // // // // // //                 </div>
// // // // // // // // //                 <div className="space-y-3">
// // // // // // // // //                   <div className="flex flex-wrap gap-1.5">
// // // // // // // // //                     {expert.expertise?.map((expertise) => (
// // // // // // // // //                       <span
// // // // // // // // //                         key={expertise}
// // // // // // // // //                         className="bg-[#36013F] text-white text-xs px-1.5 py-0.5 rounded-full"
// // // // // // // // //                       >
// // // // // // // // //                         {expertise}
// // // // // // // // //                       </span>
// // // // // // // // //                     ))}
// // // // // // // // //                   </div>
// // // // // // // // //                   <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
// // // // // // // // //                     <p className="flex items-center gap-1.5">
// // // // // // // // //                       <FaRupeeSign className="text-[#36013F]" />
// // // // // // // // //                       {formatPricing(expert.pricing)}
// // // // // // // // //                     </p>
// // // // // // // // //                     <p className="flex items-center gap-1.5">
// // // // // // // // //                       <FaLanguage className="text-[#36013F]" />
// // // // // // // // //                       {toSentenceCase(expert.languages) || "English, Hindi"}
// // // // // // // // //                     </p>
// // // // // // // // //                     <p className="flex items-center gap-1.5">
// // // // // // // // //                       <FaMapMarkerAlt className="text-[#36013F]" />
// // // // // // // // //                       {expert.location || "Delhi, India"}
// // // // // // // // //                     </p>
// // // // // // // // //                     <p className="flex items-center gap-1.5">
// // // // // // // // //                       <FaClock className="text-[#36013F]" />
// // // // // // // // //                       {expert.responseTime || "10 mins"}
// // // // // // // // //                     </p>
// // // // // // // // //                   </div>
// // // // // // // // //                 </div>
// // // // // // // // //                 <div className="flex gap-2 mt-4">
// // // // // // // // //                   <Link href={`/experts/${expert.username}`} className="flex-1">
// // // // // // // // //                     <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
// // // // // // // // //                       View Profile
// // // // // // // // //                     </button>
// // // // // // // // //                   </Link>
// // // // // // // // //                   <button
// // // // // // // // //                     onClick={() => setModalExpert(expert)}
// // // // // // // // //                     className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
// // // // // // // // //                   >
// // // // // // // // //                     Ask Question
// // // // // // // // //                   </button>
// // // // // // // // //                 </div>
// // // // // // // // //               </motion.div>
// // // // // // // // //             ))}
// // // // // // // // //           </div>

// // // // // // // // //           <div className="sm:hidden relative h-[500px] flex justify-center items-center">
// // // // // // // // //             {filteredExperts.map((expert, index) => (
// // // // // // // // //               <TinderCard
// // // // // // // // //                 key={expert.id}
// // // // // // // // //                 onSwipe={(dir) => onSwipe(dir, expert.id)}
// // // // // // // // //                 preventSwipe={['up', 'down']}
// // // // // // // // //                 className={`absolute w-full max-w-[350px] ${index === 0 ? 'z-10' : 'z-0'}`}
// // // // // // // // //               >
// // // // // // // // //                 <motion.div
// // // // // // // // //                   className="bg-white rounded-xl shadow-lg p-4 border border-gray-200"
// // // // // // // // //                   initial={{ opacity: 0, scale: 0.9 }}
// // // // // // // // //                   animate={{ opacity: 1, scale: 1 }}
// // // // // // // // //                   transition={{ duration: 0.3 }}
// // // // // // // // //                 >
// // // // // // // // //                   <div className="flex items-center gap-3 mb-3">
// // // // // // // // //                     <button
// // // // // // // // //                       onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
// // // // // // // // //                       className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-[#36013F] shadow-sm"
// // // // // // // // //                     >
// // // // // // // // //                       <Image
// // // // // // // // //                         src={expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg'}
// // // // // // // // //                         alt={expert.fullName || 'Expert Profile'}
// // // // // // // // //                         fill
// // // // // // // // //                         sizes="60px"
// // // // // // // // //                         className="object-cover object-center rounded-full"
// // // // // // // // //                         priority={false}
// // // // // // // // //                       />
// // // // // // // // //                     </button>
// // // // // // // // //                     <div className="flex-1">
// // // // // // // // //                       <h2 className="text-base font-semibold text-gray-800">
// // // // // // // // //                         {expert.fullName || 'Unknown Expert'}
// // // // // // // // //                       </h2>
// // // // // // // // //                       <p className="text-xs text-gray-600 line-clamp-2">
// // // // // // // // //                         {truncateTagline(expert.tagline) || 'No tagline provided'}
// // // // // // // // //                       </p>
// // // // // // // // //                       {/* <p className="text-xs font-medium text-[#36013F]   py-1 rounded-full mt-1 ">
// // // // // // // // //                         {calculateTotalExperience(expert.experience) || 'No experience provided'}years of experience
// // // // // // // // //                       </p> */}
// // // // // // // // //                     </div>
// // // // // // // // //               <div className="flex justify-center items-center py-5 space-y-0.5">
// // // // // // // // //   <div className="text-primary border-2 border-primary rounded-lg px-2 w-[48px] flex flex-col items-center">
// // // // // // // // //     <h1 className="font-bold text-center text-base">{calculateTotalExperience(expert.experience) || 'No experience provided'}</h1>
// // // // // // // // //     <span className="font-semibold text-xs text-center">YEARS</span>
// // // // // // // // //   </div>
// // // // // // // // // </div>
// // // // // // // // //                   </div>
// // // // // // // // //                   <div className="space-y-3">
// // // // // // // // //                     <div className="flex flex-wrap gap-1.5">
// // // // // // // // //                       {expert.expertise?.map((expertise) => (
// // // // // // // // //                         <span
// // // // // // // // //                           key={expertise}
// // // // // // // // //                           className="bg-[#36013F] text-white text-xs px-1.5 py-0.5 rounded-full"
// // // // // // // // //                         >
// // // // // // // // //                           {expertise}
// // // // // // // // //                         </span>
// // // // // // // // //                       ))}
// // // // // // // // //                     </div>
// // // // // // // // //                     <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
// // // // // // // // //                       <p className="flex items-center gap-1.5">
// // // // // // // // //                         <FaRupeeSign className="text-[#36013F]" />
// // // // // // // // //                         {formatPricing(expert.pricing)}
// // // // // // // // //                       </p>
// // // // // // // // //                       <p className="flex items-center gap-1.5">
// // // // // // // // //                         <FaLanguage className="text-[#36013F]" />
// // // // // // // // //                         {toSentenceCase(expert.languages) || "English, Hindi"}
// // // // // // // // //                       </p>
// // // // // // // // //                       <p className="flex items-center gap-1.5">
// // // // // // // // //                         <FaMapMarkerAlt className="text-[#36013F]" />
// // // // // // // // //                         {expert.location || "Delhi, India"}
// // // // // // // // //                       </p>
// // // // // // // // //                       <p className="flex items-center gap-1.5">
// // // // // // // // //                         <FaClock className="text-[#36013F]" />
// // // // // // // // //                         {expert.responseTime || "10 mins"}
// // // // // // // // //                       </p>
// // // // // // // // //                     </div>
// // // // // // // // //                   </div>
// // // // // // // // //                   <div className="flex gap-2 mt-4">
// // // // // // // // //                     <Link href={`/experts/${expert.username}`} className="flex-1">
// // // // // // // // //                       <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
// // // // // // // // //                         View Profile
// // // // // // // // //                       </button>
// // // // // // // // //                     </Link>
// // // // // // // // //                     <button
// // // // // // // // //                       onClick={() => setModalExpert(expert)}
// // // // // // // // //                       className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
// // // // // // // // //                     >
// // // // // // // // //                       Ask Question
// // // // // // // // //                     </button>
// // // // // // // // //                   </div>
// // // // // // // // //                 </motion.div>
// // // // // // // // //               </TinderCard>
// // // // // // // // //             ))}
// // // // // // // // //           </div>
// // // // // // // // //         </div>
// // // // // // // // //       </div>
// // // // // // // // //     </div>
// // // // // // // // //   );
// // // // // // // // // }

// // // // // // // // "use client";

// // // // // // // // import { useState, useEffect, useMemo } from "react";
// // // // // // // // import Image from "next/image";
// // // // // // // // import Link from "next/link";
// // // // // // // // import { getFirestore, collection, getDocs } from "firebase/firestore";
// // // // // // // // import { app } from "@/lib/firebase";
// // // // // // // // import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaTimes, FaLanguage } from "react-icons/fa";
// // // // // // // // import { useSearchParams, useRouter } from "next/navigation";
// // // // // // // // import AskQuestionModal from "@/app/components/AskQuestionModal";
// // // // // // // // import TinderCard from 'react-tinder-card';
// // // // // // // // import { motion } from 'framer-motion';
// // // // // // // // import Lightbox from 'react-image-lightbox';
// // // // // // // // import 'react-image-lightbox/style.css';

// // // // // // // // const db = getFirestore(app);

// // // // // // // // export default function ExpertsDirectory() {
// // // // // // // //   const [experts, setExperts] = useState([]);
// // // // // // // //   const [filteredExperts, setFilteredExperts] = useState([]);
// // // // // // // //   const [searchTerm, setSearchTerm] = useState("");
// // // // // // // //   const [languageFilter, setLanguageFilter] = useState("");
// // // // // // // //   const [locationFilter, setLocationFilter] = useState("");
// // // // // // // //   const [specializationFilter, setSpecializationFilter] = useState("");
// // // // // // // //   const [modalExpert, setModalExpert] = useState(null);
// // // // // // // //   const [isLightboxOpen, setIsLightboxOpen] = useState(false);
// // // // // // // //   const [selectedImage, setSelectedImage] = useState("");
// // // // // // // //   const searchParams = useSearchParams();
// // // // // // // //   const router = useRouter();

// // // // // // // //   const keywords = useMemo(() => {
// // // // // // // //     return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
// // // // // // // //   }, [searchParams]);

// // // // // // // //   const initialQuestion = useMemo(() => {
// // // // // // // //     return searchParams.get("question") || "";
// // // // // // // //   }, [searchParams]);

// // // // // // // //   const toSentenceCase = (input) => {
// // // // // // // //     if (!input) return "";
// // // // // // // //     if (Array.isArray(input)) {
// // // // // // // //       return input.map(item => toSentenceCase(item)).join(", ");
// // // // // // // //     }
// // // // // // // //     if (typeof input !== "string") return "";
// // // // // // // //     return input
// // // // // // // //       .toLowerCase()
// // // // // // // //       .split(" ")
// // // // // // // //       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
// // // // // // // //       .join(" ");
// // // // // // // //   };


  
// // // // // // // // const calculateTotalExperience = (experience) => {
// // // // // // // //   if (!Array.isArray(experience) || experience.length === 0) return "0+";

// // // // // // // //   const today = new Date();
// // // // // // // //   let earliestStart = null;
// // // // // // // //   let latestEnd = null;

// // // // // // // //   // Find the earliest start date and latest end date
// // // // // // // //   experience.forEach(exp => {
// // // // // // // //     const startDate = exp.startDate ? new Date(exp.startDate) : null;
// // // // // // // //     const endDate = exp.endDate === "Present" ? today : exp.endDate ? new Date(exp.endDate) : null;

// // // // // // // //     if (startDate && (!earliestStart || startDate < earliestStart)) {
// // // // // // // //       earliestStart = startDate;
// // // // // // // //     }
// // // // // // // //     if (endDate && (!latestEnd || endDate > latestEnd)) {
// // // // // // // //       latestEnd = endDate;
// // // // // // // //     }
// // // // // // // //   });

// // // // // // // //   // If no valid dates, return 0
// // // // // // // //   if (!earliestStart || !latestEnd || latestEnd < earliestStart) {
// // // // // // // //     return "0+ ";
// // // // // // // //   }

// // // // // // // //   // Calculate total months between earliest start and latest end
// // // // // // // //   const totalMonths = (latestEnd.getFullYear() - earliestStart.getFullYear()) * 12 +
// // // // // // // //                       (latestEnd.getMonth() - earliestStart.getMonth());

// // // // // // // //   const years = Math.floor(totalMonths / 12);
// // // // // // // //   return `${years}+`;
// // // // // // // // };
// // // // // // // //   const formatPricing = (pricing) => {
// // // // // // // //     if (!pricing) return "799/session";
// // // // // // // //     const numeric = pricing.match(/\d+(\.\d+)?/)?.[0] || "799";
// // // // // // // //     return `${numeric}/session`;
// // // // // // // //   };

// // // // // // // //   const normalizeText = (text) => {
// // // // // // // //     if (!text || typeof text !== "string") return "";
// // // // // // // //     return text
// // // // // // // //       .toLowerCase()
// // // // // // // //       .replace(/[^a-z0-9\s]/g, " ")
// // // // // // // //       .replace(/\s+/g, " ")
// // // // // // // //       .trim();
// // // // // // // //   };

// // // // // // // //   const handleSearchSubmit = (e) => {
// // // // // // // //     e.preventDefault();
// // // // // // // //     if (searchTerm.trim()) {
// // // // // // // //       const formattedKeywords = normalizeText(searchTerm)
// // // // // // // //         .split(" ")
// // // // // // // //         .filter(Boolean)
// // // // // // // //         .join(",");
// // // // // // // //       router.push(`/ask-an-expert?keywords=${encodeURIComponent(formattedKeywords)}`);
// // // // // // // //     } else {
// // // // // // // //       router.push("/ask-an-expert");
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   const onSwipe = (direction, expertId) => {
// // // // // // // //     setFilteredExperts(prev => prev.filter(expert => expert.id !== expertId));
// // // // // // // //   };

// // // // // // // //   const openLightbox = (imageSrc) => {
// // // // // // // //     setSelectedImage(imageSrc);
// // // // // // // //     setIsLightboxOpen(true);
// // // // // // // //   };

// // // // // // // //   useEffect(() => {
// // // // // // // //     if (keywords.length > 0) {
// // // // // // // //       setSearchTerm(keywords.join(" "));
// // // // // // // //     } else {
// // // // // // // //       setSearchTerm("");
// // // // // // // //     }
// // // // // // // //   }, [keywords]);

// // // // // // // //   useEffect(() => {
// // // // // // // //     const fetchExperts = async () => {
// // // // // // // //       try {
// // // // // // // //         const querySnapshot = await getDocs(collection(db, "Profiles"));
// // // // // // // //         const expertsData = querySnapshot.docs.map((doc) => {
// // // // // // // //           const data = doc.data();
// // // // // // // //           return {
// // // // // // // //             id: doc.id,
// // // // // // // //             fullName: toSentenceCase(data.fullName),
// // // // // // // //             tagline: toSentenceCase(data.tagline),
// // // // // // // //             languages: Array.isArray(data.languages) ? data.languages : [],
// // // // // // // //             location: toSentenceCase(data.location),
// // // // // // // //             expertise: Array.isArray(data.expertise) ? data.expertise.map(toSentenceCase) : [],
// // // // // // // //             pricing: data.pricing,
// // // // // // // //             responseTime: data.responseTime,
// // // // // // // //             username: data.username,
// // // // // // // //             photo: data.photo,
// // // // // // // //             about: toSentenceCase(data.about),
// // // // // // // //             certifications: toSentenceCase(data.certifications),
// // // // // // // //             services: Array.isArray(data.services) ? data.services.map(toSentenceCase) : [],
// // // // // // // //             regions: Array.isArray(data.regions) ? data.regions.map(toSentenceCase) : [],
// // // // // // // //             experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
// // // // // // // //               ...exp,
// // // // // // // //               company: toSentenceCase(exp.company),
// // // // // // // //               title: toSentenceCase(exp.title),
// // // // // // // //             })) : [],
// // // // // // // //             email: data.email || "",
// // // // // // // //           };
// // // // // // // //         });
// // // // // // // //         setExperts(expertsData);
// // // // // // // //         setFilteredExperts(expertsData);
// // // // // // // //       } catch (error) {
// // // // // // // //         console.error("Error fetching experts:", error);
// // // // // // // //       }
// // // // // // // //     };
// // // // // // // //     fetchExperts();
// // // // // // // //   }, []);

// // // // // // // //   useEffect(() => {
// // // // // // // //     let result = experts;

// // // // // // // //     if (searchTerm) {
// // // // // // // //       const searchTerms = normalizeText(searchTerm)
// // // // // // // //         .split(" ")
// // // // // // // //         .filter(term => term);
      
// // // // // // // //       result = result
// // // // // // // //         .map(expert => {
// // // // // // // //           const searchableFields = [
// // // // // // // //             normalizeText(expert.fullName),
// // // // // // // //             normalizeText(expert.tagline),
// // // // // // // //             normalizeText(expert.about),
// // // // // // // //             normalizeText(expert.certifications),
// // // // // // // //             ...expert.languages.map(normalizeText),
// // // // // // // //             normalizeText(expert.location),
// // // // // // // //             ...expert.services.map(normalizeText),
// // // // // // // //             ...expert.expertise.map(normalizeText),
// // // // // // // //             ...expert.regions.map(normalizeText),
// // // // // // // //             ...expert.experience.map(exp => `${normalizeText(exp.company)} ${normalizeText(exp.title)}`),
// // // // // // // //           ].filter(Boolean).join(" ");
          
// // // // // // // //           const matchCount = searchTerms.reduce((count, term) => {
// // // // // // // //             return count + (searchableFields.includes(term) ? 1 : 0);
// // // // // // // //           }, 0);
          
// // // // // // // //           return { expert, matchCount };
// // // // // // // //         })
// // // // // // // //         .filter(({ matchCount }) => matchCount > 0)
// // // // // // // //         .sort((a, b) => b.matchCount - a.matchCount)
// // // // // // // //         .map(({ expert }) => expert);
// // // // // // // //     }

// // // // // // // //     if (languageFilter) {
// // // // // // // //       result = result.filter((expert) =>
// // // // // // // //         expert.languages?.some(lang => normalizeText(lang).includes(normalizeText(languageFilter)))
// // // // // // // //       );
// // // // // // // //     }

// // // // // // // //     if (locationFilter) {
// // // // // // // //       result = result.filter((expert) =>
// // // // // // // //         normalizeText(expert.location).includes(normalizeText(locationFilter))
// // // // // // // //       );
// // // // // // // //     }

// // // // // // // //     if (specializationFilter) {
// // // // // // // //       result = result.filter((expert) =>
// // // // // // // //         expert.expertise?.some((expertise) =>
// // // // // // // //           normalizeText(expertise).includes(normalizeText(specializationFilter))
// // // // // // // //         )
// // // // // // // //       );
// // // // // // // //     }

// // // // // // // //     setFilteredExperts(result);
// // // // // // // //   }, [searchTerm, languageFilter, locationFilter, specializationFilter, experts]);

// // // // // // // //   const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages || []))].map(toSentenceCase);
// // // // // // // //   const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean).map(toSentenceCase);
// // // // // // // //   const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))].map(toSentenceCase);

// // // // // // // //   const truncateTagline = (tagline) => {
// // // // // // // //     if (!tagline) return "";
// // // // // // // //     return tagline.length > 150 ? `${tagline.substring(0, 130)}...` : tagline;
// // // // // // // //   };

// // // // // // // //   const handleClearFilters = () => {
// // // // // // // //     setSearchTerm("");
// // // // // // // //     setLanguageFilter("");
// // // // // // // //     setLocationFilter("");
// // // // // // // //     setSpecializationFilter("");
// // // // // // // //     router.push("/ask-an-expert");
// // // // // // // //   };

// // // // // // // //   return (
// // // // // // // //     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-16">
// // // // // // // //       {modalExpert && (
// // // // // // // //         <AskQuestionModal
// // // // // // // //           expert={modalExpert}
// // // // // // // //           onClose={() => setModalExpert(null)}
// // // // // // // //          initialQuestion={decodeURIComponent(initialQuestion)}
// // // // // // // //         />
// // // // // // // //       )}
// // // // // // // //       {isLightboxOpen && (
// // // // // // // //         <Lightbox
// // // // // // // //           mainSrc={selectedImage}
// // // // // // // //           onCloseRequest={() => setIsLightboxOpen(false)}
// // // // // // // //           imageTitle={selectedImage.includes('default.jpg') ? 'Default Profile Image' : 'Expert Profile Image'}
// // // // // // // //         />
// // // // // // // //       )}
// // // // // // // //       <div className="max-w-7xl mx-auto mt-5">
// // // // // // // //         <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
// // // // // // // //           Real Experts. Real Answers. For Your Real Travel Plans.
// // // // // // // //         </h1>
// // // // // // // //         <p className="text-center text-gray-600 mb-4 text-sm sm:text-base">
// // // // // // // //           Get answers from a trusted circle of verified travel experts across every domain from visas to vacations.
// // // // // // // //         </p>

// // // // // // // //         <div className="mb-4">
// // // // // // // //           <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
// // // // // // // //             <div className="flex-1 relative">
// // // // // // // //               <FaGlobe className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // // // // // //               <select
// // // // // // // //                 value={languageFilter}
// // // // // // // //                 onChange={(e) => setLanguageFilter(e.target.value)}
// // // // // // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // // // //               >
// // // // // // // //                 <option value="">Language</option>
// // // // // // // //                 {uniqueLanguages.map((lang) => (
// // // // // // // //                   <option key={lang} value={lang}>
// // // // // // // //                     {lang}
// // // // // // // //                   </option>
// // // // // // // //                 ))}
// // // // // // // //               </select>
// // // // // // // //             </div>
// // // // // // // //             <div className="flex-1 relative">
// // // // // // // //               <FaMapMarkerAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // // // // // //               <select
// // // // // // // //                 value={locationFilter}
// // // // // // // //                 onChange={(e) => setLocationFilter(e.target.value)}
// // // // // // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // // // //               >
// // // // // // // //                 <option value="">Location</option>
// // // // // // // //                 {uniqueLocations.map((loc) => (
// // // // // // // //                   <option key={loc} value={loc}>
// // // // // // // //                     {loc}
// // // // // // // //                   </option>
// // // // // // // //                 ))}
// // // // // // // //               </select>
// // // // // // // //             </div>
// // // // // // // //             <div className="flex-1 relative">
// // // // // // // //               <FaUserTag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // // // // // //               <select
// // // // // // // //                 value={specializationFilter}
// // // // // // // //                 onChange={(e) => setSpecializationFilter(e.target.value)}
// // // // // // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // // // //               >
// // // // // // // //                 <option value="">Expertise</option>
// // // // // // // //                 {uniqueSpecializations.map((spec) => (
// // // // // // // //                   <option key={spec} value={spec}>
// // // // // // // //                     {spec}
// // // // // // // //                   </option>
// // // // // // // //                 ))}
// // // // // // // //               </select>
// // // // // // // //             </div>
// // // // // // // //             <div className="flex-1 flex items-center">
// // // // // // // //               <button
// // // // // // // //                 onClick={handleClearFilters}
// // // // // // // //                 className="w-full flex items-center justify-center gap-5 px-2 py-1 bg-[#36013F] text-white rounded-full hover:bg-opacity-90 transition-all text-xs"
// // // // // // // //               >
// // // // // // // //                 <FaTimes />
// // // // // // // //                 Clear
// // // // // // // //               </button>
// // // // // // // //             </div>
// // // // // // // //           </div>
         
// // // // // // // //           <div className="relative flex items-center gap-2">
// // // // // // // //             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
// // // // // // // //             <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
// // // // // // // //               <input
// // // // // // // //                 type="text"
// // // // // // // //                 placeholder="Search keywords (e.g., visa travel documentation)"
// // // // // // // //                 value={searchTerm}
// // // // // // // //                 onChange={(e) => setSearchTerm(e.target.value)}
// // // // // // // //                 className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // // // //               />
// // // // // // // //               <button
// // // // // // // //                 type="submit"
// // // // // // // //                 className="bg-[#36013F] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all text-sm"
// // // // // // // //               >
// // // // // // // //                 Search
// // // // // // // //               </button>
// // // // // // // //             </form>
// // // // // // // //           </div>
// // // // // // // //         </div>

// // // // // // // //         {filteredExperts.length === 0 && (
// // // // // // // //           <div className="text-center text-gray-600 py-8 text-sm">
// // // // // // // //             <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
// // // // // // // //           </div>
// // // // // // // //         )}

// // // // // // // //         <div className="relative">
// // // // // // // //           <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
// // // // // // // //             {filteredExperts.map((expert) => (
// // // // // // // //               <motion.div
// // // // // // // //                 key={expert.id}
// // // // // // // //                 className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow"
// // // // // // // //                 initial={{ opacity: 0, y: 20 }}
// // // // // // // //                 animate={{ opacity: 1, y: 0 }}
// // // // // // // //                 transition={{ duration: 0.3 }}
// // // // // // // //               >
// // // // // // // //                 <div className="flex items-center gap-3 mb-3">
// // // // // // // //                   <button
// // // // // // // //                     onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
// // // // // // // //                     className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-[#36013F] shadow-sm"
// // // // // // // //                   >
// // // // // // // //                     <Image
// // // // // // // //                       src={expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg'}
// // // // // // // //                       alt={expert.fullName || 'Expert Profile'}
// // // // // // // //                       fill
// // // // // // // //                       sizes="60px"
// // // // // // // //                       className="object-cover object-center rounded-full"
// // // // // // // //                       priority={false}
// // // // // // // //                     />
// // // // // // // //                   </button>
// // // // // // // //                   <div className="flex-1">
// // // // // // // //                     <h2 className="text-base font-semibold text-gray-800">
// // // // // // // //                       {expert.fullName || 'Unknown Expert'}
// // // // // // // //                     </h2>
// // // // // // // //                     <p className="text-xs text-gray-600 line-clamp-2">
// // // // // // // //                       {truncateTagline(expert.tagline) || 'No tagline provided'}
// // // // // // // //                     </p>
// // // // // // // //                   </div>
// // // // // // // //                   <div className="flex justify-center items-center py-1 space-y-0.5">
// // // // // // // //                     <div className="text-primary border-2 border-primary rounded-lg px-2 w-[48px] flex flex-col items-center py-1">
// // // // // // // //                       <h1 className="font-bold text-center text-base">{calculateTotalExperience(expert.experience) || 'No experience provided'}</h1>
// // // // // // // //                       <span className="font-semibold text-xs text-center">YEARS</span>
// // // // // // // //                     </div>
// // // // // // // //                   </div>
// // // // // // // //                 </div>
// // // // // // // //                 <div className="space-y-3">
// // // // // // // //                   <div className="flex flex-wrap gap-1.5">
// // // // // // // //                     {expert.expertise?.map((expertise) => (
// // // // // // // //                       <span
// // // // // // // //                         key={expertise}
// // // // // // // //                         className="bg-[#36013F] text-white text-xs px-1.5 py-0.5 rounded-full"
// // // // // // // //                       >
// // // // // // // //                         {expertise}
// // // // // // // //                       </span>
// // // // // // // //                     ))}
// // // // // // // //                   </div>
// // // // // // // //                   <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
// // // // // // // //                     <p className="flex items-center gap-1.5">
// // // // // // // //                       <FaRupeeSign className="text-[#36013F]" />
// // // // // // // //                       {formatPricing(expert.pricing)}
// // // // // // // //                     </p>
// // // // // // // //                     <p className="flex items-center gap-1.5">
// // // // // // // //                       <FaLanguage className="text-[#36013F]" />
// // // // // // // //                       {toSentenceCase(expert.languages) || "English, Hindi"}
// // // // // // // //                     </p>
// // // // // // // //                     <p className="flex items-center gap-1.5">
// // // // // // // //                       <FaMapMarkerAlt className="text-[#36013F]" />
// // // // // // // //                       {expert.location || "Delhi, India"}
// // // // // // // //                     </p>
// // // // // // // //                     <p className="flex items-center gap-1.5">
// // // // // // // //                       <FaClock className="text-[#36013F]" />
// // // // // // // //                       {expert.responseTime || "10 mins"}
// // // // // // // //                     </p>
// // // // // // // //                   </div>
// // // // // // // //                 </div>
// // // // // // // //                 <div className="flex gap-2 mt-4">
// // // // // // // //                   <Link href={`/experts/${expert.username}`} className="flex-1">
// // // // // // // //                     <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
// // // // // // // //                       View Profile
// // // // // // // //                     </button>
// // // // // // // //                   </Link>
// // // // // // // //                   <button
// // // // // // // //                     onClick={() => setModalExpert(expert)}
// // // // // // // //                     className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
// // // // // // // //                   >
// // // // // // // //                     Ask Question
// // // // // // // //                   </button>
// // // // // // // //                 </div>
// // // // // // // //               </motion.div>
// // // // // // // //             ))}
// // // // // // // //           </div>

// // // // // // // //           <div className="sm:hidden relative h-[500px] flex justify-center items-center">
// // // // // // // //             {filteredExperts.map((expert, index) => (
// // // // // // // //               <TinderCard
// // // // // // // //                 key={expert.id}
// // // // // // // //                 onSwipe={(dir) => onSwipe(dir, expert.id)}
// // // // // // // //                 preventSwipe={['up', 'down']}
// // // // // // // //                 className={`absolute w-full max-w-[350px] ${index === 0 ? 'z-10' : 'z-0'}`}
// // // // // // // //               >
// // // // // // // //                 <motion.div
// // // // // // // //                   className="bg-white rounded-xl shadow-lg p-4 border border-gray-200"
// // // // // // // //                   initial={{ opacity: 0, scale: 0.9 }}
// // // // // // // //                   animate={{ opacity: 1, scale: 1 }}
// // // // // // // //                   transition={{ duration: 0.3 }}
// // // // // // // //                 >
// // // // // // // //                   <div className="flex items-center gap-3 mb-3">
// // // // // // // //                     <button
// // // // // // // //                       onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
// // // // // // // //                       className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-[#36013F] shadow-sm"
// // // // // // // //                     >
// // // // // // // //                       <Image
// // // // // // // //                         src={expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg'}
// // // // // // // //                         alt={expert.fullName || 'Expert Profile'}
// // // // // // // //                         fill
// // // // // // // //                         sizes="60px"
// // // // // // // //                         className="object-cover object-center rounded-full"
// // // // // // // //                         priority={false}
// // // // // // // //                       />
// // // // // // // //                     </button>
// // // // // // // //                     <div className="flex-1">
// // // // // // // //                       <h2 className="text-base font-semibold text-gray-800">
// // // // // // // //                         {expert.fullName || 'Unknown Expert'}
// // // // // // // //                       </h2>
// // // // // // // //                       <p className="text-xs text-gray-600 line-clamp-2">
// // // // // // // //                         {truncateTagline(expert.tagline) || 'No tagline provided'}
// // // // // // // //                       </p>
// // // // // // // //                     </div>
// // // // // // // //                     <div className="flex justify-center items-center py-1 space-y-0.5">
// // // // // // // //                       <div className="text-primary border-2 border-primary rounded-lg px-2 w-[48px] flex flex-col items-center py-1">
// // // // // // // //                         <h1 className="font-bold text-center text-base">{calculateTotalExperience(expert.experience) || 'No experience provided'}</h1>
// // // // // // // //                         <span className="font-semibold text-xs text-center">YEARS</span>
// // // // // // // //                       </div>
// // // // // // // //                     </div>
// // // // // // // //                   </div>
// // // // // // // //                   <div className="space-y-3">
// // // // // // // //                     <div className="flex flex-wrap gap-1.5">
// // // // // // // //                       {expert.expertise?.map((expertise) => (
// // // // // // // //                         <span
// // // // // // // //                           key={expertise}
// // // // // // // //                           className="bg-[#36013F] text-white text-xs px-1.5 py-0.5 rounded-full"
// // // // // // // //                         >
// // // // // // // //                           {expertise}
// // // // // // // //                         </span>
// // // // // // // //                       ))}
// // // // // // // //                     </div>
// // // // // // // //                     <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
// // // // // // // //                       <p className="flex items-center gap-1.5">
// // // // // // // //                         <FaRupeeSign className="text-[#36013F]" />
// // // // // // // //                         {formatPricing(expert.pricing)}
// // // // // // // //                       </p>
// // // // // // // //                       <p className="flex items-center gap-1.5">
// // // // // // // //                         <FaLanguage className="text-[#36013F]" />
// // // // // // // //                         {toSentenceCase(expert.languages) || "English, Hindi"}
// // // // // // // //                       </p>
// // // // // // // //                       <p className="flex items-center gap-1.5">
// // // // // // // //                         <FaMapMarkerAlt className="text-[#36013F]" />
// // // // // // // //                         {expert.location || "Delhi, India"}
// // // // // // // //                       </p>
// // // // // // // //                       <p className="flex items-center gap-1.5">
// // // // // // // //                         <FaClock className="text-[#36013F]" />
// // // // // // // //                         {expert.responseTime || "10 mins"}
// // // // // // // //                       </p>
// // // // // // // //                     </div>
// // // // // // // //                   </div>
// // // // // // // //                   <div className="flex gap-2 mt-4">
// // // // // // // //                     <Link href={`/experts/${expert.username}`} className="flex-1">
// // // // // // // //                       <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
// // // // // // // //                         View Profile
// // // // // // // //                       </button>
// // // // // // // //                     </Link>
// // // // // // // //                     <button
// // // // // // // //                       onClick={() => setModalExpert(expert)}
// // // // // // // //                       className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
// // // // // // // //                     >
// // // // // // // //                       Ask Question
// // // // // // // //                     </button>
// // // // // // // //                   </div>
// // // // // // // //                 </motion.div>
// // // // // // // //               </TinderCard>
// // // // // // // //             ))}
// // // // // // // //           </div>
// // // // // // // //         </div>
// // // // // // // //       </div>
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // }

// // // // // // // "use client";

// // // // // // // import { useState, useEffect, useMemo, useRef } from "react";
// // // // // // // import Image from "next/image";
// // // // // // // import Link from "next/link";
// // // // // // // import { getFirestore, collection, getDocs, query, limit, startAfter } from "firebase/firestore";
// // // // // // // import { app } from "@/lib/firebase";
// // // // // // // import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaTimes, FaLanguage } from "react-icons/fa";
// // // // // // // import { useSearchParams, useRouter } from "next/navigation";
// // // // // // // import AskQuestionModal from "@/app/components/AskQuestionModal";
// // // // // // // import { motion } from 'framer-motion';
// // // // // // // import Lightbox from 'react-image-lightbox';
// // // // // // // import 'react-image-lightbox/style.css';

// // // // // // // const db = getFirestore(app);

// // // // // // // export default function ExpertsDirectory() {
// // // // // // //   const [experts, setExperts] = useState([]);
// // // // // // //   const [filteredExperts, setFilteredExperts] = useState([]);
// // // // // // //   const [searchTerm, setSearchTerm] = useState("");
// // // // // // //   const [languageFilter, setLanguageFilter] = useState("");
// // // // // // //   const [locationFilter, setLocationFilter] = useState("");
// // // // // // //   const [specializationFilter, setSpecializationFilter] = useState("");
// // // // // // //   const [modalExpert, setModalExpert] = useState(null);
// // // // // // //   const [isLightboxOpen, setIsLightboxOpen] = useState(false);
// // // // // // //   const [selectedImage, setSelectedImage] = useState("");
// // // // // // //   const [lastDoc, setLastDoc] = useState(null);
// // // // // // //   const [loading, setLoading] = useState(false);
// // // // // // //   const [hasMore, setHasMore] = useState(true);
// // // // // // //   const searchParams = useSearchParams();
// // // // // // //   const router = useRouter();
// // // // // // //   const observerRef = useRef(null);
// // // // // // //   const loadMoreRef = useRef(null);

// // // // // // //   const keywords = useMemo(() => {
// // // // // // //     return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
// // // // // // //   }, [searchParams]);

// // // // // // //   const initialQuestion = useMemo(() => {
// // // // // // //     return searchParams.get("question") || "";
// // // // // // //   }, [searchParams]);

// // // // // // //   const toSentenceCase = (input) => {
// // // // // // //     if (!input) return "";
// // // // // // //     if (Array.isArray(input)) {
// // // // // // //       return input.map(item => toSentenceCase(item)).join(", ");
// // // // // // //     }
// // // // // // //     if (typeof input !== "string") return "";
// // // // // // //     return input
// // // // // // //       .toLowerCase()
// // // // // // //       .split(" ")
// // // // // // //       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
// // // // // // //       .join(" ");
// // // // // // //   };

// // // // // // //   const calculateTotalExperience = (experience) => {
// // // // // // //     if (!Array.isArray(experience) || experience.length === 0) return "0+";

// // // // // // //     const today = new Date();
// // // // // // //     let earliestStart = null;
// // // // // // //     let latestEnd = null;

// // // // // // //     experience.forEach(exp => {
// // // // // // //       const startDate = exp.startDate ? new Date(exp.startDate) : null;
// // // // // // //       const endDate = exp.endDate === "Present" ? today : exp.endDate ? new Date(exp.endDate) : null;

// // // // // // //       if (startDate && (!earliestStart || startDate < earliestStart)) {
// // // // // // //         earliestStart = startDate;
// // // // // // //       }
// // // // // // //       if (endDate && (!latestEnd || endDate > latestEnd)) {
// // // // // // //         latestEnd = endDate;
// // // // // // //       }
// // // // // // //     });

// // // // // // //     if (!earliestStart || !latestEnd || latestEnd < earliestStart) {
// // // // // // //       return "0+";
// // // // // // //     }

// // // // // // //     const totalMonths = (latestEnd.getFullYear() - earliestStart.getFullYear()) * 12 +
// // // // // // //                         (latestEnd.getMonth() - earliestStart.getMonth());

// // // // // // //     const years = Math.floor(totalMonths / 12);
// // // // // // //     return `${years}+`;
// // // // // // //   };

// // // // // // //   const formatPricing = (pricing) => {
// // // // // // //     if (!pricing) return "799/session";
// // // // // // //     const numeric = pricing.match(/\d+(\.\d+)?/)?.[0] || "799";
// // // // // // //     return `${numeric}/session`;
// // // // // // //   };

// // // // // // //   const normalizeText = (text) => {
// // // // // // //     if (!text || typeof text !== "string") return "";
// // // // // // //     return text
// // // // // // //       .toLowerCase()
// // // // // // //       .replace(/[^a-z0-9\s]/g, " ")
// // // // // // //       .replace(/\s+/g, " ")
// // // // // // //       .trim();
// // // // // // //   };

// // // // // // //   const handleSearchSubmit = (e) => {
// // // // // // //     e.preventDefault();
// // // // // // //     if (searchTerm.trim()) {
// // // // // // //       const formattedKeywords = normalizeText(searchTerm)
// // // // // // //         .split(" ")
// // // // // // //         .filter(Boolean)
// // // // // // //         .join(",");
// // // // // // //       router.push(`/ask-an-expert?keywords=${encodeURIComponent(formattedKeywords)}`);
// // // // // // //     } else {
// // // // // // //       router.push("");
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const openLightbox = (imageSrc) => {
// // // // // // //     setSelectedImage(imageSrc);
// // // // // // //     setIsLightboxOpen(true);
// // // // // // //   };

// // // // // // //   useEffect(() => {
// // // // // // //     if (keywords.length > 0) {
// // // // // // //       setSearchTerm(keywords.join(" "));
// // // // // // //     } else {
// // // // // // //       setSearchTerm("");
// // // // // // //     }
// // // // // // //   }, [keywords]);

// // // // // // //   const fetchExperts = async () => {
// // // // // // //     if (loading || !hasMore) return;
// // // // // // //     setLoading(true);
// // // // // // //     try {
// // // // // // //       const profilesQuery = lastDoc
// // // // // // //         ? query(collection(db, "Profiles"), limit(9), startAfter(lastDoc))
// // // // // // //         : query(collection(db, "Profiles"), limit(9));
// // // // // // //       const querySnapshot = await getDocs(profilesQuery);
// // // // // // //       const expertsData = querySnapshot.docs.map((doc) => {
// // // // // // //         const data = doc.data();
// // // // // // //         return {
// // // // // // //           id: doc.id,
// // // // // // //           fullName: toSentenceCase(data.fullName),
// // // // // // //           tagline: toSentenceCase(data.tagline),
// // // // // // //           languages: Array.isArray(data.languages) ? data.languages : [],
// // // // // // //           location: toSentenceCase(data.location),
// // // // // // //           expertise: Array.isArray(data.expertise) ? data.expertise.map(toSentenceCase) : [],
// // // // // // //           pricing: data.pricing,
// // // // // // //           responseTime: data.responseTime,
// // // // // // //           username: data.username,
// // // // // // //           photo: data.photo,
// // // // // // //           about: toSentenceCase(data.about),
// // // // // // //           certifications: toSentenceCase(data.certifications),
// // // // // // //           services: Array.isArray(data.services) ? data.services.map(toSentenceCase) : [],
// // // // // // //           regions: Array.isArray(data.regions) ? data.regions.map(toSentenceCase) : [],
// // // // // // //           experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
// // // // // // //             ...exp,
// // // // // // //             company: toSentenceCase(exp.company),
// // // // // // //             title: toSentenceCase(exp.title),
// // // // // // //           })) : [],
// // // // // // //           email: data.email || "",
// // // // // // //         };
// // // // // // //       });
// // // // // // //       setExperts(prev => [...prev, ...expertsData]);
// // // // // // //       setFilteredExperts(prev => [...prev, ...expertsData]);
// // // // // // //       setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
// // // // // // //       setHasMore(querySnapshot.docs.length === 9);
// // // // // // //     } catch (error) {
// // // // // // //       console.error("Error fetching experts:", error);
// // // // // // //     } finally {
// // // // // // //       setLoading(false);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   useEffect(() => {
// // // // // // //     fetchExperts();
// // // // // // //   }, []);

// // // // // // //   useEffect(() => {
// // // // // // //     const observer = new IntersectionObserver(
// // // // // // //       entries => {
// // // // // // //         if (entries[0].isIntersecting && hasMore && !loading) {
// // // // // // //           fetchExperts();
// // // // // // //         }
// // // // // // //       },
// // // // // // //       { threshold: 0.1 }
// // // // // // //     );
// // // // // // //     if (loadMoreRef.current) {
// // // // // // //       observer.observe(loadMoreRef.current);
// // // // // // //     }
// // // // // // //     observerRef.current = observer;
// // // // // // //     return () => {
// // // // // // //       if (observerRef.current) {
// // // // // // //         observerRef.current.disconnect();
// // // // // // //       }
// // // // // // //     };
// // // // // // //   }, [hasMore, loading]);

// // // // // // //   useEffect(() => {
// // // // // // //     let result = experts;

// // // // // // //     if (searchTerm) {
// // // // // // //       const searchTerms = normalizeText(searchTerm)
// // // // // // //         .split(" ")
// // // // // // //         .filter(term => term);
      
// // // // // // //       result = result
// // // // // // //         .map(expert => {
// // // // // // //           const searchableFields = [
// // // // // // //             normalizeText(expert.fullName),
// // // // // // //             normalizeText(expert.tagline),
// // // // // // //             normalizeText(expert.about),
// // // // // // //             normalizeText(expert.certifications),
// // // // // // //             ...expert.languages.map(normalizeText),
// // // // // // //             normalizeText(expert.location),
// // // // // // //             ...expert.services.map(normalizeText),
// // // // // // //             ...expert.expertise.map(normalizeText),
// // // // // // //             ...expert.regions.map(normalizeText),
// // // // // // //             ...expert.experience.map(exp => `${normalizeText(exp.company)} ${normalizeText(exp.title)}`),
// // // // // // //           ].filter(Boolean).join(" ");
          
// // // // // // //           const matchCount = searchTerms.reduce((count, term) => {
// // // // // // //             return count + (searchableFields.includes(term) ? 1 : 0);
// // // // // // //           }, 0);
          
// // // // // // //           return { expert, matchCount };
// // // // // // //         })
// // // // // // //         .filter(({ matchCount }) => matchCount > 0)
// // // // // // //         .sort((a, b) => b.matchCount - a.matchCount)
// // // // // // //         .map(({ expert }) => expert);
// // // // // // //     }

// // // // // // //     if (languageFilter) {
// // // // // // //       result = result.filter((expert) =>
// // // // // // //         expert.languages?.some(lang => normalizeText(lang).includes(normalizeText(languageFilter)))
// // // // // // //       );
// // // // // // //     }

// // // // // // //     if (locationFilter) {
// // // // // // //       result = result.filter((expert) =>
// // // // // // //         normalizeText(expert.location).includes(normalizeText(locationFilter))
// // // // // // //       );
// // // // // // //     }

// // // // // // //     if (specializationFilter) {
// // // // // // //       result = result.filter((expert) =>
// // // // // // //         expert.expertise?.some((expertise) =>
// // // // // // //           normalizeText(expertise).includes(normalizeText(specializationFilter))
// // // // // // //         )
// // // // // // //       );
// // // // // // //     }

// // // // // // //     setFilteredExperts(result);
// // // // // // //   }, [searchTerm, languageFilter, locationFilter, specializationFilter, experts]);

// // // // // // //   const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages || []))].map(toSentenceCase);
// // // // // // //   const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean).map(toSentenceCase);
// // // // // // //   const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))].map(toSentenceCase);

// // // // // // //   const truncateTagline = (tagline) => {
// // // // // // //     if (!tagline) return "";
// // // // // // //     return tagline.length > 150 ? `${tagline.substring(0, 130)}...` : tagline;
// // // // // // //   };

// // // // // // //   const handleClearFilters = () => {
// // // // // // //     setSearchTerm("");
// // // // // // //     setLanguageFilter("");
// // // // // // //     setLocationFilter("");
// // // // // // //     setSpecializationFilter("");
// // // // // // //     router.push("/ask-an-expert");
// // // // // // //   };

// // // // // // //   return (
// // // // // // //     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-16">
// // // // // // //       {modalExpert && (
// // // // // // //         <AskQuestionModal
// // // // // // //           expert={modalExpert}
// // // // // // //           onClose={() => setModalExpert(null)}
// // // // // // //           initialQuestion={decodeURIComponent(initialQuestion)}
// // // // // // //         />
// // // // // // //       )}
// // // // // // //       {isLightboxOpen && (
// // // // // // //         <Lightbox
// // // // // // //           mainSrc={selectedImage}
// // // // // // //           onCloseRequest={() => setIsLightboxOpen(false)}
// // // // // // //           imageTitle={selectedImage.includes('default.jpg') ? 'Default Profile Image' : 'Expert Profile Image'}
// // // // // // //         />
// // // // // // //       )}
// // // // // // //       <div className="max-w-7xl mx-auto mt-5">
// // // // // // //         <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
// // // // // // //           Real Experts. Real Answers. For Your Real Travel Plans.
// // // // // // //         </h1>
// // // // // // //         <p className="text-center text-gray-600 mb-4 text-sm sm:text-base">
// // // // // // //           Get answers from a trusted circle of verified travel experts across every domain from visas to vacations.
// // // // // // //         </p>

// // // // // // //         <div className="mb-4">
// // // // // // //           <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
// // // // // // //             <div className="flex-1 relative">
// // // // // // //               <FaGlobe className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // // // // //               <select
// // // // // // //                 value={languageFilter}
// // // // // // //                 onChange={(e) => setLanguageFilter(e.target.value)}
// // // // // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // // //               >
// // // // // // //                 <option value="">Language</option>
// // // // // // //                 {uniqueLanguages.map((lang) => (
// // // // // // //                   <option key={lang} value={lang}>
// // // // // // //                     {lang}
// // // // // // //                   </option>
// // // // // // //                 ))}
// // // // // // //               </select>
// // // // // // //             </div>
// // // // // // //             <div className="flex-1 relative">
// // // // // // //               <FaMapMarkerAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // // // // //               <select
// // // // // // //                 value={locationFilter}
// // // // // // //                 onChange={(e) => setLocationFilter(e.target.value)}
// // // // // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // // //               >
// // // // // // //                 <option value="">Location</option>
// // // // // // //                 {uniqueLocations.map((loc) => (
// // // // // // //                   <option key={loc} value={loc}>
// // // // // // //                     {loc}
// // // // // // //                   </option>
// // // // // // //                 ))}
// // // // // // //               </select>
// // // // // // //             </div>
// // // // // // //             <div className="flex-1 relative">
// // // // // // //               <FaUserTag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // // // // //               <select
// // // // // // //                 value={specializationFilter}
// // // // // // //                 onChange={(e) => setSpecializationFilter(e.target.value)}
// // // // // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // // //               >
// // // // // // //                 <option value="">Expertise</option>
// // // // // // //                 {uniqueSpecializations.map((spec) => (
// // // // // // //                   <option key={spec} value={spec}>
// // // // // // //                     {spec}
// // // // // // //                   </option>
// // // // // // //                 ))}
// // // // // // //               </select>
// // // // // // //             </div>
// // // // // // //             <div className="flex-1 flex items-center">
// // // // // // //               <button
// // // // // // //                 onClick={handleClearFilters}
// // // // // // //                 className="w-full flex items-center justify-center gap-5 px-2 py-1 bg-[#36013F] text-white rounded-full hover:bg-opacity-90 transition-all text-xs"
// // // // // // //               >
// // // // // // //                 <FaTimes />
// // // // // // //                 Clear
// // // // // // //               </button>
// // // // // // //             </div>
// // // // // // //           </div>
         
// // // // // // //           <div className="relative flex items-center gap-2">
// // // // // // //             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
// // // // // // //             <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
// // // // // // //               <input
// // // // // // //                 type="text"
// // // // // // //                 placeholder="Search keywords (e.g., visa travel documentation)"
// // // // // // //                 value={searchTerm}
// // // // // // //                 onChange={(e) => setSearchTerm(e.target.value)}
// // // // // // //                 className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // // //               />
// // // // // // //               <button
// // // // // // //                 type="submit"
// // // // // // //                 className="bg-[#36013F] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all text-sm"
// // // // // // //               >
// // // // // // //                 Search
// // // // // // //               </button>
// // // // // // //             </form>
// // // // // // //           </div>
// // // // // // //         </div>

// // // // // // //         {filteredExperts.length === 0 && (
// // // // // // //           <div className="text-center text-gray-600 py-8 text-sm">
// // // // // // //             <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
// // // // // // //           </div>
// // // // // // //         )}

// // // // // // //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
// // // // // // //           {filteredExperts.map((expert) => (
// // // // // // //             <motion.div
// // // // // // //               key={expert.id}
// // // // // // //               className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow"
// // // // // // //               initial={{ opacity: 0, y: 20 }}
// // // // // // //               animate={{ opacity: 1, y: 0 }}
// // // // // // //               transition={{ duration: 0.3 }}
// // // // // // //             >
// // // // // // //               <div className="flex items-center gap-3 mb-3">
// // // // // // //                 <button
// // // // // // //                   onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
// // // // // // //                   className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-[#36013F] shadow-sm"
// // // // // // //                 >
// // // // // // //                   <Image
// // // // // // //                     src={expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg'}
// // // // // // //                     alt={expert.fullName || 'Expert Profile'}
// // // // // // //                     fill
// // // // // // //                     sizes="60px"
// // // // // // //                     className="object-cover object-center rounded-full"
// // // // // // //                     priority={false}
// // // // // // //                   />
// // // // // // //                 </button>
// // // // // // //                 <div className="flex-1">
// // // // // // //                   <h2 className="text-base font-semibold text-gray-800">
// // // // // // //                     {expert.fullName || 'Unknown Expert'}
// // // // // // //                   </h2>
// // // // // // //                   <p className="text-xs text-gray-600 line-clamp-2">
// // // // // // //                     {truncateTagline(expert.tagline) || 'No tagline provided'}
// // // // // // //                   </p>
// // // // // // //                 </div>
// // // // // // //                 <div className="flex justify-center items-center py-1 space-y-0.5">
// // // // // // //                   <div className="text-primary border-2 border-primary rounded-lg px-2 w-[48px] flex flex-col items-center py-1">
// // // // // // //                     <h1 className="font-bold text-center text-base">{calculateTotalExperience(expert.experience) || 'No experience provided'}</h1>
// // // // // // //                     <span className="font-semibold text-xs text-center">YEARS</span>
// // // // // // //                   </div>
// // // // // // //                 </div>
// // // // // // //               </div>
// // // // // // //               <div className="space-y-3">
// // // // // // //                 <div className="flex flex-wrap gap-1.5">
// // // // // // //                   {expert.expertise?.map((expertise) => (
// // // // // // //                     <span
// // // // // // //                       key={expertise}
// // // // // // //                       className="bg-[#36013F] text-white text-xs px-1.5 py-0.5 rounded-full"
// // // // // // //                     >
// // // // // // //                       {expertise}
// // // // // // //                     </span>
// // // // // // //                   ))}
// // // // // // //                 </div>
// // // // // // //                 <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
// // // // // // //                   <p className="flex items-center gap-1.5">
// // // // // // //                     <FaRupeeSign className="text-[#36013F]" />
// // // // // // //                     {formatPricing(expert.pricing)}
// // // // // // //                   </p>
// // // // // // //                   <p className="flex items-center gap-1.5">
// // // // // // //                     <FaLanguage className="text-[#36013F]" />
// // // // // // //                     {toSentenceCase(expert.languages) || "English, Hindi"}
// // // // // // //                   </p>
// // // // // // //                   <p className="flex items-center gap-1.5">
// // // // // // //                     <FaMapMarkerAlt className="text-[#36013F]" />
// // // // // // //                     {expert.location || "Delhi, India"}
// // // // // // //                   </p>
// // // // // // //                   <p className="flex items-center gap-1.5">
// // // // // // //                     <FaClock className="text-[#36013F]" />
// // // // // // //                     {expert.responseTime || "10 mins"}
// // // // // // //                   </p>
// // // // // // //                 </div>
// // // // // // //               </div>
// // // // // // //               <div className="flex gap-2 mt-4">
// // // // // // //                 <Link href={`/experts/${expert.username}`} className="flex-1">
// // // // // // //                   <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
// // // // // // //                     View Profile
// // // // // // //                   </button>
// // // // // // //                 </Link>
// // // // // // //                 <button
// // // // // // //                   onClick={() => setModalExpert(expert)}
// // // // // // //                   className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
// // // // // // //                 >
// // // // // // //                   Ask Question
// // // // // // //                 </button>
// // // // // // //               </div>
// // // // // // //             </motion.div>
// // // // // // //           ))}
// // // // // // //         </div>
// // // // // // //         {hasMore && (
// // // // // // //           <div ref={loadMoreRef} className="h-10 flex justify-center items-center mt-4">
// // // // // // //             {loading && <p className="text-gray-600">Loading more experts...</p>}
// // // // // // //           </div>
// // // // // // //         )}
// // // // // // //       </div>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // }
// // // // // // "use client";

// // // // // // import { useState, useEffect, useMemo, useRef } from "react";
// // // // // // import Image from "next/image";
// // // // // // import Link from "next/link";
// // // // // // import { getFirestore, collection, getDocs, query, limit, startAfter } from "firebase/firestore";
// // // // // // import { app } from "@/lib/firebase";
// // // // // // import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaTimes, FaLanguage } from "react-icons/fa";
// // // // // // import { useSearchParams, useRouter } from "next/navigation";
// // // // // // import AskQuestionModal from "@/app/components/AskQuestionModal";
// // // // // // import { motion } from 'framer-motion';
// // // // // // import Lightbox from 'react-image-lightbox';
// // // // // // import 'react-image-lightbox/style.css';
// // // // // // import { Share2, MessageCircle } from "lucide-react";

// // // // // // const db = getFirestore(app);

// // // // // // export default function ExpertsDirectory() {
// // // // // //   const [experts, setExperts] = useState([]);
// // // // // //   const [filteredExperts, setFilteredExperts] = useState([]);
// // // // // //   const [searchTerm, setSearchTerm] = useState("");
// // // // // //   const [languageFilter, setLanguageFilter] = useState("");
// // // // // //   const [locationFilter, setLocationFilter] = useState("");
// // // // // //   const [specializationFilter, setSpecializationFilter] = useState("");
// // // // // //   const [modalExpert, setModalExpert] = useState(null);
// // // // // //   const [isLightboxOpen, setIsLightboxOpen] = useState(false);
// // // // // //   const [selectedImage, setSelectedImage] = useState("");
// // // // // //   const [lastDoc, setLastDoc] = useState(null);
// // // // // //   const [loading, setLoading] = useState(false);
// // // // // //   const [hasMore, setHasMore] = useState(true);
// // // // // //   const searchParams = useSearchParams();
// // // // // //   const router = useRouter();
// // // // // //   const observerRef = useRef(null);
// // // // // //   const loadMoreRef = useRef(null);

// // // // // //   const keywords = useMemo(() => {
// // // // // //     return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
// // // // // //   }, [searchParams]);

// // // // // //   const initialQuestion = useMemo(() => {
// // // // // //     return searchParams.get("question") || "";
// // // // // //   }, [searchParams]);

// // // // // //   const toSentenceCase = (input) => {
// // // // // //     if (!input) return "";
// // // // // //     if (Array.isArray(input)) {
// // // // // //       return input.map(item => toSentenceCase(item)).join(", ");
// // // // // //     }
// // // // // //     if (typeof input !== "string") return "";
// // // // // //     return input
// // // // // //       .toLowerCase()
// // // // // //       .split(" ")
// // // // // //       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
// // // // // //       .join(" ");
// // // // // //   };

// // // // // //   const calculateTotalExperience = (experience) => {
// // // // // //     if (!Array.isArray(experience) || experience.length === 0) return "0+";

// // // // // //     const today = new Date();
// // // // // //     let earliestStart = null;
// // // // // //     let latestEnd = null;

// // // // // //     experience.forEach(exp => {
// // // // // //       const startDate = exp.startDate ? new Date(exp.startDate) : null;
// // // // // //       const endDate = exp.endDate === "Present" ? today : exp.endDate ? new Date(exp.endDate) : null;

// // // // // //       if (startDate && (!earliestStart || startDate < earliestStart)) {
// // // // // //         earliestStart = startDate;
// // // // // //       }
// // // // // //       if (endDate && (!latestEnd ||  endDate > latestEnd)) {
// // // // // //         latestEnd = endDate;
// // // // // //       }
// // // // // //     });

// // // // // //     if (!earliestStart || !latestEnd || latestEnd < earliestStart) {
// // // // // //       return "0+";
// // // // // //     }

// // // // // //     const totalMonths = (latestEnd.getFullYear() - earliestStart.getFullYear()) * 12 +
// // // // // //                         (latestEnd.getMonth() - earliestStart.getMonth());

// // // // // //     const years = Math.floor(totalMonths / 12);
// // // // // //     return `${years}+`;
// // // // // //   };

// // // // // //   const formatPricing = (pricing) => {
// // // // // //     if (!pricing) return "799/session";
// // // // // //     const numeric = pricing.match(/\d+(\.\d+)?/)?.[0] || "799";
// // // // // //     return `${numeric}/session`;
// // // // // //   };

// // // // // //   const normalizeText = (text) => {
// // // // // //     if (!text || typeof text !== "string") return "";
// // // // // //     return text
// // // // // //       .toLowerCase()
// // // // // //       .replace(/[^a-z0-9\s]/g, " ")
// // // // // //       .replace(/\s+/g, " ")
// // // // // //       .trim();
// // // // // //   };

// // // // // //   const handleSearchSubmit = (e) => {
// // // // // //     e.preventDefault();
// // // // // //     if (searchTerm.trim()) {
// // // // // //       const formattedKeywords = normalizeText(searchTerm)
// // // // // //         .split(" ")
// // // // // //         .filter(Boolean)
// // // // // //         .join(",");
// // // // // //       router.push(`/ask-an-expert?keywords=${encodeURIComponent(formattedKeywords)}`);
// // // // // //     } else {
// // // // // //       router.push("/ask-an-expert");
// // // // // //     }
// // // // // //   };

// // // // // //   const openLightbox = (imageSrc) => {
// // // // // //     setSelectedImage(imageSrc);
// // // // // //     setIsLightboxOpen(true);
// // // // // //   };



// // // // // //   useEffect(() => {
// // // // // //     if (keywords.length > 0) {
// // // // // //       setSearchTerm(keywords.join(" "));
// // // // // //     } else {
// // // // // //       setSearchTerm("");
// // // // // //     }
// // // // // //   }, [keywords]);

// // // // // //   const fetchExperts = async () => {
// // // // // //     if (loading || !hasMore) return;
// // // // // //     setLoading(true);
// // // // // //     try {
// // // // // //       const profilesQuery = lastDoc
// // // // // //         ? query(collection(db, "Profiles"), limit(9), startAfter(lastDoc))
// // // // // //         : query(collection(db, "Profiles"), limit(9));
// // // // // //       const querySnapshot = await getDocs(profilesQuery);
// // // // // //       const expertsData = querySnapshot.docs.map((doc) => {
// // // // // //         const data = doc.data();
// // // // // //         return {
// // // // // //           id: doc.id,
// // // // // //           fullName: toSentenceCase(data.fullName),
// // // // // //           tagline: toSentenceCase(data.tagline),
// // // // // //           languages: Array.isArray(data.languages) ? data.languages : [],
// // // // // //           location: toSentenceCase(data.location),
// // // // // //           expertise: Array.isArray(data.expertise) ? data.expertise.map(toSentenceCase) : [],
// // // // // //           pricing: data.pricing,
// // // // // //           responseTime: data.responseTime,
// // // // // //           username: data.username,
// // // // // //           photo: data.photo,
// // // // // //           about: toSentenceCase(data.about),
// // // // // //           certifications: toSentenceCase(data.certifications),
// // // // // //           services: Array.isArray(data.services) ? data.services.map(toSentenceCase) : [],
// // // // // //           regions: Array.isArray(data.regions) ? data.regions.map(toSentenceCase) : [],
// // // // // //           experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
// // // // // //             ...exp,
// // // // // //             company: toSentenceCase(exp.company),
// // // // // //             title: toSentenceCase(exp.title),
// // // // // //           })) : [],
// // // // // //           email: data.email || "",
// // // // // //         };
// // // // // //       });
// // // // // //       setExperts(prev => [...prev, ...expertsData]);
// // // // // //       setFilteredExperts(prev => [...prev, ...expertsData]);
// // // // // //       setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
// // // // // //       setHasMore(querySnapshot.docs.length === 9);
// // // // // //     } catch (error) {
// // // // // //       console.error("Error fetching experts:", error);
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   useEffect(() => {
// // // // // //     fetchExperts();
// // // // // //   }, []);

// // // // // //   useEffect(() => {
// // // // // //     const observer = new IntersectionObserver(
// // // // // //       entries => {
// // // // // //         if (entries[0].isIntersecting && hasMore && !loading) {
// // // // // //           fetchExperts();
// // // // // //         }
// // // // // //       },
// // // // // //       { threshold: 0.1 }
// // // // // //     );
// // // // // //     if (loadMoreRef.current) {
// // // // // //       observer.observe(loadMoreRef.current);
// // // // // //     }
// // // // // //     observerRef.current = observer;
// // // // // //     return () => {
// // // // // //       if (observerRef.current) {
// // // // // //         observerRef.current.disconnect();
// // // // // //       }
// // // // // //     };
// // // // // //   }, [hasMore, loading]);

// // // // // //   useEffect(() => {
// // // // // //     let result = experts;

// // // // // //     if (searchTerm) {
// // // // // //       const searchTerms = normalizeText(searchTerm)
// // // // // //         .split(" ")
// // // // // //         .filter(term => term);
      
// // // // // //       result = result
// // // // // //         .map(expert => {
// // // // // //           const searchableFields = [
// // // // // //             normalizeText(expert.fullName),
// // // // // //             normalizeText(expert.tagline),
// // // // // //             normalizeText(expert.about),
// // // // // //             normalizeText(expert.certifications),
// // // // // //             ...expert.languages.map(normalizeText),
// // // // // //             normalizeText(expert.location),
// // // // // //             ...expert.services.map(normalizeText),
// // // // // //             ...expert.expertise.map(normalizeText),
// // // // // //             ...expert.regions.map(normalizeText),
// // // // // //             ...expert.experience.map(exp => `${normalizeText(exp.company)} ${normalizeText(exp.title)}`),
// // // // // //           ].filter(Boolean).join(" ");
          
// // // // // //           const matchCount = searchTerms.reduce((count, term) => {
// // // // // //             return count + (searchableFields.includes(term) ? 1 : 0);
// // // // // //           }, 0);
          
// // // // // //           return { expert, matchCount };
// // // // // //         })
// // // // // //         .filter(({ matchCount }) => matchCount > 0)
// // // // // //         .sort((a, b) => b.matchCount - a.matchCount)
// // // // // //         .map(({ expert }) => expert);
// // // // // //     }

// // // // // //     if (languageFilter) {
// // // // // //       result = result.filter((expert) =>
// // // // // //         expert.languages?.some(lang => normalizeText(lang).includes(normalizeText(languageFilter)))
// // // // // //       );
// // // // // //     }

// // // // // //     if (locationFilter) {
// // // // // //       result = result.filter((expert) =>
// // // // // //         normalizeText(expert.location).includes(normalizeText(locationFilter))
// // // // // //       );
// // // // // //     }

// // // // // //     if (specializationFilter) {
// // // // // //       result = result.filter((expert) =>
// // // // // //         expert.expertise?.some((expertise) =>
// // // // // //           normalizeText(expertise).includes(normalizeText(specializationFilter))
// // // // // //         )
// // // // // //       );
// // // // // //     }

// // // // // //     setFilteredExperts(result);
// // // // // //   }, [searchTerm, languageFilter, locationFilter, specializationFilter, experts]);

// // // // // //   const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages || []))].map(toSentenceCase);
// // // // // //   const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean).map(toSentenceCase);
// // // // // //   const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))].map(toSentenceCase);

// // // // // //   const truncateTagline = (tagline) => {
// // // // // //     if (!tagline) return "";
// // // // // //     return tagline.length > 150 ? `${tagline.substring(0, 130)}...` : tagline;
// // // // // //   };

// // // // // //   const handleClearFilters = () => {
// // // // // //     setSearchTerm("");
// // // // // //     setLanguageFilter("");
// // // // // //     setLocationFilter("");
// // // // // //     setSpecializationFilter("");
// // // // // //     router.push("/ask-an-expert");
// // // // // //   };

// // // // // //   return (
// // // // // //     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-16">
// // // // // //       {modalExpert && (
// // // // // //         <AskQuestionModal
// // // // // //           expert={modalExpert}
// // // // // //           onClose={() => setModalExpert(null)}
// // // // // //           initialQuestion={decodeURIComponent(initialQuestion)}
// // // // // //         />
// // // // // //       )}
// // // // // //       {isLightboxOpen && (
// // // // // //         <Lightbox
// // // // // //           mainSrc={selectedImage}
// // // // // //           onCloseRequest={() => setIsLightboxOpen(false)}
// // // // // //           imageTitle={selectedImage.includes('default.jpg') ? 'Default Profile Image' : 'Expert Profile Image'}
// // // // // //         />
// // // // // //       )}
// // // // // //       <div className="max-w-7xl mx-auto mt-5">
// // // // // //         <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
// // // // // //           Real Experts. Real Answers. For Your Real Travel Plans.
// // // // // //         </h1>
// // // // // //         <p className="text-center text-gray-600 mb-4 text-sm sm:text-base">
// // // // // //           Get answers from a trusted circle of verified travel experts across every domain from visas to vacations.
// // // // // //         </p>

// // // // // //         <div className="mb-4">
// // // // // //           <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
// // // // // //             <div className="flex-1 relative">
// // // // // //               <FaGlobe className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // // // //               <select
// // // // // //                 value={languageFilter}
// // // // // //                 onChange={(e) => setLanguageFilter(e.target.value)}
// // // // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // //               >
// // // // // //                 <option value="">Language</option>
// // // // // //                 {uniqueLanguages.map((lang) => (
// // // // // //                   <option key={lang} value={lang}>
// // // // // //                     {lang}
// // // // // //                   </option>
// // // // // //                 ))}
// // // // // //               </select>
// // // // // //             </div>
// // // // // //             <div className="flex-1 relative">
// // // // // //               <FaMapMarkerAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // // // //               <select
// // // // // //                 value={locationFilter}
// // // // // //                 onChange={(e) => setLocationFilter(e.target.value)}
// // // // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // //               >
// // // // // //                 <option value="">Location</option>
// // // // // //                 {uniqueLocations.map((loc) => (
// // // // // //                   <option key={loc} value={loc}>
// // // // // //                     {loc}
// // // // // //                   </option>
// // // // // //                 ))}
// // // // // //               </select>
// // // // // //             </div>
// // // // // //             <div className="flex-1 relative">
// // // // // //               <FaUserTag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // // // //               <select
// // // // // //                 value={specializationFilter}
// // // // // //                 onChange={(e) => setSpecializationFilter(e.target.value)}
// // // // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // //               >
// // // // // //                 <option value="">Expertise</option>
// // // // // //                 {uniqueSpecializations.map((spec) => (
// // // // // //                   <option key={spec} value={spec}>
// // // // // //                     {spec}
// // // // // //                   </option>
// // // // // //                 ))}
// // // // // //               </select>
// // // // // //             </div>
// // // // // //             <div className="flex-1 flex items-center">
// // // // // //               <button
// // // // // //                 onClick={handleClearFilters}
// // // // // //                 className="w-full flex items-center justify-center gap-5 px-2 py-1 bg-[#36013F] text-white rounded-full hover:bg-opacity-90 transition-all text-xs"
// // // // // //               >
// // // // // //                 <FaTimes />
// // // // // //                 Clear
// // // // // //               </button>
// // // // // //             </div>
// // // // // //           </div>
         
// // // // // //           <div className="relative flex items-center gap-2">
// // // // // //             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
// // // // // //             <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
// // // // // //               <input
// // // // // //                 type="text"
// // // // // //                 placeholder="Search keywords (e.g., visa travel documentation)"
// // // // // //                 value={searchTerm}
// // // // // //                 onChange={(e) => setSearchTerm(e.target.value)}
// // // // // //                 className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // //               />
// // // // // //               <button
// // // // // //                 type="submit"
// // // // // //                 className="bg-[#36013F] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all text-sm"
// // // // // //               >
// // // // // //                 Search
// // // // // //               </button>
// // // // // //             </form>
// // // // // //           </div>
// // // // // //         </div>

// // // // // //         {filteredExperts.length === 0 && (
// // // // // //           <div className="text-center text-gray-600 py-8 text-sm">
// // // // // //             <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
// // // // // //           </div>
// // // // // //         )}

// // // // // //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
// // // // // //           {filteredExperts.map((expert) => (
// // // // // //             <motion.div
// // // // // //               key={expert.id}
// // // // // //               className="bg-white sm:bg-white rounded-xl sm:rounded-xl shadow-lg sm:shadow-lg p-4 sm:p-4 border sm:border border-gray-200 sm:border-gray-200 hover:shadow-xl sm:hover:shadow-xl transition-shadow sm:transition-shadow sm:block hidden"
// // // // // //               initial={{ opacity: 0, y: 20 }}
// // // // // //               animate={{ opacity: 1, y: 0 }}
// // // // // //               transition={{ duration: 0.3 }}
// // // // // //             >
// // // // // //               <div className="flex items-center gap-3 mb-3">
// // // // // //                 <button
// // // // // //                   onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
// // // // // //                   className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-[#36013F] shadow-sm"
// // // // // //                 >
// // // // // //                   <Image
// // // // // //                     src={expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg'}
// // // // // //                     alt={expert.fullName || 'Expert Profile'}
// // // // // //                     fill
// // // // // //                     sizes="60px"
// // // // // //                     className="object-cover object-center rounded-full"
// // // // // //                     priority={false}
// // // // // //                   />
// // // // // //                 </button>
// // // // // //                 <div className="flex-1">
// // // // // //                   <h2 className="text-base font-semibold text-gray-800">
// // // // // //                     {expert.fullName || 'Unknown Expert'}
// // // // // //                   </h2>
// // // // // //                   <p className="text-xs text-gray-600 line-clamp-2">
// // // // // //                     {truncateTagline(expert.tagline) || 'No tagline provided'}
// // // // // //                   </p>
// // // // // //                 </div>
// // // // // //                 <div className="flex justify-center items-center py-1 space-y-0.5">
// // // // // //                   <div className="text-primary border-2 border-primary rounded-lg px-2 w-[48px] flex flex-col items-center py-1">
// // // // // //                     <h1 className="font-bold text-center text-base">{calculateTotalExperience(expert.experience) || 'No experience provided'}</h1>
// // // // // //                     <span className="font-semibold text-xs text-center">YEARS</span>
// // // // // //                   </div>
// // // // // //                 </div>
// // // // // //               </div>
// // // // // //               <div className="space-y-3">
// // // // // //                 <div className="flex flex-wrap gap-1.5">
// // // // // //                   {expert.expertise?.map((expertise) => (
// // // // // //                     <span
// // // // // //                       key={expertise}
// // // // // //                       className="bg-[#36013F] text-white text-xs px-1.5 py-0.5 rounded-full"
// // // // // //                     >
// // // // // //                       {expertise}
// // // // // //                     </span>
// // // // // //                   ))}
// // // // // //                 </div>
// // // // // //                 <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
// // // // // //                   <p className="flex items-center gap-1.5">
// // // // // //                     <FaRupeeSign className="text-[#36013F]" />
// // // // // //                     {formatPricing(expert.pricing)}
// // // // // //                   </p>
// // // // // //                   <p className="flex items-center gap-1.5">
// // // // // //                     <FaLanguage className="text-[#36013F]" />
// // // // // //                     {toSentenceCase(expert.languages) || "English, Hindi"}
// // // // // //                   </p>
// // // // // //                   <p className="flex items-center gap-1.5">
// // // // // //                     <FaMapMarkerAlt className="text-[#36013F]" />
// // // // // //                     {expert.location || "Delhi, India"}
// // // // // //                   </p>
// // // // // //                   <p className="flex items-center gap-1.5">
// // // // // //                     <FaClock className="text-[#36013F]" />
// // // // // //                     {expert.responseTime || "10 mins"}
// // // // // //                   </p>
// // // // // //                 </div>
// // // // // //               </div>
// // // // // //               <div className="flex gap-2 mt-4">
// // // // // //                 <Link href={`/experts/${expert.username}`} className="flex-1">
// // // // // //                   <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
// // // // // //                     View Profile
// // // // // //                   </button>
// // // // // //                 </Link>
// // // // // //                 <button
// // // // // //                   onClick={() => setModalExpert(expert)}
// // // // // //                   className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
// // // // // //                 >
// // // // // //                   Ask Question
// // // // // //                 </button>
// // // // // //               </div>
// // // // // //             </motion.div>
// // // // // //           ))}
// // // // // //           {filteredExperts.map((expert) => (
// // // // // //             <motion.aside
// // // // // //               key={expert.id}
// // // // // //               className="lg:col-span-1 space-y-4 sm:hidden"
// // // // // //               initial={{ opacity: 0, y: 20 }}
// // // // // //               animate={{ opacity: 1, y: 0 }}
// // // // // //               transition={{ duration: 0.3 }}
// // // // // //             >
// // // // // //               <div className="bg-[#36013F] rounded-3xl shadow-lg p-6 text-center relative">
// // // // // //                 <div className="mb-4 relative">
// // // // // //                   <button
// // // // // //                     onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
// // // // // //                     className="w-28 h-28 rounded-full border-4 border-[#F4D35E] object-cover mx-auto shadow-md overflow-hidden"
// // // // // //                   >
// // // // // //                     <Image
// // // // // //                       src={expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg'}
// // // // // //                       alt={expert.fullName || 'Expert Profile'}
// // // // // //                       width={112}
// // // // // //                       height={112}
// // // // // //                       className="rounded-full object-cover mx-auto shadow-md"
// // // // // //                       priority={false}
// // // // // //                     />
// // // // // //                   </button>
// // // // // //                   <div className="flex justify-center items-center py-1 absolute top-0 right-0 space-y-0.5">
// // // // // //                     <div className="text-[#F4D35E] border-2 border-[#F4D35E] rounded-lg px-2 w-[48px] flex flex-col items-center">
// // // // // //                       <h1 className="font-bold text-center text-base">{calculateTotalExperience(expert.experience) || '0+'}</h1>
// // // // // //                       <span className="font-semibold text-xs text-center">YEARS</span>
// // // // // //                     </div>
// // // // // //                   </div>
// // // // // //                 </div>
// // // // // //                 <p className="text-sm mt-1 text-white">@{expert.username || 'unknown'}</p>
// // // // // //                 <h1
// // // // // //                   className="text-xl font-semibold text-white"
// // // // // //                   style={{ fontFamily: "'DM Serif Display', serif" }}
// // // // // //                 >
// // // // // //                   {expert.fullName || 'Unknown Expert'}
// // // // // //                 </h1>
// // // // // //                 {expert.title && (
// // // // // //                   <p className="text-sm mt-1 text-white">{expert.title}</p>
// // // // // //                 )}
// // // // // //                 {expert.tagline && (
// // // // // //                   <p className="text-sm mt-1 text-white">{truncateTagline(expert.tagline) || 'No tagline provided'}</p>
// // // // // //                 )}
// // // // // //                 <span className="inline-flex items-center gap-1 bg-[#F4D35E] text-black text-xs font-medium px-3 py-1 mt-2 rounded-full">
// // // // // //                   <svg
// // // // // //                     xmlns="http://www.w3.org/2000/svg"
// // // // // //                     viewBox="0 0 24 24"
// // // // // //                     fill="currentColor"
// // // // // //                     className="w-4 h-4"
// // // // // //                   >
// // // // // //                     <path
// // // // // //                       fillRule="evenodd"
// // // // // //                       d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 2.122 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
// // // // // //                       clipRule="evenodd"
// // // // // //                     />
// // // // // //                   </svg>
// // // // // //                   Verified by Xmytravel
// // // // // //                 </span>
// // // // // //                 <div className="mt-4 text-sm text-left space-y-2 text-white">
// // // // // //                   {expert.location && (
// // // // // //                     <p className="flex items-center gap-2">
// // // // // //                       <svg
// // // // // //                         xmlns="http://www.w3.org/2000/svg"
// // // // // //                         fill="currentColor"
// // // // // //                         viewBox="0 0 24 24"
// // // // // //                         className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// // // // // //                       >
// // // // // //                         <path
// // // // // //                           fillRule="evenodd"
// // // // // //                           d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
// // // // // //                           clipRule="evenodd"
// // // // // //                         />
// // // // // //                       </svg>
// // // // // //                       {expert.location || 'Delhi, India'}
// // // // // //                     </p>
// // // // // //                   )}
// // // // // //                   {expert.languages && (
// // // // // //                     <p className="flex items-center gap-2">
// // // // // //                       <svg
// // // // // //                         xmlns="http://www.w3.org/2000/svg"
// // // // // //                         viewBox="0 0 24 24"
// // // // // //                         fill="currentColor"
// // // // // //                         className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// // // // // //                       >
// // // // // //                         <path
// // // // // //                           fillRule="evenodd"
// // // // // //                           d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 1.357L14.25 7.5l.165.33a.809.809 0 0 1-1.086 1.085l-.604-.302a1.125 1.125 0 0 0-1.298.21.combined.l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 0 1-2.288 4.04l-.723.724a1.125 1.125 0 0 1-1.298.21l-.153-.076a1.125 1.125 0 0 1-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 0 1-.21-1.298L9.75 12l-1.64-1.64a6 6 0 0 1-1.676-3.257l-.172-1.03Z"
// // // // // //                           clipRule="evenodd"
// // // // // //                         />
// // // // // //                       </svg>
// // // // // //                       Languages: {toSentenceCase(expert.languages) || 'English, Hindi'}
// // // // // //                     </p>
// // // // // //                   )}
// // // // // //                   {expert.responseTime && (
// // // // // //                     <p className="flex items-center gap-2">
// // // // // //                       <svg
// // // // // //                         xmlns="http://www.w3.org/2000/svg"
// // // // // //                         fill="currentColor"
// // // // // //                         viewBox="0 0 24 24"
// // // // // //                         className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// // // // // //                       >
// // // // // //                         <path
// // // // // //                           fillRule="evenodd"
// // // // // //                           d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
// // // // // //                           clipRule="evenodd"
// // // // // //                         />
// // // // // //                       </svg>
// // // // // //                       {expert.responseTime || '10 mins'}
// // // // // //                     </p>
// // // // // //                   )}
// // // // // //                   {expert.pricing && (
// // // // // //                     <p className="flex items-center gap-2">
// // // // // //                       <svg
// // // // // //                         xmlns="http://www.w3.org/2000/svg"
// // // // // //                         fill="currentColor"
// // // // // //                         viewBox="0 0 24 24"
// // // // // //                         className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// // // // // //                       >
// // // // // //                         <path
// // // // // //                           fillRule="evenodd"
// // // // // //                           d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 7.5A.75.75 0 0 0 9 9h1.5c.98 0 1.813.626 2.122 1.5H9A.75.75 0 0 0 9 12h3.622a2.251 2.251 0 0 1-2.122 1.5H9a.75.75 0 0 0-.53 1.28l3 3a.75.75 0 1 0 1.06-1.06L10.8 14.988A3.752 3.752 0 0 0 14.175 12H15a.75.75 0 0 0 0-1.5h-.825A3.733 3.733 0 0 0 13.5 9H15a.75.75 0 0 0 0-1.5H9Z"
// // // // // //                           clipRule="evenodd"
// // // // // //                         />
// // // // // //                       </svg>
// // // // // //                       {formatPricing(expert.pricing)}
// // // // // //                     </p>
// // // // // //                   )}
// // // // // //                 </div>
// // // // // //                 <div className="flex gap-2 mt-4">
// // // // // //                   <Link href={`/experts/${expert.username}`} className="flex-1">
// // // // // //                     <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
// // // // // //                       View Profile
// // // // // //                     </button>
// // // // // //                   </Link>
// // // // // //                   <button
// // // // // //                     onClick={() => setModalExpert(expert)}
// // // // // //                     className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
// // // // // //                   >
// // // // // //                     Ask Question
// // // // // //                   </button>
// // // // // //                 </div>
             
// // // // // //               </div>
// // // // // //             </motion.aside>
// // // // // //           ))}
// // // // // //         </div>
// // // // // //         {hasMore && (
// // // // // //           <div ref={loadMoreRef} className="h-10 flex justify-center items-center mt-4">
// // // // // //             {loading && <p className="text-gray-600">Loading more experts...</p>}
// // // // // //           </div>
// // // // // //         )}
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // }

// // // // // "use client";

// // // // // import { useState, useEffect, useMemo, useRef } from "react";
// // // // // import Image from "next/image";
// // // // // import Link from "next/link";
// // // // // import { getFirestore, collection, getDocs, query, limit, startAfter } from "firebase/firestore";
// // // // // import { app } from "@/lib/firebase";
// // // // // import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaTimes, FaLanguage } from "react-icons/fa";
// // // // // import { useSearchParams, useRouter } from "next/navigation";
// // // // // import AskQuestionModal from "@/app/components/AskQuestionModal";
// // // // // import { motion, AnimatePresence } from 'framer-motion';
// // // // // import Lightbox from 'react-image-lightbox';
// // // // // import 'react-image-lightbox/style.css';
// // // // // import { Share2, MessageCircle } from "lucide-react";

// // // // // const db = getFirestore(app);

// // // // // export default function ExpertsDirectory() {
// // // // //   const [experts, setExperts] = useState([]);
// // // // //   const [filteredExperts, setFilteredExperts] = useState([]);
// // // // //   const [searchTerm, setSearchTerm] = useState("");
// // // // //   const [languageFilter, setLanguageFilter] = useState("");
// // // // //   const [locationFilter, setLocationFilter] = useState("");
// // // // //   const [specializationFilter, setSpecializationFilter] = useState("");
// // // // //   const [modalExpert, setModalExpert] = useState(null);
// // // // //   const [isLightboxOpen, setIsLightboxOpen] = useState(false);
// // // // //   const [selectedImage, setSelectedImage] = useState("");
// // // // //   const [lastDoc, setLastDoc] = useState(null);
// // // // //   const [loading, setLoading] = useState(false);
// // // // //   const [hasMore, setHasMore] = useState(true);
// // // // //   const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
// // // // //   const searchParams = useSearchParams();
// // // // //   const router = useRouter();
// // // // //   const observerRef = useRef(null);
// // // // //   const loadMoreRef = useRef(null);
// // // // //   const mobileCardRef = useRef(null);

// // // // //   const keywords = useMemo(() => {
// // // // //     return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
// // // // //   }, [searchParams]);

// // // // //   const initialQuestion = useMemo(() => {
// // // // //     return searchParams.get("question") || "";
// // // // //   }, [searchParams]);

// // // // //   const toSentenceCase = (input) => {
// // // // //     if (!input) return "";
// // // // //     if (Array.isArray(input)) {
// // // // //       return input.map(item => toSentenceCase(item)).join(", ");
// // // // //     }
// // // // //     if (typeof input !== "string") return "";
// // // // //     return input
// // // // //       .toLowerCase()
// // // // //       .split(" ")
// // // // //       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
// // // // //       .join(" ");
// // // // //   };

// // // // //   const calculateTotalExperience = (experience) => {
// // // // //     if (!Array.isArray(experience) || experience.length === 0) return "0+";

// // // // //     const today = new Date();
// // // // //     let earliestStart = null;
// // // // //     let latestEnd = null;

// // // // //     experience.forEach(exp => {
// // // // //       const startDate = exp.startDate ? new Date(exp.startDate) : null;
// // // // //       const endDate = exp.endDate === "Present" ? today : exp.endDate ? new Date(exp.endDate) : null;

// // // // //       if (startDate && (!earliestStart || startDate < earliestStart)) {
// // // // //         earliestStart = startDate;
// // // // //       }
// // // // //       if (endDate && (!latestEnd || endDate > latestEnd)) {
// // // // //         latestEnd = endDate;
// // // // //       }
// // // // //     });

// // // // //     if (!earliestStart || !latestEnd || latestEnd < earliestStart) {
// // // // //       return "0+";
// // // // //     }

// // // // //     const totalMonths = (latestEnd.getFullYear() - earliestStart.getFullYear()) * 12 +
// // // // //                         (latestEnd.getMonth() - earliestStart.getMonth());

// // // // //     const years = Math.floor(totalMonths / 12);
// // // // //     return `${years}+`;
// // // // //   };

// // // // //   const formatPricing = (pricing) => {
// // // // //     if (!pricing) return "799/session";
// // // // //     const numeric = pricing.match(/\d+(\.\d+)?/)?.[0] || "799";
// // // // //     return `${numeric}/session`;
// // // // //   };

// // // // //   const normalizeText = (text) => {
// // // // //     if (!text || typeof text !== "string") return "";
// // // // //     return text
// // // // //       .toLowerCase()
// // // // //       .replace(/[^a-z0-9\s]/g, " ")
// // // // //       .replace(/\s+/g, " ")
// // // // //       .trim();
// // // // //   };

// // // // //   const handleSearchSubmit = (e) => {
// // // // //     e.preventDefault();
// // // // //     if (searchTerm.trim()) {
// // // // //       const formattedKeywords = normalizeText(searchTerm)
// // // // //         .split(" ")
// // // // //         .filter(Boolean)
// // // // //         .join(",");
// // // // //       router.push(`/ask-an-expert?keywords=${encodeURIComponent(formattedKeywords)}`);
// // // // //     } else {
// // // // //       router.push("/ask-an-expert");
// // // // //     }
// // // // //     setCurrentMobileIndex(0); // Reset mobile index on new search
// // // // //   };

// // // // //   const openLightbox = (imageSrc) => {
// // // // //     setSelectedImage(imageSrc);
// // // // //     setIsLightboxOpen(true);
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     if (keywords.length > 0) {
// // // // //       setSearchTerm(keywords.join(" "));
// // // // //     } else {
// // // // //       setSearchTerm("");
// // // // //     }
// // // // //     setCurrentMobileIndex(0); // Reset mobile index when keywords change
// // // // //   }, [keywords]);

// // // // //   const fetchExperts = async () => {
// // // // //     if (loading || !hasMore) return;
// // // // //     setLoading(true);
// // // // //     try {
// // // // //       const profilesQuery = lastDoc
// // // // //         ? query(collection(db, "Profiles"), limit(9), startAfter(lastDoc))
// // // // //         : query(collection(db, "Profiles"), limit(9));
// // // // //       const querySnapshot = await getDocs(profilesQuery);
// // // // //       const expertsData = querySnapshot.docs.map((doc) => {
// // // // //         const data = doc.data();
// // // // //         return {
// // // // //           id: doc.id,
// // // // //           fullName: toSentenceCase(data.fullName),
// // // // //           tagline: toSentenceCase(data.tagline),
// // // // //           languages: Array.isArray(data.languages) ? data.languages : [],
// // // // //           location: toSentenceCase(data.location),
// // // // //           expertise: Array.isArray(data.expertise) ? data.expertise.map(toSentenceCase) : [],
// // // // //           pricing: data.pricing,
// // // // //           responseTime: data.responseTime,
// // // // //           username: data.username,
// // // // //           photo: data.photo,
// // // // //           about: toSentenceCase(data.about),
// // // // //           certifications: toSentenceCase(data.certifications),
// // // // //           services: Array.isArray(data.services) ? data.services.map(toSentenceCase) : [],
// // // // //           regions: Array.isArray(data.regions) ? data.regions.map(toSentenceCase) : [],
// // // // //           experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
// // // // //             ...exp,
// // // // //             company: toSentenceCase(exp.company),
// // // // //             title: toSentenceCase(exp.title),
// // // // //           })) : [],
// // // // //           email: data.email || "",
// // // // //         };
// // // // //       });
// // // // //       setExperts(prev => [...prev, ...expertsData]);
// // // // //       setFilteredExperts(prev => [...prev, ...expertsData]);
// // // // //       setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
// // // // //       setHasMore(querySnapshot.docs.length === 9);
// // // // //     } catch (error) {
// // // // //       console.error("Error fetching experts:", error);
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     fetchExperts();
// // // // //   }, []);

// // // // //   useEffect(() => {
// // // // //     let result = experts;

// // // // //     if (searchTerm) {
// // // // //       const searchTerms = normalizeText(searchTerm)
// // // // //         .split(" ")
// // // // //         .filter(term => term);
      
// // // // //       result = result
// // // // //         .map(expert => {
// // // // //           const searchableFields = [
// // // // //             normalizeText(expert.fullName),
// // // // //             normalizeText(expert.tagline),
// // // // //             normalizeText(expert.about),
// // // // //             normalizeText(expert.certifications),
// // // // //             ...expert.languages.map(normalizeText),
// // // // //             normalizeText(expert.location),
// // // // //             ...expert.services.map(normalizeText),
// // // // //             ...expert.expertise.map(normalizeText),
// // // // //             ...expert.regions.map(normalizeText),
// // // // //             ...expert.experience.map(exp => `${normalizeText(exp.company)} ${normalizeText(exp.title)}`),
// // // // //           ].filter(Boolean).join(" ");
          
// // // // //           const matchCount = searchTerms.reduce((count, term) => {
// // // // //             return count + (searchableFields.includes(term) ? 1 : 0);
// // // // //           }, 0);
          
// // // // //           return { expert, matchCount };
// // // // //         })
// // // // //         .filter(({ matchCount }) => matchCount > 0)
// // // // //         .sort((a, b) => b.matchCount - a.matchCount)
// // // // //         .map(({ expert }) => expert);
// // // // //     }

// // // // //     if (languageFilter) {
// // // // //       result = result.filter((expert) =>
// // // // //         expert.languages?.some(lang => normalizeText(lang).includes(normalizeText(languageFilter)))
// // // // //       );
// // // // //     }

// // // // //     if (locationFilter) {
// // // // //       result = result.filter((expert) =>
// // // // //         normalizeText(expert.location).includes(normalizeText(locationFilter))
// // // // //       );
// // // // //     }

// // // // //     if (specializationFilter) {
// // // // //       result = result.filter((expert) =>
// // // // //         expert.expertise?.some((expertise) =>
// // // // //           normalizeText(expertise).includes(normalizeText(specializationFilter))
// // // // //         )
// // // // //       );
// // // // //     }

// // // // //     setFilteredExperts(result);
// // // // //     setCurrentMobileIndex(0); // Reset mobile index when filters change
// // // // //   }, [searchTerm, languageFilter, locationFilter, specializationFilter, experts]);

// // // // //   const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages || []))].map(toSentenceCase);
// // // // //   const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean).map(toSentenceCase);
// // // // //   const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))].map(toSentenceCase);

// // // // //   const truncateTagline = (tagline) => {
// // // // //     if (!tagline) return "";
// // // // //     return tagline.length > 150 ? `${tagline.substring(0, 130)}...` : tagline;
// // // // //   };

// // // // //   const handleClearFilters = () => {
// // // // //     setSearchTerm("");
// // // // //     setLanguageFilter("");
// // // // //     setLocationFilter("");
// // // // //     setSpecializationFilter("");
// // // // //     router.push("/ask-an-expert");
// // // // //     setCurrentMobileIndex(0);
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     const handleScroll = () => {
// // // // //       if (window.innerWidth >= 640) return; // Skip for non-mobile views
// // // // //       const card = mobileCardRef.current;
// // // // //       if (!card) return;

// // // // //       const rect = card.getBoundingClientRect();
// // // // //       const windowHeight = window.innerHeight;

// // // // //       // Trigger when card is mostly out of view (e.g., 80% scrolled past)
// // // // //       if (rect.top < windowHeight * 0.2 && currentMobileIndex < filteredExperts.length - 1) {
// // // // //         setCurrentMobileIndex(prev => prev + 1);
// // // // //       }
// // // // //     };

// // // // //     window.addEventListener('scroll', handleScroll);
// // // // //     return () => window.removeEventListener('scroll', handleScroll);
// // // // //   }, [currentMobileIndex, filteredExperts.length]);

// // // // //   useEffect(() => {
// // // // //     const observer = new IntersectionObserver(
// // // // //       entries => {
// // // // //         if (entries[0].isIntersecting && hasMore && !loading) {
// // // // //           fetchExperts();
// // // // //         }
// // // // //       },
// // // // //       { threshold: 0.1 }
// // // // //     );
// // // // //     if (loadMoreRef.current) {
// // // // //       observer.observe(loadMoreRef.current);
// // // // //     }
// // // // //     observerRef.current = observer;
// // // // //     return () => {
// // // // //       if (observerRef.current) {
// // // // //         observerRef.current.disconnect();
// // // // //       }
// // // // //     };
// // // // //   }, [hasMore, loading]);

// // // // //   return (
// // // // //     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-16">
// // // // //       {modalExpert && (
// // // // //         <AskQuestionModal
// // // // //           expert={modalExpert}
// // // // //           onClose={() => setModalExpert(null)}
// // // // //           initialQuestion={decodeURIComponent(initialQuestion)}
// // // // //         />
// // // // //       )}
// // // // //       {isLightboxOpen && (
// // // // //         <Lightbox
// // // // //           mainSrc={selectedImage}
// // // // //           onCloseRequest={() => setIsLightboxOpen(false)}
// // // // //           imageTitle={selectedImage.includes('default.jpg') ? 'Default Profile Image' : 'Expert Profile Image'}
// // // // //         />
// // // // //       )}
// // // // //       <div className="max-w-7xl mx-auto mt-5">
// // // // //         <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
// // // // //           Real Experts. Real Answers. For Your Real Travel Plans.
// // // // //         </h1>
// // // // //         <p className="text-center text-gray-600 mb-4 text-sm sm:text-base">
// // // // //           Get answers from a trusted circle of verified travel experts across every domain from visas to vacations.
// // // // //         </p>

// // // // //         <div className="mb-4">
// // // // //           <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
// // // // //             <div className="flex-1 relative">
// // // // //               <FaGlobe className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // // //               <select
// // // // //                 value={languageFilter}
// // // // //                 onChange={(e) => setLanguageFilter(e.target.value)}
// // // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // //               >
// // // // //                 <option value="">Language</option>
// // // // //                 {uniqueLanguages.map((lang) => (
// // // // //                   <option key={lang} value={lang}>
// // // // //                     {lang}
// // // // //                   </option>
// // // // //                 ))}
// // // // //               </select>
// // // // //             </div>
// // // // //             <div className="flex-1 relative">
// // // // //               <FaMapMarkerAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // // //               <select
// // // // //                 value={locationFilter}
// // // // //                 onChange={(e) => setLocationFilter(e.target.value)}
// // // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // //               >
// // // // //                 <option value="">Location</option>
// // // // //                 {uniqueLocations.map((loc) => (
// // // // //                   <option key={loc} value={loc}>
// // // // //                     {loc}
// // // // //                   </option>
// // // // //                 ))}
// // // // //               </select>
// // // // //             </div>
// // // // //             <div className="flex-1 relative">
// // // // //               <FaUserTag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // // //               <select
// // // // //                 value={specializationFilter}
// // // // //                 onChange={(e) => setSpecializationFilter(e.target.value)}
// // // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // //               >
// // // // //                 <option value="">Expertise</option>
// // // // //                 {uniqueSpecializations.map((spec) => (
// // // // //                   <option key={spec} value={spec}>
// // // // //                     {spec}
// // // // //                   </option>
// // // // //                 ))}
// // // // //               </select>
// // // // //             </div>
// // // // //             <div className="flex-1 flex items-center">
// // // // //               <button
// // // // //                 onClick={handleClearFilters}
// // // // //                 className="w-full flex items-center justify-center gap-5 px-2 py-1 bg-[#36013F] text-white rounded-full hover:bg-opacity-90 transition-all text-xs"
// // // // //               >
// // // // //                 <FaTimes />
// // // // //                 Clear
// // // // //               </button>
// // // // //             </div>
// // // // //           </div>
         
// // // // //           <div className="relative flex items-center gap-2">
// // // // //             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-sm" />
// // // // //             <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
// // // // //               <input
// // // // //                 type="text"
// // // // //                 placeholder="Search keywords (e.g., visa travel documentation)"
// // // // //                 value={searchTerm}
// // // // //                 onChange={(e) => setSearchTerm(e.target.value)}
// // // // //                 className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // //               />
// // // // //               <button
// // // // //                 type="submit"
// // // // //                 className="bg-[#36013F] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all text-sm"
// // // // //               >
// // // // //                 Search
// // // // //               </button>
// // // // //             </form>
// // // // //           </div>
// // // // //         </div>

// // // // //         {filteredExperts.length === 0 && (
// // // // //           <div className="text-center text-gray-600 py-8 text-sm">
// // // // //             <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
// // // // //           </div>
// // // // //         )}

// // // // //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
// // // // //           {/* Desktop view: Show all experts */}
// // // // //           {filteredExperts.map((expert) => (
// // // // //             <motion.div
// // // // //               key={expert.id}
// // // // //               className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow sm:block hidden"
// // // // //               initial={{ opacity: 0, y: 20 }}
// // // // //               animate={{ opacity: 1, y: 0 }}
// // // // //               transition={{ duration: 0.3 }}
// // // // //             >
// // // // //               <div className="flex items-center gap-3 mb-3">
// // // // //                 <button
// // // // //                   onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
// // // // //                   className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-[#36013F] shadow-sm"
// // // // //                 >
// // // // //                   <Image
// // // // //                     src={expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg'}
// // // // //                     alt={expert.fullName || 'Expert Profile'}
// // // // //                     fill
// // // // //                     sizes="60px"
// // // // //                     className="object-cover object-center rounded-full"
// // // // //                     priority={false}
// // // // //                   />
// // // // //                 </button>
// // // // //                 <div className="flex-1">
// // // // //                   <h2 className="text-base font-semibold text-gray-800">
// // // // //                     {expert.fullName || 'Unknown Expert'}
// // // // //                   </h2>
// // // // //                   <p className="text-xs text-gray-600 line-clamp-2">
// // // // //                     {truncateTagline(expert.tagline) || 'No tagline provided'}
// // // // //                   </p>
// // // // //                 </div>
// // // // //                 <div className="flex justify-center items-center py-1 space-y-0.5">
// // // // //                   <div className="text-primary border-2 border-primary rounded-lg px-2 w-[48px] flex flex-col items-center py-1">
// // // // //                     <h1 className="font-bold text-center text-base">{calculateTotalExperience(expert.experience) || 'No experience provided'}</h1>
// // // // //                     <span className="font-semibold text-xs text-center">YEARS</span>
// // // // //                   </div>
// // // // //                 </div>
// // // // //               </div>
// // // // //               <div className="space-y-3">
// // // // //                 <div className="flex flex-wrap gap-1.5">
// // // // //                   {expert.expertise?.map((expertise) => (
// // // // //                     <span
// // // // //                       key={expertise}
// // // // //                       className="bg-[#36013F] text-white text-xs px-1.5 py-0.5 rounded-full"
// // // // //                     >
// // // // //                       {expertise}
// // // // //                     </span>
// // // // //                   ))}
// // // // //                 </div>
// // // // //                 <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
// // // // //                   <p className="flex items-center gap-1.5">
// // // // //                     <FaRupeeSign className="text-[#36013F]" />
// // // // //                     {formatPricing(expert.pricing)}
// // // // //                   </p>
// // // // //                   <p className="flex items-center gap-1.5">
// // // // //                     <FaLanguage className="text-[#36013F]" />
// // // // //                     {toSentenceCase(expert.languages) || "English, Hindi"}
// // // // //                   </p>
// // // // //                   <p className="flex items-center gap-1.5">
// // // // //                     <FaMapMarkerAlt className="text-[#36013F]" />
// // // // //                     {expert.location || "Delhi, India"}
// // // // //                   </p>
// // // // //                   <p className="flex items-center gap-1.5">
// // // // //                     <FaClock className="text-[#36013F]" />
// // // // //                     {expert.responseTime || "10 mins"}
// // // // //                   </p>
// // // // //                 </div>
// // // // //               </div>
// // // // //               <div className="flex gap-2 mt-4">
// // // // //                 <Link href={`/experts/${expert.username}`} className="flex-1">
// // // // //                   <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
// // // // //                     View Profile
// // // // //                   </button>
// // // // //                 </Link>
// // // // //                 <button
// // // // //                   onClick={() => setModalExpert(expert)}
// // // // //                   className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
// // // // //                 >
// // // // //                   Ask Question
// // // // //                 </button>
// // // // //               </div>
// // // // //             </motion.div>
// // // // //           ))}
// // // // //           {/* Mobile view: Show one expert at a time with animation */}
// // // // //           <AnimatePresence>
// // // // //             {filteredExperts.length > 0 && currentMobileIndex < filteredExperts.length && (
// // // // //               <motion.aside
// // // // //                 key={filteredExperts[currentMobileIndex].id}
// // // // //                 ref={mobileCardRef}
// // // // //                 className="lg:col-span-1 space-y-4 sm:hidden"
// // // // //                 initial={{ opacity: 0, y: 50 }}
// // // // //                 animate={{ opacity: 1, y: 0 }}
// // // // //                 exit={{ opacity: 0, y: -50 }}
// // // // //                 transition={{ duration: 0.5, ease: "easeInOut" }}
// // // // //               >
// // // // //                 <div className="bg-[#36013F] rounded-3xl shadow-lg p-6 text-center relative">
// // // // //                   <div className="mb-4 relative">
// // // // //                     <button
// // // // //                       onClick={() => openLightbox(filteredExperts[currentMobileIndex].photo && filteredExperts[currentMobileIndex].photo !== '' ? filteredExperts[currentMobileIndex].photo : '/default.jpg')}
// // // // //                       className="w-28 h-28 rounded-full border-4 border-[#F4D35E] object-cover mx-auto shadow-md overflow-hidden"
// // // // //                     >
// // // // //                       <Image
// // // // //                         src={filteredExperts[currentMobileIndex].photo && filteredExperts[currentMobileIndex].photo !== '' ? filteredExperts[currentMobileIndex].photo : '/default.jpg'}
// // // // //                         alt={filteredExperts[currentMobileIndex].fullName || 'Expert Profile'}
// // // // //                         width={112}
// // // // //                         height={112}
// // // // //                         className="rounded-full object-cover mx-auto shadow-md"
// // // // //                         priority={false}
// // // // //                       />
// // // // //                     </button>
// // // // //                     <div className="flex justify-center items-center py-1 absolute top-0 right-0 space-y-0.5">
// // // // //                       <div className="text-[#F4D35E] border-2 border-[#F4D35E] rounded-lg px-2 w-[48px] flex flex-col items-center">
// // // // //                         <h1 className="font-bold text-center text-base">{calculateTotalExperience(filteredExperts[currentMobileIndex].experience) || '0+'}</h1>
// // // // //                         <span className="font-semibold text-xs text-center">YEARS</span>
// // // // //                       </div>
// // // // //                     </div>
// // // // //                   </div>
// // // // //                   <p className="text-sm mt-1 text-white">@{filteredExperts[currentMobileIndex].username || 'unknown'}</p>
// // // // //                   <h1
// // // // //                     className="text-xl font-semibold text-white"
// // // // //                     style={{ fontFamily: "'DM Serif Display', serif" }}
// // // // //                   >
// // // // //                     {filteredExperts[currentMobileIndex].fullName || 'Unknown Expert'}
// // // // //                   </h1>
// // // // //                   {filteredExperts[currentMobileIndex].title && (
// // // // //                     <p className="text-sm mt-1 text-white">{filteredExperts[currentMobileIndex].title}</p>
// // // // //                   )}
// // // // //                   {filteredExperts[currentMobileIndex].tagline && (
// // // // //                     <p className="text-sm mt-1 text-white">{truncateTagline(filteredExperts[currentMobileIndex].tagline) || 'No tagline provided'}</p>
// // // // //                   )}
// // // // //                   <span className="inline-flex items-center gap-1 bg-[#F4D35E] text-black text-xs font-medium px-3 py-1 mt-2 rounded-full">
// // // // //                     <svg
// // // // //                       xmlns="http://www.w3.org/2000/svg"
// // // // //                       viewBox="0 0 24 24"
// // // // //                       fill="currentColor"
// // // // //                       className="w-4 h-4"
// // // // //                     >
// // // // //                       <path
// // // // //                         fillRule="evenodd"
// // // // //                         d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 2.122 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
// // // // //                         clipRule="evenodd"
// // // // //                       />
// // // // //                     </svg>
// // // // //                     Verified by Xmytravel
// // // // //                   </span>
// // // // //                   <div className="mt-4 text-sm text-left space-y-2 text-white">
// // // // //                     {filteredExperts[currentMobileIndex].location && (
// // // // //                       <p className="flex items-center gap-2">
// // // // //                         <svg
// // // // //                           xmlns="http://www.w3.org/2000/svg"
// // // // //                           fill="currentColor"
// // // // //                           viewBox="0 0 24 24"
// // // // //                           className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// // // // //                         >
// // // // //                           <path
// // // // //                             fillRule="evenodd"
// // // // //                             d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
// // // // //                             clipRule="evenodd"
// // // // //                           />
// // // // //                         </svg>
// // // // //                         {filteredExperts[currentMobileIndex].location || 'Delhi, India'}
// // // // //                       </p>
// // // // //                     )}
// // // // //                     {filteredExperts[currentMobileIndex].languages && (
// // // // //                       <p className="flex items-center gap-2">
// // // // //                         <svg
// // // // //                           xmlns="http://www.w3.org/2000/svg"
// // // // //                           viewBox="0 0 24 24"
// // // // //                           fill="currentColor"
// // // // //                           className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// // // // //                         >
// // // // //                           <path
// // // // //                             fillRule="evenodd"
// // // // //                             d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 1.357L14.25 7.5l.165.33a.809.809 0 0 1-1.086 1.085l-.604-.302a1.125 1.125 0 0 0-1.298.21.combined.l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 0 1-2.288 4.04l-.723.724a1.125 1.125 0 0 1-1.298.21l-.153-.076a1.125 1.125 0 0 1-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 0 1-.21-1.298L9.75 12l-1.64-1.64a6 6 0 0 1-1.676-3.257l-.172-1.03Z"
// // // // //                             clipRule="evenodd"
// // // // //                           />
// // // // //                         </svg>
// // // // //                         Languages: {toSentenceCase(filteredExperts[currentMobileIndex].languages) || 'English, Hindi'}
// // // // //                       </p>
// // // // //                     )}
// // // // //                     {filteredExperts[currentMobileIndex].responseTime && (
// // // // //                       <p className="flex items-center gap-2">
// // // // //                         <svg
// // // // //                           xmlns="http://www.w3.org/2000/svg"
// // // // //                           fill="currentColor"
// // // // //                           viewBox="0 0 24 24"
// // // // //                           className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// // // // //                         >
// // // // //                           <path
// // // // //                             fillRule="evenodd"
// // // // //                             d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
// // // // //                             clipRule="evenodd"
// // // // //                           />
// // // // //                         </svg>
// // // // //                         {filteredExperts[currentMobileIndex].responseTime || '10 mins'}
// // // // //                       </p>
// // // // //                     )}
// // // // //                     {filteredExperts[currentMobileIndex].pricing && (
// // // // //                       <p className="flex items-center gap-2">
// // // // //                         <svg
// // // // //                           xmlns="http://www.w3.org/2000/svg"
// // // // //                           fill="currentColor"
// // // // //                           viewBox="0 0 24 24"
// // // // //                           className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// // // // //                         >
// // // // //                           <path
// // // // //                             fillRule="evenodd"
// // // // //                             d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 7.5A.75.75 0 0 0 9 9h1.5c.98 0 1.813.626 2.122 1.5H9A.75.75 0 0 0 9 12h3.622a2.251 2.251 0 0 1-2.122 1.5H9a.75.75 0 0 0-.53 1.28l3 3a.75.75 0 1 0 1.06-1.06L10.8 14.988A3.752 3.752 0 0 0 14.175 12H15a.75.75 0 0 0 0-1.5h-.825A3.733 3.733 0 0 0 13.5 9H15a.75.75 0 0 0 0-1.5H9Z"
// // // // //                             clipRule="evenodd"
// // // // //                           />
// // // // //                         </svg>
// // // // //                         {formatPricing(filteredExperts[currentMobileIndex].pricing)}
// // // // //                       </p>
// // // // //                     )}
// // // // //                   </div>
// // // // //                   <div className="flex gap-2 mt-4">
// // // // //                     <Link href={`/experts/${filteredExperts[currentMobileIndex].username}`} className="flex-1">
// // // // //                       <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
// // // // //                         View Profile
// // // // //                       </button>
// // // // //                     </Link>
// // // // //                     <button
// // // // //                       onClick={() => setModalExpert(filteredExperts[currentMobileIndex])}
// // // // //                       className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
// // // // //                     >
// // // // //                       Ask Question
// // // // //                     </button>
// // // // //                   </div>
// // // // //                 </div>
// // // // //               </motion.aside>
// // // // //             )}
// // // // //           </AnimatePresence>
// // // // //         </div>
// // // // //         {hasMore && (
// // // // //           <div ref={loadMoreRef} className="h-10 flex justify-center items-center mt-4">
// // // // //             {loading && <p className="text-gray-600">Loading more experts...</p>}
// // // // //           </div>
// // // // //         )}
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }

// // // // "use client";

// // // // import { useState, useEffect, useMemo, useRef } from "react";
// // // // import Image from "next/image";
// // // // import Link from "next/link";
// // // // import { getFirestore, collection, getDocs, query, limit, startAfter } from "firebase/firestore";
// // // // import { app } from "@/lib/firebase";
// // // // import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaTimes, FaLanguage } from "react-icons/fa";
// // // // import { useSearchParams, useRouter } from "next/navigation";
// // // // import AskQuestionModal from "@/app/components/AskQuestionModal";
// // // // import { motion, AnimatePresence } from 'framer-motion';
// // // // import Lightbox from 'react-image-lightbox';
// // // // import 'react-image-lightbox/style.css';
// // // // import { Share2, MessageCircle } from "lucide-react";

// // // // const db = getFirestore(app);

// // // // export default function ExpertsDirectory() {
// // // //   const [experts, setExperts] = useState([]);
// // // //   const [filteredExperts, setFilteredExperts] = useState([]);
// // // //   const [searchTerm, setSearchTerm] = useState("");
// // // //   const [languageFilter, setLanguageFilter] = useState("");
// // // //   const [locationFilter, setLocationFilter] = useState("");
// // // //   const [specializationFilter, setSpecializationFilter] = useState("");
// // // //   const [modalExpert, setModalExpert] = useState(null);
// // // //   const [isLightboxOpen, setIsLightboxOpen] = useState(false);
// // // //   const [selectedImage, setSelectedImage] = useState("");
// // // //   const [lastDoc, setLastDoc] = useState(null);
// // // //   const [loading, setLoading] = useState(false);
// // // //   const [hasMore, setHasMore] = useState(true);
// // // //   const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
// // // //   const searchParams = useSearchParams();
// // // //   const router = useRouter();
// // // //   const observerRef = useRef(null);
// // // //   const loadMoreRef = useRef(null);
// // // //   const mobileCardRef = useRef(null);

// // // //   const keywords = useMemo(() => {
// // // //     return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
// // // //   }, [searchParams]);

// // // //   const initialQuestion = useMemo(() => {
// // // //     return searchParams.get("question") || "";
// // // //   }, [searchParams]);

// // // //   const toSentenceCase = (input) => {
// // // //     if (!input) return "";
// // // //     if (Array.isArray(input)) {
// // // //       return input.map(item => toSentenceCase(item)).join(", ");
// // // //     }
// // // //     if (typeof input !== "string") return "";
// // // //     return input
// // // //       .toLowerCase()
// // // //       .split(" ")
// // // //       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
// // // //       .join(" ");
// // // //   };

// // // //   const calculateTotalExperience = (experience) => {
// // // //     if (!Array.isArray(experience) || experience.length === 0) return "0+";

// // // //     const today = new Date();
// // // //     let earliestStart = null;
// // // //     let latestEnd = null;

// // // //     experience.forEach(exp => {
// // // //       const startDate = exp.startDate ? new Date(exp.startDate) : null;
// // // //       const endDate = exp.endDate === "Present" ? today : exp.endDate ? new Date(exp.endDate) : null;

// // // //       if (startDate && (!earliestStart || startDate < earliestStart)) {
// // // //         earliestStart = startDate;
// // // //       }
// // // //       if (endDate && (!latestEnd || endDate > latestEnd)) {
// // // //         latestEnd = endDate;
// // // //       }
// // // //     });

// // // //     if (!earliestStart || !latestEnd || latestEnd < earliestStart) {
// // // //       return "0+";
// // // //     }

// // // //     const totalMonths = (latestEnd.getFullYear() - earliestStart.getFullYear()) * 12 +
// // // //                         (latestEnd.getMonth() - earliestStart.getMonth());

// // // //     const years = Math.floor(totalMonths / 12);
// // // //     return `${years}+`;
// // // //   };

// // // //   const formatPricing = (pricing) => {
// // // //     if (!pricing) return "799/session";
// // // //     const numeric = pricing.match(/\d+(\.\d+)?/)?.[0] || "799";
// // // //     return `${numeric}/session`;
// // // //   };

// // // //   const normalizeText = (text) => {
// // // //     if (!text || typeof text !== "string") return "";
// // // //     return text
// // // //       .toLowerCase()
// // // //       .replace(/[^a-z0-9\s]/g, " ")
// // // //       .replace(/\s+/g, " ")
// // // //       .trim();
// // // //   };

// // // //   const handleSearchSubmit = (e) => {
// // // //     e.preventDefault();
// // // //     if (searchTerm.trim()) {
// // // //       const formattedKeywords = normalizeText(searchTerm)
// // // //         .split(" ")
// // // //         .filter(Boolean)
// // // //         .join(",");
// // // //       router.push(`/ask-an-expert?keywords=${encodeURIComponent(formattedKeywords)}`);
// // // //     } else {
// // // //       router.push("/ask-an-expert");
// // // //     }
// // // //     setCurrentMobileIndex(0); // Reset mobile index on new search
// // // //   };

// // // //   const openLightbox = (imageSrc) => {
// // // //     setSelectedImage(imageSrc);
// // // //     setIsLightboxOpen(true);
// // // //   };

// // // //   useEffect(() => {
// // // //     if (keywords.length > 0) {
// // // //       setSearchTerm(keywords.join(" "));
// // // //     } else {
// // // //       setSearchTerm("");
// // // //     }
// // // //     setCurrentMobileIndex(0); // Reset mobile index when keywords change
// // // //   }, [keywords]);

// // // //   const fetchExperts = async () => {
// // // //     if (loading || !hasMore) return;
// // // //     setLoading(true);
// // // //     try {
// // // //       const profilesQuery = lastDoc
// // // //         ? query(collection(db, "Profiles"), limit(9), startAfter(lastDoc))
// // // //         : query(collection(db, "Profiles"), limit(9));
// // // //       const querySnapshot = await getDocs(profilesQuery);
// // // //       const expertsData = querySnapshot.docs.map((doc) => {
// // // //         const data = doc.data();
// // // //         return {
// // // //           id: doc.id,
// // // //           fullName: toSentenceCase(data.fullName),
// // // //           tagline: toSentenceCase(data.tagline),
// // // //           languages: Array.isArray(data.languages) ? data.languages : [],
// // // //           location: toSentenceCase(data.location),
// // // //           expertise: Array.isArray(data.expertise) ? data.expertise.map(toSentenceCase) : [],
// // // //           pricing: data.pricing,
// // // //           responseTime: data.responseTime,
// // // //           username: data.username,
// // // //           photo: data.photo,
// // // //           about: toSentenceCase(data.about),
// // // //           certifications: toSentenceCase(data.certifications),
// // // //           services: Array.isArray(data.services) ? data.services.map(toSentenceCase) : [],
// // // //           regions: Array.isArray(data.regions) ? data.regions.map(toSentenceCase) : [],
// // // //           experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
// // // //             ...exp,
// // // //             company: toSentenceCase(exp.company),
// // // //             title: toSentenceCase(exp.title),
// // // //           })) : [],
// // // //           email: data.email || "",
// // // //         };
// // // //       });
// // // //       setExperts(prev => [...prev, ...expertsData]);
// // // //       setFilteredExperts(prev => [...prev, ...expertsData]);
// // // //       setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
// // // //       setHasMore(querySnapshot.docs.length === 9);
// // // //     } catch (error) {
// // // //       console.error("Error fetching experts:", error);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     fetchExperts();
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     let result = experts;

// // // //     if (searchTerm) {
// // // //       const searchTerms = normalizeText(searchTerm)
// // // //         .split(" ")
// // // //         .filter(term => term);
      
// // // //       result = result
// // // //         .map(expert => {
// // // //           const searchableFields = [
// // // //             normalizeText(expert.fullName),
// // // //             normalizeText(expert.tagline),
// // // //             normalizeText(expert.about),
// // // //             normalizeText(expert.certifications),
// // // //             ...expert.languages.map(normalizeText),
// // // //             normalizeText(expert.location),
// // // //             ...expert.services.map(normalizeText),
// // // //             ...expert.expertise.map(normalizeText),
// // // //             ...expert.regions.map(normalizeText),
// // // //             ...expert.experience.map(exp => `${normalizeText(exp.company)} ${normalizeText(exp.title)}`),
// // // //           ].filter(Boolean).join(" ");
          
// // // //           const matchCount = searchTerms.reduce((count, term) => {
// // // //             return count + (searchableFields.includes(term) ? 1 : 0);
// // // //           }, 0);
          
// // // //           return { expert, matchCount };
// // // //         })
// // // //         .filter(({ matchCount }) => matchCount > 0)
// // // //         .sort((a, b) => b.matchCount - a.matchCount)
// // // //         .map(({ expert }) => expert);
// // // //     }

// // // //     if (languageFilter) {
// // // //       result = result.filter((expert) =>
// // // //         expert.languages?.some(lang => normalizeText(lang).includes(normalizeText(languageFilter)))
// // // //       );
// // // //     }

// // // //     if (locationFilter) {
// // // //       result = result.filter((expert) =>
// // // //         normalizeText(expert.location).includes(normalizeText(locationFilter))
// // // //       );
// // // //     }

// // // //     if (specializationFilter) {
// // // //       result = result.filter((expert) =>
// // // //         expert.expertise?.some((expertise) =>
// // // //           normalizeText(expertise).includes(normalizeText(specializationFilter))
// // // //         )
// // // //       );
// // // //     }

// // // //     setFilteredExperts(result);
// // // //     setCurrentMobileIndex(0); // Reset mobile index when filters change
// // // //   }, [searchTerm, languageFilter, locationFilter, specializationFilter, experts]);

// // // //   const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages || []))].map(toSentenceCase);
// // // //   const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean).map(toSentenceCase);
// // // //   const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))].map(toSentenceCase);

// // // //   const truncateTagline = (tagline) => {
// // // //     if (!tagline) return "";
// // // //     return tagline.length > 150 ? `${tagline.substring(0, 130)}...` : tagline;
// // // //   };

// // // //   const handleClearFilters = () => {
// // // //     setSearchTerm("");
// // // //     setLanguageFilter("");
// // // //     setLocationFilter("");
// // // //     setSpecializationFilter("");
// // // //     router.push("/ask-an-expert");
// // // //     setCurrentMobileIndex(0);
// // // //   };

// // // //   useEffect(() => {
// // // //     const handleScroll = () => {
// // // //       if (window.innerWidth >= 640) return; // Skip for non-mobile views
// // // //       const card = mobileCardRef.current;
// // // //       if (!card) return;

// // // //       const rect = card.getBoundingClientRect();
// // // //       const windowHeight = window.innerHeight;

// // // //       // Trigger when card is mostly out of view (e.g., 80% scrolled past)
// // // //       if (rect.top < windowHeight * 0.2 && currentMobileIndex < filteredExperts.length - 1) {
// // // //         setCurrentMobileIndex(prev => prev + 1);
// // // //       }
// // // //     };

// // // //     window.addEventListener('scroll', handleScroll);
// // // //     return () => window.removeEventListener('scroll', handleScroll);
// // // //   }, [currentMobileIndex, filteredExperts.length]);

// // // //   useEffect(() => {
// // // //     const observer = new IntersectionObserver(
// // // //       entries => {
// // // //         if (entries[0].isIntersecting && hasMore && !loading) {
// // // //           fetchExperts();
// // // //         }
// // // //       },
// // // //       { threshold: 0.1 }
// // // //     );
// // // //     if (loadMoreRef.current) {
// // // //       observer.observe(loadMoreRef.current);
// // // //     }
// // // //     observerRef.current = observer;
// // // //     return () => {
// // // //       if (observerRef.current) {
// // // //         observerRef.current.disconnect();
// // // //       }
// // // //     };
// // // //   }, [hasMore, loading]);

// // // //   return (
// // // //     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-16">
// // // //       {modalExpert && (
// // // //         <AskQuestionModal
// // // //           expert={modalExpert}
// // // //           onClose={() => setModalExpert(null)}
// // // //           initialQuestion={decodeURIComponent(initialQuestion)}
// // // //         />
// // // //       )}
// // // //       {isLightboxOpen && (
// // // //         <Lightbox
// // // //           mainSrc={selectedImage}
// // // //           onCloseRequest={() => setIsLightboxOpen(false)}
// // // //           imageTitle={selectedImage.includes('default.jpg') ? 'Default Profile Image' : 'Expert Profile Image'}
// // // //         />
// // // //       )}
// // // //       <div className="max-w-7xl mx-auto mt-5">
// // // //         <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
// // // //           Real Experts. Real Answers. For Your Real Travel Plans.
// // // //         </h1>
// // // //         <p className="text-center text-gray-600 mb-4 text-sm sm:text-base">
// // // //           Get answers from a trusted circle of verified travel experts across every domain from visas to vacations.
// // // //         </p>

// // // //         <div className="mb-4">
// // // //           <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
// // // //             <div className="flex-1 relative">
// // // //               <FaGlobe className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // //               <select
// // // //                 value={languageFilter}
// // // //                 onChange={(e) => setLanguageFilter(e.target.value)}
// // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // //               >
// // // //                 <option value="">Language</option>
// // // //                 {uniqueLanguages.map((lang) => (
// // // //                   <option key={lang} value={lang}>
// // // //                     {lang}
// // // //                   </option>
// // // //                 ))}
// // // //               </select>
// // // //             </div>
// // // //             <div className="flex-1 relative">
// // // //               <FaMapMarkerAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // //               <select
// // // //                 value={locationFilter}
// // // //                 onChange={(e) => setLocationFilter(e.target.value)}
// // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // //               >
// // // //                 <option value="">Location</option>
// // // //                 {uniqueLocations.map((loc) => (
// // // //                   <option key={loc} value={loc}>
// // // //                     {loc}
// // // //                   </option>
// // // //                 ))}
// // // //               </select>
// // // //             </div>
// // // //             <div className="flex-1 relative">
// // // //               <FaUserTag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // // //               <select
// // // //                 value={specializationFilter}
// // // //                 onChange={(e) => setSpecializationFilter(e.target.value)}
// // // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // //               >
// // // //                 <option value="">Expertise</option>
// // // //                 {uniqueSpecializations.map((spec) => (
// // // //                   <option key={spec} value={spec}>
// // // //                     {spec}
// // // //                   </option>
// // // //                 ))}
// // // //               </select>
// // // //             </div>
// // // //             <div className="flex-1 flex items-center">
// // // //               <button
// // // //                 onClick={handleClearFilters}
// // // //                 className="w-full flex items-center justify-center gap-5 px-2 py-1 bg-[#36013F] text-white rounded-full hover:bg-opacity-90 transition-all text-xs"
// // // //               >
// // // //                 <FaTimes />
// // // //                 Clear
// // // //               </button>
// // // //             </div>
// // // //           </div>
         
// // // //           <div className="relative flex items-center gap-2">
// // // //             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-sm" />
// // // //             <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
// // // //               <input
// // // //                 type="text"
// // // //                 placeholder="Search keywords (e.g., visa travel documentation)"
// // // //                 value={searchTerm}
// // // //                 onChange={(e) => setSearchTerm(e.target.value)}
// // // //                 className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // //               />
// // // //               <button
// // // //                 type="submit"
// // // //                 className="bg-[#36013F] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all text-sm"
// // // //               >
// // // //                 Search
// // // //               </button>
// // // //             </form>
// // // //           </div>
// // // //         </div>

// // // //         {filteredExperts.length === 0 && (
// // // //           <div className="text-center text-gray-600 py-8 text-sm">
// // // //             <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
// // // //           </div>
// // // //         )}

// // // //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
// // // //           {/* Desktop view: Show all experts */}
// // // //           {filteredExperts.map((expert) => (
// // // //             <motion.div
// // // //               key={`desktop-${expert.id}`}
// // // //               className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow sm:block hidden"
// // // //               initial={{ opacity: 0, y: 20 }}
// // // //               animate={{ opacity: 1, y: 0 }}
// // // //               transition={{ duration: 0.3 }}
// // // //             >
// // // //               <div className="flex items-center gap-3 mb-3">
// // // //                 <button
// // // //                   onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
// // // //                   className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-[#36013F] shadow-sm"
// // // //                 >
// // // //                   <Image
// // // //                     src={expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg'}
// // // //                     alt={expert.fullName || 'Expert Profile'}
// // // //                     fill
// // // //                     sizes="60px"
// // // //                     className="object-cover object-center rounded-full"
// // // //                     priority={false}
// // // //                   />
// // // //                 </button>
// // // //                 <div className="flex-1">
// // // //                   <h2 className="text-base font-semibold text-gray-800">
// // // //                     {expert.fullName || 'Unknown Expert'}
// // // //                   </h2>
// // // //                   <p className="text-xs text-gray-600 line-clamp-2">
// // // //                     {truncateTagline(expert.tagline) || 'No tagline provided'}
// // // //                   </p>
// // // //                 </div>
// // // //                 <div className="flex justify-center items-center py-1 space-y-0.5">
// // // //                   <div className="text-primary border-2 border-primary rounded-lg px-2 w-[48px] flex flex-col items-center py-1">
// // // //                     <h1 className="font-bold text-center text-base">{calculateTotalExperience(expert.experience) || 'No experience provided'}</h1>
// // // //                     <span className="font-semibold text-xs text-center">YEARS</span>
// // // //                   </div>
// // // //                 </div>
// // // //               </div>
// // // //               <div className="space-y-3">
// // // //                 <div className="flex flex-wrap gap-1.5">
// // // //                   {expert.expertise?.map((expertise) => (
// // // //                     <span
// // // //                       key={expertise}
// // // //                       className="bg-[#36013F] text-white text-xs px-1.5 py-0.5 rounded-full"
// // // //                     >
// // // //                       {expertise}
// // // //                     </span>
// // // //                   ))}
// // // //                 </div>
// // // //                 <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
// // // //                   <p className="flex items-center gap-1.5">
// // // //                     <FaRupeeSign className="text-[#36013F]" />
// // // //                     {formatPricing(expert.pricing)}
// // // //                   </p>
// // // //                   <p className="flex items-center gap-1.5">
// // // //                     <FaLanguage className="text-[#36013F]" />
// // // //                     {toSentenceCase(expert.languages) || "English, Hindi"}
// // // //                   </p>
// // // //                   <p className="flex items-center gap-1.5">
// // // //                     <FaMapMarkerAlt className="text-[#36013F]" />
// // // //                     {expert.location || "Delhi, India"}
// // // //                   </p>
// // // //                   <p className="flex items-center gap-1.5">
// // // //                     <FaClock className="text-[#36013F]" />
// // // //                     {expert.responseTime || "10 mins"}
// // // //                   </p>
// // // //                 </div>
// // // //               </div>
// // // //               <div className="flex gap-2 mt-4">
// // // //                 <Link href={`/experts/${expert.username}`} className="flex-1">
// // // //                   <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
// // // //                     View Profile
// // // //                   </button>
// // // //                 </Link>
// // // //                 <button
// // // //                   onClick={() => setModalExpert(expert)}
// // // //                   className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
// // // //                 >
// // // //                   Ask Question
// // // //                 </button>
// // // //               </div>
// // // //             </motion.div>
// // // //           ))}
// // // //           {/* Mobile view: Show one expert at a time with animation */}
// // // //           <AnimatePresence>
// // // //             {filteredExperts.length > 0 && currentMobileIndex < filteredExperts.length && (
// // // //               <motion.aside
// // // //                 key={`mobile-${filteredExperts[currentMobileIndex].id}`}
// // // //                 ref={mobileCardRef}
// // // //                 className="lg:col-span-1 space-y-4 sm:hidden"
// // // //                 initial={{ opacity: 0, y: 50 }}
// // // //                 animate={{ opacity: 1, y: 0 }}
// // // //                 exit={{ opacity: 0, y: -50 }}
// // // //                 transition={{ duration: 0.5, ease: "easeInOut" }}
// // // //               >
// // // //                 <div className="bg-[#36013F] rounded-3xl shadow-lg p-6 text-center relative">
// // // //                   <div className="mb-4 relative">
// // // //                     <button
// // // //                       onClick={() => openLightbox(filteredExperts[currentMobileIndex].photo && filteredExperts[currentMobileIndex].photo !== '' ? filteredExperts[currentMobileIndex].photo : '/default.jpg')}
// // // //                       className="w-28 h-28 rounded-full border-4 border-[#F4D35E] object-cover mx-auto shadow-md overflow-hidden"
// // // //                     >
// // // //                       <Image
// // // //                         src={filteredExperts[currentMobileIndex].photo && filteredExperts[currentMobileIndex].photo !== '' ? filteredExperts[currentMobileIndex].photo : '/default.jpg'}
// // // //                         alt={filteredExperts[currentMobileIndex].fullName || 'Expert Profile'}
// // // //                         width={112}
// // // //                         height={112}
// // // //                         className="rounded-full object-cover mx-auto shadow-md"
// // // //                         priority={false}
// // // //                       />
// // // //                     </button>
// // // //                     <div className="flex justify-center items-center py-1 absolute top-0 right-0 space-y-0.5">
// // // //                       <div className="text-[#F4D35E] border-2 border-[#F4D35E] rounded-lg px-2 w-[48px] flex flex-col items-center">
// // // //                         <h1 className="font-bold text-center text-base">{calculateTotalExperience(filteredExperts[currentMobileIndex].experience) || '0+'}</h1>
// // // //                         <span className="font-semibold text-xs text-center">YEARS</span>
// // // //                       </div>
// // // //                     </div>
// // // //                   </div>
// // // //                   <p className="text-sm mt-1 text-white">@{filteredExperts[currentMobileIndex].username || 'unknown'}</p>
// // // //                   <h1
// // // //                     className="text-xl font-semibold text-white"
// // // //                     style={{ fontFamily: "'DM Serif Display', serif" }}
// // // //                   >
// // // //                     {filteredExperts[currentMobileIndex].fullName || 'Unknown Expert'}
// // // //                   </h1>
// // // //                   {filteredExperts[currentMobileIndex].title && (
// // // //                     <p className="text-sm mt-1 text-white">{filteredExperts[currentMobileIndex].title}</p>
// // // //                   )}
// // // //                   {filteredExperts[currentMobileIndex].tagline && (
// // // //                     <p className="text-sm mt-1 text-white">{truncateTagline(filteredExperts[currentMobileIndex].tagline) || 'No tagline provided'}</p>
// // // //                   )}
// // // //                   <span className="inline-flex items-center gap-1 bg-[#F4D35E] text-black text-xs font-medium px-3 py-1 mt-2 rounded-full">
// // // //                     <svg
// // // //                       xmlns="http://www.w3.org/2000/svg"
// // // //                       viewBox="0 0 24 24"
// // // //                       fill="currentColor"
// // // //                       className="w-4 h-4"
// // // //                     >
// // // //                       <path
// // // //                         fillRule="evenodd"
// // // //                         d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 2.122 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
// // // //                         clipRule="evenodd"
// // // //                       />
// // // //                     </svg>
// // // //                     Verified by Xmytravel
// // // //                   </span>
// // // //                   <div className="mt-4 text-sm text-left space-y-2 text-white">
// // // //                     {filteredExperts[currentMobileIndex].location && (
// // // //                       <p className="flex items-center gap-2">
// // // //                         <svg
// // // //                           xmlns="http://www.w3.org/2000/svg"
// // // //                           fill="currentColor"
// // // //                           viewBox="0 0 24 24"
// // // //                           className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// // // //                         >
// // // //                           <path
// // // //                             fillRule="evenodd"
// // // //                             d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
// // // //                             clipRule="evenodd"
// // // //                           />
// // // //                         </svg>
// // // //                         {filteredExperts[currentMobileIndex].location || 'Delhi, India'}
// // // //                       </p>
// // // //                     )}
// // // //                     {filteredExperts[currentMobileIndex].languages && (
// // // //                       <p className="flex items-center gap-2">
// // // //                         <svg
// // // //                           xmlns="http://www.w3.org/2000/svg"
// // // //                           viewBox="0 0 24 24"
// // // //                           fill="currentColor"
// // // //                           className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// // // //                         >
// // // //                           <path
// // // //                             fillRule="evenodd"
// // // //                             d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 1.357L14.25 7.5l.165.33a.809.809 0 0 1-1.086 1.085l-.604-.302a1.125 1.125 0 0 0-1.298.21.combined.l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 0 1-2.288 4.04l-.723.724a1.125 1.125 0 0 1-1.298.21l-.153-.076a1.125 1.125 0 0 1-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 0 1-.21-1.298L9.75 12l-1.64-1.64a6 6 0 0 1-1.676-3.257l-.172-1.03Z"
// // // //                             clipRule="evenodd"
// // // //                           />
// // // //                         </svg>
// // // //                         Languages: {toSentenceCase(filteredExperts[currentMobileIndex].languages) || 'English, Hindi'}
// // // //                       </p>
// // // //                     )}
// // // //                     {filteredExperts[currentMobileIndex].responseTime && (
// // // //                       <p className="flex items-center gap-2">
// // // //                         <svg
// // // //                           xmlns="http://www.w3.org/2000/svg"
// // // //                           fill="currentColor"
// // // //                           viewBox="0 0 24 24"
// // // //                           className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// // // //                         >
// // // //                           <path
// // // //                             fillRule="evenodd"
// // // //                             d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
// // // //                             clipRule="evenodd"
// // // //                           />
// // // //                         </svg>
// // // //                         {filteredExperts[currentMobileIndex].responseTime || '10 mins'}
// // // //                       </p>
// // // //                     )}
// // // //                     {filteredExperts[currentMobileIndex].pricing && (
// // // //                       <p className="flex items-center gap-2">
// // // //                         <svg
// // // //                           xmlns="http://www.w3.org/2000/svg"
// // // //                           fill="currentColor"
// // // //                           viewBox="0 0 24 24"
// // // //                           className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// // // //                         >
// // // //                           <path
// // // //                             fillRule="evenodd"
// // // //                             d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 7.5A.75.75 0 0 0 9 9h1.5c.98 0 1.813.626 2.122 1.5H9A.75.75 0 0 0 9 12h3.622a2.251 2.251 0 0 1-2.122 1.5H9a.75.75 0 0 0-.53 1.28l3 3a.75.75 0 1 0 1.06-1.06L10.8 14.988A3.752 3.752 0 0 0 14.175 12H15a.75.75 0 0 0 0-1.5h-.825A3.733 3.733 0 0 0 13.5 9H15a.75.75 0 0 0 0-1.5H9Z"
// // // //                             clipRule="evenodd"
// // // //                           />
// // // //                         </svg>
// // // //                         {formatPricing(filteredExperts[currentMobileIndex].pricing)}
// // // //                       </p>
// // // //                     )}
// // // //                   </div>
// // // //                   <div className="flex gap-2 mt-4">
// // // //                     <Link href={`/experts/${filteredExperts[currentMobileIndex].username}`} className="flex-1">
// // // //                       <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
// // // //                         View Profile
// // // //                       </button>
// // // //                     </Link>
// // // //                     <button
// // // //                       onClick={() => setModalExpert(filteredExperts[currentMobileIndex])}
// // // //                       className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
// // // //                     >
// // // //                       Ask Question
// // // //                     </button>
// // // //                   </div>
// // // //                 </div>
// // // //               </motion.aside>
// // // //             )}
// // // //           </AnimatePresence>
// // // //         </div>
// // // //         {hasMore && (
// // // //           <div ref={loadMoreRef} className="h-10 flex justify-center items-center mt-4">
// // // //             {loading && <p className="text-gray-600">Loading more experts...</p>}
// // // //           </div>
// // // //         )}
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // "use client";

// // // import { useState, useEffect, useMemo, useRef } from "react";
// // // import Image from "next/image";
// // // import Link from "next/link";
// // // import { getFirestore, collection, getDocs, query, limit, startAfter } from "firebase/firestore";
// // // import { app } from "@/lib/firebase";
// // // import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaTimes, FaLanguage } from "react-icons/fa";
// // // import { useSearchParams, useRouter } from "next/navigation";
// // // import AskQuestionModal from "@/app/components/AskQuestionModal";
// // // import { motion, AnimatePresence } from 'framer-motion';
// // // import Lightbox from 'react-image-lightbox';
// // // import 'react-image-lightbox/style.css';
// // // import { Share2, MessageCircle } from "lucide-react";

// // // const db = getFirestore(app);

// // // export default function ExpertsDirectory() {
// // //   const [experts, setExperts] = useState([]);
// // //   const [filteredExperts, setFilteredExperts] = useState([]);
// // //   const [searchTerm, setSearchTerm] = useState("");
// // //   const [languageFilter, setLanguageFilter] = useState("");
// // //   const [locationFilter, setLocationFilter] = useState("");
// // //   const [specializationFilter, setSpecializationFilter] = useState("");
// // //   const [modalExpert, setModalExpert] = useState(null);
// // //   const [isLightboxOpen, setIsLightboxOpen] = useState(false);
// // //   const [selectedImage, setSelectedImage] = useState("");
// // //   const [lastDoc, setLastDoc] = useState(null);
// // //   const [loading, setLoading] = useState(false);
// // //   const [hasMore, setHasMore] = useState(true);
// // //   const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
// // //   const searchParams = useSearchParams();
// // //   const router = useRouter();
// // //   const observerRef = useRef(null);
// // //   const loadMoreRef = useRef(null);
// // //   const mobileCardRef = useRef(null);

// // //   const keywords = useMemo(() => {
// // //     return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
// // //   }, [searchParams]);

// // //   const initialQuestion = useMemo(() => {
// // //     return searchParams.get("question") || "";
// // //   }, [searchParams]);

// // //   const toSentenceCase = (input) => {
// // //     if (!input) return "";
// // //     if (Array.isArray(input)) {
// // //       return input.map(item => toSentenceCase(item)).join(", ");
// // //     }
// // //     if (typeof input !== "string") return "";
// // //     return input
// // //       .toLowerCase()
// // //       .split(" ")
// // //       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
// // //       .join(" ");
// // //   };

// // //   const calculateTotalExperience = (experience) => {
// // //     if (!Array.isArray(experience) || experience.length === 0) return "0+";

// // //     const today = new Date();
// // //     let earliestStart = null;
// // //     let latestEnd = null;

// // //     experience.forEach(exp => {
// // //       const startDate = exp.startDate ? new Date(exp.startDate) : null;
// // //       const endDate = exp.endDate === "Present" ? today : exp.endDate ? new Date(exp.endDate) : null;

// // //       if (startDate && (!earliestStart || startDate < earliestStart)) {
// // //         earliestStart = startDate;
// // //       }
// // //       if (endDate && (!latestEnd || endDate > latestEnd)) {
// // //         latestEnd = endDate;
// // //       }
// // //     });

// // //     if (!earliestStart || !latestEnd || latestEnd < earliestStart) {
// // //       return "0+";
// // //     }

// // //     const totalMonths = (latestEnd.getFullYear() - earliestStart.getFullYear()) * 12 +
// // //                         (latestEnd.getMonth() - earliestStart.getMonth());

// // //     const years = Math.floor(totalMonths / 12);
// // //     return `${years}+`;
// // //   };

// // //   const formatPricing = (pricing) => {
// // //     if (!pricing) return "799/session";
// // //     const numeric = pricing.match(/\d+(\.\d+)?/)?.[0] || "799";
// // //     return `${numeric}/session`;
// // //   };

// // //   const normalizeText = (text) => {
// // //     if (!text || typeof text !== "string") return "";
// // //     return text
// // //       .toLowerCase()
// // //       .replace(/[^a-z0-9\s]/g, " ")
// // //       .replace(/\s+/g, " ")
// // //       .trim();
// // //   };

// // //   const handleSearchSubmit = (e) => {
// // //     e.preventDefault();
// // //     if (searchTerm.trim()) {
// // //       const formattedKeywords = normalizeText(searchTerm)
// // //         .split(" ")
// // //         .filter(Boolean)
// // //         .join(",");
// // //       router.push(`/ask-an-expert?keywords=${encodeURIComponent(formattedKeywords)}`);
// // //     } else {
// // //       router.push("/ask-an-expert");
// // //     }
// // //     setCurrentMobileIndex(0); // Reset mobile index on new search
// // //   };

// // //   const openLightbox = (imageSrc) => {
// // //     setSelectedImage(imageSrc);
// // //     setIsLightboxOpen(true);
// // //   };

// // //   useEffect(() => {
// // //     if (keywords.length > 0) {
// // //       setSearchTerm(keywords.join(" "));
// // //     } else {
// // //       setSearchTerm("");
// // //     }
// // //     setCurrentMobileIndex(0); // Reset mobile index when keywords change
// // //   }, [keywords]);

// // //   const fetchExperts = async () => {
// // //     if (loading || !hasMore) return;
// // //     setLoading(true);
// // //     try {
// // //       const profilesQuery = lastDoc
// // //         ? query(collection(db, "Profiles"), limit(9), startAfter(lastDoc))
// // //         : query(collection(db, "Profiles"), limit(9));
// // //       const querySnapshot = await getDocs(profilesQuery);
// // //       const expertsData = querySnapshot.docs.map((doc) => {
// // //         const data = doc.data();
// // //         return {
// // //           id: doc.id,
// // //           fullName: toSentenceCase(data.fullName),
// // //           tagline: toSentenceCase(data.tagline),
// // //           languages: Array.isArray(data.languages) ? data.languages : [],
// // //           location: toSentenceCase(data.location),
// // //           expertise: Array.isArray(data.expertise) ? data.expertise.map(toSentenceCase) : [],
// // //           pricing: data.pricing,
// // //           responseTime: data.responseTime,
// // //           username: data.username,
// // //           photo: data.photo,
// // //           about: toSentenceCase(data.about),
// // //           certifications: toSentenceCase(data.certifications),
// // //           services: Array.isArray(data.services) ? data.services.map(toSentenceCase) : [],
// // //           regions: Array.isArray(data.regions) ? data.regions.map(toSentenceCase) : [],
// // //           experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
// // //             ...exp,
// // //             company: toSentenceCase(exp.company),
// // //             title: toSentenceCase(exp.title),
// // //           })) : [],
// // //           email: data.email || "",
// // //         };
// // //       });

// // //       // Deduplicate expertsData based on id
// // //       const uniqueExpertsData = expertsData.filter(
// // //         newExpert => !experts.some(existingExpert => existingExpert.id === newExpert.id)
// // //       );

// // //       setExperts(prev => [...prev, ...uniqueExpertsData]);
// // //       setFilteredExperts(prev => {
// // //         const combined = [...prev, ...uniqueExpertsData];
// // //         // Ensure filteredExperts also has unique entries
// // //         const seenIds = new Set();
// // //         return combined.filter(expert => {
// // //           if (seenIds.has(expert.id)) return false;
// // //           seenIds.add(expert.id);
// // //           return true;
// // //         });
// // //       });
// // //       setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
// // //       setHasMore(querySnapshot.docs.length === 9);
// // //     } catch (error) {
// // //       console.error("Error fetching experts:", error);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     fetchExperts();
// // //   }, []);

// // //   useEffect(() => {
// // //     let result = experts;

// // //     if (searchTerm) {
// // //       const searchTerms = normalizeText(searchTerm)
// // //         .split(" ")
// // //         .filter(term => term);
      
// // //       result = result
// // //         .map(expert => {
// // //           const searchableFields = [
// // //             normalizeText(expert.fullName),
// // //             normalizeText(expert.tagline),
// // //             normalizeText(expert.about),
// // //             normalizeText(expert.certifications),
// // //             ...expert.languages.map(normalizeText),
// // //             normalizeText(expert.location),
// // //             ...expert.services.map(normalizeText),
// // //             ...expert.expertise.map(normalizeText),
// // //             ...expert.regions.map(normalizeText),
// // //             ...expert.experience.map(exp => `${normalizeText(exp.company)} ${normalizeText(exp.title)}`),
// // //           ].filter(Boolean).join(" ");
          
// // //           const matchCount = searchTerms.reduce((count, term) => {
// // //             return count + (searchableFields.includes(term) ? 1 : 0);
// // //           }, 0);
          
// // //           return { expert, matchCount };
// // //         })
// // //         .filter(({ matchCount }) => matchCount > 0)
// // //         .sort((a, b) => b.matchCount - a.matchCount)
// // //         .map(({ expert }) => expert);
// // //     }

// // //     if (languageFilter) {
// // //       result = result.filter((expert) =>
// // //         expert.languages?.some(lang => normalizeText(lang).includes(normalizeText(languageFilter)))
// // //       );
// // //     }

// // //     if (locationFilter) {
// // //       result = result.filter((expert) =>
// // //         normalizeText(expert.location).includes(normalizeText(locationFilter))
// // //       );
// // //     }

// // //     if (specializationFilter) {
// // //       result = result.filter((expert) =>
// // //         expert.expertise?.some((expertise) =>
// // //           normalizeText(expertise).includes(normalizeText(specializationFilter))
// // //         )
// // //       );
// // //     }

// // //     // Ensure filteredExperts has unique entries
// // //     const seenIds = new Set();
// // //     const uniqueFilteredExperts = result.filter(expert => {
// // //       if (seenIds.has(expert.id)) return false;
// // //       seenIds.add(expert.id);
// // //       return true;
// // //     });

// // //     setFilteredExperts(uniqueFilteredExperts);
// // //     setCurrentMobileIndex(0); // Reset mobile index when filters change
// // //   }, [searchTerm, languageFilter, locationFilter, specializationFilter, experts]);

// // //   const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages || []))].map(toSentenceCase);
// // //   const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean).map(toSentenceCase);
// // //   const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))].map(toSentenceCase);

// // //   const truncateTagline = (tagline) => {
// // //     if (!tagline) return "";
// // //     return tagline.length > 150 ? `${tagline.substring(0, 130)}...` : tagline;
// // //   };

// // //   const handleClearFilters = () => {
// // //     setSearchTerm("");
// // //     setLanguageFilter("");
// // //     setLocationFilter("");
// // //     setSpecializationFilter("");
// // //     router.push("/ask-an-expert");
// // //     setCurrentMobileIndex(0);
// // //   };

// // //   useEffect(() => {
// // //     const handleScroll = () => {
// // //       if (window.innerWidth >= 640) return; // Skip for non-mobile views
// // //       const card = mobileCardRef.current;
// // //       if (!card) return;

// // //       const rect = card.getBoundingClientRect();
// // //       const windowHeight = window.innerHeight;

// // //       // Trigger when card is mostly out of view (e.g., 80% scrolled past)
// // //       if (rect.top < windowHeight * 0.2 && currentMobileIndex < filteredExperts.length - 1) {
// // //         setCurrentMobileIndex(prev => prev + 1);
// // //       }
// // //     };

// // //     window.addEventListener('scroll', handleScroll);
// // //     return () => window.removeEventListener('scroll', handleScroll);
// // //   }, [currentMobileIndex, filteredExperts.length]);

// // //   useEffect(() => {
// // //     const observer = new IntersectionObserver(
// // //       entries => {
// // //         if (entries[0].isIntersecting && hasMore && !loading) {
// // //           fetchExperts();
// // //         }
// // //       },
// // //       { threshold: 0.1 }
// // //     );
// // //     if (loadMoreRef.current) {
// // //       observer.observe(loadMoreRef.current);
// // //     }
// // //     observerRef.current = observer;
// // //     return () => {
// // //       if (observerRef.current) {
// // //         observerRef.current.disconnect();
// // //       }
// // //     };
// // //   }, [hasMore, loading]);

// // //   return (
// // //     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-16">
// // //       {modalExpert && (
// // //         <AskQuestionModal
// // //           expert={modalExpert}
// // //           onClose={() => setModalExpert(null)}
// // //           initialQuestion={decodeURIComponent(initialQuestion)}
// // //         />
// // //       )}
// // //       {isLightboxOpen && (
// // //         <Lightbox
// // //           mainSrc={selectedImage}
// // //           onCloseRequest={() => setIsLightboxOpen(false)}
// // //           imageTitle={selectedImage.includes('default.jpg') ? 'Default Profile Image' : 'Expert Profile Image'}
// // //         />
// // //       )}
// // //       <div className="max-w-7xl mx-auto mt-5">
// // //         <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
// // //           Real Experts. Real Answers. For Your Real Travel Plans.
// // //         </h1>
// // //         <p className="text-center text-gray-600 mb-4 text-sm sm:text-base">
// // //           Get answers from a trusted circle of verified travel experts across every domain from visas to vacations.
// // //         </p>

// // //         <div className="mb-4">
// // //           <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
// // //             <div className="flex-1 relative">
// // //               <FaGlobe className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // //               <select
// // //                 value={languageFilter}
// // //                 onChange={(e) => setLanguageFilter(e.target.value)}
// // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // //               >
// // //                 <option value="">Language</option>
// // //                 {uniqueLanguages.map((lang) => (
// // //                   <option key={lang} value={lang}>
// // //                     {lang}
// // //                   </option>
// // //                 ))}
// // //               </select>
// // //             </div>
// // //             <div className="flex-1 relative">
// // //               <FaMapMarkerAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // //               <select
// // //                 value={locationFilter}
// // //                 onChange={(e) => setLocationFilter(e.target.value)}
// // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // //               >
// // //                 <option value="">Location</option>
// // //                 {uniqueLocations.map((loc) => (
// // //                   <option key={loc} value={loc}>
// // //                     {loc}
// // //                   </option>
// // //                 ))}
// // //               </select>
// // //             </div>
// // //             <div className="flex-1 relative">
// // //               <FaUserTag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// // //               <select
// // //                 value={specializationFilter}
// // //                 onChange={(e) => setSpecializationFilter(e.target.value)}
// // //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // //               >
// // //                 <option value="">Expertise</option>
// // //                 {uniqueSpecializations.map((spec) => (
// // //                   <option key={spec} value={spec}>
// // //                     {spec}
// // //                   </option>
// // //                 ))}
// // //               </select>
// // //             </div>
// // //             <div className="flex-1 flex items-center">
// // //               <button
// // //                 onClick={handleClearFilters}
// // //                 className="w-full flex items-center justify-center gap-5 px-2 py-1 bg-[#36013F] text-white rounded-full hover:bg-opacity-90 transition-all text-xs"
// // //               >
// // //                 <FaTimes />
// // //                 Clear
// // //               </button>
// // //             </div>
// // //           </div>
         
// // //           <div className="relative flex items-center gap-2">
// // //             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-sm" />
// // //             <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
// // //               <input
// // //                 type="text"
// // //                 placeholder="Search keywords (e.g., visa travel documentation)"
// // //                 value={searchTerm}
// // //                 onChange={(e) => setSearchTerm(e.target.value)}
// // //                 className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // //               />
// // //               <button
// // //                 type="submit"
// // //                 className="bg-[#36013F] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all text-sm"
// // //               >
// // //                 Search
// // //               </button>
// // //             </form>
// // //           </div>
// // //         </div>

// // //         {filteredExperts.length === 0 && (
// // //           <div className="text-center text-gray-600 py-8 text-sm">
// // //             <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
// // //           </div>
// // //         )}

// // //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
// // //           {/* Desktop view: Show all experts */}
// // //           {filteredExperts.map((expert) => (
// // //             <motion.div
// // //               key={`desktop-${expert.id}`}
// // //               className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow sm:block hidden"
// // //               initial={{ opacity: 0, y: 20 }}
// // //               animate={{ opacity: 1, y: 0 }}
// // //               transition={{ duration: 0.3 }}
// // //             >
// // //               <div className="flex items-center gap-3 mb-3">
// // //                 <button
// // //                   onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
// // //                   className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-[#36013F] shadow-sm"
// // //                 >
// // //                   <Image
// // //                     src={expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg'}
// // //                     alt={expert.fullName || 'Expert Profile'}
// // //                     fill
// // //                     sizes="60px"
// // //                     className="object-cover object-center rounded-full"
// // //                     priority={false}
// // //                   />
// // //                 </button>
// // //                 <div className="flex-1">
// // //                   <h2 className="text-base font-semibold text-gray-800">
// // //                     {expert.fullName || 'Unknown Expert'}
// // //                   </h2>
// // //                   <p className="text-xs text-gray-600 line-clamp-2">
// // //                     {truncateTagline(expert.tagline) || 'No tagline provided'}
// // //                   </p>
// // //                 </div>
// // //                 <div className="flex justify-center items-center py-1 space-y-0.5">
// // //                   <div className="text-primary border-2 border-primary rounded-lg px-2 w-[48px] flex flex-col items-center py-1">
// // //                     <h1 className="font-bold text-center text-base">{calculateTotalExperience(expert.experience) || 'No experience provided'}</h1>
// // //                     <span className="font-semibold text-xs text-center">YEARS</span>
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //               <div className="space-y-3">
// // //                 <div className="flex flex-wrap gap-1.5">
// // //                   {expert.expertise?.map((expertise) => (
// // //                     <span
// // //                       key={expertise}
// // //                       className="bg-[#36013F] text-white text-xs px-1.5 py-0.5 rounded-full"
// // //                     >
// // //                       {expertise}
// // //                     </span>
// // //                   ))}
// // //                 </div>
// // //                 <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
// // //                   <p className="flex items-center gap-1.5">
// // //                     <FaRupeeSign className="text-[#36013F]" />
// // //                     {formatPricing(expert.pricing)}
// // //                   </p>
// // //                   <p className="flex items-center gap-1.5">
// // //                     <FaLanguage className="text-[#36013F]" />
// // //                     {toSentenceCase(expert.languages) || "English, Hindi"}
// // //                   </p>
// // //                   <p className="flex items-center gap-1.5">
// // //                     <FaMapMarkerAlt className="text-[#36013F]" />
// // //                     {expert.location || "Delhi, India"}
// // //                   </p>
// // //                   <p className="flex items-center gap-1.5">
// // //                     <FaClock className="text-[#36013F]" />
// // //                     {expert.responseTime || "10 mins"}
// // //                   </p>
// // //                 </div>
// // //               </div>
// // //               <div className="flex gap-2 mt-4">
// // //                 <Link href={`/experts/${expert.username}`} className="flex-1">
// // //                   <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
// // //                     View Profile
// // //                   </button>
// // //                 </Link>
// // //                 <button
// // //                   onClick={() => setModalExpert(expert)}
// // //                   className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
// // //                 >
// // //                   Ask Question
// // //                 </button>
// // //               </div>
// // //             </motion.div>
// // //           ))}
// // //           {/* Mobile view: Show one expert at a time with animation */}
// // //           <AnimatePresence>
// // //             {filteredExperts.length > 0 && currentMobileIndex < filteredExperts.length && (
// // //               <motion.aside
// // //                 key={`mobile-${filteredExperts[currentMobileIndex].id}`}
// // //                 ref={mobileCardRef}
// // //                 className="lg:col-span-1 space-y-4 sm:hidden"
// // //                 initial={{ opacity: 0, y: 50 }}
// // //                 animate={{ opacity: 1, y: 0 }}
// // //                 exit={{ opacity: 0, y: -50 }}
// // //                 transition={{ duration: 0.5, ease: "easeInOut" }}
// // //               >
// // //                 <div className="bg-[#36013F] rounded-3xl shadow-lg p-6 text-center relative">
// // //                   <div className="mb-4 relative">
// // //                     <button
// // //                       onClick={() => openLightbox(filteredExperts[currentMobileIndex].photo && filteredExperts[currentMobileIndex].photo !== '' ? filteredExperts[currentMobileIndex].photo : '/default.jpg')}
// // //                       className="w-28 h-28 rounded-full border-4 border-[#F4D35E] object-cover mx-auto shadow-md overflow-hidden"
// // //                     >
// // //                       <Image
// // //                         src={filteredExperts[currentMobileIndex].photo && filteredExperts[currentMobileIndex].photo !== '' ? filteredExperts[currentMobileIndex].photo : '/default.jpg'}
// // //                         alt={filteredExperts[currentMobileIndex].fullName || 'Expert Profile'}
// // //                         width={112}
// // //                         height={112}
// // //                         className="rounded-full object-cover mx-auto shadow-md"
// // //                         priority={false}
// // //                       />
// // //                     </button>
// // //                     <div className="flex justify-center items-center py-1 absolute top-0 right-0 space-y-0.5">
// // //                       <div className="text-[#F4D35E] border-2 border-[#F4D35E] rounded-lg px-2 w-[48px] flex flex-col items-center">
// // //                         <h1 className="font-bold text-center text-base">{calculateTotalExperience(filteredExperts[currentMobileIndex].experience) || '0+'}</h1>
// // //                         <span className="font-semibold text-xs text-center">YEARS</span>
// // //                       </div>
// // //                     </div>
// // //                   </div>
// // //                   <p className="text-sm mt-1 text-white">@{filteredExperts[currentMobileIndex].username || 'unknown'}</p>
// // //                   <h1
// // //                     className="text-xl font-semibold text-white"
// // //                     style={{ fontFamily: "'DM Serif Display', serif" }}
// // //                   >
// // //                     {filteredExperts[currentMobileIndex].fullName || 'Unknown Expert'}
// // //                   </h1>
// // //                   {filteredExperts[currentMobileIndex].title && (
// // //                     <p className="text-sm mt-1 text-white">{filteredExperts[currentMobileIndex].title}</p>
// // //                   )}
// // //                   {filteredExperts[currentMobileIndex].tagline && (
// // //                     <p className="text-sm mt-1 text-white">{truncateTagline(filteredExperts[currentMobileIndex].tagline) || 'No tagline provided'}</p>
// // //                   )}
// // //                   <span className="inline-flex items-center gap-1 bg-[#F4D35E] text-black text-xs font-medium px-3 py-1 mt-2 rounded-full">
// // //                     <svg
// // //                       xmlns="http://www.w3.org/2000/svg"
// // //                       viewBox="0 0 24 24"
// // //                       fill="currentColor"
// // //                       className="w-4 h-4"
// // //                     >
// // //                       <path
// // //                         fillRule="evenodd"
// // //                         d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 2.122 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
// // //                         clipRule="evenodd"
// // //                       />
// // //                     </svg>
// // //                     Verified by Xmytravel
// // //                   </span>
// // //                   <div className="mt-4 text-sm text-left space-y-2 text-white">
// // //                     {filteredExperts[currentMobileIndex].location && (
// // //                       <p className="flex items-center gap-2">
// // //                         <svg
// // //                           xmlns="http://www.w3.org/2000/svg"
// // //                           fill="currentColor"
// // //                           viewBox="0 0 24 24"
// // //                           className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// // //                         >
// // //                           <path
// // //                             fillRule="evenodd"
// // //                             d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
// // //                             clipRule="evenodd"
// // //                           />
// // //                         </svg>
// // //                         {filteredExperts[currentMobileIndex].location || 'Delhi, India'}
// // //                       </p>
// // //                     )}
// // //                     {filteredExperts[currentMobileIndex].languages && (
// // //                       <p className="flex items-center gap-2">
// // //                         <svg
// // //                           xmlns="http://www.w3.org/2000/svg"
// // //                           viewBox="0 0 24 24"
// // //                           fill="currentColor"
// // //                           className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// // //                         >
// // //                           <path
// // //                             fillRule="evenodd"
// // //                             d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 1.357L14.25 7.5l.165.33a.809.809 0 0 1-1.086 1.085l-.604-.302a1.125 1.125 0 0 0-1.298.21.combined.l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 0 1-2.288 4.04l-.723.724a1.125 1.125 0 0 1-1.298.21l-.153-.076a1.125 1.125 0 0 1-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 0 1-.21-1.298L9.75 12l-1.64-1.64a6 6 0 0 1-1.676-3.257l-.172-1.03Z"
// // //                             clipRule="evenodd"
// // //                           />
// // //                         </svg>
// // //                         Languages: {toSentenceCase(filteredExperts[currentMobileIndex].languages) || 'English, Hindi'}
// // //                       </p>
// // //                     )}
// // //                     {filteredExperts[currentMobileIndex].responseTime && (
// // //                       <p className="flex items-center gap-2">
// // //                         <svg
// // //                           xmlns="http://www.w3.org/2000/svg"
// // //                           fill="currentColor"
// // //                           viewBox="0 0 24 24"
// // //                           className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// // //                         >
// // //                           <path
// // //                             fillRule="evenodd"
// // //                             d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
// // //                             clipRule="evenodd"
// // //                           />
// // //                         </svg>
// // //                         {filteredExperts[currentMobileIndex].responseTime || '10 mins'}
// // //                       </p>
// // //                     )}
// // //                     {filteredExperts[currentMobileIndex].pricing && (
// // //                       <p className="flex items-center gap-2">
// // //                         <svg
// // //                           xmlns="http://www.w3.org/2000/svg"
// // //                           fill="currentColor"
// // //                           viewBox="0 0 24 24"
// // //                           className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// // //                         >
// // //                           <path
// // //                             fillRule="evenodd"
// // //                             d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 7.5A.75.75 0 0 0 9 9h1.5c.98 0 1.813.626 2.122 1.5H9A.75.75 0 0 0 9 12h3.622a2.251 2.251 0 0 1-2.122 1.5H9a.75.75 0 0 0-.53 1.28l3 3a.75.75 0 1 0 1.06-1.06L10.8 14.988A3.752 3.752 0 0 0 14.175 12H15a.75.75 0 0 0 0-1.5h-.825A3.733 3.733 0 0 0 13.5 9H15a.75.75 0 0 0 0-1.5H9Z"
// // //                             clipRule="evenodd"
// // //                           />
// // //                         </svg>
// // //                         {formatPricing(filteredExperts[currentMobileIndex].pricing)}
// // //                       </p>
// // //                     )}
// // //                   </div>
// // //                   <div className="flex gap-2 mt-4">
// // //                     <Link href={`/experts/${filteredExperts[currentMobileIndex].username}`} className="flex-1">
// // //                       <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
// // //                         View Profile
// // //                       </button>
// // //                     </Link>
// // //                     <button
// // //                       onClick={() => setModalExpert(filteredExperts[currentMobileIndex])}
// // //                       className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
// // //                     >
// // //                       Ask Question
// // //                     </button>
// // //                   </div>
// // //                 </div>
// // //               </motion.aside>
// // //             )}
// // //           </AnimatePresence>
// // //         </div>
// // //         {hasMore && (
// // //           <div ref={loadMoreRef} className="h-10 flex justify-center items-center mt-4">
// // //             {loading && <p className="text-gray-600">Loading more experts...</p>}
// // //           </div>
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // "use client";

// // import { useState, useEffect, useMemo, useRef } from "react";
// // import Image from "next/image";
// // import Link from "next/link";
// // import { getFirestore, collection, getDocs, query, limit, startAfter } from "firebase/firestore";
// // import { app } from "@/lib/firebase";
// // import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaTimes, FaLanguage } from "react-icons/fa";
// // import { useSearchParams, useRouter } from "next/navigation";
// // import AskQuestionModal from "@/app/components/AskQuestionModal";
// // import { motion, AnimatePresence } from 'framer-motion';
// // import Lightbox from 'react-image-lightbox';
// // import 'react-image-lightbox/style.css';
// // import { Share2, MessageCircle } from "lucide-react";

// // const db = getFirestore(app);

// // export default function ExpertsDirectory() {
// //   const [experts, setExperts] = useState([]);
// //   const [filteredExperts, setFilteredExperts] = useState([]);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [languageFilter, setLanguageFilter] = useState("");
// //   const [locationFilter, setLocationFilter] = useState("");
// //   const [specializationFilter, setSpecializationFilter] = useState("");
// //   const [modalExpert, setModalExpert] = useState(null);
// //   const [isLightboxOpen, setIsLightboxOpen] = useState(false);
// //   const [selectedImage, setSelectedImage] = useState("");
// //   const [lastDoc, setLastDoc] = useState(null);
// //   const [loading, setLoading] = useState(false);
// //   const [hasMore, setHasMore] = useState(true);
// //   const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
// //   const searchParams = useSearchParams();
// //   const router = useRouter();
// //   const observerRef = useRef(null);
// //   const loadMoreRef = useRef(null);
// //   const mobileCardRef = useRef(null);

// //   const keywords = useMemo(() => {
// //     return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
// //   }, [searchParams]);

// //   const initialQuestion = useMemo(() => {
// //     return searchParams.get("question") || "";
// //   }, [searchParams]);

// //   const toSentenceCase = (input) => {
// //     if (!input) return "";
// //     if (Array.isArray(input)) {
// //       return input.map(item => toSentenceCase(item)).join(", ");
// //     }
// //     if (typeof input !== "string") return "";
// //     return input
// //       .toLowerCase()
// //       .split(" ")
// //       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
// //       .join(" ");
// //   };

// //   const calculateTotalExperience = (experience) => {
// //     if (!Array.isArray(experience) || experience.length === 0) return "0+";

// //     const today = new Date();
// //     let earliestStart = null;
// //     let latestEnd = null;

// //     experience.forEach(exp => {
// //       const startDate = exp.startDate ? new Date(exp.startDate) : null;
// //       const endDate = exp.endDate === "Present" ? today : exp.endDate ? new Date(exp.endDate) : null;

// //       if (startDate && (!earliestStart || startDate < earliestStart)) {
// //         earliestStart = startDate;
// //       }
// //       if (endDate && (!latestEnd || endDate > latestEnd)) {
// //         latestEnd = endDate;
// //       }
// //     });

// //     if (!earliestStart || !latestEnd || latestEnd < earliestStart) {
// //       return "0+";
// //     }

// //     const totalMonths = (latestEnd.getFullYear() - earliestStart.getFullYear()) * 12 +
// //                         (latestEnd.getMonth() - earliestStart.getMonth());

// //     const years = Math.floor(totalMonths / 12);
// //     return `${years}+`;
// //   };

// //   const formatPricing = (pricing) => {
// //     if (!pricing) return "799/session";
// //     const numeric = pricing.match(/\d+(\.\d+)?/)?.[0] || "799";
// //     return `${numeric}/session`;
// //   };

// //   const normalizeText = (text) => {
// //     if (!text || typeof text !== "string") return "";
// //     return text
// //       .toLowerCase()
// //       .replace(/[^a-z0-9\s]/g, " ")
// //       .replace(/\s+/g, " ")
// //       .trim();
// //   };

// //   const handleSearchSubmit = (e) => {
// //     e.preventDefault();
// //     if (searchTerm.trim()) {
// //       const formattedKeywords = normalizeText(searchTerm)
// //         .split(" ")
// //         .filter(Boolean)
// //         .join(",");
// //       router.push(`/ask-an-expert?keywords=${encodeURIComponent(formattedKeywords)}`);
// //     } else {
// //       router.push("/ask-an-expert");
// //     }
// //     setCurrentMobileIndex(0); // Reset mobile index on new search
// //   };

// //   const openLightbox = (imageSrc) => {
// //     setSelectedImage(imageSrc);
// //     setIsLightboxOpen(true);
// //   };

// //   useEffect(() => {
// //     if (keywords.length > 0) {
// //       setSearchTerm(keywords.join(" "));
// //     } else {
// //       setSearchTerm("");
// //     }
// //     setCurrentMobileIndex(0); // Reset mobile index when keywords change
// //   }, [keywords]);

// //   const fetchExperts = async () => {
// //     if (loading || !hasMore) return;
// //     setLoading(true);
// //     try {
// //       const profilesQuery = lastDoc
// //         ? query(collection(db, "Profiles"), limit(9), startAfter(lastDoc))
// //         : query(collection(db, "Profiles"), limit(9));
// //       const querySnapshot = await getDocs(profilesQuery);
// //       const expertsData = querySnapshot.docs.map((doc) => {
// //         const data = doc.data();
// //         return {
// //           id: doc.id,
// //           fullName: toSentenceCase(data.fullName),
// //           tagline: toSentenceCase(data.tagline),
// //           languages: Array.isArray(data.languages) ? data.languages : [],
// //           location: toSentenceCase(data.location),
// //           expertise: Array.isArray(data.expertise) ? data.expertise.map(toSentenceCase) : [],
// //           pricing: data.pricing,
// //           responseTime: data.responseTime,
// //           username: data.username,
// //           photo: data.photo,
// //           about: toSentenceCase(data.about),
// //           certifications: toSentenceCase(data.certifications),
// //           services: Array.isArray(data.services) ? data.services.map(toSentenceCase) : [],
// //           regions: Array.isArray(data.regions) ? data.regions.map(toSentenceCase) : [],
// //           experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
// //             ...exp,
// //             company: toSentenceCase(exp.company),
// //             title: toSentenceCase(exp.title),
// //           })) : [],
// //           email: data.email || "",
// //         };
// //       });

// //       // Deduplicate expertsData based on id
// //       const uniqueExpertsData = expertsData.filter(
// //         newExpert => !experts.some(existingExpert => existingExpert.id === newExpert.id)
// //       );

// //       setExperts(prev => [...prev, ...uniqueExpertsData]);
// //       setFilteredExperts(prev => {
// //         const combined = [...prev, ...uniqueExpertsData];
// //         const seenIds = new Set();
// //         return combined.filter(expert => {
// //           if (seenIds.has(expert.id)) return false;
// //           seenIds.add(expert.id);
// //           return true;
// //         });
// //       });
// //       setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
// //       setHasMore(querySnapshot.docs.length === 9);
// //     } catch (error) {
// //       console.error("Error fetching experts:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchExperts();
// //   }, []);

// //   useEffect(() => {
// //     let result = experts;

// //     if (searchTerm) {
// //       const searchTerms = normalizeText(searchTerm)
// //         .split(" ")
// //         .filter(term => term);
      
// //       result = result
// //         .map(expert => {
// //           const searchableFields = [
// //             normalizeText(expert.fullName),
// //             normalizeText(expert.tagline),
// //             normalizeText(expert.about),
// //             normalizeText(expert.certifications),
// //             ...expert.languages.map(normalizeText),
// //             normalizeText(expert.location),
// //             ...expert.services.map(normalizeText),
// //             ...expert.expertise.map(normalizeText),
// //             ...expert.regions.map(normalizeText),
// //             ...expert.experience.map(exp => `${normalizeText(exp.company)} ${normalizeText(exp.title)}`),
// //           ].filter(Boolean).join(" ");
          
// //           const matchCount = searchTerms.reduce((count, term) => {
// //             return count + (searchableFields.includes(term) ? 1 : 0);
// //           }, 0);
          
// //           return { expert, matchCount };
// //         })
// //         .filter(({ matchCount }) => matchCount > 0)
// //         .sort((a, b) => b.matchCount - a.matchCount)
// //         .map(({ expert }) => expert);
// //     }

// //     if (languageFilter) {
// //       result = result.filter((expert) =>
// //         expert.languages?.some(lang => normalizeText(lang).includes(normalizeText(languageFilter)))
// //       );
// //     }

// //     if (locationFilter) {
// //       result = result.filter((expert) =>
// //         normalizeText(expert.location).includes(normalizeText(locationFilter))
// //       );
// //     }

// //     if (specializationFilter) {
// //       result = result.filter((expert) =>
// //         expert.expertise?.some((expertise) =>
// //           normalizeText(expertise).includes(normalizeText(specializationFilter))
// //         )
// //       );
// //     }

// //     // Ensure filteredExperts has unique entries
// //     const seenIds = new Set();
// //     const uniqueFilteredExperts = result.filter(expert => {
// //       if (seenIds.has(expert.id)) return false;
// //       seenIds.add(expert.id);
// //       return true;
// //     });

// //     setFilteredExperts(uniqueFilteredExperts);
// //     setCurrentMobileIndex(0); // Reset mobile index when filters change
// //   }, [searchTerm, languageFilter, locationFilter, specializationFilter, experts]);

// //   const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages || []))].map(toSentenceCase);
// //   const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean).map(toSentenceCase);
// //   const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))].map(toSentenceCase);

// //   const truncateTagline = (tagline) => {
// //     if (!tagline) return "";
// //     return tagline.length > 150 ? `${tagline.substring(0, 130)}...` : tagline;
// //   };

// //   const handleClearFilters = () => {
// //     setSearchTerm("");
// //     setLanguageFilter("");
// //     setLocationFilter("");
// //     setSpecializationFilter("");
// //     router.push("/ask-an-expert");
// //     setCurrentMobileIndex(0);
// //   };

// //   useEffect(() => {
// //     const handleScroll = () => {
// //       if (window.innerWidth >= 640) return; // Skip for non-mobile views
// //       const card = mobileCardRef.current;
// //       if (!card) return;

// //       const rect = card.getBoundingClientRect();
// //       const windowHeight = window.innerHeight;

// //       // Trigger when card is mostly out of view (e.g., 80% scrolled past)
// //       if (rect.top < windowHeight * 0.2) {
// //         if (currentMobileIndex < filteredExperts.length - 1) {
// //           setCurrentMobileIndex(prev => prev + 1);
// //         } else if (hasMore && !loading) {
// //           // Trigger fetchExperts when reaching the end
// //           fetchExperts();
// //         }
// //       }
// //     };

// //     window.addEventListener('scroll', handleScroll);
// //     return () => window.removeEventListener('scroll', handleScroll);
// //   }, [currentMobileIndex, filteredExperts.length, hasMore, loading]);

// //   useEffect(() => {
// //     const observer = new IntersectionObserver(
// //       entries => {
// //         if (entries[0].isIntersecting && hasMore && !loading) {
// //           fetchExperts();
// //         }
// //       },
// //       { threshold: 0.1 }
// //     );
// //     if (loadMoreRef.current) {
// //       observer.observe(loadMoreRef.current);
// //     }
// //     observerRef.current = observer;
// //     return () => {
// //       if (observerRef.current) {
// //         observerRef.current.disconnect();
// //       }
// //     };
// //   }, [hasMore, loading]);

// //   return (
// //     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-16">
// //       {modalExpert && (
// //         <AskQuestionModal
// //           expert={modalExpert}
// //           onClose={() => setModalExpert(null)}
// //           initialQuestion={decodeURIComponent(initialQuestion)}
// //         />
// //       )}
// //       {isLightboxOpen && (
// //         <Lightbox
// //           mainSrc={selectedImage}
// //           onCloseRequest={() => setIsLightboxOpen(false)}
// //           imageTitle={selectedImage.includes('default.jpg') ? 'Default Profile Image' : 'Expert Profile Image'}
// //         />
// //       )}
// //       <div className="max-w-7xl mx-auto mt-5">
// //         <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
// //           Real Experts. Real Answers. For Your Real Travel Plans.
// //         </h1>
// //         <p className="text-center text-gray-600 mb-4 text-sm sm:text-base">
// //           Get answers from a trusted circle of verified travel experts across every domain from visas to vacations.
// //         </p>

// //         <div className="mb-4">
// //           <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
// //             <div className="flex-1 relative">
// //               <FaGlobe className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// //               <select
// //                 value={languageFilter}
// //                 onChange={(e) => setLanguageFilter(e.target.value)}
// //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// //               >
// //                 <option value="">Language</option>
// //                 {uniqueLanguages.map((lang) => (
// //                   <option key={lang} value={lang}>
// //                     {lang}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
// //             <div className="flex-1 relative">
// //               <FaMapMarkerAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// //               <select
// //                 value={locationFilter}
// //                 onChange={(e) => setLocationFilter(e.target.value)}
// //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// //               >
// //                 <option value="">Location</option>
// //                 {uniqueLocations.map((loc) => (
// //                   <option key={loc} value={loc}>
// //                     {loc}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
// //             <div className="flex-1 relative">
// //               <FaUserTag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
// //               <select
// //                 value={specializationFilter}
// //                 onChange={(e) => setSpecializationFilter(e.target.value)}
// //                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// //               >
// //                 <option value="">Expertise</option>
// //                 {uniqueSpecializations.map((spec) => (
// //                   <option key={spec} value={spec}>
// //                     {spec}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
// //             <div className="flex-1 flex items-center">
// //               <button
// //                 onClick={handleClearFilters}
// //                 className="w-full flex items-center justify-center gap-5 px-2 py-1 bg-[#36013F] text-white rounded-full hover:bg-opacity-90 transition-all text-xs"
// //               >
// //                 <FaTimes />
// //                 Clear
// //               </button>
// //             </div>
// //           </div>
         
// //           <div className="relative flex items-center gap-2">
// //             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 text-sm" />
// //             <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
// //               <input
// //                 type="text"
// //                 placeholder="Search keywords (e.g., visa travel documentation)"
// //                 value={searchTerm}
// //                 onChange={(e) => setSearchTerm(e.target.value)}
// //                 className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// //               />
// //               <button
// //                 type="submit"
// //                 className="bg-[#36013F] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all text-sm"
// //               >
// //                 Search
// //               </button>
// //             </form>
// //           </div>
// //         </div>

// //         {filteredExperts.length === 0 && (
// //           <div className="text-center text-gray-600 py-8 text-sm">
// //             <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
// //           </div>
// //         )}

// //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
// //           {/* Desktop view: Show all experts */}
// //           {filteredExperts.map((expert) => (
// //             <motion.div
// //               key={`desktop-${expert.id}`}
// //               className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow sm:block hidden"
// //               initial={{ opacity: 0, y: 20 }}
// //               animate={{ opacity: 1, y: 0 }}
// //               transition={{ duration: 0.3 }}
// //             >
// //               <div className="flex items-center gap-3 mb-3">
// //                 <button
// //                   onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
// //                   className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-[#36013F] shadow-sm"
// //                 >
// //                   <Image
// //                     src={expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg'}
// //                     alt={expert.fullName || 'Expert Profile'}
// //                     fill
// //                     sizes="60px"
// //                     className="object-cover object-center rounded-full"
// //                     priority={false}
// //                   />
// //                 </button>
// //                 <div className="flex-1">
// //                   <h2 className="text-base font-semibold text-gray-800">
// //                     {expert.fullName || 'Unknown Expert'}
// //                   </h2>
// //                   <p className="text-xs text-gray-600 line-clamp-2">
// //                     {truncateTagline(expert.tagline) || 'No tagline provided'}
// //                   </p>
// //                 </div>
// //                 <div className="flex justify-center items-center py-1 space-y-0.5">
// //                   <div className="text-primary border-2 border-primary rounded-lg px-2 w-[48px] flex flex-col items-center py-1">
// //                     <h1 className="font-bold text-center text-base">{calculateTotalExperience(expert.experience) || 'No experience provided'}</h1>
// //                     <span className="font-semibold text-xs text-center">YEARS</span>
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="space-y-3">
// //                 <div className="flex flex-wrap gap-1.5">
// //                   {expert.expertise?.map((expertise) => (
// //                     <span
// //                       key={expertise}
// //                       className="bg-[#36013F] text-white text-xs px-1.5 py-0.5 rounded-full"
// //                     >
// //                       {expertise}
// //                     </span>
// //                   ))}
// //                 </div>
// //                 <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
// //                   <p className="flex items-center gap-1.5">
// //                     <FaRupeeSign className="text-[#36013F]" />
// //                     {formatPricing(expert.pricing)}
// //                   </p>
// //                   <p className="flex items-center gap-1.5">
// //                     <FaLanguage className="text-[#36013F]" />
// //                     {toSentenceCase(expert.languages) || "English, Hindi"}
// //                   </p>
// //                   <p className="flex items-center gap-1.5">
// //                     <FaMapMarkerAlt className="text-[#36013F]" />
// //                     {expert.location || "Delhi, India"}
// //                   </p>
// //                   <p className="flex items-center gap-1.5">
// //                     <FaClock className="text-[#36013F]" />
// //                     {expert.responseTime || "10 mins"}
// //                   </p>
// //                 </div>
// //               </div>
// //               <div className="flex gap-2 mt-4">
// //                 <Link href={`/experts/${expert.username}`} className="flex-1">
// //                   <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
// //                     View Profile
// //                   </button>
// //                 </Link>
// //                 <button
// //                   onClick={() => setModalExpert(expert)}
// //                   className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
// //                 >
// //                   Ask Question
// //                 </button>
// //               </div>
// //             </motion.div>
// //           ))}
// //           {/* Mobile view: Show one expert at a time with animation */}
// //           <AnimatePresence>
// //             {filteredExperts.length > 0 && currentMobileIndex < filteredExperts.length && (
// //               <motion.aside
// //                 key={`mobile-${filteredExperts[currentMobileIndex].id}`}
// //                 ref={mobileCardRef}
// //                 className="lg:col-span-1 space-y-4 sm:hidden"
// //                 initial={{ opacity: 0, y: 50 }}
// //                 animate={{ opacity: 1, y: 0 }}
// //                 exit={{ opacity: 0, y: -50 }}
// //                 transition={{ duration: 0.5, ease: "easeInOut" }}
// //               >
// //                 <div className="bg-[#36013F] rounded-3xl shadow-lg p-6 text-center relative">
// //                   <div className="mb-4 relative">
// //                     <button
// //                       onClick={() => openLightbox(filteredExperts[currentMobileIndex].photo && filteredExperts[currentMobileIndex].photo !== '' ? filteredExperts[currentMobileIndex].photo : '/default.jpg')}
// //                       className="w-28 h-28 rounded-full border-4 border-[#F4D35E] object-cover mx-auto shadow-md overflow-hidden"
// //                     >
// //                       <Image
// //                         src={filteredExperts[currentMobileIndex].photo && filteredExperts[currentMobileIndex].photo !== '' ? filteredExperts[currentMobileIndex].photo : '/default.jpg'}
// //                         alt={filteredExperts[currentMobileIndex].fullName || 'Expert Profile'}
// //                         width={112}
// //                         height={112}
// //                         className="rounded-full object-cover mx-auto shadow-md"
// //                         priority={false}
// //                       />
// //                     </button>
// //                     <div className="flex justify-center items-center py-1 absolute top-0 right-0 space-y-0.5">
// //                       <div className="text-[#F4D35E] border-2 border-[#F4D35E] rounded-lg px-2 w-[48px] flex flex-col items-center">
// //                         <h1 className="font-bold text-center text-base">{calculateTotalExperience(filteredExperts[currentMobileIndex].experience) || '0+'}</h1>
// //                         <span className="font-semibold text-xs text-center">YEARS</span>
// //                       </div>
// //                     </div>
// //                   </div>
// //                   <p className="text-sm mt-1 text-white">@{filteredExperts[currentMobileIndex].username || 'unknown'}</p>
// //                   <h1
// //                     className="text-xl font-semibold text-white"
// //                     style={{ fontFamily: "'DM Serif Display', serif" }}
// //                   >
// //                     {filteredExperts[currentMobileIndex].fullName || 'Unknown Expert'}
// //                   </h1>
// //                   {filteredExperts[currentMobileIndex].title && (
// //                     <p className="text-sm mt-1 text-white">{filteredExperts[currentMobileIndex].title}</p>
// //                   )}
// //                   {filteredExperts[currentMobileIndex].tagline && (
// //                     <p className="text-sm mt-1 text-white">{truncateTagline(filteredExperts[currentMobileIndex].tagline) || 'No tagline provided'}</p>
// //                   )}
// //                   <span className="inline-flex items-center gap-1 bg-[#F4D35E] text-black text-xs font-medium px-3 py-1 mt-2 rounded-full">
// //                     <svg
// //                       xmlns="http://www.w3.org/2000/svg"
// //                       viewBox="0 0 24 24"
// //                       fill="currentColor"
// //                       className="w-4 h-4"
// //                     >
// //                       <path
// //                         fillRule="evenodd"
// //                         d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 2.122 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
// //                         clipRule="evenodd"
// //                       />
// //                     </svg>
// //                     Verified by Xmytravel
// //                   </span>
// //                   <div className="mt-4 text-sm text-left space-y-2 text-white">
// //                     {filteredExperts[currentMobileIndex].location && (
// //                       <p className="flex items-center gap-2">
// //                         <svg
// //                           xmlns="http://www.w3.org/2000/svg"
// //                           fill="currentColor"
// //                           viewBox="0 0 24 24"
// //                           className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// //                         >
// //                           <path
// //                             fillRule="evenodd"
// //                             d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
// //                             clipRule="evenodd"
// //                           />
// //                         </svg>
// //                         {filteredExperts[currentMobileIndex].location || 'Delhi, India'}
// //                       </p>
// //                     )}
// //                     {filteredExperts[currentMobileIndex].languages && (
// //                       <p className="flex items-center gap-2">
// //                         <svg
// //                           xmlns="http://www.w3.org/2000/svg"
// //                           viewBox="0 0 24 24"
// //                           fill="currentColor"
// //                           className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// //                         >
// //                           <path
// //                             fillRule="evenodd"
// //                             d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 1.357L14.25 7.5l.165.33a.809.809 0 0 1-1.086 1.085l-.604-.302a1.125 1.125 0 0 0-1.298.21.combined.l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 0 1-2.288 4.04l-.723.724a1.125 1.125 0 0 1-1.298.21l-.153-.076a1.125 1.125 0 0 1-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 0 1-.21-1.298L9.75 12l-1.64-1.64a6 6 0 0 1-1.676-3.257l-.172-1.03Z"
// //                             clipRule="evenodd"
// //                           />
// //                         </svg>
// //                         Languages: {toSentenceCase(filteredExperts[currentMobileIndex].languages) || 'English, Hindi'}
// //                       </p>
// //                     )}
// //                     {filteredExperts[currentMobileIndex].responseTime && (
// //                       <p className="flex items-center gap-2">
// //                         <svg
// //                           xmlns="http://www.w3.org/2000/svg"
// //                           fill="currentColor"
// //                           viewBox="0 0 24 24"
// //                           className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// //                         >
// //                           <path
// //                             fillRule="evenodd"
// //                             d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
// //                             clipRule="evenodd"
// //                           />
// //                         </svg>
// //                         {filteredExperts[currentMobileIndex].responseTime || '10 mins'}
// //                       </p>
// //                     )}
// //                     {filteredExperts[currentMobileIndex].pricing && (
// //                       <p className="flex items-center gap-2">
// //                         <svg
// //                           xmlns="http://www.w3.org/2000/svg"
// //                           fill="currentColor"
// //                           viewBox="0 0 24 24"
// //                           className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
// //                         >
// //                           <path
// //                             fillRule="evenodd"
// //                             d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 7.5A.75.75 0 0 0 9 9h1.5c.98 0 1.813.626 2.122 1.5H9A.75.75 0 0 0 9 12h3.622a2.251 2.251 0 0 1-2.122 1.5H9a.75.75 0 0 0-.53 1.28l3 3a.75.75 0 1 0 1.06-1.06L10.8 14.988A3.752 3.752 0 0 0 14.175 12H15a.75.75 0 0 0 0-1.5h-.825A3.733 3.733 0 0 0 13.5 9H15a.75.75 0 0 0 0-1.5H9Z"
// //                             clipRule="evenodd"
// //                           />
// //                         </svg>
// //                         {formatPricing(filteredExperts[currentMobileIndex].pricing)}
// //                       </p>
// //                     )}
// //                   </div>
// //                   <div className="flex gap-2 mt-4">
// //                     <Link href={`/experts/${filteredExperts[currentMobileIndex].username}`} className="flex-1">
// //                       <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
// //                         View Profile
// //                       </button>
// //                     </Link>
// //                     <button
// //                       onClick={() => setModalExpert(filteredExperts[currentMobileIndex])}
// //                       className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
// //                     >
// //                       Ask Question
// //                     </button>
// //                   </div>
// //                 </div>
// //               </motion.aside>
// //             )}
// //           </AnimatePresence>
// //         </div>
// //         {hasMore && (
// //           <div ref={loadMoreRef} className="h-10 flex justify-center items-center mt-4">
// //             {loading && <p className="text-gray-600">Loading more experts...</p>}
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useState, useEffect, useMemo, useRef } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { getFirestore, collection, getDocs, query, limit, startAfter } from "firebase/firestore";
// import { app } from "@/lib/firebase";
// import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaTimes, FaLanguage } from "react-icons/fa";
// import { useSearchParams, useRouter } from "next/navigation";
// import AskQuestionModal from "@/app/components/AskQuestionModal";
// import { motion, AnimatePresence } from 'framer-motion';
// import Lightbox from 'react-image-lightbox';
// import 'react-image-lightbox/style.css';
// import { Share2, MessageCircle } from "lucide-react";

// const db = getFirestore(app);

// export default function ExpertsDirectory() {
//   const [experts, setExperts] = useState([]);
//   const [filteredExperts, setFilteredExperts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [languageFilter, setLanguageFilter] = useState("");
//   const [locationFilter, setLocationFilter] = useState("");
//   const [specializationFilter, setSpecializationFilter] = useState("");
//   const [modalExpert, setModalExpert] = useState(null);
//   const [isLightboxOpen, setIsLightboxOpen] = useState(false);
//   const [selectedImage, setSelectedImage] = useState("");
//   const [lastDoc, setLastDoc] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const observerRef = useRef(null);
//   const loadMoreRef = useRef(null);

//   const keywords = useMemo(() => {
//     return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
//   }, [searchParams]);

//   const initialQuestion = useMemo(() => {
//     return searchParams.get("question") || "";
//   }, [searchParams]);

//   const toSentenceCase = (input) => {
//     if (!input) return "";
//     if (Array.isArray(input)) {
//       return input.map(item => toSentenceCase(item)).join(", ");
//     }
//     if (typeof input !== "string") return "";
//     return input
//       .toLowerCase()
//       .split(" ")
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(" ");
//   };

//   const calculateTotalExperience = (experience) => {
//     if (!Array.isArray(experience) || experience.length === 0) return "0+";

//     const today = new Date();
//     let earliestStart = null;
//     let latestEnd = null;

//     experience.forEach(exp => {
//       const startDate = exp.startDate ? new Date(exp.startDate) : null;
//       const endDate = exp.endDate === "Present" ? today : exp.endDate ? new Date(exp.endDate) : null;

//       if (startDate && (!earliestStart || startDate < earliestStart)) {
//         earliestStart = startDate;
//       }
//       if (endDate && (!latestEnd || endDate > latestEnd)) {
//         latestEnd = endDate;
//       }
//     });

//     if (!earliestStart || !latestEnd || latestEnd < earliestStart) {
//       return "0+";
//     }

//     const totalMonths = (latestEnd.getFullYear() - earliestStart.getFullYear()) * 12 +
//                         (latestEnd.getMonth() - earliestStart.getMonth());

//     const years = Math.floor(totalMonths / 12);
//     return `${years}+`;
//   };

//   const formatPricing = (pricing) => {
//     if (!pricing) return "799/session";
//     const numeric = pricing.match(/\d+(\.\d+)?/)?.[0] || "799";
//     return `${numeric}/session`;
//   };

//   const normalizeText = (text) => {
//     if (!text || typeof text !== "string") return "";
//     return text
//       .toLowerCase()
//       .replace(/[^a-z0-9\s]/g, " ")
//       .replace(/\s+/g, " ")
//       .trim();
//   };

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     if (searchTerm.trim()) {
//       const formattedKeywords = normalizeText(searchTerm)
//         .split(" ")
//         .filter(Boolean)
//         .join(",");
//       router.push(`/ask-an-expert?keywords=${encodeURIComponent(formattedKeywords)}`);
//     } else {
//       router.push("/ask-an-expert");
//     }
//   };

//   const openLightbox = (imageSrc) => {
//     setSelectedImage(imageSrc);
//     setIsLightboxOpen(true);
//   };

//   useEffect(() => {
//     if (keywords.length > 0) {
//       setSearchTerm(keywords.join(" "));
//     } else {
//       setSearchTerm("");
//     }
//   }, [keywords]);

//   const fetchExperts = async () => {
//     if (loading || !hasMore) return;
//     setLoading(true);
//     try {
//       const profilesQuery = lastDoc
//         ? query(collection(db, "Profiles"), limit(9), startAfter(lastDoc))
//         : query(collection(db, "Profiles"), limit(9));
//       const querySnapshot = await getDocs(profilesQuery);
//       const expertsData = querySnapshot.docs.map((doc) => {
//         const data = doc.data();
//         return {
//           id: doc.id,
//           fullName: toSentenceCase(data.fullName),
//           tagline: toSentenceCase(data.tagline),
//           languages: Array.isArray(data.languages) ? data.languages : [],
//           location: toSentenceCase(data.location),
//           expertise: Array.isArray(data.expertise) ? data.expertise.map(toSentenceCase) : [],
//           pricing: data.pricing,
//           responseTime: data.responseTime,
//           username: data.username,
//           photo: data.photo,
//           about: toSentenceCase(data.about),
//           certifications: toSentenceCase(data.certifications),
//           services: Array.isArray(data.services) ? data.services.map(toSentenceCase) : [],
//           regions: Array.isArray(data.regions) ? data.regions.map(toSentenceCase) : [],
//           experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
//             ...exp,
//             company: toSentenceCase(exp.company),
//             title: toSentenceCase(exp.title),
//           })) : [],
//           email: data.email || "",
//         };
//       });

//       const uniqueExpertsData = expertsData.filter(
//         newExpert => !experts.some(existingExpert => existingExpert.id === newExpert.id)
//       );

//       setExperts(prev => [...prev, ...uniqueExpertsData]);
//       setFilteredExperts(prev => {
//         const combined = [...prev, ...uniqueExpertsData];
//         const seenIds = new Set();
//         return combined.filter(expert => {
//           if (seenIds.has(expert.id)) return false;
//           seenIds.add(expert.id);
//           return true;
//         });
//       });
//       setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
//       setHasMore(querySnapshot.docs.length === 9);
//     } catch (error) {
//       console.error("Error fetching experts:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchExperts();
//   }, []);

//   useEffect(() => {
//     let result = experts;

//     if (searchTerm) {
//       const searchTerms = normalizeText(searchTerm)
//         .split(" ")
//         .filter(term => term);
      
//       result = result
//         .map(expert => {
//           const searchableFields = [
//             normalizeText(expert.fullName),
//             normalizeText(expert.tagline),
//             normalizeText(expert.about),
//             normalizeText(expert.certifications),
//             ...expert.languages.map(normalizeText),
//             normalizeText(expert.location),
//             ...expert.services.map(normalizeText),
//             ...expert.expertise.map(normalizeText),
//             ...expert.regions.map(normalizeText),
//             ...expert.experience.map(exp => `${normalizeText(exp.company)} ${normalizeText(exp.title)}`),
//           ].filter(Boolean).join(" ");
          
//           const matchCount = searchTerms.reduce((count, term) => {
//             return count + (searchableFields.includes(term) ? 1 : 0);
//           }, 0);
          
//           return { expert, matchCount };
//         })
//         .filter(({ matchCount }) => matchCount > 0)
//         .sort((a, b) => b.matchCount - a.matchCount)
//         .map(({ expert }) => expert);
//     }

//     if (languageFilter) {
//       result = result.filter((expert) =>
//         expert.languages?.some(lang => normalizeText(lang).includes(normalizeText(languageFilter)))
//       );
//     }

//     if (locationFilter) {
//       result = result.filter((expert) =>
//         normalizeText(expert.location).includes(normalizeText(locationFilter))
//       );
//     }

//     if (specializationFilter) {
//       result = result.filter((expert) =>
//         expert.expertise?.some((expertise) =>
//           normalizeText(expertise).includes(normalizeText(specializationFilter))
//         )
//       );
//     }

//     const seenIds = new Set();
//     const uniqueFilteredExperts = result.filter(expert => {
//       if (seenIds.has(expert.id)) return false;
//       seenIds.add(expert.id);
//       return true;
//     });

//     setFilteredExperts(uniqueFilteredExperts);
//   }, [searchTerm, languageFilter, locationFilter, specializationFilter, experts]);

//   const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages || []))].map(toSentenceCase);
//   const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean).map(toSentenceCase);
//   const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))].map(toSentenceCase);

//   const truncateTagline = (tagline) => {
//     if (!tagline) return "";
//     return tagline.length > 150 ? `${tagline.substring(0, 130)}...` : tagline;
//   };

//   const handleClearFilters = () => {
//     setSearchTerm("");
//     setLanguageFilter("");
//     setLocationFilter("");
//     setSpecializationFilter("");
//     router.push("/ask-an-expert");
//   };

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       entries => {
//         if (entries[0].isIntersecting && hasMore && !loading) {
//           fetchExperts();
//         }
//       },
//       { threshold: 0.1 }
//     );
//     if (loadMoreRef.current) {
//       observer.observe(loadMoreRef.current);
//     }
//     observerRef.current = observer;
//     return () => {
//       if (observerRef.current) {
//         observerRef.current.disconnect();
//       }
//     };
//   }, [hasMore, loading]);

//   return (
//     <div className="min-h-screen bg-gray-50  py-8 px-4 sm:px-6 lg:px-8 mt-16">
//       {modalExpert && (
//         <AskQuestionModal
//           expert={modalExpert}
//           onClose={() => setModalExpert(null)}
//           initialQuestion={decodeURIComponent(initialQuestion)}
//         />
//       )}
//       {isLightboxOpen && (
//         <Lightbox
//           mainSrc={selectedImage}
//           onCloseRequest={() => setIsLightboxOpen(false)}
//           imageTitle={selectedImage.includes('default.jpg') ? 'Default Profile Image' : 'Expert Profile Image'}
//         />
//       )}
//       <div className="max-w-7xl mx-auto mt-5">
//         <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4 text-center">
//           Real Experts. Real Answers. For Your Real Travel Plans.
//         </h1>
//         <p className="text-center text-muted-foreground mb-4 text-sm sm:text-base">
//           Get answers from a trusted circle of verified travel experts across every domain from visas to vacations.
//         </p>

//         <div className="mb-4">
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
//             <div className="flex-1 relative">
//               <FaGlobe className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs" />
//               <select
//                 value={languageFilter}
//                 onChange={(e) => setLanguageFilter(e.target.value)}
//                 className="w-full pl-7 pr-1 py-1 text-xs border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//               >
//                 <option value="">Language</option>
//                 {uniqueLanguages.map((lang) => (
//                   <option key={lang} value={lang}>
//                     {lang}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex-1 relative">
//               <FaMapMarkerAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs" />
//               <select
//                 value={locationFilter}
//                 onChange={(e) => setLocationFilter(e.target.value)}
//                 className="w-full pl-7 pr-1 py-1 text-xs border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//               >
//                 <option value="">Location</option>
//                 {uniqueLocations.map((loc) => (
//                   <option key={loc} value={loc}>
//                     {loc}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex-1 relative">
//               <FaUserTag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-xs" />
//               <select
//                 value={specializationFilter}
//                 onChange={(e) => setSpecializationFilter(e.target.value)}
//                 className="w-full pl-7 pr-1 py-1 text-xs border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//               >
//                 <option value="">Expertise</option>
//                 {uniqueSpecializations.map((spec) => (
//                   <option key={spec} value={spec}>
//                     {spec}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex-1 flex items-center">
//               <button
//                 onClick={handleClearFilters}
//                 className="w-full flex items-center justify-center gap-5 px-2 py-1 bg-primary text-primary-foreground rounded-full hover:bg-opacity-90 transition-all text-xs"
//               >
//                 <FaTimes />
//                 Clear
//               </button>
//             </div>
//           </div>
         
//           <div className="relative flex items-center gap-2">
//             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm" />
//             <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
//               <input
//                 type="text"
//                 placeholder="Search keywords (e.g., visa travel documentation)"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//               />
//               <button
//                 type="submit"
//                 className="bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all text-sm"
//               >
//                 Search
//               </button>
//             </form>
//           </div>
//         </div>

//         {filteredExperts.length === 0 && (
//           <div className="text-center text-muted-foreground py-8 text-sm">
//             <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
//           </div>
//         )}

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
//           <AnimatePresence>
//             {filteredExperts.map((expert, index) => (
//               <motion.div
//                 key={`expert-${expert.id}`}
//                 initial={{ opacity: 0, y: 50 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -50 }}
//                 transition={{ duration: 0.3, delay: index * 0.1 }}
//                 className="rounded-xl shadow-lg p-4 border border-input hover:shadow-xl transition-shadow bg-card"
//               >
//                 <div className="flex items-center gap-3 mb-3">
//                   <button
//                     onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
//                     className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-primary shadow-sm"
//                   >
//                     <Image
//                       src={expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg'}
//                       alt={expert.fullName || 'Expert Profile'}
//                       fill
//                       sizes="60px"
//                       className="object-cover object-center rounded-full"
//                       priority={false}
//                     />
//                   </button>
//                   <div className="flex-1">
//                     <h2 className="text-base font-semibold text-card-foreground">
//                       {expert.fullName || 'Unknown Expert'}
//                     </h2>
//                     <p className="text-xs text-muted-foreground line-clamp-2">
//                       {truncateTagline(expert.tagline) || 'No tagline provided'}
//                     </p>
//                   </div>
//                   <div className="flex justify-center items-center py-1 space-y-0.5">
//                     <div className="text-secondary border-2 border-secondary rounded-lg px-2 w-[48px] flex flex-col items-center py-1">
//                       <h1 className="font-bold text-center text-base text-secondary-foreground">
//                         {calculateTotalExperience(expert.experience) || '0+'}
//                       </h1>
//                       <span className="font-semibold text-xs text-center text-secondary-foreground">YEARS</span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="space-y-3">
//                   <div className="flex flex-wrap gap-1.5">
//                     {expert.expertise?.map((expertise) => (
//                       <span
//                         key={expertise}
//                         className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full"
//                       >
//                         {expertise}
//                       </span>
//                     ))}
//                   </div>
//                   <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
//                     <p className="flex items-center gap-1.5">
//                       <FaRupeeSign className="text-primary" />
//                       {formatPricing(expert.pricing)}
//                     </p>
//                     <p className="flex items-center gap-1.5">
//                       <FaLanguage className="text-primary" />
//                       {toSentenceCase(expert.languages) || "English, Hindi"}
//                     </p>
//                     <p className="flex items-center gap-1.5">
//                       <FaMapMarkerAlt className="text-primary" />
//                       {expert.location || "Delhi, India"}
//                     </p>
//                     <p className="flex items-center gap-1.5">
//                       <FaClock className="text-primary" />
//                       {expert.responseTime || "10 mins"}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2 mt-4">
//                   <Link href={`/experts/${expert.username}`} className="flex-1">
//                     <button className="w-full bg-primary text-primary-foreground py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
//                       View Profile
//                     </button>
//                   </Link>
//                   <button
//                     onClick={() => setModalExpert(expert)}
//                     className="flex-1 bg-secondary text-secondary-foreground py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
//                   >
//                     Ask Question
//                   </button>
//                 </div>
//               </motion.div>
//             ))}
//           </AnimatePresence>
//           {/* Mobile view: Identical to desktop, all profiles shown with animations */}
//           <AnimatePresence>
//             {filteredExperts.map((expert, index) => (
//               <motion.aside
//                 key={`mobile-expert-${expert.id}`}
//                 initial={{ opacity: 0, y: 50 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -50 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 className="lg:col-span-1 space-y-4 sm:hidden"
//               >
//                 <div className="animate-gradientShift bg-black/30 rounded-3xl shadow-lg p-6 text-center relative">
//                   <div className="mb-4 relative">
//                     <button
//                       onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
//                       className="w-28 h-28 rounded-full border-4 border-secondary object-cover mx-auto shadow-md overflow-hidden"
//                     >
//                       <Image
//                         src={expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg'}
//                         alt={expert.fullName || 'Expert Profile'}
//                         width={112}
//                         height={112}
//                         className="rounded-full object-cover mx-auto shadow-md"
//                         priority={false}
//                       />
//                     </button>
//                     <div className="flex justify-center items-center py-1 absolute top-0 right-0 space-y-0.5">
//                       <div className="text-secondary border-2 border-secondary rounded-lg px-2 w-[48px] flex flex-col items-center">
//                         <h1 className="font-bold text-center text-base text-secondary-foreground">
//                           {calculateTotalExperience(expert.experience) || '0+'}
//                         </h1>
//                         <span className="font-semibold text-xs text-center text-secondary-foreground">YEARS</span>
//                       </div>
//                     </div>
//                   </div>
//                   <p className="text-sm mt-1 text-primary-foreground">@{expert.username || 'unknown'}</p>
//                   <h1
//                     className="text-xl font-semibold text-primary-foreground"
//                     style={{ fontFamily: "'DM Serif Display', serif" }}
//                   >
//                     {expert.fullName || 'Unknown Expert'}
//                   </h1>
//                   {expert.title && (
//                     <p className="text-sm mt-1 text-primary-foreground">{expert.title}</p>
//                   )}
//                   {expert.tagline && (
//                     <p className="text-sm mt-1 text-primary-foreground">{truncateTagline(expert.tagline) || 'No tagline provided'}</p>
//                   )}
//                   <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1 mt-2 rounded-full">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       viewBox="0 0 24 24"
//                       fill="currentColor"
//                       className="w-4 h-4"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 2.122 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                     Verified by Xmytravel
//                   </span>
//                   <div className="mt-4 text-sm text-left space-y-2 text-primary-foreground">
//                     {expert.location && (
//                       <p className="flex items-center gap-2">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="currentColor"
//                           viewBox="0 0 24 24"
//                           className="w-4 h-4 text-secondary border border-secondary rounded-[50%]"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                         {expert.location || 'Delhi, India'}
//                       </p>
//                     )}
//                     {expert.languages && (
//                       <p className="flex items-center gap-2">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           viewBox="0 0 24 24"
//                           fill="currentColor"
//                           className="w-4 h-4 text-secondary border border-secondary rounded-[50%]"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 1.357L14.25 7.5l.165.33a.809.809 0 0 1-1.086 1.085l-.604-.302a1.125 1.125 0 0 0-1.298.21.combined.l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 0 1-2.288 4.04l-.723.724a1.125 1.125 0 0 1-1.298.21l-.153-.076a1.125 1.125 0 0 1-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 0 1-.21-1.298L9.75 12l-1.64-1.64a6 6 0 0 1-1.676-3.257l-.172-1.03Z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                         Languages: {toSentenceCase(expert.languages) || 'English, Hindi'}
//                       </p>
//                     )}
//                     {expert.responseTime && (
//                       <p className="flex items-center gap-2">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="currentColor"
//                           viewBox="0 0 24 24"
//                           className="w-4 h-4 text-secondary border border-secondary rounded-[50%]"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                         {expert.responseTime || '10 mins'}
//                       </p>
//                     )}
//                     {expert.pricing && (
//                       <p className="flex items-center gap-2">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="currentColor"
//                           viewBox="0 0 24 24"
//                           className="w-4 h-4 text-secondary border border-secondary rounded-[50%]"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 7.5A.75.75 0 0 0 9 9h1.5c.98 0 1.813.626 2.122 1.5H9A.75.75 0 0 0 9 12h3.622a2.251 2.251 0 0 1-2.122 1.5H9a.75.75 0 0 0-.53 1.28l3 3a.75.75 0 1 0 1.06-1.06L10.8 14.988A3.752 3.752 0 0 0 14.175 12H15a.75.75 0 0 0 0-1.5h-.825A3.733 3.733 0 0 0 13.5 9H15a.75.75 0 0 0 0-1.5H9Z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                         {formatPricing(expert.pricing)}
//                       </p>
//                     )}
//                   </div>
//                   <div className="flex gap-2 mt-4">
//                     <Link href={`/experts/${expert.username}`} className="flex-1">
//                       <button className="w-full bg-primary text-primary-foreground py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
//                         View Profile
//                       </button>
//                     </Link>
//                     <button
//                       onClick={() => setModalExpert(expert)}
//                       className="flex-1 bg-secondary text-secondary-foreground py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
//                     >
//                       Ask Question
//                     </button>
//                   </div>
//                 </div>
//               </motion.aside>
//             ))}
//           </AnimatePresence>
//         </div>
//         {hasMore && (
//           <div ref={loadMoreRef} className="h-10 flex justify-center items-center mt-4">
//             {loading && <p className="text-muted-foreground">Loading more experts...</p>}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFirestore, collection, getDocs, query, limit, startAfter } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaTimes, FaLanguage } from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";
import AskQuestionModal from "@/app/components/AskQuestionModal";
import { motion, AnimatePresence } from 'framer-motion';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { Share2, MessageCircle } from "lucide-react";

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
    let earliestStart = null;
    let latestEnd = null;

    experience.forEach(exp => {
      const startDate = exp.startDate ? new Date(exp.startDate) : null;
      const endDate = exp.endDate === "Present" ? today : exp.endDate ? new Date(exp.endDate) : null;

      if (startDate && (!earliestStart || startDate < earliestStart)) {
        earliestStart = startDate;
      }
      if (endDate && (!latestEnd || endDate > latestEnd)) {
        latestEnd = endDate;
      }
    });

    if (!earliestStart || !latestEnd || latestEnd < earliestStart) {
      return "0+";
    }

    const totalMonths = (latestEnd.getFullYear() - earliestStart.getFullYear()) * 12 +
                        (latestEnd.getMonth() - earliestStart.getMonth());

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
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
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

  useEffect(() => {
    if (keywords.length > 0) {
      setSearchTerm(keywords.join(" "));
    } else {
      setSearchTerm("");
    }
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

    if (searchTerm) {
      const searchTerms = normalizeText(searchTerm)
        .split(" ")
        .filter(term => term);
      
      result = result
        .map(expert => {
          const searchableFields = [
            normalizeText(expert.fullName),
            normalizeText(expert.tagline),
            normalizeText(expert.about),
            normalizeText(expert.certifications),
            ...expert.languages.map(normalizeText),
            normalizeText(expert.location),
            ...expert.services.map(normalizeText),
            ...expert.expertise.map(normalizeText),
            ...expert.regions.map(normalizeText),
            ...expert.experience.map(exp => `${normalizeText(exp.company)} ${normalizeText(exp.title)}`),
          ].filter(Boolean).join(" ");
          
          const matchCount = searchTerms.reduce((count, term) => {
            return count + (searchableFields.includes(term) ? 1 : 0);
          }, 0);
          
          return { expert, matchCount };
        })
        .filter(({ matchCount }) => matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount)
        .map(({ expert }) => expert);
    }

    if (languageFilter) {
      result = result.filter((expert) =>
        expert.languages?.some(lang => normalizeText(lang).includes(normalizeText(languageFilter)))
      );
    }

    if (locationFilter) {
      result = result.filter((expert) =>
        normalizeText(expert.location).includes(normalizeText(locationFilter))
      );
    }

    if (specializationFilter) {
      result = result.filter((expert) =>
        expert.expertise?.some((expertise) =>
          normalizeText(expertise).includes(normalizeText(specializationFilter))
        )
      );
    }

    const seenIds = new Set();
    const uniqueFilteredExperts = result.filter(expert => {
      if (seenIds.has(expert.id)) return false;
      seenIds.add(expert.id);
      return true;
    });

    setFilteredExperts(uniqueFilteredExperts);
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

    return () => {
      observer.disconnect();
    };
  }, [filteredExperts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchExperts();
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    observerRef.current = observer;
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-16">
      {modalExpert && (
        <AskQuestionModal
          expert={modalExpert}
          onClose={() => setModalExpert(null)}
          initialQuestion={decodeURIComponent(initialQuestion)}
        />
      )}
      {isLightboxOpen && (
        <Lightbox
          mainSrc={selectedImage}
          onCloseRequest={() => setIsLightboxOpen(false)}
          imageTitle={selectedImage.includes('default.jpg') ? 'Default Profile Image' : 'Expert Profile Image'}
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
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
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
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
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
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
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
                placeholder="Search keywords (e.g., visa travel documentation)"
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
                    onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
                    className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-primary shadow-sm"
                  >
                    <Image
                      src={expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg'}
                      alt={expert.fullName || 'Expert Profile'}
                      fill
                      sizes="60px"
                      className="object-cover object-center rounded-full"
                      priority={false}
                    />
                  </button>
                  <div className="flex-1">
                    <h2 className="text-base font-semibold text-card-foreground">
                      {expert.fullName || 'Unknown Expert'}
                    </h2>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {truncateTagline(expert.tagline) || 'No tagline provided'}
                    </p>
                  </div>
                  <div className="flex justify-center items-center py-1 space-y-0.5">
                    <div className="text-secondary border-2 border-secondary rounded-lg px-2 w-[48px] flex flex-col items-center py-1">
                      <h1 className="font-bold text-center text-base text-secondary-foreground">
                        {calculateTotalExperience(expert.experience) || '0+'}
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
                      onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
                      className="w-28 h-28 rounded-full border-4 border-secondary object-cover mx-auto shadow-md overflow-hidden"
                    >
                      <Image
                        src={expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg'}
                        alt={expert.fullName || 'Expert Profile'}
                        width={112}
                        height={112}
                        className="rounded-full object-cover mx-auto shadow-md"
                        priority={false}
                      />
                    </button>
                    <div className="flex justify-center items-center py-1 absolute top-0 right-0 space-y-0.5">
                      <div className="text-secondary border-2 border-white rounded-lg px-2 w-[48px] flex flex-col items-center">
                        <h1 className="font-bold text-center text-base text-white">
                          {calculateTotalExperience(expert.experience) || '0+'}
                        </h1>
                        <span className="font-semibold text-xs text-center text-white">YEARS</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mt-1 text-primary-foreground">@{expert.username || 'unknown'}</p>
                  <h1
                    className="text-xl font-semibold text-primary-foreground"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    {expert.fullName || 'Unknown Expert'}
                  </h1>
                  {expert.title && (
                    <p className="text-sm mt-1 text-primary-foreground">{expert.title}</p>
                  )}
                  {expert.tagline && (
                    <p className="text-sm mt-1 text-primary-foreground">{truncateTagline(expert.tagline) || 'No tagline provided'}</p>
                  )}
                  <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1 mt-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 2.122 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified by Xmytravel
                  </span>
                  <div className="mt-4 text-sm text-left space-y-2 text-primary-foreground">
                    {expert.location && (
                      <p className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="w-4 h-4 text-secondary border border-secondary rounded-[50%]"
                        >
                          <path
                            fillRule="evenodd"
                            d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {expert.location || 'Delhi, India'}
                      </p>
                    )}
                    {expert.languages && (
                      <p className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 text-secondary border border-secondary rounded-[50%]"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 1.357L14.25 7.5l.165.33a.809.809 0 0 1-1.086 1.085l-.604-.302a1.125 1.125 0 0 0-1.298.21.combined.l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 0 1-2.288 4.04l-.723.724a1.125 1.125 0 0 1-1.298.21l-.153-.076a1.125 1.125 0 0 1-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 0 1-.21-1.298L9.75 12l-1.64-1.64a6 6 0 0 1-1.676-3.257l-.172-1.03Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Languages: {toSentenceCase(expert.languages) || 'English, Hindi'}
                      </p>
                    )}
                    {expert.responseTime && (
                      <p className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="w-4 h-4 text-secondary border border-secondary rounded-[50%]"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {expert.responseTime || '10 mins'}
                      </p>
                    )}
                    {expert.pricing && (
                      <p className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          className="w-4 h-4 text-secondary border border-secondary rounded-[50%]"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 7.5A.75.75 0 0 0 9 9h1.5c.98 0 1.813.626 2.122 1.5H9A.75.75 0 0 0 9 12h3.622a2.251 2.251 0 0 1-2.122 1.5H9a.75.75 0 0 0-.53 1.28l3 3a.75.75 0 1 0 1.06-1.06L10.8 14.988A3.752 3.752 0 0 0 14.175 12H15a.75.75 0 0 0 0-1.5h-.825A3.733 3.733 0 0 0 13.5 9H15a.75.75 0 0 0 0-1.5H9Z"
                            clipRule="evenodd"
                          />
                        </svg>
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