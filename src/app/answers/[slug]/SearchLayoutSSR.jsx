
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    FaRupeeSign, FaCalendarAlt, FaPassport, FaArrowRight,
    FaExclamationTriangle, FaSuitcaseRolling,
    FaGlobeAmericas, FaUsers, FaLightbulb, FaPlane,
    FaCloudSun, FaWallet, FaMapMarkedAlt, FaQuestionCircle,
    FaChartLine, FaCheckCircle, FaTimesCircle, FaExclamationCircle
} from 'react-icons/fa';

// Simplified pointer config without descriptions (not needed for simple render)
const POINTER_CONFIG = {
    'visa': { title: 'Visa & Entry', icon: <FaPassport />, color: 'text-blue-600' },
    'weather': { title: 'Weather & Time', icon: <FaCloudSun />, color: 'text-orange-500' },
    'budget': { title: 'Budget & Costs', icon: <FaWallet />, color: 'text-green-600' },
    'transport': { title: 'Transport', icon: <FaPlane />, color: 'text-sky-600' },
    'common_problems': { title: 'Common Problems', icon: <FaExclamationCircle />, color: 'text-red-600' },
    'related_questions': { title: 'Common FAQs', icon: <FaQuestionCircle />, color: 'text-red-500' },
    'indian_perspective': { title: 'Indian Perspective', icon: <FaUsers />, color: 'text-orange-600' },
};

const getYears = (yearsStr) => {
    if (!yearsStr || typeof yearsStr !== 'string') return "0+";
    const match = yearsStr.match(/\d+\+?/);
    return match ? match[0] : "0+";
};

// Reusable Section for SSR
const StaticSection = ({ title, icon, data, type, colorClass }) => {
    if (!data) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative overflow-hidden h-full flex flex-col min-h-[220px]">
            <div className={`absolute top-0 right-0 p-4 opacity-5 text-6xl ${colorClass}`}>{icon}</div>
            <h3 className={`text-base font-bold mb-4 flex items-center gap-2 ${colorClass}`}>
                {icon} {title}
            </h3>
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar text-sm">
                {type === 'indian_perspective' && data.indianPerspective && (
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

                {type === 'related_questions' && data.relatedQuestions && (
                    <div className="space-y-3">
                        {data.relatedQuestions.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                <h4 className="font-semibold text-gray-800 text-xs leading-snug mb-1">"{item.question}"</h4>
                                <p className="text-[10px] text-gray-500 italic line-clamp-2">{item.teaserAnswer}</p>
                            </div>
                        ))}
                    </div>
                )}

                {type === 'visa' && data.visaSnapshot && (
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

                {type === 'weather' && data.weatherInfo && (
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

                {type === 'budget' && data.budgetInfo && (
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

                {type === 'transport' && data.transportInfo && (
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

                {type === 'common_problems' && data.commonProblems && (
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-2">Avoid these issues</p>
                        {data.commonProblems.list?.map((item, idx) => (
                            <div key={idx} className="rounded-lg">
                                <p className="text-xs flex items-center gap-1.5">
                                    <FaExclamationCircle className="shrink-0" /> {item.problem}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {data.dispute && (
                    <div className="mt-4 pt-3 border-t border-red-100 bg-red-50 p-3 rounded-lg flex gap-3 items-start">
                        <div className="bg-white p-1.5 rounded-full text-red-500 shadow-sm shrink-0 mt-0.5">
                            <FaExclamationTriangle size={12} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-red-800 uppercase tracking-wider mb-0.5">Dispute Index</p>
                            <p className="text-xs text-red-700 leading-snug">
                                <span className="font-bold">{data.dispute.percentage}%</span> {data.dispute.text}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const SearchLayoutSSR = ({ experts = [], context = {}, query = "", sections = {} }) => {
    return (
        <div className="w-full space-y-8 md:space-y-12 md:pb-20 p-4 max-w-7xl mx-auto">
            {/* 1. Query Summary Strip */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1 w-full md:w-auto text-left">
                    <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Expert Analysis for</p>
                    <h1 className="text-xl md:text-3xl font-bold text-[#36013F] capitalize leading-tight">{query}</h1>
                    <Link href={`/ask-an-expert?search=${encodeURIComponent(query)}`} className="inline-block mt-4">
                        <button className="bg-[#36013F] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-opacity-90 transition whitespace-nowrap text-sm">
                            Ask Live Expert Instead
                        </button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="w-full md:w-auto grid grid-cols-3 md:flex md:flex-col gap-3 md:gap-4 text-sm text-gray-700 pt-4 md:pt-0 border-t md:border-t-0 border-dashed border-gray-200">
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <div className="p-2 bg-yellow-100 rounded-full text-[#36013F]"><FaRupeeSign className="text-xs" /></div>
                        <div>
                            <span className="block text-[10px] text-gray-500 uppercase">Budget</span>
                            <span className="font-bold text-xs">{context.querySummary?.budgetRange || "Varies"}</span>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <div className="p-2 bg-yellow-100 rounded-full text-[#36013F]"><FaCalendarAlt className="text-xs" /></div>
                        <div>
                            <span className="block text-[10px] text-gray-500 uppercase">Season</span>
                            <span className="font-bold text-xs">{context.querySummary?.bestSeason || "Seasonal"}</span>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-2">
                        <div className="p-2 bg-yellow-100 rounded-full text-[#36013F]"><FaPassport className="text-xs" /></div>
                        <div>
                            <span className="block text-[10px] text-gray-500 uppercase">Visa</span>
                            <span className="font-bold text-xs">{context.querySummary?.visaStatus || "Required"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Top Experts */}
            <div className="bg-primary p-5 md:p-10 rounded-2xl md:rounded-3xl text-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold">Top Matched Experts</h2>
                        <p className="mt-2 text-sm max-w-2xl text-white/80">{context.matchReason}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {experts.map((expert) => (
                        <div key={expert.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden relative flex flex-col h-full">
                            <div className="absolute top-3 right-3 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded-full z-10 border border-green-200">
                                {expert.matchScore}% Match
                            </div>
                            <div className="p-4 md:p-5 flex-1 flex flex-col">
                                <div className="flex items-start gap-4 mb-3">
                                    <div className="relative shrink-0">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-[#F4D35E] shadow-sm">
                                            <Image
                                                src={expert.photo || "/default.jpg"}
                                                alt={expert.fullName || 'Expert'}
                                                width={64}
                                                height={64}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <h4 className="font-bold text-base md:text-lg text-gray-900 leading-tight truncate">{expert.fullName}</h4>
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            <span className="text-[10px] bg-gray-50 px-2 py-0.5 rounded text-gray-600 font-medium border border-gray-200">
                                                Verified Expert
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-white p-3 rounded-xl border border-purple-100 mb-4 flex-1">
                                    <p className="text-xs text-gray-700 leading-snug line-clamp-3">{expert.aiMatchReason || "Highly relevant to your specific travel query."}</p>
                                </div>
                                <Link href={`/experts/${expert.username || expert.id}`} className="w-full">
                                    <button className="w-full bg-[#36013F] text-white py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-[#4a0152] transition-colors">
                                        Consult with Expert
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Detailed Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {Object.keys(sections).map((key) => {
                    const config = POINTER_CONFIG[key];
                    if (!config) return null;
                    return (
                        <StaticSection
                            key={key}
                            title={config.title}
                            icon={config.icon}
                            data={sections[key]}
                            type={key}
                            colorClass={config.color}
                        />
                    );
                })}
            </div>

            {/* Bottom CTA */}
            <div className="bg-gradient-to-r from-[#36013F] to-[#5a1066] rounded-3xl p-10 text-center text-white mt-8 mb-8">
                <h2 className="text-3xl font-bold mb-4">Plan your perfect trip in minutes.</h2>
                <p className="mb-8 text-lg opacity-90">Unlock personalized advice from experts who know the destination inside out.</p>
                <Link href="/ask-an-expert">
                    <button className="bg-[#F4D35E] text-[#36013F] px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform">
                        Try Live Search
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default SearchLayoutSSR;
