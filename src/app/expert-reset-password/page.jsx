"use client";

import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function ExpertResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setNewConfirmPassword] = useState("");
  const [email, setEmail] = useState(""); // To display the expert's email
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingEmail, setFetchingEmail] = useState(true); // For email fetching state
  const router = useRouter();
  const searchParams = useSearchParams();

  const isSetup = searchParams.get("mode") === "setup";

  // Extract code and fetch the associated email or establish session
  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(({ data, error }) => {
          if (error) {
            setError("Invalid or expired setup link. Please request a new one.");
            setFetchingEmail(false);
          } else {
            setEmail(data.user?.email || "");
            setFetchingEmail(false);
          }
        })
        .catch(() => {
          setError("Invalid or expired setup link. Please request a new one.");
          setFetchingEmail(false);
        });
    } else {
      // Fallback: Check if there is already an active session established by Supabase redirect handler
      supabase.auth.getUser()
        .then(({ data: { user } }) => {
          if (user) {
            setEmail(user.email || "");
            setFetchingEmail(false);
          } else {
            setError("Invalid invitation link. Please use the link from your message.");
            setFetchingEmail(false);
          }
        })
        .catch(() => {
          setError("Invalid invitation link. Please use the link from your message.");
          setFetchingEmail(false);
        });
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

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccess(
        isSetup
          ? "Account password set successfully! Redirecting to login..."
          : "Password reset successfully! Redirecting to login..."
      );
      setTimeout(() => {
        router.push("/expert-login");
      }, 2000);
    } catch (err) {
      console.error("Password setup error:", err.message);
      setError(err.message || "Failed to set password. Please try again.");
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
        <h1 className="text-2xl font-bold text-center text-[#36013F] mb-4">
          {isSetup ? "Create Account Password" : "Create New Password"}
        </h1>
        {fetchingEmail ? (
          <p className="text-center text-gray-600">Loading details...</p>
        ) : (
          <>
            {email && (
              <p className="text-center text-sm text-gray-600 mb-4">
                {isSetup
                  ? "Set up your password for: "
                  : "Resetting password for: "}{" "}
                <span className="font-medium">{email}</span>
              </p>
            )}
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
                  className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#36013F]"
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
                  onChange={(e) => setNewConfirmPassword(e.target.value)}
                  className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#36013F]"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
              <button
                type="submit"
                disabled={loading || fetchingEmail}
                className={`w-full bg-[#36013F] hover:bg-[#4a1a5f] text-white py-3 rounded-xl font-semibold transition ${
                  (loading || fetchingEmail) ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading
                  ? isSetup ? "Setting up..." : "Resetting..."
                  : isSetup ? "Complete Setup" : "Set New Password"}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              Back to{" "}
              <Link href="/expert-login" className="text-[#36013F] hover:underline">
                Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
