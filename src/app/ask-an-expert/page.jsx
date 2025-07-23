
// "use client";

// import { useState, useEffect, useMemo } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { getFirestore, collection, getDocs } from "firebase/firestore";
// import { app } from "@/lib/firebase";
// import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaTimes, FaLanguage } from "react-icons/fa";
// import { useSearchParams, useRouter } from "next/navigation";
// import AskQuestionModal from "@/app/components/AskQuestionModal";
// import TinderCard from 'react-tinder-card';
// import { motion } from 'framer-motion';
// import Lightbox from 'react-image-lightbox'; // Import the lightbox library
// import 'react-image-lightbox/style.css'; // Import lightbox styles

// const db = getFirestore(app);

// export default function ExpertsDirectory() {
//   const [experts, setExperts] = useState([]);
//   const [filteredExperts, setFilteredExperts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [languageFilter, setLanguageFilter] = useState("");
//   const [locationFilter, setLocationFilter] = useState("");
//   const [specializationFilter, setSpecializationFilter] = useState("");
//   const [modalExpert, setModalExpert] = useState(null);
//   const [isLightboxOpen, setIsLightboxOpen] = useState(false); // State for lightbox
//   const [selectedImage, setSelectedImage] = useState(""); // State for selected image
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const keywords = useMemo(() => {
//     return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
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
//     if (!Array.isArray(experience) || experience.length === 0) return "0+ years of experience";
//     const today = new Date();
//     let totalMonths = 0;

//     experience.forEach(exp => {
//       const startDate = exp.startDate ? new Date(exp.startDate) : null;
//       const endDate = exp.endDate === "Present" ? today : exp.endDate ? new Date(exp.endDate) : null;
//       if (startDate && endDate && endDate >= startDate) {
//         const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
//         totalMonths += months;
//       }
//     });

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

//   const onSwipe = (direction, expertId) => {
//     setFilteredExperts(prev => prev.filter(expert => expert.id !== expertId));
//   };

//   // Open lightbox with the selected image
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

//   useEffect(() => {
//     const fetchExperts = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "Profiles"));
//         const expertsData = querySnapshot.docs.map((doc) => {
//           const data = doc.data();
//           return {
//             id: doc.id,
//             fullName: toSentenceCase(data.fullName),
//             tagline: toSentenceCase(data.tagline),
//             languages: Array.isArray(data.languages) ? data.languages : [],
//             location: toSentenceCase(data.location),
//             expertise: Array.isArray(data.expertise) ? data.expertise.map(toSentenceCase) : [],
//             pricing: data.pricing,
//             responseTime: data.responseTime,
//             username: data.username,
//             photo: data.photo,
//             about: toSentenceCase(data.about),
//             certifications: toSentenceCase(data.certifications),
//             services: Array.isArray(data.services) ? data.services.map(toSentenceCase) : [],
//             regions: Array.isArray(data.regions) ? data.regions.map(toSentenceCase) : [],
//             experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
//               ...exp,
//               company: toSentenceCase(exp.company),
//               title: toSentenceCase(exp.title),
//             })) : [],
//             email: data.email || "",
//           };
//         });
//         setExperts(expertsData);
//         setFilteredExperts(expertsData);
//       } catch (error) {
//         console.error("Error fetching experts:", error);
//       }
//     };
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

//     setFilteredExperts(result);
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
//     router.push("/expert");
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-16">
//       {modalExpert && (
//         <AskQuestionModal expert={modalExpert} onClose={() => setModalExpert(null)} />
//       )}
//       {isLightboxOpen && (
//         <Lightbox
//           mainSrc={selectedImage}
//           onCloseRequest={() => setIsLightboxOpen(false)}
//           imageTitle={selectedImage.includes('default.jpg') ? 'Default Profile Image' : 'Expert Profile Image'}
//         />
//       )}
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
//         Real Experts. Real Answers. For Your Real Travel Plans.
//         </h1>
//         <p className="text-center text-gray-600 mb-4 text-sm sm:text-base">
//           Get answers from a trusted circle of verified travel experts across every domain from visas to vacations.
//         </p>

//         <div className="mb-4">
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
//             <div className="flex-1 relative">
//               <FaGlobe className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
//               <select
//                 value={languageFilter}
//                 onChange={(e) => setLanguageFilter(e.target.value)}
//                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
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
//               <FaMapMarkerAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
//               <select
//                 value={locationFilter}
//                 onChange={(e) => setLocationFilter(e.target.value)}
//                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
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
//               <FaUserTag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
//               <select
//                 value={specializationFilter}
//                 onChange={(e) => setSpecializationFilter(e.target.value)}
//                 className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
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
//                 className="w-full flex items-center justify-center gap-5 px-2 py-1 bg-[#36013F] text-white rounded-full hover:bg-opacity-90 transition-all text-xs"
//               >
//                 <FaTimes />
//                 Clear
//               </button>
//             </div>
//           </div>
         
//           <div className="relative flex items-center gap-2">
//             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
//             <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
//               <input
//                 type="text"
//                 placeholder="Search keywords (e.g., visa travel documentation)"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
//               />
//               <button
//                 type="submit"
//                 className="bg-[#36013F] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all text-sm"
//               >
//                 Search
//               </button>
//             </form>
//           </div>
//         </div>

//         {filteredExperts.length === 0 && (
//           <div className="text-center text-gray-600 py-8 text-sm">
//             <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
//           </div>
//         )}

//         <div className="relative">
//           <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
//             {filteredExperts.map((expert) => (
//               <motion.div
//                 key={expert.id}
//                 className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <div className="flex items-center gap-3 mb-3">
//                   <button
//                     onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
//                     className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-[#36013F] shadow-sm"
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
//                     <h2 className="text-base font-semibold text-gray-800">
//                       {expert.fullName || 'Unknown Expert'}
//                     </h2>
//                     <p className="text-xs text-gray-600 line-clamp-2">
//                       {truncateTagline(expert.tagline) || 'No tagline provided'}
//                     </p>
//                     {/* <p className="text-xs font-medium text-[#36013F]  py-1 rounded-full mt-1">
//                       {calculateTotalExperience(expert.experience) || 'No experience provided'} years of experience
//                     </p> */}
//                   </div>
//                       <div className="flex justify-center items-center py-5 space-y-0.5">
//   <div className="text-primary border-2 border-primary rounded-lg px-2 w-[48px] flex flex-col items-center">
//     <h1 className="font-bold text-center text-base">{calculateTotalExperience(expert.experience) || 'No experience provided'}</h1>
//     <span className="font-semibold text-xs text-center">YEARS</span>
//   </div>
// </div>
//                 </div>
//                 <div className="space-y-3">
//                   <div className="flex flex-wrap gap-1.5">
//                     {expert.expertise?.map((expertise) => (
//                       <span
//                         key={expertise}
//                         className="bg-[#36013F] text-white text-xs px-1.5 py-0.5 rounded-full"
//                       >
//                         {expertise}
//                       </span>
//                     ))}
//                   </div>
//                   <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
//                     <p className="flex items-center gap-1.5">
//                       <FaRupeeSign className="text-[#36013F]" />
//                       {formatPricing(expert.pricing)}
//                     </p>
//                     <p className="flex items-center gap-1.5">
//                       <FaLanguage className="text-[#36013F]" />
//                       {toSentenceCase(expert.languages) || "English, Hindi"}
//                     </p>
//                     <p className="flex items-center gap-1.5">
//                       <FaMapMarkerAlt className="text-[#36013F]" />
//                       {expert.location || "Delhi, India"}
//                     </p>
//                     <p className="flex items-center gap-1.5">
//                       <FaClock className="text-[#36013F]" />
//                       {expert.responseTime || "10 mins"}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2 mt-4">
//                   <Link href={`/experts/${expert.username}`} className="flex-1">
//                     <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
//                       View Profile
//                     </button>
//                   </Link>
//                   <button
//                     onClick={() => setModalExpert(expert)}
//                     className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
//                   >
//                     Ask Question
//                   </button>
//                 </div>
//               </motion.div>
//             ))}
//           </div>

//           <div className="sm:hidden relative h-[500px] flex justify-center items-center">
//             {filteredExperts.map((expert, index) => (
//               <TinderCard
//                 key={expert.id}
//                 onSwipe={(dir) => onSwipe(dir, expert.id)}
//                 preventSwipe={['up', 'down']}
//                 className={`absolute w-full max-w-[350px] ${index === 0 ? 'z-10' : 'z-0'}`}
//               >
//                 <motion.div
//                   className="bg-white rounded-xl shadow-lg p-4 border border-gray-200"
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   <div className="flex items-center gap-3 mb-3">
//                     <button
//                       onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
//                       className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-[#36013F] shadow-sm"
//                     >
//                       <Image
//                         src={expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg'}
//                         alt={expert.fullName || 'Expert Profile'}
//                         fill
//                         sizes="60px"
//                         className="object-cover object-center rounded-full"
//                         priority={false}
//                       />
//                     </button>
//                     <div className="flex-1">
//                       <h2 className="text-base font-semibold text-gray-800">
//                         {expert.fullName || 'Unknown Expert'}
//                       </h2>
//                       <p className="text-xs text-gray-600 line-clamp-2">
//                         {truncateTagline(expert.tagline) || 'No tagline provided'}
//                       </p>
//                       {/* <p className="text-xs font-medium text-[#36013F]   py-1 rounded-full mt-1 ">
//                         {calculateTotalExperience(expert.experience) || 'No experience provided'}years of experience
//                       </p> */}
//                     </div>
//               <div className="flex justify-center items-center py-5 space-y-0.5">
//   <div className="text-primary border-2 border-primary rounded-lg px-2 w-[48px] flex flex-col items-center">
//     <h1 className="font-bold text-center text-base">{calculateTotalExperience(expert.experience) || 'No experience provided'}</h1>
//     <span className="font-semibold text-xs text-center">YEARS</span>
//   </div>
// </div>
//                   </div>
//                   <div className="space-y-3">
//                     <div className="flex flex-wrap gap-1.5">
//                       {expert.expertise?.map((expertise) => (
//                         <span
//                           key={expertise}
//                           className="bg-[#36013F] text-white text-xs px-1.5 py-0.5 rounded-full"
//                         >
//                           {expertise}
//                         </span>
//                       ))}
//                     </div>
//                     <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
//                       <p className="flex items-center gap-1.5">
//                         <FaRupeeSign className="text-[#36013F]" />
//                         {formatPricing(expert.pricing)}
//                       </p>
//                       <p className="flex items-center gap-1.5">
//                         <FaLanguage className="text-[#36013F]" />
//                         {toSentenceCase(expert.languages) || "English, Hindi"}
//                       </p>
//                       <p className="flex items-center gap-1.5">
//                         <FaMapMarkerAlt className="text-[#36013F]" />
//                         {expert.location || "Delhi, India"}
//                       </p>
//                       <p className="flex items-center gap-1.5">
//                         <FaClock className="text-[#36013F]" />
//                         {expert.responseTime || "10 mins"}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex gap-2 mt-4">
//                     <Link href={`/experts/${expert.username}`} className="flex-1">
//                       <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
//                         View Profile
//                       </button>
//                     </Link>
//                     <button
//                       onClick={() => setModalExpert(expert)}
//                       className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
//                     >
//                       Ask Question
//                     </button>
//                   </div>
//                 </motion.div>
//               </TinderCard>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaTimes, FaLanguage } from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";
import AskQuestionModal from "@/app/components/AskQuestionModal";
import TinderCard from 'react-tinder-card';
import { motion } from 'framer-motion';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

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
  const searchParams = useSearchParams();
  const router = useRouter();

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
    if (!Array.isArray(experience) || experience.length === 0) return "0+ years of experience";
    const today = new Date();
    let totalMonths = 0;

    experience.forEach(exp => {
      const startDate = exp.startDate ? new Date(exp.startDate) : null;
      const endDate = exp.endDate === "Present" ? today : exp.endDate ? new Date(exp.endDate) : null;
      if (startDate && endDate && endDate >= startDate) {
        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
        totalMonths += months;
      }
    });

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

  const onSwipe = (direction, expertId) => {
    setFilteredExperts(prev => prev.filter(expert => expert.id !== expertId));
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

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Profiles"));
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
        setExperts(expertsData);
        setFilteredExperts(expertsData);
      } catch (error) {
        console.error("Error fetching experts:", error);
      }
    };
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

    setFilteredExperts(result);
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
  };

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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
          Real Experts. Real Answers. For Your Real Travel Plans.
        </h1>
        <p className="text-center text-gray-600 mb-4 text-sm sm:text-base">
          Get answers from a trusted circle of verified travel experts across every domain from visas to vacations.
        </p>

        <div className="mb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            <div className="flex-1 relative">
              <FaGlobe className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
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
              <FaMapMarkerAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
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
              <FaUserTag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
              <select
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="w-full pl-7 pr-1 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
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
                className="w-full flex items-center justify-center gap-5 px-2 py-1 bg-[#36013F] text-white rounded-full hover:bg-opacity-90 transition-all text-xs"
              >
                <FaTimes />
                Clear
              </button>
            </div>
          </div>
         
          <div className="relative flex items-center gap-2">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <form onSubmit={handleSearchSubmit} className="flex w-full gap-2">
              <input
                type="text"
                placeholder="Search keywords (e.g., visa travel documentation)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
              />
              <button
                type="submit"
                className="bg-[#36013F] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all text-sm"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {filteredExperts.length === 0 && (
          <div className="text-center text-gray-600 py-8 text-sm">
            <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
          </div>
        )}

        <div className="relative">
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {filteredExperts.map((expert) => (
              <motion.div
                key={expert.id}
                className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
                    className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-[#36013F] shadow-sm"
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
                    <h2 className="text-base font-semibold text-gray-800">
                      {expert.fullName || 'Unknown Expert'}
                    </h2>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {truncateTagline(expert.tagline) || 'No tagline provided'}
                    </p>
                  </div>
                  <div className="flex justify-center items-center py-1 space-y-0.5">
                    <div className="text-primary border-2 border-primary rounded-lg px-2 w-[48px] flex flex-col items-center py-1">
                      <h1 className="font-bold text-center text-base">{calculateTotalExperience(expert.experience) || 'No experience provided'}</h1>
                      <span className="font-semibold text-xs text-center">YEARS</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {expert.expertise?.map((expertise) => (
                      <span
                        key={expertise}
                        className="bg-[#36013F] text-white text-xs px-1.5 py-0.5 rounded-full"
                      >
                        {expertise}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <p className="flex items-center gap-1.5">
                      <FaRupeeSign className="text-[#36013F]" />
                      {formatPricing(expert.pricing)}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FaLanguage className="text-[#36013F]" />
                      {toSentenceCase(expert.languages) || "English, Hindi"}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FaMapMarkerAlt className="text-[#36013F]" />
                      {expert.location || "Delhi, India"}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <FaClock className="text-[#36013F]" />
                      {expert.responseTime || "10 mins"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/experts/${expert.username}`} className="flex-1">
                    <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
                      View Profile
                    </button>
                  </Link>
                  <button
                    onClick={() => setModalExpert(expert)}
                    className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
                  >
                    Ask Question
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="sm:hidden relative h-[500px] flex justify-center items-center">
            {filteredExperts.map((expert, index) => (
              <TinderCard
                key={expert.id}
                onSwipe={(dir) => onSwipe(dir, expert.id)}
                preventSwipe={['up', 'down']}
                className={`absolute w-full max-w-[350px] ${index === 0 ? 'z-10' : 'z-0'}`}
              >
                <motion.div
                  className="bg-white rounded-xl shadow-lg p-4 border border-gray-200"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => openLightbox(expert.photo && expert.photo !== '' ? expert.photo : '/default.jpg')}
                      className="relative w-[60px] h-[60px] shrink-0 overflow-hidden rounded-full border-2 border-[#36013F] shadow-sm"
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
                      <h2 className="text-base font-semibold text-gray-800">
                        {expert.fullName || 'Unknown Expert'}
                      </h2>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {truncateTagline(expert.tagline) || 'No tagline provided'}
                      </p>
                    </div>
                    <div className="flex justify-center items-center py-1 space-y-0.5">
                      <div className="text-primary border-2 border-primary rounded-lg px-2 w-[48px] flex flex-col items-center py-1">
                        <h1 className="font-bold text-center text-base">{calculateTotalExperience(expert.experience) || 'No experience provided'}</h1>
                        <span className="font-semibold text-xs text-center">YEARS</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {expert.expertise?.map((expertise) => (
                        <span
                          key={expertise}
                          className="bg-[#36013F] text-white text-xs px-1.5 py-0.5 rounded-full"
                        >
                          {expertise}
                        </span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      <p className="flex items-center gap-1.5">
                        <FaRupeeSign className="text-[#36013F]" />
                        {formatPricing(expert.pricing)}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <FaLanguage className="text-[#36013F]" />
                        {toSentenceCase(expert.languages) || "English, Hindi"}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <FaMapMarkerAlt className="text-[#36013F]" />
                        {expert.location || "Delhi, India"}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <FaClock className="text-[#36013F]" />
                        {expert.responseTime || "10 mins"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/experts/${expert.username}`} className="flex-1">
                      <button className="w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer">
                        View Profile
                      </button>
                    </Link>
                    <button
                      onClick={() => setModalExpert(expert)}
                      className="flex-1 bg-[#F4D35E] text-black py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm cursor-pointer"
                    >
                      Ask Question
                    </button>
                  </div>
                </motion.div>
              </TinderCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}