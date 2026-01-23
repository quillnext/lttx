"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, Wallet, Cloud, Plane, Utensils, Info } from "lucide-react";
import {
    FaCheckCircle, FaTimesCircle, FaExclamationCircle
} from 'react-icons/fa';

export default function SessionDetailsModal({ isOpen, onClose, sessionData }) {
    if (!isOpen || !sessionData) return null;

    const { context, query, sections } = sessionData;
    const summary = context?.querySummary;

    // Helper to get icon for section
    const getSectionIcon = (type) => {
        switch (type) {
            case 'weather': return <Cloud size={16} />;
            case 'transport': return <Plane size={16} />;
            case 'dining': return <Utensils size={16} />;
            default: return <Info size={16} />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative bg-white w-full max-w-4xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="bg-[#36013F] p-6 text-white flex justify-between items-start shrink-0">
                            <div>
                                <div className="flex items-center gap-2 mb-2 opacity-80">
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                                        AI Search Context
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold leading-tight">
                                    "{query}"
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">

                            {/* 1. Key Metrics */}
                            {summary && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                        <div className="flex items-center gap-2 text-purple-800 mb-1">
                                            <Wallet size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wide">Budget</span>
                                        </div>
                                        <p className="font-semibold text-gray-900">{summary.budgetRange || "N/A"}</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <div className="flex items-center gap-2 text-blue-800 mb-1">
                                            <Calendar size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wide">Season</span>
                                        </div>
                                        <p className="font-semibold text-gray-900">{summary.bestSeason || "N/A"}</p>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                        <div className="flex items-center gap-2 text-orange-800 mb-1">
                                            <MapPin size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wide">Visa</span>
                                        </div>
                                        <p className="font-semibold text-gray-900">{summary.visaStatus || "N/A"}</p>
                                    </div>

                                </div>
                            )}



                            {/* 3. AI Insights / Match Reason */}
                            {context?.matchReason && (
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <h3 className="text-sm font-bold text-[#36013F] uppercase tracking-wider mb-2 flex items-center gap-2">
                                        Why we matched this
                                    </h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {context.matchReason}
                                    </p>
                                </div>
                            )}

                            {/* 4. Generated Sections (Weather, Transport, etc.) */}
                            {sections && Object.keys(sections).length > 0 && (
                                <div className="space-y-6 pt-4 border-t border-dashed border-gray-200">
                                    <h3 className="text-lg font-bold text-gray-900">Detailed Insights</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(sections).map(([key, data], idx) => (
                                            <div key={key} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 ring-1 ring-gray-100/50">
                                                <h4 className="font-bold text-[#36013F] capitalize mb-3 flex items-center gap-2 pb-2 border-b border-gray-100">
                                                    {getSectionIcon(key)} {key.replace(/_/g, " ")}
                                                </h4>
                                                <div className="text-sm text-gray-600 space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">

                                                    {/* Indian Perspective */}
                                                    {key === 'indian_perspective' && data.indianPerspective && (
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Pros for Indians</p>
                                                                <ul className="space-y-1">
                                                                    {data.indianPerspective.pros?.map((p, i) => (
                                                                        <li key={i} className="text-xs text-gray-700 flex items-center gap-2">
                                                                            <FaCheckCircle className="text-green-500 shrink-0" size={10} /> {p}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Pain Points</p>
                                                                <ul className="space-y-1">
                                                                    {data.indianPerspective.cons?.map((c, i) => (
                                                                        <li key={i} className="text-xs text-gray-700 flex items-center gap-2">
                                                                            <FaTimesCircle className="text-red-400 shrink-0" size={10} /> {c}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Related Questions */}
                                                    {key === 'related_questions' && data.relatedQuestions && (
                                                        <div className="space-y-3">
                                                            {data.relatedQuestions.slice(0, 3).map((item, idx) => (
                                                                <div key={idx} className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                                                    <h4 className="font-semibold text-gray-800 text-xs leading-snug mb-1">"{item.question}"</h4>
                                                                    <p className="text-[10px] text-gray-500 italic line-clamp-2">{item.teaserAnswer}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Visa */}
                                                    {key === 'visa' && data.visaSnapshot && (
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center bg-blue-50 p-2 rounded-lg">
                                                                <span className="text-xs font-semibold text-blue-800">Status</span>
                                                                <span className="text-xs font-bold text-blue-900">{data.visaSnapshot.title || "Check Required"}</span>
                                                            </div>
                                                            <ul className="space-y-2 pl-1">
                                                                {data.visaSnapshot.points?.map((point, idx) => (
                                                                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed">
                                                                        <span className="text-green-500 mt-0.5 text-[10px] shrink-0">●</span> {point}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Weather */}
                                                    {key === 'weather' && data.weatherInfo && (
                                                        <div className="space-y-3">
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div className="bg-orange-50 p-2 rounded-lg text-center">
                                                                    <span className="block text-[10px] text-orange-600 uppercase font-bold">Season</span>
                                                                    <span className="text-xs font-bold text-gray-800">{data.weatherInfo.season}</span>
                                                                </div>
                                                                <div className="bg-blue-50 p-2 rounded-lg text-center">
                                                                    <span className="block text-[10px] text-blue-600 uppercase font-bold">Temp</span>
                                                                    <span className="text-xs font-bold text-gray-800">{data.weatherInfo.temperature}</span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">What to Pack</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {data.weatherInfo.advice?.map((item, idx) => (
                                                                        <span key={idx} className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600">{item}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Budget */}
                                                    {key === 'budget' && data.budgetInfo && (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center justify-between bg-green-50 p-2.5 rounded-lg border border-green-100">
                                                                <div>
                                                                    <span className="block text-[10px] text-green-700 uppercase font-bold">Currency</span>
                                                                    <span className="text-sm font-bold text-green-900">{data.budgetInfo.currency}</span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="block text-[10px] text-green-700 uppercase font-bold">Daily Spend</span>
                                                                    <span className="text-sm font-bold text-green-900">{data.budgetInfo.dailyEstimate}</span>
                                                                </div>
                                                            </div>
                                                            <ul className="space-y-1.5 pl-1">
                                                                {data.budgetInfo.tips?.map((tip, idx) => (
                                                                    <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                                                        <span className="text-green-500 mt-0.5 text-[10px] shrink-0">$</span> {tip}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Transport */}
                                                    {key === 'transport' && data.transportInfo && (
                                                        <div className="space-y-3">
                                                            <div className="bg-gray-50 p-2.5 rounded-lg">
                                                                <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Best Route</span>
                                                                <p className="text-xs font-medium text-gray-800 leading-snug">{data.transportInfo.bestRoute}</p>
                                                            </div>
                                                            <div>
                                                                <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Local Travel</span>
                                                                <p className="text-xs text-gray-600">{data.transportInfo.localTravel}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Common Problems */}
                                                    {key === 'common_problems' && data.commonProblems && (
                                                        <div className="space-y-3">
                                                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-2">Avoid these issues</p>
                                                            {data.commonProblems.list?.map((item, idx) => (
                                                                <div key={idx} className="   rounded-lg ">
                                                                    <p className=" text-xs flex items-center gap-1.5 ">
                                                                        <FaExclamationCircle className="shrink-0 text-red-500" /> {item.problem}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Fallback for unhandled types or raw content */}
                                                    {(!['weather', 'transport', 'budget', 'visa', 'related_questions', 'indian_perspective', 'common_problems'].includes(key)) && (
                                                        typeof data === 'string' ? <p>{data}</p> : <pre className="whitespace-pre-wrap font-sans text-xs">{JSON.stringify(data, null, 2)}</pre>
                                                    )}

                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
