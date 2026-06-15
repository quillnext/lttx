"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Calendar, Clock, IndianRupee, Info, CheckCircle, Loader, FileText, ImageIcon, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUserAuthStore } from "@/stores/useUserAuthStore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SERVICES_DATA = {
  "1:1 STRATEGIC CONSULTATION": {
    name: "1:1 Strategic Consultation",
    expectation: "Get direct guidance on your trip, plans, options, or doubts. Share a few essentials so the expert can prepare properly.",
    intro: "Book a 1:1 strategic consultation. Get direct guidance on your trip, plans, options, or doubts. Share a few essentials so the expert can prepare properly.",
    delivery: "Session format: 30-minute consultation\nScheduling: Choose a preferred slot after submitting\nIdeal for: Trip planning, route clarity, flight strategy, visa or travel decision-making",
    price: "₹799",
  },
  "ASK A QUESTION": {
    name: "Ask a travel question",
    expectation: "Ask one clear question and share just enough context for a useful answer.",
    intro: "Ask a travel question. Ask one clear question and share just enough context for a useful answer.",
    delivery: "Response format: Expert-written answer\nResponse time: Usually within 2 hours\nIdeal for: One specific doubt, quick route or planning clarification",
    price: "₹299",
  },
  "THE MASTER PLAN": {
    name: "Start your Master Plan",
    expectation: "Share your trip basics and preferences. The expert will use this to shape a more complete travel recommendation.",
    intro: "Start your Master Plan. Share your trip basics and preferences. The expert will use this to shape a more complete travel recommendation.",
    delivery: "Delivery format: Structured expert planning recommendation\nIdeal for: Multi-day trips, first-time destination planning, route and stay strategy",
    price: "₹1099",
  },
  "CUSTOM LUXE PACKAGE": {
    name: "Request a custom luxe package",
    expectation: "Tell us the essentials. This helps the expert assess scope and connect with you for a personalised package.",
    intro: "Request a custom luxe package. Tell us the essentials. This helps the expert assess scope and connect with you for a personalised package.",
    delivery: "Next step: Expert follow-up after request review\nIdeal for: High-touch, premium, private, celebration, or multi-service travel planning",
    price: "Quote Based",
  }
};

const CustomInput = ({ label, required, placeholder, limit, type = "text", error, ...props }) => (
  <div className="mb-5 last:mb-0">
    <label className="block text-sm font-bold text-[#36013F] mb-1">
      {label} {required ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal text-[10px] uppercase">(Optional)</span>}
    </label>
    {type === "textarea" ? (
      <textarea
        className={`w-full bg-gray-50 border rounded-xl p-3 text-sm focus:ring-2 focus:border-[#FDC700] transition-all resize-none ${error ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-[#FDC700]"}`}
        placeholder={placeholder}
        rows={4}
        {...props}
      />
    ) : (
      <input
        type={type}
        className={`w-full bg-gray-50 border rounded-xl p-3 text-sm focus:ring-2 focus:border-[#FDC700] transition-all ${error ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-[#FDC700]"}`}
        placeholder={placeholder}
        {...props}
      />
    )}
    {error
      ? <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>
      : limit && <p className="text-[10px] text-gray-400 mt-1 text-right">{limit}</p>
    }
  </div>
);

const ChipSelect = ({ label, required, options, multi = false, selected, onChange, error }) => (
  <div className="mb-5 last:mb-0">
    <label className="block text-sm font-bold text-[#36013F] mb-2">
      {label} {required ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal text-[10px] uppercase">(Optional)</span>}
    </label>
    <div className={`flex flex-wrap gap-2 p-2 rounded-xl transition-all ${error ? "border border-red-300 bg-red-50" : ""}`}>
      {options.map(opt => {
        const isSelected = multi ? selected?.includes(opt) : selected === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => {
              if (multi) {
                const current = selected || [];
                onChange(isSelected ? current.filter(c => c !== opt) : [...current, opt]);
              } else {
                onChange(opt);
              }
            }}
            className={`px-4 py-2 rounded-lg text-[12px] font-bold border transition-all ${isSelected ? "bg-[#36013F] text-white border-[#36013F]" : "bg-white text-gray-600 border-gray-200 hover:border-[#36013F]"}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
    {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}
  </div>
);

const getPriceAmount = (price) => {
  const value = String(price || "").replace(/[^\d]/g, "");
  return value ? Number(value) : 0;
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function ProfileServiceDrawer({ isOpen, onClose, serviceType, expertData }) {
  const { user, updateUser } = useUserAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [uploadState, setUploadState] = useState({ uploading: false, fileName: "", fileUrl: "", error: "" });
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setUploadState(s => ({ ...s, error: "Only JPG, PNG, WebP or PDF files are allowed." }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadState(s => ({ ...s, error: "File must be under 10 MB." }));
      return;
    }

    setUploadState({ uploading: true, fileName: file.name, fileUrl: "", error: "" });
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "lead-uploads");
      fd.append("namePrefix", `lead_${Date.now()}`);

      const res = await fetch("/api/profile-assets/upload", { method: "POST", body: fd });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      setUploadState({ uploading: false, fileName: file.name, fileUrl: result.publicUrl, error: "" });
      updateForm("uploadedFileUrl", result.publicUrl);
      updateForm("uploadedFileName", file.name);
    } catch (err) {
      setUploadState({ uploading: false, fileName: file.name, fileUrl: "", error: err.message });
    }
  };

  const clearUpload = () => {
    setUploadState({ uploading: false, fileName: "", fileUrl: "", error: "" });
    updateForm("uploadedFileUrl", "");
    updateForm("uploadedFileName", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (isOpen) {
      if (!user) {
        // Include the clicked service in the returnTo URL so we can re-open
        // the drawer automatically after the user logs in
        const params = new URLSearchParams(searchParams.toString());
        params.set("openService", serviceType);
        const currentUrl = `${pathname}?${params.toString()}`;
        router.push(`/user-login?returnTo=${encodeURIComponent(currentUrl)}`);
        onClose();
      }
    }
  }, [isOpen, user, router, onClose, pathname, searchParams, serviceType]);

  if (!isOpen || !serviceType) return null;

  const data = SERVICES_DATA[serviceType];
  if (!data) return null;

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
    // Date fields share one error key
    if ((key === "startDate" || key === "flexibleDates") && fieldErrors.dates) {
      setFieldErrors(prev => { const n = { ...prev }; delete n.dates; return n; });
    }
  };

  const validate = () => {
    const e = {};
    if (serviceType === "1:1 STRATEGIC CONSULTATION") {
      if (!formData.destination?.trim()) e.destination = "Please enter your travel destination";
      if (!formData.startDate && !formData.flexibleDates) e.dates = "Please enter travel dates or check 'Dates are flexible'";
      if (!formData.who) e.who = "Please select who is travelling";
      if ((formData.who === "Family" || formData.who === "Friends") && !formData.pax)
        e.pax = "Please enter the number of travellers";
      if (!formData.helpWith?.length) e.helpWith = "Please select at least one area you need help with";
      if (!formData.confusion?.trim()) {
        e.confusion = "Please describe what you're confused about";
      } else if (formData.confusion.trim().length < 80) {
        e.confusion = `Too short — write at least 80 characters (${formData.confusion.trim().length}/80)`;
      }
      if (!formData.booked) e.booked = "Please select your booking status";
      if (!formData.phone?.trim()) e.phone = "Please enter your WhatsApp / phone number";
    }

    if (serviceType === "ASK A QUESTION") {
      if (!formData.question?.trim()) e.question = "Please enter your question";
      if (!formData.context?.trim()) {
        e.context = "Please add some context so the expert can give a useful answer";
      } else if (formData.context.trim().length < 50) {
        e.context = `Too short — write at least 50 characters (${formData.context.trim().length}/50)`;
      }
      if (!formData.phone?.trim()) e.phone = "Please enter your WhatsApp / phone number";
    }

    if (serviceType === "THE MASTER PLAN") {
      if (!formData.dest?.trim()) e.dest = "Please enter your destination(s)";
      if (!formData.startDate && !formData.flexibleDates) e.dates = "Please enter travel dates or check 'Dates are flexible'";
      if (!formData.who) e.who = "Please select who is travelling";
      if (formData.who && formData.who !== "Solo" && !formData.pax)
        e.pax = "Please enter the number of travellers";
      if (!formData.budget) e.budget = "Please select your approximate budget";
      if (!formData.type?.length) e.type = "Please select at least one trip type";
      if (!formData.structure?.length) e.structure = "Please select at least one area for the expert to help with";
      if (!formData.phone?.trim()) e.phone = "Please enter your WhatsApp / phone number";
    }

    if (serviceType === "CUSTOM LUXE PACKAGE") {
      if (!formData.dest?.trim()) e.dest = "Please enter your destination or trip idea";
      if (!formData.pax) e.pax = "Please enter the number of travellers";
      if (!formData.budget) e.budget = "Please select your budget expectation";
      if (!formData.exp?.trim()) e.exp = "Please describe the experience you're looking for";
      if (!formData.whatsapp?.trim()) e.whatsapp = "Please enter your WhatsApp number";
    }

    return e;
  };

  const today = new Date().toISOString().split("T")[0];

  const renderContactInfo = () => null;

  const renderPhoneField = () => (
    <CustomInput
      label="WhatsApp / Phone number"
      required
      placeholder="e.g. +91 98765 43210"
      value={formData.phone || ""}
      onChange={(e) => updateForm("phone", e.target.value)}
      error={fieldErrors.phone}
    />
  );

  const renderFormContent = () => {
    switch (serviceType) {
      case "1:1 STRATEGIC CONSULTATION":
        return (
          <>
            <CustomInput label="Where are you planning to travel?" required placeholder="Japan, Bali, Europe, Dubai..." value={formData.destination || ""} onChange={(e) => updateForm("destination", e.target.value)} error={fieldErrors.destination} />
            <div className="mb-5">
              <label className="block text-sm font-bold text-[#36013F] mb-2">When are you planning to travel? <span className="text-red-500">*</span></label>
              <div className={`flex flex-col gap-3 p-2 rounded-xl transition-all ${fieldErrors.dates ? "border border-red-300 bg-red-50" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Start Date</label>
                    <input type="date" className={`w-full bg-gray-50 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FDC700] outline-none ${fieldErrors.dates ? "border-red-400" : "border-gray-200"}`} min={today} value={formData.startDate || ""} onChange={(e) => updateForm("startDate", e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">End Date</label>
                    <input type="date" className={`w-full bg-gray-50 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FDC700] outline-none ${fieldErrors.dates ? "border-red-400" : "border-gray-200"}`} min={formData.startDate || today} value={formData.endDate || ""} onChange={(e) => updateForm("endDate", e.target.value)} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#36013F] focus:ring-[#36013F]" checked={formData.flexibleDates || false} onChange={e => updateForm("flexibleDates", e.target.checked)} /> Dates are flexible</label>
              </div>
              {fieldErrors.dates && <p className="text-xs text-red-500 font-semibold mt-1">{fieldErrors.dates}</p>}
            </div>
            <ChipSelect label="Who is travelling?" required options={["Solo", "Couple", "Family", "Friends", "Business"]} selected={formData.who} onChange={val => updateForm("who", val)} error={fieldErrors.who} />
            {(formData.who === "Family" || formData.who === "Friends") && (
              <CustomInput label="Number of travellers" type="number" required placeholder="e.g. 4" value={formData.pax || ""} onChange={e => updateForm("pax", e.target.value)} error={fieldErrors.pax} />
            )}
            <ChipSelect label="What do you need help with?" required multi options={["Itinerary planning", "Flight choice", "Hotel area selection", "Visa guidance", "Budget planning", "Trip structure", "Multi-city routing", "General expert advice"]} selected={formData.helpWith} onChange={val => updateForm("helpWith", val)} error={fieldErrors.helpWith} />
            <CustomInput label="Tell the expert what you are confused about" type="textarea" required placeholder="We are planning 8 days in Japan and are confused whether to do Tokyo, Kyoto and Osaka or focus on just two cities. We want comfort, good food and not too much rushing." limit="80 to 500 characters" value={formData.confusion || ""} onChange={(e) => updateForm("confusion", e.target.value)} error={fieldErrors.confusion} />
            <ChipSelect label="Have you already booked anything?" required options={["Nothing booked", "Flights booked", "Hotels booked", "Partially booked"]} selected={formData.booked} onChange={val => updateForm("booked", val)} error={fieldErrors.booked} />
            {formData.booked && formData.booked !== "Nothing booked" && (
              <div className="mb-5 p-4 border border-gray-200 rounded-xl bg-white">
                <label className="block text-sm font-bold text-[#36013F] mb-1">Add booking details or upload files <span className="text-gray-400 font-normal text-[10px] uppercase">(Optional)</span></label>
                <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FDC700] mb-3 resize-none" placeholder="Paste flight, hotel or itinerary details here" rows={4} value={formData.bookingDetails || ""} onChange={(e) => updateForm("bookingDetails", e.target.value)} />
                {uploadState.fileUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <FileText size={18} className="text-green-600 shrink-0" />
                    <p className="text-sm font-bold text-green-800 flex-1 truncate">{uploadState.fileName}</p>
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                    <button type="button" onClick={clearUpload} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadState.uploading}
                    className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 rounded-lg text-sm font-bold hover:border-[#36013F] transition-all disabled:opacity-60"
                  >
                    {uploadState.uploading
                      ? <><Loader size={14} className="animate-spin" /> Uploading...</>
                      : <><Upload size={14} /> Upload screenshots or PDFs</>}
                  </button>
                )}
              </div>
            )}

            {renderPhoneField()}
          </>
        );

      case "ASK A QUESTION":
        return (
          <>
            <CustomInput label="Your question" required placeholder="Is 7 days enough for Switzerland and Italy together?" limit="Max 90 characters" value={formData.question || ""} onChange={e => updateForm("question", e.target.value)} maxLength={90} error={fieldErrors.question} />
            <CustomInput label="Add context" type="textarea" required placeholder="We are a couple travelling in June from Delhi. We want scenic places, not too much rushing, and a mid-range budget." limit="50 to 400 characters" value={formData.context || ""} onChange={e => updateForm("context", e.target.value)} error={fieldErrors.context} />
            <CustomInput label="Destination or route" placeholder="Europe, Vietnam, Delhi to Bali..." value={formData.dest || ""} onChange={e => updateForm("dest", e.target.value)} />
            <CustomInput label="Travel dates or month" placeholder="June 2026, first week of October..." value={formData.dates || ""} onChange={e => updateForm("dates", e.target.value)} />
            <div className="mb-5">
              <label className="block text-sm font-bold text-[#36013F] mb-1">
                Upload supporting screenshot or file{" "}
                <span className="text-gray-400 font-normal text-[10px] uppercase">(Optional)</span>
              </label>
              {uploadState.fileUrl ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                  {formData.uploadedFileName?.match(/\.pdf$/i)
                    ? <FileText size={20} className="text-green-600 shrink-0" />
                    : <ImageIcon size={20} className="text-green-600 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-green-800 truncate">{uploadState.fileName}</p>
                    <p className="text-[10px] text-green-600">Uploaded successfully</p>
                  </div>
                  <CheckCircle size={16} className="text-green-500 shrink-0" />
                  <button type="button" onClick={clearUpload} className="text-red-400 hover:text-red-600 shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadState.uploading}
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 rounded-xl text-sm font-bold hover:border-[#36013F] hover:text-[#36013F] transition-all disabled:opacity-60"
                >
                  {uploadState.uploading
                    ? <><Loader size={16} className="animate-spin" /> Uploading...</>
                    : <><Upload size={16} /> Upload PDF, JPG, PNG (max 10 MB)</>}
                </button>
              )}
              {uploadState.error && (
                <p className="text-xs text-red-500 font-semibold mt-1">{uploadState.error}</p>
              )}
            </div>
            {renderPhoneField()}
          </>
        );

      case "THE MASTER PLAN":
        return (
          <>
            <CustomInput label="Destination(s)" required placeholder="Japan, Spain + Portugal, South Africa..." value={formData.dest || ""} onChange={e => updateForm("dest", e.target.value)} error={fieldErrors.dest} />
            <div className="mb-5">
              <label className="block text-sm font-bold text-[#36013F] mb-2">Trip dates <span className="text-red-500">*</span></label>
              <div className={`flex flex-col gap-3 p-2 rounded-xl transition-all ${fieldErrors.dates ? "border border-red-300 bg-red-50" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Start Date</label>
                    <input type="date" className={`w-full bg-gray-50 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FDC700] outline-none ${fieldErrors.dates ? "border-red-400" : "border-gray-200"}`} min={today} value={formData.startDate || ""} onChange={(e) => updateForm("startDate", e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">End Date</label>
                    <input type="date" className={`w-full bg-gray-50 border rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FDC700] outline-none ${fieldErrors.dates ? "border-red-400" : "border-gray-200"}`} min={formData.startDate || today} value={formData.endDate || ""} onChange={(e) => updateForm("endDate", e.target.value)} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#36013F] focus:ring-[#36013F]" checked={formData.flexibleDates || false} onChange={e => updateForm("flexibleDates", e.target.checked)} /> Dates are flexible</label>
              </div>
              {fieldErrors.dates && <p className="text-xs text-red-500 font-semibold mt-1">{fieldErrors.dates}</p>}
            </div>
            <ChipSelect label="Number and type of travellers" required options={["Solo", "Couple", "Family", "Friends", "Business"]} selected={formData.who} onChange={val => updateForm("who", val)} error={fieldErrors.who} />
            {formData.who && formData.who !== "Solo" && (
              <CustomInput label="Total Number of Travellers" type="number" required placeholder="e.g. 4" value={formData.pax || ""} onChange={e => updateForm("pax", e.target.value)} error={fieldErrors.pax} />
            )}
            <ChipSelect label="Approximate budget" required options={["Budget", "Comfortable", "Premium", "Luxury", "Not sure yet"]} selected={formData.budget} onChange={val => updateForm("budget", val)} error={fieldErrors.budget} />
            <ChipSelect label="What kind of trip do you want?" required multi options={["Relaxing", "Experiential", "Fast-paced", "Nature", "Culture", "Food", "Shopping", "Nightlife", "Luxury", "Adventure"]} selected={formData.type} onChange={val => updateForm("type", val)} error={fieldErrors.type} />
            <ChipSelect label="What do you want the expert to help structure?" required multi options={["Route planning", "City split", "Hotel area choice", "Flight logic", "Day flow", "Budget fit", "Family suitability"]} selected={formData.structure} onChange={val => updateForm("structure", val)} error={fieldErrors.structure} />

            {/* Progressive Disclosure */}
            {((formData.who === "Family") || (formData.budget === "Premium" || formData.budget === "Luxury")) && (
              <div className="my-6 p-5 border border-[#36013F]/20 bg-[#36013F]/5 rounded-2xl">
                <h4 className="text-[#36013F] font-bold text-sm mb-4 flex items-center gap-2"><Info size={16} /> Add more preferences <span className="opacity-60 font-normal text-xs">(Optional)</span></h4>
                <CustomInput label="Hotel style" placeholder="e.g. Boutique, Resort, Chain..." value={formData.hotelStyle || ""} onChange={e => updateForm("hotelStyle", e.target.value)} />
                <CustomInput label="Flight preference" placeholder="e.g. Direct flights only, Business class..." value={formData.flightPreference || ""} onChange={e => updateForm("flightPreference", e.target.value)} />
                <CustomInput label="Pace preference" placeholder="e.g. Relaxed, early start..." value={formData.pacePreference || ""} onChange={e => updateForm("pacePreference", e.target.value)} />
                <CustomInput label="Special occasion" placeholder="e.g. Honeymoon, 50th Birthday..." value={formData.specialOccasion || ""} onChange={e => updateForm("specialOccasion", e.target.value)} />
              </div>
            )}

            <CustomInput label="Share any must-haves or constraints" type="textarea" placeholder="travelling with parents, need easy movement, want one luxury stay, vegetarian food preference" value={formData.mustHaves || ""} onChange={e => updateForm("mustHaves", e.target.value)} />
            {renderPhoneField()}
          </>
        );

      case "CUSTOM LUXE PACKAGE":
        return (
          <>
            <CustomInput label="Destination or trip idea" required placeholder="Greece honeymoon, Europe summer, luxury safari..." value={formData.dest || ""} onChange={e => updateForm("dest", e.target.value)} error={fieldErrors.dest} />
            <div className="mb-5">
              <label className="block text-sm font-bold text-[#36013F] mb-2">Travel dates <span className="text-gray-400 font-normal text-[10px] uppercase">(Optional)</span></label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Start Date</label>
                    <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FDC700] outline-none" min={today} value={formData.startDate || ""} onChange={(e) => updateForm("startDate", e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">End Date</label>
                    <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FDC700] outline-none" min={formData.startDate || today} value={formData.endDate || ""} onChange={(e) => updateForm("endDate", e.target.value)} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#36013F] focus:ring-[#36013F]" checked={formData.flexibleDates || false} onChange={e => updateForm("flexibleDates", e.target.checked)} /> Dates are flexible</label>
              </div>
            </div>
            <CustomInput label="Number of travellers" type="number" required placeholder="e.g. 4" value={formData.pax || ""} onChange={e => updateForm("pax", e.target.value)} error={fieldErrors.pax} />
            <ChipSelect label="Budget expectation" required options={["₹1L to ₹2L pp", "₹2L to ₹4L pp", "₹4L+ pp", "Not sure yet"]} selected={formData.budget} onChange={val => updateForm("budget", val)} error={fieldErrors.budget} />
            <CustomInput label="What kind of experience are you looking for?" type="textarea" required placeholder="private transfers, premium stays, relaxed pace, scenic places, good food, minimal planning stress" value={formData.exp || ""} onChange={e => updateForm("exp", e.target.value)} error={fieldErrors.exp} />
            <CustomInput label="WhatsApp number" required placeholder="Enter WhatsApp number" value={formData.whatsapp || ""} onChange={e => updateForm("whatsapp", e.target.value)} error={fieldErrors.whatsapp} />
          </>
        );

      default:
        return null;
    }
  };

  const getCTA = () => {
    switch (serviceType) {
      case "1:1 STRATEGIC CONSULTATION": return "Continue to schedule";
      case "ASK A QUESTION": return "Submit question";
      case "THE MASTER PLAN": return "Submit planning brief";
      case "CUSTOM LUXE PACKAGE": return "Request package";
      default: return "Submit";
    }
  };

  const collectPayment = async () => {
    const amount = getPriceAmount(data.price);
    if (!amount) return null;

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error("Unable to load Razorpay checkout. Please try again.");
    }

    const orderResponse = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `svc_${Date.now()}`,
      }),
    });

    const order = await orderResponse.json();
    if (!orderResponse.ok || !order.id) {
      throw new Error(order.error || "Failed to create payment order.");
    }

    return new Promise((resolve, reject) => {
      const checkout = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "XmyTravel",
        description: data.name,
        order_id: order.id,
        prefill: {
          name: formData.name || "",
          email: formData.email || "",
          contact: formData.whatsapp || formData.phone || "",
        },
        notes: {
          serviceType,
          expertId: expertData?.id || "unknown",
        },
        theme: { color: "#36013F" },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verification = await verifyResponse.json();

            if (!verifyResponse.ok || !verification.verified) {
              reject(new Error(verification.error || "Payment verification failed."));
              return;
            }

            resolve({ order, response, amount });
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => reject(new Error("Payment was cancelled.")),
        },
      });

      checkout.open();
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setValidationError("");

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setValidationError("Please fill in all required fields highlighted below.");
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);
    try {
      const payment = await collectPayment();

      const userPhone = formData.phone || formData.whatsapp || user?.phone || "";

      const { error } = await supabase
        .from('leads')
        .insert([{
          service_type: serviceType,
          form_data: {
            ...formData,
            phone: userPhone,
            payment: payment
              ? {
                  status: "paid",
                  amount: payment.amount,
                  orderId: payment.response?.razorpay_order_id || payment.order?.id || null,
                  paymentId: payment.response?.razorpay_payment_id || null,
                }
              : { status: "not_required" },
          },
          expert_id: expertData?.id || "unknown",
          expert_name: expertData?.fullName || "Unknown Expert",
          status: "pending",
          user_name: user?.name || "Traveller",
          user_email: user?.email || "",
          destination: formData.destination || formData.dest || "",
          trip_dates: (formData.startDate && formData.endDate) ? `${formData.startDate} to ${formData.endDate}` : (formData.dates || ""),
          source: 'profile_v2'
        }]);

      if (error) throw error;
      
      // Update user auth store if they are logged in to persist contact details
      if (user && formData.whatsapp) {
        updateUser({
          phone: formData.whatsapp || user.phone
        });
      }

      const questionText = formData.confusion || formData.question || formData.exp || formData.mustHaves || `Lead form submitted for ${serviceType}`;
      const finalEmail = user?.email;
      const finalName = user?.name || "Traveller";
      const finalPhone = userPhone;

      if (finalEmail && expertData?.email) {
        const emailRequest = fetch("/api/send-question-emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: finalName,
            userEmail: finalEmail,
            userPhone: finalPhone,
            expertName: expertData?.fullName || "XMyTravel Expert",
            expertEmail: expertData.email,
            expertPhone: expertData?.phone || "",
            serviceType,
            question: questionText,
            isHandedOver: true
          }),
          keepalive: true,
        }).catch((emailError) => {
          console.error("Failed to send email notification", emailError);
        });
        void emailRequest;
      }

      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting lead to Supabase:", error?.message || error?.details || JSON.stringify(error));
      setValidationError(error?.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full rounded-tl-3xl  rounded-bl-3xl w-full md:w-[500px] bg-white z-[2001] shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col pt-0 md:pt-0 pb-0"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Header */}
              <div className="p-6 rounded-tl-3xl border-b border-gray-100 flex items-start justify-between bg-[#36013F] text-white">
                <div>
                  <h2 className="text-xl font-bold tracking-tight mb-2">{data.name}</h2>
                  <p className="text-[12px] opacity-80 leading-snug">{data.expectation}</p>
                </div>
                <button onClick={onClose} className="w-10 h-10 flex shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"><X size={20} /></button>
              </div>

              {/* Service Meta info */}
              <div className="bg-[#36013F]/5 p-4 border-b border-gray-100 flex flex-wrap gap-4 text-[12px]">
                <div className="flex items-center gap-1.5 font-bold text-[#36013F]"><IndianRupee size={14} /> {data.price}</div>
                <div className="flex items-start gap-1.5 text-gray-600 flex-1 whitespace-pre-line"> <span>{data.delivery}</span></div>
              </div>

              {/* Shared hidden file input — used by any upload button in any service form */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={handleFileUpload}
              />

              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto w-full no-scrollbar">
                {isSuccess ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4"><Calendar size={32} /></div>
                    <h3 className="text-xl font-bold text-[#36013F] mb-2">Request Received</h3>
                    <p className="text-sm text-gray-500">Your brief has been shared. The expert will review and proceed shortly.</p>
                    <button onClick={onClose} className="mt-8 px-6 py-3 bg-[#36013F] text-white rounded-xl font-bold text-sm">Close Window</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col h-full">

                    {renderContactInfo()}

                    {renderFormContent()}

                    <p className="text-center font-bold text-gray-400 text-[11px] mt-8 mb-8 pb-4 italic">“The more relevant context you share, the sharper the expert response will be.”</p>
                  </form>
                )}
              </div>

              {/* Footer CTA */}
              {!isSuccess && (
                <div className="p-4 md:p-6 rounded-bl-3xl border-t border-gray-100 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.05)] sticky bottom-0">
                  {validationError && (
                    <p className="text-xs font-semibold text-red-600 mb-3 text-center bg-red-50 border border-red-200 rounded-xl p-2">
                      {validationError}
                    </p>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-[#FDC700] hover:bg-[#36013F] text-[#36013F] hover:text-[#FDC700] transition-colors py-4 rounded-xl font-black uppercase tracking-widest shadow-lg active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isSubmitting ? "Submitting..." : getCTA()}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
