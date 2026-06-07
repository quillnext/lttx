"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../pages/Footer";

const auth = getAuth(app);

export default function UserLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("expert");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in successfully");
      const user = userCredential.user;

      let redirectUrl = role === "agency" ? "/agency-dashboard/messages" : "/expert-dashboard/messages";

      try {
        const profileRef = doc(db, "Profiles", user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const dbProfileType = profileSnap.data().profileType;
          if (dbProfileType === "agency") {
            redirectUrl = "/agency-dashboard/messages";
          } else if (dbProfileType === "expert") {
            redirectUrl = "/expert-dashboard/messages";
          }
        } else {
          // Fallback to Supabase
          const { supabase } = await import("@/lib/supabase");
          const { getProfileByUidOrEmail } = await import("@/lib/supabaseProfile");
          const data = await getProfileByUidOrEmail(supabase, user.uid, user.email);
          if (data) {
            if (data.profile_type === "agency") {
              redirectUrl = "/agency-dashboard/messages";
            } else if (data.profile_type === "expert") {
              redirectUrl = "/expert-dashboard/messages";
            }
          }
        }
      } catch (profileErr) {
        console.error("Error checking profile type:", profileErr);
      }

      router.push(redirectUrl);
    }
    catch (err) {
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
  <>
    <div className="flex justify-center items-center h-screen bg-[#F4D35E] px-4">
      <Navbar/>
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
          {role === "expert" ? "Expert Login" : "Agency Login"}
        </h1>
        
        {/* Role Toggle Selector */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setRole("expert")}
            className={`flex-1 py-2 text-center text-sm font-semibold rounded-xl transition-all duration-200 ${
              role === "expert"
                ? "bg-[#36013F] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Expert
          </button>
          <button
            type="button"
            onClick={() => setRole("agency")}
            className={`flex-1 py-2 text-center text-sm font-semibold rounded-xl transition-all duration-200 ${
              role === "agency"
                ? "bg-[#36013F] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Agency
          </button>
        </div>

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
         <Link href="/complete-profile" className="text-[#36013F] hover:underline">
           New to Xmytravel? Sign up here
         </Link>
         <br />
         
          Forgot your password?{" "}
          <Link href="/expert-forgot-password" className="text-[#36013F] hover:underline">
            Reset it here
          </Link>
        </p>
      </div>
    
    </div>
     <div className="-mt-30">
       <Footer/>
     </div>
  </>
  );
}