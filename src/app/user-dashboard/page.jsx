"use client";

import { Mail, Phone, ShieldCheck } from "lucide-react";
import { useUserAuthStore } from "@/stores/useUserAuthStore";

export default function UserDashboardPage() {
  const { user } = useUserAuthStore();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:col-span-2">
        <h2 className="text-lg font-bold text-gray-900">Account Overview</h2>
        <p className="mt-1 text-sm text-gray-500">
          Your user account is verified by email OTP and stored centrally in Supabase.
        </p>

        <div className="mt-5 grid gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <Mail className="text-[#36013F]" size={20} />
            <div>
              <p className="text-xs font-bold uppercase text-gray-400">Email</p>
              <p className="font-medium text-gray-800">{user?.email || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <Phone className="text-[#36013F]" size={20} />
            <div>
              <p className="text-xs font-bold uppercase text-gray-400">Mobile</p>
              <p className="font-medium text-gray-800">{user?.phone || "N/A"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-green-100 bg-green-50 p-5 shadow-sm">
        <ShieldCheck className="text-green-700" size={28} />
        <h2 className="mt-3 text-lg font-bold text-green-900">Verified</h2>
        <p className="mt-1 text-sm text-green-800">
          Email OTP verification is active for this user session.
        </p>
      </section>
    </div>
  );
}
