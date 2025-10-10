

// "use client";

// import React, { useState, useEffect } from "react";
// import { getFirestore, collection, getDocs, query, where, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
// import { app } from "@/lib/firebase";
// import Link from "next/link";
// import Image from "next/image";
// import { FaSearch, FaChevronDown, FaThumbsUp, FaThumbsDown, FaAward, FaUserCheck, FaRegLightbulb } from "react-icons/fa";
// import Lightbox from "react-image-lightbox";
// import "react-image-lightbox/style.css";

// const db = getFirestore(app);
// const PRIMARY_COLOR = "text-[#36013F]";
// const ACCENT_COLOR = "bg-[#F4D35E]";
// const LIGHT_ACCENT_COLOR = "bg-yellow-50";

// const truncateByChars = (text, maxLength) => {
//   if (!text) return "";
//   return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
// };

// // Component for the Top Expert Card for reuse and cleaner JSX
// const ExpertCard = ({ expert, profile, openLightbox }) => (
//   <Link 
//     href={profile.username ? `/experts/${profile.username}` : "#"} 
//     className="flex items-start p-4 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 group relative"
//     aria-label={`View profile for ${expert.expertName}`}
//   >
//     {/* Rank Badge */}
//     <div className={`absolute top-0 right-0 p-1 rounded-bl-lg ${ACCENT_COLOR} text-[#36013F] font-bold text-xs flex items-center gap-1`}>
//       <FaAward className="w-3 h-3"/>
//       #{expert.rank}
//     </div>

//     {/* Profile Image */}
//     <button
//       onClick={(e) => { e.preventDefault(); openLightbox(profile.profilePhoto); }}
//       className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-full border-3 border-[#36013F] ring-2 ring-[#F4D35E] mr-4 shadow-sm"
//     >
//       <Image
//         src={profile.profilePhoto}
//         alt={`${expert.expertName || "Expert"}'s profile photo`}
//         fill
//         sizes="64px"
//         className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
//         onError={(e) => (e.target.src = "/default.jpg")}
//       />
//     </button>
    
//     {/* Expert Info */}
//     <div className="flex flex-col flex-grow min-w-0">
//       <p className={`text-lg font-extrabold truncate ${PRIMARY_COLOR} group-hover:text-[#F4D35E] transition-colors`}>
//         {expert.expertName}
//       </p>
//       <p className="text-sm text-gray-700 truncate mb-1">
//         {truncateByChars(profile.tagline, 50)}
//       </p>
//       <div className="flex items-center text-xs text-gray-500 font-medium">
//         <FaUserCheck className="w-3 h-3 mr-1" />
//         <span className="font-bold">{expert.answerCount}</span> Answers
//       </div>
//     </div>
//   </Link>
// );


// export default function FAQPage() {
//   const [groupedQuestions, setGroupedQuestions] = useState([]);
//   const [topExperts, setTopExperts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [expertProfileMap, setExpertProfileMap] = useState({});
//   const [isLightboxOpen, setIsLightboxOpen] = useState(false);
//   const [selectedImage, setSelectedImage] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const openLightbox = (imageSrc) => {
//     setSelectedImage(imageSrc);
//     setIsLightboxOpen(true);
//   };

//   const groupQuestions = (questionList) => {
//     const grouped = {};
//     questionList.forEach((q) => {
//       const questionKey = q.question?.trim().toLowerCase() || "";
//       if (!grouped[questionKey]) {
//         grouped[questionKey] = {
//           originalQuestion: q.question,
//           answerGroups: {},
//           maxTimestamp: 0,
//         };
//       }
//       const group = grouped[questionKey];
//       group.maxTimestamp = Math.max(group.maxTimestamp, q.rawTimestamp);

//       const replyKey = q.reply?.trim() || "";
//       if (!group.answerGroups[replyKey]) {
//         group.answerGroups[replyKey] = {
//           reply: q.reply,
//           experts: new Set(),
//           totalLikes: 0,
//           totalDislikes: 0,
//           ids: [],
//           timestamps: [],
//         };
//       }
//       const ag = group.answerGroups[replyKey];
//       ag.experts.add(q.expertName);
//       ag.totalLikes += q.likes || 0;
//       ag.totalDislikes += q.dislikes || 0;
//       ag.ids.push(q.id);
//       ag.timestamps.push(q.rawTimestamp);
//     });

//     // Convert answerGroups to arrays
//     Object.keys(grouped).forEach((key) => {
//       grouped[key].answerGroupsArray = Object.values(grouped[key].answerGroups).map((ag) => ({
//         ...ag,
//         minTimestamp: Math.min(...ag.timestamps),
//         timestamp: new Date(Math.min(...ag.timestamps)).toLocaleDateString("en-GB") +
//           " " +
//           new Date(Math.min(...ag.timestamps)).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
//       }));
//     });

//     return Object.values(grouped).sort((a, b) => b.maxTimestamp - a.maxTimestamp);
//   };

//   useEffect(() => {
//     const fetchQuestionsAndUsernames = async () => {
//       try {
//         const q = query(
//           collection(db, "Questions"),
//           where("isPublic", "==", true),
//           where("status", "==", "answered")
//         );
//         const querySnapshot = await getDocs(q);
//         const questionList = querySnapshot.docs.map((docSnap) => {
//           const data = docSnap.data();
//           const rawDate = new Date(data.createdAt || Date.now());
//           return {
//             id: docSnap.id,
//             ...data,
//             timestamp:
//               rawDate.toLocaleDateString("en-GB") +
//               " " +
//               rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
//             rawTimestamp: rawDate.getTime(),
//           };
//         });

//         const grouped = groupQuestions(questionList);

//         const answerCountMap = questionList.reduce((map, q) => {
//           map[q.expertName] = (map[q.expertName] || 0) + 1;
//           return map;
//         }, {});

//         const uniqueExpertNames = [...new Set(questionList.map((q) => q.expertName))].filter(Boolean);
//         const profilePromises = uniqueExpertNames.map(async (expertName) => {
//           const qProfile = query(collection(db, "Profiles"), where("fullName", "==", expertName));
//           const profileSnapshot = await getDocs(qProfile);
//           let username = null, profilePhoto = null, tagline = null;
//           profileSnapshot.forEach((doc) => {
//             username = doc.data().username;
//             profilePhoto = doc.data().profilePhoto || doc.data().photo;
//             tagline = doc.data().tagline || "No tagline available";
//           });
//           return { expertName, username, profilePhoto, tagline, answerCount: answerCountMap[expertName] || 0 };
//         });

//         const profileResults = await Promise.all(profilePromises);
//         const newExpertProfileMap = profileResults.reduce((map, result) => {
//           if (result.expertName) {
//             map[result.expertName] = {
//               username: result.username,
//               profilePhoto: result.profilePhoto || "/default.jpg",
//               tagline: result.tagline,
//             };
//           }
//           return map;
//         }, {});
        
//         const topExpertsList = profileResults
//           .sort((a, b) => b.answerCount - a.answerCount)
//           .slice(0, 10)
//           .map((expert, index) => ({ ...expert, rank: index + 1 }));

//         setExpertProfileMap(newExpertProfileMap);
//         setGroupedQuestions(grouped);
//         setTopExperts(topExpertsList);
//       } catch (error) {
//         console.error("Error fetching data:", error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     // Real-time listener for questions
//     const q = query(
//       collection(db, "Questions"),
//       where("isPublic", "==", true),
//       where("status", "==", "answered")
//     );
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const questionList = snapshot.docs.map((docSnap) => {
//         const data = docSnap.data();
//         const rawDate = new Date(data.createdAt || Date.now());
//         return {
//           id: docSnap.id,
//           ...data,
//           timestamp:
//             rawDate.toLocaleDateString("en-GB") +
//             " " +
//             rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
//           rawTimestamp: rawDate.getTime(),
//         };
//       });
//       const grouped = groupQuestions(questionList);
//       setGroupedQuestions(grouped);
//     }, (error) => {
//       console.error("Error with real-time listener:", error.message);
//     });

//     fetchQuestionsAndUsernames();
//     return () => unsubscribe();
//   }, []);

//   const filteredGroups = groupedQuestions.filter(
//     (group) =>
//       group.originalQuestion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       group.answerGroupsArray.some(
//         (ag) =>
//           ag.reply?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           Array.from(ag.experts).some((expert) =>
//             expert?.toLowerCase().includes(searchTerm.toLowerCase())
//           )
//       )
//   );

//   const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
//   const paginatedGroups = filteredGroups.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const handlePageChange = (newPage) => {
//     if (newPage > 0 && newPage <= totalPages) setCurrentPage(newPage);
//   };

//   const handleLikeDislike = async (ids, action) => {
//     try {
//       const updates = ids.map((id) =>
//         updateDoc(doc(db, "Questions", id), {
//           [action === "like" ? "likes" : "dislikes"]: increment(1),
//         })
//       );
//       await Promise.all(updates);
//       // The real-time listener will update the state automatically
//     } catch (error) {
//       console.error(`Error updating ${action}:`, error.message);
//       // Assuming toast is available, otherwise remove
//       // toast.error(`Failed to update ${action}.`);
//     }
//   };

//   // Reusable button styles for pagination and like/dislike
//   const buttonClass = (isActive = false) => `
//     px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 
//     ${isActive 
//       ? `bg-[#36013F] text-white shadow-md border border-[#36013F]` 
//       : `bg-white ${PRIMARY_COLOR} border border-gray-300 hover:${ACCENT_COLOR} hover:text-[#36013F] hover:border-[#F4D35E]`}
//     disabled:opacity-50 disabled:cursor-not-allowed
//   `;

//   return (
//     <div className="bg-gray-50 min-h-screen font-sans">
//       {isLightboxOpen && (
//         <Lightbox
//           mainSrc={selectedImage}
//           onCloseRequest={() => setIsLightboxOpen(false)}
//           imageTitle={selectedImage.includes("default.jpg") ? "Default Profile Image" : "Expert Profile Image"}
//         />
//       )}
//       <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
//         {/* Header and Search Section */}
//         <header className="text-center mb-16 pt-4">
//           <h1 className="text-4xl sm:text-6xl font-extrabold ${PRIMARY_COLOR} mb-3 tracking-tight">
//           Already Answered Questions
//           </h1>
//           <p className="text-base sm:text-xl text-gray-700 max-w-3xl mx-auto">
//             Explore questions already answered by our community of insightful experts.
//           </p>
//           <div className="relative w-full max-w-3xl mx-auto mt-10">
//             <FaSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
//             <input
//               type="text"
//               placeholder="Search questions, answers, or experts..."
//               className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-full bg-white shadow-lg focus:outline-none focus:ring-4 focus:ring-[#36013F]/20 focus:border-[#36013F] transition-all duration-300 text-lg"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               aria-label="Search FAQs"
//             />
//           </div>
//         </header>

//         {/* Main Content Layout */}
//         <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
//           {/* Questions/FAQ List */}
//           <div className="lg:col-span-2 order-1 lg:order-1">
//             {/* Loading State */}
//             {loading ? (
//               <div className={`flex justify-center items-center gap-4 text-gray-600 p-12 rounded-xl border ${LIGHT_ACCENT_COLOR}`}>
//                 <svg className={`animate-spin h-8 w-8 ${PRIMARY_COLOR}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
//                 </svg>
//                 <span className="text-xl font-bold">Fetching Community Wisdom...</span>
//               </div>
//             ) : 
//             /* No Results State */
//             paginatedGroups.length === 0 ? (
//               <div className="text-center bg-white p-12 rounded-xl shadow-lg border border-gray-200">
//                 <p className="text-2xl font-extrabold text-gray-700 mb-2">🤷‍♂️ No Results Found</p>
//                 <p className="text-gray-500 text-lg">Try adjusting your search terms or ask a new question!</p>
//               </div>
//             ) : (
//               /* Questions List */
//               <div className="space-y-6">
//                 {paginatedGroups.map((group) => (
//                   <details key={group.originalQuestion} className="group bg-white rounded-xl shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:shadow-xl hover:border-[#36013F]/50">
                    
//                     {/* Question Summary (Header) */}
//                     <summary className={`flex items-center justify-between p-6 cursor-pointer font-bold text-xl ${PRIMARY_COLOR} hover:${LIGHT_ACCENT_COLOR} transition-colors duration-200`}>
//                       <span className="pr-4 leading-snug">{group.originalQuestion}</span>
//                       <FaChevronDown className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-180 group-open:${PRIMARY_COLOR}`} />
//                     </summary>
                    
//                     {/* Answer Details */}
//                     <div className="p-6 border-t border-gray-200 space-y-8">
//                       {group.answerGroupsArray.map((ag) => {
//                         const expertsArray = Array.from(ag.experts);
//                         const isSingleExpert = ag.experts.size === 1;
//                         const singleExpertName = isSingleExpert ? expertsArray[0] : null;
//                         const profile = isSingleExpert && singleExpertName ? (expertProfileMap[singleExpertName] || { username: null, profilePhoto: "/default.jpg", tagline: "No tagline available" }) : null;

//                         return (
//                           <div key={ag.reply} className="border-b border-gray-100 pb-4 last:border-b-0">
                            
//                             {/* Answer Text */}
//                             <p className="mb-5 text-gray-700 leading-relaxed whitespace-pre-wrap text-base border-l-4 border-[#F4D35E] pl-4 rounded-sm italic">
//                               {ag.reply || "No answer available yet."}
//                             </p>
                            
//                             <div className="flex flex-wrap justify-between items-end gap-4">
                              
//                               {/* Expert Info */}
//                               <div className="flex items-center gap-3">
//                                 {isSingleExpert && profile && (
//                                   <button onClick={() => openLightbox(profile.profilePhoto)} className="relative w-12 h-12 overflow-hidden rounded-full border-2 border-[#36013F] flex-shrink-0 shadow-sm transition-transform hover:scale-105">
//                                     <Image src={profile.profilePhoto} alt={`${singleExpertName}'s profile photo`} fill sizes="48px" className="object-cover" onError={(e) => (e.target.src = "/default.jpg")} />
//                                   </button>
//                                 )}
//                                 <div>
//                                   <span className="text-xs text-gray-500 block">Answered by</span>
//                                   {isSingleExpert && profile && profile.username ? (
//                                     <Link href={`/experts/${profile.username}`} className={`${PRIMARY_COLOR} font-extrabold hover:underline text-base`}>
//                                       {singleExpertName}
//                                     </Link>
//                                   ) : (
//                                     <p className={`font-bold text-gray-600 text-base`}>
//                                       {isSingleExpert ? (singleExpertName || "Unknown Expert") : `Verified by ${ag.experts.size}+ experts`}
//                                     </p>
//                                   )}
//                                 </div>
//                               </div>
                              
//                               {/* Timestamp */}
//                               <p className="text-sm text-gray-500 self-end">{ag.timestamp}</p>
//                             </div>
                            
//                             {/* Like/Dislike Buttons */}
//                             <div className="flex items-center gap-6 mt-4 pt-2 border-t border-dashed border-gray-100">
//                               <button
//                                 onClick={() => handleLikeDislike(ag.ids, "like")}
//                                 className={`flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group/like ${PRIMARY_COLOR}`}
//                                 aria-label="Like this answer"
//                               >
//                                 <FaThumbsUp className="w-5 h-5 group-hover/like:scale-110 transition-transform" /> 
//                                 <span className="font-semibold">{ag.totalLikes}</span>
//                               </button>
//                               <button
//                                 onClick={() => handleLikeDislike(ag.ids, "dislike")}
//                                 className={`flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors group/dislike ${PRIMARY_COLOR}`}
//                                 aria-label="Dislike this answer"
//                               >
//                                 <FaThumbsDown className="w-5 h-5 group-hover/dislike:scale-110 transition-transform" /> 
//                                 <span className="font-semibold">{ag.totalDislikes}</span>
//                               </button>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </details>
//                 ))}

//                 {/* Pagination */}
//                 {totalPages > 1 && (
//                   <div className="flex justify-center items-center gap-4 mt-10">
//                     <button 
//                       onClick={() => handlePageChange(currentPage - 1)} 
//                       disabled={currentPage === 1} 
//                       className={buttonClass()}
//                       aria-label="Previous Page"
//                     >
//                       &larr; Previous
//                     </button>
                    
//                     <div className="flex gap-1.5">
//                       {/* Page Number Indicators (showing a simplified range) */}
//                       {[...Array(totalPages)].map((_, index) => {
//                         const pageNum = index + 1;
//                         if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
//                           return (
//                             <button
//                               key={pageNum}
//                               onClick={() => handlePageChange(pageNum)}
//                               className={buttonClass(pageNum === currentPage)}
//                               aria-label={`Go to page ${pageNum}`}
//                             >
//                               {pageNum}
//                             </button>
//                           );
//                         } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
//                           return <span key={pageNum} className="text-gray-500 self-center">...</span>;
//                         }
//                         return null;
//                       }).filter(Boolean)}
//                     </div>
                    
//                     <button 
//                       onClick={() => handlePageChange(currentPage + 1)} 
//                       disabled={currentPage === totalPages} 
//                       className={buttonClass()}
//                       aria-label="Next Page"
//                     >
//                       Next &rarr;
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Top Experts Sidebar */}
//           <aside className="lg:col-span-1 order-2 lg:order-2">
//             <div className="sticky top-4">
//               {!loading && topExperts.length > 0 && (
//                 <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
//                   <h2 className={`text-2xl font-extrabold ${PRIMARY_COLOR} mb-5 flex items-center gap-2`}>
//                     <FaRegLightbulb className="w-6 h-6 ${ACCENT_COLOR} p-1 rounded-full"/>
//                     Top Insightful Experts
//                   </h2>
//                   <div className="space-y-4">
//                     {topExperts.map((expert) => {
//                       const profile = expertProfileMap[expert.expertName] || {
//                         username: null,
//                         profilePhoto: "/default.jpg",
//                         tagline: "No tagline available",
//                       };
//                       return <ExpertCard key={expert.expertName} expert={expert} profile={profile} openLightbox={openLightbox} />;
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </aside>
//         </main>
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import { app } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";
import { FaSearch, FaChevronDown, FaThumbsUp, FaThumbsDown, FaAward, FaUserCheck, FaRegLightbulb } from "react-icons/fa";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";

const db = getFirestore(app);
const PRIMARY_COLOR = "text-[#36013F]";
const ACCENT_COLOR = "bg-[#F4D35E]";
const LIGHT_ACCENT_COLOR = "bg-yellow-50";

const truncateByChars = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// Component for the Top Expert Card for reuse and cleaner JSX
const ExpertCard = ({ expert, profile, openLightbox }) => (
  <Link 
    href={profile.username ? `/experts/${profile.username}` : "#"} 
    className="flex items-start p-4 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 group relative"
    aria-label={`View profile for ${expert.expertName}`}
  >
    {/* Rank Badge */}
    <div className={`absolute top-0 right-0 p-1 rounded-bl-lg ${ACCENT_COLOR} text-[#36013F] font-bold text-xs flex items-center gap-1`}>
      <FaAward className="w-3 h-3"/>
      #{expert.rank}
    </div>

    {/* Profile Image */}
    <button
      onClick={(e) => { e.preventDefault(); openLightbox(profile.profilePhoto); }}
      className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-full border-3 border-[#36013F] ring-2 ring-[#F4D35E] mr-4 shadow-sm"
    >
      <Image
        src={profile.profilePhoto}
        alt={`${expert.expertName || "Expert"}'s profile photo`}
        fill
        sizes="64px"
        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
        onError={(e) => (e.target.src = "/default.jpg")}
      />
    </button>
    
    {/* Expert Info */}
    <div className="flex flex-col flex-grow min-w-0">
      <p className={`text-lg font-extrabold truncate ${PRIMARY_COLOR} group-hover:text-[#F4D35E] transition-colors`}>
        {expert.expertName}
      </p>
      <p className="text-sm text-gray-700 truncate mb-1">
        {truncateByChars(profile.tagline, 50)}
      </p>
      <div className="flex items-center text-xs text-gray-500 font-medium">
        <FaUserCheck className="w-3 h-3 mr-1" />
        <span className="font-bold">{expert.answerCount}</span> Answers
      </div>
    </div>
  </Link>
);


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

    // Convert answerGroups to arrays
    Object.keys(grouped).forEach((key) => {
      grouped[key].answerGroupsArray = Object.values(grouped[key].answerGroups).map((ag) => ({
        ...ag,
        minTimestamp: Math.min(...ag.timestamps),
        timestamp: new Date(Math.min(...ag.timestamps)).toLocaleDateString("en-GB") +
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

    // Real-time listener for questions
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
      // The real-time listener will update the state automatically
    } catch (error) {
      console.error(`Error updating ${action}:`, error.message);
      // Assuming toast is available, otherwise remove
      // toast.error(`Failed to update ${action}.`);
    }
  };

  // Reusable button styles for pagination and like/dislike
  const buttonClass = (isActive = false) => `
    px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 
    ${isActive 
      ? `bg-[#36013F] text-white shadow-md border border-[#36013F]` 
      : `bg-white ${PRIMARY_COLOR} border border-gray-300 hover:${ACCENT_COLOR} hover:text-[#36013F] hover:border-[#F4D35E]`}
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {isLightboxOpen && (
        <Lightbox
          mainSrc={selectedImage}
          onCloseRequest={() => setIsLightboxOpen(false)}
          imageTitle={selectedImage.includes("default.jpg") ? "Default Profile Image" : "Expert Profile Image"}
        />
      )}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header and Search Section */}
        <header className="text-center mb-16 pt-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold ${PRIMARY_COLOR} mb-3 tracking-tight">
          Already Answered Questions
          </h1>
          <p className="text-base sm:text-xl text-gray-700 max-w-3xl mx-auto">
            Explore questions already answered by our community of insightful experts.
          </p>
          <div className="relative w-full max-w-3xl mx-auto mt-10">
            <FaSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              type="text"
              placeholder="Search questions, answers, or experts..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-full bg-white shadow-lg focus:outline-none focus:ring-4 focus:ring-[#36013F]/20 focus:border-[#36013F] transition-all duration-300 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search FAQs"
            />
          </div>
        </header>

        {/* Main Content Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Questions/FAQ List */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            {/* Loading State */}
            {loading ? (
              <div className={`flex justify-center items-center gap-4 text-gray-600 p-12 rounded-xl border ${LIGHT_ACCENT_COLOR}`}>
                <svg className={`animate-spin h-8 w-8 ${PRIMARY_COLOR}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="text-xl font-bold">Fetching Community Wisdom...</span>
              </div>
            ) : 
            /* No Results State */
            paginatedGroups.length === 0 ? (
              <div className="text-center bg-white p-12 rounded-xl shadow-lg border border-gray-200">
                <p className="text-2xl font-extrabold text-gray-700 mb-2">🤷‍♂️ No Results Found</p>
                <p className="text-gray-500 text-lg">Try adjusting your search terms or ask a new question!</p>
              </div>
            ) : (
              /* Questions List */
              <div className="space-y-6">
                {paginatedGroups.map((group) => (
                  <details key={group.originalQuestion} className="group bg-white rounded-xl shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:shadow-xl hover:border-[#36013F]/50">
                    
                    {/* Question Summary (Header) */}
                    <summary className={`flex items-center justify-between p-6 cursor-pointer font-bold text-xl ${PRIMARY_COLOR} hover:${LIGHT_ACCENT_COLOR} transition-colors duration-200`}>
                      <span className="pr-4 leading-snug">{group.originalQuestion}</span>
                      <FaChevronDown className={`w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-180 group-open:${PRIMARY_COLOR}`} />
                    </summary>
                    
                    {/* Answer Details */}
                    <div className="p-6 border-t border-gray-200 space-y-8">
                      {group.answerGroupsArray.map((ag) => {
                        const expertsArray = Array.from(ag.experts);
                        const isSingleExpert = ag.experts.size === 1;
                        const singleExpertName = isSingleExpert ? expertsArray[0] : null;
                        const profile = isSingleExpert && singleExpertName ? (expertProfileMap[singleExpertName] || { username: null, profilePhoto: "/default.jpg", tagline: "No tagline available" }) : null;

                        return (
                          <div key={ag.reply} className="border-b border-gray-100 pb-4 last:border-b-0">
                            
                            {/* Answer Text */}
                            <p className="mb-5 text-gray-700 leading-relaxed whitespace-pre-wrap text-base border-l-4 border-[#F4D35E] pl-4 rounded-sm italic">
                              {ag.reply || "No answer available yet."}
                            </p>
                            
                            <div className="flex flex-wrap justify-between items-end gap-4">
                              
                              {/* Expert Info */}
                              <div className="flex items-center gap-3">
                                {isSingleExpert && profile && (
                                  <button onClick={() => openLightbox(profile.profilePhoto)} className="relative w-12 h-12 overflow-hidden rounded-full border-2 border-[#36013F] flex-shrink-0 shadow-sm transition-transform hover:scale-105">
                                    <Image src={profile.profilePhoto} alt={`${singleExpertName}'s profile photo`} fill sizes="48px" className="object-cover" onError={(e) => (e.target.src = "/default.jpg")} />
                                  </button>
                                )}
                                <div>
                                  {isSingleExpert ? (
                                    <>
                                      <span className="text-xs text-gray-500 block">Answered by</span>
                                      {profile && profile.username ? (
                                        <Link href={`/experts/${profile.username}`} className={`${PRIMARY_COLOR} font-extrabold hover:underline text-base`}>
                                          {singleExpertName}
                                        </Link>
                                      ) : (
                                        <p className={`font-bold text-gray-600 text-base`}>
                                          {singleExpertName || "Unknown Expert"}
                                        </p>
                                      )}
                                    </>
                                  ) : (
                                    <p className={`font-bold text-gray-600 text-base`}>
                                      Verified by {ag.experts.size}+ experts
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Timestamp */}
                              <p className="text-sm text-gray-500 self-end">{ag.timestamp}</p>
                            </div>
                            
                            {/* Like/Dislike Buttons */}
                            <div className="flex items-center gap-6 mt-4 pt-2 border-t border-dashed border-gray-100">
                              <button
                                onClick={() => handleLikeDislike(ag.ids, "like")}
                                className={`flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group/like ${PRIMARY_COLOR}`}
                                aria-label="Like this answer"
                              >
                                <FaThumbsUp className="w-5 h-5 group-hover/like:scale-110 transition-transform" /> 
                                <span className="font-semibold">{ag.totalLikes}</span>
                              </button>
                              <button
                                onClick={() => handleLikeDislike(ag.ids, "dislike")}
                                className={`flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors group/dislike ${PRIMARY_COLOR}`}
                                aria-label="Dislike this answer"
                              >
                                <FaThumbsDown className="w-5 h-5 group-hover/dislike:scale-110 transition-transform" /> 
                                <span className="font-semibold">{ag.totalDislikes}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-10">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)} 
                      disabled={currentPage === 1} 
                      className={buttonClass()}
                      aria-label="Previous Page"
                    >
                      &larr; Previous
                    </button>
                    
                    <div className="flex gap-1.5">
                      {/* Page Number Indicators (showing a simplified range) */}
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={buttonClass(pageNum === currentPage)}
                              aria-label={`Go to page ${pageNum}`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return <span key={pageNum} className="text-gray-500 self-center">...</span>;
                        }
                        return null;
                      }).filter(Boolean)}
                    </div>
                    
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      disabled={currentPage === totalPages} 
                      className={buttonClass()}
                      aria-label="Next Page"
                    >
                      Next &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Top Experts Sidebar */}
          <aside className="lg:col-span-1 order-2 lg:order-2">
            <div className="sticky top-4">
              {!loading && topExperts.length > 0 && (
                <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                  <h2 className={`text-2xl font-extrabold ${PRIMARY_COLOR} mb-5 flex items-center gap-2`}>
                    <FaRegLightbulb className="w-6 h-6 ${ACCENT_COLOR} p-1 rounded-full"/>
                    Top Insightful Experts
                  </h2>
                  <div className="space-y-4">
                    {topExperts.map((expert) => {
                      const profile = expertProfileMap[expert.expertName] || {
                        username: null,
                        profilePhoto: "/default.jpg",
                        tagline: "No tagline available",
                      };
                      return <ExpertCard key={expert.expertName} expert={expert} profile={profile} openLightbox={openLightbox} />;
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}