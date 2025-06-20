
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";

const auth = getAuth(app);

export default function UserLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in successfully");
      router.push("/expert-dashboard/messages"); // Redirect to user dashboard after login
    }
    //  catch (err) {
    //   console.error("Login error:", err.message);
    //   setError(err.message);
    //   setLoading(false);

    // }
    catch (err) {
  // console.error("Login error:", err.code);
  if (
    err.code === "auth/user-not-found" ||
    err.code === "auth/wrong-password"
  ) {
    setError("Invalid email or password");
  } else if (err.code === "auth/invalid-credential") {
    setError("Please enter a valid email address");
  } else {
    setError("Something went wrong. Please try again later.");
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
        <h1 className="text-2xl font-bold text-center text-[#36013F] mb-4">Expert Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#36013F]"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-[#36013F]"
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#36013F] hover:bg-[#4a1a5f] text-white py-3 rounded-xl font-semibold transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
       <p className="mt-4 text-center text-sm text-gray-600">
          Forgot your password?{" "}
          <Link href="/expert-forgot-password" className="text-[#36013F] hover:underline">
            Reset it here
          </Link>
        </p>
      </div>
    </div>
  );
}