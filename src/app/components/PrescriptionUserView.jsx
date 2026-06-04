"use client";
import React from "react";
import { CheckCircle2, AlertTriangle, Compass, Star, ChevronRight, Route } from "lucide-react";

const optionalLabels = {
  nextSteps: "Next Steps You Should Take",
  dayWiseStructure: "Day-wise Structure Suggestion",
  stayStrategy: "Stay Strategy",
  routeLogic: "Route Logic",
  reworkedVersion: "Reworked Version Suggestion",
  bestOption: "Best Option",
  whyThisWorks: "Why this works",
  areaVerdict: "Area Verdict",
};

export default function PrescriptionUserView({ prescription }) {
  if (typeof prescription === 'string') {
    return <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{prescription}</p>;
  }

  const {
    diagnosis,
    coreAdvice,
    risks,
    confidence,
    optionalSections = {},
    nextStepCta,
  } = prescription;
  const visibleOptionalSections = Object.entries(optionalSections).filter(([, value]) =>
    String(value || "").trim()
  );

  return (
    <div className="space-y-8 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
      {/* 1. DIAGNOSIS */}
      <section className="space-y-3">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Compass size={14} className="text-purple-500" /> What I understand from your plan
        </h3>
        <p className="text-lg font-medium text-[#36013F] leading-snug">
          "{diagnosis}"
        </p>
      </section>

      {/* 2. CORE ADVICE */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <CheckCircle2 size={14} className="text-green-500" /> Expert Recommendation
        </h3>
        <div className="prose prose-purple max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {coreAdvice}
          </p>
        </div>
      </section>

      {/* 3. RISKS */}
      {risks && risks.length > 0 && (
        <section className="space-y-3 bg-red-50/50 p-6 rounded-2xl border border-red-100">
          <h3 className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle size={14} /> What to Avoid
          </h3>
          <ul className="space-y-2">
            {risks.map((risk, i) => (
              <li key={i} className="text-sm text-red-800 flex items-start gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </section>
      )}

      {visibleOptionalSections.length > 0 && (
        <section className="space-y-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-6">
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
            <Route size={14} /> Service-specific Direction
          </h3>
          <div className="space-y-4">
            {visibleOptionalSections.map(([key, value]) => (
              <div key={key}>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                  {optionalLabels[key] || key}
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-amber-950 whitespace-pre-wrap">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
