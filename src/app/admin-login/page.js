
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import Cookies from "js-cookie";

const auth = getAuth(app);

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserUid, setCurrentUserUid] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUserUid(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Firebase Sign In
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      const user = userCredential.user;

      // 2. Sync with Session Cookie for Middleware
      const res = await fetch("/api/login", { method: "POST" });
      
      if (res.ok) {
        // Check for admin claim immediately
        const idTokenResult = await user.getIdTokenResult();
        if (idTokenResult.claims.admin) {
          router.push("/dashboard/profiles");
        } else {
          setError("Authorized but missing 'admin' claim. See setup instructions below.");
        }
      } else {
        setError("Session error. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid Email or Password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#F4D35E] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border-t-8 border-[#36013F]">
        <div className="flex justify-center mb-6">
          <Image src="/dashboardlogo.svg" alt="Logo" width={160} height={40} priority />
        </div>
        <h2 className="text-2xl font-bold text-center text-[#36013F] mb-4">Admin Access</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Admin Email"
              value={credentials.email}
              onChange={handleChange}
              className="border border-gray-300 p-3 w-full rounded-xl focus:ring-2 focus:ring-[#36013F] outline-none"
              required
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              className="border border-gray-300 p-3 w-full rounded-xl focus:ring-2 focus:ring-[#36013F] outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#36013F] text-white py-3 rounded-xl font-bold transition flex items-center justify-center hover:bg-[#2a0131]"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Login"}
          </button>
        </form>

        {currentUserUid && !isLoading && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
            <p className="text-[10px] font-bold text-blue-800 uppercase mb-2">Development Helper</p>
            <p className="text-[11px] text-blue-700 mb-3">If you are logged in but can't access the dashboard, you need to grant yourself admin claims.</p>
            <code className="block bg-white p-2 rounded text-[10px] break-all border border-blue-200 mb-3">
              UID: {currentUserUid}
            </code>
            <a 
              href={`/api/admin/setup-first-admin?uid=${currentUserUid}&secret=${process.env.NEXT_PUBLIC_ADMIN_PASS}`}
              className="block text-center bg-blue-600 text-white text-xs py-2 rounded-lg font-bold hover:bg-blue-700 transition"
              target="_blank"
            >
              Grant Admin Role to this Account
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
