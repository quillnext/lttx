

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { FaSearch, FaChevronDown, FaThumbsUp, FaThumbsDown, FaRegThumbsUp, FaRegThumbsDown } from "react-icons/fa";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import Footer from "./pages/Footer";
import QuestionSearchPage from "@/app/components/QuestionSearchPage";
import { supabase } from "@/lib/supabase";
import LoginModal from "@/app/components/LoginModal";
import ProfileServiceDrawer from "@/app/components/ProfileServiceDrawer";
import ProfileAddOnModal from "@/app/components/ProfileAddOnModal";
import { useUserAuthStore } from "@/stores/useUserAuthStore";
import { Calendar, MessageSquare, FileText, Compass, ClipboardList, Eye, MapPin, Plane } from "lucide-react";

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
  const searchTermFromUrl = searchParams.get("search") || "";

  if (searchTermFromUrl) {
    return <QuestionSearchPage />;
  }

  const quickTags = [
    'Visa & Documents', 'Flights & Booking', 'Hotel & Stay',
    'Itinerary & Planning'
  ];

  const followUpConfig = {
      'visa': ['nationality', 'destination'],
      'document': ['nationality', 'destination'],
      'fly': ['destination', 'travel_month'],
      'flight': ['destination', 'travel_month'],
      'book': ['destination', 'travel_month'],
      'hotel': ['destination', 'pax_count'],
      'stay': ['destination', 'pax_count'],
      'itinerary': ['destination', 'travel_month', 'pax_count'],
      'plan': ['destination', 'travel_month', 'pax_count'],
      'budget': ['destination', 'pax_count'],
      'cost': ['destination', 'pax_count'],
      'family': ['pax_count'],
      'group': ['pax_count'],
      'work': ['pax_count'],
      'europe': ['travel_month', 'pax_count'],
  };
  
  const followUpPlaceholders = {
      nationality: 'What is your nationality?',
      destination: 'What is your destination country?',
      travel_month: 'Which month are you traveling?',
      pax_count: 'How many people are traveling?'
  };

  const { isAuthenticated, user, initializeAuth, logout } = useUserAuthStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isServiceDrawerOpen, setIsServiceDrawerOpen] = useState(false);
  const [isAddOnModalOpen, setIsAddOnModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedAddOn, setSelectedAddOn] = useState("");

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleOpenService = (serviceName) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      setSelectedService(serviceName);
      setIsServiceDrawerOpen(true);
    }
  };

  const handleOpenAddOn = (addOnName) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      setSelectedAddOn(addOnName);
      setIsAddOnModalOpen(true);
    }
  };

  const pathname = usePathname();
  const [mainQuery, setMainQuery] = useState("");
  const [activeFollowUps, setActiveFollowUps] = useState([]);
  const [followUpAnswers, setFollowUpAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const primaryServices = [
    {
      id: "1:1 STRATEGIC CONSULTATION",
      name: "1:1 Strategic Consultation",
      price: "₹799",
      icon: <Calendar className="w-6 h-6 text-[#F4D35E]" />,
      desc: "30-minute strategic flight, visa or itinerary consultation."
    },
    {
      id: "ASK A QUESTION",
      name: "Ask a Travel Question",
      price: "₹299",
      icon: <MessageSquare className="w-6 h-6 text-[#F4D35E]" />,
      desc: "Ask one quick travel doubt, get verified answers in 2 hours."
    },
    {
      id: "THE MASTER PLAN",
      name: "Start your Master Plan",
      price: "₹1099",
      icon: <FileText className="w-6 h-6 text-[#F4D35E]" />,
      desc: "Get a comprehensive planning and route recommendation."
    },
    {
      id: "CUSTOM LUXE PACKAGE",
      name: "Custom Luxe Package",
      price: "Quote Based",
      icon: <Compass className="w-6 h-6 text-[#F4D35E]" />,
      desc: "Tailor-made, high-touch luxury planning and packages."
    }
  ];

  const addOnServices = [
    {
      id: "Itinerary Review",
      name: "Itinerary Review",
      price: "₹199",
      icon: <Eye className="w-5 h-5 text-purple-300" />,
      desc: "Get your plan logic, routes, and pacing vetted by experts."
    },
    {
      id: "Hotel/Area Check",
      name: "Hotel/Area Check",
      price: "₹149",
      icon: <MapPin className="w-5 h-5 text-purple-300" />,
      desc: "Confirm safety, connectivity, and food choices around your stay."
    },
    {
      id: "Flight Choice",
      name: "Flight Recommendation",
      price: "₹149",
      icon: <Plane className="w-5 h-5 text-purple-300" />,
      desc: "Get help selecting flights with optimal luggage & routing."
    },
    {
      id: "Packing Checklist",
      name: "Packing Checklist",
      price: "₹99",
      icon: <ClipboardList className="w-5 h-5 text-purple-300" />,
      desc: "Custom packing checklist based on destination & dates."
    }
  ];

  const [showFaq, setShowFaq] = useState(false);
  const [groupedQuestions, setGroupedQuestions] = useState([]);
  const [topExperts, setTopExperts] = useState([]);
  const [loadingFaq, setLoadingFaq] = useState(true);
  const [searchTermFaq, setSearchTermFaq] = useState("");
  const [expertProfileMap, setExpertProfileMap] = useState({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [mainQuery]);

  useEffect(() => {
      const query = mainQuery.toLowerCase();
      const neededFollowUps = new Set();
      Object.entries(followUpConfig).forEach(([keyword, questions]) => {
          if (query.includes(keyword)) {
              questions.forEach(q => neededFollowUps.add(q));
          }
      });
      setActiveFollowUps(Array.from(neededFollowUps));

      // Auto-extract common travel fields from the main query to prefill follow-up inputs
      const months = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december",
        "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec"
      ];
      let matchedMonth = "";
      for (const m of months) {
        if (query.match(new RegExp(`\\b${m}\\b`, 'i'))) {
          matchedMonth = m.charAt(0).toUpperCase() + m.slice(1);
          break;
        }
      }

      const destinations = [
        "switzerland", "france", "germany", "italy", "japan", "bali", "vietnam", "thailand",
        "europe", "paris", "tokyo", "london", "singapore", "dubai", "usa", "uk", "india", "phuket",
        "spain", "portugal", "greece", "maldives", "sri lanka", "indonesia"
      ];
      let matchedDest = "";
      for (const d of destinations) {
        if (query.includes(d)) {
          matchedDest = d.charAt(0).toUpperCase() + d.slice(1);
          break;
        }
      }

      let matchedNationality = "";
      if (query.includes("indian") || query.includes("from india")) {
        matchedNationality = "Indian";
      } else if (query.includes("american") || query.includes("from usa")) {
        matchedNationality = "American";
      } else if (query.includes("british") || query.includes("from uk")) {
        matchedNationality = "British";
      }

      let matchedPax = "";
      if (query.includes("solo") || query.includes("alone") || query.includes("myself")) {
        matchedPax = "1 person (Solo)";
      } else if (query.includes("couple") || query.includes("husband") || query.includes("wife") || query.includes("partner")) {
        matchedPax = "2 people (Couple)";
      } else {
        const peopleMatch = query.match(/(\d+)\s*(people|person|pax|adult)/i);
        if (peopleMatch) {
          matchedPax = `${peopleMatch[1]} people`;
        }
      }

      setFollowUpAnswers(prev => {
        const next = { ...prev };
        if (matchedMonth && !prev.travel_month) next.travel_month = matchedMonth;
        if (matchedDest && !prev.destination) next.destination = matchedDest;
        if (matchedNationality && !prev.nationality) next.nationality = matchedNationality;
        if (matchedPax && !prev.pax_count) next.pax_count = matchedPax;
        return next;
      });
  }, [mainQuery]);

  const normalizeText = (text) => {
    if (!text || typeof text !== "string") return "";
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handleQuickTagClick = (tag) => {
    setMainQuery(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return tag;
      const lowerQuery = trimmed.toLowerCase();
      const lowerTag = tag.toLowerCase();
      if (lowerQuery.includes(lowerTag)) {
        return trimmed;
      }
      return `${trimmed}, ${tag}`;
    });
  };

  const handleFollowUpChange = (key, value) => {
    setFollowUpAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setMainQuery('');
    setFollowUpAnswers({});
  };

  const isComplete = () => mainQuery.trim() !== '';

  const handleAskExpert = async () => {
    if (!isComplete()) {
      toast.error("Please ask your question first.");
      return;
    }
    setLoading(true);
    try {
      const followUpText = Object.entries(followUpAnswers)
          .filter(([key, value]) => activeFollowUps.includes(key) && value)
          .map(([key, value]) => `${followUpPlaceholders[key]}: ${value}`)
          .join('. ');

      const fullQuestion = followUpText ? `${mainQuery}. ${followUpText}` : mainQuery;
      const keywords = [mainQuery, ...Object.values(followUpAnswers)].filter(Boolean);

      router.push(
        `/ask-an-expert?keywords=${encodeURIComponent(keywords.join(","))}&question=${encodeURIComponent(fullQuestion)}`
      );
    } catch (error) {
      console.error("Home: Search error:", error);
      toast.error("Search failed. Please try again.");
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
          expertIds: new Set(),
          totalLikes: 0,
          totalDislikes: 0,
          ids: [],
          timestamps: [],
        };
      }
      const ag = group.answerGroups[replyKey];
      ag.experts.add(q.expertName);
      ag.expertIds.add(q.expertId);
      ag.totalLikes += q.likes || 0;
      ag.totalDislikes += q.dislikes || 0;
      ag.ids.push(q.id);
      ag.timestamps.push(q.rawTimestamp);
    });

    Object.keys(grouped).forEach((key) => {
      grouped[key].answerGroupsArray = Object.values(grouped[key].answerGroups).map((ag) => ({
        ...ag,
        minTimestamp: Math.min(...ag.timestamps),
        timestamp:
          new Date(Math.min(...ag.timestamps)).toLocaleDateString("en-GB") +
          " " +
          new Date(Math.min(...ag.timestamps)).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      }));
    });

    return Object.values(grouped).sort((a, b) => b.maxTimestamp - a.maxTimestamp);
  };

  useEffect(() => {
    const fetchQuestionsAndUsernames = async () => {
      setLoadingFaq(true);
      try {
        const { data: questionRows, error: questionErr } = await supabase
          .from("questions")
          .select("*")
          .eq("is_public", true)
          .eq("status", "answered");

        if (questionErr) throw questionErr;

        const questionList = (questionRows || []).map((row) => {
          const rawDate = new Date(row.created_at || Date.now());
          return {
            id: row.id,
            expertId: row.expert_id,
            expertName: row.expert_name,
            expertEmail: row.expert_email,
            question: row.question,
            reply: row.reply,
            status: row.status,
            isPublic: row.is_public,
            createdAt: row.created_at,
            likes: row.likes || 0,
            dislikes: row.dislikes || 0,
            timestamp: rawDate.toLocaleDateString("en-GB") + " " + rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
            rawTimestamp: rawDate.getTime(),
          };
        });
        const grouped = groupQuestions(questionList);

        const answerCountMap = questionList.reduce((map, q) => {
          map[q.expertName] = (map[q.expertName] || 0) + 1;
          return map;
        }, {});

        const uniqueExpertIds = [...new Set(questionList.map((q) => q.expertId))].filter(Boolean);
        const uniqueExpertNames = [...new Set(questionList.map((q) => q.expertName))].filter(Boolean);
        const { data: profileRows, error: profileErr } = await supabase
          .from("profiles")
          .select("id, full_name, username, photo_url, tagline")
          .in("id", uniqueExpertIds);

        if (profileErr) throw profileErr;

        const newExpertProfileMap = (profileRows || []).reduce((map, profile) => {
          if (profile.id) {
            map[profile.id] = {
              username: profile.username,
              profilePhoto: profile.photo_url || "/default.jpg",
              tagline: profile.tagline || "No tagline available",
              expertName: profile.full_name
            };
          }
          if (profile.full_name) {
            const mappedObj = map[profile.id];
            map[profile.full_name] = mappedObj;
            map[profile.full_name.toLowerCase()] = mappedObj;
          }
          return map;
        }, {});
        
        const profileResults = (profileRows || []).map((profile) => {
          const answerCount = questionList.filter((q) => q.expertId === profile.id || q.expertName?.toLowerCase() === profile.full_name?.toLowerCase()).length;
          return {
            id: profile.id,
            expertName: profile.full_name || "Expert",
            username: profile.username || null,
            profilePhoto: profile.photo_url || "/default.jpg",
            tagline: profile.tagline || "No tagline available",
            answerCount: answerCount,
          };
        });

        const topExpertsList = profileResults
          .sort((a, b) => b.answerCount - a.answerCount)
          .slice(0, 10)
          .map((expert, index) => ({ ...expert, rank: index + 1 }));

        setExpertProfileMap(newExpertProfileMap);
        setGroupedQuestions(grouped);
        setTopExperts(topExpertsList);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        toast.toast?.error("Failed to load FAQ content.");
      } finally {
        setLoadingFaq(false);
      }
    };

    if (showFaq) {
      fetchQuestionsAndUsernames();

      const channel = supabase
        .channel("public:questions")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "questions", filter: "is_public=eq.true" },
          () => {
            fetchQuestionsAndUsernames();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [showFaq]);

  const handleLikeDislike = async (originalQuestion, reply, action) => {
    if (!isAuthenticated) {
      toast.error("Please log in to rate this answer!");
      setIsLoginModalOpen(true);
      return;
    }
    const newGrouped = [...groupedQuestions];
    const group = newGrouped.find(g => g.originalQuestion === originalQuestion);
    if (!group) return;
    const ag = group.answerGroupsArray.find(a => a.reply === reply);
    if (!ag) return;
    
    const alreadyRated = ag.ids.some(id => localStorage.getItem(`rated_${id}`));
    if (alreadyRated) {
      toast.info("You have already rated this answer!");
      return;
    }
    
    if (action === 'like') {
      ag.totalLikes = (ag.totalLikes || 0) + 1;
    } else {
      ag.totalDislikes = (ag.totalDislikes || 0) + 1;
    }
    setGroupedQuestions(newGrouped);
    
    ag.ids.forEach(id => localStorage.setItem(`rated_${id}`, action));
    
    try {
      for (const id of ag.ids) {
        const { data: row } = await supabase
          .from("questions")
          .select("likes, dislikes")
          .eq("id", id)
          .single();
        if (row) {
          const currentCount = (action === 'like' ? row.likes : row.dislikes) || 0;
          await supabase
            .from("questions")
            .update({ [action === 'like' ? 'likes' : 'dislikes']: currentCount + 1 })
            .eq("id", id);
        }
      }
    } catch (err) {
      console.error("Error rating answer:", err);
    }
  };

  const filteredGroups = searchTermFaq
    ? groupedQuestions.filter(
        (group) =>
          group.originalQuestion?.toLowerCase().includes(searchTermFaq.toLowerCase()) ||
          group.answerGroupsArray.some(
            (ag) =>
              ag.reply?.toLowerCase().includes(searchTermFaq.toLowerCase()) ||
              Array.from(ag.experts).some((expert) =>
                expert?.toLowerCase().includes(searchTermFaq.toLowerCase())
              )
          )
      )
    : groupedQuestions;
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const paginatedGroups = filteredGroups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <style jsx global>{`
        :root { --primary: #36013f; --secondary: #f4d35e; }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-gradientShift { background-size: 400% 400%; animation: gradientShift 15s ease infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-in-out; }
      `}</style>

      <div className={`min-h-screen flex flex-col justify-between text-white bg-gradient-to-br from-[#F4D35E] to-[#36013F] animate-gradientShift ${showFaq ? "hidden" : "block"}`}>
        <header className="w-full px-6 py-4 text-sm z-10">
          <nav className="flex flex-col sm:flex-row sm:justify-between items-center gap-2">
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/" className="p-2">Home</Link>
              <Link href="/about" className="p-2">About</Link>
              <Link href="/about#why-us" className="p-2">Why us</Link>
              <Link href="/news-and-media" className="p-2">News and Media</Link>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4">
              <Link href="/about#features" className="p-2">Features</Link>
              <Link href="/about#joining-process" className="p-2">Joining Process</Link>
              {isAuthenticated ? (
                <>
                  <span className="p-2 font-bold text-[#F4D35E] bg-[#36013F]/50 rounded-xl">Hi, {user?.name || "Traveller"}</span>
                  <button onClick={() => logout()} className="p-2 hover:underline text-white font-medium">Logout</button>
                </>
              ) : (
                <button onClick={() => setIsLoginModalOpen(true)} className="p-2 hover:underline text-white font-medium">Login</button>
              )}
            </div>
          </nav>
        </header>

        <main className="flex-grow flex items-center justify-center relative px-4">
          <div className="bg-opacity-80 rounded-3xl shadow-xl p-8 w-full max-w-5xl flex flex-col items-center gap-6 animate-fadeIn">
            <Image src="https://www.xmytravel.com/logolttx.svg" alt="XmyTravel Logo" width={192} height={48} className="w-50 md:w-70 drop-shadow-lg brightness-110" />
            
            <div className="text-center">
                <p className="mt-2 text-white/90">Ask your travel question (big or small) and we’ll connect you with the best verified experts for your destination or need.</p>
            </div>

            <div className="w-full relative">
                <textarea
                    ref={textareaRef}
                    value={mainQuery}
                    onChange={(e) => setMainQuery(e.target.value)}
                    placeholder="What’s your travel question? (Visa, itinerary, safety, hotels, flights, best time to go…)"
                    className="w-full pl-5 pr-5 py-3 rounded-2xl bg-transparent bg-opacity-30 border border-opacity-20 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] resize-none overflow-hidden"
                    rows={1}
                    aria-label="Your travel question"
                />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
                {quickTags.map(tag => (
                    <button 
                        key={tag} 
                        onClick={() => handleQuickTagClick(tag)} 
                        className="bg-white bg-opacity-20 text-black px-3 py-1 rounded-full text-sm hover:bg-opacity-30 transition hover:scale-105"
                    >
                        {tag}
                    </button>
                ))}
            </div>
              <div className="text-center text-secondary  text-xs mt-2 space-y-1">
                    <p>The more details you share, the more accurate your expert match will be.</p>
                </div>
            
            {activeFollowUps.length > 0 && (
                <div className="w-full space-y-3 animate-fadeIn">
                  
                    <p className="text-center text-white opacity-90 text-sm font-semibold">
                        Just a few more details (optional)...
                    </p>
                    {activeFollowUps.map(key => (
                        <input
                            key={key}
                            type="text"
                            placeholder={followUpPlaceholders[key]}
                            value={followUpAnswers[key] || ''}
                            onChange={(e) => handleFollowUpChange(key, e.target.value)}
                            className="w-full pl-5 pr-5 py-2 rounded-full bg-transparent bg-opacity-30 border border-opacity-20 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
                            aria-label={followUpPlaceholders[key]}
                        />
                    ))}
                </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
              <button
                onClick={handleAskExpert}
                disabled={loading || !isComplete()}
                className={`bg-[var(--secondary)] text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition flex items-center justify-center ${
                  loading || !isComplete() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Finding experts...
                  </>
                ) : (
                  "Ask Expert"
                )}
              </button>
              <button
                onClick={handleReset}
                className="bg-white text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition"
              >
                Reset
              </button>
            </div>

            {/* Premium Curation Services */}
            <div className="w-full mt-8 border-t border-white/10 pt-8">
              <h2 className="text-xl font-bold text-center text-white mb-6">Premium Travel Curation Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {primaryServices.map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => handleOpenService(svc.id)}
                    className="cursor-pointer bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="mb-3">{svc.icon}</div>
                      <h3 className="font-bold text-white text-sm mb-1">{svc.name}</h3>
                      <p className="text-xs text-white/70 leading-relaxed">{svc.desc}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-white/5">
                      <span className="font-bold text-[#F4D35E]">{svc.price}</span>
                      <span className="text-[#F4D35E]/80 hover:underline">Select &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Add-ons */}
            <div className="w-full mt-8 border-t border-white/10 pt-8">
              <h2 className="text-lg font-bold text-center text-white mb-4">Quick Planning Add-ons</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {addOnServices.map((addon) => (
                  <div
                    key={addon.id}
                    onClick={() => handleOpenAddOn(addon.id)}
                    className="cursor-pointer bg-white/5 hover:bg-white/15 border border-white/5 rounded-2xl p-4 transition-all hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      <div className="mb-2">{addon.icon}</div>
                      <h3 className="font-bold text-white text-sm mb-1">{addon.name}</h3>
                      <p className="text-xs text-white/60 leading-relaxed">{addon.desc}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-white/5">
                      <span className="font-bold text-purple-300">{addon.price}</span>
                      <span className="text-purple-300 hover:underline">Request &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
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
                    router.push(`/aaq/${slug}`);
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
                    <svg className="animate-spin h-6 w-6 text-[#36013F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span className="text-lg font-medium">Loading Insights...</span>
                  </div>
                ) : paginatedGroups.length === 0 ? (
                  <div className="text-center bg-white p-8 rounded-lg shadow-sm border">
                    <p className="text-lg font-medium text-gray-700">No questions found.</p>
                    <p className="text-gray-500">Try adjusting your search or check back later.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedGroups.map((group) => (
                      <details
                        key={group.originalQuestion}
                        className="group bg-white rounded-lg shadow-sm transition-all duration-300 overflow-hidden border border-gray-200 hover:shadow-lg hover:border-[#F4D35E]"
                      >
                        <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-[#36013F] hover:bg-gray-50">
                          <span className="text-lg pr-4">{group.originalQuestion}</span>
                          <FaChevronDown className="w-5 h-5 flex-shrink-0 text-gray-400 transition-transform duration-300 group-open:rotate-180 group-open:text-[#36013F]" />
                        </summary>
                        <div className="p-5 border-t border-gray-200">
                          {group.answerGroupsArray.map((ag) => {
                            const expertsArray = Array.from(ag.experts);
                            const expertIdsArray = ag.expertIds ? Array.from(ag.expertIds) : [];
                            const isSingleExpert = ag.expertIds ? ag.expertIds.size === 1 : ag.experts.size === 1;
                            const singleExpertId = isSingleExpert && expertIdsArray.length > 0 ? expertIdsArray[0] : null;
                            const singleExpertName = isSingleExpert ? expertsArray[0] : null;
                            const profile = isSingleExpert && (singleExpertId || singleExpertName)
                              ? (expertProfileMap[singleExpertId] || expertProfileMap[singleExpertName] || expertProfileMap[singleExpertName?.toLowerCase()] || { username: null, profilePhoto: "/default.jpg", tagline: "No tagline available", expertName: singleExpertName })
                              : null;

                            return (
                              <div key={ag.reply} className="border-b border-gray-100 pb-4 last:border-b-0">
                                <p className="mb-6 text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {ag.reply || "No answer available yet."}
                                </p>
                                <div className="flex flex-wrap justify-between items-center gap-4">
                                  <div className="flex items-center gap-3">
                                    {isSingleExpert && profile && (
                                      <button
                                        onClick={() => openLightbox(profile.profilePhoto || "/default.jpg")}
                                        className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-[#F4D35E] flex-shrink-0"
                                      >
                                        <img
                                          src={profile.profilePhoto || "/default.jpg"}
                                          alt={`${singleExpertName || profile.expertName || "Expert"}'s profile photo`}
                                          className="object-cover w-full h-full"
                                          onError={(e) => { e.currentTarget.src = "/default.jpg"; }}
                                        />
                                      </button>
                                    )}
                                    <div>
                                      {isSingleExpert ? (
                                        <>
                                          <span className="text-sm text-gray-500">Answered by</span>
                                          {profile && profile.username ? (
                                            <Link
                                              href={`/experts/${profile.username}`}
                                              className="block text-[#36013F] font-bold hover:underline"
                                            >
                                              {singleExpertName || profile.expertName || "Unknown Expert"}
                                            </Link>
                                          ) : (
                                            <p className="font-bold text-gray-600">{singleExpertName || (profile && profile.expertName) || "Unknown Expert"}</p>
                                          )}
                                        </>
                                      ) : (
                                        <p className="font-bold text-gray-600">Verified by {ag.experts.size}+ experts</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 self-end">
                                    <p className="text-xs text-gray-500">{ag.timestamp}</p>
                                    <div className="flex items-center gap-3">
                                      <button
                                        onClick={() => handleLikeDislike(group.originalQuestion, ag.reply, 'like')}
                                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-green-600 transition-colors cursor-pointer"
                                        title="Like this answer"
                                      >
                                        {ag.ids.some(id => typeof window !== 'undefined' && localStorage.getItem(`rated_${id}`) === 'like') ? (
                                          <FaThumbsUp className="w-3.5 h-3.5 text-green-600" />
                                        ) : (
                                          <FaRegThumbsUp className="w-3.5 h-3.5" />
                                        )}
                                        <span>{ag.totalLikes || 0}</span>
                                      </button>
                                      <button
                                        onClick={() => handleLikeDislike(group.originalQuestion, ag.reply, 'dislike')}
                                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                                        title="Dislike this answer"
                                      >
                                        {ag.ids.some(id => typeof window !== 'undefined' && localStorage.getItem(`rated_${id}`) === 'dislike') ? (
                                          <FaThumbsDown className="w-3.5 h-3.5 text-red-600" />
                                        ) : (
                                          <FaRegThumbsDown className="w-3.5 h-3.5" />
                                        )}
                                        <span>{ag.totalDislikes || 0}</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    ))}
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
                        {topExperts.map((expert, idx) => {
                          return (
                            <div
                              key={expert.id || expert.expertName || `expert-${idx}`}
                              className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-primary hover:shadow-md transition-shadow w-full md:w-[80%] mx-auto"
                            >
                              <button
                                onClick={() => openLightbox(expert.profilePhoto)}
                                className="relative w-14 h-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#36013F]"
                              >
                                <img
                                  src={expert.profilePhoto}
                                  alt={`${expert.expertName || "Expert"}'s profile photo`}
                                  className="object-cover object-center w-full h-full"
                                  onError={(e) => { e.currentTarget.src = "/default.jpg"; }}
                                />
                              </button>
                              <div className="flex flex-col">
                                {expert.username ? (
                                  <Link
                                    href={`/experts/${expert.username}`}
                                    className="text-xs text-blue-600 hover:underline mt-1"
                                  >
                                    <p className="text-sm font-semibold text-[#36013F]">
                                      {expert.expertName}
                                    </p>
                                  </Link>
                                ) : (
                                    <p className="text-sm font-semibold text-[#36013F]">
                                      {expert.expertName}
                                    </p>
                                )}
                                <p className="text-xs text-gray-600">{truncateByChars(expert.tagline, 50)}</p>
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
              <Link href="/aaq" className="text-[#36013F] font-semibold hover:underline">
                View all Questions
              </Link>
            </div>
          </div>
          <Footer />
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      
      {selectedService && (
        <ProfileServiceDrawer
          isOpen={isServiceDrawerOpen}
          onClose={() => setIsServiceDrawerOpen(false)}
          serviceType={selectedService}
          expertData={null}
          onRequireLogin={() => setIsLoginModalOpen(true)}
        />
      )}

      {selectedAddOn && (
        <ProfileAddOnModal
          isOpen={isAddOnModalOpen}
          onClose={() => setIsAddOnModalOpen(false)}
          addOnType={selectedAddOn}
          expertData={null}
          onRequireLogin={() => setIsLoginModalOpen(true)}
        />
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}