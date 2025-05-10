"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Image from "next/image";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 bg-[#36013F] text-white w-64 p-5 md:flex flex-col transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64"
        } md:translate-x-0 transition-transform`}
      >
        <div className="flex justify-between items-center">
          <Image className="w-[90%]" src="/dashboardlogo.svg" alt="Dashboard Logo" width={150} height={40} />
          <button className="md:hidden text-xl" onClick={() => setIsSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>
        <nav className="mt-6 flex flex-col space-y-4">

          <Link
            href="/dashboard/profiles"
            className={`flex items-center gap-2 p-2 ${
              pathname === "/dashboard/profiles" ? "bg-[#F4D35E] rounded-4xl text-black" : "hover:bg-[#F4D35E] hover:text-black hover:rounded-4xl"
            }`}
          >
            👳 Manage Profiles
          </Link>

          <Link
            href="/dashboard/requests"
            className={`flex items-center gap-2 p-2 ${
              pathname === "/dashboard/requests" ? "bg-[#F4D35E] rounded-4xl text-black" : "hover:bg-[#F4D35E] hover:text-black hover:rounded-4xl"
            }`}
          >
            📬 Manage Requests
          </Link>

          <Link
            href="/dashboard/form-leads"
            className={`flex items-center gap-2 p-2 ${
              pathname === "/dashboard/form-leads" ? "bg-[#F4D35E] rounded-4xl text-black" : "hover:bg-[#F4D35E] hover:text-black hover:rounded-4xl"
            }`}
          >
            📞 Form Leads
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-white overflow-auto">
        <button className="md:hidden text-2xl mb-4" onClick={() => setIsSidebarOpen(true)}>
          <FaBars />
        </button>
        {children}
      </main>
    </div>
  );
}
