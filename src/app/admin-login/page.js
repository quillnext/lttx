"use client";

import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserUid, setCurrentUserUid] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setCurrentUserUid(session.user.id);
      } else {
        setCurrentUserUid(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Supabase Sign In
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) throw authError;

      // 2. Fetch profile to check role
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        setError("Access denied. You do not have administrator privileges.");
        return;
      }

      // 3. Set session cookie
      const res = await fetch("/api/login", { method: "POST" });
      
      if (res.ok) {
        router.push("/dashboard/profiles");
      } else {
        setError("Session error. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid Email or Password");
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

     
      </div>
    </div>
  );
}
