"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserAuthStore } from "@/stores/useUserAuthStore";
import { Loader } from "lucide-react";

export default function CentralDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useUserAuthStore();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user) {
        if (user.role === "admin") {
          router.replace("/dashboard/profiles");
        } else if (user.role === "expert") {
          router.replace("/expert-dashboard");
        } else if (user.role === "agency") {
          router.replace("/agency-dashboard");
        } else {
          router.replace("/user-dashboard");
        }
      }
    }
  }, [loading, isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <Loader className="w-8 h-8 text-[#36013F] animate-spin" />
      <p className="text-sm text-gray-500 mt-2 font-medium">Entering dashboard...</p>
    </div>
  );
}
