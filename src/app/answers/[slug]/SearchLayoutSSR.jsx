
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    FaRupeeSign, FaCalendarAlt, FaPassport, FaArrowRight,
    FaExclamationTriangle, FaSuitcaseRolling,
    FaGlobeAmericas, FaUsers, FaLightbulb, FaPlane,
    FaCloudSun, FaWallet, FaMapMarkedAlt, FaQuestionCircle,
    FaChartLine, FaCheckCircle, FaTimesCircle, FaExclamationCircle,
    FaRegClock, FaChevronRight, FaQuoteLeft
} from 'react-icons/fa';

// Simplified pointer config
const POINTER_CONFIG = {
    'visa': { title: 'Visa & Entry', icon: <FaPassport />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    'weather': { title: 'Best Time', icon: <FaCloudSun />, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
    'budget': { title: 'Budget', icon: <FaWallet />, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
    'transport': { title: 'Transport', icon: <FaPlane />, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100' },
    'common_problems': { title: 'Safety', icon: <FaExclamationCircle />, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    'related_questions': { title: 'Common FAQs', icon: <FaQuestionCircle />, color: 'text-red-500' },
    'indian_perspective': { title: 'Indian Insights', icon: <FaUsers />, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
};

const StaticSection = ({ title, icon, data, type, config }) => {
    if (!data) return null;

    return (
        <section className={`bg-white border ${config.border} rounded-2xl p-4 md:p-5 shadow-sm transition-all hover:shadow-md h-full flex flex-col group`}>
            <div className="flex items-center gap-2.5 mb-4">
                <div className={`p-2 rounded-xl ${config.bg} ${config.color} text-lg group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 font-[var(--font-dm-serif-display)]">
                    {title}
                </h3>
            </div>

            <div className="flex-1 text-gray-700 leading-relaxed font-[var(--font-inter)]">
                {type === 'indian_perspective' && data?.indianPerspective && (
                    <div className="space-y-4">
                        <div className="bg-green-50/50 p-3 rounded-xl border border-green-100">
                            <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <FaCheckCircle className="text-green-500" /> Advantages
                            </p>
                            <ul className="space-y-1">
                                {(data.indianPerspective.pros || []).slice(0, 3).map((p, i) => (
                                    <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                                        <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5 shrink-0" /> {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-red-50/50 p-3 rounded-xl border border-red-100">
                            <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <FaExclamationCircle className="text-red-400" /> Caution
                            </p>
                            <ul className="space-y-1">
                                {(data.indianPerspective.cons || []).slice(0, 3).map((c, i) => (
                                    <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                                        <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" /> {c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {type === 'visa' && data?.visaSnapshot && (
                    <div className="space-y-4">
                        <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold">
                            {data.visaSnapshot.title || "Required"}
                        </div>
                        <ul className="space-y-2">
                            {(data.visaSnapshot.points || []).slice(0, 3).map((point, idx) => (
                                <li key={idx} className="flex gap-2 items-start text-xs leading-normal">
                                    <FaCheckCircle className="text-blue-500 mt-0.5 shrink-0" size={10} />
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {type === 'weather' && data?.weatherInfo && (
                    <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-100">
                                <span className="block text-[8px] text-orange-600 uppercase font-black tracking-widest mb-0.5">Peak</span>
                                <span className="font-bold text-gray-900 leading-tight">{data.weatherInfo.season || "N/A"}</span>
                            </div>
                            <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                                <span className="block text-[8px] text-blue-600 uppercase font-black tracking-widest mb-0.5">Temp</span>
                                <span className="font-bold text-gray-900 leading-tight">{data.weatherInfo.temperature || "Moderate"}</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-2">Packing Essentials</p>
                            <div className="flex flex-wrap gap-1.5">
                                {(data.weatherInfo.advice || []).slice(0, 4).map((item, idx) => (
                                    <span key={idx} className="bg-white px-2 py-1 rounded-lg text-[10px] text-gray-700 shadow-sm border border-gray-100">{item}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {type === 'budget' && data?.budgetInfo && (
                    <div className="space-y-4 text-xs">
                        <div className="flex items-center justify-between gap-2 bg-green-50 p-3 rounded-xl border border-green-100">
                            <div>
                                <span className="block text-[8px] text-green-700 uppercase font-black tracking-widest">Currency</span>
                                <span className="font-bold text-green-900">{data.budgetInfo.currency || "Local"}</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-[8px] text-green-700 uppercase font-black tracking-widest">Daily Est.</span>
                                <span className="font-bold text-green-900">{data.budgetInfo.dailyEstimate || "Flexible"}</span>
                            </div>
                        </div>
                        <ul className="space-y-2">
                            {(data.budgetInfo.tips || []).slice(0, 3).map((tip, idx) => (
                                <li key={idx} className="text-gray-600 flex items-start gap-2 leading-snug">
                                    <FaRupeeSign className="text-green-600 mt-0.5 shrink-0" size={8} />
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {type === 'transport' && data?.transportInfo && (
                    <div className="space-y-4 text-xs">
                        <div className="bg-sky-50 p-3 rounded-xl border border-sky-100">
                            <span className="block text-[8px] text-sky-700 uppercase font-black tracking-widest mb-1">Best Route</span>
                            <p className="font-bold text-gray-900 leading-tight">{data.transportInfo.bestRoute || "Direct connectivity"}</p>
                        </div>
                        <p className="text-gray-600 leading-normal line-clamp-3">{data.transportInfo.localTravel || "Easy to navigate locally."}</p>
                    </div>
                )}

                {type === 'common_problems' && data?.commonProblems && (
                    <div className="space-y-2">
                        {(data.commonProblems.list || []).slice(0, 3).map((item, idx) => (
                            <div key={idx} className="bg-red-50 p-2.5 rounded-xl border border-red-100 flex gap-2 items-center">
                                <FaExclamationCircle className="text-red-500 shrink-0" size={10} />
                                <p className="text-[10px] font-medium text-red-900 leading-tight">{item.problem || "Safety precaution"}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

const SectionHeading = ({ children }) => (
    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 font-[var(--font-dm-serif-display)] border-l-4 border-[#36013F] pl-4">
        {children}
    </h2>
);

const toSentenceCase = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const SearchLayoutSSR = ({ experts = [], context = {}, query = "", sections = {} }) => {
    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const displayQuery = toSentenceCase(query);

    return (
        <div className="w-full bg-[#FCFBFF]  selection:bg-purple-100 font-[var(--font-inter)]">
            {/* HERO SECTION - More compact */}
            <div className="bg-[#36013F] text-white  py-30 md:py-32 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-blue-500 blur-[120px] rounded-full"></div>
                </div>

                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="flex flex-col items-center md:items-start md:text-left text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] md:text-xs font-medium mb-4 backdrop-blur-sm uppercase tracking-widest font-[var(--font-ralewaySans-sans)]">
                            <FaChartLine className="text-yellow-400" />
                            <span>Curated travel report</span>
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight font-[var(--font-dm-serif-display)] tracking-tight">
                            {displayQuery}
                        </h1>

                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs opacity-70 mb-8 font-[var(--font-ralewaySans-sans)]">
                            <div className="flex items-center gap-1.5 uppercase tracking-wider font-bold">
                                <FaRegClock /> {today}
                            </div>
                            <div className="w-1 h-1 bg-white rounded-full opacity-30"></div>
                            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                                <FaCheckCircle className="text-green-400" /> Verified Analysis
                            </div>
                        </div>

                        <Link href={`/ask-an-expert?search=${encodeURIComponent(query)}`}>
                            <button className="bg-[#F4D35E] text-[#36013F] px-6 py-3 rounded-full font-bold shadow-lg hover:bg-[#ffe282] transition-all flex items-center gap-2 text-sm md:text-base font-[var(--font-ralewaySans-sans)] uppercase tracking-wider cursor-pointer">
                                Ask Live Expert <FaArrowRight />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-4 -mt-8 md:-mt-12 relative z-20 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">

                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-10 md:space-y-12">
                        {/* Summary Card */}
                        <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-6 md:p-10">
                            <div className="flex items-start gap-4 mb-8">
                                <FaQuoteLeft className="text-3xl text-purple-200 shrink-0 mt-1" />
                                <p className="text-lg md:text-xl text-gray-800 leading-relaxed font-medium italic">
                                    {context.matchReason || `Expertly curated traveling guide for those looking to explore ${displayQuery} with confidence and localized insights.`}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-gray-50">
                                <div className="space-y-1">
                                    <span className="block text-[8px] font-bold text-black uppercase tracking-widest font-[var(--font-ralewaySans-sans)]">Budget Tier</span>
                                    <div className="flex items-center gap-1.5 text-gray-900 font-bold text-xs uppercase tracking-tight">
                                        <FaRupeeSign className="text-purple-600" size={10} /> {context.querySummary?.budgetRange || "Flexible"}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="block text-[8px] font-bold text-black uppercase tracking-widest font-[var(--font-ralewaySans-sans)]">Best Time</span>
                                    <div className="flex items-center gap-1.5 text-gray-900 font-bold text-xs uppercase tracking-tight">
                                        <FaCalendarAlt className="text-purple-600" size={10} /> {context.querySummary?.bestSeason || "Anytime"}
                                    </div>
                                </div>
                                <div className="space-y-1 col-span-2 sm:col-span-1 border-t sm:border-t-0 pt-4 sm:pt-0">
                                    <span className="block text-[8px] font-bold text-black uppercase tracking-widest font-[var(--font-ralewaySans-sans)]">Visa Status</span>
                                    <div className="flex items-center gap-1.5 text-gray-900 font-bold text-xs uppercase tracking-tight">
                                        <FaPassport className="text-purple-600" size={10} /> {context.querySummary?.visaStatus || "Required"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* More Compact Grid for Insights */}
                        <div className="space-y-8">
                            <SectionHeading>Strategic Insights</SectionHeading>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                                {(() => {
                                    const sectionKeys = Object.keys(sections).filter(key =>
                                        POINTER_CONFIG[key] && key !== 'related_questions' && sections[key]
                                    );
                                    const isOdd = sectionKeys.length % 2 !== 0;

                                    return sectionKeys.map((key, index) => {
                                        const config = POINTER_CONFIG[key];
                                        const isLast = index === sectionKeys.length - 1;

                                        return (
                                            <div key={key} className={isOdd && isLast ? "sm:col-span-2" : ""}>
                                                <StaticSection
                                                    title={config.title}
                                                    icon={config.icon}
                                                    data={sections[key]}
                                                    type={key}
                                                    config={config}
                                                />
                                            </div>
                                        );
                                    });
                                })()}
                            </div>

                            {/* FAQ - Refined */}
                            {sections.related_questions && (
                                <div className="mt-12 md:mt-16">
                                    <SectionHeading>Common Questions</SectionHeading>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {sections.related_questions.relatedQuestions?.map((item, idx) => (
                                            <div key={idx} className="group bg-white p-5 rounded-2xl border border-gray-100 transition-all hover:border-purple-200 hover:shadow-sm cursor-pointer">
                                                <h4 className="text-sm font-bold text-gray-900 mb-2 flex justify-between items-start font-[var(--font-ralewaySans-sans)]">
                                                    <span className="flex-1 pr-4">{item.question}</span>
                                                    <FaChevronRight className="text-[10px] opacity-20 mt-1 transition-transform group-hover:translate-x-1" />
                                                </h4>
                                                <p className="text-gray-600 leading-normal text-xs">{item.teaserAnswer}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-purple-900/5">
                                <h3 className="text-xl font-bold text-gray-900 mb-1 font-[var(--font-dm-serif-display)]">Top Match</h3>
                                <p className="text-xs text-gray-500 mb-6 font-[var(--font-ralewaySans-sans)] uppercase tracking-widest font-bold">Verified Travel Experts</p>

                                <div className="space-y-5">
                                    {experts.map((expert) => (
                                        <div key={expert.id} className="bg-gray-50/50 rounded-2xl p-4 border border-gray-50 group hover:bg-white hover:border-purple-100 hover:shadow-md transition-all">
                                            <div className="flex gap-4 mb-4">
                                                <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-purple-100 shrink-0 shadow-sm relative group-hover:border-purple-200 transition-colors">
                                                    <Image
                                                        src={expert.photo || "/default.jpg"}
                                                        alt={expert.fullName || 'Expert'}
                                                        width={56}
                                                        height={56}
                                                        className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 leading-tight text-sm mb-1 truncate group-hover:text-purple-900 transition-colors">{expert.fullName}</h4>
                                                    {expert.tagline && (
                                                        <p className="text-[10px] text-gray-500 line-clamp-1 mb-1.5 italic leading-tight">
                                                            "{expert.tagline}"
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-[9px] uppercase font-bold text-purple-600 tracking-wider flex items-center gap-1 font-[var(--font-ralewaySans-sans)] bg-purple-50 px-1.5 py-0.5 rounded-md">
                                                            <FaCheckCircle className="shrink-0 text-[8px]" /> Verified
                                                        </p>
                                                        {expert.yearsOfExperience > 0 && (
                                                            <span className="text-[9px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-md">
                                                                {expert.yearsOfExperience}y Exp.
                                                            </span>
                                                        )}
                                                        <div className="flex items-center gap-2 text-[10px] text-gray-600">
                                                            <FaMapMarkedAlt className="text-purple-400 shrink-0" size={10} />
                                                            <span className="truncate">{expert.location || "Global Expert"}</span>
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-4">

                                                <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2 bg-purple-50/30 p-2 rounded-xl border border-purple-50/50">
                                                    {expert.aiMatchReason || "Highly relevant to your travel needs."}
                                                </p>
                                            </div>

                                            <Link href={`/experts/${expert.username || expert.id}`}>
                                                <button className="w-full bg-[#36013F] text-white py-2.5 rounded-full text-xs font-bold shadow-md hover:bg-[#4a0152] transition-all transform hover:-translate-y-0.5 active:translate-y-0 font-[var(--font-ralewaySans-sans)] uppercase tracking-widest cursor-pointer">
                                                    Consult Now
                                                </button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#36013F] rounded-3xl p-6 text-white text-center shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-6 transition-transform">
                                    <FaSuitcaseRolling size={80} />
                                </div>
                                <h3 className="text-xl font-bold mb-2 font-[var(--font-dm-serif-display)] relative z-10">Plan Your Trip</h3>
                                <p className="text-xs opacity-70 mb-6 relative z-10 font-[var(--font-ralewaySans-sans)]">Get a personalized itinerary in minutes.</p>
                                <Link href="/ask-an-expert">
                                    <button className="w-full bg-white text-[#36013F] py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-all font-[var(--font-ralewaySans-sans)] uppercase tracking-widest text-xs relative z-10 cursor-pointer">
                                        Get Started
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Bottom CTA */}
            {/* <div className="bg-white border-t border-gray-100 pt-10 md:pt-10 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-2xl md:text-4xl font-black mb-4 font-[var(--font-dm-serif-display)] text-gray-900">
                        Need more help?
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 mb-10 leading-relaxed font-[var(--font-inter)]">
                        Our verified experts offer real-time advice tailored to your preferences.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link href="/ask-an-expert">
                            <button className="bg-[#36013F] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl hover:bg-[#4a0152] transition-all font-[var(--font-ralewaySans-sans)] uppercase tracking-widest cursor-pointer">
                                Connect with Expert
                            </button>
                        </Link>
                        <Link href="/">
                            <button className="bg-white text-gray-700 border border-gray-200 px-8 py-3.5 rounded-xl font-bold text-sm hover:border-purple-300 transition-all font-[var(--font-ralewaySans-sans)] uppercase tracking-widest cursor-pointer">
                                Back to Home
                            </button>
                        </Link>
                    </div>
                </div>
            </div> */}
        </div>
    );
};

export default SearchLayoutSSR;
