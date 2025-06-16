"use client";

import { useState } from "react";
import { collection, addDoc, getFirestore } from "firebase/firestore";
import { app } from "@/lib/firebase";

const db = getFirestore(app);

export default function AskQuestionModal({ expert, onClose }) {
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateStep1 = () => {
    if (!question.trim()) {
      setErrors({ question: "Question is required." });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid.";
    if (!phone.trim()) newErrors.phone = "Phone number is required.";
    else if (!/^\+?[1-9]\d{1,14}$/.test(phone)) newErrors.phone = "Phone number is invalid.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setErrors({});
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      // Save to Firestore
      const docRef = await addDoc(collection(db, "Questions"), {
        expertId: expert.id,
        expertName: expert.fullName,
        expertEmail: expert.email,
        question,
        userName: name,
        userEmail: email,
        userPhone: phone,
        status: "pending",
        createdAt: new Date().toISOString(),
        reply: null,
      });

      // Send emails via API route
      const response = await fetch("/api/send-question-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: email,
          userName: name,
          expertEmail: expert.email,
          expertName: expert.fullName,
          question,
          userPhone: phone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send emails");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting question:", error.message);
      setErrors({ form: "Failed to submit question. Please try again." });
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} // Fallback for opacity
    >
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-2xl font-semibold text-[var(--primary)] mb-4">
          {step === 1 ? `Ask a Question to ${expert.fullName}` : "Step 2: Enter Contact Info"}
        </h2>
        {success ? (
          <p className="text-green-500">Question submitted successfully! Closing...</p>
        ) : (
          <form onSubmit={step === 1 ? (e) => e.preventDefault() : handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Write your question here
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className={`mt-1 p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.question ? "border-red-500" : ""}`}
                    rows="4"
                    required
                  />
                  {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question}</p>}
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-[var(--primary)] text-white p-3 rounded-xl hover:bg-[#4a0150] transition font-semibold"
                >
                  Next
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.name ? "border-red-500" : ""}`}
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
                    required
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`p-3 w-full border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.phone ? "border-red-500" : ""}`}
                    required
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                {errors.form && <p className="text-red-500 text-sm mt-1">{errors.form}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-[var(--primary)] text-white p-3 rounded-xl hover:bg-[#4a0150] transition font-semibold ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}