"use client";
import React, { useState, useEffect } from "react";
import { Loader, Sparkles, Plus, Trash2, ChevronDown, CheckCircle, Gauge } from "lucide-react";

const getServiceConfig = (serviceType = "") => {
  const normalized = serviceType.toLowerCase();

  if (normalized.includes("consult")) {
    return {
      type: "consultation",
      label: "Next Steps You Should Take",
      fields: [{ key: "nextSteps", label: "Next Steps You Should Take", rows: 3 }],
    };
  }

  if (normalized.includes("master")) {
    return {
      type: "master-plan",
      label: "Master Plan Direction",
      fields: [
        { key: "dayWiseStructure", label: "Day-wise or Structure Suggestion", rows: 3 },
        { key: "stayStrategy", label: "Stay Strategy", rows: 3 },
        { key: "routeLogic", label: "Route Logic", rows: 3 },
      ],
    };
  }

  if (normalized.includes("itinerary") || normalized.includes("review")) {
    return {
      type: "itinerary-review",
      label: "Reworked Version Suggestion",
      fields: [{ key: "reworkedVersion", label: "Reworked Version Suggestion", rows: 4 }],
    };
  }

  if (normalized.includes("flight")) {
    return {
      type: "flight-choice",
      label: "Flight Choice",
      fields: [
        { key: "bestOption", label: "Best Option", rows: 2 },
        { key: "whyThisWorks", label: "Why this works", rows: 3 },
      ],
    };
  }

  if (normalized.includes("hotel")) {
    return {
      type: "hotel-check",
      label: "Hotel Check",
      fields: [
        { key: "areaVerdict", label: "Area Verdict", rows: 2, options: ["Good", "Avoid", "Conditional"] },
      ],
    };
  }

  return { type: "ask-a-question", label: "", fields: [] };
};

const scoreText = (value, targetWords) => {
  const words = value.trim().split(/\s+/).filter(Boolean).length;
  return Math.min(100, Math.round((words / targetWords) * 100));
};

const calculateQualityScores = (formData, serviceConfig) => {
  const requiredValues = [
    formData.diagnosis,
    formData.coreAdvice,
    ...serviceConfig.fields.map((field) => formData.optionalSections?.[field.key] || ""),
  ];

  const completed = requiredValues.filter((value) => String(value || "").trim()).length;
  const completeness = Math.round((completed / requiredValues.length) * 100);
  const clarity = Math.round(
    (scoreText(formData.diagnosis, 18) + scoreText(formData.coreAdvice, 45)) / 2
  );

  return {
    completeness,
    clarity,
    responseScore: Math.round((completeness * 0.65) + (clarity * 0.35)),
  };
};


const getDefaultCtaOptions = (serviceType = "") => {
  const n = serviceType.toLowerCase();
  if (n.includes("consult") || n.includes("strategic")) {
    return [
      "Book a Master Plan session to turn this advice into a full day-by-day structure",
      "Schedule a follow-up call to finalise your decisions before booking",
      "You're all set — go ahead and book with confidence",
    ];
  }
  if (n.includes("master")) {
    return [
      "Book a 1:1 consultation to clarify any part of this plan before you commit",
      "Your plan is ready — confirm hotels and flights based on this structure",
      "Let the expert know your final bookings and they'll do a quick review",
    ];
  }
  if (n.includes("itinerary") || n.includes("review")) {
    return [
      "Confirm the reworked version and the expert can review your final bookings",
      "Book a short call to walk through this restructured itinerary together",
      "Your itinerary is now optimised — go ahead and execute it",
    ];
  }
  if (n.includes("flight")) {
    return [
      "Go ahead and book this flight option — it's the right call for your dates",
      "Need help with the rest of the trip? Start a Master Plan session",
      "Book a 1:1 consultation if you need help beyond the flight choice",
    ];
  }
  if (n.includes("hotel")) {
    return [
      "This area works — go ahead and confirm your stay",
      "Book a consultation to finalise your full stay strategy for the trip",
      "Need a broader itinerary for this destination? Start a Master Plan",
    ];
  }
  if (n.includes("question") || n.includes("ask")) {
    return [
      "Have more questions? Book a 1:1 consultation for deeper guidance",
      "Ready to plan the full trip? Start your Master Plan",
      "You're all set — happy travels!",
    ];
  }
  return [
    "Book a follow-up session for deeper guidance on this trip",
    "Ready to plan fully? Start your Master Plan",
    "You're all set — have a great trip!",
  ];
};

export default function ExpertPrescriptionBuilder({ question, onDraftGenerate, onSave, isLoading, canGenerateDraft = true }) {
  const serviceConfig = getServiceConfig(question?.serviceType);
  const defaultCtaOptions = getDefaultCtaOptions(question?.serviceType);

  const [formData, setFormData] = useState({
    diagnosis: "",
    coreAdvice: "",
    risks: [],
    confidence: "High",
    optionalSections: {},
    nextStepCta: defaultCtaOptions[0],
    serviceSpecifics: {},
  });
  const [ctaOptions, setCtaOptions] = useState(defaultCtaOptions);
  const [customCta, setCustomCta] = useState(false);

  const [currentRisk, setCurrentRisk] = useState("");
  const qualityScores = calculateQualityScores(formData, serviceConfig);

  // Sync with AI draft — map service-specific field names to builder fields
  useEffect(() => {
    if (!question?.aiDraft) return;
    const draft = question.aiDraft;
    const sType = (question?.serviceType || "").toLowerCase();

    let mapped = {
      diagnosis: draft.diagnosis || "",
      coreAdvice: draft.coreAdvice || "",
      risks: Array.isArray(draft.risks) ? draft.risks : [],
      confidence: draft.confidence || "High",
      optionalSections: { ...(draft.optionalSections || {}) },
      nextStepCta: draft.ctaOptions?.[0] || "",
    };

    if (sType.includes("consult") || sType.includes("strategic")) {
      mapped.diagnosis  = draft.situationRead || draft.diagnosis || "";
      mapped.coreAdvice = draft.coreRecommendation || draft.coreAdvice || "";
      mapped.risks      = Array.isArray(draft.bookNow) ? draft.bookNow : mapped.risks;
      mapped.optionalSections.nextSteps =
        [draft.holdOff, draft.callAgenda].filter(Boolean).join("\n\n") ||
        mapped.optionalSections.nextSteps || "";
    } else if (sType.includes("ask") || sType.includes("question")) {
      mapped.diagnosis  = draft.keyPoint || draft.diagnosis || "";
      mapped.coreAdvice = draft.answer || draft.coreAdvice || "";
    } else if (sType.includes("master")) {
      mapped.diagnosis  = draft.planVerdict || draft.diagnosis || "";
      mapped.coreAdvice = draft.dayStructure || draft.coreAdvice || "";
      mapped.risks      = Array.isArray(draft.mustDos) ? draft.mustDos : mapped.risks;
      mapped.optionalSections.dayWiseStructure = draft.dayStructure || "";
      mapped.optionalSections.stayStrategy     = draft.stayStrategy || "";
      mapped.optionalSections.routeLogic       = draft.howToMove || "";
    } else if (sType.includes("luxe") || sType.includes("custom")) {
      mapped.diagnosis  = draft.packageConcept || draft.diagnosis || "";
      mapped.coreAdvice = [draft.packageConcept, draft.stayIdeas].filter(Boolean).join("\n\n") || draft.coreAdvice || "";
      mapped.risks      = Array.isArray(draft.signatureExperiences) ? draft.signatureExperiences : mapped.risks;
    } else if (sType.includes("itinerary") || sType.includes("review")) {
      mapped.diagnosis  = draft.verdict || draft.diagnosis || "";
      mapped.coreAdvice = draft.fixes || draft.coreAdvice || "";
      mapped.risks      = Array.isArray(draft.issues) ? draft.issues : mapped.risks;
      mapped.optionalSections.reworkedVersion = draft.reworkedVersion || "";
    } else if (sType.includes("hotel")) {
      mapped.diagnosis  = `Verdict: ${draft.areaVerdict || ""}`.trim();
      mapped.coreAdvice = draft.reasoning || draft.coreAdvice || "";
      mapped.risks      = draft.bestFor ? [draft.bestFor] : mapped.risks;
      mapped.optionalSections.areaVerdict = draft.areaVerdict || "";
    } else if (sType.includes("flight")) {
      mapped.diagnosis  = draft.reasoning || draft.diagnosis || "";
      mapped.coreAdvice = draft.recommendation || draft.coreAdvice || "";
      mapped.risks      = draft.watchOut ? [draft.watchOut] : mapped.risks;
      mapped.optionalSections.bestOption   = draft.recommendation || "";
      mapped.optionalSections.whyThisWorks = draft.reasoning || "";
    } else if (sType.includes("packing")) {
      mapped.diagnosis  = draft.packingVerdict || draft.diagnosis || "";
      mapped.coreAdvice = [...(Array.isArray(draft.clothing) ? draft.clothing : []), ...(Array.isArray(draft.documents) ? draft.documents : [])].join("\n") || draft.coreAdvice || "";
      mapped.risks      = Array.isArray(draft.essentials) ? draft.essentials : mapped.risks;
    }

    setFormData(prev => ({ ...prev, ...mapped }));

    if (draft.ctaOptions?.length === 3) {
      setCtaOptions(draft.ctaOptions);
      setCustomCta(false);
    }
  }, [question?.aiDraft]);

  useEffect(() => {
    const opts = getDefaultCtaOptions(question?.serviceType);
    setCtaOptions(opts);
    setFormData(prev => ({
      ...prev,
      nextStepCta: prev.nextStepCta || opts[0],
    }));
  }, [question?.serviceType]);

  const handleAddRisk = () => {
    if (currentRisk.trim() && currentRisk.length <= 120) {
      setFormData(prev => ({
        ...prev,
        risks: [...prev.risks, currentRisk.trim()]
      }));
      setCurrentRisk("");
    }
  };

  const removeRisk = (index) => {
    setFormData(prev => ({
      ...prev,
      risks: prev.risks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      serviceType: question?.serviceType || "Ask a Question",
      optionalSectionType: serviceConfig.type,
      qualityScores,
    });
  };

  const requiredOptionalComplete = serviceConfig.fields.every((field) =>
    String(formData.optionalSections?.[field.key] || "").trim()
  );
  const isAccepted = question?.status === "accepted";
  const isFormDisabled = !isAccepted || isLoading;
  const isFormValid = formData.diagnosis.trim() && formData.coreAdvice.trim() && requiredOptionalComplete;

  return (
    <div className="space-y-8 bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-gray-100 shadow-xl">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#36013F]">Prescription Builder</h2>
          <p className="text-xs text-gray-500">Structure your expert response for maximum authority.</p>
        </div>
        <button
          type="button"
          onClick={onDraftGenerate}
          disabled={isFormDisabled || !canGenerateDraft}
          title={canGenerateDraft ? "Generate AI draft" : "Accept the case to enable AI draft"}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader className="animate-spin" size={16} /> : <Sparkles size={16} />}
          AI Assist Draft
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          ["Completeness", qualityScores.completeness],
          ["Clarity", qualityScores.clarity],
          ["Response Score", qualityScores.responseScore],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-gray-100 bg-white p-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <Gauge size={12} /> {label}
            </div>
            <p className="mt-1 text-lg font-black text-[#36013F]">{value}%</p>
          </div>
        ))}
      </div>

      {!isAccepted && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 flex items-center gap-2">
          <span>⚠️ Please click <strong>"Accept Case"</strong> at the top of the window to enable prescription builder.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. DIAGNOSIS */}
        <section className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
            <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px]">1</span>
            What I understand from your plan (Diagnosis)
          </label>
          <textarea
            value={formData.diagnosis}
            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            maxLength={300}
            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Summarize the user's situation and core confusion..."
            rows={3}
            required
            disabled={isFormDisabled}
          />
          <div className="flex justify-end">
            <span className={`text-[10px] ${formData.diagnosis.length > 280 ? 'text-red-500' : 'text-gray-400'}`}>
              {formData.diagnosis.length}/300
            </span>
          </div>
        </section>

       
        {/* 3. KEY CORRECTIONS / RISKS */}
        <section className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
            <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px]">2</span>
            What to Avoid / Watch Out For
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentRisk}
              onChange={(e) => setCurrentRisk(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRisk())}
              maxLength={120}
              className="flex-1 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="Add a risk or correction (max 120 chars)..."
              disabled={isFormDisabled}
            />
            <button
              type="button"
              onClick={handleAddRisk}
              disabled={isFormDisabled}
              className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-colors disabled:opacity-50"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-2 mt-2">
            {formData.risks.map((risk, index) => (
              <div key={index} className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-left-2">
                <span className="text-xs text-red-800 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" /> {risk}
                </span>
                <button type="button" onClick={() => removeRisk(index)} disabled={isFormDisabled} className="text-red-400 hover:text-red-600 disabled:opacity-50">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

         {/* 2. CORE ADVICE */}
        <section className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
            <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px]">3</span>
            Expert Recommendation
          </label>
          <textarea
            value={formData.coreAdvice}
            onChange={(e) => setFormData({ ...formData, coreAdvice: e.target.value })}
            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="Provide your main answer here. Be authoritative and clear."
            rows={6}
            required
            disabled={isFormDisabled}
          />
        </section>


        {serviceConfig.fields.length > 0 && (
          <section className="space-y-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
            <div>
              <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">{serviceConfig.label}</h3>
              <p className="text-xs text-amber-700">Required for this service type.</p>
            </div>
            {serviceConfig.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">{field.label}</label>
                {field.options ? (
                  <select
                    value={formData.optionalSections?.[field.key] || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        optionalSections: { ...formData.optionalSections, [field.key]: e.target.value },
                      })
                    }
                    className="w-full p-3 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none text-sm font-bold text-[#36013F] disabled:bg-gray-100 disabled:text-gray-500"
                    required
                    disabled={isFormDisabled}
                  >
                    <option value="">Select verdict</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <textarea
                    value={formData.optionalSections?.[field.key] || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        optionalSections: { ...formData.optionalSections, [field.key]: e.target.value },
                      })
                    }
                    className="w-full p-4 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none transition-all text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    rows={field.rows}
                    required
                    disabled={isFormDisabled}
                  />
                )}
              </div>
            ))}
          </section>
        )}

        <div className="flex flex-col gap-6 pt-4 border-t">
          {/* SUBMIT */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={!isFormValid || isFormDisabled}
              className="w-full bg-[#36013F] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#4a0150] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-200 disabled:opacity-50 disabled:grayscale"
            >
              <CheckCircle size={18} />
              Finalize Prescription
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

