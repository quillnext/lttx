
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaRupeeSign, FaCalendarAlt, FaPassport, FaArrowRight, FaExclamationTriangle, FaSuitcaseRolling } from 'react-icons/fa';
import { motion } from 'framer-motion';


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
      const endDate = exp.endDate === "Present" ? today : exp.endDate ? new Date(exp.endDate) : null;
      if (startDate && (!earliestStart || startDate < earliestStart)) earliestStart = startDate;
      if (endDate && (!latestEnd || endDate > latestEnd)) latestEnd = endDate;
    });
    if (!earliestStart || !latestEnd || latestEnd < earliestStart) return "0+";
    const totalMonths = (latestEnd.getFullYear() - earliestStart.getFullYear()) * 12 + (latestEnd.getMonth() - earliestStart.getMonth());
    const years = Math.floor(totalMonths / 12);
    return `${years}+`;
  };

const SearchLayout = ({ experts, context, query, onBookClick, openLightbox }) => {
  if (!context) return null;

  return (
    <div className="w-full space-y-12 pb-20">
      
      {/* 1. Query Summary Strip */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 grid grid-cols-2 justify-between items-center gap-4">
        <div className="flex-1 text-center md:text-left">
          <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Your Search Analysis</p>
          <h2 className="text-2xl font-bold text-[#36013F] capitalize">{query}</h2>
          <button 
          onClick={() => document.getElementById('expert-grid').scrollIntoView({ behavior: 'smooth' })}
          className="bg-[#36013F] w-50 text-white px-6 py-3 mt-10 rounded-full font-bold shadow-lg hover:bg-opacity-90 transition whitespace-nowrap"
        >
          Check with Expert
        </button>
        </div>
        <div className=" justify-center gap-6 text-sm text-gray-700">
          <div className="flex pb-5 items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-full text-[#36013F]"><FaRupeeSign /></div>
            <div>
              <span className="block text-xs text-gray-500">Est. Budget</span>
              <span className="font-semibold">{context.querySummary?.budgetRange || "Varies"}</span>
            </div>
          </div>
          <div className="flex pb-5 items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-full text-[#36013F]"><FaCalendarAlt /></div>
            <div>
              <span className="block text-xs text-gray-500">Best Season</span>
              <span className="font-semibold">{context.querySummary?.bestSeason || "Seasonal"}</span>
            </div>
          </div>
          <div className="flex pb-5 items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-full text-[#36013F]"><FaPassport /></div>
            <div>
              <span className="block text-xs text-gray-500">Visa</span>
              <span className="font-semibold">{context.querySummary?.visaStatus || "Required"}</span>
            </div>
          </div>
        </div>
        
      </div>

      {/* 2. Smart Expert Matches (Hero Grid) */}
      <div id="expert-grid" className="bg-primary p-10 rounded-2xl text-white">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div>
            <h3 className="text-3xl font-bold ">Top Matched Experts</h3>
            <p className=" mt-2 text-sm max-w-2xl">{context.matchReason}</p>
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
              {/* Match Score Badge */}
              <div className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm z-10 border border-green-200">
                 {expert.matchScore}% Match
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start gap-4 mb-3">
                  <div className="relative">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-[#F4D35E] shadow-sm">
                      <Image
                        src={expert.photo || "/default.jpg"}
                        alt={expert.fullName}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full cursor-pointer hover:scale-110 transition-transform duration-500"
                        onClick={() => openLightbox(expert.photo)}
                      />
                    </div>
                    {/* Rank Badge */}
                    {/* <div className="absolute -bottom-1 -right-1 bg-[#36013F] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white">
                      {index + 1}
                    </div> */}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h4 className="font-bold text-lg text-gray-900 leading-tight truncate">{expert.fullName}</h4>
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
                
                {/* Specific Match Reason */}
                <div className="mt-2 bg-gradient-to-r from-purple-50 to-white p-3 rounded-xl border border-purple-100 mb-4 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                        <FaSuitcaseRolling className="text-purple-900 text-[10px]" />
                        <p className="text-[10px] text-purple-900 font-bold uppercase tracking-wider">Expertise Match</p>
                    </div>
                    <p className="text-xs text-gray-700 leading-snug">{expert.aiMatchReason || "Highly relevant to your specific travel query."}</p>
                </div>

                <div className="flex gap-2 mt-auto">
                  <Link href={expert.profileType === 'agency' ? `/agency/${expert.username}` : `/experts/${expert.username}`} className="flex-1">
                    <button className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                      View Profile
                    </button>
                  </Link>
                  <button
                    onClick={() => onBookClick(expert)}
                    className="flex-1 bg-[#36013F] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4a0152] shadow-md transition-colors"
                  >
                    Ask Query
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 3. Travellers Also Asked (Teasers) */}
      {context.relatedQuestions && context.relatedQuestions.length > 0 && (
        <section>
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-[#36013F]">Travellers also asked</h3>
            <p className="text-sm text-gray-500">Common questions for {query}. Answers vary by your specific case.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {context.relatedQuestions.slice(0, 3).map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-[#F4D35E] transition-colors group cursor-default">
                <h4 className="font-semibold text-gray-800 mb-2 leading-snug">"{item.question}"</h4>
                <p className="text-sm text-gray-500 mb-4 italic line-clamp-2">"{item.teaserAnswer}"</p>
                <button 
                    onClick={() => document.getElementById('expert-grid').scrollIntoView({ behavior: 'smooth' })}
                    className="text-[#36013F] text-sm font-bold flex items-center gap-2 group-hover:underline"
                >
                  Get exact guidance <FaArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Mini Insights */}
      {context.insights && (
        <section className="bg-gray-100 rounded-3xl p-6 md:p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-[#36013F]">Before you plan, know these 4 things</h3>
            <p className="text-sm text-gray-600">These factors change frequently. Verify with an expert.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {context.insights.map((insight, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm flex items-start gap-3">
                <div className="mt-1 text-[#F4D35E]"><FaExclamationTriangle /></div>
                <div>
                  <p className="text-gray-800 font-medium text-sm">{insight}</p>
                  <button 
                    onClick={() => document.getElementById('expert-grid').scrollIntoView({ behavior: 'smooth' })}
                    className="text-xs text-[#36013F] font-semibold mt-1 hover:underline"
                  >
                    Check how this applies to you
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Visa Snapshot */}
      {context.visaSnapshot && (
        <section className="bg-white border-l-4 border-[#36013F] rounded-r-2xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-xl font-bold text-[#36013F] flex items-center gap-2">
                <FaPassport /> {context.visaSnapshot.title || "Visa Requirements"}
              </h3>
              <ul className="mt-3 space-y-2">
                {context.visaSnapshot.points?.map((point, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-[#F4D35E] mt-1">●</span> {point}
                  </li>
                ))}
              </ul>
            </div>
            <button 
                onClick={() => document.getElementById('expert-grid').scrollIntoView({ behavior: 'smooth' })}
                className="bg-white border-2 border-[#36013F] text-[#36013F] px-6 py-2 rounded-full font-bold hover:bg-[#36013F] hover:text-white transition whitespace-nowrap"
            >
              Check Documents
            </button>
          </div>
        </section>
      )}

      {/* 6. Peer Planning (Social Proof Mock) */}
      {context.peerPlans && context.peerPlans.length > 0 && (
        <section>
          <h3 className="text-2xl font-bold text-[#36013F] mb-4">What travellers like you are planning</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {context.peerPlans.map((plan, idx) => (
              <div key={idx} className="min-w-[280px] bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="w-full h-32 bg-gray-200 rounded-xl mb-3 relative overflow-hidden flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-yellow-100 flex items-center justify-center text-gray-400">
                           <span className="text-2xl">✈️</span>
                        </div>
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm">{plan.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{plan.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">Guided by expert</p>
                    <button 
                        onClick={() => document.getElementById('expert-grid').scrollIntoView({ behavior: 'smooth' })}
                        className="text-[#36013F] text-xs font-bold hover:underline"
                    >
                        Book similar guidance
                    </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Mistakes to Avoid */}
      {context.mistakes && (
        <section className="bg-red-50 rounded-3xl p-6 md:p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-red-900">Avoid these common mistakes</h3>
            <p className="text-red-700 text-sm">Don't rely on outdated blog posts. Ask an expert.</p>
          </div>
          <div className="space-y-3 max-w-3xl mx-auto">
            {context.mistakes.map((mistake, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm">
                <span className="text-gray-800 font-medium text-sm flex-1">{mistake}</span>
                <button 
                    onClick={() => document.getElementById('expert-grid').scrollIntoView({ behavior: 'smooth' })}
                    className="text-red-600 text-xs font-bold uppercase tracking-wider ml-4 hover:underline whitespace-nowrap"
                >
                    Fix This
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. Trending Destinations */}
      <section>
        <h3 className="text-xl font-bold text-[#36013F] mb-4">Trending destinations for Indians</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {['Dubai', 'Bali', 'Vietnam', 'Japan', 'Turkey', 'Thailand'].map((place) => (
                <div key={place} className="relative h-24 rounded-xl overflow-hidden group cursor-pointer bg-gray-200">
                    <div className="absolute inset-0 bg-[#36013F] opacity-80 group-hover:opacity-90 transition-opacity"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-white font-bold text-sm">{place}</span>
                        <span className="text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity mt-1">Talk to expert</span>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* 9. Bottom Conversion Strip */}
      <div className="fixed bottom-0 left-0 w-full bg-[#36013F] text-white p-4 z-40 shadow-2xl border-t border-white/10 md:hidden">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-xs opacity-80">Planning {query}?</p>
                <p className="font-bold text-sm">Don't guess. Ask an expert.</p>
            </div>
            <button 
                onClick={() => document.getElementById('expert-grid').scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#F4D35E] text-[#36013F] px-5 py-2 rounded-full font-bold text-sm"
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
            onClick={() => document.getElementById('expert-grid').scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#F4D35E] text-[#36013F] px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform"
        >
            Start Consultation
        </button>
      </div>

    </div>
  );
};

export default SearchLayout;
