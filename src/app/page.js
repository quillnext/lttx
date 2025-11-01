// "use client";

// import { useState, useEffect } from "react";
// import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
// import { app } from "@/lib/firebase";
// import { useRouter, useSearchParams } from "next/navigation";
// import Image from "next/image";
// import { FaSearch, FaChevronDown, FaTrophy } from "react-icons/fa";
// import Link from "next/link";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Lightbox from "react-image-lightbox";
// import "react-image-lightbox/style.css";
// import Footer from "./pages/Footer";
// import QuestionSearchPage from "@/app/components/QuestionSearchPage";

// const db = getFirestore(app);

// const truncateByChars = (text, maxLength) => {
//   if (!text) return "";
//   if (text.length > maxLength) return text.substring(0, maxLength) + "...";
//   return text;
// };

// const toSlug = (text) => {
//   return text
//     .toLowerCase()
//     .replace(/[^a-z0-9\s]/g, '')
//     .trim()
//     .replace(/\s+/g, '-')
//     .replace(/-+/g, '-');
// };

// export default function Home() {
//   const searchParams = useSearchParams();
//   const searchTerm = searchParams.get("search") || "";

//   if (searchTerm) {
//     return <QuestionSearchPage />;
//   }

//   const stepConfig = {
//     1: { 
//       key: 'service',
//       placeholder: "What help are you seeking?",
//       instruction: "Step 1: Select a service type.",
//       suggestions: ['Visa & Documentation', 'Flights & Air Travel', 'Hotels / Stays / Villas', 'Cruises', 'Trains / Local Transport', 'Tours & Sightseeing', 'Food & Dining Recommendations', 'Shopping & Local Experiences', 'Offbeat Experiences', 'Complete Travel Planning']
//     },
//     2: { 
//       key: 'destination',
//       placeholder: "Enter your destination", 
//       instruction: "Step 2: Where do you want to travel?",
//       suggestions: ['India', 'Japan', 'France', 'Paris', 'Tokyo', 'Jaipur', 'Rajasthan', 'Bali', 'Tuscany', 'Europe tour', 'Southeast Asia', 'Not decided yet']
//     },
//     3: { 
//       key: 'travel_type',
//       placeholder: "Enter the theme of your travel", 
//       instruction: "Step 3: What is the theme of your travel?", 
//       suggestions: ['Honeymoon / Romantic', 'Family', 'Friends / Group Travel', 'Solo Travel', 'Adventure & Trekking', 'Wellness & Retreats', 'Spiritual / Pilgrimage', 'Luxury & Premium Travel', 'Business / MICE', 'Budget / Backpacking', 'Educational / Student Tours', 'Senior Citizen Travel']
//     },
//     4: {
//       key: 'consultation_nature',
//       placeholder: "What level of guidance do you need?",
//       instruction: "Step 4: Select the nature of your consultation.",
//       suggestions: ['Quick Tip / Advice', 'Detailed Itinerary Planning', 'Cost Estimate / Budget Guidance', 'Destination Research / Where to Go', 'Local Expert for On-ground Insights', 'Emergency / Last-minute Queries']
//     },
//     5: {
//       key: 'when',
//       placeholder: "When are you planning your trip? (Optional)",
//       instruction: "Optional: When are you planning? (Press Enter to skip)",
//       suggestions: ['Next week', 'Next month', 'In 3 months', 'Specific dates (e.g., 2025-09-01 to 2025-09-10)', 'Not decided yet']
//     },
//     6: {
//       key: 'people',
//       placeholder: "How many people? (Optional)",
//       instruction: "Optional: How many people are traveling? (Press Enter to skip)",
//       suggestions: ['Solo', 'Couple', 'Family of 3', 'Family of 4', 'Group of 5+', '2 adults, 1 child', 'Not decided']
//     }
//   };

//   const [currentStep, setCurrentStep] = useState(1);
//   const [searchData, setSearchData] = useState({
//     service: null,
//     destination: null,
//     travel_type: null,
//     consultation_nature: null,
//     when: null,
//     people: null
//   });
//   const [inputValue, setInputValue] = useState('');
//   const [filteredSuggestions, setFilteredSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();
//   const [showFaq, setShowFaq] = useState(false);
//   const [questions, setQuestions] = useState([]);
//   const [topExperts, setTopExperts] = useState([]);
//   const [loadingFaq, setLoadingFaq] = useState(true);
//   const [searchTermFaq, setSearchTermFaq] = useState("");
//   const [expertProfileMap, setExpertProfileMap] = useState({});
//   const [isLightboxOpen, setIsLightboxOpen] = useState(false);
//   const [selectedImage, setSelectedImage] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const normalizeText = (text) => {
//     if (!text || typeof text !== "string") return "";
//     return text
//       .toLowerCase()
//       .replace(/[^a-z0-9\s]/g, " ")
//       .replace(/\s+/g, " ")
//       .trim();
//   };

//   const handleInputChange = (e) => {
//     setInputValue(e.target.value);
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       const val = inputValue.trim();
//       if (val === '' && currentStep > 4) {
//         if (currentStep < 6) {
//           setCurrentStep(currentStep + 1);
//         } else {
//           setCurrentStep(7);
//         }
//       } else if (val !== '') {
//         processInput(val);
//       }
//     }
//   };

//   const processInput = (value) => {
//     const config = stepConfig[currentStep];
//     if (config) {
//       setSearchData((prev) => ({ ...prev, [config.key]: value }));
//       setInputValue('');
//       if (currentStep < 6) {
//         setCurrentStep(currentStep + 1);
//       } else {
//         setCurrentStep(7);
//       }
//     }
//   };

//   const handleRemoveTag = (key) => {
//     setSearchData((prev) => ({ ...prev, [key]: null }));
//     const step = Object.keys(stepConfig).find((s) => stepConfig[s].key === key);
//     if (step) {
//       setCurrentStep(parseInt(step));
//     }
//     setInputValue('');
//   };

//   const handleReset = () => {
//     setCurrentStep(1);
//     setSearchData({
//       service: null,
//       destination: null,
//       travel_type: null,
//       consultation_nature: null,
//       when: null,
//       people: null
//     });
//     setInputValue('');
//   };

//   const isComplete = () => {
//     return searchData.service && searchData.destination && searchData.travel_type && searchData.consultation_nature;
//   };

//   const handleAskExpert = async () => {
//     if (!isComplete()) {
//       toast.error("Please complete at least the first four steps.");
//       return;
//     }
//     setLoading(true);
//     try {
//       // Use exact values from searchData as keywords
//       const keywords = Object.values(searchData).filter(Boolean);
//       const allInputs = keywords.join(' ');
//       router.push(`/ask-an-expert?keywords=${encodeURIComponent(keywords.join(","))}&question=${encodeURIComponent(allInputs)}`);
//     } catch (error) {
//       console.error("Home: Search error:", error);
//       toast.error("Search failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openLightbox = (imageSrc) => {
//     setSelectedImage(imageSrc);
//     setIsLightboxOpen(true);
//   };

//   const handlePageChange = (newPage) => {
//     if (newPage > 0 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//     }
//   };

//   useEffect(() => {
//     const config = stepConfig[currentStep];
//     if (config && inputValue && currentStep <= 6 && !searchData[config.key]) {
//       const filt = config.suggestions.filter((s) =>
//         normalizeText(s).includes(normalizeText(inputValue))
//       );
//       setFilteredSuggestions(filt);
//       setShowSuggestions(filt.length > 0);
//     } else {
//       setShowSuggestions(false);
//     }
//   }, [inputValue, currentStep]);

//   useEffect(() => {
//     const fetchQuestionsAndUsernames = async () => {
//       setLoadingFaq(true);
//       try {
//         const q = query(collection(db, "Questions"), where("isPublic", "==", true), where("status", "==", "answered"));
//         const querySnapshot = await getDocs(q);
//         const questionList = querySnapshot.docs.map((docSnap) => {
//           const data = docSnap.data();
//           const rawDate = new Date(data.createdAt || Date.now());
//           return {
//             id: docSnap.id, ...data,
//             timestamp: rawDate.toLocaleDateString("en-GB") + " " + rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
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
//             map[result.expertName] = { username: result.username, profilePhoto: result.profilePhoto || "/default.jpg", tagline: result.tagline };
//           }
//           return map;
//         }, {});
//         const topExpertsList = profileResults
//           .filter(expert => {
//             const searchableFields = [
//               normalizeText(expert.expertName || ""),
//               normalizeText(expert.tagline || ""),
//               normalizeText(expert.username || ""),
//             ].join(" ");
//             const allInputs = Object.values(searchData).filter(Boolean).join(' ');
//             const keywords = Object.values(searchData).filter(Boolean); // Use exact searchData values
//             if (keywords.length === 0) return true; // Show all experts if no keywords
//             const matchCount = keywords.reduce((count, keyword) => {
//               return count + (searchableFields.includes(normalizeText(keyword)) ? 1 : 0);
//             }, 0);
//             const matchPercentage = keywords.length > 0 ? (matchCount / keywords.length) * 100 : 0;
//             return matchPercentage >= 60;
//           })
//           .sort((a, b) => b.answerCount - a.answerCount)
//           .slice(0, 10)
//           .map((expert, index) => ({ ...expert, rank: index + 1 }));
//         setExpertProfileMap(newExpertProfileMap);
//         setQuestions(sortedQuestions);
//         setTopExperts(topExpertsList);
//       } catch (error) {
//         console.error("Error fetching data:", error.message);
//         toast.error("Failed to load FAQ content.");
//       } finally {
//         setLoadingFaq(false);
//       }
//     };
//     if (showFaq) {
//       fetchQuestionsAndUsernames();
//     }
//   }, [showFaq, searchData]);

//   const filteredQuestions = searchTermFaq
//     ? questions.filter(
//         (question) =>
//           question.question?.toLowerCase().includes(searchTermFaq.toLowerCase()) ||
//           question.reply?.toLowerCase().includes(searchTermFaq.toLowerCase()) ||
//           question.expertName?.toLowerCase().includes(searchTermFaq.toLowerCase())
//       )
//     : questions;
//   const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
//   const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

//   return (
//     <div className="relative min-h-screen overflow-hidden">
//       <style jsx global>{`
//         :root { --primary: #36013f; --secondary: #f4d35e; }
//         @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
//         .animate-gradientShift { background-size: 400% 400%; animation: gradientShift 15s ease infinite; }
//         @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
//         .animate-fadeIn { animation: fadeIn 1s ease-in-out; }
//         .tags-container::-webkit-scrollbar { display: none; }
//         .tags-container { scrollbar-width: none; }
//       `}</style>

//       <div className={`min-h-screen flex flex-col justify-between text-white bg-gradient-to-br from-[#F4D35E] to-[#36013F] animate-gradientShift ${showFaq ? 'hidden' : 'block'}`}>
//         <header className="w-full px-6 py-4 text-sm z-10">
//           <nav className="flex flex-col sm:flex-row sm:justify-between items-center gap-2">
//             <div className="flex flex-wrap justify-center gap-2">
//               <Link href="/" className="p-2">Home</Link>
//               <Link href="/about" className="p-2">About</Link>
//               <Link href="/about#why-us" className="p-2">Why us</Link>
//             </div>
//             <div className="flex flex-wrap justify-center gap-4">
//               <Link href="/about#features" className="p-2">Features</Link>
//               <Link href="/about#joining-process" className="p-2">Joining Process</Link>
//               <Link href="/expert-login" className="p-2">Login</Link>
//             </div>
//           </nav>
//         </header>

//         <main className="flex-grow flex items-center justify-center relative px-4">
//           <div className="bg-opacity-80 rounded-3xl shadow-xl p-8 w-full max-w-2xl flex flex-col items-center gap-6 animate-fadeIn">
//             <Image src="https://www.xmytravel.com/logolttx.svg" alt="XmyTravel Logo" width={192} height={48} className="w-36 md:w-48 drop-shadow-lg brightness-110"/>
//             <h1 className="text-2xl md:text-3xl font-semibold text-center">Planning travel? Ask your question here.</h1>
//             <div className="w-full relative">
//               <div className="relative w-full">
//                 <input
//                   type="text"
//                   value={inputValue}
//                   onChange={handleInputChange}
//                   onKeyDown={handleKeyDown}
//                   placeholder={stepConfig[currentStep]?.placeholder || 'All set! Click Ask Expert.'}
//                   className="w-full pl-12 pr-5 py-3 rounded-full bg-transparent bg-opacity-30 border border-opacity-20 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
//                 />
//                 <FaSearch className="h-5 w-5 text-white absolute left-4 top-1/2 transform -translate-y-1/2 opacity-70" />
//                 {showSuggestions && (
//                   <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg z-10 text-black max-h-60 overflow-y-auto">
//                     {filteredSuggestions.map((s, i) => (
//                       <div
//                         key={i}
//                         onClick={() => processInput(s)}
//                         className="p-2 cursor-pointer hover:bg-gray-100"
//                       >
//                         {s}
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//               <div className="flex flex-wrap gap-2 mt-2 tags-container overflow-x-auto">
//                 {Object.entries(searchData).map(([key, value]) => {
//                   if (value) {
//                     const emojiMap = {
//                       service: '📋',
//                       destination: '📍',
//                       travel_type: '✈️',
//                       consultation_nature: '💡',
//                       when: '📅',
//                       people: '👥'
//                     };
//                     const emoji = emojiMap[key];
//                     return (
//                       <div
//                         key={key}
//                         className="flex items-center bg-white bg-opacity-50 text-black px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0"
//                       >
//                         <span className="mr-1">{emoji}</span>
//                         <span>{truncateByChars(value, 15)}</span>
//                         <button onClick={() => handleRemoveTag(key)} className="ml-1 font-bold text-gray-800 hover:text-black">
//                           &times;
//                         </button>
//                       </div>
//                     );
//                   }
//                   return null;
//                 })}
//               </div>
//             </div>
//             <p className="text text-center text-white opacity-80 text-sm">
//               {stepConfig[currentStep]?.instruction || 'All set! Click Ask Expert or add optionals.'}
//             </p>
//             <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
//               <button
//                 onClick={handleAskExpert}
//                 disabled={loading || !isComplete()}
//                 className={`bg-[var(--secondary)] text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition ${loading || !isComplete() ? "opacity-50 cursor-not-allowed" : ""}`}
//               >
//                 Ask Expert
//               </button>
//               <button
//                 onClick={handleReset}
//                 className="bg-white text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition"
//               >
//                 Reset
//               </button>
//             </div>
//           </div>
//         </main>

//         <footer className="bg-transparent text-center text-sm text-white text-opacity-60 py-6 px-4">
//           <button
//             onClick={() => setShowFaq(true)}
//             className="hover:underline font-semibold text-base"
//           >
//             View Already Answered Questions (AAQ)
//           </button>
//         </footer>
//       </div>

//       <div className={`absolute inset-0 z-50 transform transition-transform duration-700 ease-in-out bg-gray-100 ${showFaq ? 'translate-y-0' : 'translate-y-full'}`}>
//         <div className="h-full overflow-y-auto font-sans">
//           {isLightboxOpen && (
//             <Lightbox
//               mainSrc={selectedImage}
//               onCloseRequest={() => setIsLightboxOpen(false)}
//               imageTitle={selectedImage.includes("default.jpg") ? "Default Profile Image" : "Expert Profile Image"}
//             />
//           )}
//           <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
//             <button
//               onClick={() => setShowFaq(false)}
//               className="mb-6 flex items-center gap-2 font-semibold text-[#36013F] hover:text-opacity-80 transition-colors sticky top-0 py-2 bg-gray-100 w-full z-10"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5"
//                 viewBox="0 0 20 20"
//                 fill="currentColor"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//               Back to Home
//             </button>

//             <header className="text-center mb-12">
//               <h1 className="text-4xl sm:text-5xl font-extrabold text-[#36013F] mb-3">
//                 Already Answered Questions
//               </h1>
//               <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
//                 Explore questions already answered by our community of insightful experts.
//               </p>
//               <form onSubmit={(e) => {
//                 e.preventDefault();
//                 if (searchTermFaq.trim()) {
//                   const slug = toSlug(searchTermFaq);
//                   router.push(`/faq/${slug}`);
//                 }
//               }} className="relative w-full max-w-2xl mx-auto mt-8">
//                 <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search questions, answers, or experts..."
//                   className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36013F] focus:border-transparent transition"
//                   value={searchTermFaq}
//                   onChange={(e) => setSearchTermFaq(e.target.value)}
//                   aria-label="Search FAQs"
//                 />
//                 <button type="submit" className="hidden">Search</button>
//               </form>
//             </header>
//             <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
//               <div className="lg:col-span-2 order-2 lg:order-1">
//                 {loadingFaq ? (
//                   <div className="flex justify-center items-center gap-3 text-gray-600 p-8">
//                     <svg
//                       className="animate-spin h-6 w-6 text-[#36013F]"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       />
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                       />
//                     </svg>
//                     <span className="text-lg font-medium">Loading Insights...</span>
//                   </div>
//                 ) : paginatedQuestions.length === 0 ? (
//                   <div className="text-center bg-white p-8 rounded-lg shadow-sm border">
//                     <p className="text-lg font-medium text-gray-700">No questions found.</p>
//                     <p className="text-gray-500">Try adjusting your search or check back later.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {paginatedQuestions.map((q) => {
//                       const profile = expertProfileMap[q.expertName] || {
//                         username: null,
//                         profilePhoto: "/default.jpg",
//                         tagline: "No tagline available",
//                       };
//                       return (
//                         <details
//                           key={q.id}
//                           className="group bg-white rounded-lg shadow-sm transition-all duration-300 overflow-hidden border border-gray-200 hover:shadow-lg hover:border-[#F4D35E]"
//                         >
//                           <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-[#36013F] hover:bg-gray-50">
//                             <span className="text-lg pr-4">{q.question}</span>
//                             <FaChevronDown className="w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-180 group-open:text-[#36013F]" />
//                           </summary>
//                           <div className="p-5 border-t border-gray-200">
//                             <p className="mb-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
//                               {q.reply || "No answer available yet."}
//                             </p>
//                             <div className="flex flex-wrap justify-between items-center gap-4">
//                               <div className="flex items-center gap-3">
//                                 <button
//                                   onClick={() => openLightbox(profile.profilePhoto || "/default.jpg")}
//                                   className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-[#F4D35E] flex-shrink-0"
//                                 >
//                                   <Image
//                                     src={profile.profilePhoto || "/default.jpg"}
//                                     alt={`${q.expertName || "Expert"}'s profile photo`}
//                                     fill
//                                     sizes="40px"
//                                     className="object-cover"
//                                     onError={(e) => (e.target.src = "/default.jpg")}
//                                   />
//                                 </button>
//                                 <div>
//                                   <span className="text-sm text-gray-500">Answered by</span>
//                                   {profile.username ? (
//                                     <Link
//                                       href={`/experts/${profile.username}`}
//                                       className="block text-[#36013F] font-bold hover:underline"
//                                     >
//                                       {q.expertName}
//                                     </Link>
//                                   ) : (
//                                     <p className="font-bold text-gray-600">{q.expertName || "Unknown Expert"}</p>
//                                   )}
//                                 </div>
//                               </div>
//                               <p className="text-xs text-gray-500 self-end">{q.timestamp}</p>
//                             </div>
//                           </div>
//                         </details>
//                       );
//                     })}
//                     {totalPages > 1 && (
//                       <div className="flex justify-center items-center gap-2 sm:gap-4 mt-8">
//                         <button
//                           onClick={() => handlePageChange(currentPage - 1)}
//                           disabled={currentPage === 1}
//                           className="px-4 py-2 bg-white text-[#36013F] rounded-lg border border-[#36013F] font-semibold hover:bg-[#36013F] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                           Previous
//                         </button>
//                         <span className="font-medium text-gray-700 text-sm sm:text-base">
//                           Page {currentPage} of {totalPages}
//                         </span>
//                         <button
//                           onClick={() => handlePageChange(currentPage + 1)}
//                           disabled={currentPage === totalPages}
//                           className="px-4 py-2 bg-white text-[#36013F] rounded-lg border border-[#36013F] font-semibold hover:bg-[#36013F] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                           Next
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//               <aside className="lg:col-span-1 order-1 lg:order-2">
//                 <div className="sticky top-20">
//                   {!loadingFaq && topExperts.length > 0 && (
//                     <div className="mb-8">
//                       <h2 className="text-2xl font-bold text-[#36013F] mb-4 md:ml-10">
//                         Top Insightful Experts
//                       </h2>
//                       <div className="space-y-4">
//                         {topExperts.map((expert) => {
//                           const profile = expertProfileMap[expert.expertName] || {
//                             username: null,
//                             profilePhoto: "/default.jpg",
//                             tagline: "No tagline available",
//                           };
//                           return (
//                             <div
//                               key={expert.expertName}
//                               className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-primary hover:shadow-md transition-shadow w-full md:w-[80%] mx-auto"
//                             >
//                               <button
//                                 onClick={() => openLightbox(profile.profilePhoto)}
//                                 className="relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#36013F]"
//                               >
//                                 <Image
//                                   src={profile.profilePhoto}
//                                   alt={`${expert.expertName || "Expert"}'s profile photo`}
//                                   fill
//                                   sizes="56px"
//                                   className="object-cover object-center"
//                                   onError={(e) => (e.target.src = "/default.jpg")}
//                                 />
//                               </button>
//                               <div className="flex flex-col">
//                                 {profile.username && (
//                                   <Link
//                                     href={`/experts/${profile.username}`}
//                                     className="text-xs text-blue-600 hover:underline mt-1"
//                                   >
//                                     <p className="text-sm font-semibold text-[#36013F]">
//                                       {expert.expertName}
//                                     </p>
//                                   </Link>
//                                 )}
//                                 <p className="text-xs text-gray-600">{truncateByChars(profile.tagline, 50)}</p>
//                                 <p className="text-xs text-gray-500">{expert.answerCount} Answers</p>
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </aside>
//             </main>

//             <div className="text-center mt-8">
//               <Link href="/faq" className="text-[#36013F] font-semibold hover:underline">
//                 View all Questions
//               </Link>
//             </div>
//           </div>
//           <Footer />
//         </div>
//       </div>
//       <ToastContainer position="top-right" autoClose={3000} />
//     </div>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { FaSearch, FaChevronDown, FaTrophy } from "react-icons/fa";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import Footer from "./pages/Footer";
import QuestionSearchPage from "@/app/components/QuestionSearchPage";
import React from "react"; // Added React import for Fragments

const db = getFirestore(app);

const truncateByChars = (text, maxLength) => {
  if (!text) return "";
  if (text.length > maxLength) return text.substring(0, maxLength) + "...";
  return text;
};

const toSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export default function Home() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  if (searchTerm) {
    return <QuestionSearchPage />;
  }

  const stepConfig = {
    1: {
      key: "service",
      placeholder: "What help are you seeking?",
      instruction: "Step 1: Select a service type.",
      suggestions: [
        "Visa & Documentation",
        "Flights & Air Travel",
        "Hotels / Stays / Villas",
        "Cruises",
        "Trains / Local Transport",
        "Tours & Sightseeing",
        "Food & Dining Recommendations",
        "Shopping & Local Experiences",
        "Offbeat Experiences",
        "Complete Travel Planning",
      ],
    },
    2: {
      key: "destination",
      placeholder: "Enter your destination",
      instruction: "Step 2: Where do you want to travel?",
      suggestions: [
        "India",
        "Japan",
        "France",
        "Paris",
        "Tokyo",
        "Jaipur",
        "Rajasthan",
        "Bali",
        "Tuscany",
        "Europe tour",
        "Southeast Asia",
        "Not decided yet",
      ],
    },
    3: {
      key: "travel_type",
      placeholder: "Enter the theme of your travel",
      instruction: "Step 3: What is the theme of your travel?",
      suggestions: [
        "Honeymoon / Romantic",
        "Family",
        "Friends / Group Travel",
        "Solo Travel",
        "Adventure & Trekking",
        "Wellness & Retreats",
        "Spiritual / Pilgrimage",
        "Luxury & Premium Travel",
        "Business / MICE",
        "Budget / Backpacking",
        "Educational / Student Tours",
        "Senior Citizen Travel",
      ],
    },
    4: {
      key: "consultation_nature",
      placeholder: "What level of guidance do you need?",
      instruction: "Step 4: Select the nature of your consultation.",
      suggestions: [
        "Quick Tip / Advice",
        "Detailed Itinerary Planning",
        "Cost Estimate / Budget Guidance",
        "Destination Research / Where to Go",
        "Local Expert for On-ground Insights",
        "Emergency / Last-minute Queries",
      ],
    },
    5: {
      key: "when",
      placeholder: "When are you planning your trip? (Optional)",
      instruction: "Optional: When are you planning? (Press Enter to skip)",
      suggestions: [
        "Next week",
        "Next month",
        "In 3 months",
        "Specific dates (e.g., 2025-09-01 to 2025-09-10)",
        "Not decided yet",
      ],
    },
    6: {
      key: "people",
      placeholder: "How many people? (Optional)",
      instruction: "Optional: How many people are traveling? (Press Enter to skip)",
      suggestions: ["Solo", "Couple", "Family of 3", "Family of 4", "Group of 5+", "2 adults, 1 child", "Not decided"],
    },
  };

  const progressSteps = [
    { name: "Service", key: "service" },
    { name: "Destination", key: "destination" },
    { name: "Theme", key: "travel_type" },
    { name: "Guidance", key: "consultation_nature" },
    { name: "Optional", key: "when" }, // Grouping optional steps under one final indicator
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [searchData, setSearchData] = useState({
    service: null,
    destination: null,
    travel_type: null,
    consultation_nature: null,
    when: null,
    people: null,
  });
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showFaq, setShowFaq] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [topExperts, setTopExperts] = useState([]);
  const [loadingFaq, setLoadingFaq] = useState(true);
  const [searchTermFaq, setSearchTermFaq] = useState("");
  const [expertProfileMap, setExpertProfileMap] = useState({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getStepStatus = (stepKey, stepIndex) => {
    // Required steps are 1-4 (Service, Destination, Theme, Guidance)
    if (stepIndex < 4) {
      if (stepIndex + 1 === currentStep) return "active"; // Current step
      if (currentStep > stepIndex + 1) return "completed"; // Passed step
    }
    // Optional step (index 4 covers steps 5 and 6)
    if (stepIndex === 4) {
      if (currentStep === 5 || currentStep === 6) return "active";
      if (currentStep > 6) return "completed";
    }
    return "upcoming"; // Not yet reached
  };

  const normalizeText = (text) => {
    if (!text || typeof text !== "string") return "";
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = inputValue.trim();
      if (val === "" && currentStep > 4) {
        if (currentStep < 6) {
          setCurrentStep(currentStep + 1);
        } else {
          setCurrentStep(7);
        }
      } else if (val !== "") {
        processInput(val);
      }
    }
  };

  const processInput = (value) => {
    const config = stepConfig[currentStep];
    if (config) {
      setSearchData((prev) => ({ ...prev, [config.key]: value }));
      setInputValue("");
      if (currentStep < 6) {
        setCurrentStep(currentStep + 1);
      } else {
        setCurrentStep(7);
      }
    }
  };

  const handleRemoveTag = (key) => {
    setSearchData((prev) => ({ ...prev, [key]: null }));
    const step = Object.keys(stepConfig).find((s) => stepConfig[s].key === key);
    if (step) {
      setCurrentStep(parseInt(step));
    }
    setInputValue("");
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSearchData({
      service: null,
      destination: null,
      travel_type: null,
      consultation_nature: null,
      when: null,
      people: null,
    });
    setInputValue("");
  };

  const isComplete = () => {
    return searchData.service && searchData.destination && searchData.travel_type && searchData.consultation_nature;
  };

  const handleAskExpert = async () => {
    if (!isComplete()) {
      toast.error("Please complete at least the first four steps.");
      return;
    }
    setLoading(true);
    try {
      const keywords = Object.values(searchData).filter(Boolean);
      const allInputs = keywords.join(" ");
      router.push(
        `/ask-an-expert?keywords=${encodeURIComponent(keywords.join(","))}&question=${encodeURIComponent(allInputs)}`
      );
    } catch (error) {
      console.error("Home: Search error:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (imageSrc) => {
    setSelectedImage(imageSrc);
    setIsLightboxOpen(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    const config = stepConfig[currentStep];
    if (config && inputValue && currentStep <= 6 && !searchData[config.key]) {
      const filt = config.suggestions.filter((s) =>
        normalizeText(s).includes(normalizeText(inputValue))
      );
      setFilteredSuggestions(filt);
      setShowSuggestions(filt.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, currentStep]);

  useEffect(() => {
    const fetchQuestionsAndUsernames = async () => {
      setLoadingFaq(true);
      try {
        const q = query(collection(db, "Questions"), where("isPublic", "==", true), where("status", "==", "answered"));
        const querySnapshot = await getDocs(q);
        const questionList = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const rawDate = new Date(data.createdAt || Date.now());
          return {
            id: docSnap.id,
            ...data,
            timestamp: rawDate.toLocaleDateString("en-GB") + " " + rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
            rawTimestamp: rawDate.getTime(),
          };
        });
        const sortedQuestions = questionList.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
        const answerCountMap = questionList.reduce((map, q) => {
          map[q.expertName] = (map[q.expertName] || 0) + 1;
          return map;
        }, {});
        const uniqueExpertNames = [...new Set(questionList.map((q) => q.expertName))].filter(Boolean);
        const profilePromises = uniqueExpertNames.map(async (expertName) => {
          const q = query(collection(db, "Profiles"), where("fullName", "==", expertName));
          const profileSnapshot = await getDocs(q);
          let username = null,
            profilePhoto = null,
            tagline = null;
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
            map[result.expertName] = { username: result.username, profilePhoto: result.profilePhoto || "/default.jpg", tagline: result.tagline };
          }
          return map;
        }, {});
        const topExpertsList = profileResults
          .filter((expert) => {
            const searchableFields = [
              normalizeText(expert.expertName || ""),
              normalizeText(expert.tagline || ""),
              normalizeText(expert.username || ""),
            ].join(" ");
            const allInputs = Object.values(searchData).filter(Boolean).join(" ");
            const keywords = Object.values(searchData).filter(Boolean);
            if (keywords.length === 0) return true;
            const matchCount = keywords.reduce((count, keyword) => {
              return count + (searchableFields.includes(normalizeText(keyword)) ? 1 : 0);
            }, 0);
            const matchPercentage = keywords.length > 0 ? (matchCount / keywords.length) * 100 : 0;
            return matchPercentage >= 60;
          })
          .sort((a, b) => b.answerCount - a.answerCount)
          .slice(0, 10)
          .map((expert, index) => ({ ...expert, rank: index + 1 }));
        setExpertProfileMap(newExpertProfileMap);
        setQuestions(sortedQuestions);
        setTopExperts(topExpertsList);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        toast.error("Failed to load FAQ content.");
      } finally {
        setLoadingFaq(false);
      }
    };
    if (showFaq) {
      fetchQuestionsAndUsernames();
    }
  }, [showFaq, searchData]);

  const filteredQuestions = searchTermFaq
    ? questions.filter(
        (question) =>
          question.question?.toLowerCase().includes(searchTermFaq.toLowerCase()) ||
          question.reply?.toLowerCase().includes(searchTermFaq.toLowerCase()) ||
          question.expertName?.toLowerCase().includes(searchTermFaq.toLowerCase())
      )
    : questions;
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <style jsx global>{`
        :root { --primary: #36013f; --secondary: #f4d35e; }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradientShift { background-size: 400% 400%; animation: gradientShift 15s ease infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 1s ease-in-out; }
        .tags-container::-webkit-scrollbar { display: none; }
        .tags-container { scrollbar-width: none; }
      `}</style>

      <div className={`min-h-screen flex flex-col justify-between text-white bg-gradient-to-br from-[#F4D35E] to-[#36013F] animate-gradientShift ${showFaq ? "hidden" : "block"}`}>
        <header className="w-full px-6 py-4 text-sm z-10">
          <nav className="flex flex-col sm:flex-row sm:justify-between items-center gap-2">
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/" className="p-2">Home</Link>
              <Link href="/about" className="p-2">About</Link>
              <Link href="/about#why-us" className="p-2">Why us</Link>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/about#features" className="p-2">Features</Link>
              <Link href="/about#joining-process" className="p-2">Joining Process</Link>
              <Link href="/expert-login" className="p-2">Login</Link>
            </div>
          </nav>
        </header>

        <main className="flex-grow flex items-center justify-center relative px-4">
          <div className="bg-opacity-80 rounded-3xl shadow-xl p-8 w-full max-w-2xl flex flex-col items-center gap-6 animate-fadeIn">
            <Image src="https://www.xmytravel.com/logolttx.svg" alt="XmyTravel Logo" width={192} height={48} className="w-36 md:w-48 drop-shadow-lg brightness-110" />
            <h1 className="text-2xl md:text-3xl font-semibold text-center">Planning travel? Ask your question here.</h1>

            {/* Progress Bar UI */}
            <div className="w-full px-4 py-2 mb-4">
              <div className="flex items-center justify-between space-x-4">
                {progressSteps.map((step, index) => {
                  const stepIndex = index;
                  const status = getStepStatus(step.key, stepIndex);
                  const isFinalStep = index === progressSteps.length - 1;

                  return (
                    <React.Fragment key={step.name}>
                      <div className="flex flex-col items-center flex-1 min-w-0">
                        <div
                          className={`
                            w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-500
                            ${status === "completed"
                              ? "bg-[#36013F] border-[#36013F]"
                              : status === "active"
                              ? "bg-[#F4D35E] border-white"
                              : "bg-transparent border-[#F4D35E] border-opacity-50"
                            }
                          `}
                        >
                          {status === "completed" ? (
                            <svg
                              className="w-4 h-4 text-[#F4D35E]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                d="M5 13l4 4L19 7"
                              ></path>
                            </svg>
                          ) : (
                            <div
                              className={`
                                w-2 h-2 rounded-full transition-all duration-500
                                ${status === "active" ? "bg-white" : "bg-[#F4D35E] border border-[#F4D35E] border-opacity-70"}
                              `}
                            ></div>
                          )}
                        </div>
                        <span
                          className={`
                            mt-2 text-xs text-center whitespace-nowrap overflow-hidden text-ellipsis transition-all duration-500
                            ${status === "active"
                              ? "text-[#F4D35E] font-bold"
                              : status === "completed"
                              ? "text-white"
                              : "text-white opacity-50"
                            }
                          `}
                        >
                          {step.name}
                        </span>
                      </div>
                      {!isFinalStep && (
                        <div
                          className={`
                            h-0.5 flex-1  transition-all duration-500
                            ${status === "completed" || (stepIndex + 1 < currentStep && stepIndex < 4)
                              ? "bg-[#F4D35E]"
                              : "bg-white opacity-50"
                            }
                          `}
                        ></div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            {/* End Progress Bar UI */}

            <div className="w-full relative">
              <div className="relative w-full">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={stepConfig[currentStep]?.placeholder || "All set! Click Ask Expert."}
                  className="w-full pl-12 pr-5 py-3 rounded-full bg-transparent bg-opacity-30 border border-opacity-20 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                />
                <FaSearch className="h-5 w-5 text-white absolute left-4 top-1/2 transform -translate-y-1/2 opacity-70" />
                {showSuggestions && (
                  <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg z-10 text-black max-h-60 overflow-y-auto">
                    {filteredSuggestions.map((s, i) => (
                      <div key={i} onClick={() => processInput(s)} className="p-2 cursor-pointer hover:bg-gray-100">
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2 tags-container overflow-x-auto">
                {Object.entries(searchData).map(([key, value]) => {
                  if (value) {
                    const emojiMap = {
                      service: "📋",
                      destination: "📍",
                      travel_type: "✈️",
                      consultation_nature: "💡",
                      when: "📅",
                      people: "👥",
                    };
                    const emoji = emojiMap[key];
                    return (
                      <div
                        key={key}
                        className="flex items-center bg-white bg-opacity-50 text-black px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0"
                      >
                        <span className="mr-1">{emoji}</span>
                        <span>{truncateByChars(value, 15)}</span>
                        <button onClick={() => handleRemoveTag(key)} className="ml-1 font-bold text-gray-800 hover:text-black">
                          &times;
                        </button>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            <p className="text-center text-white opacity-80 text-sm">
              {stepConfig[currentStep]?.instruction || "All set! Click Ask Expert or add optionals."}
            </p>
            <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
              <button
                onClick={handleAskExpert}
                disabled={loading || !isComplete()}
                className={`bg-[var(--secondary)] text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition ${
                  loading || !isComplete() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Ask Expert
              </button>
              <button
                onClick={handleReset}
                className="bg-white text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </main>

        <footer className="bg-transparent text-center text-sm text-white text-opacity-60 py-6 px-4">
          <button onClick={() => setShowFaq(true)} className="hover:underline font-semibold text-base">
            View Already Answered Questions (AAQ)
          </button>
        </footer>
      </div>

      <div className={`absolute inset-0 z-50 transform transition-transform duration-700 ease-in-out bg-gray-100 ${showFaq ? "translate-y-0" : "translate-y-full"}`}>
        <div className="h-full overflow-y-auto font-sans">
          {isLightboxOpen && (
            <Lightbox
              mainSrc={selectedImage}
              onCloseRequest={() => setIsLightboxOpen(false)}
              imageTitle={selectedImage.includes("default.jpg") ? "Default Profile Image" : "Expert Profile Image"}
            />
          )}
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <button
              onClick={() => setShowFaq(false)}
              className="mb-6 flex items-center gap-2 font-semibold text-[#36013F] hover:text-opacity-80 transition-colors sticky top-0 py-2 bg-gray-100 w-full z-10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Home
            </button>

            <header className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#36013F] mb-3">
                Already Answered Questions
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Explore questions already answered by our community of insightful experts.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchTermFaq.trim()) {
                    const slug = toSlug(searchTermFaq);
                    router.push(`/faq/${slug}`);
                  }
                }}
                className="relative w-full max-w-2xl mx-auto mt-8"
              >
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions, answers, or experts..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36013F] focus:border-transparent transition"
                  value={searchTermFaq}
                  onChange={(e) => setSearchTermFaq(e.target.value)}
                  aria-label="Search FAQs"
                />
                <button type="submit" className="hidden">Search</button>
              </form>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              <div className="lg:col-span-2 order-2 lg:order-1">
                {loadingFaq ? (
                  <div className="flex justify-center items-center gap-3 text-gray-600 p-8">
                    <svg
                      className="animate-spin h-6 w-6 text-[#36013F]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    <span className="text-lg font-medium">Loading Insights...</span>
                  </div>
                ) : paginatedQuestions.length === 0 ? (
                  <div className="text-center bg-white p-8 rounded-lg shadow-sm border">
                    <p className="text-lg font-medium text-gray-700">No questions found.</p>
                    <p className="text-gray-500">Try adjusting your search or check back later.</p>
                  </div>
                ) : (
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
                              <p className="text-xs text-gray-500 self-end">{q.timestamp}</p>
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
                )}
              </div>
              <aside className="lg:col-span-1 order-1 lg:order-2">
                <div className="sticky top-20">
                  {!loadingFaq && topExperts.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-[#36013F] mb-4 md:ml-10">
                        Top Insightful Experts
                      </h2>
                      <div className="space-y-4">
                        {topExperts.map((expert) => {
                          const profile = expertProfileMap[expert.expertName] || {
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
              <Link href="/faq" className="text-[#36013F] font-semibold hover:underline">
                View all Questions
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}