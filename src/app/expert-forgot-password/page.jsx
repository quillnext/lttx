"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { app, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";

const auth = getAuth(app);

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.email) {
      setEmail(user.email);
    }
  }, []);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/expert/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send password reset email. Please try again.");
        return;
      }

      setSuccess("Password reset email sent! Please check your inbox (and spam/junk folder).");
      setTimeout(async () => {
        if (auth.currentUser) {
          try {
            const profileRef = doc(db, "Profiles", auth.currentUser.uid);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
              if (profileSnap.data().profileType === "agency") {
                router.push("/agency-dashboard");
                return;
              }
            } else {
              const { supabase } = await import("@/lib/supabase");
              const { data, error } = await supabase
                .from("profiles")
                .select("profile_type")
                .eq("id", auth.currentUser.uid)
                .single();
              if (data && !error && data.profile_type === "agency") {
                router.push("/agency-dashboard");
                return;
              }
            }
          } catch (err) {
            console.error("Error checking profile:", err);
          }
          router.push("/expert-dashboard");
        } else {
          router.push("/expert-login");
        }
      }, 3000);
    } catch (err) {
      console.error("Error sending password reset email:", err.message);
      setError("Failed to send password reset email. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#F4D35E] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border-t-8 border-[#36013F]">
        <div className="flex justify-center mb-6">
          <Image
            src="/dashboardlogo.svg"
            alt="Xmytravel Logo"
            width={160}
            height={40}
            priority
          />
        </div>

        <h1 className="text-2xl font-bold text-center text-[#36013F] mb-4">Forgot Password</h1>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 w-full border rounded-md focus:ring-[#36013F] focus:border-[#36013F]"
              placeholder="Enter your email"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#36013F] text-white p-2 rounded-md hover:bg-[#4a0150] transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          {auth.currentUser ? (
            <>
              Back to{" "}
              <button
                onClick={async () => {
                  try {
                    const profileRef = doc(db, "Profiles", auth.currentUser.uid);
                    const profileSnap = await getDoc(profileRef);
                    if (profileSnap.exists()) {
                      if (profileSnap.data().profileType === "agency") {
                        router.push("/agency-dashboard");
                        return;
                      }
                    } else {
                      const { supabase } = await import("@/lib/supabase");
                      const { data, error } = await supabase
                        .from("profiles")
                        .select("profile_type")
                        .eq("id", auth.currentUser.uid)
                        .single();
                      if (data && !error && data.profile_type === "agency") {
                        router.push("/agency-dashboard");
                        return;
                      }
                    }
                  } catch (err) {
                    console.error("Error checking profile:", err);
                  }
                  router.push("/expert-dashboard");
                }}
                className="text-[#36013F] hover:underline bg-transparent border-none p-0 cursor-pointer font-medium"
              >
                Dashboard
              </button>
            </>
          ) : (
            <>
              Back to{" "}
              <Link href="/expert-login" className="text-[#36013F] hover:underline">
                Login
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
