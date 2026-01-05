
"use client";

import React, { use } from "react";
import EditProfile from "@/app/components/EditProfile";
import { ChevronLeft,Edit3 } from "lucide-react";
import Link from "next/link";

export default function AdminEditProfilePage({ params }) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/profiles"
          className="p-2 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-[#36013F] transition-colors shadow-sm"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Master Record Editor</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Directly modifying Firestore record: {id}</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden">
        <div className="bg-[#F4D35E]/10 p-6 border-b border-[#F4D35E]/20">
            <p className="text-xs font-black text-[#36013F] uppercase tracking-widest">⚠️ Platform Warning</p>
            <p className="text-xs text-gray-600 mt-1">Changes made here are instantly reflected across the public platform and the expert's private dashboard. Use with caution.</p>
        </div>
        <EditProfile id={id} />
      </div>
    </div>
  );
}
