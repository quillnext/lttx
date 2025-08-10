
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";
import Cookies from "js-cookie";
import { BookText, FileQuestion, GitPullRequestArrow, LogOut, UserCog, Bell, HelpCircle, CalendarClock } from "lucide-react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";

const db = getFirestore(app);

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [navLoading, setNavLoading] = useState(false); // Track navigation loading
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Track logout loading
  const [pendingQuestionsCount, setPendingQuestionsCount] = useState(0); // Track pending questions count

  // Fetch pending questions count
  useEffect(() => {
    const fetchPendingQuestions = async () => {
      try {
        const questionsQuery = query(collection(db, "Questions"), where("status", "==", "pending"));
        const querySnapshot = await getDocs(questionsQuery);
        setPendingQuestionsCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching pending questions count:", error.message);
      }
    };

    fetchPendingQuestions();
  }, []);

  // Listen to route change events to show a loading indicator
  useEffect(() => {
    const handleStart = () => setNavLoading(true);
    const handleComplete = () => setNavLoading(false);

    router.events?.on("routeChangeStart", handleStart);
    router.events?.on("routeChangeComplete", handleComplete);
    router.events?.on("routeChangeError", handleComplete);

    return () => {
      router.events?.off("routeChangeStart", handleStart);
      router.events?.off("routeChangeComplete", handleComplete);
      router.events?.off("routeChangeError", handleComplete);
    };
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setNavLoading(true); // Show navigation loading overlay during logout
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Logout request failed");
      }
      Cookies.remove("adminAuth"); // Remove the adminAuth cookie
      window.location.href = "/admin-login";
    } catch (error) {
      console.error("Error during logout:", error.message);
      window.location.href = "/admin-login"; // Fallback redirect
    } finally {
      setIsLoggingOut(false);
      setNavLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 bg-[#36013F] text-white w-64 md:flex flex-col justify-between transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div>
          <div className="flex justify-between items-center mb-6 p-5">
            <Image
              className="w-[90%]"
              src="/dashboardlogo.svg"
              alt="Dashboard Logo"
              width={150}
              height={40}
              priority
            />
            <button
              className="md:hidden text-xl focus:outline-none focus:ring-2 focus:ring-[#F4D35E] rounded"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <FaTimes />
            </button>
          </div>

          <nav className="flex flex-col space-y-4 px-5">
            <Link
              href="/dashboard/profiles"
              className={`flex items-center gap-2 p-2 ${
                pathname === "/dashboard/profiles"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
              prefetch={true}
            >
              <UserCog /> Manage Profiles
            </Link>

            <Link
              href="/dashboard/requests"
              className={`flex items-center gap-2 p-2 ${
                pathname === "/dashboard/requests"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
              prefetch={true}
            >
              <GitPullRequestArrow /> Manage Requests
            </Link>

            <Link
              href="/dashboard/form-leads"
              className={`flex items-center gap-2 p-2 ${
                pathname === "/dashboard/form-leads"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
              prefetch={true}
            >
              <BookText /> Form Leads
            </Link>

            <Link
              href="/dashboard/questions"
              className={`flex items-center gap-2 p-2 relative ${
                pathname === "/dashboard/questions"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
              prefetch={true}
            >
              <FileQuestion /> Ask Question
              {pendingQuestionsCount > 0 && (
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  <Bell size={14} />
                  {pendingQuestionsCount}
                </span>
              )}
            </Link>
            <Link
    href="/dashboard/contact-us-messages"
    className={`flex items-center gap-2 p-2 ${
      pathname === "/dashboard/contact-us-messages"
        ? "bg-[#F4D35E] rounded-3xl text-black"
        : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
    }`}
    prefetch={true}
  >
    <HelpCircle /> Contact Us Messages
  </Link>

          <Link
    href="/dashboard/scheduling"
    className={`flex items-center gap-2 p-2 ${
      pathname === "/dashboard/scheduling"
        ? "bg-[#F4D35E] rounded-3xl text-black"
        : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
    }`}
    prefetch={true}
  >
    <CalendarClock />   Scheduling

  </Link>
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`mt-6 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full text-sm w-full flex items-center justify-center gap-2 transition-colors ${
            isLoggingOut || navLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoggingOut || navLoading}
          aria-label="Logout"
        >
          {isLoggingOut ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              Logging out...
            </span>
          ) : (
            <>
              <LogOut /> Logout
            </>
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-white overflow-auto relative">
        <button
          className="md:hidden text-2xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#36013F] rounded"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <FaBars />
        </button>
        {navLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <svg
              className="animate-spin h-8 w-8 text-[#36013F]"
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
          </div>
        )}
        {children}
      </main>
    </div>
  );
}