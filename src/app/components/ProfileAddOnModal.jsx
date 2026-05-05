"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ADDON_DATA = {
    "Itinerary Review": {
        name: "Get your itinerary reviewed",
        intro: "Paste or upload your current plan and tell the expert what you want checked.",
        cta: "Submit for review"
    },
    "Hotel/Area Check": {
        name: "Check your hotel area",
        intro: "Share the hotel or area you are considering and what matters most for your stay.",
        cta: "Check area"
    },
    "Flight Choice": {
        name: "Get help choosing your flight",
        intro: "Share the route and the flight options you are considering.",
        cta: "Get recommendation"
    },
    "Packing Checklist": {
        name: "Get your packing checklist",
        intro: "Share your destination and trip basics for a smarter checklist.",
        cta: "Get checklist"
    }
};

const CustomInput = ({ label, required, placeholder, type = "text", value, onChange }) => (
    <div className="mb-4">
        <label className="block text-[12px] font-bold text-[#36013F] mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === "textarea" ? (
            <textarea className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-[#FDC700] resize-none" placeholder={placeholder} rows={3} value={value || ""} onChange={onChange} />
        ) : (
            <input type={type} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-[#FDC700]" placeholder={placeholder} value={value || ""} onChange={onChange} />
        )}
    </div>
);

const ChipSelect = ({ label, required, options, multi = false, selected, onChange }) => (
    <div className="mb-4">
        <label className="block text-[12px] font-bold text-[#36013F] mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex flex-wrap gap-1.5">
            {options.map(opt => {
                const isSelected = multi ? selected?.includes(opt) : selected === opt;
                return (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => {
                            if (!onChange) return;
                            if (multi) {
                                const current = selected || [];
                                onChange(isSelected ? current.filter(c => c !== opt) : [...current, opt]);
                            } else {
                                onChange(opt);
                            }
                        }}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-bold border transition-all ${isSelected ? 'bg-[#36013F] text-white border-[#36013F]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#36013F]'}`}
                    >
                        {opt}
                    </button>
                );
            })}
        </div>
    </div>
);

export default function ProfileAddOnModal({ isOpen, onClose, addOnType }) {
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen || !addOnType) return null;
    const data = ADDON_DATA[addOnType];
    if (!data) return null;

    const updateForm = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1200);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]" />
                    <div className="fixed inset-0 z-[2001] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-[450px] shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                                <div>
                                    <h3 className="font-heading text-xl text-[#36013F] max-w-[90%]">{data.name}</h3>
                                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed pr-4">{data.intro}</p>
                                </div>
                                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-[#36013F] self-start mt-1"><X size={16} /></button>
                            </div>

                            <div className="p-6">
                                {isSuccess ? (
                                    <div className="text-center py-6">
                                        <div className="text-[#FDC700] mb-4 flex justify-center"><Upload size={40} /></div>
                                        <h4 className="font-bold text-[#36013F] mb-1">Submitted Successfully</h4>
                                        <p className="text-sm text-gray-500">The expert will review your request.</p>
                                        <button onClick={onClose} className="mt-6 px-6 py-2 bg-[#36013F] text-white rounded-lg text-xs font-bold uppercase tracking-widest">Done</button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        {addOnType === "Itinerary Review" && (
                                            <>
                                                <div className="mb-4">
                                                    <label className="block text-[12px] font-bold text-[#36013F] mb-1">Paste your itinerary or upload it <span className="text-red-500">*</span></label>
                                                    <textarea className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm mb-2" rows={3} placeholder="Paste day-wise plan here" value={formData.itinerary || ""} onChange={e => updateForm("itinerary", e.target.value)} />
                                                    <button type="button" className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-gray-300 rounded-lg text-[11px] text-gray-500 font-bold"><Upload size={14} /> Upload File</button>
                                                </div>
                                                <CustomInput label="Destination" required placeholder="Japan, Bali, Europe..." value={formData.dest || ""} onChange={e => updateForm("dest", e.target.value)} />
                                                <ChipSelect label="What should the expert focus on?" required multi options={["Too rushed", "Too expensive", "Poor route logic", "Missing experiences", "Hotel area doubts", "General review"]} selected={formData.focus} onChange={val => updateForm("focus", val)} />
                                                <CustomInput label="Any key preferences or constraints?" placeholder="Travelling with parents, want less walking, prefer comfort over rushing" type="textarea" value={formData.preferences || ""} onChange={e => updateForm("preferences", e.target.value)} />
                                            </>
                                        )}

                                        {addOnType === "Hotel/Area Check" && (
                                            <>
                                                <CustomInput label="Destination" required placeholder="Paris, Phuket, Dubai..." value={formData.dest || ""} onChange={e => updateForm("dest", e.target.value)} />
                                                <CustomInput label="Hotel name or area" required placeholder="Hotel name, neighbourhood, or shortlist" value={formData.hotelArea || ""} onChange={e => updateForm("hotelArea", e.target.value)} />
                                                <ChipSelect label="What matters most to you?" required multi options={["Connectivity", "Safety", "Luxury feel", "Sightseeing access", "Food options", "Family suitability", "Nightlife access", "Quiet stay"]} selected={formData.mattersMost} onChange={val => updateForm("mattersMost", val)} />
                                                <ChipSelect label="Trip type" options={["Couple", "Family", "Friends", "Business", "Solo"]} selected={formData.tripType} onChange={val => updateForm("tripType", val)} />
                                            </>
                                        )}

                                        {addOnType === "Flight Choice" && (
                                            <>
                                                <CustomInput label="Route" required placeholder="Delhi to Paris, Mumbai to Tokyo..." value={formData.route || ""} onChange={e => updateForm("route", e.target.value)} />
                                                <CustomInput label="Travel date" required type="date" value={formData.travelDate || ""} onChange={e => updateForm("travelDate", e.target.value)} />
                                                <div className="mb-4">
                                                    <label className="block text-[12px] font-bold text-[#36013F] mb-1">Add the flight options you are considering <span className="text-red-500">*</span></label>
                                                    <textarea className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm mb-2" rows={3} placeholder="Paste timings, airline names, fares, or upload screenshots" value={formData.flightOptions || ""} onChange={e => updateForm("flightOptions", e.target.value)} />
                                                    <button type="button" className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-gray-300 rounded-lg text-[11px] text-gray-500 font-bold"><Upload size={14} /> Upload screenshots</button>
                                                </div>
                                                <ChipSelect label="What matters most to you?" required options={["Lowest risk", "Best timing", "Lowest price", "Shortest journey", "Better baggage", "Better airline"]} selected={formData.mattersMost} onChange={val => updateForm("mattersMost", val)} />
                                            </>
                                        )}

                                        {addOnType === "Packing Checklist" && (
                                            <>
                                                <CustomInput label="Destination" required placeholder="Iceland, Singapore, Ladakh..." value={formData.dest || ""} onChange={e => updateForm("dest", e.target.value)} />
                                                <CustomInput label="Travel dates or month" required placeholder="Late December, first week of June..." value={formData.travelMonth || ""} onChange={e => updateForm("travelMonth", e.target.value)} />
                                                <ChipSelect label="Trip type" required options={["Leisure", "Honeymoon", "Family", "Business", "Adventure", "Beach", "Winter"]} selected={formData.tripType} onChange={val => updateForm("tripType", val)} />
                                                <CustomInput label="Trip duration" placeholder="5 days, 10 days..." value={formData.duration || ""} onChange={e => updateForm("duration", e.target.value)} />
                                            </>
                                        )}

                                        <button disabled={isSubmitting} type="submit" className="mt-6 w-full py-3 bg-[#FDC700] hover:bg-[#36013F] text-[#36013F] hover:text-[#FDC700] transition-colors rounded-xl font-black text-[12px] uppercase tracking-widest">
                                            {isSubmitting ? "Submitting..." : data.cta}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
