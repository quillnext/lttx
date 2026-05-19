"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShieldCheck, MapPin, Globe, Clock, MessageCircle, BadgeCheck,
  Calendar, Quote, Plane, Zap,
  HelpCircle, Shield, ArrowRight, ChevronDown, ChevronUp, Sparkles, Navigation,
  Briefcase, CheckCircle, Crown, PhoneCall,
  Map as MapIcon, Share2, Star, User, History, Dna, Menu, MessageSquare, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FooterComponent from "@/app/pages/Footer";
import ProfileServiceDrawer from "./ProfileServiceDrawer";
import ProfileAddOnModal from "./ProfileAddOnModal";
import ProfileTrustSection from "./ProfileTrustSection";

// Safe component wrapper to prevent "Element type is invalid" if an import fails
const Footer = FooterComponent || (() => null);

// Helper to safely render icons from the lucide library
const SafeIcon = ({ icon: Icon, ...props }) => {
  if (!Icon) return null;
  try {
    return <Icon {...props} />;
  } catch (e) {
    return null;
  }
};

// --- ABSTRACT DESIGN TOKENS ---
const TOKENS = {
  brandPlum: "#36013F",
  brandGold: "#FDC700",
  linkedinGray: "#F3F2EF",
  surface: "#FFFFFF",
  textMain: "#000000e6",
  textMuted: "#666666",
  border: "rgba(140, 140, 140, 0.2)"
};

const CustomStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
    body {
      font-family: 'Outfit', sans-serif;
      background-color: ${TOKENS.linkedinGray};
      color: ${TOKENS.textMain};
      -webkit-font-smoothing: antialiased;
    }
    .font-heading { font-family: 'DM Serif Display', serif; }
    .abstract-header {
      background-color: ${TOKENS.brandPlum};
      background-image: radial-gradient(circle at 2px 2px, rgba(253, 199, 0, 0.15) 1px, transparent 0);
      background-size: 24px 24px;
    }
    .card-border { border: 1px solid ${TOKENS.border}; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `}</style>
);

export default function Profile2u0({ profile, sortedExperience, onBookService }) {
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeAaq, setActiveAaq] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllExperience, setShowAllExperience] = useState(false);
  const [showAllAAQs, setShowAllAAQs] = useState(false);
  const [showAllFAQs, setShowAllFAQs] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [activeAddOn, setActiveAddOn] = useState(null);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  if (!profile) return null;

  // FIXED GLOBAL SERVICES (Admin Controlled)
  const FIXED_SERVICES = [
    { title: "1:1 STRATEGIC CONSULTATION", price: "₹799", icon: MessageCircle, desc: "Speak directly with this expert for personalised trip guidance, decision support, and route or planning clarity. Best for travellers who want real-time direction before making bookings.", cta: "Book Consultation", hero: true },
    { title: "ASK A QUESTION", price: "₹299", icon: HelpCircle, desc: "Ask one specific travel question and get a direct expert answer. Best for quick clarifications before you spend more time or money on planning.", cta: "Ask a Question", hero: false },
    { title: "THE MASTER PLAN", price: "₹1099", icon: MapIcon, desc: "A deeper planning service for travellers who want a well-thought-out trip structure, not just a quick answer. Best when you want expert-backed direction across route, stays, pace, and travel decisions.", cta: "Select Plan", hero: false },
    { title: "CUSTOM LUXE PACKAGE", price: "Quote Based", icon: Briefcase, desc: "For travellers who want a high-touch, customised travel experience. Share the basics and the expert team will reach out to shape a tailored package.", cta: "Get Quote", hero: false }
  ];

  // FIXED GLOBAL ADD-ONS (Admin Controlled)
  const FIXED_ADDONS = [
    { title: "Itinerary Review", price: "₹199", icon: CheckCircle, expectation: "Already have a rough itinerary from Google, AI, an agent, or your own research? Get it reviewed for pace, logic, and practicality before you lock it in." },
    { title: "Hotel/Area Check", price: "₹149", icon: Globe, expectation: "Know the hotel name but unsure about the area? Get a quick expert view on whether the location suits your trip, convenience, and travel style." },
    { title: "Flight Choice", price: "₹149", icon: Zap, expectation: "Confused between flight options? Get expert help on what makes the most sense based on timing, routing, convenience, baggage, and hidden trade-offs." },
    { title: "Packing Checklist", price: "₹99", icon: Sparkles, expectation: "Get a practical destination-based packing checklist built around weather, trip type, and season. Useful when you want to avoid overpacking or missing essentials." }
  ];

  const recommendations = profile.recommendations || [];
  const journey = profile.professionalJourney || sortedExperience || [];

  const navItems = [
    { id: "services", icon: Briefcase, label: "Services", visible: true },
    { id: "add-ons", icon: Zap, label: "Add-ons", visible: true },
    { id: "reviews", icon: Star, label: "Reviews", visible: recommendations.length > 0 },
    { id: "about", icon: User, label: "About", visible: !!(profile.bio || profile.about) },
    { id: "experience", icon: History, label: "Journey", visible: journey.length > 0 },
    { id: "dna", icon: Dna, label: "DNA", visible: !!profile.experienceDNA },
    { id: "aaqs", icon: MessageSquare, label: "Intelligence Feed", visible: profile.aaqs && profile.aaqs.length > 0 },
    { id: "faqs", icon: HelpCircle, label: "Expert Intelligence", visible: profile.faqs && profile.faqs.length > 0 },
    { id: "policies", icon: Shield, label: "Policies", visible: true },
  ].filter(item => item.visible);

  return (
    <div className="min-h-screen">
      <CustomStyles />

      {/* REFINED FLOATING ICON HEADER - CLONED FROM DEMO */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[95%] max-w-[1400px] pointer-events-none">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#36013F]/95 backdrop-blur-2xl border border-white/10 rounded-full py-2.5 px-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between gap-4 pointer-events-auto"
        >
          <div className="flex items-center gap-3 pr-4 border-r border-white/10 shrink-0">
            <img src="/logolttx.svg" alt="Xmytravel" className="w-[150px] h-auto object-contain" />
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="group flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              >
                <SafeIcon icon={item.icon} size={18} className="text-white group-hover:text-[#FDC700] transition-colors" />
                <span className="hidden xl:inline text-[9px] font-black text-white/70 group-hover:text-white uppercase tracking-widest transition-colors">
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex md:hidden flex-1 items-center justify-between gap-4">
            <button
              onClick={() => scrollToSection('services')}
              className="flex-1 bg-[#FDC700] text-[#36013F] text-[10px] font-black py-3 rounded-full uppercase tracking-widest active:scale-95 transition-all shadow-lg text-center"
            >
              Book Now
            </button>
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`w-11 h-11 flex items-center justify-center rounded-full transition-all ${isMenuOpen ? 'bg-white/20 text-[#FDC700]' : 'bg-white/10 text-white'}`}
              >
                <Menu size={20} />
              </button>
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-[#36013F] backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] p-2 z-[1001]"
                  >
                    <div className="grid grid-cols-1 gap-1">
                      {navItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            scrollToSection(item.id);
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-white/10 rounded-xl transition-all text-left"
                        >
                          <SafeIcon icon={item.icon} size={18} className="text-[#FDC700]" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden md:block pl-4 border-l border-white/10 shrink-0">
            <button
              onClick={() => scrollToSection('services')}
              className="bg-[#FDC700] text-[#36013F] text-[10px] font-black px-7 py-3 rounded-full uppercase tracking-widest hover:bg-white transition-all shadow-[0_10px_20px_rgba(253,199,0,0.2)] whitespace-nowrap"
            >
              Book Consult
            </button>
          </div>
        </motion.div>
      </div>

      <main className="max-w-[1500px] mt-28 mx-auto px-4 md:px-8 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* --- SIDEBAR --- */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 text-left">
            <div className="bg-white rounded-xl overflow-hidden card-border shadow-sm">
              <div className="h-32 abstract-header relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#36013F] to-transparent opacity-50"></div>
              </div>

              <div className="px-5 pb-6">
                <div className="relative -mt-16 mb-4 flex justify-between items-end">
                  <div className="p-1 bg-white rounded-full inline-block shadow-lg">
                    <Image src={profile.photo || "/default.jpg"}
                      width={128} height={128}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white"
                      alt={profile.fullName} />
                    {profile.isOnline && (
                      <div className="absolute bottom-2 left-26 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-sm animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <span className="bg-[#36013F] text-[#FDC700] text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1.5 border border-[#FDC700]/30 shadow-inner">
                      <SafeIcon icon={ShieldCheck} size={10} /> Verified Elite
                    </span>
                    <span className="bg-[#f0faf5] text-[#58d197] text-[8px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-[#e0f5eb] italic">
                      AVAILABLE THIS WEEK
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h1 className="text-3xl font-bold flex items-center gap-2 tracking-tight">
                    {profile.fullName}
                    <SafeIcon icon={BadgeCheck} size={20} className="text-blue-500 fill-blue-500/10" />
                  </h1>
                  <p className="text-lg font-bold text-[#36013F] leading-tight">{profile.tagline || 'Travel Expert'}</p>
                  <p className="text-sm font-medium text-gray-700">{profile.role || 'XmyTravel Expert'}</p>
                  <p className="text-[14px] text-gray-500 mt-2 font-medium leading-relaxed">{profile.bio || profile.about?.substring(0, 120)}</p>
                  <p className="text-[12px] text-gray-500 mt-2 flex items-center gap-1 font-medium"><SafeIcon icon={MapPin} size={12} /> {profile.location || 'Global'}</p>
                </div>

                {/* AUTHORITY BADGES */}
                <div className="mt-6 grid grid-cols-4 gap-3">
                  {(() => {
                    const journey = profile.professionalJourney || [];
                    let yearsExp = "0+";
                    if (journey.length > 0) {
                      try {
                        const years = journey.map(j => {
                          const yearMatch = j.period?.match(/\d{4}/);
                          return yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
                        });
                        const oldestYear = Math.min(...years);
                        const currentYear = new Date().getFullYear();
                        const diff = currentYear - oldestYear;
                        yearsExp = diff > 0 ? `${diff}+ Yrs` : "1+ Yrs";
                      } catch (e) {
                        yearsExp = "9+ Yrs";
                      }
                    }

                    const badges = [
                      { label: "Response Time", val: profile.responseTime || "2h", icon: Clock },
                      { label: "Verified", val: profile.isVerified ? "Elite" : "Elite", icon: ShieldCheck },
                      { label: "AAQ Replies", val: `${profile.aaqs?.length || 0}+`, icon: MessageSquare },
                      { label: "Experience", val: profile.experienceYears ? `${profile.experienceYears}+ Yrs` : yearsExp, icon: Briefcase }
                    ];

                    return badges.map((s, i) => (
                      <div key={i} className="bg-gray-50/50 border border-gray-100 rounded-xl p-3 flex flex-col items-center text-center transition-all hover:border-[#FDC700]/30 hover:shadow-sm">
                        <SafeIcon icon={s.icon} size={16} className="text-[#36013F] mb-1.5 opacity-60" />
                        <p className="font-black text-[10px] text-[#36013F] uppercase tracking-tighter leading-none mb-1">{s.val}</p>
                        <p className="text-[7px] text-gray-400 font-black uppercase tracking-widest leading-none h-4 flex items-center">{s.label}</p>
                      </div>
                    ));
                  })()}
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mt-4">
                    <span>Next Slot</span>
                    <span className="text-[#36013F] font-bold">{profile.nextSlot || "Check Availability"}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: "75%" }} transition={{ duration: 1.5 }} className="h-full bg-[#FDC700]" />
                  </div>
                  <p className="text-[9px] text-gray-400 italic text-right font-medium">Scarcity: {profile.scarcityCount || 8} consultations completed this month</p>
                </div>
              </div>
            </div>

            {profile.whyConsult && profile.whyConsult.length > 0 && (
              <div className="bg-white rounded-xl p-6 card-border shadow-sm">
                <h3 className="font-heading text-xl text-[#36013F] mb-4">Why consult {profile.fullName.split(' ')[0]}</h3>
                <ul className="space-y-3">
                  {profile.whyConsult.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[13px] text-gray-600 font-semibold leading-snug">
                      <SafeIcon icon={Sparkles} size={14} className="text-[#FDC700] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* --- MAIN PORTION --- */}
          <div className="lg:col-span-8 space-y-6">

            {/* FEATURED SERVICES */}
            <section id="services" className="bg-white rounded-xl p-8 lg:p-10 card-border shadow-sm scroll-mt-32">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-bold">Priority Services</h2>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full">
                  <SafeIcon icon={Clock} size={12} className="text-green-500" /> Response: {profile.responseTime || "2 hours"}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {FIXED_SERVICES.map((s, i) => (
                  <div key={i} className={`p-8 rounded-3xl border transition-all duration-500 group relative ${s.hero ? 'bg-gray-50/50 border-[#36013F] text-[#36013F] shadow-2xl scale-[1.02]' : 'bg-gray-50/50 border-gray-100 hover:bg-white hover:shadow-xl hover:border-[#FDC700]/30'}`}>
                    {s.hero && <div className="absolute top-0 right-0 w-32 h-32 bg-[#FDC700]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>}
                    {s.hero && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FDC700] text-[#36013F] text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-[#FDC700]/20">Highly Recommended</div>}

                    <div className="flex justify-between items-start mb-8">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${s.hero ? 'bg-white border border-gray-100 text-[#36013F]' : 'bg-white border border-gray-100 text-[#36013F]'}`}>
                        <SafeIcon icon={s.icon} size={24} />
                      </div>
                      <div className="text-right">
                        <span className={`font-heading text-2xl lg:text-3xl tracking-tight ${s.hero ? 'text-[#36013F]' : 'text-[#36013F]'}`}>{s.price}</span>
                      </div>
                    </div>

                    <h4 className={`font-black text-[15px] uppercase tracking-tight mb-2 ${s.hero ? 'text-[#36013F]' : 'text-[#36013F]'}`}>{s.title}</h4>
                    <p className={`text-[11px] mb-8 leading-relaxed italic font-medium ${s.hero ? 'text-[#36013F]/70' : 'text-gray-500'}`}>{s.desc}</p>

                    <button
                      onClick={() => setActiveService(s.title)}
                      className={`font-black text-[10px] uppercase tracking-widest border-b-2 pb-1 transition-all ${s.hero ? 'text-[#36013F] border-[#36013F] hover:text-[#FDC700] hover:border-[#FDC700]' : 'text-[#36013F] border-[#36013F] hover:text-[#FDC700] hover:border-[#FDC700]'}`}
                    >
                      {s.cta || "Book Consultation"}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* ADD-ONS */}
            <section id="add-ons" className="bg-white rounded-xl p-8 lg:p-10 card-border shadow-sm scroll-mt-32 text-left">
              <h2 className="text-xl font-bold mb-8 capitalize tracking-tight text-[#36013F]">Consultation Add-ons</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {FIXED_ADDONS.map((m, i) => (
                  <div key={i} className="p-6 rounded-2xl text-center bg-gray-50/50 border border-gray-100 hover:border-[#36013F] hover:bg-white hover:shadow-lg transition-all duration-300 flex flex-col items-center">
                    <div className="flex justify-center mb-3">
                      <SafeIcon icon={m.icon} size={18} className="text-[#36013F] opacity-40 transition" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-[#36013F]">{m.title}</p>
                    {m.expectation && (
                      <p className="text-[10px] text-gray-500 leading-relaxed font-medium mb-4">{m.expectation}</p>
                    )}
                    <p className="font-heading text-2xl text-[#36013F] mt-auto">{m.price}</p>
                    <button onClick={() => setActiveAddOn(m.title)} className="mt-4 w-full py-2 rounded-lg bg-white border text-[9px] font-black uppercase tracking-widest text-[#36013F] hover:bg-[#36013F] hover:text-white transition shadow-sm font-bold">
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* REVIEWS */}
            {recommendations.length > 0 && (
              <section id="reviews" className="bg-white rounded-xl p-8 lg:p-10 card-border shadow-sm scroll-mt-32 text-left">
                <h2 className="text-xl font-bold mb-8 capitalize tracking-tight text-[#36013F]">Traveler Reviews</h2>
                <div className="space-y-8">
                  {(showAllReviews ? recommendations : recommendations.slice(0, 5)).map((rec, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-gray-50/50 border border-gray-100">
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-sm">
                        <img src={rec.photo} alt={rec.author} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                          <div>
                            <h4 className="text-[15px] font-bold text-black flex items-center gap-2">
                              {rec.author}
                              <SafeIcon icon={BadgeCheck} size={14} className="text-blue-500 fill-blue-500/10" />
                            </h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mt-0.5">{rec.type} • {rec.location}</p>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(rec.rating)].map((_, i) => <SafeIcon key={i} icon={Star} size={12} className="fill-[#FDC700] text-[#FDC700]" />)}
                          </div>
                        </div>
                        <div className="text-[15px] text-gray-600 leading-relaxed font-normal border-l-4 border-[#FDC700] pl-6 italic quote-box">
                          "{rec.text}"
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {recommendations.length > 5 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="mt-8 px-6 py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:border-[#36013F] hover:text-[#36013F] transition-all flex items-center justify-center gap-2"
                  >
                    {showAllReviews ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> View All {recommendations.length} Reviews</>}
                  </button>
                )}
              </section>
            )}

            {/* ABOUT */}
            {(profile.bio || profile.about) && (
              <section id="about" className="bg-white rounded-xl p-8 lg:p-10 card-border shadow-sm scroll-mt-32 text-left">
                <h2 className="text-xl font-bold mb-8">About</h2>
                <div className="space-y-6">
                  <p className="text-[15px] text-gray-600 leading-relaxed font-light">
                    {profile.about || profile.bio}
                  </p>
                </div>
              </section>
            )}

            {/* EXPERIENCE */}
            {journey.length > 0 && (
              <section id="experience" className="bg-white rounded-xl p-8 lg:p-10 card-border shadow-sm scroll-mt-32 text-left">
                <h2 className="text-xl font-bold mb-8">Professional Journey</h2>
                <div className="space-y-8">
                  {(showAllExperience ? journey : journey.slice(0, 5)).map((exp, i) => (
                    <div key={i} className="relative pl-8 border-l-2 border-gray-100 last:border-0 pb-0">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#36013F] shadow-sm"></div>
                      <div className="flex justify-between items-start mb-1 gap-4">
                        <h4 className="text-[14px] font-black uppercase tracking-tight text-[#36013F]">{exp.title}</h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">{exp.period}</span>
                      </div>
                      <p className="text-[11px] font-bold text-gray-700 mb-2">{exp.company}</p>
                      <p className="text-[13px] text-gray-500 leading-relaxed font-normal bg-gray-50/30 p-4 rounded-2xl">{exp.desc}</p>
                    </div>
                  ))}
                </div>

                {journey.length > 5 && (
                  <button
                    onClick={() => setShowAllExperience(!showAllExperience)}
                    className="mt-8 px-6 py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:border-[#36013F] hover:text-[#36013F] transition-all flex items-center justify-center gap-2"
                  >
                    {showAllExperience ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> View Extended Journey</>}
                  </button>
                )}
              </section>
            )}

            {/* DNA */}
            {profile.experienceDNA && (
              <section id="dna" className="bg-white rounded-xl p-8 lg:p-10 card-border shadow-sm scroll-mt-32 text-left">
                <h2 className="text-xl font-bold mb-8 text-[#36013F]">Experience DNA</h2>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-10">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Core Regional Portfolios</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.experienceDNA.destinations?.map(dest => (
                        <span key={dest} className="px-5 py-2.5 bg-gray-50 text-[11px] font-bold text-[#36013F] rounded-full border border-gray-100 hover:border-[#FDC700] transition shadow-sm">
                          {dest}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Signature Curation Themes</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.experienceDNA.themes?.map(theme => (
                        <span key={theme} className="px-5 py-2.5 bg-white text-[11px] font-bold text-gray-700 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-2">
                          <SafeIcon icon={Crown} size={12} className="text-[#FDC700]" /> {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* AAQ FEED */}
            {profile.aaqs && profile.aaqs.length > 0 && (
              <section id="aaqs" className="bg-white rounded-xl p-8 lg:p-10 card-border shadow-sm scroll-mt-32 text-left">
                <h2 className="text-xl font-bold mb-8">Ask Anything (AAQ)</h2>
                <div className="space-y-4">
                  {(showAllAAQs ? profile.aaqs : profile.aaqs.slice(0, 5)).map((aaq, idx) => (
                    <div key={idx} className="bg-gray-50/50 border border-gray-50 rounded-2xl p-6 hover:bg-white transition-all group">
                      <button
                        onClick={() => setActiveAaq(activeAaq === idx ? null : idx)}
                        className="w-full flex justify-between items-center text-left"
                      >
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{aaq.timestamp}</p>
                          <span className="text-[15px] font-bold text-gray-800 capitalize tracking-tight">{aaq.question}</span>
                        </div>
                        <SafeIcon icon={ChevronDown} size={14} className={`transition-transform duration-300 ${activeAaq === idx ? 'rotate-180 text-[#36013F]' : 'text-gray-300 group-hover:text-gray-400'}`} />
                      </button>
                      <AnimatePresence>
                        {activeAaq === idx && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="pt-6 mt-6 border-t border-gray-100 flex gap-4">
                              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-md">
                                <Image src={profile.photo || "/default.jpg"} width={48} height={48} className="object-cover" alt="Expert" />
                              </div>
                              <div className="bg-white p-4 rounded-r-2xl rounded-bl-2xl shadow-sm border border-gray-50 flex-1">
                                <p className="text-[14px] text-gray-500 font-medium leading-relaxed italic">
                                  "{aaq.answer || aaq.reply || "A specialized reply has been provided to the traveler."}"
                                </p>
                                <div className="flex items-center gap-1.5 mt-2">
                                  <SafeIcon icon={Sparkles} size={10} className="text-[#FDC700]" />
                                  <span className="text-[9px] font-black text-[#36013F] uppercase tracking-widest">Expert Advisory</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
                {profile.aaqs.length > 5 && (
                  <button
                    onClick={() => setShowAllAAQs(!showAllAAQs)}
                    className="mt-8 px-6 py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:border-[#36013F] hover:text-[#36013F] transition-all flex items-center justify-center gap-2"
                  >
                    {showAllAAQs ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> View All {profile.aaqs.length} AAQs</>}
                  </button>
                )}
              </section>
            )}

            {/* FAQS */}
            {profile.faqs && profile.faqs.length > 0 && (
              <section id="faqs" className="bg-white rounded-xl p-8 lg:p-10 card-border shadow-sm scroll-mt-32 text-left">
                <h2 className="text-xl font-bold mb-8">Expert Intelligence</h2>
                <div className="space-y-4">
                  {(showAllFAQs ? profile.faqs : profile.faqs.slice(0, 5)).map((faq, idx) => (
                    <div key={idx} className="border-b last:border-0 pb-4 pt-1">
                      <button
                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        className="w-full flex justify-between items-center text-left py-2"
                      >
                        <span className="text-[15px] font-bold text-gray-800">{faq.question}</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${activeFaq === idx ? 'bg-[#36013F] text-white rotate-180' : 'bg-gray-50 text-gray-400'}`}>
                          <SafeIcon icon={ChevronDown} size={14} />
                        </div>
                      </button>
                      <AnimatePresence>
                        {activeFaq === idx && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <p className="text-[13px] text-gray-500 font-medium pt-4 leading-relaxed border-l-2 border-gray-50 pl-4">{faq.answer}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* TRUST SECTION */}
            <ProfileTrustSection />
          </div>
        </div>
        <Footer />
        <ProfileServiceDrawer 
          isOpen={!!activeService} 
          onClose={() => setActiveService(null)} 
          serviceType={activeService} 
          expertData={{ id: profile.id, fullName: profile.fullName, email: profile.email }} 
        />
        <ProfileAddOnModal isOpen={!!activeAddOn} onClose={() => setActiveAddOn(null)} addOnType={activeAddOn} />
      </main>
    </div>
  );
}
