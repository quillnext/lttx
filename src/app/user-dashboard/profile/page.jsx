"use client";

import { useUserAuthStore } from "@/stores/useUserAuthStore";

export default function UserProfilePage() {
  const { user } = useUserAuthStore();

  return (
    <section className="max-w-2xl rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Profile</h2>
      <div className="mt-5 divide-y divide-gray-100">
        <div className="flex justify-between gap-4 py-3">
          <span className="text-sm font-bold text-gray-500">Name</span>
          <span className="text-sm text-gray-900">{user?.name || "N/A"}</span>
        </div>
        <div className="flex justify-between gap-4 py-3">
          <span className="text-sm font-bold text-gray-500">Email</span>
          <span className="text-sm text-gray-900">{user?.email || "N/A"}</span>
        </div>
        <div className="flex justify-between gap-4 py-3">
          <span className="text-sm font-bold text-gray-500">Mobile</span>
          <span className="text-sm text-gray-900">{user?.phone || "N/A"}</span>
        </div>
      </div>
    </section>
  );
}
