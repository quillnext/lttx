// // "use client";

// // import React, { useState, useEffect } from "react";
// // import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
// // import { app } from "@/lib/firebase";
// // import Link from "next/link";
// // import Image from "next/image";
// // import { FaSearch, FaChevronDown, FaTrophy } from "react-icons/fa";
// // import Lightbox from "react-image-lightbox";
// // import "react-image-lightbox/style.css";

// // const db = getFirestore(app);

// // const truncateByChars = (text, maxLength) => {
// //   if (!text) {
// //     return "";
// //   }
// //   if (text.length > maxLength) {
// //     return text.substring(0, maxLength) + "...";
// //   }
// //   return text;
// // };

// // export default function FAQPage() {
// //   const [questions, setQuestions] = useState([]);
// //   const [topExperts, setTopExperts] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [expertProfileMap, setExpertProfileMap] = useState({});
// //   const [isLightboxOpen, setIsLightboxOpen] = useState(false);
// //   const [selectedImage, setSelectedImage] = useState("");
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const itemsPerPage = 10;

// //   const openLightbox = (imageSrc) => {
// //     setSelectedImage(imageSrc);
// //     setIsLightboxOpen(true);
// //   };

// //   useEffect(() => {
// //     const fetchQuestionsAndUsernames = async () => {
// //       try {
// //         const q = query(
// //           collection(db, "Questions"),
// //           where("isPublic", "==", true),
// //           where("status", "==", "answered")
// //         );
// //         const querySnapshot = await getDocs(q);
// //         const questionList = querySnapshot.docs.map((docSnap) => {
// //           const data = docSnap.data();
// //           const rawDate = new Date(data.createdAt || Date.now());
// //           return {
// //             id: docSnap.id,
// //             ...data,
// //             timestamp:
// //               rawDate.toLocaleDateString("en-GB") +
// //               " " +
// //               rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
// //             rawTimestamp: rawDate.getTime(),
// //           };
// //         });

// //         const sortedQuestions = questionList.sort((a, b) => b.rawTimestamp - a.rawTimestamp);

// //         const answerCountMap = questionList.reduce((map, q) => {
// //           map[q.expertName] = (map[q.expertName] || 0) + 1;
// //           return map;
// //         }, {});

// //         const uniqueExpertNames = [...new Set(questionList.map((q) => q.expertName))].filter(Boolean);
// //         const profilePromises = uniqueExpertNames.map(async (expertName) => {
// //           const q = query(collection(db, "Profiles"), where("fullName", "==", expertName));
// //           const profileSnapshot = await getDocs(q);
// //           let username = null;
// //           let profilePhoto = null;
// //           let tagline = null;
// //           profileSnapshot.forEach((doc) => {
// //             username = doc.data().username;
// //             profilePhoto = doc.data().profilePhoto || doc.data().photo;
// //             tagline = doc.data().tagline || "No tagline available";
// //           });
// //           return { expertName, username, profilePhoto, tagline, answerCount: answerCountMap[expertName] || 0 };
// //         });

// //         const profileResults = await Promise.all(profilePromises);
// //         const newExpertProfileMap = profileResults.reduce((map, result) => {
// //           if (result.expertName) {
// //             map[result.expertName] = {
// //               username: result.username,
// //               profilePhoto: result.profilePhoto || "/default.jpg",
// //               tagline: result.tagline,
// //             };
// //           }
// //           return map;
// //         }, {});
        
// //         const topExpertsList = profileResults
// //           .sort((a, b) => b.answerCount - a.answerCount)
// //           .slice(0, 10)
// //           .map((expert, index) => ({ ...expert, rank: index + 1 }));

// //         setExpertProfileMap(newExpertProfileMap);
// //         setQuestions(sortedQuestions);
// //         setTopExperts(topExpertsList);
// //       } catch (error) {
// //         console.error("Error fetching data:", error.message);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchQuestionsAndUsernames();
// //   }, []);

// //   const filteredQuestions = questions.filter(
// //     (question) =>
// //       question.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //       question.reply?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //       question.expertName?.toLowerCase().includes(searchTerm.toLowerCase())
// //   );

// //   const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
// //   const paginatedQuestions = filteredQuestions.slice(
// //     (currentPage - 1) * itemsPerPage,
// //     currentPage * itemsPerPage
// //   );

// //   const handlePageChange = (newPage) => {
// //     if (newPage > 0 && newPage <= totalPages) {
// //       setCurrentPage(newPage);
// //     }
// //   };

// //   return (
// //     <div className="bg-gray-100 min-h-screen font-sans">
// //       {isLightboxOpen && (
// //         <Lightbox
// //           mainSrc={selectedImage}
// //           onCloseRequest={() => setIsLightboxOpen(false)}
// //           imageTitle={selectedImage.includes("default.jpg") ? "Default Profile Image" : "Expert Profile Image"}
// //         />
// //       )}
// //       <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
// //         <header className="text-center mb-12">
// //           <h1 className="text-4xl sm:text-5xl font-extrabold text-[#36013F] mb-3">
// //             Already Answered Questions
// //           </h1>
// //           <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
// //             Explore questions already answered by our community of insightful experts.
// //           </p>
// //           <div className="relative w-full max-w-2xl mx-auto mt-8">
// //             <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
// //             <input
// //               type="text"
// //               placeholder="Search questions, answers, or experts..."
// //               className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36013F] focus:border-transparent transition"
// //               value={searchTerm}
// //               onChange={(e) => setSearchTerm(e.target.value)}
// //               aria-label="Search FAQs"
// //             />
// //           </div>
// //         </header>

// //         <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
// //           <div className="lg:col-span-2 order-1 lg:order-2">
// //             {loading ? (
// //               <div className="flex justify-center items-center gap-3 text-gray-600 p-8">
// //                 <svg className="animate-spin h-6 w-6 text-[#36013F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// //                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
// //                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
// //                 </svg>
// //                 <span className="text-lg font-medium">Loading Insights...</span>
// //               </div>
// //             ) : paginatedQuestions.length === 0 ? (
// //               <div className="text-center bg-white p-8 rounded-lg shadow-sm border">
// //                 <p className="text-lg font-medium text-gray-700">No questions found.</p>
// //                 <p className="text-gray-500">Try adjusting your search or check back later.</p>
// //               </div>
// //             ) : (
// //               <div className="space-y-4">
// //                 {paginatedQuestions.map((q) => {
// //                   const profile = expertProfileMap[q.expertName] || { username: null, profilePhoto: "/default.jpg", tagline: "No tagline available" };
// //                   return (
// //                     <details key={q.id} className="group bg-white rounded-lg shadow-sm transition-all duration-300 overflow-hidden border border-gray-200 hover:shadow-lg hover:border-[#F4D35E]">
// //                       <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-[#36013F] hover:bg-gray-50">
// //                         <span className="text-lg pr-4">{q.question}</span>
// //                         <FaChevronDown className="w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-180 group-open:text-[#36013F]" />
// //                       </summary>
// //                       <div className="p-5 border-t border-gray-200">
// //                         <p className="mb-6 text-gray-700 leading-relaxed whitespace-pre-wrap">{q.reply || "No answer available yet."}</p>
// //                         <div className="flex flex-wrap justify-between items-center gap-4">
// //                           <div className="flex items-center gap-3">
// //                             <button onClick={() => openLightbox(profile.profilePhoto || '/default.jpg')} className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-[#F4D35E] flex-shrink-0">
// //                               <Image src={profile.profilePhoto || '/default.jpg'} alt={`${q.expertName || "Expert"}'s profile photo`} fill sizes="40px" className="object-cover" onError={(e) => (e.target.src = "/default.jpg")} />
// //                             </button>
// //                             <div>
// //                               <span className="text-sm text-gray-500">Answered by</span>
// //                               {profile.username ? (
// //                                 <Link href={`/experts/${profile.username}`} className="block text-[#36013F] font-bold hover:underline">{q.expertName}</Link>
// //                               ) : (
// //                                 <p className="font-bold text-gray-600">{q.expertName || "Unknown Expert"}</p>
// //                               )}
// //                             </div>
// //                           </div>
// //                           <p className="text-xs text-gray-500 self-end">{q.timestamp}</p>
// //                         </div>
// //                       </div>
// //                     </details>
// //                   );
// //                 })}
// //                 {totalPages > 1 && (
// //                   <div className="flex justify-center items-center gap-2 sm:gap-4 mt-8">
// //                     <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-white text-[#36013F] rounded-lg border border-[#36013F] font-semibold hover:bg-[#36013F] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
// //                       Previous
// //                     </button>
// //                     <span className="font-medium text-gray-700 text-sm sm:text-base">
// //                       Page {currentPage} of {totalPages}
// //                     </span>
// //                     <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-white text-[#36013F] rounded-lg border border-[#36013F] font-semibold hover:bg-[#36013F] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
// //                       Next
// //                     </button>
// //                   </div>
// //                 )}
// //               </div>
// //             )}
// //           </div>

// //           <aside className="lg:col-span-1 order-1 lg:order-2">
// //                    <div className="lg:col-span-1">
// //   {!loading && topExperts.length > 0 && (
// //     <div className="mb-8">
// //       <h2 className="text-2xl font-bold text-[#36013F] mb-4 md:ml-10">
// //         Top Insightful Experts
// //       </h2>

// //       <div className="space-y-4">
// //         {topExperts.map((expert) => {
// //           const profile =
// //             expertProfileMap[expert.expertName] || {
// //               username: null,
// //               profilePhoto: "/default.jpg",
// //               tagline: "No tagline available",
// //             };

// //           return (
// //             <div
// //               key={expert.expertName}
// //               className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-primary hover:shadow-md transition-shadow  w-full md:w-[80%] mx-auto"
// //             >
// //               {/* Profile Image */}
// //               <button
// //                 onClick={() => openLightbox(profile.profilePhoto)}
// //                 className="relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#36013F]"
// //               >
// //                 <Image
// //                   src={profile.profilePhoto}
// //                   alt={`${expert.expertName || "Expert"}'s profile photo`}
// //                   fill
// //                   sizes="56px"
// //                   className="object-cover object-center"
// //                   onError={(e) => (e.target.src = "/default.jpg")}
// //                 />
// //               </button>

// //               {/* Text Section */}
// //               <div className="flex flex-col">
// //                  {profile.username && (
// //                   <Link
// //                     href={`/experts/${profile.username}`}
// //                     className="text-xs text-blue-600 hover:underline mt-1"
// //                   >
// //                  <p className="text-sm font-semibold text-[#36013F]">
// //                  {expert.expertName}
// //                 </p>
// //                   </Link>
// //                 )}
// //                 <p className="text-xs text-gray-600">{truncateByChars(profile.tagline, 50)}</p>
// //                 <p className="text-xs text-gray-500">{expert.answerCount} Answers</p>
               
// //               </div>
// //             </div>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   )}
// // </div>
// //           </aside>
// //         </main>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import React, { useState, useEffect } from "react";
// import { getFirestore, collection, getDocs, query, where, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
// import { app } from "@/lib/firebase";
// import Link from "next/link";
// import Image from "next/image";
// import { FaSearch, FaChevronDown, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
// import Lightbox from "react-image-lightbox";
// import "react-image-lightbox/style.css";

// const db = getFirestore(app);

// const truncateByChars = (text, maxLength) => {
//   if (!text) return "";
//   return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
// };

// export default function FAQPage() {
//   const [questions, setQuestions] = useState([]);
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

//         const sortedQuestions = questionList.sort((a, b) => b.rawTimestamp - a.rawTimestamp);

//         const answerCountMap = questionList.reduce((map, q) => {
//           map[q.expertName] = (map[q.expertName] || 0) + 1;
//           return map;
//         }, {});

//         const uniqueExpertNames = [...new Set(questionList.map((q) => q.expertName))].filter(Boolean);
//         const profilePromises = uniqueExpertNames.map(async (expertName) => {
//           const q = query(collection(db, "Profiles"), where("fullName", "==", expertName));
//           const profileSnapshot = await getDocs(q);
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
//         setQuestions(sortedQuestions);
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
//       const sortedQuestions = questionList.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
//       setQuestions(sortedQuestions);
//     }, (error) => {
//       console.error("Error with real-time listener:", error.message);
//     });

//     fetchQuestionsAndUsernames();
//     return () => unsubscribe();
//   }, []);

//   const filteredQuestions = questions.filter(
//     (question) =>
//       question.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       question.reply?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       question.expertName?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
//   const paginatedQuestions = filteredQuestions.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const handlePageChange = (newPage) => {
//     if (newPage > 0 && newPage <= totalPages) setCurrentPage(newPage);
//   };

//   const handleLikeDislike = async (questionId, action) => {
//     try {
//       const questionRef = doc(db, "Questions", questionId);
//       await updateDoc(questionRef, {
//         [action === "like" ? "likes" : "dislikes"]: increment(1),
//       });
//       // The real-time listener will update the state automatically
//     } catch (error) {
//       console.error(`Error updating ${action}:`, error.message);
//       toast.error(`Failed to update ${action}.`);
//     }
//   };

//   return (
//     <div className="bg-gray-100 min-h-screen font-sans">
//       {isLightboxOpen && (
//         <Lightbox
//           mainSrc={selectedImage}
//           onCloseRequest={() => setIsLightboxOpen(false)}
//           imageTitle={selectedImage.includes("default.jpg") ? "Default Profile Image" : "Expert Profile Image"}
//         />
//       )}
//       <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
//         <header className="text-center mb-12">
//           <h1 className="text-4xl sm:text-5xl font-extrabold text-[#36013F] mb-3">
//             Already Answered Questions
//           </h1>
//           <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
//             Explore questions already answered by our community of insightful experts.
//           </p>
//           <div className="relative w-full max-w-2xl mx-auto mt-8">
//             <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search questions, answers, or experts..."
//               className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36013F] focus:border-transparent transition"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               aria-label="Search FAQs"
//             />
//           </div>
//         </header>

//         <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
//           <div className="lg:col-span-2 order-1 lg:order-2">
//             {loading ? (
//               <div className="flex justify-center items-center gap-3 text-gray-600 p-8">
//                 <svg className="animate-spin h-6 w-6 text-[#36013F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
//                 </svg>
//                 <span className="text-lg font-medium">Loading Insights...</span>
//               </div>
//             ) : paginatedQuestions.length === 0 ? (
//               <div className="text-center bg-white p-8 rounded-lg shadow-sm border">
//                 <p className="text-lg font-medium text-gray-700">No questions found.</p>
//                 <p className="text-gray-500">Try adjusting your search or check back later.</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {paginatedQuestions.map((q) => {
//                   const profile = expertProfileMap[q.expertName] || { username: null, profilePhoto: "/default.jpg", tagline: "No tagline available" };
//                   const likes = q.likes || 0;
//                   const dislikes = q.dislikes || 0;

//                   return (
//                     <details key={q.id} className="group bg-white rounded-lg shadow-sm transition-all duration-300 overflow-hidden border border-gray-200 hover:shadow-lg hover:border-[#F4D35E]">
//                       <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-[#36013F] hover:bg-gray-50">
//                         <span className="text-lg pr-4">{q.question}</span>
//                         <FaChevronDown className="w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-180 group-open:text-[#36013F]" />
//                       </summary>
//                       <div className="p-5 border-t border-gray-200">
//                         <p className="mb-6 text-gray-700 leading-relaxed whitespace-pre-wrap">{q.reply || "No answer available yet."}</p>
//                         <div className="flex flex-wrap justify-between items-center gap-4">
//                           <div className="flex items-center gap-3">
//                             <button onClick={() => openLightbox(profile.profilePhoto || '/default.jpg')} className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-[#F4D35E] flex-shrink-0">
//                               <Image src={profile.profilePhoto || '/default.jpg'} alt={`${q.expertName || "Expert"}'s profile photo`} fill sizes="40px" className="object-cover" onError={(e) => (e.target.src = "/default.jpg")} />
//                             </button>
//                             <div>
//                               <span className="text-sm text-gray-500">Answered by</span>
//                               {profile.username ? (
//                                 <Link href={`/experts/${profile.username}`} className="block text-[#36013F] font-bold hover:underline">{q.expertName}</Link>
//                               ) : (
//                                 <p className="font-bold text-gray-600">{q.expertName || "Unknown Expert"}</p>
//                               )}
//                             </div>
//                           </div>
//                           <p className="text-xs text-gray-500 self-end">{q.timestamp}</p>
//                         </div>
//                         {/* Like/Dislike Buttons */}
//                         <div className="flex items-center gap-4 mt-4">
//                           <button
//                             onClick={() => handleLikeDislike(q.id, "like")}
//                             className="flex items-center gap-2 text-[#36013F] hover:text-[#F4D35E] transition-colors"
//                           >
//                             <FaThumbsUp /> <span>{likes}</span>
//                           </button>
//                           <button
//                             onClick={() => handleLikeDislike(q.id, "dislike")}
//                             className="flex items-center gap-2 text-[#36013F] hover:text-[#F4D35E] transition-colors"
//                           >
//                             <FaThumbsDown /> <span>{dislikes}</span>
//                           </button>
//                         </div>
//                       </div>
//                     </details>
//                   );
//                 })}
//                 {totalPages > 1 && (
//                   <div className="flex justify-center items-center gap-2 sm:gap-4 mt-8">
//                     <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-white text-[#36013F] rounded-lg border border-[#36013F] font-semibold hover:bg-[#36013F] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
//                       Previous
//                     </button>
//                     <span className="font-medium text-gray-700 text-sm sm:text-base">
//                       Page {currentPage} of {totalPages}
//                     </span>
//                     <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-white text-[#36013F] rounded-lg border border-[#36013F] font-semibold hover:bg-[#36013F] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
//                       Next
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           <aside className="lg:col-span-1 order-1 lg:order-2">
//             {!loading && topExperts.length > 0 && (
//               <div className="mb-8">
//                 <h2 className="text-2xl font-bold text-[#36013F] mb-4 md:ml-10">
//                   Top Insightful Experts
//                 </h2>
//                 <div className="space-y-4">
//                   {topExperts.map((expert) => {
//                     const profile = expertProfileMap[expert.expertName] || {
//                       username: null,
//                       profilePhoto: "/default.jpg",
//                       tagline: "No tagline available",
//                     };
//                     return (
//                       <div
//                         key={expert.expertName}
//                         className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-primary hover:shadow-md transition-shadow w-full md:w-[80%] mx-auto"
//                       >
//                         <button
//                           onClick={() => openLightbox(profile.profilePhoto)}
//                           className="relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#36013F]"
//                         >
//                           <Image
//                             src={profile.profilePhoto}
//                             alt={`${expert.expertName || "Expert"}'s profile photo`}
//                             fill
//                             sizes="56px"
//                             className="object-cover object-center"
//                             onError={(e) => (e.target.src = "/default.jpg")}
//                           />
//                         </button>
//                         <div className="flex flex-col">
//                           {profile.username && (
//                             <Link
//                               href={`/experts/${profile.username}`}
//                               className="text-xs text-blue-600 hover:underline mt-1"
//                             >
//                               <p className="text-sm font-semibold text-[#36013F]">
//                                 {expert.expertName}
//                               </p>
//                             </Link>
//                           )}
//                           <p className="text-xs text-gray-600">{truncateByChars(profile.tagline, 50)}</p>
//                           <p className="text-xs text-gray-500">{expert.answerCount} Answers</p>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}
//           </aside>
//         </main>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getFirestore, doc, updateDoc, increment, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

const db = getFirestore(app);
const auth = getAuth(app);

export default function AskQuestionModal({ expert, onClose, initialQuestion }) {
  const [question, setQuestion] = useState(initialQuestion || "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [user, setUser] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [submittedQuestion, setSubmittedQuestion] = useState(null); // Store submitted question data

  // Load user details
  useEffect(() => {
    const savedData = localStorage.getItem("userFormData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      console.log("AskQuestionModal: Loaded from localStorage:", parsedData);
      setName(parsedData.name || "");
      setEmail(parsedData.email || "");
      setPhone(parsedData.phone || "");
      setHasSubmitted(true);
      setIsEmailVerified(true);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("AskQuestionModal: Auth user:", currentUser);
        setUser(currentUser);
        setName(currentUser.displayName || "");
        setEmail(currentUser.email || "");
        setPhone(currentUser.phoneNumber || "");
        setHasSubmitted(true);
        setIsEmailVerified(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update question
  useEffect(() => {
    console.log("AskQuestionModal: initialQuestion updated:", initialQuestion);
    setQuestion(initialQuestion || "");
  }, [initialQuestion]);

  // Clear on close
  useEffect(() => {
    return () => {
      console.log("AskQuestionModal: Cleaning up on close");
      setQuestion("");
      setOtp("");
      setErrors({});
      setIsOtpSent(false);
      setIsEmailVerified(false);
      setSubmittedQuestion(null);
    };
  }, []);

  // Reset OTP states on email change
  useEffect(() => {
    setIsOtpSent(false);
    setIsEmailVerified(false);
    setOtp("");
  }, [email]);

  // Real-time listener for submitted question
  useEffect(() => {
    if (submittedQuestion?.id) {
      const unsubscribe = onSnapshot(doc(db, "Questions", submittedQuestion.id), (docSnap) => {
        if (docSnap.exists()) {
          setSubmittedQuestion({ id: docSnap.id, ...docSnap.data() });
        }
      }, (error) => {
        console.error("Error with real-time listener:", error.message);
        toast.error("Failed to update question data.");
      });
      return () => unsubscribe();
    }
  }, [submittedQuestion?.id]);

  const validateForm = () => {
    const newErrors = {};
    if (!question.trim()) newErrors.question = "Question is required.";
    if (!(hasSubmitted || user)) {
      if (!name.trim()) newErrors.name = "Name is required.";
      if (!email.trim()) newErrors.email = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format.";
      if (!isEmailVerified) newErrors.email = "Please verify your email with OTP.";
      if (!phone.trim()) newErrors.phone = "Phone number is required.";
      else if (!/^\+?[1-9]\d{1,14}$/.test(phone)) newErrors.phone = "Invalid phone number.";
    }
    if (!expert?.id) newErrors.form = "Expert profile ID is missing.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmailPayload = (payload) => {
    const requiredFields = ["userEmail", "userName", "expertEmail", "expertName", "question", "userPhone"];
    const missingFields = requiredFields.filter((field) => !payload[field] || payload[field].trim() === "");
    return missingFields.length === 0 ? null : `Missing or empty fields: ${missingFields.join(", ")}`;
  };

  const handleSendOtp = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email first.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userName: name }),
      });
      if (response.ok) {
        setIsOtpSent(true);
        toast.success("OTP sent to your email!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Error sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (data.verified) {
        setIsEmailVerified(true);
        toast.success("Email verified successfully!");
      } else {
        toast.error(data.error || "Invalid or expired OTP.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Error verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleLikeDislike = async (questionId, action) => {
    try {
      const questionRef = doc(db, "Questions", questionId);
      await updateDoc(questionRef, {
        [action === "like" ? "likes" : "dislikes"]: increment(1),
      });
      // Real-time listener will update the state
    } catch (error) {
      console.error(`Error updating ${action}:`, error.message);
      toast.error(`Failed to update ${action}.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("AskQuestionModal: handleSubmit called:", { question, name, email, phone, expert });
    if (!validateForm()) {
      toast.error("Please fill out all required fields correctly.");
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "Questions"), {
        expertId: expert.id,
        expertName: expert.fullName || "Unknown Expert",
        expertEmail: expert.email || "no-email@placeholder.com",
        question,
        userName: name,
        userEmail: email,
        userPhone: phone,
        status: "pending",
        isPublic: false,
        createdAt: new Date().toISOString(),
        reply: null,
        likes: 0, // Initialize like count
        dislikes: 0, // Initialize dislike count
      });

      // Store submitted question for preview
      setSubmittedQuestion({
        id: docRef.id,
        question,
        expertName: expert.fullName || "Unknown Expert",
        likes: 0,
        dislikes: 0,
      });

      if (!hasSubmitted && !user) {
        const userData = { name, email, phone, purpose: "General Query" };
        console.log("AskQuestionModal: Saving user data to localStorage:", userData);
        localStorage.setItem("userFormData", JSON.stringify(userData));
        setHasSubmitted(true);
      }

      if (expert.email && expert.email.trim() && /\S+@\S+\.\S+/.test(expert.email)) {
        const emailPayload = {
          userEmail: email,
          userName: name,
          expertEmail: expert.email,
          expertName: expert.fullName || "Unknown Expert",
          question,
          userPhone: phone,
        };

        console.log("AskQuestionModal: Email payload:", emailPayload);

        const validationError = validateEmailPayload(emailPayload);
        if (validationError) {
          throw new Error(validationError);
        }

        const response = await fetch("/api/send-question-emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to send emails: ${errorData.error || "Unknown error"}`);
        }
      } else {
        console.warn("AskQuestionModal: Skipping email sending due to missing or invalid expert.email:", expert.email);
        toast.warn("Question submitted, but expert email is missing or invalid. Notification not sent to expert.");
      }

      setQuestion("");
      if (!hasSubmitted && !user) {
        setName("");
        setEmail("");
        setPhone("");
        setOtp("");
        setIsOtpSent(false);
        setIsEmailVerified(false);
      }
      setErrors({});
      setSuccess(true);
    } catch (error) {
      console.error("AskQuestionModal: Error submitting question:", error.message);
      toast.error(`Failed to submit question: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/30 via-gray-900/30 to-black/30 flex items-center justify-center z-50">
      <div className="bg-transparent backdrop-blur-lg rounded-2xl shadow-xl p-6 w-full max-w-lg relative border border-white/10 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-xl font-bold"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold bg-clip-text text-white">
          Ask a Question to {expert?.fullName || "Expert"}
        </h2>
        {success && submittedQuestion ? (
          <div className="space-y-4">
            <p className="text-green-400 text-center font-medium text-lg animate-pulse">
              Question submitted successfully!
            </p>
            {/* Preview of submitted question with like/dislike buttons */}
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-white font-semibold">{submittedQuestion.question}</p>
              <p className="text-sm text-white/70 mt-1">To: {submittedQuestion.expertName}</p>
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => handleLikeDislike(submittedQuestion.id, "like")}
                  className="flex items-center gap-2 text-white hover:text-[#F4D35E] transition-colors"
                >
                  <FaThumbsUp /> <span>{submittedQuestion.likes || 0}</span>
                </button>
                <button
                  onClick={() => handleLikeDislike(submittedQuestion.id, "dislike")}
                  className="flex items-center gap-2 text-white hover:text-[#F4D35E] transition-colors"
                >
                  <FaThumbsDown /> <span>{submittedQuestion.dislikes || 0}</span>
                </button>
              </div>
            </div>
            <p className="text-white/70 text-center text-sm">Closing in a few seconds...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Your Question
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className={`mt-0.5 p-2 w-full border rounded-xl bg-white/5 text-white placeholder-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
                  errors.question ? "border-red-500" : "border-white/20"
                }`}
                rows="5"
                placeholder="Type your question here..."
                required
              />
              {errors.question && (
                <p className="text-red-400 text-sm mt-2">{errors.question}</p>
              )}
            </div>
            {!(hasSubmitted || user) && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`p-2 w-full border rounded-xl bg-white/5 text-white placeholder-white/50 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 ${
                      errors.name ? "border-red-500" : "border-white/20"
                    }`}
                    placeholder="Enter your name"
                    required
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-2">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`p-2 flex-grow border rounded-xl bg-white/5 text-white placeholder-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
                        errors.email ? "border-red-500" : "border-white/20"
                      }`}
                      placeholder="Enter your email"
                      required
                    />
                    {!isOtpSent && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-indigo-600"
                        disabled={loading}
                      >
                        Send OTP
                      </button>
                    )}
                  </div>
                  {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email}</p>}
                  {isOtpSent && !isEmailVerified && (
                    <div className="mt-2 flex items-center space-x-2">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="p-2 flex-grow border rounded-xl bg-white/5 text-white placeholder-white/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 border-white/20"
                        placeholder="Enter OTP"
                        maxLength={6}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="bg-green-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-green-600"
                        disabled={loading}
                      >
                        Verify
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Phone Number
                  </label>
                  <PhoneInput
                    country={"in"}
                    value={phone}
                    onChange={(phone) => setPhone(`+${phone}`)}
                    placeholder="Enter phone number"
                    inputProps={{
                      id: "phone",
                      className: `w-full p-2 border rounded-xl bg-white/5 text-white placeholder-white/50 focus:ring-2 focus:ring-primary focus:border-transparent pl-12 transition-all duration-300 ${
                        errors.phone ? "border-red-500" : "border-white/20"
                      }`,
                      required: true,
                    }}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-sm mt-2">{errors.phone}</p>
                  )}
                </div>
              </>
            )}
            {errors.form && (
              <p className="text-red-400 text-sm mt-2">{errors.form}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-primary to-secondary text-white p-2 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Submitting..." : "Submit Question"}
            </button>
          </form>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
}