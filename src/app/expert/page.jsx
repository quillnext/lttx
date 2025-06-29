

// // // // // // "use client";

// // // // // // import { useState, useEffect, useMemo } from "react";
// // // // // // import Image from "next/image";
// // // // // // import Link from "next/link";
// // // // // // import { getFirestore, collection, getDocs } from "firebase/firestore";
// // // // // // import { app } from "@/lib/firebase";
// // // // // // import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaLanguage } from "react-icons/fa";
// // // // // // import { useSearchParams } from "next/navigation";

// // // // // // export default function ExpertsDirectory() {
// // // // // //   const [experts, setExperts] = useState([]);
// // // // // //   const [filteredExperts, setFilteredExperts] = useState([]);
// // // // // //   const [searchTerm, setSearchTerm] = useState("");
// // // // // //   const [languageFilter, setLanguageFilter] = useState("");
// // // // // //   const [locationFilter, setLocationFilter] = useState("");
// // // // // //   const [specializationFilter, setSpecializationFilter] = useState("");
// // // // // //   const searchParams = useSearchParams();

// // // // // //   const keywords = useMemo(() => {
// // // // // //     return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
// // // // // //   }, [searchParams]);

// // // // // //   useEffect(() => {
// // // // // //     const fetchExperts = async () => {
// // // // // //       const db = getFirestore(app);
// // // // // //       const querySnapshot = await getDocs(collection(db, "Profiles"));
// // // // // //       const expertsData = querySnapshot.docs.map((doc) => ({
// // // // // //         id: doc.id,
// // // // // //         ...doc.data(),
// // // // // //       }));
// // // // // //       setExperts(expertsData);
// // // // // //       setFilteredExperts(expertsData);
// // // // // //     };
// // // // // //     fetchExperts();
// // // // // //   }, []);

// // // // // //   useEffect(() => {
// // // // // //     let result = experts;

// // // // // //     if (searchTerm) {
// // // // // //       result = result.filter((expert) => {
// // // // // //         const searchableFields = [
// // // // // //           expert.fullName || "",
// // // // // //           expert.title || "",
// // // // // //           expert.tagline || "",
// // // // // //           expert.about || "",
// // // // // //           expert.certifications || "",
// // // // // //           expert.companies || "",
// // // // // //           expert.languages || "",
// // // // // //           expert.location || "",
// // // // // //           (expert.services || []).join(" "),
// // // // // //           (expert.regions || []).join(" "),
// // // // // //           ...(expert.experience || []).map(
// // // // // //             (exp) => `${exp.company || ""} ${exp.title || ""}`
// // // // // //           ),
// // // // // //         ].join(" ").toLowerCase();
// // // // // //         return searchableFields.includes(searchTerm.toLowerCase());
// // // // // //       });
// // // // // //     }

// // // // // //     if (languageFilter) {
// // // // // //       result = result.filter((expert) =>
// // // // // //         expert.languages?.toLowerCase().includes(languageFilter.toLowerCase())
// // // // // //       );
// // // // // //     }

// // // // // //     if (locationFilter) {
// // // // // //       result = result.filter((expert) =>
// // // // // //         expert.location?.toLowerCase().includes(locationFilter.toLowerCase())
// // // // // //       );
// // // // // //     }

// // // // // //     if (specializationFilter) {
// // // // // //       result = result.filter((expert) =>
// // // // // //         expert.services?.some((service) =>
// // // // // //           service.toLowerCase().includes(specializationFilter.toLowerCase())
// // // // // //         )
// // // // // //       );
// // // // // //     }

// // // // // //     if (keywords.length > 0) {
// // // // // //       result = result.filter((expert) => {
// // // // // //         const searchableFields = [
// // // // // //           expert.fullName || "",
// // // // // //           expert.title || "",
// // // // // //           expert.tagline || "",
// // // // // //           expert.about || "",
// // // // // //           expert.certifications || "",
// // // // // //           expert.companies || "",
// // // // // //           expert.languages || "",
// // // // // //           expert.location || "",
// // // // // //           (expert.services || []).join(" "),
// // // // // //           (expert.regions || []).join(" "),
// // // // // //           ...(expert.experience || []).map(
// // // // // //             (exp) => `${exp.company || ""} ${exp.title || ""}`
// // // // // //           ),
// // // // // //         ].join(" ").toLowerCase();
// // // // // //         return keywords.some((keyword) =>
// // // // // //           searchableFields.includes(keyword.toLowerCase())
// // // // // //         );
// // // // // //       });
// // // // // //     }

// // // // // //     setFilteredExperts(result);
// // // // // //   }, [searchTerm, languageFilter, locationFilter, specializationFilter, keywords, experts]);

// // // // // //   const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages?.split(", ") || []))];
// // // // // //   const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean);
// // // // // //   const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.services || []))];

// // // // // //   const formatPricing = (pricing) => {
// // // // // //     if (!pricing) return "₹ 799";
// // // // // //     return pricing.startsWith("₹") ? pricing : `₹ ${pricing}`;
// // // // // //   };

// // // // // //   return (
// // // // // //     <div className="min-h-screen bg-gray-50 py-12 px-4 mt-20">
// // // // // //       <div className="max-w-7xl mx-auto">
// // // // // //         <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
// // // // // //           Travel Experts Directory
// // // // // //         </h1>
// // // // // //         <p className="text-center text-gray-600 mb-8">
// // // // // //           Find verified travel consultants worldwide
// // // // // //         </p>

// // // // // //         <div className="flex flex-col md:flex-row gap-4 mb-8">
// // // // // //           <div className="w-full md:w-1/4 relative">
// // // // // //             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// // // // // //             <input
// // // // // //               type="text"
// // // // // //               placeholder="Search any keyword"
// // // // // //               value={searchTerm}
// // // // // //               onChange={(e) => setSearchTerm(e.target.value)}
// // // // // //               className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // //             />
// // // // // //           </div>
// // // // // //           <div className="w-full md:w-1/4 relative">
// // // // // //             <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// // // // // //             <select
// // // // // //               value={languageFilter}
// // // // // //               onChange={(e) => setLanguageFilter(e.target.value)}
// // // // // //               className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // //             >
// // // // // //               <option value="">Language</option>
// // // // // //               {uniqueLanguages.map((lang) => (
// // // // // //                 <option key={lang} value={lang}>
// // // // // //                   {lang}
// // // // // //                 </option>
// // // // // //               ))}
// // // // // //             </select>
// // // // // //           </div>
// // // // // //           <div className="w-full md:w-1/4 relative">
// // // // // //             <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// // // // // //             <select
// // // // // //               value={locationFilter}
// // // // // //               onChange={(e) => setLocationFilter(e.target.value)}
// // // // // //               className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // //             >
// // // // // //               <option value="">Location</option>
// // // // // //               {uniqueLocations.map((loc) => (
// // // // // //                 <option key={loc} value={loc}>
// // // // // //                   {loc}
// // // // // //                 </option>
// // // // // //               ))}
// // // // // //             </select>
// // // // // //           </div>
// // // // // //           <div className="w-full md:w-1/4 relative">
// // // // // //             <FaUserTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// // // // // //             <select
// // // // // //               value={specializationFilter}
// // // // // //               onChange={(e) => setSpecializationFilter(e.target.value)}
// // // // // //               className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // // //             >
// // // // // //               <option value="">Specialisation</option>
// // // // // //               {uniqueSpecializations.map((spec) => (
// // // // // //                 <option key={spec} value={spec}>
// // // // // //                   {spec}
// // // // // //                 </option>
// // // // // //               ))}
// // // // // //             </select>
// // // // // //           </div>
// // // // // //         </div>

// // // // // //         {filteredExperts.length === 0 && (
// // // // // //           <div className="text-center text-gray-600 py-10">
// // // // // //             <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
// // // // // //           </div>
// // // // // //         )}

// // // // // //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// // // // // //           {filteredExperts.map((expert) => (
// // // // // //             <div
// // // // // //               key={expert.id}
// // // // // //               className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow"
// // // // // //             >
// // // // // //               <div className="flex items-center gap-4">
// // // // // //                 <Image
// // // // // //                   src={expert.photo || "/default.jpg"}
// // // // // //                   alt={expert.fullName}
// // // // // //                   width={80}
// // // // // //                   height={80}
// // // // // //                   className="rounded-full object-cover border-4 border-secondary shadow-sm"
// // // // // //                 />
// // // // // //                 <div>
// // // // // //                   <h2 className="text-lg font-semibold text-gray-800">
// // // // // //                     {expert.fullName}
// // // // // //                   </h2>
// // // // // //                   <p className="text-sm text-gray-600">
// // // // // //                     {expert.title || expert.tagline}
// // // // // //                   </p>
// // // // // //                 </div>
// // // // // //               </div>
// // // // // //               <div className="mt-4 space-y-2">
// // // // // //                 <div className="flex flex-wrap gap-2">
// // // // // //                   {expert.services?.map((service) => (
// // // // // //                     <span
// // // // // //                       key={service}
// // // // // //                       className="bg-secondary text-black text-xs px-2 py-1 rounded-full"
// // // // // //                     >
// // // // // //                       {service}
// // // // // //                     </span>
// // // // // //                   ))}
// // // // // //                 </div>
// // // // // //                 <div className="grid grid-cols-2 gap-2">
// // // // // //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// // // // // //                     <FaRupeeSign className="text-[#36013F]" />
// // // // // //                     {formatPricing(expert.pricing)} / {expert.responseTime || "30 mins"}
// // // // // //                   </p>
// // // // // //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// // // // // //                     <FaLanguage className="text-[#36013F]" />
// // // // // //                     {expert.languages || "English, Hindi"}
// // // // // //                   </p>
// // // // // //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// // // // // //                     <FaMapMarkerAlt className="text-[#36013F]" />
// // // // // //                     {expert.location || "Delhi, India"}
// // // // // //                   </p>
// // // // // //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// // // // // //                     <FaClock className="text-[#36013F]" />
// // // // // //                     Respond in {expert.responseTime || "10 mins"}
// // // // // //                   </p>
// // // // // //                 </div>
// // // // // //               </div>
// // // // // //               <Link href={`/experts/${expert.username}`}>
// // // // // //                 <button className="mt-4 w-full bg-[#36013F] text-white py-2 rounded-full hover:bg-opacity-90 transition-all">
// // // // // //                   View Profile
// // // // // //                 </button>
// // // // // //               </Link>
// // // // // //             </div>
// // // // // //           ))}
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // }

// // // // // "use client";

// // // // // import { useState, useEffect, useMemo } from "react";
// // // // // import Image from "next/image";
// // // // // import Link from "next/link";
// // // // // import { getFirestore, collection, getDocs } from "firebase/firestore";
// // // // // import { app } from "@/lib/firebase";
// // // // // import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaLanguage } from "react-icons/fa";
// // // // // import { useSearchParams } from "next/navigation";

// // // // // export default function ExpertsDirectory() {
// // // // //   const [experts, setExperts] = useState([]);
// // // // //   const [filteredExperts, setFilteredExperts] = useState([]);
// // // // //   const [searchTerm, setSearchTerm] = useState("");
// // // // //   const [languageFilter, setLanguageFilter] = useState("");
// // // // //   const [locationFilter, setLocationFilter] = useState("");
// // // // //   const [specializationFilter, setSpecializationFilter] = useState("");
// // // // //   const searchParams = useSearchParams();

// // // // //   const keywords = useMemo(() => {
// // // // //     return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
// // // // //   }, [searchParams]);

// // // // //   useEffect(() => {
// // // // //     const fetchExperts = async () => {
// // // // //       const db = getFirestore(app);
// // // // //       const querySnapshot = await getDocs(collection(db, "Profiles"));
// // // // //       const expertsData = querySnapshot.docs.map((doc) => ({
// // // // //         id: doc.id,
// // // // //         ...doc.data(),
// // // // //       }));
// // // // //       setExperts(expertsData);
// // // // //       setFilteredExperts(expertsData);
// // // // //     };
// // // // //     fetchExperts();
// // // // //   }, []);

// // // // //   useEffect(() => {
// // // // //     let result = experts;

// // // // //     if (searchTerm) {
// // // // //       result = result.filter((expert) => {
// // // // //         const searchableFields = [
// // // // //           expert.fullName || "",
// // // // //           expert.title || "",
// // // // //           expert.tagline || "",
// // // // //           expert.about || "",
// // // // //           expert.certifications || "",
// // // // //           expert.companies || "",
// // // // //           expert.languages || "",
// // // // //           expert.location || "",
// // // // //           (expert.expertise || []).join(" "),
// // // // //           (expert.regions || []).join(" "),
// // // // //           ...(expert.experience || []).map(
// // // // //             (exp) => `${exp.company || ""} ${exp.title || ""}`
// // // // //           ),
// // // // //         ].join(" ").toLowerCase();
// // // // //         return searchableFields.includes(searchTerm.toLowerCase());
// // // // //       });
// // // // //     }

// // // // //     if (languageFilter) {
// // // // //       result = result.filter((expert) =>
// // // // //         expert.languages?.toLowerCase().includes(languageFilter.toLowerCase())
// // // // //       );
// // // // //     }

// // // // //     if (locationFilter) {
// // // // //       result = result.filter((expert) =>
// // // // //         expert.location?.toLowerCase().includes(locationFilter.toLowerCase())
// // // // //       );
// // // // //     }

// // // // //     if (specializationFilter) {
// // // // //       result = result.filter((expert) =>
// // // // //         expert.expertise?.some((expertise) =>
// // // // //           expertise.toLowerCase().includes(specializationFilter.toLowerCase())
// // // // //         )
// // // // //       );
// // // // //     }

// // // // //     if (keywords.length > 0) {
// // // // //       result = result.filter((expert) => {
// // // // //         const searchableFields = [
// // // // //           expert.fullName || "",
// // // // //           expert.title || "",
// // // // //           expert.tagline || "",
// // // // //           expert.about || "",
// // // // //           expert.certifications || "",
// // // // //           expert.companies || "",
// // // // //           expert.languages || "",
// // // // //           expert.location || "",
// // // // //           (expert.expertise || []).join(" "),
// // // // //           (expert.regions || []).join(" "),
// // // // //           ...(expert.experience || []).map(
// // // // //             (exp) => `${exp.company || ""} ${exp.title || ""}`
// // // // //           ),
// // // // //         ].join(" ").toLowerCase();
// // // // //         return keywords.some((keyword) =>
// // // // //           searchableFields.includes(keyword.toLowerCase())
// // // // //         );
// // // // //       });
// // // // //     }

// // // // //     setFilteredExperts(result);
// // // // //   }, [searchTerm, languageFilter, locationFilter, specializationFilter, keywords, experts]);

// // // // //   const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages?.split(", ") || []))];
// // // // //   const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean);
// // // // //   const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))];

// // // // //   const formatPricing = (pricing) => {
// // // // //     if (!pricing) return "₹ 799";
// // // // //     return pricing.startsWith("₹") ? pricing : `₹ ${pricing}`;
// // // // //   };

// // // // //   return (
// // // // //     <div className="min-h-screen bg-gray-50 py-12 px-4 mt-20">
// // // // //       <div className="max-w-7xl mx-auto">
// // // // //         <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
// // // // //           Travel Experts Directory
// // // // //         </h1>
// // // // //         <p className="text-center text-gray-600 mb-8">
// // // // //           Find verified travel consultants worldwide
// // // // //         </p>

// // // // //         <div className="flex flex-col md:flex-row gap-4 mb-8">
// // // // //           <div className="w-full md:w-1/4 relative">
// // // // //             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// // // // //             <input
// // // // //               type="text"
// // // // //               placeholder="Search any keyword"
// // // // //               value={searchTerm}
// // // // //               onChange={(e) => setSearchTerm(e.target.value)}
// // // // //               className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // //             />
// // // // //           </div>
// // // // //           <div className="w-full md:w-1/4 relative">
// // // // //             <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// // // // //             <select
// // // // //               value={languageFilter}
// // // // //               onChange={(e) => setLanguageFilter(e.target.value)}
// // // // //               className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // //             >
// // // // //               <option value="">Language</option>
// // // // //               {uniqueLanguages.map((lang) => (
// // // // //                 <option key={lang} value={lang}>
// // // // //                   {lang}
// // // // //                 </option>
// // // // //               ))}
// // // // //             </select>
// // // // //           </div>
// // // // //           <div className="w-full md:w-1/4 relative">
// // // // //             <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// // // // //             <select
// // // // //               value={locationFilter}
// // // // //               onChange={(e) => setLocationFilter(e.target.value)}
// // // // //               className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // //             >
// // // // //               <option value="">Location</option>
// // // // //               {uniqueLocations.map((loc) => (
// // // // //                 <option key={loc} value={loc}>
// // // // //                   {loc}
// // // // //                 </option>
// // // // //               ))}
// // // // //             </select>
// // // // //           </div>
// // // // //           <div className="w-full md:w-1/4 relative">
// // // // //             <FaUserTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// // // // //             <select
// // // // //               value={specializationFilter}
// // // // //               onChange={(e) => setSpecializationFilter(e.target.value)}
// // // // //               className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // // //             >
// // // // //               <option value="">Expertise</option>
// // // // //               {uniqueSpecializations.map((spec) => (
// // // // //                 <option key={spec} value={spec}>
// // // // //                   {spec}
// // // // //                 </option>
// // // // //               ))}
// // // // //             </select>
// // // // //           </div>
// // // // //         </div>

// // // // //         {filteredExperts.length === 0 && (
// // // // //           <div className="text-center text-gray-600 py-10">
// // // // //             <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
// // // // //           </div>
// // // // //         )}

// // // // //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// // // // //           {filteredExperts.map((expert) => (
// // // // //             <div
// // // // //               key={expert.id}
// // // // //               className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow"
// // // // //             >
// // // // //               <div className="flex items-center gap-4">
// // // // //                 <Image
// // // // //                   src={expert.photo || "/default.jpg"}
// // // // //                   alt={expert.fullName}
// // // // //                   width={80}
// // // // //                   height={80}
// // // // //                   className="rounded-full object-cover border-4 border-secondary shadow-sm"
// // // // //                 />
// // // // //                 <div>
// // // // //                   <h2 className="text-lg font-semibold text-gray-800">
// // // // //                     {expert.fullName}
// // // // //                   </h2>
// // // // //                   <p className="text-sm text-gray-600">
// // // // //                     {expert.title || expert.tagline}
// // // // //                   </p>
// // // // //                 </div>
// // // // //               </div>
// // // // //               <div className="mt-4 space-y-2">
// // // // //                 <div className="flex flex-wrap gap-2">
// // // // //                   {expert.expertise?.map((expertise) => (
// // // // //                     <span
// // // // //                       key={expertise}
// // // // //                       className="bg-secondary text-black text-xs px-2 py-1 rounded-full"
// // // // //                     >
// // // // //                       {expertise}
// // // // //                     </span>
// // // // //                   ))}
// // // // //                 </div>
// // // // //                 <div className="grid grid-cols-2 gap-2">
// // // // //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// // // // //                     <FaRupeeSign className="text-[#36013F]" />
// // // // //                     {formatPricing(expert.pricing)} / {expert.responseTime || "30 mins"}
// // // // //                   </p>
// // // // //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// // // // //                     <FaLanguage className="text-[#36013F]" />
// // // // //                     {expert.languages || "English, Hindi"}
// // // // //                   </p>
// // // // //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// // // // //                     <FaMapMarkerAlt className="text-[#36013F]" />
// // // // //                     {expert.location || "Delhi, India"}
// // // // //                   </p>
// // // // //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// // // // //                     <FaClock className="text-[#36013F]" />
// // // // //                     Respond in {expert.responseTime || "10 mins"}
// // // // //                   </p>
// // // // //                 </div>
// // // // //               </div>
// // // // //               <Link href={`/experts/${expert.username}`}>
// // // // //                 <button className="mt-4 w-full bg-[#36013F] text-white py-2 rounded-full hover:bg-opacity-90 transition-all">
// // // // //                   View Profile
// // // // //                 </button>
// // // // //               </Link>
// // // // //             </div>
// // // // //           ))}
// // // // //         </div>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // }


// // // // "use client";

// // // // import { useState, useEffect, useMemo } from "react";
// // // // import Image from "next/image";
// // // // import Link from "next/link";
// // // // import { getFirestore, collection, getDocs } from "firebase/firestore";
// // // // import { app } from "@/lib/firebase";
// // // // import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaLanguage, FaTimes } from "react-icons/fa";
// // // // import { useSearchParams, useRouter } from "next/navigation";

// // // // export default function ExpertsDirectory() {
// // // //   const [experts, setExperts] = useState([]);
// // // //   const [filteredExperts, setFilteredExperts] = useState([]);
// // // //   const [searchTerm, setSearchTerm] = useState("");
// // // //   const [languageFilter, setLanguageFilter] = useState("");
// // // //   const [locationFilter, setLocationFilter] = useState("");
// // // //   const [specializationFilter, setSpecializationFilter] = useState("");
// // // //   const searchParams = useSearchParams();
// // // //   const router = useRouter();

// // // //   const keywords = useMemo(() => {
// // // //     return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
// // // //   }, [searchParams]);

// // // //   // Initialize searchTerm with keywords from URL on mount
// // // //   useEffect(() => {
// // // //     if (keywords.length > 0) {
// // // //       setSearchTerm(keywords.join(", "));
// // // //     }
// // // //   }, [keywords]);

// // // //   useEffect(() => {
// // // //     const fetchExperts = async () => {
// // // //       const db = getFirestore(app);
// // // //       const querySnapshot = await getDocs(collection(db, "Profiles"));
// // // //       const expertsData = querySnapshot.docs.map((doc) => ({
// // // //         id: doc.id,
// // // //         ...doc.data(),
// // // //       }));
// // // //       setExperts(expertsData);
// // // //       setFilteredExperts(expertsData);
// // // //     };
// // // //     fetchExperts();
// // // //   }, []);

// // // //   useEffect(() => {
// // // //     let result = experts;

// // // //     if (searchTerm) {
// // // //       const searchTerms = searchTerm
// // // //         .split(",")
// // // //         .map(term => term.trim().toLowerCase())
// // // //         .filter(term => term);
// // // //       result = result.filter((expert) => {
// // // //         const searchableFields = [
// // // //           expert.fullName || "",
// // // //           expert.title || "",
// // // //           expert.tagline || "",
// // // //           expert.about || "",
// // // //           expert.certifications || "",
// // // //           expert.companies || "",
// // // //           expert.languages || "",
// // // //           expert.location || "",
// // // //           (expert.expertise || []).join(" "),
// // // //           (expert.regions || []).join(" "),
// // // //           ...(expert.experience || []).map(
// // // //             (exp) => `${exp.company || ""} ${exp.title || ""}`
// // // //           ),
// // // //         ].join(" ").toLowerCase();
// // // //         return searchTerms.every(term => searchableFields.includes(term));
// // // //       });
// // // //     }

// // // //     if (languageFilter) {
// // // //       result = result.filter((expert) =>
// // // //         expert.languages?.toLowerCase().includes(languageFilter.toLowerCase())
// // // //       );
// // // //     }

// // // //     if (locationFilter) {
// // // //       result = result.filter((expert) =>
// // // //         expert.location?.toLowerCase().includes(locationFilter.toLowerCase())
// // // //       );
// // // //     }

// // // //     if (specializationFilter) {
// // // //       result = result.filter((expert) =>
// // // //         expert.expertise?.some((expertise) =>
// // // //           expertise.toLowerCase().includes(specializationFilter.toLowerCase())
// // // //         )
// // // //       );
// // // //     }

// // // //     setFilteredExperts(result);
// // // //   }, [searchTerm, languageFilter, locationFilter, specializationFilter, experts]);

// // // //   const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages?.split(", ") || []))];
// // // //   const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean);
// // // //   const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))];

// // // //   const formatPricing = (pricing) => {
// // // //     if (!pricing) return "₹ 799";
// // // //     return pricing.startsWith("₹") ? pricing : `₹ ${pricing}`;
// // // //   };

// // // //   const handleClearFilters = () => {
// // // //     setSearchTerm("");
// // // //     setLanguageFilter("");
// // // //     setLocationFilter("");
// // // //     setSpecializationFilter("");
// // // //     router.push("/expert"); // Clear query params from URL
// // // //   };

// // // //   return (
// // // //     <div className="min-h-screen bg-gray-50 py-12 px-4 mt-20">
// // // //       <div className="max-w-7xl mx-auto">
// // // //         <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
// // // //           Travel Experts Directory
// // // //         </h1>
// // // //         <p className="text-center text-gray-600 mb-8">
// // // //           Find verified travel consultants worldwide
// // // //         </p>

// // // //         <div className="flex flex-col md:flex-row gap-4 mb-8">
// // // //           <div className="w-full md:w-1/4 relative">
// // // //             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// // // //             <input
// // // //               type="text"
// // // //               placeholder="Search any keyword (e.g., visa, travel)"
// // // //               value={searchTerm}
// // // //               onChange={(e) => setSearchTerm(e.target.value)}
// // // //               className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // //             />
// // // //           </div>
// // // //           <div className="w-full md:w-1/4 relative">
// // // //             <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// // // //             <select
// // // //               value={languageFilter}
// // // //               onChange={(e) => setLanguageFilter(e.target.value)}
// // // //               className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // //             >
// // // //               <option value="">Language</option>
// // // //               {uniqueLanguages.map((lang) => (
// // // //                 <option key={lang} value={lang}>
// // // //                   {lang}
// // // //                 </option>
// // // //               ))}
// // // //             </select>
// // // //           </div>
// // // //           <div className="w-full md:w-1/4 relative">
// // // //             <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// // // //             <select
// // // //               value={locationFilter}
// // // //               onChange={(e) => setLocationFilter(e.target.value)}
// // // //               className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // //             >
// // // //               <option value="">Location</option>
// // // //               {uniqueLocations.map((loc) => (
// // // //                 <option key={loc} value={loc}>
// // // //                   {loc}
// // // //                 </option>
// // // //               ))}
// // // //             </select>
// // // //           </div>
// // // //           <div className="w-full md:w-1/4 relative">
// // // //             <FaUserTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// // // //             <select
// // // //               value={specializationFilter}
// // // //               onChange={(e) => setSpecializationFilter(e.target.value)}
// // // //               className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // // //             >
// // // //               <option value="">Expertise</option>
// // // //               {uniqueSpecializations.map((spec) => (
// // // //                 <option key={spec} value={spec}>
// // // //                   {spec}
// // // //                 </option>
// // // //               ))}
// // // //             </select>
// // // //           </div>
// // // //         </div>

// // // //         <div className="flex justify-end mb-4">
// // // //           <button
// // // //             onClick={handleClearFilters}
// // // //             className="flex items-center gap-2 px-4 py-2 bg-[#36013F] text-white rounded-full hover:bg-opacity-90 transition-all"
// // // //           >
// // // //             <FaTimes />
// // // //             Clear Filters
// // // //           </button>
// // // //         </div>

// // // //         {filteredExperts.length === 0 && (
// // // //           <div className="text-center text-gray-600 py-10">
// // // //             <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
// // // //           </div>
// // // //         )}

// // // //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// // // //           {filteredExperts.map((expert) => (
// // // //             <div
// // // //               key={expert.id}
// // // //               className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow"
// // // //             >
// // // //               <div className="flex items-center gap-4">
// // // //                 <Image
// // // //                   src={expert.photo || "/default.jpg"}
// // // //                   alt={expert.fullName}
// // // //                   width={80}
// // // //                   height={80}
// // // //                   className="rounded-full object-cover border-4 border-secondary shadow-sm"
// // // //                 />
// // // //                 <div>
// // // //                   <h2 className="text-lg font-semibold text-gray-800">
// // // //                     {expert.fullName}
// // // //                   </h2>
// // // //                   <p className="text-sm text-gray-600">
// // // //                     {expert.title || expert.tagline}
// // // //                   </p>
// // // //                 </div>
// // // //               </div>
// // // //               <div className="mt-4 space-y-2">
// // // //                 <div className="flex flex-wrap gap-2">
// // // //                   {expert.expertise?.map((expertise) => (
// // // //                     <span
// // // //                       key={expertise}
// // // //                       className="bg-secondary text-black text-xs px-2 py-1 rounded-full"
// // // //                     >
// // // //                       {expertise}
// // // //                     </span>
// // // //                   ))}
// // // //                 </div>
// // // //                 <div className="grid grid-cols-2 gap-2">
// // // //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// // // //                     <FaRupeeSign className="text-[#36013F]" />
// // // //                     {formatPricing(expert.pricing)} / {expert.responseTime || "30 mins"}
// // // //                   </p>
// // // //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// // // //                     <FaLanguage className="text-[#36013F]" />
// // // //                     {expert.languages || "English, Hindi"}
// // // //                   </p>
// // // //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// // // //                     <FaMapMarkerAlt className="text-[#36013F]" />
// // // //                     {expert.location || "Delhi, India"}
// // // //                   </p>
// // // //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// // // //                     <FaClock className="text-[#36013F]" />
// // // //                     Respond in {expert.responseTime || "10 mins"}
// // // //                   </p>
// // // //                 </div>
// // // //               </div>
// // // //               <Link href={`/experts/${expert.username}`}>
// // // //                 <button className="mt-4 w-full bg-[#36013F] text-white py-2 rounded-full hover:bg-opacity-90 transition-all">
// // // //                   View Profile
// // // //                 </button>
// // // //               </Link>
// // // //             </div>
// // // //           ))}
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }

// // // "use client";

// // // import { useState, useEffect, useMemo } from "react";
// // // import Image from "next/image";
// // // import Link from "next/link";
// // // import { getFirestore, collection, getDocs } from "firebase/firestore";
// // // import { app } from "@/lib/firebase";
// // // import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaLanguage, FaTimes } from "react-icons/fa";
// // // import { useSearchParams, useRouter } from "next/navigation";

// // // export default function ExpertsDirectory() {
// // //   const [experts, setExperts] = useState([]);
// // //   const [filteredExperts, setFilteredExperts] = useState([]);
// // //   const [searchTerm, setSearchTerm] = useState("");
// // //   const [languageFilter, setLanguageFilter] = useState("");
// // //   const [locationFilter, setLocationFilter] = useState("");
// // //   const [specializationFilter, setSpecializationFilter] = useState("");
// // //   const searchParams = useSearchParams();
// // //   const router = useRouter();

// // //   const keywords = useMemo(() => {
// // //     return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
// // //   }, [searchParams]);

// // //   // Initialize searchTerm with keywords from URL on mount
// // //   useEffect(() => {
// // //     if (keywords.length > 0) {
// // //       setSearchTerm(keywords.join(" "));
// // //     }
// // //   }, [keywords]);

// // //   useEffect(() => {
// // //     const fetchExperts = async () => {
// // //       const db = getFirestore(app);
// // //       const querySnapshot = await getDocs(collection(db, "Profiles"));
// // //       const expertsData = querySnapshot.docs.map((doc) => ({
// // //         id: doc.id,
// // //         ...doc.data(),
// // //       }));
// // //       setExperts(expertsData);
// // //       setFilteredExperts(expertsData);
// // //     };
// // //     fetchExperts();
// // //   }, []);

// // //   useEffect(() => {
// // //     let result = experts;

// // //     if (searchTerm) {
// // //       // Split search term by spaces or commas, trim, and filter out empty terms
// // //       const searchTerms = searchTerm
// // //         .toLowerCase()
// // //         .split(/[\s,]+/)
// // //         .map(term => term.trim())
// // //         .filter(term => term);
      
// // //       result = result.filter((expert) => {
// // //         // Combine all searchable fields into a single string
// // //         const searchableFields = [
// // //           expert.fullName || "",
// // //           expert.title || "",
// // //           expert.tagline || "",
// // //           expert.about || "",
// // //           expert.certifications || "",
// // //           expert.companies || "",
// // //           expert.languages || "",
// // //           expert.location || "",
// // //           (expert.services || []).join(" "),
// // //           (expert.expertise || []).join(" "),
// // //           (expert.regions || []).join(" "),
// // //           ...(expert.experience || []).map(
// // //             (exp) => `${exp.company || ""} ${exp.title || ""}`
// // //           ),
// // //         ].join(" ").toLowerCase();
        
// // //         // Match if any search term is found in any field (partial match)
// // //         return searchTerms.some(term => searchableFields.includes(term));
// // //       });
// // //     }

// // //     if (languageFilter) {
// // //       result = result.filter((expert) =>
// // //         expert.languages?.toLowerCase().includes(languageFilter.toLowerCase())
// // //       );
// // //     }

// // //     if (locationFilter) {
// // //       result = result.filter((expert) =>
// // //         expert.location?.toLowerCase().includes(locationFilter.toLowerCase())
// // //       );
// // //     }

// // //     if (specializationFilter) {
// // //       result = result.filter((expert) =>
// // //         expert.expertise?.some((expertise) =>
// // //           expertise.toLowerCase().includes(specializationFilter.toLowerCase())
// // //         )
// // //       );
// // //     }

// // //     setFilteredExperts(result);
// // //   }, [searchTerm, languageFilter, locationFilter, specializationFilter, experts]);

// // //   const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages?.split(", ") || []))];
// // //   const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean);
// // //   const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))];

// // //   const formatPricing = (pricing) => {
// // //     if (!pricing) return "₹ 799";
// // //     return pricing.startsWith("₹") ? pricing : `₹ ${pricing}`;
// // //   };

// // //   const handleClearFilters = () => {
// // //     setSearchTerm("");
// // //     setLanguageFilter("");
// // //     setLocationFilter("");
// // //     setSpecializationFilter("");
// // //     router.push("/expert"); // Clear query params from URL
// // //   };

// // //   return (
// // //     <div className="min-h-screen bg-gray-50 py-12 px-4 mt-20">
// // //       <div className="max-w-7xl mx-auto">
// // //         <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
// // //           Travel Experts Directory
// // //         </h1>
// // //         <p className="text-center text-gray-600 mb-8">
// // //           Find verified travel consultants worldwide
// // //         </p>

// // //         <div className="flex flex-col md:flex-row gap-4 mb-8">
// // //           <div className="w-full md:w-1/4 relative">
// // //             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// // //             <input
// // //               type="text"
// // //               placeholder="Search keywords (e.g., visa travel)"
// // //               value={searchTerm}
// // //               onChange={(e) => setSearchTerm(e.target.value)}
// // //               className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // //             />
// // //           </div>
// // //           <div className="w-full md:w-1/4 relative">
// // //             <FaGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// // //             <select
// // //               value={languageFilter}
// // //               onChange={(e) => setLanguageFilter(e.target.value)}
// // //               className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // //             >
// // //               <option value="">Language</option>
// // //               {uniqueLanguages.map((lang) => (
// // //                 <option key={lang} value={lang}>
// // //                   {lang}
// // //                 </option>
// // //               ))}
// // //             </select>
// // //           </div>
// // //           <div className="w-full md:w-1/4 relative">
// // //             <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// // //             <select
// // //               value={locationFilter}
// // //               onChange={(e) => setLocationFilter(e.target.value)}
// // //               className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // //             >
// // //               <option value="">Location</option>
// // //               {uniqueLocations.map((loc) => (
// // //                 <option key={loc} value={loc}>
// // //                   {loc}
// // //                 </option>
// // //               ))}
// // //             </select>
// // //           </div>
// // //           <div className="w-full md:w-1/4 relative">
// // //             <FaUserTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// // //             <select
// // //               value={specializationFilter}
// // //               onChange={(e) => setSpecializationFilter(e.target.value)}
// // //               className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// // //             >
// // //               <option value="">Expertise</option>
// // //               {uniqueSpecializations.map((spec) => (
// // //                 <option key={spec} value={spec}>
// // //                   {spec}
// // //                 </option>
// // //               ))}
// // //             </select>
// // //           </div>
// // //         </div>

// // //         <div className="flex justify-end mb-4">
// // //           <button
// // //             onClick={handleClearFilters}
// // //             className="flex items-center gap-2 px-4 py-2 bg-[#36013F] text-white rounded-full hover:bg-opacity-90 transition-all"
// // //           >
// // //             <FaTimes />
// // //             Clear Filters
// // //           </button>
// // //         </div>

// // //         {filteredExperts.length === 0 && (
// // //           <div className="text-center text-gray-600 py-10">
// // //             <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
// // //           </div>
// // //         )}

// // //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// // //           {filteredExperts.map((expert) => (
// // //             <div
// // //               key={expert.id}
// // //               className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow"
// // //             >
// // //               <div className="flex items-center gap-4">
// // //                 <Image
// // //                   src={expert.photo || "/default.jpg"}
// // //                   alt={expert.fullName}
// // //                   width={80}
// // //                   height={80}
// // //                   className="rounded-full object-cover border-4 border-secondary shadow-sm"
// // //                 />
// // //                 <div>
// // //                   <h2 className="text-lg font-semibold text-gray-800">
// // //                     {expert.fullName}
// // //                   </h2>
// // //                   <p className="text-sm text-gray-600">
// // //                     {expert.title || expert.tagline}
// // //                   </p>
// // //                 </div>
// // //               </div>
// // //               <div className="mt-4 space-y-2">
// // //                 <div className="flex flex-wrap gap-2">
// // //                   {expert.expertise?.map((expertise) => (
// // //                     <span
// // //                       key={expertise}
// // //                       className="bg-secondary text-black text-xs px-2 py-1 rounded-full"
// // //                     >
// // //                       {expertise}
// // //                     </span>
// // //                   ))}
// // //                 </div>
// // //                 <div className="grid grid-cols-2 gap-2">
// // //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// // //                     <FaRupeeSign className="text-[#36013F]" />
// // //                     {formatPricing(expert.pricing)} / {expert.responseTime || "30 mins"}
// // //                   </p>
// // //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// // //                     <FaLanguage className="text-[#36013F]" />
// // //                     {expert.languages || "English, Hindi"}
// // //                   </p>
// // //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// // //                     <FaMapMarkerAlt className="text-[#36013F]" />
// // //                     {expert.location || "Delhi, India"}
// // //                   </p>
// // //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// // //                     <FaClock className="text-[#36013F]" />
// // //                     Respond in {expert.responseTime || "10 mins"}
// // //                   </p>
// // //                 </div>
// // //               </div>
// // //               <Link href={`/experts/${expert.username}`}>
// // //                 <button className="mt-4 w-full bg-[#36013F] text-white py-2 rounded-full hover:bg-opacity-90 transition-all">
// // //                   View Profile
// // //                 </button>
// // //               </Link>
// // //             </div>
// // //           ))}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // "use client";

// // import { useState, useEffect, useMemo } from "react";
// // import Image from "next/image";
// // import Link from "next/link";
// // import { getFirestore, collection, getDocs } from "firebase/firestore";
// // import { app } from "@/lib/firebase";
// // import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaLanguage, FaTimes } from "react-icons/fa";
// // import { useSearchParams, useRouter } from "next/navigation";

// // export default function ExpertsDirectory() {
// //   const [experts, setExperts] = useState([]);
// //   const [filteredExperts, setFilteredExperts] = useState([]);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [languageFilter, setLanguageFilter] = useState("");
// //   const [locationFilter, setLocationFilter] = useState("");
// //   const [specializationFilter, setSpecializationFilter] = useState("");
// //   const searchParams = useSearchParams();
// //   const router = useRouter();

// //   const keywords = useMemo(() => {
// //     return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
// //   }, [searchParams]);

// //   // Function to convert text to sentence case
// //   const toSentenceCase = (str) => {
// //     if (!str) return "";
// //     return str
// //       .toLowerCase()
// //       .split(" ")
// //       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
// //       .join(" ");
// //   };

// //   useEffect(() => {
// //     if (keywords.length > 0) {
// //       setSearchTerm(keywords.join(" "));
// //     }
// //   }, [keywords]);

// //   useEffect(() => {
// //     const fetchExperts = async () => {
// //       const db = getFirestore(app);
// //       const querySnapshot = await getDocs(collection(db, "Profiles"));
// //       const expertsData = querySnapshot.docs.map((doc) => {
// //         const data = doc.data();
// //         return {
// //           id: doc.id,
// //           fullName: toSentenceCase(data.fullName),
// //           title: toSentenceCase(data.title),
// //           tagline: toSentenceCase(data.tagline),
// //           languages: toSentenceCase(data.languages),
// //           location: toSentenceCase(data.location),
// //           expertise: data.expertise?.map(toSentenceCase) || [],
// //           pricing: data.pricing,
// //           responseTime: data.responseTime,
// //           username: data.username,
// //           photo: data.photo,
// //           about: toSentenceCase(data.about),
// //           certifications: toSentenceCase(data.certifications),
// //           companies: toSentenceCase(data.companies),
// //           services: data.services?.map(toSentenceCase) || [],
// //           regions: data.regions?.map(toSentenceCase) || [],
// //           experience: data.experience?.map(exp => ({
// //             ...exp,
// //             company: toSentenceCase(exp.company),
// //             title: toSentenceCase(exp.title),
// //           })) || [],
// //         };
// //       });
// //       setExperts(expertsData);
// //       setFilteredExperts(expertsData);
// //     };
// //     fetchExperts();
// //   }, []);

// //   useEffect(() => {
// //     let result = experts;

// //     if (searchTerm) {
// //       const searchTerms = searchTerm
// //         .toLowerCase()
// //         .split(/[\s,]+/)
// //         .map(term => term.trim())
// //         .filter(term => term);
      
// //       result = result.filter((expert) => {
// //         const searchableFields = [
// //           expert.fullName || "",
// //           expert.title || "",
// //           expert.tagline || "",
// //           expert.about || "",
// //           expert.certifications || "",
// //           expert.companies || "",
// //           expert.languages || "",
// //           expert.location || "",
// //           (expert.services || []).join(" "),
// //           (expert.expertise || []).join(" "),
// //           (expert.regions || []).join(" "),
// //           ...(expert.experience || []).map(
// //             (exp) => `${exp.company || ""} ${exp.title || ""}`
// //           ),
// //         ].join(" ").toLowerCase();
        
// //         return searchTerms.some(term => searchableFields.includes(term));
// //       });
// //     }

// //     if (languageFilter) {
// //       result = result.filter((expert) =>
// //         expert.languages?.toLowerCase().includes(languageFilter.toLowerCase())
// //       );
// //     }

// //     if (locationFilter) {
// //       result = result.filter((expert) =>
// //         expert.location?.toLowerCase().includes(locationFilter.toLowerCase())
// //       );
// //     }

// //     if (specializationFilter) {
// //       result = result.filter((expert) =>
// //         expert.expertise?.some((expertise) =>
// //           expertise.toLowerCase().includes(specializationFilter.toLowerCase())
// //         )
// //       );
// //     }

// //     setFilteredExperts(result);
// //   }, [searchTerm, languageFilter, locationFilter, specializationFilter, experts]);

// //   const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages?.split(", ") || []))].map(toSentenceCase);
// //   const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean).map(toSentenceCase);
// //   const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))].map(toSentenceCase);

// //   const formatPricing = (pricing) => {
// //     if (!pricing) return "₹ 799";
// //     return pricing.startsWith("₹") ? pricing : `₹ ${pricing}`;
// //   };

// //   const truncateTagline = (tagline) => {
// //     if (!tagline) return "";
// //     return tagline.length > 150 ? `${tagline.substring(0, 130)}...` : tagline;
// //   };

// //   const handleClearFilters = () => {
// //     setSearchTerm("");
// //     setLanguageFilter("");
// //     setLocationFilter("");
// //     setSpecializationFilter("");
// //     router.push("/expert");
// //   };

// //   return (
// //     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-20">
// //       <div className=" mx-auto">
// //         <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
// //           Travel Experts Directory
// //         </h1>
// //         <p className="text-center text-gray-600 mb-8">
// //           Find verified travel consultants worldwide
// //         </p>

// //         <div className="flex flex-col sm:flex-row gap-4 mb-8  mx-auto">
// //           <div className="w-full sm:w-1/5 relative">
// //             <FaSearch className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-400" />
// //             <input
// //               type="text"
// //               placeholder="Search keywords (e.g., visa travel)"
// //               value={searchTerm}
// //               onChange={(e) => setSearchTerm(e.target.value)}
// //               className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// //             />
// //           </div>
// //           <div className="w-full sm:w-1/5 relative">
// //             <FaGlobe className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-400" />
// //             <select
// //               value={languageFilter}
// //               onChange={(e) => setLanguageFilter(e.target.value)}
// //               className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// //             >
// //               <option value="">Language</option>
// //               {uniqueLanguages.map((lang) => (
// //                 <option key={lang} value={lang}>
// //                   {lang}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>
// //           <div className="w-full sm:w-1/5 relative">
// //             <FaMapMarkerAlt className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-400" />
// //             <select
// //               value={locationFilter}
// //               onChange={(e) => setLocationFilter(e.target.value)}
// //               className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// //             >
// //               <option value="">Location</option>
// //               {uniqueLocations.map((loc) => (
// //                 <option key={loc} value={loc}>
// //                   {loc}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>
// //           <div className="w-full sm:w-1/5 relative">
// //             <FaUserTag className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-400" />
// //             <select
// //               value={specializationFilter}
// //               onChange={(e) => setSpecializationFilter(e.target.value)}
// //               className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
// //             >
// //               <option value="">Expertise</option>
// //               {uniqueSpecializations.map((spec) => (
// //                 <option key={spec} value={spec}>
// //                   {spec}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>
// //           <div className="flex justify-center sm:justify-end mb-8  mx-auto">
// //           <button
// //             onClick={handleClearFilters}
// //             className="flex items-center gap-2 px-4 py-2 bg-[#36013F] text-white rounded-full hover:bg-opacity-90 transition-all"
// //           >
// //             <FaTimes />
// //             Clear Filters
// //           </button>
// //         </div>
// //         </div>

        

// //         {filteredExperts.length === 0 && (
// //           <div className="text-center text-gray-600 py-10">
// //             <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
// //           </div>
// //         )}

// //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6  mx-auto">
// //           {filteredExperts.map((expert) => (
// //             <div
// //               key={expert.id}
// //               className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
// //             >
// //               <div className="flex items-center gap-4 mb-4">
// //                 <Image
// //                   src={expert.photo || "/default.jpg"}
// //                   alt={expert.fullName}
// //                   width={80}
// //                   height={80}
// //                   className="rounded-full object-cover border-4 border-secondary shadow-sm"
// //                 />
// //                 <div className="flex-1">
// //                   <h2 className="text-lg font-semibold text-gray-800">
// //                     {expert.fullName}
// //                   </h2>
// //                   <p className="text-sm text-gray-600 line-clamp-2">
// //                     {truncateTagline(expert.tagline || expert.title)}
// //                   </p>
// //                 </div>
// //               </div>
// //               <div className="space-y-4">
// //                 <div className="flex flex-wrap gap-2">
// //                   {expert.expertise?.map((expertise) => (
// //                     <span
// //                       key={expertise}
// //                       className="bg-secondary text-black text-xs px-2 py-1 rounded-full"
// //                     >
// //                       {expertise}
// //                     </span>
// //                   ))}
// //                 </div>
// //                 <div className="grid grid-cols-2 gap-x-4 gap-y-2">
// //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// //                     <FaRupeeSign className="text-[#36013F]" />
// //                     {formatPricing(expert.pricing)} / {expert.responseTime || "30 mins"}
// //                   </p>
// //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// //                     <FaLanguage className="text-[#36013F]" />
// //                     {expert.languages || "English, Hindi"}
// //                   </p>
// //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// //                     <FaMapMarkerAlt className="text-[#36013F]" />
// //                     {expert.location || "Delhi, India"}
// //                   </p>
// //                   <p className="text-sm text-gray-600 flex items-center gap-2">
// //                     <FaClock className="text-[#36013F]" />
// //                     Respond in {expert.responseTime || "10 mins"}
// //                   </p>
// //                 </div>
// //               </div>
// //               <Link href={`/experts/${expert.username}`}>
// //                 <button className="mt-6 w-full bg-[#36013F] text-white py-2 rounded-full hover:bg-opacity-90 transition-all">
// //                   View Profile
// //                 </button>
// //               </Link>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useState, useEffect, useMemo } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { getFirestore, collection, getDocs } from "firebase/firestore";
// import { app } from "@/lib/firebase";
// import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaLanguage, FaTimes } from "react-icons/fa";
// import { useSearchParams, useRouter } from "next/navigation";

// export default function ExpertsDirectory() {
//   const [experts, setExperts] = useState([]);
//   const [filteredExperts, setFilteredExperts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [languageFilter, setLanguageFilter] = useState("");
//   const [locationFilter, setLocationFilter] = useState("");
//   const [specializationFilter, setSpecializationFilter] = useState("");
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const keywords = useMemo(() => {
//     return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
//   }, [searchParams]);

//   const toSentenceCase = (str) => {
//     if (!str) return "";
//     return str
//       .toLowerCase()
//       .split(" ")
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(" ");
//   };

//   useEffect(() => {
//     if (keywords.length > 0) {
//       setSearchTerm(keywords.join(" "));
//     }
//   }, [keywords]);

//   useEffect(() => {
//     const fetchExperts = async () => {
//       const db = getFirestore(app);
//       const querySnapshot = await getDocs(collection(db, "Profiles"));
//       const expertsData = querySnapshot.docs.map((doc) => {
//         const data = doc.data();
//         return {
//           id: doc.id,
//           fullName: toSentenceCase(data.fullName),
//           title: toSentenceCase(data.title),
//           tagline: toSentenceCase(data.tagline),
//           languages: toSentenceCase(data.languages),
//           location: toSentenceCase(data.location),
//           expertise: data.expertise?.map(toSentenceCase) || [],
//           pricing: data.pricing,
//           responseTime: data.responseTime,
//           username: data.username,
//           photo: data.photo,
//           about: toSentenceCase(data.about),
//           certifications: toSentenceCase(data.certifications),
//           companies: toSentenceCase(data.companies),
//           services: data.services?.map(toSentenceCase) || [],
//           regions: data.regions?.map(toSentenceCase) || [],
//           experience: data.experience?.map(exp => ({
//             ...exp,
//             company: toSentenceCase(exp.company),
//             title: toSentenceCase(exp.title),
//           })) || [],
//         };
//       });
//       setExperts(expertsData);
//       setFilteredExperts(expertsData);
//     };
//     fetchExperts();
//   }, []);

//   useEffect(() => {
//     let result = experts;

//     if (searchTerm) {
//       const searchTerms = searchTerm
//         .toLowerCase()
//         .split(/[\s,]+/)
//         .map(term => term.trim())
//         .filter(term => term);
      
//       result = result.filter((expert) => {
//         const searchableFields = [
//           expert.fullName || "",
//           expert.title || "",
//           expert.tagline || "",
//           expert.about || "",
//           expert.certifications || "",
//           expert.companies || "",
//           expert.languages || "",
//           expert.location || "",
//           (expert.services || []).join(" "),
//           (expert.expertise || []).join(" "),
//           (expert.regions || []).join(" "),
//           ...(expert.experience || []).map(
//             (exp) => `${exp.company || ""} ${exp.title || ""}`
//           ),
//         ].join(" ").toLowerCase();
        
//         return searchTerms.some(term => searchableFields.includes(term));
//       });
//     }

//     if (languageFilter) {
//       result = result.filter((expert) =>
//         expert.languages?.toLowerCase().includes(languageFilter.toLowerCase())
//       );
//     }

//     if (locationFilter) {
//       result = result.filter((expert) =>
//         expert.location?.toLowerCase().includes(locationFilter.toLowerCase())
//       );
//     }

//     if (specializationFilter) {
//       result = result.filter((expert) =>
//         expert.expertise?.some((expertise) =>
//           expertise.toLowerCase().includes(specializationFilter.toLowerCase())
//         )
//       );
//     }

//     setFilteredExperts(result);
//   }, [searchTerm, languageFilter, locationFilter, specializationFilter, experts]);

//   const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages?.split(", ") || []))].map(toSentenceCase);
//   const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean).map(toSentenceCase);
//   const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))].map(toSentenceCase);

//   const formatPricing = (pricing) => {
//     if (!pricing) return "₹ 799";
//     return pricing.startsWith("₹") ? pricing : `₹ ${pricing}`;
//   };

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
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
//           Travel Experts Directory
//         </h1>
//         <p className="text-center text-gray-600 mb-6 text-sm sm:text-base">
//           Find verified travel consultants worldwide
//         </p>

//         <div className="mb-6">
//           <div className="flex flex-row gap-2 mb-4 overflow-x-auto whitespace-nowrap pb-2">
//             <div className="w-1/4 min-w-[120px] relative">
//               <FaGlobe className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
//               <select
//                 value={languageFilter}
//                 onChange={(e) => setLanguageFilter(e.target.value)}
//                 className="w-full pl-8 pr-2 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
//               >
//                 <option value="">Language</option>
//                 {uniqueLanguages.map((lang) => (
//                   <option key={lang} value={lang}>
//                     {lang}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="w-1/4 min-w-[120px] relative">
//               <FaMapMarkerAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
//               <select
//                 value={locationFilter}
//                 onChange={(e) => setLocationFilter(e.target.value)}
//                 className="w-full pl-8 pr-2 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
//               >
//                 <option value="">Location</option>
//                 {uniqueLocations.map((loc) => (
//                   <option key={loc} value={loc}>
//                     {loc}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="w-1/4 min-w-[120px] relative">
//               <FaUserTag className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
//               <select
//                 value={specializationFilter}
//                 onChange={(e) => setSpecializationFilter(e.target.value)}
//                 className="w-full pl-8 pr-2 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
//               >
//                 <option value="">Expertise</option>
//                 {uniqueSpecializations.map((spec) => (
//                   <option key={spec} value={spec}>
//                     {spec}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="w-1/4 min-w-[100px] flex items-center">
//               <button
//                 onClick={handleClearFilters}
//                 className="flex items-center gap-1 px-3 py-1 bg-[#36013F] text-white rounded-full hover:bg-opacity-90 transition-all text-sm"
//               >
//                 <FaTimes />
//                 Clear
//               </button>
//             </div>
//           </div>
//           <div className="relative">
//             <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
//             <input
//               type="text"
//               placeholder="Search keywords (e.g., visa travel)"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
//             />
//           </div>
//         </div>

//         {filteredExperts.length === 0 && (
//           <div className="text-center text-gray-600 py-8 text-sm">
//             <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
//           </div>
//         )}

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
//           {filteredExperts.map((expert) => (
//             <div
//               key={expert.id}
//               className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow"
//             >
//               <div className="flex items-center gap-3 mb-3">
//                 <Image
//                   src={expert.photo || "/default.jpg"}
//                   alt={expert.fullName}
//                   width={60}
//                   height={60}
//                   className="rounded-full object-cover border-2 border-secondary shadow-sm"
//                 />
//                 <div className="flex-1">
//                   <h2 className="text-base font-semibold text-gray-800">
//                     {expert.fullName}
//                   </h2>
//                   <p className="text-xs text-gray-600 line-clamp-2">
//                     {truncateTagline(expert.tagline || expert.title)}
//                   </p>
//                 </div>
//               </div>
//               <div className="space-y-3">
//                 <div className="flex flex-wrap gap-1.5">
//                   {expert.expertise?.map((expertise) => (
//                     <span
//                       key={expertise}
//                       className="bg-secondary text-black text-xs px-1.5 py-0.5 rounded-full"
//                     >
//                       {expertise}
//                     </span>
//                   ))}
//                 </div>
//                 <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
//                   <p className="flex items-center gap-1.5">
//                     <FaRupeeSign className="text-[#36013F]" />
//                     {formatPricing(expert.pricing)} / {expert.responseTime || "30 mins"}
//                   </p>
//                   <p className="flex items-center gap-1.5">
//                     <FaLanguage className="text-[#36013F]" />
//                     {expert.languages || "English, Hindi"}
//                   </p>
//                   <p className="flex items-center gap-1.5">
//                     <FaMapMarkerAlt className="text-[#36013F]" />
//                     {expert.location || "Delhi, India"}
//                   </p>
//                   <p className="flex items-center gap-1.5">
//                     <FaClock className="text-[#36013F]" />
//                     Respond in {expert.responseTime || "10 mins"}
//                   </p>
//                 </div>
//               </div>
//               <Link href={`/experts/${expert.username}`}>
//                 <button className="mt-4 w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm">
//                   View Profile
//                 </button>
//               </Link>
//             </div>
//           ))}
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
import { FaSearch, FaGlobe, FaMapMarkerAlt, FaUserTag, FaRupeeSign, FaClock, FaLanguage, FaTimes } from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";

export default function ExpertsDirectory() {
  const [experts, setExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const keywords = useMemo(() => {
    return searchParams.get("keywords")?.split(",").filter(Boolean) || [];
  }, [searchParams]);

  const toSentenceCase = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    if (keywords.length > 0) {
      setSearchTerm(keywords.join(" "));
    }
  }, [keywords]);

  useEffect(() => {
    const fetchExperts = async () => {
      const db = getFirestore(app);
      const querySnapshot = await getDocs(collection(db, "Profiles"));
      const expertsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          fullName: toSentenceCase(data.fullName),
          title: toSentenceCase(data.title),
          tagline: toSentenceCase(data.tagline),
          languages: toSentenceCase(data.languages),
          location: toSentenceCase(data.location),
          expertise: data.expertise?.map(toSentenceCase) || [],
          pricing: data.pricing,
          responseTime: data.responseTime,
          username: data.username,
          photo: data.photo,
          about: toSentenceCase(data.about),
          certifications: toSentenceCase(data.certifications),
          companies: toSentenceCase(data.companies),
          services: data.services?.map(toSentenceCase) || [],
          regions: data.regions?.map(toSentenceCase) || [],
          experience: data.experience?.map(exp => ({
            ...exp,
            company: toSentenceCase(exp.company),
            title: toSentenceCase(exp.title),
          })) || [],
        };
      });
      setExperts(expertsData);
      setFilteredExperts(expertsData);
    };
    fetchExperts();
  }, []);

  useEffect(() => {
    let result = experts;

    if (searchTerm) {
      const searchTerms = searchTerm
        .toLowerCase()
        .split(/[\s,]+/)
        .map(term => term.trim())
        .filter(term => term);
      
      result = result.filter((expert) => {
        const searchableFields = [
          expert.fullName || "",
          expert.title || "",
          expert.tagline || "",
          expert.about || "",
          expert.certifications || "",
          expert.companies || "",
          expert.languages || "",
          expert.location || "",
          (expert.services || []).join(" "),
          (expert.expertise || []).join(" "),
          (expert.regions || []).join(" "),
          ...(expert.experience || []).map(
            (exp) => `${exp.company || ""} ${exp.title || ""}`
          ),
        ].join(" ").toLowerCase();
        
        return searchTerms.some(term => searchableFields.includes(term));
      });
    }

    if (languageFilter) {
      result = result.filter((expert) =>
        expert.languages?.toLowerCase().includes(languageFilter.toLowerCase())
      );
    }

    if (locationFilter) {
      result = result.filter((expert) =>
        expert.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (specializationFilter) {
      result = result.filter((expert) =>
        expert.expertise?.some((expertise) =>
          expertise.toLowerCase().includes(specializationFilter.toLowerCase())
        )
      );
    }

    setFilteredExperts(result);
  }, [searchTerm, languageFilter, locationFilter, specializationFilter, experts]);

  const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages?.split(", ") || []))].map(toSentenceCase);
  const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean).map(toSentenceCase);
  const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))].map(toSentenceCase);

  const formatPricing = (pricing) => {
    if (!pricing) return "₹ 799";
    return pricing.startsWith("₹") ? pricing : `₹ ${pricing}`;
  };

  const truncateTagline = (tagline) => {
    if (!tagline) return "";
    return tagline.length > 150 ? `${tagline.substring(0, 130)}...` : tagline;
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setLanguageFilter("");
    setLocationFilter("");
    setSpecializationFilter("");
    router.push("/expert");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
          Travel Experts Directory
        </h1>
        <p className="text-center text-gray-600 mb-4 text-sm sm:text-base">
          Find verified travel consultants worldwide
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
         
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search keywords (e.g., visa travel)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
            />
          </div>
        </div>

        {filteredExperts.length === 0 && (
          <div className="text-center text-gray-600 py-8 text-sm">
            <p>No experts found matching your criteria. Try adjusting your search or filters.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {filteredExperts.map((expert) => (
            <div
              key={expert.id}
              className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <Image
                  src={expert.photo || "/default.jpg"}
                  alt={expert.fullName}
                  width={60}
                  height={60}
                  className="rounded-full object-cover border-2 border-secondary shadow-sm"
                />
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-gray-800">
                    {expert.fullName}
                  </h2>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {truncateTagline(expert.tagline || expert.title)}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {expert.expertise?.map((expertise) => (
                    <span
                      key={expertise}
                      className="bg-secondary text-black text-xs px-1.5 py-0.5 rounded-full"
                    >
                      {expertise}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <p className="flex items-center gap-1.5">
                    <FaRupeeSign className="text-[#36013F]" />
                    {formatPricing(expert.pricing)} / {expert.responseTime || "30 mins"}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <FaLanguage className="text-[#36013F]" />
                    {expert.languages || "English, Hindi"}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-[#36013F]" />
                    {expert.location || "Delhi, India"}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <FaClock className="text-[#36013F]" />
                    Respond in {expert.responseTime || "10 mins"}
                  </p>
                </div>
              </div>
              <Link href={`/experts/${expert.username}`}>
                <button className="mt-4 w-full bg-[#36013F] text-white py-1.5 rounded-full hover:bg-opacity-90 transition-all text-sm">
                  View Profile
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}