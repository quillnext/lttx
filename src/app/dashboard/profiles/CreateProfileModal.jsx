"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  X, 
  Sparkles, 
  Loader2, 
  FileText, 
  User, 
  Building, 
  Camera, 
  Briefcase,
  Award,
  Globe,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  CircleDollarSign,
  MapPin,
  Fingerprint,
  MessageSquare,
  ShieldCheck,
  Calendar
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";

const storage = getStorage(app);

// Helper for dynamic imports
const loadComponent = (importFn, name) =>
  dynamic(
    () =>
      importFn()
        .then((mod) => mod.default || mod)
        .catch((err) => {
          console.error(`Failed to load ${name}:`, err);
          return { default: () => <div className="text-red-500">Error loading {name}.</div> };
        }),
    { ssr: false, loading: () => <div className="h-10 w-full bg-gray-100 animate-pulse rounded-xl" /> }
  );

const Select = loadComponent(() => import("react-select"), "Select");
const CreatableSelect = loadComponent(() => import("react-select/creatable"), "CreatableSelect");
const DatePicker = loadComponent(() => import("react-datepicker"), "DatePicker");
const Cropper = loadComponent(() => import('react-easy-crop'), "Cropper");

import getCroppedImg from '../../complete-profile/getCroppedImg';

const expertiseOptionsList = [
  { value: 'Visa and Documentation Services', label: 'Visa and Documentation Services' },
  { value: 'Air/Flight Ticketing and Management', label: 'Air/Flight Ticketing and Management' },
  { value: 'Transfer and Car Rentals', label: 'Transfer and Car Rentals' },
  { value: 'Holiday Packages', label: 'Holiday Packages' },
  { value: 'Hotel Bookings', label: 'Hotel Bookings' },
  { value: 'MICE Logistics Arrangements', label: 'MICE Logistics Arrangements' },
  { value: 'FRRO Assistance', label: 'FRRO Assistance' },
  { value: 'Luxury Cruise Trip Planning', label: 'Luxury Cruise Trip Planning' },
];

const certOptionsList = [
  { value: 'IATA Certified', label: 'IATA Certified' },
  { value: 'TAAI Member', label: 'TAAI Member' },
  { value: 'OTOAI Member', label: 'OTOAI Member' },
  { value: 'Verified Travel Expert', label: 'Verified Travel Expert' },
];

export default function CreateProfileModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [profileType, setProfileType] = useState('expert');

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    tagline: '',
    location: '',
    languages: [],
    pricing: '₹799/session',
    responseTime: 'in 20 mins',
    about: '',
    expertise: [],
    experience: [{ title: '', company: '', startDate: null, endDate: null }],
    certifications: [],
    registeredAddress: '',
    website: '',
    employeeCount: '',
    licenseNumber: '',
    photo: null,
    isPublic: true,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const [cityOptions, setCityOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);

  useEffect(() => {
    fetch('/api/cities').then(res => res.json()).then(data => setCityOptions(data.slice(0, 50)));
    fetch('/api/languages').then(res => res.json()).then(setLanguageOptions);
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setParsing(true);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body: fd });
      const result = await res.json();
      if (res.ok) {
        const d = result.data;
        const parsedExp = d.experience?.map(exp => ({
            title: exp.title || '',
            company: exp.company || '',
            startDate: exp.startDate ? new Date(exp.startDate) : null,
            endDate: exp.endDate === 'Present' ? 'Present' : (exp.endDate ? new Date(exp.endDate) : null)
        })) || formData.experience;

        setFormData(prev => ({
          ...prev,
          fullName: d.fullName || prev.fullName,
          tagline: d.tagline || prev.tagline,
          about: d.about || prev.about,
          location: d.location || prev.location,
          username: d.username || prev.username,
          languages: d.languages || prev.languages,
          expertise: d.expertise || prev.expertise,
          experience: parsedExp,
          registeredAddress: d.registeredAddress || prev.registeredAddress,
          website: d.website || prev.website,
          employeeCount: d.employeeCount || prev.employeeCount,
          licenseNumber: d.licenseNumber || prev.licenseNumber
        }));

        if (d.location && !cityOptions.some(o => o.value === d.location)) {
            setCityOptions(prev => [{ value: d.location, label: d.location }, ...prev]);
        }
      }
    } finally {
      setParsing(false);
    }
  };

  const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), []);
  
  const handleCropConfirm = async () => {
    try {
      if (!imagePreview || !croppedAreaPixels) return;
      const croppedImageFile = await getCroppedImg(imagePreview, croppedAreaPixels, 'profile.jpg');
      setFormData(prev => ({ ...prev, photo: croppedImageFile }));
      setImagePreview(URL.createObjectURL(croppedImageFile));
      setShowCropModal(false);
    } catch (e) {
      console.error("Crop error:", e);
    }
  };

  const handleFile = (e, field) => {
    const file = e.target.files[0];
    if (field === 'photo' && file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setShowCropModal(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...formData.experience];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, experience: updated }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.username) {
        alert("Name and Username are required.");
        return;
    }
    
    setLoading(true);
    try {
      let photoURL = "";
      
      // Upload identity photo if provided
      if (formData.photo && formData.photo instanceof File) {
        const timestamp = Date.now();
        const fileName = `admin_created_${formData.fullName.replace(/\s+/g, '_')}_${timestamp}.jpg`;
        const storageRef = ref(storage, `Profiles/${fileName}`);
        await uploadBytes(storageRef, formData.photo);
        photoURL = await getDownloadURL(storageRef);
      }

      const formatDateForPayload = (date) => {
          if (!date || date === 'Present') return date;
          return date instanceof Date ? date.toISOString().slice(0, 7) : date;
      };

      const payload = {
        ...formData,
        profileType,
        photo: photoURL || formData.photo,
        experience: profileType === 'expert' ? formData.experience.map(exp => ({
            ...exp,
            startDate: formatDateForPayload(exp.startDate),
            endDate: exp.endDate === 'Present' ? 'Present' : formatDateForPayload(exp.endDate)
        })) : []
      };

      const res = await fetch("/api/admin/create-placeholder-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
          onClose();
      } else {
          const err = await res.json();
          alert(`Creation failed: ${err.error}`);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Network failure during registry sync.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-md" onClick={onClose} />
      
      {showCropModal && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] p-8 max-w-xl w-full shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black mb-6 text-[#36013F]">Master Identity Portrait</h3>
            <div className="relative w-full h-[300px] bg-gray-100 rounded-3xl overflow-hidden mb-6 border-2 border-dashed border-gray-200">
              <Cropper image={imagePreview} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} cropShape="round" />
            </div>
            <div className="space-y-6">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Adjust Zoom</label>
                    <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="w-full accent-[#36013F]" />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowCropModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition">Cancel</button>
                  <button onClick={handleCropConfirm} className="flex-1 py-4 bg-[#36013F] text-white rounded-2xl font-bold shadow-xl shadow-purple-900/10">Lock Portrait</button>
                </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative bg-white w-full max-w-6xl h-[92vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        <div className="px-10 py-6 bg-gray-50 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#36013F] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200"><Plus /></div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">New User Registration</h2>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">New Internal Profile</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
              <div className="flex bg-gray-200 p-1 rounded-2xl">
                  <button onClick={() => setProfileType('expert')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] flex items-center gap-2 transition-all ${profileType === 'expert' ? "bg-white shadow-md text-[#36013F]" : "text-gray-500"}`}><User size={14}/> EXPERT</button>
                  <button onClick={() => setProfileType('agency')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] flex items-center gap-2 transition-all ${profileType === 'agency' ? "bg-white shadow-md text-[#36013F]" : "text-gray-500"}`}><Building size={14}/> AGENCY</button>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-900"><X size={24}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
           <div className="max-w-5xl mx-auto space-y-16">
              <div className="bg-[#36013F]/5 p-6 rounded-[32px] border border-[#36013F]/10 flex items-center justify-between gap-6 shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#36013F] shadow-sm border border-purple-100"><Sparkles size={24}/></div>
                    <div className="space-y-0.5">
                        <h4 className="text-sm font-black text-[#36013F] uppercase tracking-tight">Automated Registry Prefill</h4>
                        <p className="text-[10px] text-[#36013F]/60 font-bold italic uppercase tracking-wider">Fast-track by parsing an existing expert resume</p>
                    </div>
                  </div>
                  <label className="cursor-pointer bg-[#36013F] text-white px-8 py-3.5 rounded-2xl font-black text-[11px] shadow-2xl shadow-purple-900/20 hover:scale-105 transition-all flex items-center gap-2 uppercase tracking-widest">
                    {parsing ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                    {parsing ? "Parsing..." : "Analyze Document"}
                    <input type="file" className="hidden" onChange={handleResumeUpload} disabled={parsing} />
                  </label>
              </div>

              <section className="space-y-10">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
                     <div className="w-8 h-8 rounded-full bg-[#36013F] text-white flex items-center justify-center text-xs font-black">01</div>
                     <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Base Identity</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                      <div className="lg:col-span-1">
                          <div className="relative w-full aspect-square max-w-[200px] mx-auto rounded-[48px] overflow-hidden bg-gray-50 border-4 border-white shadow-2xl group cursor-pointer ring-1 ring-gray-100">
                              <Image src={imagePreview || "/default.jpg"} alt="" fill className="object-cover" />
                              <label htmlFor="admin-photo-input" className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                  <Camera className="text-white mb-2" size={32} />
                                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Update Portrait</span>
                              </label>
                              <input id="admin-photo-input" type="file" className="hidden" onChange={e => handleFile(e, 'photo')} accept="image/*" />
                          </div>
                      </div>

                      <div className="lg:col-span-3 grid grid-cols-2 gap-8">
                          <div className="space-y-2 col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Registry Name</label>
                            <input name="fullName" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#36013F] transition-all" value={formData.fullName} onChange={handleChange} placeholder="Full Name" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unique Profile Username</label>
                            <input name="username" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#36013F] transition-all" value={formData.username} onChange={handleChange} placeholder="e.g. travel_expert_one" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Operational Base</label>
                            <Select 
                                instanceId="admin-location-select"
                                options={cityOptions} 
                                value={cityOptions.find(o => o.value === formData.location)} 
                                onChange={o => setFormData(prev => ({ ...prev, location: o?.value }))} 
                                styles={selectStyles}
                                onInputChange={val => {
                                    if (val) fetch(`/api/cities?search=${encodeURIComponent(val)}`).then(res => res.json()).then(setCityOptions);
                                }}
                                placeholder="Search Cities..." 
                            />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Spoken Languages</label>
                            <Select isMulti instanceId="admin-lang-select" options={languageOptions} value={languageOptions.filter(o => formData.languages.includes(o.value))} onChange={o => setFormData(prev => ({ ...prev, languages: o.map(x => x.value) }))} styles={selectStyles} placeholder="Select languages..." />
                          </div>
                      </div>
                  </div>
              </section>

              <section className="space-y-10">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
                     <div className="w-8 h-8 rounded-full bg-[#36013F] text-white flex items-center justify-center text-xs font-black">02</div>
                     <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Professional Scope</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">One-Line Tagline (Professional Headline)</label>
                            <input name="tagline" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#36013F] transition-all" value={formData.tagline} onChange={handleChange} placeholder="Expert headline (Max 150 chars)" maxLength={150} />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pricing / Rate (₹)</label>
                                <input name="pricing" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#36013F] transition-all" value={formData.pricing} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Response Time</label>
                                <input name="responseTime" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#36013F] transition-all" value={formData.responseTime} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Specialisation Domain Tags</label>
                            <CreatableSelect isMulti instanceId="admin-expertise-select" options={expertiseOptionsList} value={formData.expertise.map(e => ({ value: e, label: e }))} onChange={o => setFormData(prev => ({ ...prev, expertise: o.map(x => x.value) }))} styles={selectStyles} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Detailed Profile Narrative (Biography)</label>
                        <textarea name="about" className="w-full bg-gray-50 border-none rounded-[32px] px-8 py-7 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#36013F] h-full min-h-[220px] leading-relaxed transition-all" value={formData.about} onChange={handleChange} placeholder="Explain the professional background and areas of mastery..." />
                      </div>
                  </div>
              </section>

              <section className="space-y-10 pb-16">
                <div className="flex items-center justify-between border-b border-gray-100 pb-5">
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-[#36013F] text-white flex items-center justify-center text-xs font-black">03</div>
                         <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">{profileType === 'expert' ? 'Work History & Timeline' : 'Business Registry Credentials'}</h3>
                    </div>
                    {profileType === 'expert' && (
                        <button onClick={() => setFormData(prev => ({ ...prev, experience: [...prev.experience, { title: '', company: '', startDate: null, endDate: null }] }))} className="text-[10px] font-black text-[#36013F] bg-[#F4D35E] px-5 py-2 rounded-full hover:scale-105 transition-all uppercase tracking-widest">+ Add Record</button>
                    )}
                </div>

                {profileType === 'expert' ? (
                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {formData.experience.map((exp, idx) => (
                          <div key={idx} className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 shadow-sm relative group transition-all hover:bg-gray-100/50">
                            <button onClick={() => setFormData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== idx) }))} className="absolute -top-3 -right-3 w-10 h-10 bg-white text-red-500 rounded-2xl flex items-center justify-center shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={20}/></button>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Position</label>
                                        <input className="bg-white w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-800" placeholder="e.g. Senior Consultant" value={exp.title} onChange={e => handleExperienceChange(idx, 'title', e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Organization</label>
                                        <input className="bg-white w-full px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-800" placeholder="e.g. Global Travel Co." value={exp.company} onChange={e => handleExperienceChange(idx, 'company', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
                                        <DatePicker selected={exp.startDate} onChange={d => handleExperienceChange(idx, 'startDate', d)} placeholderText="YYYY-MM" className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold w-full text-gray-800" dateFormat="yyyy-MM" showMonthYearPicker />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">End Date</label>
                                        <DatePicker selected={exp.endDate === 'Present' ? null : exp.endDate} onChange={d => handleExperienceChange(idx, 'endDate', d)} placeholderText="YYYY-MM" className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-xs font-bold w-full text-gray-800" dateFormat="yyyy-MM" showMonthYearPicker disabled={exp.endDate === 'Present'} />
                                    </div>
                                </div>
                                <button type="button" onClick={() => handleExperienceChange(idx, 'endDate', exp.endDate === 'Present' ? null : 'Present')} className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${exp.endDate === 'Present' ? "bg-[#36013F] text-white" : "bg-gray-200 text-gray-500 hover:bg-gray-300"}`}>{exp.endDate === 'Present' ? 'STILL ACTIVE (CURRENT)' : 'MARK AS CURRENTLY ACTIVE'}</button>
                            </div>
                          </div>
                        ))}
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Verified Registry Certifications</label>
                        <CreatableSelect isMulti instanceId="admin-certs-select" options={certOptionsList} value={formData.certifications.map(c => ({ value: c, label: c }))} onChange={o => setFormData(prev => ({ ...prev, certifications: o.map(x => x.value) }))} styles={selectStyles} />
                     </div>
                  </div >
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-2 col-span-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Legal Headquarters Address</label>
                        <input name="registeredAddress" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#36013F] shadow-sm" value={formData.registeredAddress} onChange={handleChange} placeholder="Physical Office Address" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Official Web Address</label>
                        <input name="website" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#36013F] shadow-sm" value={formData.website} onChange={handleChange} placeholder="https://agency.com" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Licensing (IATA/GST Reference)</label>
                        <input name="licenseNumber" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#36013F] shadow-sm" value={formData.licenseNumber} onChange={handleChange} placeholder="Registration Code" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Employee Strength</label>
                        <input name="employeeCount" type="number" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#36013F] shadow-sm" value={formData.employeeCount} onChange={handleChange} placeholder="Total Team Count" />
                     </div>
                  </div>
                )}
              </section>
           </div>
        </div>

        <div className="px-10 py-8 bg-gray-50 border-t flex justify-between items-center shrink-0">
           <button onClick={onClose} className="px-8 py-4 text-gray-400 font-black text-[11px] uppercase tracking-widest hover:text-red-500 transition-colors">Discord</button>
           <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="flex items-center gap-5 bg-[#36013F] text-white px-20 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#4a0152] transition-all shadow-2xl shadow-purple-900/30 disabled:opacity-50 active:scale-95"
           >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
              {loading ? "Submitting..." : "Submit"}
           </button>
        </div>
      </div>
    </div>
  );
}

const selectStyles = {
  control: (b) => ({ 
      ...b, 
      borderRadius: '1.25rem', 
      border: 'none', 
      background: '#F9FAFB', 
      minHeight: '3.5rem', 
      fontWeight: '800', 
      fontSize: '0.875rem',
      paddingLeft: '0.75rem',
      boxShadow: 'none'
  }),
  multiValue: (b) => ({ ...b, borderRadius: '0.5rem', background: '#36013F15', border: '1px solid #36013F10' }),
  multiValueLabel: (b) => ({ ...b, color: '#36013F', fontWeight: '900', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }),
  placeholder: (b) => ({ ...b, color: '#9CA3AF', fontWeight: '600' }),
  menu: (b) => ({ ...b, borderRadius: '1.25rem', border: '1px solid #F3F4F6', overflow: 'hidden' })
};
