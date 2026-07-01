"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ExpertLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?role=expert");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#36013F] flex items-center justify-center text-white italic">
      Redirecting to login portal...
    </div>
  );
}