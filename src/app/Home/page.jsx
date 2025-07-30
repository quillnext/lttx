

"use client";

import { useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const db = getFirestore(app);

export default function Home() {
  const [formData, setFormData] = useState({
    searchQuery: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    console.log("Home: handleAskExpert called:", { searchQuery: formData.searchQuery }); // Debug
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
    console.log("Home: handleSearchRedirect called:", formData.searchQuery); // Debug
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
            expert.fullName || "",
            expert.title || "",
            expert.tagline || "",
            expert.about || "",
            expert.certifications || "",
            expert.companies || "",
            expert.languages || "",
            expert.location || "",
            (expert.expertise || []).join(" "),
            (expert.regions || []).join(" "),
            ...(expert.experience || []).map(
              (exp) => `${exp.company || ""} ${exp.title || ""}`
            ),
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

  return (
    <div className="min-h-screen flex flex-col justify-between text-white bg-gradient-to-br from-[#F4D35E] to-[#36013F] animate-gradientShift">
      <style jsx global>{`
        :root {
          --primary: #36013f;
          --secondary: #f4d35e;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradientShift {
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <header className="w-full px-6 py-4 text-sm z-10">
        <nav className="flex flex-col sm:flex-row sm:justify-between items-center gap-2">
          <div className="flex flex-wrap justify-center gap-2  ">
            <Link href="/Home" className="animate-gradientShift rounded-2xl p-2   ">Home</Link>
            <Link href="/about" className="animate-gradientShift rounded-2xl p-2  ">About</Link>
            <Link href="/#why-us" className="animate-gradientShift p-2  rounded-2xl">Why us</Link>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/#features" className="animate-gradientShift p-2 rounded-2xl">Features</Link>
            <Link href="/#joining-process" className="animate-gradientShift  p-2 rounded-2xl">Joining Process</Link>
            <Link href="/complete-profile" className="animate-gradientShift p-2 rounded-2xl">Join As Expert</Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow flex items-center justify-center relative px-4">
        <div className="bg-opacity-80 rounded-3xl shadow-xl p-8 w-full max-w-2xl flex flex-col items-center gap-6 animate-fadeIn">
          <Image
            src="https://www.xmytravel.com/logolttx.svg"
            alt="XmyTravel Logo"
            width={192}
            height={48}
            className="w-36 md:w-48 drop-shadow-lg brightness-110"
          />
          <h1 className="text-2xl md:text-3xl font-semibold text-center">
            Planning travel? Ask your question here.
          </h1>
          <div className="w-full relative">
            <input
              name="searchQuery"
              type="text"
              placeholder="Ask any travel-related query: destination advice, planning tips, costs, visas or more. A verified expert will guide you."
              value={formData.searchQuery}
              onChange={handleChange}
              className="w-full pl-12 pr-5 py-3 rounded-full bg-transparent bg-opacity-30 border border-opacity-20 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
            />
            <FaSearch className="h-5 w-5 text-white absolute left-4 top-1/2 transform -translate-y-1/2 opacity-70" />
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
            <button
              onClick={handleAskExpert}
              disabled={loading}
              className={`bg-[var(--secondary)] text-[var(--primary)] font-semibold px-6 py-3 rounded-full shadow hover:scale-105 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Ask Expert
            </button>
            
          </div>
        </div>
      </main>

      <footer className="bg-transparent text-center text-sm text-white text-opacity-60 py-6 px-4">
        <div className="flex flex-wrap justify-center items-center gap-3">
          <p>Info@xmytravel.com</p>
          <span>|</span>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span>|</span>
          <p>© 2025 XmyTravel.com</p>
        </div>
      </footer>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}