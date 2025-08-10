

// "use client";

// import { useState } from "react";
// import { getFirestore, collection, getDocs } from "firebase/firestore";
// import { app } from "@/lib/firebase";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { FaSearch } from "react-icons/fa";
// import Link from "next/link";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const db = getFirestore(app);

// export default function Home() {
//   const [formData, setFormData] = useState({
//     searchQuery: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const extractKeywords = (text) => {
//     if (!text) return [];
//     const stopWords = [
//       "the", "is", "in", "and", "or", "but", "a", "an", "for", "with", "to",
//       "at", "by", "from", "on", "of", "need", "help", "i", "you", "we",
//     ];
//     const words = text.toLowerCase().match(/\b\w+\b/g) || [];
//     return [...new Set(words)].filter(word => word.length > 2 && !stopWords.includes(word));
//   };

//   const handleAskExpert = async () => {
//     console.log("Home: handleAskExpert called:", { searchQuery: formData.searchQuery }); // Debug
//     if (!formData.searchQuery.trim()) {
//       toast.error("Please enter a search query.");
//       return;
//     }

//     try {
//       await handleSearchRedirect();
//     } catch (error) {
//       console.error("Home: Error in handleAskExpert:", error);
//       toast.error("An error occurred. Please try again.");
//     }
//   };

//   const handleSearchRedirect = async () => {
//     console.log("Home: handleSearchRedirect called:", formData.searchQuery); // Debug
//     setLoading(true);
//     try {
//       const keywords = extractKeywords(formData.searchQuery);
//       if (keywords.length === 0) {
//         toast.error("Please provide more specific keywords in your query.");
//         setLoading(false);
//         return;
//       }

//       const expertsSnapshot = await getDocs(collection(db, "Profiles"));
//       const filteredExperts = expertsSnapshot.docs
//         .map(doc => ({ id: doc.id, ...doc.data() }))
//         .filter(expert => {
//           const searchableFields = [
//             expert.fullName || "",
//             expert.title || "",
//             expert.tagline || "",
//             expert.about || "",
//             expert.certifications || "",
//             expert.companies || "",
//             expert.languages || "",
//             expert.location || "",
//             (expert.expertise || []).join(" "),
//             (expert.regions || []).join(" "),
//             ...(expert.experience || []).map(
//               (exp) => `${exp.company || ""} ${exp.title || ""}`
//             ),
//           ].join(" ").toLowerCase();
//           return keywords.some(keyword => searchableFields.includes(keyword));
//         });

//       if (filteredExperts.length > 0) {
//         router.push(`/ask-an-expert?keywords=${encodeURIComponent(keywords.join(","))}&question=${encodeURIComponent(formData.searchQuery)}`);
//       } else {
//         toast.warn("No matching experts found. Try different keywords.");
//       }
//     } catch (error) {
//       console.error("Home: Search error:", error);
//       toast.error("Search failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col justify-between text-white bg-gradient-to-br from-[#F4D35E] to-[#36013F] animate-gradientShift">
//       <style jsx global>{`
//         :root {
//           --primary: #36013f;
//           --secondary: #f4d35e;
//         }
//         @keyframes gradientShift {
//           0% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//           100% { background-position: 0% 50%; }
//         }
//         .animate-gradientShift {
//           background-size: 400% 400%;
//           animation: gradientShift 15s ease infinite;
//         }
//         .animate-fadeIn {
//           animation: fadeIn 1s ease-in-out;
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//       `}</style>

//       <header className="w-full px-6 py-4 text-sm z-10">
//         <nav className="flex flex-col sm:flex-row sm:justify-between items-center gap-2">
//           <div className="flex flex-wrap justify-center gap-2  ">
//             <Link href="/" className=" p-2   ">Home</Link>
//             <Link href="/about" className=" p-2  ">About</Link>
//             <Link href="/about#why-us" className="p-2">Why us</Link>
//           </div>
//           <div className="flex flex-wrap justify-center gap-4">
//             <Link href="/about#features" className="p-2">Features</Link>
//             <Link href="/about#joining-process" className="  p-2 ">Joining Process</Link>
//             <Link href="/expert-login" className="p-2">Login</Link>
//           </div>
//         </nav>
//       </header>

//       <main className="flex-grow flex items-center justify-center relative px-4">
//         <div className="bg-opacity-80 rounded-3xl shadow-xl p-8 w-full max-w-2xl flex flex-col items-center gap-6 animate-fadeIn">
//           <Image
//             src="https://www.xmytravel.com/logolttx.svg"
//             alt="XmyTravel Logo"
//             width={192}
//             height={48}
//             className="w-36 md:w-48 drop-shadow-lg brightness-110"
//           />
//           <h1 className="text-2xl md:text-3xl font-semibold text-center">
//             Planning travel? Ask your question here.
//           </h1>
//           <div className="w-full relative">
//             <input
//               name="searchQuery"
//               type="text"
//               placeholder="Ask any travel-related query: destination advice, planning tips, costs, visas or more. A verified expert will guide you."
//               value={formData.searchQuery}
//               onChange={handleChange}
//               className="w-full pl-12 pr-5 py-3 rounded-full bg-transparent bg-opacity-30 border border-opacity-20 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
//             />
//             <FaSearch className="h-5 w-5 text-white absolute left-4 top-1/2 transform -translate-y-1/2 opacity-70" />
//           </div>
//           <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
//             <button
//               onClick={handleAskExpert}
//               disabled={loading}
//               className={`bg-[var(--secondary)] text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition ${
//                 loading ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//             >
//               Ask Expert
//             </button>
            
//           </div>
//         </div>
//       </main>

//       <footer className="bg-transparent text-center text-sm text-white text-opacity-60 py-6 px-4">
//         <div className="flex flex-wrap justify-center items-center gap-3">
//           <p>Info@xmytravel.com</p>
//           <span>|</span>
//           <a href="#" className="hover:underline">Privacy Policy</a>
//           <span>|</span>
//           <p>© 2025 XmyTravel.com</p>
//         </div>
//       </footer>
//       <ToastContainer position="top-right" autoClose={3000} />
//     </div>
//   );
// }



"use client";

import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaSearch, FaChevronDown, FaTrophy } from "react-icons/fa";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";

const db = getFirestore(app);

const truncateByChars = (text, maxLength) => {
  if (!text) {
    return "";
  }
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
};


export default function Home() {
  // State for Home Page
  const [formData, setFormData] = useState({
    searchQuery: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // State for FAQ integration
  const [showFaq, setShowFaq] = useState(false);

  // State from Expert/FAQ page
  const [questions, setQuestions] = useState([]);
  const [topExperts, setTopExperts] = useState([]);
  const [loadingFaq, setLoadingFaq] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expertProfileMap, setExpertProfileMap] = useState({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handlers from Home
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const extractKeywords = (text) => {
    if (!text) return [];
    const stopWords = [
      "the", "is", "in", "and", "or", "but", "a", "an", "for", "with", "to",
      "at", "by", "from", "on", "of", "need", "help", "i", "you", "we",
    ];
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    return [...new Set(words)].filter(word => word.length > 2 && !stopWords.includes(word));
  };

  const handleAskExpert = async () => {
    if (!formData.searchQuery.trim()) {
      toast.error("Please enter a search query.");
      return;
    }
    try {
      await handleSearchRedirect();
    } catch (error) {
      console.error("Home: Error in handleAskExpert:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleSearchRedirect = async () => {
    setLoading(true);
    try {
      const keywords = extractKeywords(formData.searchQuery);
      if (keywords.length === 0) {
        toast.error("Please provide more specific keywords in your query.");
        setLoading(false);
        return;
      }
      const expertsSnapshot = await getDocs(collection(db, "Profiles"));
      const filteredExperts = expertsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(expert => {
          const searchableFields = [
            expert.fullName || "", expert.title || "", expert.tagline || "", expert.about || "",
            expert.certifications || "", expert.companies || "", expert.languages || "",
            expert.location || "", (expert.expertise || []).join(" "), (expert.regions || []).join(" "),
            ...(expert.experience || []).map((exp) => `${exp.company || ""} ${exp.title || ""}`),
          ].join(" ").toLowerCase();
          return keywords.some(keyword => searchableFields.includes(keyword));
        });

      if (filteredExperts.length > 0) {
        router.push(`/ask-an-expert?keywords=${encodeURIComponent(keywords.join(","))}&question=${encodeURIComponent(formData.searchQuery)}`);
      } else {
        toast.warn("No matching experts found. Try different keywords.");
      }
    } catch (error) {
      console.error("Home: Search error:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handlers and logic from Expert/FAQ page
  const openLightbox = (imageSrc) => {
    setSelectedImage(imageSrc);
    setIsLightboxOpen(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  // Data fetching for FAQ, runs only when FAQ is opened
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
            id: docSnap.id, ...data,
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
            map[result.expertName] = { username: result.username, profilePhoto: result.profilePhoto || "/default.jpg", tagline: result.tagline };
          }
          return map;
        }, {});
        const topExpertsList = profileResults.sort((a, b) => b.answerCount - a.answerCount).slice(0, 10).map((expert, index) => ({ ...expert, rank: index + 1 }));
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
  }, [showFaq]);

  const filteredQuestions = questions.filter(
    (question) =>
      question.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.reply?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.expertName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
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
      `}</style>
      
      {/* --- Main Home Page Content --- */}
      <div className="min-h-screen flex flex-col justify-between text-white bg-gradient-to-br from-[#F4D35E] to-[#36013F] animate-gradientShift">
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
            <Image src="https://www.xmytravel.com/logolttx.svg" alt="XmyTravel Logo" width={192} height={48} className="w-36 md:w-48 drop-shadow-lg brightness-110"/>
            <h1 className="text-2xl md:text-3xl font-semibold text-center">Planning travel? Ask your question here.</h1>
            <div className="w-full relative">
              <input name="searchQuery" type="text" placeholder="Ask any travel-related query: destination advice, planning tips, costs, visas or more. A verified expert will guide you." value={formData.searchQuery} onChange={handleChange} className="w-full pl-12 pr-5 py-3 rounded-full bg-transparent bg-opacity-30 border border-opacity-20 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"/>
              <FaSearch className="h-5 w-5 text-white absolute left-4 top-1/2 transform -translate-y-1/2 opacity-70" />
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
              <button onClick={handleAskExpert} disabled={loading} className={`bg-[var(--secondary)] text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>Ask Expert</button>
            </div>
          </div>
        </main>

        <footer className="bg-transparent text-center text-sm text-white text-opacity-60 py-6 px-4">
          <button onClick={() => setShowFaq(true)} className="hover:underline font-semibold text-base">
            View Already Answered Questions (FAQ)
          </button>
        </footer>
      </div>
      
      {/* --- FAQ Page Content (Slides Up) --- */}
      <div className={`absolute inset-0 z-50 transform transition-transform duration-700 ease-in-out bg-gray-100 ${showFaq ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="h-full overflow-y-auto font-sans">
          {isLightboxOpen && (
            <Lightbox mainSrc={selectedImage} onCloseRequest={() => setIsLightboxOpen(false)} imageTitle={selectedImage.includes("default.jpg") ? "Default Profile Image" : "Expert Profile Image"}/>
          )}
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <button onClick={() => setShowFaq(false)} className="mb-6 flex items-center gap-2 font-semibold text-[#36013F] hover:text-opacity-80 transition-colors sticky top-0 py-2 bg-gray-100 w-full z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                Back to Home
            </button>
            
            <header className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#36013F] mb-3">Already Answered Questions</h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Explore questions already answered by our community of insightful experts.</p>
              <div className="relative w-full max-w-2xl mx-auto mt-8">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search questions, answers, or experts..." className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#36013F] focus:border-transparent transition" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} aria-label="Search FAQs"/>
              </div>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              <div className="lg:col-span-2 order-2 lg:order-1">
                {loadingFaq ? (
                  <div className="flex justify-center items-center gap-3 text-gray-600 p-8">
                    <svg className="animate-spin h-6 w-6 text-[#36013F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                    <span className="text-lg font-medium">Loading Insights...</span>
                  </div>
                ) : paginatedQuestions.length === 0 ? (
                  <div className="text-center bg-white p-8 rounded-lg shadow-sm border"><p className="text-lg font-medium text-gray-700">No questions found.</p><p className="text-gray-500">Try adjusting your search or check back later.</p></div>
                ) : (
                  <div className="space-y-4">
                    {paginatedQuestions.map((q) => {
                      const profile = expertProfileMap[q.expertName] || { username: null, profilePhoto: "/default.jpg", tagline: "No tagline available" };
                      return (
                        <details key={q.id} className="group bg-white rounded-lg shadow-sm transition-all duration-300 overflow-hidden border border-gray-200 hover:shadow-lg hover:border-[#F4D35E]">
                          <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-[#36013F] hover:bg-gray-50"><span className="text-lg pr-4">{q.question}</span><FaChevronDown className="w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-180 group-open:text-[#36013F]" /></summary>
                          <div className="p-5 border-t border-gray-200">
                            <p className="mb-6 text-gray-700 leading-relaxed whitespace-pre-wrap">{q.reply || "No answer available yet."}</p>
                            <div className="flex flex-wrap justify-between items-center gap-4">
                              <div className="flex items-center gap-3">
                                <button onClick={() => openLightbox(profile.profilePhoto || '/default.jpg')} className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-[#F4D35E] flex-shrink-0"><Image src={profile.profilePhoto || '/default.jpg'} alt={`${q.expertName || "Expert"}'s profile photo`} fill sizes="40px" className="object-cover" onError={(e) => (e.target.src = "/default.jpg")} /></button>
                                <div>
                                  <span className="text-sm text-gray-500">Answered by</span>
                                  {profile.username ? (<Link href={`/experts/${profile.username}`} className="block text-[#36013F] font-bold hover:underline">{q.expertName}</Link>) : (<p className="font-bold text-gray-600">{q.expertName || "Unknown Expert"}</p>)}
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
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-white text-[#36013F] rounded-lg border border-[#36013F] font-semibold hover:bg-[#36013F] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                        <span className="font-medium text-gray-700 text-sm sm:text-base">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-white text-[#36013F] rounded-lg border border-[#36013F] font-semibold hover:bg-[#36013F] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <aside className="lg:col-span-1 order-2 lg:order-1">
                <div className="sticky top-20">
                  {!loadingFaq && topExperts.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-[#36013F] mb-4 md:ml-10">Top Insightful Experts</h2>
                      <div className="space-y-4">
                        {topExperts.map((expert) => {
                          const profile = expertProfileMap[expert.expertName] || { username: null, profilePhoto: "/default.jpg", tagline: "No tagline available" };
                          return (
                            <div key={expert.expertName} className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-primary hover:shadow-md transition-shadow w-full md:w-[80%] mx-auto">
                              <button onClick={() => openLightbox(profile.profilePhoto)} className="relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#36013F]"><Image src={profile.profilePhoto} alt={`${expert.expertName || "Expert"}'s profile photo`} fill sizes="56px" className="object-cover object-center" onError={(e) => (e.target.src = "/default.jpg")} /></button>
                              <div className="flex flex-col">
                                {profile.username && (<Link href={`/experts/${profile.username}`} className="text-xs text-blue-600 hover:underline mt-1"><p className="text-sm font-semibold text-[#36013F]">{expert.expertName}</p></Link>)}
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
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
