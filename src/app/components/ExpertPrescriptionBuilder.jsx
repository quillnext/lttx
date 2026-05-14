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
    formData.optimizedApproach,
    formData.confidence,
    ...serviceConfig.fields.map((field) => formData.optionalSections?.[field.key] || ""),
  ];

  const completed = requiredValues.filter((value) => String(value || "").trim()).length;
  const completeness = Math.round((completed / requiredValues.length) * 100);
  const clarity = Math.round(
    (scoreText(formData.diagnosis, 18) + scoreText(formData.coreAdvice, 45) + scoreText(formData.optimizedApproach, 20)) / 3
  );

  return {
    completeness,
    clarity,
    responseScore: Math.round((completeness * 0.65) + (clarity * 0.35)),
  };
};

const getDefaultCta = (serviceType = "") => {
  const normalized = serviceType.toLowerCase();
  if (normalized.includes("consult")) return "Need deeper help? Book a consultation.";
  if (normalized.includes("master")) return "Want this turned into a full plan? Upgrade to Master Plan.";
  return "Want this turned into a full plan? Upgrade to Master Plan.";
};

export default function ExpertPrescriptionBuilder({ question, onDraftGenerate, onSave, isLoading }) {
  const serviceConfig = getServiceConfig(question?.serviceType);
  const [formData, setFormData] = useState({
    diagnosis: "",
    coreAdvice: "",
    risks: [],
    optimizedApproach: "",
    confidence: "High",
    optionalSections: {},
    nextStepCta: getDefaultCta(question?.serviceType),
    serviceSpecifics: {},
  });

  const [currentRisk, setCurrentRisk] = useState("");
  const qualityScores = calculateQualityScores(formData, serviceConfig);

  // Sync with AI draft if provided
  useEffect(() => {
    if (question?.aiDraft) {
      setFormData(prev => ({
        ...prev,
        ...question.aiDraft,
        optionalSections: {
          ...prev.optionalSections,
          ...(question.aiDraft.optionalSections || {}),
        },
      }));
    }
  }, [question?.aiDraft]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      nextStepCta: prev.nextStepCta || getDefaultCta(question?.serviceType),
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
  const isFormValid = formData.diagnosis.trim() && formData.coreAdvice.trim() && formData.optimizedApproach.trim() && requiredOptionalComplete;

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
          disabled={isLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50"
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
            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
            placeholder="Summarize the user's situation and core confusion..."
            rows={3}
            required
          />
          <div className="flex justify-end">
            <span className={`text-[10px] ${formData.diagnosis.length > 280 ? 'text-red-500' : 'text-gray-400'}`}>
              {formData.diagnosis.length}/300
            </span>
          </div>
        </section>

        {/* 2. CORE ADVICE */}
        <section className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
            <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px]">2</span>
            Expert Recommendation
          </label>
          <textarea
            value={formData.coreAdvice}
            onChange={(e) => setFormData({ ...formData, coreAdvice: e.target.value })}
            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
            placeholder="Provide your main answer here. Be authoritative and clear."
            rows={6}
            required
          />
        </section>

        {/* 3. KEY CORRECTIONS / RISKS */}
        <section className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
            <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px]">3</span>
            What to Avoid / Watch Out For
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentRisk}
              onChange={(e) => setCurrentRisk(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRisk())}
              maxLength={120}
              className="flex-1 p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
              placeholder="Add a risk or correction (max 120 chars)..."
            />
            <button
              type="button"
              onClick={handleAddRisk}
              className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-colors"
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
                <button type="button" onClick={() => removeRisk(index)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 4. OPTIMIZED APPROACH */}
        <section className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
            <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px]">4</span>
            Better Way to Plan This
          </label>
          <textarea
            value={formData.optimizedApproach}
            onChange={(e) => setFormData({ ...formData, optimizedApproach: e.target.value })}
            className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm"
            placeholder="Short actionable restructuring of their plan..."
            rows={3}
            required
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
                    className="w-full p-3 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none text-sm font-bold text-[#36013F]"
                    required
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
                    className="w-full p-4 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none transition-all text-sm"
                    rows={field.rows}
                    required
                  />
                )}
              </div>
            ))}
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          {/* CONFIDENCE SCORE */}
          <section className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confidence in Recommendation</label>
            <div className="relative">
              <select
                value={formData.confidence}
                onChange={(e) => setFormData({ ...formData, confidence: e.target.value })}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-purple-500 outline-none text-sm font-bold text-[#36013F]"
              >
                <option value="High">High Confidence</option>
                <option value="Medium">Medium Confidence</option>
                <option value="Situational">Situational</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </section>

          <section className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Follow-up CTA</label>
            <input
              type="text"
              value={formData.nextStepCta}
              onChange={(e) => setFormData({ ...formData, nextStepCta: e.target.value })}
              className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-bold text-[#36013F]"
              placeholder="Next step for the traveller"
              required
            />
          </section>

          {/* SUBMIT */}
          <div className="flex items-end md:col-span-2">
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
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
