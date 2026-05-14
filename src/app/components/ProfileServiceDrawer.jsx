"use client";

import { useState, useEffect } from "react";
import { X, Upload, Calendar, Clock, IndianRupee, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUserAuthStore } from "@/stores/useUserAuthStore";

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

const CustomInput = ({ label, required, placeholder, limit, type = "text", ...props }) => (
  <div className="mb-5 last:mb-0">
    <label className="block text-sm font-bold text-[#36013F] mb-1">
      {label} {required ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal text-[10px] uppercase">(Optional)</span>}
    </label>
    {type === "textarea" ? (
      <textarea
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FDC700] focus:border-[#FDC700] transition-all resize-none"
        placeholder={placeholder}
        rows={4}
        {...props}
      />
    ) : (
      <input
        type={type}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FDC700] focus:border-[#FDC700] transition-all"
        placeholder={placeholder}
        {...props}
      />
    )}
    {limit && <p className="text-[10px] text-gray-400 mt-1 text-right">{limit}</p>}
  </div>
);

const ChipSelect = ({ label, required, options, multi = false, selected, onChange }) => (
  <div className="mb-5 last:mb-0">
    <label className="block text-sm font-bold text-[#36013F] mb-2">
      {label} {required ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal text-[10px] uppercase">(Optional)</span>}
    </label>
    <div className="flex flex-wrap gap-2">
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
            className={`px-4 py-2 rounded-lg text-[12px] font-bold border transition-all ${isSelected ? 'bg-[#36013F] text-white border-[#36013F]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#36013F]'}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

export default function ProfileServiceDrawer({ isOpen, onClose, serviceType, expertData }) {
  const { user } = useUserAuthStore();
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-save draft logic stub
  useEffect(() => {
    if (isOpen) {
      if (!isSubmitting && !isSuccess) {
        // Load draft for this serviceType if any
        // setFormData(JSON.parse(localStorage.getItem(`draft_${serviceType}`)));
      }
    }
  }, [isOpen, serviceType]);

  if (!isOpen || !serviceType) return null;

  const data = SERVICES_DATA[serviceType];
  if (!data) return null;

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderFormContent = () => {
    switch (serviceType) {
      case "1:1 STRATEGIC CONSULTATION":
        return (
          <>
            <CustomInput label="Where are you planning to travel?" required placeholder="Japan, Bali, Europe, Dubai..." value={formData.destination || ""} onChange={(e) => updateForm("destination", e.target.value)} />
            <div className="mb-5">
              <label className="block text-sm font-bold text-[#36013F] mb-2">When are you planning to travel? <span className="text-red-500">*</span></label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Start Date</label>
                    <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FDC700] outline-none" value={formData.startDate || ""} onChange={(e) => updateForm("startDate", e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">End Date</label>
                    <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FDC700] outline-none" value={formData.endDate || ""} onChange={(e) => updateForm("endDate", e.target.value)} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#36013F] focus:ring-[#36013F]" checked={formData.flexibleDates || false} onChange={e => updateForm("flexibleDates", e.target.checked)} /> Dates are flexible</label>
              </div>
            </div>
            <ChipSelect label="Who is travelling?" required options={["Solo", "Couple", "Family", "Friends", "Business"]} selected={formData.who} onChange={val => updateForm("who", val)} />
            {(formData.who === "Family" || formData.who === "Friends") && (
              <CustomInput label="Number of travellers" type="number" required placeholder="e.g. 4" value={formData.pax || ""} onChange={e => updateForm("pax", e.target.value)} />
            )}
            <ChipSelect label="What do you need help with?" required multi options={["Itinerary planning", "Flight choice", "Hotel area selection", "Visa guidance", "Budget planning", "Trip structure", "Multi-city routing", "General expert advice"]} selected={formData.helpWith} onChange={val => updateForm("helpWith", val)} />
            <CustomInput label="Tell the expert what you are confused about" type="textarea" required placeholder="We are planning 8 days in Japan and are confused whether to do Tokyo, Kyoto and Osaka or focus on just two cities. We want comfort, good food and not too much rushing." limit="80 to 500 characters" value={formData.confusion || ""} onChange={(e) => updateForm("confusion", e.target.value)} />
            <ChipSelect label="Have you already booked anything?" required options={["Nothing booked", "Flights booked", "Hotels booked", "Partially booked"]} selected={formData.booked} onChange={val => updateForm("booked", val)} />
            {formData.booked && formData.booked !== "Nothing booked" && (
              <div className="mb-5 p-4 border border-gray-200 rounded-xl bg-white">
                <label className="block text-sm font-bold text-[#36013F] mb-1">Add booking details or upload files <span className="text-gray-400 font-normal text-[10px] uppercase">(Optional)</span></label>
                <textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FDC700] mb-3 resize-none" placeholder="Paste flight, hotel or itinerary details here" rows={4} value={formData.bookingDetails || ""} onChange={(e) => updateForm("bookingDetails", e.target.value)} />
                <button type="button" className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 rounded-lg text-sm font-bold hover:border-[#36013F] transition-all"><Upload size={16} /> Upload screenshots or PDFs</button>
              </div>
            )}
          </>
        );

      case "ASK A QUESTION":
        return (
          <>
            <CustomInput label="Your question" required placeholder="Is 7 days enough for Switzerland and Italy together?" limit="Max 90 characters" value={formData.question || ""} onChange={e => updateForm("question", e.target.value)} maxLength={90} />
            <CustomInput label="Add context" type="textarea" required placeholder="We are a couple travelling in June from Delhi. We want scenic places, not too much rushing, and a mid-range budget." limit="50 to 400 characters" value={formData.context || ""} onChange={e => updateForm("context", e.target.value)} />
            <CustomInput label="Destination or route" placeholder="Europe, Vietnam, Delhi to Bali..." value={formData.dest || ""} onChange={e => updateForm("dest", e.target.value)} />
            <CustomInput label="Travel dates or month" placeholder="June 2026, first week of October..." value={formData.dates || ""} onChange={e => updateForm("dates", e.target.value)} />
            <div className="mb-5">
              <label className="block text-sm font-bold text-[#36013F] mb-1">Upload supporting screenshot or file <span className="text-gray-400 font-normal text-[10px] uppercase">(Optional)</span></label>
              <button type="button" className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 rounded-xl text-sm font-bold hover:border-[#36013F] transition-all"><Upload size={16} /> Upload PDF, JPG, PNG</button>
            </div>
          </>
        );

      case "THE MASTER PLAN":
        return (
          <>
            <CustomInput label="Destination(s)" required placeholder="Japan, Spain + Portugal, South Africa..." value={formData.dest || ""} onChange={e => updateForm("dest", e.target.value)} />
            <div className="mb-5">
              <label className="block text-sm font-bold text-[#36013F] mb-2">Trip dates <span className="text-red-500">*</span></label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Start Date</label>
                    <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FDC700] outline-none" value={formData.startDate || ""} onChange={(e) => updateForm("startDate", e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">End Date</label>
                    <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FDC700] outline-none" value={formData.endDate || ""} onChange={(e) => updateForm("endDate", e.target.value)} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#36013F] focus:ring-[#36013F]" checked={formData.flexibleDates || false} onChange={e => updateForm("flexibleDates", e.target.checked)} /> Dates are flexible</label>
              </div>
            </div>
            <ChipSelect label="Number and type of travellers" required options={["Solo", "Couple", "Family", "Friends", "Business"]} selected={formData.who} onChange={val => updateForm("who", val)} />
            {formData.who && formData.who !== "Solo" && (
              <CustomInput label="Total Number of Travellers" type="number" required placeholder="e.g. 4" value={formData.pax || ""} onChange={e => updateForm("pax", e.target.value)} />
            )}
            <ChipSelect label="Approximate budget" required options={["Budget", "Comfortable", "Premium", "Luxury", "Not sure yet"]} selected={formData.budget} onChange={val => updateForm("budget", val)} />
            <ChipSelect label="What kind of trip do you want?" required multi options={["Relaxing", "Experiential", "Fast-paced", "Nature", "Culture", "Food", "Shopping", "Nightlife", "Luxury", "Adventure"]} selected={formData.type} onChange={val => updateForm("type", val)} />
            <ChipSelect label="What do you want the expert to help structure?" required multi options={["Route planning", "City split", "Hotel area choice", "Flight logic", "Day flow", "Budget fit", "Family suitability"]} selected={formData.structure} onChange={val => updateForm("structure", val)} />

            {/* Progressive Disclosure */}
            {((formData.who === "Family") || (formData.budget === "Premium" || formData.budget === "Luxury")) && (
              <div className="my-6 p-5 border border-[#36013F]/20 bg-[#36013F]/5 rounded-2xl">
                <h4 className="text-[#36013F] font-bold text-sm mb-4 flex items-center gap-2"><Info size={16} /> Add more preferences <span className="opacity-60 font-normal text-xs">(Optional)</span></h4>
                <CustomInput label="Hotel style" placeholder="e.g. Boutique, Resort, Chain..." />
                <CustomInput label="Flight preference" placeholder="e.g. Direct flights only, Business class..." />
                <CustomInput label="Pace preference" placeholder="e.g. Relaxed, early start..." />
                <CustomInput label="Special occasion" placeholder="e.g. Honeymoon, 50th Birthday..." />
              </div>
            )}

            <CustomInput label="Share any must-haves or constraints" type="textarea" placeholder="travelling with parents, need easy movement, want one luxury stay, vegetarian food preference" value={formData.mustHaves || ""} onChange={e => updateForm("mustHaves", e.target.value)} />
          </>
        );

      case "CUSTOM LUXE PACKAGE":
        return (
          <>
            <CustomInput label="Destination or trip idea" required placeholder="Greece honeymoon, Europe summer, luxury safari..." value={formData.dest || ""} onChange={e => updateForm("dest", e.target.value)} />
            <div className="mb-5">
              <label className="block text-sm font-bold text-[#36013F] mb-2">Travel dates <span className="text-red-500">*</span></label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">Start Date</label>
                    <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FDC700] outline-none" value={formData.startDate || ""} onChange={(e) => updateForm("startDate", e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">End Date</label>
                    <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#FDC700] outline-none" value={formData.endDate || ""} onChange={(e) => updateForm("endDate", e.target.value)} />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#36013F] focus:ring-[#36013F]" checked={formData.flexibleDates || false} onChange={e => updateForm("flexibleDates", e.target.checked)} /> Dates are flexible</label>
              </div>
            </div>
            <CustomInput label="Number of travellers" type="number" required placeholder="" value={formData.pax || ""} onChange={e => updateForm("pax", e.target.value)} />
            <ChipSelect label="Budget expectation" required options={["₹1L to ₹2L pp", "₹2L to ₹4L pp", "₹4L+ pp", "Not sure yet"]} selected={formData.budget} onChange={val => updateForm("budget", val)} />
            <CustomInput label="What kind of experience are you looking for?" type="textarea" required placeholder="private transfers, premium stays, relaxed pace, scenic places, good food, minimal planning stress" value={formData.exp || ""} onChange={e => updateForm("exp", e.target.value)} />
            <CustomInput label="WhatsApp number" required placeholder="Enter WhatsApp number" value={formData.whatsapp || ""} onChange={e => updateForm("whatsapp", e.target.value)} />
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Basic validation
    if (serviceType === "ASK A QUESTION" && !formData.question) return;
    if (serviceType === "1:1 STRATEGIC CONSULTATION" && !formData.destination) return;
    if (serviceType === "THE MASTER PLAN" && !formData.dest) return;
    if (serviceType === "CUSTOM LUXE PACKAGE" && !formData.dest) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('leads')
        .insert([{
          service_type: serviceType,
          form_data: formData,
          expert_id: expertData?.id || "unknown",
          expert_name: expertData?.fullName || "Unknown Expert",
          status: "pending",
          user_name: user?.name || formData.name || "Traveller",
          user_email: user?.email || formData.email || "",
          user_phone: user?.phone || formData.phone || formData.whatsapp || "",
          // Flatten some common fields for easier querying/display if needed
          destination: formData.destination || formData.dest || "",
          trip_dates: (formData.startDate && formData.endDate) ? `${formData.startDate} to ${formData.endDate}` : (formData.dates || ""),
          source: 'profile_v2'
        }]);

      if (error) throw error;
      
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting lead to Supabase:", error);
      alert("Submission failed. Please try again.");
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
                {/* <div className="flex items-center gap-1.5 font-bold text-[#36013F]"><IndianRupee size={14} /> {data.price}</div> */}
                <div className="flex items-start gap-1.5 text-gray-600 flex-1 whitespace-pre-line"> <span>{data.delivery}</span></div>
              </div>

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




                    {renderFormContent()}

                    <p className="text-center font-bold text-gray-400 text-[11px] mt-8 mb-8 pb-4 italic">“The more relevant context you share, the sharper the expert response will be.”</p>
                  </form>
                )}
              </div>

              {/* Footer CTA */}
              {!isSuccess && (
                <div className="p-4 md:p-6 rounded-bl-3xl border-t border-gray-100 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.05)] sticky bottom-0">
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
