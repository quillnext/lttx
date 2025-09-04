
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { getAuth, signOut } from "firebase/auth";
import { app, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { KeyRound, LogOut, MailPlus, UserPen, Lock, Bell, HelpCircle, CalendarDays, CalendarCheck } from "lucide-react";

const auth = getAuth(app);

export default function UserLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [navLoading, setNavLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [pendingQuestionsCount, setPendingQuestionsCount] = useState(0); // Track pending questions count
  const isMounted = useRef(true);

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
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!isMounted.current) return;

      if (!user) {
        router.push("/expert-login");
        setLoading(false);
        return;
      }

      try {
        // Fetch pending questions count
        const questionsQuery = query(
          collection(db, "Questions"),
          where("expertId", "==", user.uid),
          where("status", "==", "pending")
        );
        const querySnapshot = await getDocs(questionsQuery);
        if (isMounted.current) {
          setPendingQuestionsCount(querySnapshot.size);
        }

        // Check profile for forcePasswordChange
        const profileRef = doc(db, "Profiles", user.uid);
        const profileSnap = await getDoc(profileRef);

        // Redirect /expert-dashboard to /expert-dashboard/messages
        
        if (pathname === "/expert-dashboard") {
          router.push("/expert-dashboard/messages");
          return;
        }

        if (profileSnap.exists() && profileSnap.data().forcePasswordChange) {
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
    });

    return () => unsubscribe();
  }, [router, pathname]);

  // Debounced navigation loading state
  useEffect(() => {
    let timeoutId;

    const handleStart = () => {
      clearTimeout(timeoutId);
      if (isMounted.current) {
        setNavLoading(true);
      }
    };

    const handleComplete = () => {
      timeoutId = setTimeout(() => {
        if (isMounted.current) {
          setNavLoading(false);
        }
      }, 100);
    };

    router.events?.on("routeChangeStart", handleStart);
    router.events?.on("routeChangeComplete", handleComplete);
    router.events?.off("routeChangeError", handleComplete);

    return () => {
      clearTimeout(timeoutId);
      router.events?.off("routeChangeStart", handleStart);
      router.events?.off("routeChangeComplete", handleComplete);
      router.events?.off("routeChangeError", handleComplete);
    };
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setNavLoading(true);
    try {
      await signOut(auth);
      router.push("/expert-login");
    } catch (error) {
      console.error("Error signing out:", error.message);
      router.push("/expert-login");
    } finally {
      if (isMounted.current) {
        setIsLoggingOut(false);
        setNavLoading(false);
      }
    };
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="bg-[#36013F] text-white w-16 md:w-64 p-1 md:p-5 flex flex-col justify-between h-screen">
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
            <Link
              href="/expert-dashboard/messages"
              className={`flex items-center gap-2 p-2 relative ${
                pathname === "/expert-dashboard/messages"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
              prefetch={true}
              aria-label="Messages"
            >
              <MailPlus className="w-6 h-6" />
              <span className="hidden md:inline">Messages</span>
              {pendingQuestionsCount > 0 && (
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full md:ml-2">
                  <Bell size={14} />
                  {pendingQuestionsCount}
                </span>
              )}
            </Link>
            <Link
              href="/expert-dashboard/edit-profile"
              className={`flex items-center gap-2 p-2 ${
                pathname === "/expert-dashboard/edit-profile"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
              prefetch={true}
              aria-label="Edit Profile"
            >
              <UserPen className="w-6 h-6" />
              <span className="hidden md:inline">Edit Profile</span>
            </Link>
            <Link
              href="/expert-dashboard/change-password"
              className={`flex items-center gap-2 p-2 ${
                pathname === "/expert-dashboard/change-password"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
              prefetch={true}
              aria-label="Change Password"
            >
              <KeyRound className="w-6 h-6" />
              <span className="hidden md:inline">Change Password</span>
            </Link>
            <Link
              href="/expert-forgot-password"
              className={`flex items-center gap-2 p-2 ${
                pathname === "/expert-forgot-password"
                  ? "bg-[#F4D35E] rounded-3xl text-black"
                  : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
              }`}
              prefetch={true}
              aria-label="Forgot Password"
            >
              <Lock className="w-6 h-6" />
              <span className="hidden md:inline">Forgot Password</span>
            </Link>
            <Link
    href="/expert-dashboard/contact-us"
    className={`flex items-center gap-2 p-2 ${
      pathname === "/expert-dashboard/contact-us"
        ? "bg-[#F4D35E] rounded-3xl text-black"
        : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
    }`}
    prefetch={true}
    aria-label="Contact Us"
  >
    <HelpCircle className="w-6 h-6" /> 
    <span className="hidden md:inline">Contact Us</span>
  </Link>


    <Link
    href="/expert-dashboard/availability"
    className={`flex items-center gap-2 p-2 ${
      pathname === "/expert-dashboard/availability"
        ? "bg-[#F4D35E] rounded-3xl text-black"
        : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
    }`}
    prefetch={true}
    aria-label="Contact Us"
  >
    <CalendarDays className="w-6 h-6" /> 
    <span className="hidden md:inline">Availability</span>
  </Link>

  
    <Link
    href="/expert-dashboard/bookings"
    className={`flex items-center gap-2 p-2 ${
      pathname === "/expert-dashboard/bookings"
        ? "bg-[#F4D35E] rounded-3xl text-black"
        : "hover:bg-[#F4D35E] hover:text-black hover:rounded-3xl"
    }`}
    prefetch={true}
    aria-label="Contact Us"
  >
    <CalendarCheck className="w-6 h-6" /> 
    <span className="hidden md:inline">Booking</span>
  </Link>

          </nav>
        </div>

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
              <span className="hidden md:inline">Logging out...</span>
              <span className="md:hidden">...</span>
            </span>
          ) : (
            <>
              <LogOut className="w-6 h-6" />
              <span className="hidden md:inline">Logout</span>
            </>
          )}
        </button>
      </aside>

      <main className="flex-1 bg-white overflow-auto relative">
        {navLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
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
              Navigating...
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
