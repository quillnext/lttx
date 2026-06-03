"use client";
import React, { useState, useEffect } from "react";
import { User, MapPin, Calendar, Compass, MessageSquare, Paperclip, Clock, ShieldAlert, IndianRupee } from "lucide-react";

const SERVICE_PRICES = {
  "1:1 STRATEGIC CONSULTATION": 799,
  "ASK A QUESTION": 299,
  "THE MASTER PLAN": 1099,
  "CUSTOM LUXE PACKAGE": null,
};

const getExpertPayout = (serviceType) => {
  const price = SERVICE_PRICES[serviceType?.toUpperCase()];
  if (!price) return null;
  return Math.round(price * 0.7);
};

export default function CaseSheetView({ question, sessionData }) {
  const {
    id,
    userName,
    question: legacyQuestion,
    serviceType = "Ask a Question",
    userType: legacyUserType = "Solo",
    urgency = "Normal",
    createdAt,
    sessionSnapshot,
    formData = {}
  } = question;

  const data = sessionSnapshot || (sessionData?.[id]) || {};
  const { context } = data;
  const summary = context?.querySummary;

  // Derive display values from Lead formData or fallback to summary/legacy
  const displayDest = formData.destination || formData.dest || summary?.destination || "N/A";
  const displayDates = (formData.startDate && formData.endDate)
    ? `${formData.startDate} to ${formData.endDate}`
    : (formData.dates || summary?.dates || "N/A");
  const displayWho = formData.who || legacyUserType;
  const displayStyle = formData.budget || summary?.style || "Standard";
  const displayType = Array.isArray(formData.type) ? formData.type.join(", ") : (formData.exp || summary?.type || "N/A");
  const displayProblem = formData.confusion || formData.question || formData.context || formData.mustHaves || legacyQuestion;
  const expertPayout = getExpertPayout(serviceType);

  const [dynamicSummary, setDynamicSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (summary?.caseSummary) {
      setDynamicSummary(summary.caseSummary);
      return;
    }

    const generateSummary = async () => {
      setIsGenerating(true);
      setDynamicSummary("");
      try {
        const response = await fetch("/api/generate-case-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caseData: {
              userName,
              serviceType,
              destination: displayDest,
              dates: displayDates,
              who: displayWho,
              budget: displayStyle,
              type: displayType,
              problem: displayProblem
            }
          })
        });
        const result = await response.json();
        if (result.success && result.summary) {
          setDynamicSummary(result.summary);
        } else {
          setDynamicSummary("A custom travel consultation request.");
        }
      } catch (err) {
        console.error("Error generating dynamic summary:", err);
        setDynamicSummary("A custom travel consultation request.");
      } finally {
        setIsGenerating(false);
      }
    };

    generateSummary();
  }, [id, summary?.caseSummary, displayDest, displayDates, displayWho, displayStyle, displayType, displayProblem, userName, serviceType]);

  const getUrgencyColor = (u) => {
    switch (u.toLowerCase()) {
      case "priority": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* CASE HEADER */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded tracking-widest uppercase">
                Case ID: {id?.slice(-8).toUpperCase() || "NEW-CASE"}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase border ${getUrgencyColor(urgency)}`}>
                {urgency}
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#36013F] leading-tight">
              {serviceType} for {userName || "Traveller"}
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {expertPayout && (
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                <IndianRupee className="text-green-600" size={16} />
                <div>
                  <p className="text-[10px] font-bold text-green-500 uppercase">Your Payout </p>
                  <p className="text-sm font-black text-green-700">₹{expertPayout}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-xl border border-purple-100">
              <User className="text-purple-600" size={20} />
              <div>
                <p className="text-[10px] font-bold text-purple-400 uppercase">User Type</p>
                <p className="text-sm font-bold text-[#36013F]">{displayWho}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI CASE SUMMARY */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldAlert size={80} />
        </div>
        <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Clock size={16} /> Case Summary (AI Generated)
        </h3>
        <p className="text-sm text-indigo-800 leading-relaxed font-medium">
          {summary?.caseSummary || dynamicSummary || (isGenerating ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></span>
              AI is analyzing this case...
            </span>
          ) : "AI is analyzing this case... A 7-day trip planning request for Japan with focus on luxury and comfort.")}
        </p>
      </div>

      {/* USER INPUT STRUCTURE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trip Basics */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={14} /> Trip Basics
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Destination</p>
              <p className="text-sm font-bold text-gray-800">{displayDest}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Dates</p>
              <p className="text-sm font-bold text-gray-800">{displayDates}</p>
            </div>
          </div>
        </div>

        {/* Intent */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Compass size={14} /> Intent
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Style / Budget</p>
              <p className="text-sm font-bold text-gray-800">{displayStyle}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Type / Vibe</p>
              <p className="text-sm font-bold text-gray-800">{displayType}</p>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC FORM DATA (Based on Service Type) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
          <MessageSquare size={14} /> {serviceType?.toUpperCase() === "ASK A QUESTION" ? "The Question" : "Case Details"}
        </h4>
        
        <div className="space-y-4">
          {/* Main Problem/Question */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-700 font-bold mb-1 uppercase text-[10px] opacity-60">
              {serviceType?.toUpperCase() === "1:1 STRATEGIC CONSULTATION" ? "Confusion / Help Needed" : "Problem Statement"}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {displayProblem || "No detailed information provided."}
            </p>
          </div>

          {/* Service Specific Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.pax && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Travellers (Pax)</p>
                <p className="text-sm font-bold text-gray-800">{formData.pax} People</p>
              </div>
            )}
            {formData.booked && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Current Booking Status</p>
                <p className="text-sm font-bold text-gray-800">{formData.booked}</p>
              </div>
            )}
            {formData.helpWith && Array.isArray(formData.helpWith) && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 md:col-span-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Help Needed With</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.helpWith.map(item => (
                    <span key={item} className="bg-white px-2 py-1 rounded border text-[11px] font-bold text-[#36013F]">{item}</span>
                  ))}
                </div>
              </div>
            )}
            {formData.bookingDetails && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 md:col-span-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Existing Details</p>
                <p className="text-[12px] text-gray-600 mt-1 whitespace-pre-wrap">{formData.bookingDetails}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ATTACHMENTS */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
          <Paperclip size={14} /> Attachments
        </h4>
        {formData.uploadedFileUrl ? (
          <div className="flex flex-wrap gap-3">
            {/\.(jpg|jpeg|png|webp)$/i.test(formData.uploadedFileName || formData.uploadedFileUrl) ? (
              <a
                href={formData.uploadedFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-[#36013F] transition-all shadow-sm"
                title={formData.uploadedFileName || "Attached image"}
              >
                <img
                  src={formData.uploadedFileUrl}
                  alt={formData.uploadedFileName || "Attachment"}
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider">Open</span>
                </div>
              </a>
            ) : (
              <a
                href={formData.uploadedFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 hover:border-[#36013F] transition-all max-w-xs"
              >
                <div className="w-10 h-10 bg-[#36013F] text-white rounded-lg flex items-center justify-center text-[10px] font-black uppercase shrink-0">
                  PDF
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#36013F] truncate">
                    {formData.uploadedFileName || "Attached file"}
                  </p>
                  <p className="text-[10px] text-blue-600 font-semibold">Click to open</p>
                </div>
              </a>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
              <p className="text-[10px] text-gray-400 text-center px-2">No files attached</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
