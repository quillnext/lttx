"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

import { useUserAuthStore } from "@/stores/useUserAuthStore";
import { supabase } from "@/lib/supabase";
import { KeyRound, LogOut, MailPlus, UserPen, Lock, Bell, HelpCircle, CalendarDays, CalendarCheck, Menu, X } from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UserLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useUserAuthStore();
  const [loading, setLoading] = useState(true);
  const [navLoading, setNavLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [pendingQuestionsCount, setPendingQuestionsCount] = useState(0);
  const [pendingLeadsCount, setPendingLeadsCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleNavClick = (href) => {
    if (href !== pathname) {
      setNavLoading(true);
    }
  };

  // Ensure the component is marked as "client" after initial render
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Check authentication state, fetch pending questions, and handle redirects
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      router.push("/login?role=expert");
      setLoading(false);
      return;
    }

    setLoading(false);

    const loadDashboardData = async () => {
      try {
        // Fetch pending questions count from Supabase
        const { count: questionsCount, error: questionsErr } = await supabase
          .from("questions")
          .select("*", { count: "exact", head: true })
          .eq("expert_id", user.id)
          .eq("status", "pending");

        if (!questionsErr && isMounted.current) {
          setPendingQuestionsCount(questionsCount || 0);
        }

        // Check profile type (role)
        if (user.role !== "expert" && user.role !== "admin") {
          router.push(`/login?role=${user.role}`);
          return;
        }

        // Fetch pending service requests (leads) count
        try {
          const leadsRes = await fetch(`/api/leads?count=true&status=pending&expertId=${encodeURIComponent(user.id)}`);
          const leadsResult = await leadsRes.json();
          if (isMounted.current) {
            setPendingLeadsCount(leadsResult.count ?? 0);
          }
        } catch (e) {
          console.error("Error fetching pending leads count:", e.message);
        }

        // Redirect /expert-dashboard to /expert-dashboard/messages
        if (pathname === "/expert-dashboard") {
          router.push("/expert-dashboard/messages");
          return;
        }

        // Check forcePasswordChange flag from user profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("force_password_change")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.force_password_change) {
          const allowedPaths = [
            "/expert-dashboard/edit-profile",
            "/expert-dashboard/messages",
            "/expert-dashboard/change-password",
            "/expert-dashboard/contact-us",
            "/expert-dashboard/availability",
            "/expert-dashboard/bookings"
          ];
          if (!allowedPaths.includes(pathname)) {
            router.push("/expert-dashboard/change-password");
            return;
          }
        }
      } catch (error) {
        console.error("Error in auth state handling:", error.message);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
  }, [user, isAuthenticated, authLoading, pathname, router]);

  useEffect(() => {
    setNavLoading(false);
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setNavLoading(true);
    try {
      await logout();
      router.push("/login?role=expert");
    } catch (error) {
      console.error("Error signing out:", error.message);
      router.push("/login?role=expert");
    } finally {
      if (isMounted.current) {
        setIsLoggingOut(false);
        setNavLoading(false);
      }
    }
  };

  const renderNavLinks = (isMobile) => {
    const spanClass = isMobile ? "inline" : "hidden md:inline";
    return (
      <>
        <Link
          href="/expert-dashboard/messages"
          onClick={() => handleNavClick("/expert-dashboard/messages")}
          className={`flex items-center gap-2 p-2 relative ${
            pathname === "/expert-dashboard/messages"
              ? "bg-[#F4D35E] rounded-3xl text-black"
              : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
          }`}
          prefetch={true}
          aria-label="Messages"
        >
          <MailPlus className="w-6 h-6" />
          <span className={spanClass}>Messages</span>
          {(pendingQuestionsCount + pendingLeadsCount) > 0 && (
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full md:ml-2">
              <Bell size={14} />
              {pendingQuestionsCount + pendingLeadsCount}
            </span>
          )}
        </Link>
        <Link
          href="/expert-dashboard/edit-profile"
          onClick={() => handleNavClick("/expert-dashboard/edit-profile")}
          className={`flex items-center gap-2 p-2 ${
            pathname === "/expert-dashboard/edit-profile"
              ? "bg-[#F4D35E] rounded-3xl text-black"
              : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
          }`}
          prefetch={true}
          aria-label="Edit Profile"
        >
          <UserPen className="w-6 h-6" />
          <span className={spanClass}>Edit Profile</span>
        </Link>
        <Link
          href="/expert-dashboard/change-password"
          onClick={() => handleNavClick("/expert-dashboard/change-password")}
          className={`flex items-center gap-2 p-2 ${
            pathname === "/expert-dashboard/change-password"
              ? "bg-[#F4D35E] rounded-3xl text-black"
              : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
          }`}
          prefetch={true}
          aria-label="Change Password"
        >
          <KeyRound className="w-6 h-6" />
          <span className={spanClass}>Change Password</span>
        </Link>
        <Link
          href="/expert-forgot-password"
          onClick={() => handleNavClick("/expert-forgot-password")}
          className={`flex items-center gap-2 p-2 ${
            pathname === "/expert-forgot-password"
              ? "bg-[#F4D35E] rounded-3xl text-black"
              : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
          }`}
          prefetch={true}
          aria-label="Forgot Password"
        >
          <Lock className="w-6 h-6" />
          <span className={spanClass}>Forgot Password</span>
        </Link>
        <Link
          href="/expert-dashboard/contact-us"
          onClick={() => handleNavClick("/expert-dashboard/contact-us")}
          className={`flex items-center gap-2 p-2 ${
            pathname === "/expert-dashboard/contact-us"
              ? "bg-[#F4D35E] rounded-3xl text-black"
              : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
          }`}
          prefetch={true}
          aria-label="Contact Us"
        >
          <HelpCircle className="w-6 h-6" /> 
          <span className={spanClass}>Contact Us</span>
        </Link>
        <Link
          href="/expert-dashboard/availability"
          onClick={() => handleNavClick("/expert-dashboard/availability")}
          className={`flex items-center gap-2 p-2 ${
            pathname === "/expert-dashboard/availability"
              ? "bg-[#F4D35E] rounded-3xl text-black"
              : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
          }`}
          prefetch={true}
          aria-label="Availability"
        >
          <CalendarDays className="w-6 h-6" /> 
          <span className={spanClass}>Availability</span>
        </Link>
        <Link
          href="/expert-dashboard/bookings"
          onClick={() => handleNavClick("/expert-dashboard/bookings")}
          className={`flex items-center gap-2 p-2 ${
            pathname === "/expert-dashboard/bookings"
              ? "bg-[#F4D35E] rounded-3xl text-black"
              : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
          }`}
          prefetch={true}
          aria-label="Bookings"
        >
          <CalendarCheck className="w-6 h-6" /> 
          <span className={spanClass}>Bookings</span>
        </Link>
      </>
    );
  };

  const renderLogoutButton = (isMobile) => {
    const spanClass = isMobile ? "inline" : "hidden md:inline";
    return (
      <button
        onClick={handleLogout}
        className={`bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full w-full flex items-center justify-center gap-2 transition-colors ${
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
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className={spanClass}>Logging out...</span>
            {!isMobile && <span className="md:hidden">...</span>}
          </span>
        ) : (
          <>
            <LogOut className="w-6 h-6" />
            <span className={spanClass}>Logout</span>
          </>
        )}
      </button>
    );
  };

  // Always render the loading UI on the server and during initial client render
  if (loading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-600 flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Mobile Top Header */}
      <header className="flex md:hidden items-center justify-between bg-[#36013F] text-white p-4 sticky top-0 z-40 shadow-md w-full">
        <div className="flex items-center gap-2">
          <Image src="/favicon.svg" alt="Logo" width={32} height={32} />
          <span className="font-bold text-sm tracking-wide">Expert Dashboard</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-1 focus:outline-none focus:ring-2 focus:ring-[#F4D35E] rounded text-white"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Sidebar Overlay/Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#36013F] text-white p-5 flex flex-col justify-between h-screen transform transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex justify-between items-center mb-6">
            <Image src="/dashboardlogo.svg" alt="Dashboard Logo" width={150} height={40} priority />
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 focus:outline-none focus:ring-2 focus:ring-[#F4D35E] rounded text-white"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col space-y-4">
            {renderNavLinks(true)}
          </nav>
        </div>
        <div className="mt-auto">
          {renderLogoutButton(true)}
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="bg-[#36013F] text-white w-16 md:w-64 p-1 md:p-5 hidden md:flex flex-col justify-between h-screen shrink-0">
        <div>
          <div className="justify-center md:justify-start mb-6 hidden md:flex">
            <Image
              className="w-10 md:w-[90%]"
              src="/dashboardlogo.svg"
              alt="Dashboard Logo"
              width={150}
              height={40}
              priority
            />
          </div>
          <div className="flex justify-center md:justify-start mb-6 md:hidden">
            <Image
              className="mt-10 w-10 md:w-[90%]"
              src="/favicon.svg"
              alt="Dashboard Logo"
              width={150}
              height={40}
              priority
            />
          </div>
          <nav className="flex flex-col space-y-4">
            {renderNavLinks(false)}
          </nav>
        </div>
        <div>
          {renderLogoutButton(false)}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white overflow-auto relative h-full">
        {navLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
            <div className="text-gray-600 flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Navigating...
            </div>
          </div>
        )}
        {children}
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
      </main>
    </div>
  );
}
