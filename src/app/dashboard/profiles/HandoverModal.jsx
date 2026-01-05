"use client";

import React, { useState } from "react";
import { 
  X, 
  Key, 
  Loader2, 
  Mail, 
  Phone, 
  ShieldCheck,
  UserCheck,
  AlertTriangle
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function HandoverModal({ profile, onClose }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleHandover = async (e) => {
    e.preventDefault();
    if (!email || !phone) {
        setError("Email and Phone are required for registry authentication.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/handover-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: profile.id,
          email,
          phone,
          fullName: profile.fullName,
          secret: process.env.NEXT_PUBLIC_ADMIN_PASS
        })
      });

      const result = await res.json();
      if (res.ok) {
        alert(`Handover Successful!\n\nAn activation email has been sent to ${email}.\nThey can now login to manage this record.`);
        onClose();
      } else {
        setError(result.error || "Handover protocol failed.");
      }
    } catch (err) {
      setError("Network failure during handover synchronization.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-8 bg-[#36013F] text-white flex flex-col items-center text-center space-y-4">
           <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center border border-white/20"><Key size={32} /></div>
           <div className="space-y-1">
              <h2 className="text-2xl font-black">Registry Handover</h2>
              <p className="text-sm text-white/60 font-medium">Link a real identity to: {profile.fullName}</p>
           </div>
        </div>

        <form onSubmit={handleHandover} className="p-10 space-y-8">
           <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-3">
              <AlertTriangle className="text-orange-600 shrink-0" size={20} />
              <p className="text-xs font-bold text-orange-800 leading-relaxed">
                WARNING: This will create a Firebase Auth record using the profile's existing ID. Ensure the email is correct.
              </p>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Mail size={12}/> Primary Email Address</label>
                 <input 
                    type="email"
                    required
                    className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#36013F]"
                    placeholder="expert@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Phone size={12}/> Secure Contact Phone</label>
                 <PhoneInput
                    country={"in"}
                    value={phone}
                    onChange={setPhone}
                    inputProps={{ required: true, className: "w-full bg-gray-50 border-none rounded-2xl px-12 py-4 text-sm font-bold focus:ring-2 focus:ring-[#36013F]" }}
                    containerClass="!w-full"
                    buttonClass="!bg-transparent !border-none !rounded-l-2xl"
                 />
              </div>
           </div>

           {error && <p className="text-xs font-black text-red-500 text-center">{error}</p>}

           <div className="flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition">Cancel</button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 py-4 bg-[#36013F] text-white rounded-2xl font-black shadow-xl shadow-purple-900/10 hover:bg-[#4a0152] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                {loading ? "Authenticating..." : "Finalize Handover"}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
}
