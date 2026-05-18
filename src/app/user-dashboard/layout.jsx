"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, MessageSquareText, UserRound } from "lucide-react";
import { useUserAuthStore } from "@/stores/useUserAuthStore";

export default function UserDashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useUserAuthStore();
  const [navLoading, setNavLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/user-login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    setNavLoading(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.replace("/user-login");
  };

  const handleNavClick = (href) => {
    if (href !== pathname) {
      setNavLoading(true);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p className="text-sm font-medium text-gray-500">Loading user dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="bg-[#36013F] text-white w-16 md:w-64 p-2 md:p-5 flex flex-col justify-between h-screen">
        <div>
          <div className="hidden md:flex mb-6">
            <Image src="/dashboardlogo.svg" alt="Xmytravel" width={150} height={40} priority />
          </div>
          <div className="flex justify-center md:hidden my-6">
            <Image src="/favicon.svg" alt="Xmytravel" width={38} height={38} priority />
          </div>

          <nav className="flex flex-col gap-3">
            <Link
              href="/user-dashboard"
              onClick={() => handleNavClick("/user-dashboard")}
              className={`flex items-center gap-2 p-2 rounded-3xl ${
                pathname === "/user-dashboard"
                  ? "bg-[#F4D35E] text-black"
                  : "hover:bg-[#F4D35E] hover:text-black"
              }`}
            >
              <LayoutDashboard className="w-6 h-6" />
              <span className="hidden md:inline">Overview</span>
            </Link>

            <Link
              href="/user-dashboard/requests"
              onClick={() => handleNavClick("/user-dashboard/requests")}
              className={`flex items-center gap-2 p-2 rounded-3xl ${
                pathname === "/user-dashboard/requests"
                  ? "bg-[#F4D35E] text-black"
                  : "hover:bg-[#F4D35E] hover:text-black"
              }`}
            >
              <MessageSquareText className="w-6 h-6" />
              <span className="hidden md:inline">My Requests</span>
            </Link>

            <Link
              href="/user-dashboard/profile"
              onClick={() => handleNavClick("/user-dashboard/profile")}
              className={`flex items-center gap-2 p-2 rounded-3xl ${
                pathname === "/user-dashboard/profile"
                  ? "bg-[#F4D35E] text-black"
                  : "hover:bg-[#F4D35E] hover:text-black"
              }`}
            >
              <UserRound className="w-6 h-6" />
              <span className="hidden md:inline">Profile</span>
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full w-full flex items-center justify-center gap-2"
        >
          <LogOut className="w-6 h-6" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </aside>

      <main className="flex-1 bg-white overflow-auto relative">
        {navLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75">
            <p className="text-sm font-medium text-gray-500">Navigating...</p>
          </div>
        )}
        <div className="p-4 md:p-6">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">User Dashboard</p>
            <h1 className="text-2xl font-black text-[#36013F]">Hello, {user?.name || "Traveller"}</h1>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
