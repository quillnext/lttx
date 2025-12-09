
import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaRupeeSign, FaCalendarAlt, FaPassport, FaArrowRight, FaExclamationTriangle, FaSuitcaseRolling, FaUnlock, FaGlobeAmericas, FaUsers, FaLightbulb } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CACHE_KEY_PREFIX = 'travel-section-cache';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

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

        // Simple debounce: wait 1s if recent call (to avoid bursts)
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
            // Fallback: Return static placeholder or null
            return null;
        }
    }, [query]);
};

// Reusable Lazy Load Section (with error state)
const LazySection = ({ title, description, icon, type, loadSectionData, query }) => {
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
            setError('Failed to load—try again or check connection.');
            setStatus('error');
        }
    }, [type, loadSectionData]);

    if (status === 'idle') {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow" role="button" tabIndex={0} aria-label={`Load ${title}`} onKeyDown={(e) => e.key === 'Enter' && handleLoad()}>
                <div className="p-3 bg-gray-100 rounded-full text-[#36013F] mb-3 text-2xl">
                    {icon}
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-500 mb-4">{description}</p>
                <button 
                    onClick={handleLoad}
                    className="flex items-center gap-2 bg-[#36013F] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-opacity-90 transition-all shadow-md group"
                    aria-label={`Reveal ${title}`}
                >
                    <FaUnlock className="text-xs group-hover:scale-110 transition-transform" />
                    Reveal {title}
                </button>
            </div>
        );
    }

    if (status === 'loading') {
        return (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse" aria-label="Loading">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="bg-white border border-red-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
                <div className="p-3 bg-red-50 rounded-full text-red-500 mb-3 text-2xl">{icon}</div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">{title}</h3>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <button 
                    onClick={handleLoad}
                    className="flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-red-600 transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Render Loaded Content based on Type
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden"
            role="region"
            aria-label={title}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl text-[#36013F]">{icon}</div>
            
            {type === 'related_questions' && data.relatedQuestions && (
                <>
                    <h3 className="text-lg font-bold text-[#36013F] mb-4 flex items-center gap-2">{icon} Travellers also asked</h3>
                    <div className="space-y-4">
                        {data.relatedQuestions.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                                <h4 className="font-semibold text-gray-800 text-sm leading-snug">"{item.question}"</h4>
                                <p className="text-xs text-gray-500 italic mt-1">"{item.teaserAnswer}"</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {type === 'insights' && data.insights && (
                <>
                    <h3 className="text-lg font-bold text-[#36013F] mb-4 flex items-center gap-2">{icon} Key Insights</h3>
                    <div className="space-y-3">
                        {data.insights.slice(0, 6).map((insight, idx) => {
                            return (
                                <div key={idx} className="flex items-start gap-2">
                                    <span className="text-[#F4D35E] mt-1 text-xs"><FaExclamationTriangle /></span>
                                    <p className="text-sm text-gray-700">{insight}</p>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {type === 'visa' && data.visaSnapshot && (
                <>
                    <h3 className="text-lg font-bold text-[#36013F] mb-4 flex items-center gap-2">{icon} {data.visaSnapshot.title || "Visa Check"}</h3>
                    <ul className="space-y-2">
                        {data.visaSnapshot.points?.map((point, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-[#36013F] mt-1 font-bold">✓</span> {point}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {type === 'mistakes' && data.mistakes && (
                <div className="bg-red-50 -m-6 p-6 h-full">
                    <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">{icon} Avoid these mistakes</h3>
                    <ul className="space-y-3">
                        {data.mistakes.map((mistake, idx) => (
                            <li key={idx} className="text-sm text-red-700 font-medium flex items-start gap-2">
                                <span className="mt-1">✕</span> {mistake}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {type === 'peer_plans' && data.peerPlans && (
                <>
                    <h3 className="text-lg font-bold text-[#36013F] mb-4 flex items-center gap-2">{icon} Peer Plans</h3>
                    <div className="space-y-4">
                        {data.peerPlans.map((plan, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                                <h4 className="font-bold text-gray-800 text-sm">{plan.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{plan.desc}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </motion.div>
    );
};

const SearchLayout = ({ experts, context, query, onBookClick, openLightbox }) => {
  const loadSectionData = useLoadSectionData(query);

  if (!context) return null;

  return (
    <div className="w-full space-y-12 pb-20">
      
      {/* 1. Query Summary Strip */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 grid grid-cols-2 justify-between items-center gap-4">
        <div className="flex-1 text-center md:text-left">
          <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Your Search Analysis</p>
          <h2 className="text-2xl font-bold text-[#36013F] capitalize">{query}</h2>
          <button 
            onClick={() => document.getElementById('expert-grid')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#36013F] w-full text-white px-6 py-3 mt-10 rounded-full font-bold shadow-lg hover:bg-opacity-90 transition whitespace-nowrap"
            aria-label="Scroll to experts"
          >
            Check with Expert
          </button>
        </div>
        <div className="flex flex-col gap-6 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-full text-[#36013F]"><FaRupeeSign /></div>
            <div>
              <span className="block text-xs text-gray-500">Est. Budget</span>
              <span className="font-semibold">{context.querySummary?.budgetRange || "Varies"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-full text-[#36013F]"><FaCalendarAlt /></div>
            <div>
              <span className="block text-xs text-gray-500">Best Season</span>
              <span className="font-semibold">{context.querySummary?.bestSeason || "Seasonal"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-full text-[#36013F]"><FaPassport /></div>
            <div>
              <span className="block text-xs text-gray-500">Visa</span>
              <span className="font-semibold">{context.querySummary?.visaStatus || "Required"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Smart Expert Matches (Hero Grid) - ALWAYS VISIBLE */}
      <div id="expert-grid" className="bg-primary p-10 rounded-2xl text-white">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <h3 className="text-3xl font-bold">Top Matched Experts</h3>
            <p className="mt-2 text-sm max-w-2xl">{context.matchReason}</p>
          </div>
          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase whitespace-nowrap">
            {experts.length} Verified Matches
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert, index) => (
            <motion.div
              key={expert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group relative flex flex-col h-full"
            >
              {/* Match Score Badge - Mapped from backend 'score' */}
              <div className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm z-10 border border-green-200">
                 {expert.matchScore || expert.score}% Match
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start gap-4 mb-3">
                  <div className="relative">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-[#F4D35E] shadow-sm">
                      <Image
                        src={expert.photo || "/default.jpg"}
                        alt={expert.fullName || 'Expert'}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full cursor-pointer hover:scale-110 transition-transform duration-500"
                        onClick={() => expert.photo && openLightbox(expert.photo)}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h4 className="font-bold text-lg text-gray-900 leading-tight truncate">{expert.fullName || 'Unnamed Expert'}</h4>
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
                
                {/* Specific Match Reason - Mapped from backend 'reason' */}
                <div className="mt-2 bg-gradient-to-r from-purple-50 to-white p-3 rounded-xl border border-purple-100 mb-4 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                        <FaSuitcaseRolling className="text-purple-900 text-[10px]" />
                        <p className="text-[10px] text-purple-900 font-bold uppercase tracking-wider">Expertise Match</p>
                    </div>
                    <p className="text-xs text-gray-700 leading-snug">{expert.aiMatchReason || expert.reason || "Highly relevant to your specific travel query."}</p>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Link href={expert.profileType === 'agency' ? `/agency/${expert.username}` : `/experts/${expert.username}`} className="flex-1">
                    <button className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors" aria-label="View profile">
                      View Profile
                    </button>
                  </Link>
                  <button
                    onClick={() => onBookClick(expert)}
                    className="flex-1 bg-[#36013F] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4a0152] shadow-md transition-colors"
                    aria-label="Ask query"
                  >
                    Ask Query
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Lazy Load Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LazySection 
              title="Related Questions" 
              description="See what others are asking about this."
              icon={<FaUsers />}
              type="related_questions"
              loadSectionData={loadSectionData}
              query={query}
          />
          <LazySection 
              title="Critical Insights" 
              description="Important factors before you plan."
              icon={<FaLightbulb />}
              type="insights"
              loadSectionData={loadSectionData}
              query={query}
          />
          <LazySection 
              title="Visa Snapshot" 
              description="Quick check on documentation needs."
              icon={<FaPassport />}
              type="visa"
              loadSectionData={loadSectionData}
              query={query}
          />
          <LazySection 
              title="Common Mistakes" 
              description="Avoid pitfalls other travelers face."
              icon={<FaExclamationTriangle />}
              type="mistakes"
              loadSectionData={loadSectionData}
              query={query}
          />
          <LazySection 
              title="Peer Plans" 
              description="Browse itineraries from similar trips."
              icon={<FaGlobeAmericas />}
              type="peer_plans"
              loadSectionData={loadSectionData}
              query={query}
          />
      </div>

      {/* 4. Bottom Conversion Strip */}
      <div className="fixed bottom-0 left-0 w-full bg-[#36013F] text-white p-4 z-40 shadow-2xl border-t border-white/10 md:hidden">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-xs opacity-80">Planning {query}?</p>
                <p className="font-bold text-sm">Don't guess. Ask an expert.</p>
            </div>
            <button 
                onClick={() => document.getElementById('expert-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#F4D35E] text-[#36013F] px-5 py-2 rounded-full font-bold text-sm"
                aria-label="Consult now"
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
            aria-label="Start consultation"
        >
            Start Consultation
        </button>
      </div>

    </div>
  );
};

export default SearchLayout;