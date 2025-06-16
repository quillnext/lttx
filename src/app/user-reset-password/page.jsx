"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { app } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";

const auth = getAuth(app);

export default function UserResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [oobCode, setOobCode] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract and verify oobCode from URL query parameters
  useEffect(() => {
    const code = searchParams.get("oobCode");
    const mode = searchParams.get("mode");
    if (code && mode === "resetPassword") {
      setOobCode(code);
      verifyPasswordResetCode(auth, code).catch(() => {
        setError("Invalid or expired reset link. Please request a new one.");
      });
    } else {
      setError("Invalid reset link. Please use the link from your email.");
    }
  }, [searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!oobCode) {
      setError("Invalid reset link.");
      setLoading(false);
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/expert-login");
      }, 2000);
    } catch (err) {
      console.error("Password reset error:", err.message);
      if (err.code === "auth/invalid-action-code") {
        setError("Invalid or expired reset link. Please request a new one.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.");
      } else {
        setError("Failed to reset password. Please try again.");
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
        <h1 className="text-2xl font-bold text-center text-[#36013F] mb-4">Create New Password</h1>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 p-3 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#36013F]"
              placeholder="Enter new password"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 p-3 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#36013F]"
              placeholder="Confirm new password"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#36013F] text-white py-3 rounded-xl font-semibold hover:bg-[#4a0150] transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Resetting..." : "Set New Password"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Back to{" "}
          <Link href="/expert-login" className="text-[#36013F] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}