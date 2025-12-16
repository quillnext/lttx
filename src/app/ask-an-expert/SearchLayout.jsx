
import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    FaRupeeSign, FaCalendarAlt, FaPassport, FaArrowRight, 
    FaExclamationTriangle, FaSuitcaseRolling, FaUnlock, 
    FaGlobeAmericas, FaUsers, FaLightbulb, FaPlane, 
    FaCloudSun, FaWallet, FaMapMarkedAlt, FaQuestionCircle,
    FaChartLine
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const CACHE_KEY_PREFIX = 'travel-section-cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Static configuration for pointer visuals
const POINTER_CONFIG = {
    'visa': { title: 'Visa & Entry', icon: <FaPassport />, desc: 'Check requirements & docs', color: 'text-blue-600' },
    'weather': { title: 'Weather & Time', icon: <FaCloudSun />, desc: 'Best season & packing', color: 'text-orange-500' },
    'budget': { title: 'Budget & Costs', icon: <FaWallet />, desc: 'Currency & daily spend', color: 'text-green-600' },
    'transport': { title: 'Transport', icon: <FaPlane />, desc: 'Routes & local travel', color: 'text-sky-600' },
    'itinerary': { title: 'Smart Itinerary', icon: <FaMapMarkedAlt />, desc: 'Suggested flow & stops', color: 'text-purple-600' },
    'related_questions': { title: 'Common FAQs', icon: <FaQuestionCircle />, desc: 'What others ask', color: 'text-red-500' },
};

const getYears = (yearsStr) => {
    if (!yearsStr || typeof yearsStr !== 'string') return "0+";
    const match = yearsStr.match(/\d+\+?/);
    return match ? match[0] : "0+";
};

const calculateTotalExperience = (experience) => {
    if (!Array.isArray(experience) || experience.length === 0) return "0+";
    const today = new Date();
    let earliestStart = null, latestEnd = null;
    experience.forEach(exp => {
      const startDate = exp.startDate ? new Date(exp.startDate) : null;
      const endDate = exp.endDate === "Present" ? today : (exp.endDate ? new Date(exp.endDate) : null);
      if (startDate && (!earliestStart || startDate < earliestStart)) earliestStart = startDate;
      if (endDate && (!latestEnd || endDate > latestEnd)) latestEnd = endDate;
    });
    if (!earliestStart || !latestEnd || latestEnd < earliestStart) return "0+";
    const totalMonths = (latestEnd.getFullYear() - earliestStart.getFullYear()) * 12 + (latestEnd.getMonth() - earliestStart.getMonth());
    const years = Math.floor(totalMonths / 12);
    return `${years}+`;
};

// Enhanced loadSectionData with caching, debounce, error handling
const useLoadSectionData = (query) => {
    return useCallback(async (type) => {
        const cacheKey = `${CACHE_KEY_PREFIX}:${query}:${type}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL) return data;
        }

        const lastCall = localStorage.getItem(`${cacheKey}:lastCall`);
        if (lastCall && Date.now() - parseInt(lastCall) < 1000) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        localStorage.setItem(`${cacheKey}:lastCall`, Date.now().toString());

        try {
            const response = await fetch('/api/ai-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, action: 'section', sectionType: type }),
            });
            if (!response.ok) {
                if (response.status === 429) throw new Error('Rate limited—retry in 1 min');
                throw new Error('Failed to load section');
            }
            const data = await response.json();
            localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
            return data;
        } catch (error) {
            console.error(`Error loading ${type}:`, error);
            return null;
        }
    }, [query]);
};

// Dispute Stat Component
const DisputeStat = ({ data }) => {
    if (!data) return null;
    return (
        <div className="mt-4 pt-3 border-t border-red-100 bg-red-50 p-3 rounded-lg flex gap-3 items-start animate-fade-in-up">
            <div className="bg-white p-1.5 rounded-full text-red-500 shadow-sm shrink-0 mt-0.5">
                <FaExclamationTriangle size={12} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-red-800 uppercase tracking-wider mb-0.5">Dispute Index</p>
                <p className="text-xs text-red-700 leading-snug">
                    <span className="font-bold">{data.percentage}%</span> {data.text}
                </p>
            </div>
        </div>
    );
};

// Reusable Lazy Load Section
const LazySection = ({ title, description, icon, type, loadSectionData, query, colorClass = "text-[#36013F]" }) => {
    const [status, setStatus] = useState('idle'); // idle | loading | loaded | error
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const handleLoad = useCallback(async () => {
        setStatus('loading');
        setError(null);
        const result = await loadSectionData(type);
        if (result) {
            setData(result);
            setStatus('loaded');
        } else {
            setError('Failed to load.');
            setStatus('error');
        }
    }, [type, loadSectionData]);

    if (status === 'idle') {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow h-full justify-center min-h-[220px]" role="button" tabIndex={0} aria-label={`Load ${title}`} onKeyDown={(e) => e.key === 'Enter' && handleLoad()}>
                <div className={`p-4 bg-gray-50 rounded-full mb-4 text-3xl ${colorClass}`}>
                    {icon}
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">{title}</h3>
                <p className="text-xs text-gray-500 mb-5 max-w-[80%]">{description}</p>
                <button 
                    onClick={handleLoad}
                    className="flex items-center gap-2 bg-[#36013F] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-opacity-90 transition-all shadow-sm group"
                >
                    <FaUnlock className="text-[10px] group-hover:scale-110 transition-transform" />
                    Reveal
                </button>
            </div>
        );
    }

    if (status === 'loading') {
        return (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse h-full min-h-[220px] flex flex-col justify-center">
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
                <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6 mx-auto"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="bg-white border border-red-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm h-full justify-center min-h-[220px]">
                <div className="p-3 bg-red-50 rounded-full text-red-500 mb-3 text-2xl">{icon}</div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{title}</h3>
                <p className="text-xs text-red-600 mb-4">{error}</p>
                <button onClick={handleLoad} className="text-xs bg-red-50 text-red-600 px-4 py-2 rounded-full hover:bg-red-100">Try Again</button>
            </div>
        );
    }

    // Render Loaded Content
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative overflow-hidden h-full flex flex-col min-h-[220px]"
        >
            <div className={`absolute top-0 right-0 p-4 opacity-5 text-6xl ${colorClass}`}>{icon}</div>
            
            <h3 className={`text-base font-bold mb-4 flex items-center gap-2 ${colorClass}`}>
                {icon} {title}
            </h3>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar text-sm">
                
                {/* Related Questions */}
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

                {/* Visa */}
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

                {/* Weather */}
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

                {/* Budget */}
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

                {/* Transport */}
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

                {/* Itinerary */}
                {type === 'itinerary' && data.itinerarySuggestion && (
                    <div className="space-y-3">
                        <div className="flex gap-2 mb-2">
                            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-1 rounded">{data.itinerarySuggestion.duration}</span>
                            <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-1 rounded truncate max-w-[150px]">{data.itinerarySuggestion.focus}</span>
                        </div>
                        <div className="relative border-l-2 border-dashed border-gray-200 ml-1.5 pl-3 space-y-3">
                            {data.itinerarySuggestion.dayByDay?.map((day, idx) => (
                                <div key={idx} className="relative">
                                    <span className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-[#36013F]"></span>
                                    <p className="text-xs text-gray-700 leading-snug">{day}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- DISPUTE STAT --- */}
                {data.dispute && <DisputeStat data={data.dispute} />}

            </div>
        </motion.div>
    );
};

const SearchLayout = ({ experts, context, query, onBookClick, openLightbox }) => {
  const loadSectionData = useLoadSectionData(query);

  if (!context) return null;

  // Determine valid pointers to show. Default to a subset if API didn't return any (fallback).
  // The API is expected to return `relevantPointers` array in context.
  // Fallback to basic visa/faq if not provided to handle older cached responses.
  const relevantPointerIds = context.relevantPointers && context.relevantPointers.length > 0 
    ? context.relevantPointers 
    : ['visa', 'related_questions']; 

  return (
    <div className="w-full space-y-8 md:space-y-12 md:pb-20">
      
      {/* 1. Query Summary Strip */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-1 w-full md:w-auto text-left">
          <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Your Search Analysis</p>
          <h2 className="text-xl md:text-2xl font-bold text-[#36013F] capitalize leading-tight">{query}</h2>
          <button 
            onClick={() => document.getElementById('expert-grid')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#36013F] w-full md:w-auto text-white px-6 py-3 mt-4 md:mt-6 rounded-full font-bold shadow-lg hover:bg-opacity-90 transition whitespace-nowrap text-sm md:text-base"
          >
            Check with Expert
          </button>
        </div>
        
        {/* Stats Grid */}
        <div className="w-full md:w-auto grid grid-cols-3 md:flex md:flex-col gap-3 md:gap-4 text-sm text-gray-700 pt-4 md:pt-0 border-t md:border-t-0 border-dashed border-gray-200">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-2 text-center md:text-left">
            <div className="p-2 bg-yellow-100 rounded-full text-[#36013F] shrink-0"><FaRupeeSign className="text-xs md:text-sm"/></div>
            <div>
              <span className="block text-[10px] md:text-xs text-gray-500 uppercase">Budget</span>
              <span className="font-bold text-xs md:text-sm leading-tight block">{context.querySummary?.budgetRange || "Varies"}</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-center gap-2 text-center md:text-left">
            <div className="p-2 bg-yellow-100 rounded-full text-[#36013F] shrink-0"><FaCalendarAlt className="text-xs md:text-sm"/></div>
            <div>
              <span className="block text-[10px] md:text-xs text-gray-500 uppercase">Season</span>
              <span className="font-bold text-xs md:text-sm leading-tight block">{context.querySummary?.bestSeason || "Seasonal"}</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-center gap-2 text-center md:text-left">
            <div className="p-2 bg-yellow-100 rounded-full text-[#36013F] shrink-0"><FaPassport className="text-xs md:text-sm"/></div>
            <div>
              <span className="block text-[10px] md:text-xs text-gray-500 uppercase">Visa</span>
              <span className="font-bold text-xs md:text-sm leading-tight block">{context.querySummary?.visaStatus || "Required"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Smart Expert Matches (Hero Grid) */}
      <div id="expert-grid" className="bg-primary p-5 md:p-10 rounded-2xl md:rounded-3xl text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold">Top Matched Experts</h3>
            <p className="mt-2 text-sm max-w-2xl text-white/80">{context.matchReason}</p>
          </div>
          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase whitespace-nowrap self-start md:self-auto">
            {experts.length} Verified Matches
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {experts.map((expert, index) => (
            <motion.div
              key={expert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group relative flex flex-col h-full"
            >
              <div className="absolute top-3 right-3 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded-full flex items-center shadow-sm z-10 border border-green-200">
                 {expert.matchScore || expert.score}% Match
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
                        className="object-cover w-full h-full cursor-pointer hover:scale-110 transition-transform duration-500"
                        onClick={() => expert.photo && openLightbox(expert.photo)}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h4 className="font-bold text-base md:text-lg text-gray-900 leading-tight truncate pr-14">{expert.fullName || 'Unnamed Expert'}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{expert.tagline}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-[10px] bg-gray-50 px-2 py-0.5 rounded text-gray-600 font-medium border border-gray-200">
                            {expert.profileType === 'agency' ? getYears(expert.yearsActive) : (calculateTotalExperience(expert.experience) || "0+")} Yrs Exp
                        </span>
                        <span className="text-[10px] bg-gray-50 px-2 py-0.5 rounded text-gray-600 font-medium border border-gray-200 flex items-center">
                            <FaRupeeSign size={8} className="mr-0.5" /> {expert.pricing?.split('/')[0] || "799"}
                        </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-white p-3 rounded-xl border border-purple-100 mb-4 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                        <FaSuitcaseRolling className="text-purple-900 text-[10px]" />
                        <p className="text-[10px] text-purple-900 font-bold uppercase tracking-wider">Expertise Match</p>
                    </div>
                    <p className="text-xs text-gray-700 leading-snug line-clamp-3">{expert.aiMatchReason || expert.reason || "Highly relevant to your specific travel query."}</p>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Link href={expert.profileType === 'agency' ? `/agency/${expert.username}` : `/experts/${expert.username}`} className="flex-1">
                    <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-gray-50 transition-colors">
                      View Profile
                    </button>
                  </Link>
                  <button
                    onClick={() => onBookClick(expert)}
                    className="flex-1 bg-[#36013F] text-white py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-[#4a0152] shadow-sm transition-colors"
                  >
                    Ask Query
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Lazy Load Grid - Dynamic Keys based on context */}
      {relevantPointerIds.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {relevantPointerIds.map((pointerId) => {
                  const config = POINTER_CONFIG[pointerId];
                  if (!config) return null; // Skip unknown pointers
                  return (
                      <LazySection 
                          key={pointerId}
                          title={config.title} 
                          description={config.desc}
                          icon={config.icon}
                          type={pointerId}
                          loadSectionData={loadSectionData}
                          query={query}
                          colorClass={config.color}
                      />
                  );
              })}
          </div>
      )}

      {/* 4. Bottom Conversion Strip (Mobile) */}
      <div className=" w-full bg-[#36013F] rounded-2xl text-white p-5 z-40 shadow-2xl border-t border-white/10 md:hidden">
        <div className="flex justify-between items-center gap-2">
            <div className="min-w-0">
                <p className="text-[10px] opacity-80 truncate">Travel is too expensive to guess.</p>
                <p className="font-bold text-xs">Don't guess. Ask an expert.</p>
            </div>
            <button 
                onClick={() => document.getElementById('expert-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#F4D35E] text-[#36013F] px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap"
            >
                Consult Now
            </button>
        </div>
      </div>
      
      {/* Desktop Bottom CTA */}
      <div className="bg-gradient-to-r from-[#36013F] to-[#5a1066] rounded-3xl p-10 text-center text-white mt-8 mb-8 hidden md:block">
        <h2 className="text-3xl font-bold mb-4">Travel is too expensive to guess.</h2>
        <p className="mb-8 text-lg opacity-90">Your entire trip can be mapped in 20 minutes by a verified expert.</p>
        <button 
            onClick={() => document.getElementById('expert-grid')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#F4D35E] text-[#36013F] px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform"
        >
            Start Consultation
        </button>
      </div>

    </div>
  );
};

export default SearchLayout;
