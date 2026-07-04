"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutDashboard, LogOut, MessageSquareText, UserRound, Menu, X } from "lucide-react";
import { useUserAuthStore } from "@/stores/useUserAuthStore";

export default function UserDashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading, logout } = useUserAuthStore();
  const [navLoading, setNavLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const queryString = searchParams.toString();
      const currentUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;
      router.replace(`/login?role=user&returnTo=${encodeURIComponent(currentUrl)}`);
    } else if (isAuthenticated && user && user.role !== "user" && user.role !== "admin") {
      router.replace(`/login?role=${user.role}`);
    }
  }, [loading, isAuthenticated, user, router, pathname, searchParams]);

  useEffect(() => {
    setNavLoading(false);
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.replace("/login?role=user");
  };

  const renderNavLinks = (isMobile) => {
    const spanClass = isMobile ? "inline" : "hidden md:inline";
    return (
      <>
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
          <span className={spanClass}>Overview</span>
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
          <span className={spanClass}>My Requests</span>
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
          <span className={spanClass}>Profile</span>
        </Link>
      </>
    );
  };

  const renderLogoutButton = (isMobile) => {
    const spanClass = isMobile ? "inline" : "hidden md:inline";
    return (
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full w-full flex items-center justify-center gap-2"
      >
        <LogOut className="w-6 h-6" />
        <span className={spanClass}>Logout</span>
      </button>
    );
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
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden w-full">
      {/* Mobile Top Header */}
      <header className="flex md:hidden items-center justify-between bg-[#36013F] text-white p-4 sticky top-0 z-40 shadow-md w-full">
        <div className="flex items-center gap-2">
          <Image src="/favicon.svg" alt="Logo" width={32} height={32} />
          <span className="font-bold text-sm tracking-wide">User Dashboard</span>
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
      <aside className="bg-[#36013F] text-white w-16 md:w-64 p-2 md:p-5 hidden md:flex flex-col justify-between h-screen shrink-0">
        <div>
          <div className="hidden md:flex mb-6">
            <Image src="/dashboardlogo.svg" alt="Xmytravel" width={150} height={40} priority />
          </div>
          <div className="flex justify-center md:hidden my-6">
            <Image src="/favicon.svg" alt="Xmytravel" width={38} height={38} priority />
          </div>
          <nav className="flex flex-col gap-3">
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
