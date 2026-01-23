"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getFirestore, getDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSearchParams } from "next/navigation";
import { FaPaperPlane, FaSpinner } from "react-icons/fa";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const db = getFirestore(app);
const auth = getAuth(app);

export default function AskQuestionModal({ expert, onClose, sessionId }) {
  const searchParams = useSearchParams();
  const urlKeywordsParam = searchParams.get("keywords") || "";
  const urlKeywords = urlKeywordsParam === "all" ? [] : urlKeywordsParam.split(",").filter(k => k.trim());

  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [user, setUser] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem("userFormData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setName(parsedData.name || "");
      setEmail(parsedData.email || "");
      setPhone(parsedData.phone || "");
      setHasSubmitted(true);
      setIsEmailVerified(true);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || "");
        setEmail(currentUser.email || "");
        setPhone(currentUser.phoneNumber || "");
        setHasSubmitted(true);
        setIsEmailVerified(true);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    return () => {
      setQuestion("");
      setOtp("");
      setErrors({});
      setIsOtpSent(false);
      setIsEmailVerified(false);
    };
  }, []);

  useEffect(() => {
    setIsOtpSent(false);
    setIsEmailVerified(false);
    setOtp("");
  }, [email]);

  const validateForm = () => {
    const newErrors = {};
    if (!question.trim()) newErrors.question = "Question is required.";
    if (!(hasSubmitted || user)) {
      if (!name.trim()) newErrors.name = "Name is required.";
      if (!email.trim()) newErrors.email = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format.";
      if (!isEmailVerified) newErrors.email = "Please verify your email with OTP.";
      if (!phone.trim()) newErrors.phone = "Phone number is required.";
      else if (!/^\+?[1-9]\d{1,14}$/.test(phone)) newErrors.phone = "Invalid phone number.";
    }
    if (!expert?.id) newErrors.form = "Expert profile ID is missing.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email first.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userName: name }),
      });
      if (response.ok) {
        setIsOtpSent(true);
        toast.success("OTP sent to your email!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Error sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (data.verified) {
        setIsEmailVerified(true);
        toast.success("Email verified successfully!");
      } else {
        toast.error(data.error || "Invalid or expired OTP.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Error verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill out all required fields correctly.");
      return;
    }

    setLoading(true);
    try {
      // Snapshot the session data so experts can view it without accessing private Search history
      let sessionSnapshot = null;
      if (sessionId) {
        try {
          const sessionDoc = await getDoc(doc(db, "RecentSearches", sessionId));
          if (sessionDoc.exists()) {
            sessionSnapshot = sessionDoc.data();
          }
        } catch (err) {
          console.warn("Failed to fetch session snapshot:", err);
        }
      }

      await addDoc(collection(db, "Questions"), {
        expertId: expert.id,
        expertName: expert.fullName || "Unknown Expert",
        expertEmail: expert.email || "placeholder@xmytravel.com",
        question,
        userName: name,
        userEmail: email,
        userPhone: phone,
        status: "pending",
        isPublic: false,
        createdAt: new Date().toISOString(),
        sessionId: sessionId || null,
        sessionSnapshot: sessionSnapshot || null, // Snapshot of the search context
        reply: null,
      });

      if (!hasSubmitted && !user) {
        localStorage.setItem("userFormData", JSON.stringify({ name, email, phone, purpose: "General Query" }));
        setHasSubmitted(true);
      }

      // Proceed if expert has email OR it's a placeholder profile (handedOver is explicitly false)
      const isPlaceholder = expert.isHandedOver === false;
      const hasValidEmail = expert.email && expert.email.trim() && /\S+@\S+\.\S+/.test(expert.email);

      if (hasValidEmail || isPlaceholder) {
        const emailPayload = {
          userEmail: email,
          userName: name,
          expertEmail: expert.email || "info@xmytravel.com",
          expertName: expert.fullName || "Unknown Expert",
          question,
          userPhone: phone,
          keywords: urlKeywords,
          isHandedOver: expert.isHandedOver,
        };

        const response = await fetch("/api/send-question-emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to send emails: ${errorData.error || "Unknown error"}`);
        }
      }

      setQuestion("");
      if (!hasSubmitted && !user) {
        setName("");
        setEmail("");
        setPhone("");
        setOtp("");
        setIsOtpSent(false);
        setIsEmailVerified(false);
      }
      setErrors({});
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("AskQuestionModal: Error submitting question:", error.message);
      toast.error(`Failed to submit question: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 z-10 transition-colors">
          <X size={20} className="text-gray-600" />
        </button>

        <div className="p-4 pb-0 shrink-0">
          <div className="text-center mb-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#fceba7] text-[#36013F] mb-4 shadow-sm">
              <FaPaperPlane size={20} />
            </div>
            <h2 className="text-2xl font-black text-[#36013F] mb-2 leading-tight">
              Ask {expert?.fullName || "Expert"}
            </h2>
            <p className="text-sm text-gray-500">Get a direct answer to your travel query.</p>
          </div>
        </div>

        <div className="px-6 pb-8 overflow-y-auto custom-scrollbar flex-1">
          {success ? (
            <div className="h-full flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <FaPaperPlane size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-500 text-sm">We'll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Your Question
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className={`w-full p-3 border rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#36013F] focus:border-transparent transition-all outline-none resize-none ${errors.question ? "border-red-500" : "border-gray-200"
                    }`}
                  rows="3"
                  placeholder="What would you like to know?"
                  required
                />
                {errors.question && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.question}</p>
                )}
              </div>

              {!(hasSubmitted || user) && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full p-3 border rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#36013F] focus:border-transparent transition-all outline-none ${errors.name ? "border-red-500" : "border-gray-200"
                        }`}
                      placeholder="Enter your name"
                      required
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                      Email Address
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full p-3 border rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#36013F] focus:border-transparent transition-all outline-none ${errors.email ? "border-red-500" : "border-gray-200"
                            }`}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      {!isOtpSent && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="bg-gray-900 text-white px-4 rounded-xl font-bold text-xs hover:bg-black transition-colors shrink-0"
                          disabled={loading}
                        >
                          {loading ? <FaSpinner className="animate-spin" /> : "Verify"}
                        </button>
                      )}
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}

                    {isOtpSent && !isEmailVerified && (
                      <div className="mt-2 flex gap-2 animate-fade-in-up">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="flex-1 p-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#36013F] focus:border-transparent outline-none"
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="bg-green-600 text-white px-5 rounded-xl font-bold text-xs hover:bg-green-700 transition-colors shrink-0"
                          disabled={loading}
                        >
                          {loading ? <FaSpinner className="animate-spin" /> : "Confirm"}
                        </button>
                      </div>
                    )}
                    {isEmailVerified && (
                      <p className="text-green-600 text-xs mt-1 font-bold flex items-center gap-1">
                        ✓ Email Verified
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                      Phone Number
                    </label>
                    <PhoneInput
                      country={"in"}
                      value={phone}
                      onChange={(phone) => setPhone(`+${phone}`)}
                      placeholder="Enter phone number"
                      inputClass="!w-full !p-3 !pl-12 !border-gray-200 !rounded-xl !bg-gray-50 !text-gray-900 focus:!ring-2 focus:!ring-[#36013F] !h-auto"
                      buttonClass="!border-gray-200 !rounded-l-xl !bg-gray-100"
                      dropdownClass="!shadow-lg !rounded-xl"
                      inputProps={{
                        id: "phone",
                        required: true,
                      }}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (!(hasSubmitted || user) && !isEmailVerified)}
                className={`w-full py-3.5 rounded-full font-bold text-sm shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 ${loading || (!(hasSubmitted || user) && !isEmailVerified)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#36013F] text-white hover:bg-[#4a0152] hover:scale-[1.02]"
                  }`}
              >
                {loading ? <FaSpinner className="animate-spin" /> : <><FaPaperPlane /> Send Question</>}
              </button>
            </form>
          )}
        </div>
      </motion.div>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
}
