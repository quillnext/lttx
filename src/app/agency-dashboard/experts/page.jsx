"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Search, Compass, MapPin, CheckCircle, ArrowRight, X, Sparkles, ExternalLink } from "lucide-react";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";
import { fetchPublicExperts } from "@/lib/ask-an-expert/client";


const ProfileServiceDrawer = dynamic(() => import("@/app/components/ProfileServiceDrawer"), {
  ssr: false,
});

const SERVICES_INFO = [
  {
    key: "1:1 STRATEGIC CONSULTATION",
    name: "1:1 Strategic Consultation",
    price: "₹799",
    desc: "30-min live direct travel guidance call with the expert."
  },
  {
    key: "ASK A QUESTION",
    name: "Ask a travel question",
    price: "₹299",
    desc: "Get an expert-written answer to one travel question."
  },
  {
    key: "THE MASTER PLAN",
    name: "Start your Master Plan",
    price: "₹1099",
    desc: "Complete planning recommendations for multi-day trips."
  },
  {
    key: "CUSTOM LUXE PACKAGE",
    name: "Request a custom luxe package",
    price: "Quote Based",
    desc: "Bespoke, private, premium travel planning by the expert."
  }
];

export default function AgencyBrowseExperts() {
  const [experts, setExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadExperts = async () => {
      setLoading(true);
      try {
        const result = await fetchPublicExperts({ from: 0, to: 100 });
        const list = result.experts || [];
        
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
    const term = searchTerm.toLowerCase();
    const result = experts.filter((e) => {
      return (
        (e.fullName || "").toLowerCase().includes(term) ||
        (e.location || "").toLowerCase().includes(term) ||
        (e.expertise || []).some((tag) => tag.toLowerCase().includes(term))
      );
    });
    setFilteredExperts(result);
  }, [searchTerm, experts]);

  const handleOpenServiceDrawer = (expert, serviceKey) => {
    setSelectedExpert(expert);
    setSelectedService(serviceKey);
  };

  const getYears = (yearsStr) => {
    if (!yearsStr || typeof yearsStr !== "string") return "0+";
    const match = yearsStr.match(/\d+\+?/);
    return match ? match[0] : "0+";
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Compass className="w-8 h-8 text-[#36013F]" />
            <div>
              <h1 className="text-3xl font-bold text-[#36013F]">Browse Experts</h1>
              <p className="text-sm text-gray-500 mt-1">Connect with verified travel specialists and book their services directly.</p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search experts, locations, expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#36013F] bg-white transition-all shadow-sm"
            />
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
            <p className="text-gray-500 mt-1">Try refining your search keyword.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredExperts.map((expert) => (
              <div key={expert.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#36013F]"></div>
                
                {/* Left Profile Summary */}
                <div className="flex flex-col items-center md:items-start shrink-0 text-center md:text-left">
                  <div className="relative w-20 h-20 mb-3">
                    <Image
                      src={expert.photo || "/default.jpg"}
                      alt={expert.fullName || "Expert"}
                      fill
                      className="rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow" title="Verified">
                      <CheckCircle className="text-blue-500 w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug hover:text-[#36013F] transition-colors flex items-center gap-1.5 justify-center md:justify-start">
                    {expert.fullName || "Travel Specialist"}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 justify-center md:justify-start">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{expert.location || "Global"}</span>
                  </div>
                  <span className="inline-block mt-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-yellow-50 text-yellow-800 border border-yellow-100">
                    {expert.profileType || "Expert"}
                  </span>
                </div>

                {/* Right Content & Booking Options */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-gray-500 italic line-clamp-3 leading-relaxed">
                      {expert.tagline || expert.about || "Verified Travel Expert on Xmytravel"}
                    </p>
                    
                    {/* Expertise list */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(expert.expertise || []).slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md border border-gray-150">
                          {tag}
                        </span>
                      ))}
                      {(expert.expertise || []).length > 3 && (
                        <span className="text-[10px] text-gray-400 font-semibold self-center">
                          +{(expert.expertise || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Services Row */}
                  <div className="mt-6 border-t border-dashed border-gray-150 pt-4">
                    <p className="text-xs font-bold text-[#36013F] mb-3 uppercase tracking-wider">Select a service to ask/book:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {SERVICES_INFO.map((svc) => (
                        <button
                          key={svc.key}
                          onClick={() => handleOpenServiceDrawer(expert, svc.key)}
                          className="flex flex-col items-start p-2.5 rounded-xl border border-gray-150 bg-gray-50/50 hover:bg-[#36013F] hover:text-white hover:border-[#36013F] transition-all text-left"
                        >
                          <span className="text-xs font-bold truncate w-full">{svc.name}</span>
                          <span className="text-[10px] font-semibold opacity-75 mt-0.5">{svc.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Service Drawer for Booking */}
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
    </div>
  );
}
