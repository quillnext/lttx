"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Search, Compass, MapPin, CheckCircle, ArrowRight, X, Sparkles, Filter, RupeeSign, Eye, ChevronDown } from "lucide-react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useUserAuthStore } from "@/stores/useUserAuthStore";
import { fetchPublicExperts } from "@/lib/ask-an-expert/client";
import { motion, AnimatePresence } from "framer-motion";

const ProfileServiceDrawer = dynamic(() => import("@/app/components/ProfileServiceDrawer"), {
  ssr: false,
});

const ProfileAddOnModal = dynamic(() => import("@/app/components/ProfileAddOnModal"), {
  ssr: false,
});

const Profile2u0 = dynamic(() => import("@/app/components/Profile2u0"), {
  ssr: false,
});

const MAIN_SERVICES = [
  { key: "1:1 STRATEGIC CONSULTATION", name: "1:1 Strategic Consultation", price: "₹799" },
  { key: "ASK A QUESTION", name: "Ask a travel question", price: "₹299" },
  { key: "THE MASTER PLAN", name: "Start your Master Plan", price: "₹1099" },
  { key: "CUSTOM LUXE PACKAGE", name: "Request a custom luxe package", price: "Quote Based" }
];

const ADD_ON_SERVICES = [
  { key: "Itinerary Review", name: "Get itinerary reviewed", price: "₹199" },
  { key: "Hotel/Area Check", name: "Check hotel area", price: "₹149" },
  { key: "Flight Choice", name: "Flight choice help", price: "₹149" },
  { key: "Packing Checklist", name: "Packing checklist", price: "₹99" }
];

export default function AgencyBrowseExperts() {
  const { user: supabaseUser } = useUserAuthStore();
  const [experts, setExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedAddOn, setSelectedAddOn] = useState(null);
  const [viewingProfileExpert, setViewingProfileExpert] = useState(null);
  const [activeMenuExpertId, setActiveMenuExpertId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((fUser) => {
      if (fUser) {
        setCurrentUser(fUser);
      } else if (supabaseUser) {
        setCurrentUser(supabaseUser);
      } else {
        setCurrentUser(null);
      }
    });

    if (!getAuth(app).currentUser && supabaseUser) {
      setCurrentUser(supabaseUser);
    }
    return () => unsubscribe();
  }, [supabaseUser]);

  const toSentenceCase = (input) => {
    if (!input) return "";
    if (Array.isArray(input)) {
      return input.map(item => toSentenceCase(item)).join(", ");
    }
    if (typeof input !== "string") return "";
    return input
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatProfileData = (data) => {
    return {
      id: data.id,
      fullName: toSentenceCase(data.fullName),
      tagline: toSentenceCase(data.tagline),
      languages: Array.isArray(data.languages) ? data.languages : [],
      location: toSentenceCase(data.location),
      expertise: Array.isArray(data.expertise) ? data.expertise.map(toSentenceCase) : [],
      pricing: data.pricing,
      responseTime: data.responseTime,
      username: data.username,
      photo: data.photo,
      about: toSentenceCase(data.about),
      certifications: toSentenceCase(data.certifications),
      services: Array.isArray(data.services) ? data.services.map(toSentenceCase) : [],
      regions: Array.isArray(data.regions) ? data.regions.map(toSentenceCase) : [],
      experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
        ...exp,
        company: toSentenceCase(exp.company),
        title: toSentenceCase(exp.title),
      })) : [],
      email: data.email || "",
      phone: data.phone || "",
      profileType: data.profileType || 'expert',
      yearsActive: data.yearsActive || '',
    };
  };

  useEffect(() => {
    const loadExperts = async () => {
      setLoading(true);
      try {
        const result = await fetchPublicExperts({ from: 0, to: 100 });
        const list = (result.experts || []).map(formatProfileData);

        // Filter out agency's own profile if possible
        const filteredList = list.filter(
          (e) => !currentUser || (e.email !== currentUser.email && e.id !== currentUser.uid)
        );

        setExperts(filteredList);
        setFilteredExperts(filteredList);
      } catch (err) {
        console.error("Error fetching experts:", err);
      } finally {
        setLoading(false);
      }
    };
    loadExperts();
  }, [currentUser]);

  useEffect(() => {
    let result = experts;
    const term = searchTerm.toLowerCase();

    if (term) {
      result = result.filter((e) => {
        return (
          (e.fullName || "").toLowerCase().includes(term) ||
          (e.location || "").toLowerCase().includes(term) ||
          (e.expertise || []).some((tag) => tag.toLowerCase().includes(term))
        );
      });
    }

    if (languageFilter || locationFilter || specializationFilter) {
      result = result.filter(expert => {
        const matchesLanguage = languageFilter
          ? expert.languages?.some(lang => lang.toLowerCase().includes(languageFilter.toLowerCase()))
          : true;
        const matchesLocation = locationFilter
          ? expert.location?.toLowerCase().includes(locationFilter.toLowerCase())
          : true;
        const matchesSpecialization = specializationFilter
          ? expert.expertise?.some(exp => exp.toLowerCase().includes(specializationFilter.toLowerCase()))
          : true;

        return matchesLanguage && matchesLocation && matchesSpecialization;
      });
    }

    setFilteredExperts(result);
  }, [searchTerm, languageFilter, locationFilter, specializationFilter, experts]);

  const uniqueLanguages = [...new Set(experts.flatMap((expert) => expert.languages || []))].map(toSentenceCase);
  const uniqueLocations = [...new Set(experts.map((expert) => expert.location))].filter(Boolean).map(toSentenceCase);
  const uniqueSpecializations = [...new Set(experts.flatMap((expert) => expert.expertise || []))].map(toSentenceCase);

  const handleClearFilters = () => {
    setSearchTerm("");
    setLanguageFilter("");
    setLocationFilter("");
    setSpecializationFilter("");
  };

  const handleAskClick = (expert) => {
    setSelectedExpert(expert);
    setSelectedService(expert.profileType === 'agency' ? 'CUSTOM LUXE PACKAGE' : 'ASK A QUESTION');
  };

  const handleOpenService = (expert, serviceKey) => {
    setSelectedExpert(expert);
    setSelectedService(serviceKey);
    setActiveMenuExpertId(null);
  };

  const handleOpenAddOn = (expert, addOnKey) => {
    setSelectedExpert(expert);
    setSelectedAddOn(addOnKey);
    setActiveMenuExpertId(null);
  };

  const getYears = (yearsStr) => {
    if (!yearsStr || typeof yearsStr !== "string") return "0+";
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

  const formatPricing = (pricing) => {
    if (!pricing) return "799";
    const numeric = pricing.match(/\d+(\.\d+)?/)?.[0] || "799";
    return `${numeric}`;
  };

  const truncateTagline = (tagline) => {
    if (!tagline) return "";
    return tagline.length > 70 ? `${tagline.substring(0, 70)}...` : tagline;
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Top Title Section matching ask-an-expert */}
        <div className="mb-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Compass className="w-8 h-8 text-[#36013F]" />
              <h1 className="text-3xl font-bold text-[#36013F]">Browse Experts</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">Connect with verified travel specialists, inspect full profiles, and request services directly.</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative flex items-center gap-2 mb-4 w-full">
            <div className="relative w-full shadow-sm rounded-full group focus-within:shadow-md transition-shadow">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#36013F]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search experts by name, destination, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-[#36013F] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-3">
            {[
              { val: languageFilter, set: setLanguageFilter, opts: uniqueLanguages, ph: "Language" },
              { val: locationFilter, set: setLocationFilter, opts: uniqueLocations, ph: "Location" },
              { val: specializationFilter, set: setSpecializationFilter, opts: uniqueSpecializations, ph: "Expertise" }
            ].map((filter, idx) => (
              <div key={idx} className="relative group">
                <select
                  value={filter.val}
                  onChange={(e) => filter.set(e.target.value)}
                  className="appearance-none bg-gray-50 pl-4 pr-9 py-2 text-xs font-medium text-gray-700 border border-gray-200 rounded-full focus:outline-none focus:border-[#36013F] hover:border-gray-300 shadow-sm cursor-pointer min-w-[120px]"
                >
                  <option value="">{filter.ph}</option>
                  {filter.opts.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3 pointer-events-none" />
              </div>
            ))}

            {(languageFilter || locationFilter || specializationFilter || searchTerm) && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-all text-xs font-semibold"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-8 w-8 text-[#36013F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white border border-dashed rounded-2xl shadow-sm max-w-lg mx-auto">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No experts found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
            <button onClick={handleClearFilters} className="mt-4 text-xs font-bold text-[#36013F] hover:underline">Reset filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredExperts.map((expert, index) => (
                <motion.div
                  key={`expert-${expert.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                >
                  {/* Replicated Card Design - Horizontal Ticket Style with Left Accent */}
                  <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-row gap-0 h-full min-h-[170px] border-l-4 border-l-[#36013F]">

                    {/* Left Section: Avatar & Verified */}
                    <div className="w-[85px] sm:w-[100px] flex flex-col items-center pt-5 pb-3 px-2 bg-gray-50/50 border-r border-gray-100 shrink-0">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 mb-2">
                        <Image
                          src={expert.photo || "/default.jpg"}
                          alt={expert.fullName || "Expert"}
                          fill
                          className="rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm" title="Verified">
                          <CheckCircle className="text-blue-500 w-4 h-4" />
                        </div>
                      </div>

                      <div className="text-center mt-auto">
                        <span className="block text-sm font-bold text-[#36013F] leading-none">
                          {expert.profileType === 'agency' ? getYears(expert.yearsActive) : calculateTotalExperience(expert.experience)}
                        </span>
                        <span className="text-[9px] text-gray-400 uppercase font-semibold tracking-wider">Years Exp</span>
                      </div>
                    </div>

                    {/* Right Section: Content */}
                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-gray-900 leading-tight truncate group-hover:text-[#36013F] transition-colors">
                              {expert.fullName || "Travel Specialist"}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${expert.profileType === 'agency' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                {expert.profileType === 'agency' ? 'Agency' : 'Expert'}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
                                <MapPin className="text-gray-400 w-3 h-3 shrink-0" />
                                <span className="truncate max-w-[100px]">{expert.location || "Global"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tagline */}
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                          {truncateTagline(expert.tagline || expert.about || "Verified Travel Specialist")}
                        </p>

                        {/* Expertise Pills */}
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {(expert.expertise || []).slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md border border-gray-200 truncate max-w-[100px]">
                              {tag}
                            </span>
                          ))}
                          {(expert.expertise || []).length > 2 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-gray-400 font-medium">+{(expert.expertise || []).length - 2}</span>
                          )}
                        </div>
                      </div>

                      {/* Footer: Price & Action Buttons */}
                      <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex items-end justify-between gap-2 relative">
                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide">Consultation</p>
                          <div className="flex items-center text-sm font-bold text-[#36013F]">
                            ₹{formatPricing(expert.pricing)}
                          </div>
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setViewingProfileExpert(expert)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-[#36013F] transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>

                          <button
                            onClick={() => handleAskClick(expert)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#36013F] to-[#5a1066] rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-1"
                          >
                            Ask Query
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Full Expert Profile Modal inside Dashboard */}
      {viewingProfileExpert && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto relative shadow-2xl border border-gray-200">
            <div className="sticky top-0 right-0 z-50 flex justify-end p-4 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none">
              <button
                onClick={() => setViewingProfileExpert(null)}
                className="pointer-events-auto bg-[#36013F] text-white p-2.5 rounded-full shadow-xl hover:bg-purple-900 transition-all flex items-center gap-1 text-xs font-bold"
              >
                <X className="w-5 h-5" /> Close
              </button>
            </div>
            <div className="-mt-12 pt-2">
              <Profile2u0
                profile={viewingProfileExpert}
                sortedExperience={viewingProfileExpert.experience || []}
                hideNavbar={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Service Drawer for Booking */}
      {selectedExpert && selectedService && (
        <ProfileServiceDrawer
          isOpen={true}
          onClose={() => {
            setSelectedExpert(null);
            setSelectedService(null);
          }}
          serviceType={selectedService}
          expertData={{
            id: selectedExpert.id,
            fullName: selectedExpert.fullName,
            email: selectedExpert.email,
            phone: selectedExpert.phone,
          }}
        />
      )}

      {/* Add-On Modal for Micro Services */}
      {selectedExpert && selectedAddOn && (
        <ProfileAddOnModal
          isOpen={true}
          onClose={() => {
            setSelectedExpert(null);
            setSelectedAddOn(null);
          }}
          addOnType={selectedAddOn}
          expertData={{
            id: selectedExpert.id,
            fullName: selectedExpert.fullName,
            email: selectedExpert.email,
            phone: selectedExpert.phone,
          }}
        />
      )}
    </div>
  );
}

