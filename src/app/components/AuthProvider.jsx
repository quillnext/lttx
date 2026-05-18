"use client";

import { useEffect, useState } from "react";
import { useUserAuthStore } from "@/stores/useUserAuthStore";

export default function AuthProvider({ children }) {
  const { initializeAuth } = useUserAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      setIsInitializing(false);
    };

    init();
  }, [initializeAuth]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <p className="text-sm font-medium text-gray-500">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
