"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useUserAuthStore } from "@/stores/useUserAuthStore";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUserAuthStore();

  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
    }
  }, [user]);

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
      setTimeout(() => {
        if (user) {
          if (user.role === "agency") {
            router.push("/agency-dashboard");
          } else {
            router.push("/expert-dashboard");
          }
        } else {
          router.push("/login?role=expert");
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
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#36013F] focus:border-[#36013F] sm:text-sm text-gray-900"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          {success && <p className="text-green-600 text-xs mt-2">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#36013F] hover:bg-[#4a0152] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#36013F] disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/login?role=expert"
            className="text-xs font-semibold text-gray-500 hover:text-[#36013F] hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
