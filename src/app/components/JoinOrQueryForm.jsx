

"use client";

import { useState } from "react";
import { getFirestore, collection, addDoc, Timestamp, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useRouter } from "next/navigation";

const db = getFirestore(app);

export default function JoinLTTXForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    purpose: "",
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save form data to Firestore
      await addDoc(collection(db, "JoinQueries"), {
        ...formData,
        timestamp: Timestamp.now(),
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
        purpose: "",
      });

      // Handle navigation for General Query and I'm a Traveller
      if (["General Query", "I'm a Traveller"].includes(formData.purpose) && formData.message) {
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
            router.push(`/ask-an-expert?keywords=${encodeURIComponent(keywords.join(","))}`);
          } else {
            alert("No matching experts found. Try different keywords.");
          }
        } else {
          alert("Please provide more details in your query to find relevant experts.");
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Submission failed. Try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="bg-[#F4D35E] w-full rounded-3xl shadow-lg md:p-10 text-[#36013F] p-6" id="apply">
      <div className="text-center mb-8 max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-primary mb-4">
          Join Us
        </h2>
        <p className="text-primary">
          Whether you’re a traveller seeking truth or a professional ready to share it, Xmytravel is your platform
        </p>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#36013F] bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-lg">
            <h3 className="text-lg font-semibold text-green-700 mb-2 w-[300px]">Success!</h3>
            <p className="text-gray-700">Your form has been submitted.</p>
            <button
              className="mt-4 px-6 py-2 bg-[#36013F] text-white rounded-full hover:bg-[#4e1a60] transition"
              onClick={() => setShowSuccess(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid space-y-4 md:gap-x-4 md:grid-cols-2 grid-cols-1 items-start px-0 md:px-10">
        <input
          name="name"
          type="text"
          required
          placeholder="Full Name:"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border bg-white col-span-2 md:col-span-1"
        />

        <PhoneInput
          country={"in"}
          value={formData.phone}
          onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
          placeholder="Enter phone number"
          inputProps={{
            id: "phone",
            className: "w-[100%] p-3 border px-12 border-gray-300 rounded-xl bg-white",
            required: true,
            autoFocus: false,
          }}
        />
        
        <input
          name="email"
          type="email"
          required
          placeholder="Email Address:"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border bg-white col-span-2 md:col-span-1"
        />
        <select
          name="purpose"
          required
          value={formData.purpose}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border bg-white col-span-2 md:col-span-1"
        >
          <option value="" disabled>
            What best describes your intent?
          </option>
          <option value="Join as an Expert">Join as an Expert</option>
          <option value="I'm a Traveller">I'm a Traveller</option>
          <option value="General Query">General Query</option>
        </select>
        <textarea
          name="message"
          required
          placeholder="Tell us more about your query or expertise"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border bg-white col-span-2"
        />

        <div className="col-span-2 flex justify-center mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-10 py-3 rounded-full font-medium transition ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[#36013F] text-white hover:bg-[#4e1a60]"
            }`}
          >
            {loading ? "Submitting..." : "Proceed"}
          </button>
        </div>
      </form>
    </div>
  );
}