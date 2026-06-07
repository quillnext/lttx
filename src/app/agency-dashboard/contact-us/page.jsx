

"use client";

import { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { app, auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const db = getFirestore(app);

export default function ContactUs() {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    userId: "",
    email: "",
    name: "",
    timestamp: null,
    status: "pending", // Added default status
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Fetch current user details on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Authenticated user:", user); // Debug log
        const name = user.displayName || user.email?.split('@')[0] || "Anonymous";
        setFormData((prev) => ({
          ...prev,
          userId: user.uid,
          email: user.email || "",
          name: name,
          timestamp: Timestamp.now(),
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.subject.trim() || !formData.message.trim()) {
      setError("Subject and message are required.");
      return;
    }

    setLoading(true);

    try {
      console.log("Submitting form data:", formData); // Debug log
      const response = await fetch("/api/send-contact-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: formData.email,
          userName: formData.name,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to send email");

      // Save to Firestore with status
      await addDoc(collection(db, "ContactQueries"), {
        ...formData,
        timestamp: Timestamp.now(),
        status: formData.status, // Ensure status is saved
      });

      setMessage("Your message has been sent successfully! We will connect with you shortly.");
      setFormData((prev) => ({
        ...prev,
        subject: "",
        message: "",
      }));

      setTimeout(() => setMessage(""), 5000); // Clear message after 5 seconds
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#F4D35E]">
      <div className="text-gray-800 w-[80%] md:w-[60%]">
        <h1 className="text-2xl font-semibold mb-6 text-center">Contact Us</h1>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
          <div>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="Enter subject (e.g., Support Request)"
              className="w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#36013F]"
            />
          </div>
          <div>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#36013F]"
            />
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          {message && <p className="text-sm text-green-600 text-center">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#36013F] text-white py-3 rounded-xl hover:bg-[#4a0152] transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}