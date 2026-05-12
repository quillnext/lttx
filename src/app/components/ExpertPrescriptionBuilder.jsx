"use client";
import React, { useState, useEffect } from "react";
import { Loader, Sparkles, Plus, Trash2, ChevronDown, CheckCircle } from "lucide-react";

export default function ExpertPrescriptionBuilder({ question, onDraftGenerate, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    diagnosis: "",
    coreAdvice: "",
    risks: [],
    optimizedApproach: "",
    confidence: "High",
    serviceSpecifics: {},
  });

  const [currentRisk, setCurrentRisk] = useState("");

  // Sync with AI draft if provided
  useEffect(() => {
    if (question?.aiDraft) {
      setFormData(prev => ({
        ...prev,
        ...question.aiDraft
      }));
    }
  }, [question?.aiDraft]);

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
    onSave(formData);
  };

  const isFormValid = formData.diagnosis.trim() && formData.coreAdvice.trim() && formData.optimizedApproach.trim();

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

          {/* SUBMIT */}
          <div className="flex items-end">
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
