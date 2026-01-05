"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc
} from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { app } from "@/lib/firebase";
import { 
  Trash2, 
  Filter, 
  Globe, 
  Lock,
  Search,
  UserCheck,
  Send,
  ShieldCheck,
  Calendar,
  Fingerprint,
  Mail,
  X,
  Phone,
  Briefcase,
  MapPin,
  ExternalLink,
  Edit3,
  Award,
  FileText,
  Building2,
  Users,
  BadgeCheck,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Info,
  Loader,
  PlusCircle,
  UserPlus,
  Key
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CreateProfileModal from "./CreateProfileModal";
import HandoverModal from "./HandoverModal";

const db = getFirestore(app);
const storage = getStorage(app);

export default function ProfilesTab() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedProfiles, setSelectedProfiles] = useState(new Set());
  
  const [detailModal, setDetailModal] = useState(null); 
  const [actionLoading, setActionLoading] = useState({});
  const router = useRouter();

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [handoverProfile, setHandoverProfile] = useState(null);

  // Prompt Logic States
  const [promptModal, setPromptModal] = useState(false);
  const [promptQuestion, setPromptQuestion] = useState("");
  const [promptAnswer, setPromptAnswer] = useState("");
  const [promptError, setPromptError] = useState(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [sendToAll, setSendToAll] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "Profiles"), (snapshot) => {
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        let displayDate = 'N/A';
        
        // Robust date parsing to avoid "toDate is not a function" error
        try {
          if (data.timestamp) {
            const ts = data.timestamp;
            if (ts && typeof ts.toDate === 'function') {
              displayDate = ts.toDate().toLocaleDateString('en-GB');
            } else if (ts && typeof ts.seconds === 'number') {
              displayDate = new Date(ts.seconds * 1000).toLocaleDateString('en-GB');
            } else if (ts instanceof Date) {
              displayDate = ts.toLocaleDateString('en-GB');
            } else {
              const parsedDate = new Date(ts);
              if (!isNaN(parsedDate.getTime())) {
                displayDate = parsedDate.toLocaleDateString('en-GB');
              }
            }
          }
        } catch (e) {
          console.warn("Date parsing failed for doc:", doc.id, e);
          displayDate = 'Invalid Date';
        }

        return {
          id: doc.id,
          ...data,
          displayDate
        };
      });
      
      list.sort((a, b) => {
          const timeA = a.timestamp?.seconds || (a.timestamp ? new Date(a.timestamp).getTime() / 1000 : 0);
          const timeB = b.timestamp?.seconds || (b.timestamp ? new Date(b.timestamp).getTime() / 1000 : 0);
          return timeB - timeA;
      });

      setProfiles(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      const matchesSearch = p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || p.profileType === filterType;
      return matchesSearch && matchesType;
    });
  }, [profiles, searchTerm, filterType]);

  const handleToggleSelect = (id) => {
    const newSelected = new Set(selectedProfiles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProfiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProfiles.size === filteredProfiles.length) {
      setSelectedProfiles(new Set());
    } else {
      setSelectedProfiles(new Set(filteredProfiles.map(p => p.id)));
    }
  };

  const handleTogglePublic = async (id, currentStatus) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      await updateDoc(doc(db, "Profiles", id), { isPublic: !currentStatus });
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handlePurge = async (p) => {
    if (!window.confirm(`CRITICAL: This will wipe ${p.fullName} from Auth, DB, and Storage. Proceed?`)) return;
    
    setActionLoading(prev => ({ ...prev, [`del-${p.id}`]: true }));
    try {
      const res = await fetch("/api/admin/purge-expert", {
        method: "POST",
        body: JSON.stringify({ uid: p.id, secret: process.env.NEXT_PUBLIC_ADMIN_PASS }),
      });
      const result = await res.json();
      if (res.ok) {
        const paths = result.storagePaths;
        const deleteSafe = async (url) => {
            if (!url || typeof url !== 'string' || !url.includes('firebase')) return;
            try { await deleteObject(ref(storage, url)); } catch(e) {}
        };
        await deleteSafe(paths.photo);
        if (Array.isArray(paths.certificates)) for (const c of paths.certificates) await deleteSafe(c);
        if (Array.isArray(paths.officePhotos)) for (const o of paths.officePhotos) await deleteSafe(o);
        alert("Purge Successful.");
      } else alert(result.error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`del-${p.id}`]: false }));
    }
  };

  const handleSendPrompt = async () => {
    if (!promptQuestion.trim() || !promptAnswer.trim()) {
      setPromptError("Question and answer are required.");
      return;
    }

    const targets = sendToAll ? profiles : profiles.filter(p => selectedProfiles.has(p.id));
    if (targets.length === 0) {
      setPromptError("No profiles selected.");
      return;
    }

    setPromptLoading(true);
    setPromptError(null);
    try {
      for (const profile of targets) {
        await addDoc(collection(db, "Questions"), {
          expertId: profile.id,
          expertName: profile.fullName || "Unknown",
          expertEmail: profile.email || "",
          question: promptQuestion,
          userName: "Admin",
          userEmail: "admin@xmytravel.com",
          userPhone: "",
          status: "admin_prompt",
          isAdminPrompt: true,
          suggestedAnswer: promptAnswer,
          isPublic: false,
          createdAt: new Date().toISOString(),
          reply: null,
        });

        if (profile.email && profile.email.trim()) {
          await fetch("/api/send-admin-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              expertEmail: profile.email,
              expertName: profile.fullName || "Unknown",
              question: promptQuestion,
              suggestedAnswer: promptAnswer,
              profileType: profile.profileType || "expert",
            }),
          });
        }
      }

      setPromptModal(false);
      setPromptQuestion("");
      setPromptAnswer("");
      setSendToAll(false);
      setSelectedProfiles(new Set());
      alert("Prompts sent successfully!");
    } catch (error) {
      console.error("Error sending prompts:", error.message);
      setPromptError(error.message);
    } finally {
      setPromptLoading(false);
    }
  };

  const safeMap = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string' && data.trim()) return data.split(',').map(s => s.trim());
    return [];
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-[#36013F]">INITIALIZING REGISTRY...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#36013F]">All Profiles</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Platform management for {profiles.length} entities.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#F4D35E] text-[#36013F] px-5 py-2.5 rounded-2xl font-black text-sm hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-100"
          >
            <UserPlus size={18} /> New Expert
          </button>

          <button 
            onClick={() => setPromptModal(true)}
            disabled={!sendToAll && selectedProfiles.size === 0}
            className="flex items-center gap-2 bg-[#36013F] text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-[#4a0152] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/10"
          >
            <Send size={16} /> Send Prompt
          </button>

          <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm flex-1 lg:flex-none">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full lg:w-48"
              placeholder="Registry search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-sm">
            <Filter size={16} className="text-gray-400 mr-2" />
            <select 
              className="bg-transparent border-none text-sm font-bold focus:ring-0 p-0 pr-8 cursor-pointer"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="all">Role: All</option>
              <option value="expert">Experts</option>
              <option value="agency">Agencies</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
                <th className="px-6 py-5 w-12">
                   <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#36013F] focus:ring-[#36013F]"
                    checked={selectedProfiles.size === filteredProfiles.length && filteredProfiles.length > 0}
                    onChange={handleSelectAll}
                   />
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Creation Date</th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Name & Role</th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Email</th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Location</th>
                <th className="px-6 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Visibility</th>
                <th className="px-6 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProfiles.map((p) => {
                const isPlaceholder = !p.email && !p.phone;
                return (
                  <tr key={p.id} className="group hover:bg-purple-50/30 transition-all duration-200">
                    <td className="px-6 py-4">
                       <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-[#36013F] focus:ring-[#36013F]"
                          checked={selectedProfiles.has(p.id)}
                          onChange={() => handleToggleSelect(p.id)}
                       />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-gray-600">{p.displayDate}</p>
                    </td>
                   
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border-2 border-white shadow-sm shrink-0">
                          <Image src={p.photo || "/default.jpg"} alt="" width={40} height={40} className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate text-sm">{p.fullName}</p>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${p.profileType === 'agency' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {p.profileType}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isPlaceholder ? (
                        <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100 uppercase tracking-tighter">Placeholder</span>
                      ) : (
                        <p className="text-xs font-medium text-gray-500 truncate max-w-[150px]">{p.email}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-gray-700 truncate">{p.location || "Global"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleTogglePublic(p.id, p.isPublic)} 
                        disabled={actionLoading[p.id]} 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${p.isPublic ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                      >
                        {p.isPublic ? <Globe size={12} /> : <Lock size={12} />} 
                        {actionLoading[p.id] ? "..." : (p.isPublic ? "PUBLIC" : "PRIVATE")}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        {isPlaceholder && (
                          <button 
                            onClick={() => setHandoverProfile(p)}
                            className="p-2 hover:bg-[#36013F] hover:text-white text-[#36013F] rounded-xl transition-all"
                            title="Handover Profile (Assign User)"
                          >
                            <Key size={16} />
                          </button>
                        )}
                        <button onClick={() => setDetailModal(p)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl" title="Registration Form Preview"><FileText size={16} /></button>
                        <button onClick={() => router.push(`/dashboard/profiles/edit/${p.id}`)} className="p-2 hover:bg-yellow-50 text-yellow-700 rounded-xl" title="Modify Registry"><Edit3 size={16} /></button>
                        <button onClick={() => router.push(p.profileType === 'agency' ? `/agency/${p.username}` : `/experts/${p.username}`)} className="p-2 hover:bg-green-50 text-green-600 rounded-xl" title="Live Profile"><ExternalLink size={16} /></button>
                        <button onClick={() => handlePurge(p)} className="p-2 hover:bg-red-50 text-red-600 rounded-xl" title="Permanent Purge"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PROFILE MODAL */}
      {isCreateModalOpen && (
        <CreateProfileModal 
          onClose={() => setIsCreateModalOpen(false)} 
        />
      )}

      {/* HANDOVER MODAL */}
      {handoverProfile && (
        <HandoverModal 
          profile={handoverProfile} 
          onClose={() => setHandoverProfile(null)} 
        />
      )}

      {/* SEND PROMPT MODAL */}
      {promptModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setPromptModal(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-[#36013F] mb-6">
              Send Engagement Prompt
            </h2>
            <div className="space-y-6">
               <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Question Context</label>
                 <textarea 
                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#36013F] outline-none"
                    rows={3}
                    placeholder="E.g. What is the best time to visit Bali for a honeymoon?"
                    value={promptQuestion}
                    onChange={e => setPromptQuestion(e.target.value)}
                 />
               </div>
               <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Suggested Answer</label>
                 <textarea 
                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-4 text-sm font-medium focus:ring-2 focus:ring-[#36013F] outline-none"
                    rows={5}
                    placeholder="Provide a high-quality baseline answer..."
                    value={promptAnswer}
                    onChange={e => setPromptAnswer(e.target.value)}
                 />
               </div>

               <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <input 
                    type="checkbox" 
                    id="all-experts"
                    checked={sendToAll}
                    onChange={e => setSendToAll(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-600"
                  />
                  <label htmlFor="all-experts" className="text-sm font-black text-purple-900 uppercase tracking-tight">Broadcasting to All Experts</label>
               </div>

               {promptError && <p className="text-xs font-bold text-red-500">{promptError}</p>}

               <div className="flex gap-4">
                  <button onClick={() => setPromptModal(false)} className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition">Cancel</button>
                  <button 
                    onClick={handleSendPrompt} 
                    disabled={promptLoading}
                    className="flex-1 py-4 rounded-2xl bg-[#36013F] text-white font-black hover:bg-[#4a0152] transition shadow-xl shadow-purple-900/10 flex items-center justify-center gap-2"
                  >
                    {promptLoading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                    {promptLoading ? "Sending..." : `Push to ${sendToAll ? "All" : selectedProfiles.size} Selection`}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MASTER FORM PREVIEW MODAL */}
      {detailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setDetailModal(null)} />
          <div className="relative bg-white w-full max-w-6xl max-h-[95vh] rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-[32px] overflow-hidden shadow-2xl border-4 border-white shrink-0">
                  <Image src={detailModal.photo || "/default.jpg"} alt="" width={96} height={96} className="object-cover" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 leading-none mb-2">{detailModal.fullName}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">ID: {detailModal.generatedReferralCode}</span>
                    <span className="text-xs font-black bg-gray-200 text-gray-600 uppercase tracking-widest px-3 py-1 rounded-lg">{detailModal.profileType} ROLE</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setDetailModal(null)} className="p-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm"><X size={24} /></button>
            </div>

            {/* Modal Body */}
            <div className="p-10 overflow-y-auto max-h-[calc(95vh-160px)] custom-scrollbar space-y-16">
               
               {/* SECTION 1: IDENTITY */}
               <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#36013F] text-white flex items-center justify-center font-black text-xs">01</div>
                    <h3 className="text-xl font-black text-[#36013F] tracking-tight">Core Registry Identity</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-8">
                     <PreviewField label="Official Name" value={detailModal.fullName} icon={<UserCheck size={14}/>} />
                     <PreviewField label="Username" value={`@${detailModal.username}`} icon={<Fingerprint size={14}/>} />
                     <PreviewField label="Email Address" value={detailModal.email} icon={<Mail size={14}/>} />
                     <PreviewField label="Phone Number" value={detailModal.phone} icon={<Phone size={14}/>} />
                     <PreviewField label="Location" value={detailModal.location} icon={<MapPin size={14}/>} />
                     <PreviewField label="Date of Birth" value={detailModal.dateOfBirth} icon={<Calendar size={14}/>} />
                     <PreviewField label="Languages" value={safeMap(detailModal.languages).join(", ")} icon={<Globe size={14}/>} />
                     <PreviewField label="Registry Date" value={detailModal.displayDate} icon={<ShieldCheck size={14}/>} />
                  </div>
               </section>

               {/* SECTION 2: PERFORMANCE & EXPERTISE */}
               <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#36013F] text-white flex items-center justify-center font-black text-xs">02</div>
                    <h3 className="text-xl font-black text-[#36013F] tracking-tight">Professional Scope & Commercials</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                     <div className="space-y-8">
                        <PreviewField label="Consultation Pricing" value={detailModal.pricing} icon={<Award size={14}/>} />
                        <PreviewField label="Target Response Time" value={detailModal.responseTime} icon={<Clock size={14}/>} />
                     </div>
                     <div className="lg:col-span-2 space-y-8">
                        <div>
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3">Professional Tagline</label>
                           <p className="text-base font-bold text-gray-800 italic leading-relaxed">"{detailModal.tagline}"</p>
                        </div>
                        <div>
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3">Expertise Specialties</label>
                           <div className="flex flex-wrap gap-2">
                              {safeMap(detailModal.expertise).map(tag => (
                                <span key={tag} className="text-[10px] font-black bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl uppercase border border-gray-200">{tag}</span>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </section>

               {/* SECTION 3: NARRATIVE & HISTORY */}
               <section className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#36013F] text-white flex items-center justify-center font-black text-xs">03</div>
                    <h3 className="text-xl font-black text-[#36013F] tracking-tight">Narrative & Documentation</h3>
                  </div>
                  <div className="space-y-10">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">Detailed Bio / Profile Narrative</label>
                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-inner">
                           <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{detailModal.about}</p>
                        </div>
                    </div>

                    {detailModal.profileType === 'expert' ? (
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">Work History Timeline</label>
                             <div className="space-y-4">
                                {safeMap(detailModal.experience).map((exp, idx) => (
                                  <div key={idx} className="flex gap-5 p-5 border border-gray-100 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                     <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm"><Briefcase size={24}/></div>
                                     <div>
                                        <p className="text-sm font-black text-gray-900">{exp.title}</p>
                                        <p className="text-xs font-bold text-gray-500 mt-1">{exp.company} • {exp.startDate} to {exp.endDate}</p>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                          <div>
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">Certifications & Awards</label>
                             <div className="flex flex-wrap gap-2">
                                {safeMap(detailModal.certifications).map(tag => (
                                  <span key={tag} className="flex items-center gap-2 text-[10px] font-black bg-green-50 text-green-700 px-4 py-2 rounded-xl uppercase border border-green-100 shadow-sm">
                                    <CheckCircle2 size={12}/> {tag}
                                  </span>
                                ))}
                             </div>
                          </div>
                       </div>
                    ) : (
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10">
                          <PreviewField label="Registered HQ Address" value={detailModal.registeredAddress} icon={<Building2 size={14}/>} />
                          <PreviewField label="Licence Number / GST" value={detailModal.licenseNumber} icon={<FileText size={14}/>} />
                          <PreviewField label="Official Website" value={detailModal.website} icon={<ExternalLink size={14}/>} />
                          <PreviewField label="Team / Employee Count" value={detailModal.employeeCount} icon={<Users size={14}/>} />
                       </div>
                    )}
                  </div>
               </section>

               {/* SECTION 4: MEDIA & REFERRALS */}
               <section className="space-y-8 pb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#36013F] text-white flex items-center justify-center font-black text-xs">04</div>
                    <h3 className="text-xl font-black text-[#36013F] tracking-tight">Media & Registry Context</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                     <div className="space-y-8">
                        <div>
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">Referral Origin</label>
                           <div className="flex items-center gap-10">
                              <PreviewField label="Referred?" value={detailModal.referred} icon={<Users size={14}/>} />
                              <PreviewField label="Referrer Code Used" value={detailModal.referralCode} icon={<Fingerprint size={14}/>} />
                           </div>
                        </div>
                        {detailModal.profileType === 'agency' && (
                           <div>
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">Association Certificates</label>
                              <div className="flex flex-wrap gap-3">
                                 {safeMap(detailModal.certificates).map((url, idx) => (
                                   <a key={idx} href={url} target="_blank" className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-[#36013F] transition-colors overflow-hidden group">
                                      <FileText className="text-gray-400 group-hover:text-[#36013F]" />
                                   </a>
                                 ))}
                              </div>
                           </div>
                        )}
                     </div>
                     
                     {detailModal.profileType === 'agency' && (
                        <div>
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">Office & Establishment Photos</label>
                           <div className="grid grid-cols-3 gap-4">
                              {safeMap(detailModal.officePhotos).map((url, idx) => (
                                <div key={idx} className="aspect-square bg-gray-100 rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                                   <Image src={url} alt="" width={150} height={150} className="w-full h-full object-cover" />
                                </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewField({ label, value, icon }) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</label>
       <div className="flex items-center gap-3 text-gray-900">
          <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-purple-600 shrink-0">{icon}</div>
          <p className="text-sm font-black break-words">{value || "Not Provided"}</p>
       </div>
    </div>
  );
}
