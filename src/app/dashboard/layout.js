
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";
import Cookies from "js-cookie";
import { BookText, FileQuestion, GitPullRequestArrow, LogOut, UserCog, Bell, HelpCircle, CalendarClock, ClipboardList, Landmark, Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUserAuthStore } from "@/stores/useUserAuthStore";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useUserAuthStore();
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [navLoading, setNavLoading] = useState(false); // Track navigation loading
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Track logout loading
  const [pendingQuestionsCount, setPendingQuestionsCount] = useState(0); // Track pending questions count
  const [pendingServiceRequestsCount, setPendingServiceRequestsCount] = useState(0);

  // Authenticate user role
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      router.push("/admin-login");
      setLoading(false);
      return;
    }

    if (user.role !== "admin") {
      router.push(`/login?role=${user.role}`);
      return;
    }

    setLoading(false);
  }, [user, isAuthenticated, authLoading, router]);

  const handleNavClick = (href) => {
    if (href !== pathname) {
      setNavLoading(true);
    }
  };

  // Fetch pending questions count from Supabase
  useEffect(() => {
    const fetchPendingQuestions = async () => {
      try {
        const { count, error } = await supabase
          .from("questions")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");
        if (error) throw error;
        setPendingQuestionsCount(count || 0);
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
      await logout();
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-600 flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-gray-600"
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
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden w-full">
      {/* Mobile Top Header */}
      <header className="flex md:hidden items-center justify-between bg-[#36013F] text-white p-4 sticky top-0 z-40 shadow-md w-full">
        <div className="flex items-center gap-2">
          <Image src="/favicon.svg" alt="Logo" width={32} height={32} />
          <span className="font-bold text-sm tracking-wide">Admin Dashboard</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-1 focus:outline-none focus:ring-2 focus:ring-[#F4D35E] rounded text-white"
          aria-label="Open menu"
        >
          <FaBars size={24} />
        </button>
      </header>

      {/* Mobile Sidebar Overlay/Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#36013F] text-white p-5 flex flex-col justify-between h-screen transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:flex shrink-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex justify-between items-center mb-6">
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

          <nav className="flex flex-col space-y-4">
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
              href="/dashboard/withdrawals"
              onClick={() => handleNavClick("/dashboard/withdrawals")}
              className={`flex items-center gap-2 p-2 ${
                pathname === "/dashboard/withdrawals"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
            >
              <Landmark /> Withdrawal Approvals
            </Link>

            <Link
              href="/expert-dashboard"
              onClick={() => handleNavClick("/expert-dashboard")}
              className={`flex items-center gap-2 p-2 mt-4 border-t border-purple-800 pt-4 text-yellow-300 font-bold hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl`}
            >
              <Briefcase /> Expert Mode
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

      {/* Main Content Area */}
      <main className="flex-1 bg-white overflow-auto relative h-full p-4 md:p-6">
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
