
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaSearch, FaGlobeAmericas } from "react-icons/fa";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const handleAskExpert = async () => {
    if (!formData.searchQuery.trim()) {
      toast.error("Please enter a search query.");
      return;
    }

    setLoading(true);
    // Redirect to the expert page with the raw natural language query.
    // The Expert page will handle the semantic processing.
    router.push(`/ask-an-expert?search=${encodeURIComponent(formData.searchQuery)}`);
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
        <div className="bg-opacity-80 rounded-3xl shadow-xl p-8 w-full max-w-3xl flex flex-col items-center gap-6 animate-fadeIn">
          <Image
            src="https://www.xmytravel.com/logolttx.svg"
            alt="XmyTravel Logo"
            width={192}
            height={48}
            className="w-36 md:w-48 drop-shadow-lg brightness-110"
          />
          <h1 className="text-2xl md:text-3xl font-semibold text-center">
            Find the perfect Travel Expert instantly
          </h1>
          <p className="text-center text-sm md:text-base opacity-90">
            Describe your trip, needs, or questions in your own words. Our smart system will match you with the most relevant verified experts.
          </p>
          <div className="w-full relative">
            <input
              name="searchQuery"
              type="text"
              placeholder="e.g., I need a visa expert for Canada or a luxury honeymoon planner for Bali"
              value={formData.searchQuery}
              onChange={handleChange}
              onKeyDown={(e) => e.key === 'Enter' && handleAskExpert()}
              className="w-full pl-12 pr-5 py-4 rounded-full bg-white/10 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)] backdrop-blur-md"
            />
            <FaGlobeAmericas className="h-5 w-5 text-white absolute left-4 top-1/2 transform -translate-y-1/2 opacity-90" />
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
            <button
              onClick={handleAskExpert}
              disabled={loading}
              className={`bg-[var(--secondary)] text-[var(--primary)] font-bold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition flex items-center justify-center gap-2 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></span>
                  Processing...
                </>
              ) : (
                <>
                  <FaSearch /> Find Experts
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-transparent text-center text-sm text-white text-opacity-60 py-6 px-4">
        <div className="flex flex-wrap justify-center items-center gap-3">
          <p>Info@xmytravel.com</p>
          <span>|</span>
          <a href="/privacy-policy" className="hover:underline">Privacy Policy</a>
          <span>|</span>
          <p>© 2025 XmyTravel.com</p>
        </div>
      </footer>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
