
// src/app/user-forgot-password/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "@/lib/firebase";
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
    // Pre-fill email if user is logged in
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
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Please check your inbox (and spam/junk folder).");
      setTimeout(() => {
        // Redirect to dashboard if logged in, otherwise to login
        if (auth.currentUser) {
          router.push("/expert-dashboard");
        } else {
          router.push("/expert-login");
        }
      }, 3000);
    } catch (err) {
      console.error("Error sending password reset email:", err.message);
      if (err.code === "auth/user-not-found") {
        setError("No user found with this email address.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to send password reset email. Please try again later.");
      }
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
              <Link href="/user-dashboard" className="text-[#36013F] hover:underline">
                Dashboard
              </Link>
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