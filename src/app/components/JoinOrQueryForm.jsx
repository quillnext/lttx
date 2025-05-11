"use client";

import { useState } from "react";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { app } from "@/lib/firebase";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; // or 'bootstrap.css' / 'material.css'



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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "JoinQueries"), {
        ...formData,
        timestamp: Timestamp.now(),
      });
      // 👇 Call the server-side email route
await fetch("/api/send-expert-form", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(formData)
});

      setShowSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        purpose: "",
      });
    } catch (error) {
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
          Shape the Future of Travel Consultancy with Xmytravel.com
        </h2>
        <p className="text-primary">
          Step beyond the ordinary and join an elite, invite-only community where your expertise gets the recognition it deserves...
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

      <form onSubmit={handleSubmit} className="grid space-y-4 md:gap-x-4 md:grid-cols-2  grid-cols-1 items-start px-0 md:px-10">
        <input
          name="name"
          type="text"
          required
          placeholder="Full Name:"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border bg-white col-span-2 md:col-span-1"
        />
        {/* <input
          name="phone"
          type="tel"
          required
          placeholder="Phone Number:"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border bg-white col-span-2 md:col-span-1"
        /> */}

        {/* <PhoneInput
  country={"in"}
  value={formData.phone}
  onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
  inputProps={{
    name: "phone",
    required: true,
    autoFocus: false,
  }}
  containerClass="w-full px-4 py-3 rounded-xl border bg-white col-span-2 md:col-span-1"
  inputClass="w-full px-4 py-3 rounded-xl border bg-white col-span-2 md:col-span-1"
/> */}
 <PhoneInput
          country={"in"}
          value={formData.phone}
         onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
          placeholder="Enter phone number"
          inputProps={{
            id: "phone",
            className: "w-[100%]  p-3 border px-12 border-gray-300 rounded-xl bg-white",
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
