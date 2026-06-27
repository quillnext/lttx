
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";
import Cookies from "js-cookie";
import { BookText, FileQuestion, GitPullRequestArrow, LogOut, UserCog, Bell, HelpCircle, CalendarClock, ClipboardList, Wallet } from "lucide-react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";

const db = getFirestore(app);

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [navLoading, setNavLoading] = useState(false); // Track navigation loading
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Track logout loading
  const [pendingQuestionsCount, setPendingQuestionsCount] = useState(0); // Track pending questions count
  const [pendingServiceRequestsCount, setPendingServiceRequestsCount] = useState(0);

  const handleNavClick = (href) => {
    if (href !== pathname) {
      setNavLoading(true);
    }
  };

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

  // Fetch pending service requests count from Supabase
  useEffect(() => {
    const fetchPendingServiceRequests = async () => {
      try {
        const response = await fetch("/api/leads?count=true&status=pending");
        const result = await response.json();
        setPendingServiceRequestsCount(result.count ?? 0);
      } catch (error) {
        console.error("Error fetching pending service requests count:", error.message);
      }
    };

    fetchPendingServiceRequests();
    const interval = setInterval(fetchPendingServiceRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setNavLoading(false);
    setIsSidebarOpen(false);
  }, [pathname]);

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
              onClick={() => handleNavClick("/dashboard/profiles")}
              className={`flex items-center gap-2 p-2 ${
                pathname === "/dashboard/profiles"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
            >
              <UserCog /> Manage Profiles
            </Link>

            <Link
              href="/dashboard/requests"
              onClick={() => handleNavClick("/dashboard/requests")}
              className={`flex items-center gap-2 p-2 ${
                pathname === "/dashboard/requests"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
            >
              <GitPullRequestArrow /> Manage Requests
            </Link>

            <Link
              href="/dashboard/form-leads"
              onClick={() => handleNavClick("/dashboard/form-leads")}
              className={`flex items-center gap-2 p-2 ${
                pathname === "/dashboard/form-leads"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
            >
              <BookText /> Form Leads
            </Link>

            <Link
              href="/dashboard/service-requests"
              onClick={() => handleNavClick("/dashboard/service-requests")}
              className={`flex items-center gap-2 p-2 relative ${
                pathname === "/dashboard/service-requests"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
            >
              <ClipboardList /> Service Requests
              {pendingServiceRequestsCount > 0 && (
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  <Bell size={14} />
                  {pendingServiceRequestsCount}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/questions"
              onClick={() => handleNavClick("/dashboard/questions")}
              className={`flex items-center gap-2 p-2 relative ${
                pathname === "/dashboard/questions"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
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
              onClick={() => handleNavClick("/dashboard/contact-us-messages")}
              className={`flex items-center gap-2 p-2 ${
                pathname === "/dashboard/contact-us-messages"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
            >
              <HelpCircle /> Contact Us Messages
            </Link>

            <Link
              href="/dashboard/scheduling"
              onClick={() => handleNavClick("/dashboard/scheduling")}
              className={`flex items-center gap-2 p-2 ${
                pathname === "/dashboard/scheduling"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
            >
              <CalendarClock /> Scheduling
            </Link>

            <Link
              href="/dashboard/payouts"
              onClick={() => handleNavClick("/dashboard/payouts")}
              className={`flex items-center gap-2 p-2 ${
                pathname === "/dashboard/payouts"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
            >
              <Wallet /> Manage Payouts
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
