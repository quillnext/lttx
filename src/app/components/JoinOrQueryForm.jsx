"use client";

import { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, Timestamp, getDocs, getDoc, doc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useRouter } from "next/navigation";
import { FaCheckCircle, FaSpinner, FaPaperPlane, FaLock } from 'react-icons/fa';

const db = getFirestore(app);

export default function JoinLTTXForm({ onSuccess, isModal = false, sessionId, includeMessageField = true }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    purpose: "General Query",
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const router = useRouter();

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const extractKeywords = (text) => {
    if (!text) return [];
    const stopWords = [
      "the", "is", "in", "and", "or", "but", "a", "an", "for", "with", "to",
      "at", "by", "from", "on", "of", "need", "help", "i", "you", "we",
    ];
    const words = text
      .toLowerCase()
      .match(/\b\w+\b/g) || [];
    return [...new Set(words)]
      .filter(word => word.length > 2 && !stopWords.includes(word));
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      alert("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, userName: formData.name }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setResendTimer(60);
        // alert("OTP sent to your email.");
      } else {
        alert(data.error || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Error sending OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      alert("Please enter the OTP.");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setIsVerified(true);
        // alert("Email verified successfully!");
      } else {
        alert(data.error || "Invalid OTP.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enforce OTP Verification
    if (!isVerified) {
      if (!otpSent) {
        await handleSendOtp();
      } else {
        alert("Please verify the OTP sent to your email.");
      }
      return;
    }

    setLoading(true);

    try {
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

      // Save form data to Firestore
      await addDoc(collection(db, "JoinQueries"), {
        ...formData,
        timestamp: Timestamp.now(),
        verified: true,
        sessionId: sessionId || null,
        sessionSnapshot: sessionSnapshot || null // Snapshot of the search context
      });

      // Send form data to API
      await fetch("/api/send-expert-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      setShowSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        purpose: "General Query",
      });
      setOtpSent(false);
      setIsVerified(false);
      setOtp("");

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }

      // Handle navigation for General Query (Only if not a modal usage)
      if (!isModal && formData.message) {
        const keywords = extractKeywords(formData.message);
        if (keywords.length > 0) {
          const experts = await getDocs(collection(db, "Profiles"));
          const filteredExperts = experts.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(expert => {
              const searchableFields = [
                expert.fullName || "",
                expert.title || "",
                expert.tagline || "",
                expert.about || "",
                expert.certifications || "",
                expert.companies || "",
                expert.languages || "",
                expert.location || "",
                (expert.expertise || []).join(" "),
                (expert.regions || []).join(" "),
                ...(expert.experience || []).map(
                  (exp) => `${exp.company || ""} ${exp.title || ""}`
                ),
              ].join(" ").toLowerCase();
              return keywords.some(keyword => searchableFields.includes(keyword));
            });

          if (filteredExperts.length > 0) {
            router.push('/');
          }
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Submission failed. Try again.");
    } finally {
      setLoading(false);
      if (!isModal) {
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }
  };

  return (
    <div className={`${isModal ? 'w-full' : 'bg-[#F4D35E] w-full rounded-3xl shadow-lg md:p-10 p-6'} text-[#36013F]`} id="apply">
      {!isModal && (
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-primary mb-4">
            Join Us
          </h2>
          <p className="text-primary">
            Whether you’re a traveller seeking truth or a professional ready to share it, Xmytravel is your platform
          </p>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#36013F] bg-opacity-30 z-[60]">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-lg">
            <h3 className="text-lg font-semibold text-green-700 mb-2 w-[300px]">Success!</h3>
            <p className="text-gray-700">Your details have been submitted.</p>
            {!onSuccess && (
              <button
                className="mt-4 px-6 py-2 bg-[#36013F] text-white rounded-full hover:bg-[#4e1a60] transition"
                onClick={() => setShowSuccess(false)}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`grid space-y-4 md:gap-x-4 md:grid-cols-2 grid-cols-1 items-start ${isModal ? '' : 'px-0 md:px-10'}`}>
        <input
          name="name"
          type="text"
          required
          placeholder="Full Name:"
          value={formData.name}
          onChange={handleChange}
          disabled={loading || otpSent}
          className="w-full px-4 py-3 rounded-xl border bg-white col-span-2 md:col-span-1"
        />

        <PhoneInput
          country={"in"}
          value={formData.phone}
          onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
          disabled={loading || otpSent}
          placeholder="Enter phone number"
          inputProps={{
            id: "phone",
            className: "w-[100%] p-3 border px-12 border-gray-300 rounded-xl bg-white",
            required: true,
            autoFocus: false,
          }}
        />

        {/* Email Field with Verification Status */}
        <div className="col-span-2 md:col-span-2 relative">
          <input
            name="email"
            type="email"
            required
            placeholder="Email Address:"
            value={formData.email}
            onChange={handleChange}
            disabled={loading || otpSent || isVerified}
            className={`w-full px-4 py-3 rounded-xl border bg-white ${isVerified ? 'border-green-500 ring-1 ring-green-500' : ''}`}
          />
          {isVerified && <FaCheckCircle className="absolute right-4 top-4 text-green-500" />}
        </div>

        {/* OTP Input Section */}
        {otpSent && !isVerified && (
          <div className="col-span-2 flex items-center gap-2 animate-fade-in text-sm">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-[#36013F] bg-white font-bold tracking-widest text-center"
              maxLength={6}
            />
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={verifying}
              className="bg-[#36013F] text-white px-4 py-3 rounded-xl font-bold hover:bg-opacity-90"
            >
              {verifying ? <FaSpinner className="animate-spin" /> : "Verify"}
            </button>
          </div>
        )}

        {/* Resend Timer */}
        {otpSent && !isVerified && (
          <div className="col-span-2 text-right">
            {resendTimer > 0 ? (
              <span className="text-xs text-gray-500">Resend OTP in {resendTimer}s</span>
            ) : (
              <button type="button" onClick={handleSendOtp} className="text-xs underline text-[#36013F] font-bold">Resend OTP</button>
            )}
          </div>
        )}



        {includeMessageField && (
          <textarea
            name="message"
            required
            placeholder="Tell us more about your query..."
            value={formData.message}
            onChange={handleChange}
            rows={4}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border bg-white col-span-2"
          />
        )}

        <div className="col-span-2 flex justify-center mt-4">
          {!isVerified ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading || otpSent} // Disable if loading or if OTP is already sent (waiting for verify)
              className={`px-10 py-3 rounded-full font-medium transition flex items-center gap-2 ${loading || (otpSent && !isVerified)
                ? "bg-gray-400 text-white" // Don't show cursor-not-allowed, just gray out to indicate 'action required elsewhere'
                : "bg-[#36013F] text-white hover:bg-[#4e1a60]"
                }`}
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaLock />}
              {otpSent ? "Verify OTP First" : "Get OTP & Proceed"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className={`px-10 py-3 rounded-full font-bold transition flex items-center gap-2 ${loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[#36013F] text-white hover:bg-[#4e1a60] shadow-lg hover:scale-105 transform"
                }`}
            >
              {loading ? "Submitting..." : <>Proceed <FaPaperPlane size={14} /></>}
            </button>
          )}

        </div>
      </form>
    </div>
  );
}