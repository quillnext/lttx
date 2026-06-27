"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import ExpertWalletPanel from "@/app/components/ExpertWalletPanel";

const auth = getAuth(app);

export default function ExpertWalletPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        router.push("/expert-login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#36013F] border-t-transparent"></div>
        <p className="ml-3 text-sm text-gray-500">Authenticating...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <ExpertWalletPanel 
      firebaseUid={currentUser.uid} 
      email={currentUser.email} 
    />
  );
}
