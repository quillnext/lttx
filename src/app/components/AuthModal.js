"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const db = dynamic(() => import("@/lib/firebase").then(mod => mod.getFirestore(mod.app)), { ssr: false });
const collection = dynamic(() => import("firebase/firestore").then(mod => mod.collection), { ssr: false });
const addDoc = dynamic(() => import("firebase/firestore").then(mod => mod.addDoc), { ssr: false });
const auth = dynamic(() => import("@/lib/firebase").then(mod => mod.auth), { ssr: false });
const googleProvider = dynamic(() => import("@/lib/firebase").then(mod => mod.googleProvider), { ssr: false });
const signInWithPopup = dynamic(() => import("firebase/auth").then(mod => mod.signInWithPopup), { ssr: false });

export default function AuthModal({ onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid.";
    if (!phone.trim()) newErrors.phone = "Phone number is required.";
    else if (!/^\+?[1-9]\d{1,14}$/.test(phone)) newErrors.phone = "Phone number is invalid.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (!auth || !googleProvider || !signInWithPopup) throw new Error("Firebase auth not available");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      localStorage.setItem("userFormData", JSON.stringify({
        name: user.displayName || "",
        email: user.email || "",
        phone: user.phoneNumber || "",
      }));
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Google login error:", error.message);
      setErrors({ form: "Failed to log in with Google. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (!db || !collection || !addDoc) throw new Error("Firestore not available");
      await addDoc(collection(db, "UserProfiles"), {
        name,
        email,
        phone,
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem("userFormData", JSON.stringify({ name, email, phone }));
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error.message);
      setErrors({ form: "Failed to save user information. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">✕</button>
        <h2 className="text-2xl font-semibold text-[var(--primary)] mb-4">Please Log In or Register</h2>
        {success ? (
          <p className="text-green-500">Information saved successfully! Closing...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.name ? "border-red-500" : ""}`}
                placeholder="Enter your name"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.email ? "border-red-500" : ""}`}
                placeholder="Enter your email"
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <PhoneInput
                country={"in"}
                value={phone}
                onChange={setPhone}
                placeholder="Enter phone number"
                inputProps={{
                  id: "phone",
                  className: `p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.phone ? "border-red-500" : ""}`,
                  required: true,
                }}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            {errors.form && <p className="text-red-500 text-sm mt-1">{errors.form}</p>}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[var(--primary)] text-white p-3 rounded-xl hover:bg-[#4a0150] transition font-semibold ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Submitting..." : "Register"}
            </button>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`w-full bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition font-semibold ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Logging in..." : "Login with Google"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}