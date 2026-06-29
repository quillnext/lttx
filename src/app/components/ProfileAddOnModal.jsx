"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, CheckCircle, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUserAuthStore } from "@/stores/useUserAuthStore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

const ADDON_DATA = {
  "Itinerary Review": {
    name: "Get your itinerary reviewed",
    intro: "Paste your current plan and tell the expert what you want checked.",
    cta: "Submit for review",
    price: "₹199",
  },
  "Hotel/Area Check": {
    name: "Check your hotel area",
    intro: "Share the hotel or area you're considering and what matters most for your stay.",
    cta: "Check area",
    price: "₹149",
  },
  "Flight Choice": {
    name: "Get help choosing your flight",
    intro: "Share the route and the flight options you are considering.",
    cta: "Get recommendation",
    price: "₹149",
  },
  "Packing Checklist": {
    name: "Get your packing checklist",
    intro: "Share your destination and trip basics for a smarter checklist.",
    cta: "Get checklist",
    price: "₹99",
  },
};

const getPriceAmount = (price) => {
  const value = String(price || "").replace(/[^\d]/g, "");
  return value ? Number(value) : 0;
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined") { resolve(false); return; }
    if (window.Razorpay) { resolve(true); return; }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Field = ({ label, required, placeholder, type = "text", value, onChange, error, min }) => (
  <div className="mb-4">
    <label className="block text-[12px] font-bold text-[#36013F] mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === "textarea" ? (
      <textarea
        className={`w-full bg-gray-50 border rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#FDC700] resize-none transition-all ${error ? "border-red-400" : "border-gray-200"}`}
        placeholder={placeholder} rows={4} value={value || ""} onChange={onChange}
      />
    ) : (
      <input
        type={type} min={min}
        className={`w-full bg-gray-50 border rounded-xl p-3 text-sm focus:ring-1 focus:ring-[#FDC700] transition-all ${error ? "border-red-400" : "border-gray-200"}`}
        placeholder={placeholder} value={value || ""} onChange={onChange}
      />
    )}
    {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}
  </div>
);

const Chips = ({ label, required, options, multi = false, selected, onChange, error }) => (
  <div className="mb-4">
    <label className="block text-[12px] font-bold text-[#36013F] mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className={`flex flex-wrap gap-1.5 p-1.5 rounded-xl transition-all ${error ? "border border-red-300 bg-red-50" : ""}`}>
      {options.map(opt => {
        const sel = multi ? selected?.includes(opt) : selected === opt;
        return (
          <button key={opt} type="button"
            onClick={() => {
              if (!onChange) return;
              if (multi) {
                const cur = selected || [];
                onChange(sel ? cur.filter(c => c !== opt) : [...cur, opt]);
              } else { onChange(opt); }
            }}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${sel ? "bg-[#36013F] text-white border-[#36013F]" : "bg-white text-gray-600 border-gray-200 hover:border-[#36013F]"}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
    {error && <p className="text-xs text-red-500 font-semibold mt-1">{error}</p>}
  </div>
);

export default function ProfileAddOnModal({ isOpen, onClose, addOnType, expertData }) {
  const { user: supabaseUser } = useUserAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");
  const fileInputRef = useRef(null);
  const [activeUser, setActiveUser] = useState(null);
  const [loadingActiveUser, setLoadingActiveUser] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged(async (fUser) => {
      if (fUser) {
        try {
          const res = await fetch(`/api/profile/by-uid?uid=${encodeURIComponent(fUser.uid)}&email=${encodeURIComponent(fUser.email || "")}`);
          if (res.ok) {
            const result = await res.json();
            if (result.profile) {
              setActiveUser({
                name: result.profile.full_name || result.profile.fullName || fUser.displayName || "Agency/Expert",
                email: fUser.email || result.profile.email || "",
                phone: result.profile.phone || fUser.phoneNumber || "",
                id: result.profile.id,
              });
              setLoadingActiveUser(false);
              return;
            }
          }
        } catch (e) {}
        setActiveUser({
          name: fUser.displayName || "Agency/Expert",
          email: fUser.email || "",
          phone: fUser.phoneNumber || "",
        });
      } else if (supabaseUser) {
        try {
          const uid = supabaseUser.id;
          const res = await fetch(`/api/profile/by-uid?uid=${encodeURIComponent(uid)}&email=${encodeURIComponent(supabaseUser.email || "")}`);
          if (res.ok) {
            const result = await res.json();
            if (result.profile) {
              setActiveUser({
                name: result.profile.full_name || result.profile.fullName || supabaseUser.name || "Agency/Expert",
                email: supabaseUser.email || result.profile.email || "",
                phone: result.profile.phone || supabaseUser.phone || "",
                id: result.profile.id,
              });
              setLoadingActiveUser(false);
              return;
            }
          }
        } catch (e) {}
        setActiveUser({
          name: supabaseUser.name || "Traveller",
          email: supabaseUser.email || "",
          phone: supabaseUser.phone || "",
        });
      } else {
        setActiveUser(null);
      }
      setLoadingActiveUser(false);
    });
    return () => unsubscribe();
  }, [supabaseUser]);

  useEffect(() => {
    if (isOpen && !loadingActiveUser) {
      if (!activeUser) {
        const isAgencyDashboard = pathname?.startsWith("/agency-dashboard");
        if (isAgencyDashboard) {
          router.push("/expert-login");
        } else {
          const qs = searchParams.toString();
          const currentUrl = `${pathname}${qs ? `?${qs}` : ""}`;
          router.push(`/user-login?returnTo=${encodeURIComponent(currentUrl)}`);
        }
        onClose();
      }
    }
  }, [isOpen, activeUser, loadingActiveUser, router, onClose, pathname, searchParams]);

  if (!isOpen || !addOnType) return null;
  const data = ADDON_DATA[addOnType];
  if (!data) return null;

  const today = new Date().toISOString().split("T")[0];

  const update = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) setFieldErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const validate = () => {
    const e = {};
    if (addOnType === "Itinerary Review") {
      if (!formData.itinerary?.trim()) e.itinerary = "Please paste your itinerary";
      if (!formData.dest?.trim()) e.dest = "Please enter your destination";
      if (!formData.focus?.length) e.focus = "Please select at least one focus area";
    }
    if (addOnType === "Hotel/Area Check") {
      if (!formData.dest?.trim()) e.dest = "Please enter your destination";
      if (!formData.hotelArea?.trim()) e.hotelArea = "Please enter the hotel name or area";
      if (!formData.mattersMost?.length) e.mattersMost = "Please select what matters most";
    }
    if (addOnType === "Flight Choice") {
      if (!formData.route?.trim()) e.route = "Please enter your route";
      if (!formData.travelDate) e.travelDate = "Please select a travel date";
      if (!formData.flightOptions?.trim()) e.flightOptions = "Please describe the flight options you're considering";
      if (!formData.mattersMost) e.mattersMost = "Please select what matters most";
    }
    if (addOnType === "Packing Checklist") {
      if (!formData.dest?.trim()) e.dest = "Please enter your destination";
      if (!formData.travelMonth?.trim()) e.travelMonth = "Please enter your travel dates or month";
      if (!formData.tripType) e.tripType = "Please select your trip type";
    }
    return e;
  };

  const collectPayment = async () => {
    const amount = getPriceAmount(data.price);
    if (!amount) return null;

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) throw new Error("Unable to load Razorpay checkout. Please try again.");

    const orderRes = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency: "INR", receipt: `addon_${Date.now()}` }),
    });
    const order = await orderRes.json();
    if (!orderRes.ok || !order.id) throw new Error(order.error || "Failed to create payment order.");

    return new Promise((resolve, reject) => {
      const checkout = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "XmyTravel",
        description: data.name,
        order_id: order.id,
        prefill: { name: activeUser?.name || "", email: activeUser?.email || "" },
        notes: { addOnType, expertId: expertData?.id || "unknown" },
        theme: { color: "#36013F" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verification = await verifyRes.json();
            if (!verifyRes.ok || !verification.verified) {
              reject(new Error(verification.error || "Payment verification failed."));
              return;
            }
            resolve({ order, response, amount });
          } catch (err) { reject(err); }
        },
        modal: { ondismiss: () => reject(new Error("Payment was cancelled.")) },
      });
      checkout.open();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      const questionText =
        formData.itinerary?.substring(0, 300) ||
        formData.flightOptions?.substring(0, 300) ||
        `${addOnType} — ${formData.dest || formData.route || ""}`;

      const { error } = await supabase.from("leads").insert([{
        service_type: addOnType,
        form_data: {
          ...formData,
          payment: payment
            ? { status: "paid", amount: payment.amount, orderId: payment.response?.razorpay_order_id || payment.order?.id || null, paymentId: payment.response?.razorpay_payment_id || null }
            : { status: "not_required" },
        },
        expert_id: expertData?.id || "unknown",
        expert_name: expertData?.fullName || "Unknown Expert",
        status: "pending",
        user_name: activeUser?.name || "Traveller",
        user_email: activeUser?.email || "",
        destination: formData.dest || formData.route || "",
        trip_dates: formData.travelDate || formData.travelMonth || "",
        source: "addon_modal",
      }]);

      if (error) throw error;

      if (activeUser?.email) {
        fetch("/api/send-question-emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expertId: expertData?.id,
            userName: activeUser?.name || "Traveller",
            userEmail: activeUser.email,
            userPhone: activeUser?.phone || "",
            expertName: expertData?.fullName || "XMyTravel Expert",
            expertEmail: expertData?.email || "",
            expertPhone: expertData?.phone || "",
            serviceType: addOnType,
            question: questionText,
            isHandedOver: true,
          }),
          keepalive: true,
        }).catch(() => {});
      }

      setIsSuccess(true);
    } catch (err) {
      setValidationError(err?.message || "Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]" />
          <div className="fixed inset-0 z-[2001] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-start p-5 border-b border-gray-100 bg-[#36013F] text-white">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{data.price}</p>
                  <h3 className="font-bold text-lg leading-snug">{data.name}</h3>
                  <p className="text-[11px] opacity-70 mt-1 leading-relaxed pr-4">{data.intro}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white shrink-0 mt-1"><X size={16} /></button>
              </div>

              {/* Scrollable form */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {isSuccess ? (
                  <div className="text-center py-12 px-6">
                    <div className="w-14 h-14 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={28} /></div>
                    <h4 className="font-bold text-[#36013F] text-lg mb-1">Submitted Successfully</h4>
                    <p className="text-sm text-gray-500">The expert will review your request and respond shortly.</p>
                    <button onClick={onClose} className="mt-6 px-6 py-3 bg-[#36013F] text-white rounded-xl text-xs font-bold uppercase tracking-widest">Done</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="p-5">
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf" />

                    {addOnType === "Itinerary Review" && (
                      <>
                        <div className="mb-4">
                          <label className="block text-[12px] font-bold text-[#36013F] mb-1">Paste your itinerary <span className="text-red-500">*</span></label>
                          <textarea className={`w-full bg-gray-50 border rounded-xl p-3 text-sm mb-2 resize-none ${fieldErrors.itinerary ? "border-red-400" : "border-gray-200"}`} rows={4} placeholder="Day 1: Arrive Tokyo, check into hotel near Shinjuku...&#10;Day 2: ..." value={formData.itinerary || ""} onChange={e => update("itinerary", e.target.value)} />
                          {fieldErrors.itinerary && <p className="text-xs text-red-500 font-semibold -mt-1 mb-2">{fieldErrors.itinerary}</p>}
                         
                        </div>
                        <Field label="Destination" required placeholder="Japan, Bali, Europe..." value={formData.dest} onChange={e => update("dest", e.target.value)} error={fieldErrors.dest} />
                        <Chips label="What should the expert focus on?" required multi options={["Too rushed", "Too expensive", "Poor route logic", "Missing experiences", "Hotel area doubts", "General review"]} selected={formData.focus} onChange={val => update("focus", val)} error={fieldErrors.focus} />
                        <Field label="Key preferences or constraints" placeholder="Travelling with parents, want less walking, prefer comfort..." type="textarea" value={formData.preferences} onChange={e => update("preferences", e.target.value)} />
                      </>
                    )}

                    {addOnType === "Hotel/Area Check" && (
                      <>
                        <Field label="Destination" required placeholder="Paris, Phuket, Dubai..." value={formData.dest} onChange={e => update("dest", e.target.value)} error={fieldErrors.dest} />
                        <Field label="Hotel name or area" required placeholder="Hotel name, neighbourhood, or shortlist" value={formData.hotelArea} onChange={e => update("hotelArea", e.target.value)} error={fieldErrors.hotelArea} />
                        <Chips label="What matters most to you?" required multi options={["Connectivity", "Safety", "Luxury feel", "Sightseeing access", "Food options", "Family suitability", "Nightlife access", "Quiet stay"]} selected={formData.mattersMost} onChange={val => update("mattersMost", val)} error={fieldErrors.mattersMost} />
                        <Chips label="Trip type" options={["Couple", "Family", "Friends", "Business", "Solo"]} selected={formData.tripType} onChange={val => update("tripType", val)} />
                      </>
                    )}

                    {addOnType === "Flight Choice" && (
                      <>
                        <Field label="Route" required placeholder="Delhi to Paris, Mumbai to Tokyo..." value={formData.route} onChange={e => update("route", e.target.value)} error={fieldErrors.route} />
                        <Field label="Travel date" required type="date" min={today} value={formData.travelDate} onChange={e => update("travelDate", e.target.value)} error={fieldErrors.travelDate} />
                        <div className="mb-4">
                          <label className="block text-[12px] font-bold text-[#36013F] mb-1">Flight options you're considering <span className="text-red-500">*</span></label>
                          <textarea className={`w-full bg-gray-50 border rounded-xl p-3 text-sm mb-2 resize-none ${fieldErrors.flightOptions ? "border-red-400" : "border-gray-200"}`} rows={3} placeholder="Option 1: IndiGo 6E 201, 06:00 Delhi–Paris via Dubai, ₹42,000&#10;Option 2: ..." value={formData.flightOptions || ""} onChange={e => update("flightOptions", e.target.value)} />
                          {fieldErrors.flightOptions && <p className="text-xs text-red-500 font-semibold -mt-1 mb-2">{fieldErrors.flightOptions}</p>}
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 w-full py-2 border border-dashed border-gray-300 rounded-xl text-[11px] text-gray-500 font-bold hover:border-[#36013F] transition-all"><Upload size={13} /> Upload screenshots (optional)</button>
                        </div>
                        <Chips label="What matters most?" required options={["Lowest risk", "Best timing", "Lowest price", "Shortest journey", "Better baggage", "Better airline"]} selected={formData.mattersMost} onChange={val => update("mattersMost", val)} error={fieldErrors.mattersMost} />
                      </>
                    )}

                    {addOnType === "Packing Checklist" && (
                      <>
                        <Field label="Destination" required placeholder="Iceland, Singapore, Ladakh..." value={formData.dest} onChange={e => update("dest", e.target.value)} error={fieldErrors.dest} />
                        <Field label="Travel dates or month" required placeholder="Late December, first week of June..." value={formData.travelMonth} onChange={e => update("travelMonth", e.target.value)} error={fieldErrors.travelMonth} />
                        <Chips label="Trip type" required options={["Leisure", "Honeymoon", "Family", "Business", "Adventure", "Beach", "Winter"]} selected={formData.tripType} onChange={val => update("tripType", val)} error={fieldErrors.tripType} />
                        <Field label="Trip duration" placeholder="5 days, 10 days..." value={formData.duration} onChange={e => update("duration", e.target.value)} />
                      </>
                    )}

                    {validationError && (
                      <p className="text-xs font-semibold text-red-600 mb-3 text-center bg-red-50 border border-red-200 rounded-xl p-2">{validationError}</p>
                    )}

                    <button disabled={isSubmitting} type="submit" className="w-full py-3 bg-[#FDC700] hover:bg-[#36013F] text-[#36013F] hover:text-[#FDC700] transition-colors rounded-xl font-black text-[12px] uppercase tracking-widest disabled:opacity-70 flex items-center justify-center gap-2">
                      {isSubmitting ? <><Loader size={14} className="animate-spin" /> Processing...</> : `${data.cta} · ${data.price}`}
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
