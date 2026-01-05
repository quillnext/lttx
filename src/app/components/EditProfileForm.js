'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import "react-phone-input-2/lib/style.css";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import _ from "lodash";
import getCroppedImg from '../complete-profile/getCroppedImg';
import { 
  ShieldCheck, 
  Edit3, 
  Loader2, 
  Trash2, 
  Plus, 
  Camera,
  CheckCircle,
  HelpCircle,
  Info,
  FileText,
  Sparkles,
  User,
  Building,
  ExternalLink,
  MapPin,
  Globe,
  Award,
  Clock,
  Briefcase
} from "lucide-react";

const db = getFirestore(app);

// Dynamically load components for consistency
const loadComponent = (importFn, name) =>
  dynamic(
    () =>
      importFn()
        .then((mod) => mod.default || mod)
        .catch((err) => {
          console.error(`Failed to load ${name}:`, err);
          return { default: () => <div className="text-red-500 text-center p-4">Error loading {name}.</div> };
        }),
    {
      ssr: false,
      loading: () => <div className="text-center p-4 animate-pulse text-gray-400 font-bold">Loading {name}...</div>,
    }
  );

const Select = loadComponent(() => import("react-select"), "Select");
const CreatableSelect = loadComponent(() => import("react-select/creatable"), "CreatableSelect");
const PhoneInput = loadComponent(() => import("react-phone-input-2"), "PhoneInput");
const DatePicker = loadComponent(() => import("react-datepicker"), "DatePicker");
const Cropper = loadComponent(() => import('react-easy-crop'), "Cropper");

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

export default function EditProfileForm({ initialData, onSave }) {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ ...initialData });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [cityOptions, setCityOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [usernameStatus, setUsernameStatus] = useState('');
  
  // Media States
  const [imagePreview, setImagePreview] = useState(initialData.photo || null);
  const [certificatePreviews, setCertificatePreviews] = useState(initialData.certificates || []);
  const [officePhotoPreviews, setOfficePhotoPreviews] = useState(initialData.officePhotos || []);
  
  // Cropper
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const router = useRouter();

  // Initialization & Location Prefill Logic
  useEffect(() => {
    // 1. Fetch Cities
    fetch('/api/cities').then(res => res.json()).then(data => {
        let options = [...data];
        // CRITICAL FIX: Ensure the current location is in the options list for pre-filling
        if (formData.location && !options.some(o => o.value === formData.location)) {
            options.unshift({ value: formData.location, label: formData.location });
        }
        setCityOptions(options.sort((a,b) => a.label.localeCompare(b.label)));
    }).catch(() => {});

    // 2. Fetch Languages
    fetch('/api/languages').then(res => res.json()).then(data => {
        let options = [...data];
        // Ensure existing languages are in options
        const existingLangs = Array.isArray(formData.languages) ? formData.languages : [];
        existingLangs.forEach(lang => {
            if (!options.some(o => o.value === lang)) {
                options.push({ value: lang, label: lang });
            }
        });
        setLanguageOptions(options);
    }).catch(() => {});
  }, [formData.location, formData.languages]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = useCallback(async () => {
    try {
      const croppedImageFile = await getCroppedImg(imagePreview, croppedAreaPixels, formData.photo?.name || 'profile.jpg');
      setFormData(prev => ({ ...prev, photo: croppedImageFile }));
      setImagePreview(URL.createObjectURL(croppedImageFile));
      setShowCropModal(false);
    } catch (error) {
        console.error("Crop error:", error);
    }
  }, [imagePreview, croppedAreaPixels, formData.photo]);

  const handlePhoneChange = (phone) => {
    setFormData((prev) => ({ ...prev, phone }));
    setErrors((prev) => ({ ...prev, phone: "" }));
    fetchLeadByPhone(phone);
  };

  const handleFile = (e, field) => {
    const files = Array.from(e.target.files);
    if (field === 'photo') {
      const file = files[0];
      if (file) {
        setFormData(prev => ({ ...prev, photo: file }));
        setImagePreview(URL.createObjectURL(file));
        setShowCropModal(true);
      }
    } else if (field === 'certificates') {
      setFormData(prev => ({ ...prev, certificates: [...prev.certificates, ...files] }));
      setCertificatePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    } else if (field === 'officePhotos') {
      setFormData(prev => ({ ...prev, officePhotos: [...prev.officePhotos, ...files] }));
      setOfficePhotoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    }
  };

  const removeFile = (index, field) => {
    if (field === 'certificates') {
      setFormData(prev => ({ ...prev, certificates: prev.certificates.filter((_, i) => i !== index) }));
      setCertificatePreviews(prev => prev.filter((_, i) => i !== index));
    } else if (field === 'officePhotos') {
      setFormData(prev => ({ ...prev, officePhotos: prev.officePhotos.filter((_, i) => i !== index) }));
      setOfficePhotoPreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const checkUsernameAvailability = async (username) => {
    if (!username || username === initialData.username) {
        setUsernameStatus('');
        return;
    }
    try {
      const profilesQuery = query(collection(db, 'Profiles'), where('username', '==', username));
      const querySnapshot = await getDocs(profilesQuery);
      if (!querySnapshot.empty) setUsernameStatus('Username is already taken');
      else setUsernameStatus('Username is available');
    } catch (error) { setUsernameStatus('Error checking username'); }
  };

  const handleUsernameChange = (e) => {
      const val = e.target.value;
      setFormData(prev => ({ ...prev, username: val }));
      checkUsernameAvailability(val);
  };

  const handleMultiChange = (opts, field) => {
    setFormData(prev => ({ ...prev, [field]: opts ? opts.map(o => o.value) : [] }));
  };

  const handleExperienceChange = (idx, field, value) => {
    const updated = [...formData.experience];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData(prev => ({ ...prev, experience: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { profileType } = formData;

  return (
    <div className="bg-white min-h-screen">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[40px] p-10 text-center max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
              <ShieldCheck size={48} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Registry Updated</h2>
            <p className="text-gray-500 text-sm mb-8">All master records have been synchronized successfully.</p>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 rounded-2xl bg-[#36013F] text-white font-bold transition-all shadow-xl shadow-purple-100">Done</button>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-[40px] p-8 max-w-2xl w-full shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Camera className="text-purple-600" size={24}/> Adjust Portrait
            </h3>
            <div className="relative w-full h-[350px] bg-gray-100 rounded-3xl overflow-hidden mb-8">
              <Cropper 
                image={imagePreview} 
                crop={crop} 
                zoom={zoom} 
                aspect={1} 
                onCropChange={setCrop} 
                onZoomChange={setZoom} 
                onCropComplete={onCropComplete} 
                cropShape="round" 
                showGrid={true} 
              />
            </div>
            <div className="space-y-6">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Zoom Precision</label>
                    <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="w-full accent-[#36013F]" />
                </div>
                <div className="flex gap-4">
                    <button type="button" className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition" onClick={() => setShowCropModal(false)}>Cancel</button>
                    <button type="button" className="flex-1 py-4 rounded-2xl bg-[#36013F] text-white font-bold hover:bg-[#4a0152] transition shadow-xl" onClick={handleCropConfirm}>Lock Identity Photo</button>
                </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 lg:p-14 space-y-20 max-w-7xl mx-auto">
        
        {/* Classification Header (Role Toggle Hidden) */}
        <section className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                {profileType === 'expert' ? <User className="text-[#36013F]"/> : <Building className="text-[#36013F]"/>}
                Entity Registry: <span className="text-[#36013F] uppercase">{profileType}</span>
              </h2>
              <p className="text-gray-500 text-sm font-medium">Modifying standard professional records for this {profileType}.</p>
           </div>
        </section>

        {/* SECTION 1: BASIC IDENTITY */}
        <section className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#36013F] text-white flex items-center justify-center font-black">1</div>
            <h2 className="text-2xl font-black text-gray-900">Registry Core Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Contact Phone <span className="text-red-500">*</span></label>
               <PhoneInput
                  country={"in"}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter phone number (e.g., +91 9876543210)"
                  inputProps={{
                    id: "phone",
                    className: `w-full p-3 border px-12 border-gray-300 rounded-xl bg-white focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.phone ? "border-red-500" : ""}`,
                    required: true,
                  }}
                />
                {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
              </div>
            <FormInput label={profileType === 'expert' ? "Official Full Name" : "Registered Agency Name"} name="fullName" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
            <FormInput label="Protected Email Address" value={formData.email} disabled />
            
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Official Base Location <span className="text-red-500">*</span></label>
              <Select 
                instanceId="location-registry-select"
                options={cityOptions} 
                value={cityOptions.find(o => o.value === formData.location)} 
                onChange={o => setFormData({...formData, location: o?.value || ""})} 
                onInputChange={val => {
                    if (val) fetch(`/api/cities?search=${encodeURIComponent(val)}`).then(res => res.json()).then(data => setCityOptions([...data].sort((a,b) => a.label.localeCompare(b.label))));
                }}
                styles={selectStyles} 
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Languages Spoken <span className="text-red-500">*</span></label>
              <Select isMulti instanceId="lang-registry-select" options={languageOptions} value={languageOptions.filter(o => formData.languages?.includes(o.value))} onChange={o => handleMultiChange(o, 'languages')} styles={selectStyles} />
            </div>

            {profileType === 'expert' && (
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Date of Birth</label>
                <DatePicker 
                  selected={formData.dateOfBirth} 
                  onChange={d => setFormData({...formData, dateOfBirth: d})} 
                  dateFormat="yyyy-MM-dd" 
                  maxDate={new Date()}
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={80}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#36013F] transition-all" 
                />
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: EXPERTISE & COMMERCIALS */}
        <section className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#36013F] text-white flex items-center justify-center font-black">2</div>
            <h2 className="text-2xl font-black text-gray-900">Commercial Specialisations</h2>
          </div>
          
          <div className="space-y-10">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Areas of Specialisation (Expertise Tags) <span className="text-red-500">*</span></label>
              <CreatableSelect isMulti instanceId="expertise-registry-select" options={expertiseOptionsList} value={formData.expertise?.map(e => ({ value: e, label: e }))} onChange={o => handleMultiChange(o, 'expertise')} styles={selectStyles} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-gray-50 rounded-[32px] border border-gray-100">
               <FormInput label="Public Pricing (₹)" name="pricing" value={formData.pricing} onChange={e => setFormData({...formData, pricing: e.target.value})} border="white" required />
               <FormInput label="Est. Response Window" name="responseTime" value={formData.responseTime} onChange={e => setFormData({...formData, responseTime: e.target.value})} border="white" required />
               <div className="space-y-2">
                    <FormInput label="Platform Username" name="username" value={formData.username} onChange={handleUsernameChange} border="white" required />
                    {usernameStatus && <p className={`text-[10px] font-black uppercase tracking-widest ${usernameStatus.includes('available') ? 'text-green-600' : 'text-red-600'}`}>{usernameStatus}</p>}
               </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: PROFESSIONAL DETAILS & MEDIA */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#36013F] text-white flex items-center justify-center font-black">3</div>
            <h2 className="text-2xl font-black text-gray-900">Professional Assets & Experience</h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 border-b border-gray-100 pb-12">
            <div className="shrink-0 flex flex-col items-center">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block">Identity Image <span className="text-red-500">*</span></label>
              <div className="relative w-40 h-40">
                  <div className="w-full h-full rounded-[48px] overflow-hidden border-4 border-white shadow-2xl bg-gray-50 group">
                    <Image src={imagePreview || "/default.jpg"} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 cursor-pointer text-[#36013F] hover:scale-110 transition-transform">
                    <Edit3 size={20} />
                    <input type="file" className="hidden" onChange={e => handleFile(e, 'photo')} accept="image/*" />
                  </label>
              </div>
              {imagePreview && (
                <button type="button" onClick={() => setShowCropModal(true)} className="text-[10px] font-black uppercase text-blue-600 mt-4 hover:underline">Crop/Adjust Portrait</button>
              )}
            </div>

            <div className="flex-1 space-y-8">
              <FormInput label="Professional Registry Tagline" name="tagline" value={formData.tagline} maxLength={150} onChange={e => setFormData({...formData, tagline: e.target.value})} required />
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Public Profile Biography <span className="text-red-500">*</span></label>
                <textarea value={formData.about} onChange={e => setFormData({...formData, about: e.target.value})} rows={5} className="w-full bg-gray-50 border border-gray-100 rounded-[32px] p-6 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-[#36013F] transition-all leading-relaxed" required />
              </div>
            </div>
          </div>

          {profileType === 'expert' ? (
            <div className="space-y-10">
               <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <Briefcase size={20} className="text-gray-400"/> Work History Timeline
                  </h3>
                  <button type="button" onClick={() => setFormData({...formData, experience: [...formData.experience, {title: "", company: "", startDate: null, endDate: null}]})} className="flex items-center gap-2 text-xs font-black text-blue-600 hover:scale-105 transition-all"><Plus size={14}/> Add Entry</button>
               </div>
               <div className="space-y-6">
                  {formData.experience.map((exp, idx) => (
                    <div key={idx} className="p-8 bg-gray-50 rounded-[32px] grid grid-cols-1 md:grid-cols-4 gap-6 relative group border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <button type="button" onClick={() => setFormData({...formData, experience: formData.experience.filter((_, i) => i !== idx)})} className="absolute -top-3 -right-3 w-10 h-10 bg-white text-red-500 rounded-2xl flex items-center justify-center shadow-lg border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                        <FormInput label="Title" value={exp.title} onChange={e => handleExperienceChange(idx, 'title', e.target.value)} border="white" required />
                        <FormInput label="Company" value={exp.company} onChange={e => handleExperienceChange(idx, 'company', e.target.value)} border="white" required />
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Start Date</label>
                            <DatePicker 
                                selected={exp.startDate ? new Date(exp.startDate) : null} 
                                onChange={d => handleExperienceChange(idx, 'startDate', d)} 
                                dateFormat="yyyy-MM" 
                                showMonthYearPicker 
                                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800" 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">End Date</label>
                            <div className="flex items-center gap-2">
                                <DatePicker 
                                    disabled={exp.endDate === 'Present'} 
                                    selected={exp.endDate && exp.endDate !== 'Present' ? new Date(exp.endDate) : null} 
                                    onChange={d => handleExperienceChange(idx, 'endDate', d)} 
                                    dateFormat="yyyy-MM" 
                                    showMonthYearPicker 
                                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 disabled:opacity-50" 
                                />
                                <button type="button" onClick={() => handleExperienceChange(idx, 'endDate', exp.endDate === 'Present' ? null : 'Present')} className={`px-2 py-2.5 rounded-xl text-[10px] font-black border transition-all ${exp.endDate === 'Present' ? 'bg-[#36013F] text-white border-[#36013F]' : 'bg-white text-gray-400 border-gray-200'}`}>PRESENT</button>
                            </div>
                        </div>
                    </div>
                  ))}
               </div>
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Verified Certifications (Tags) <span className="text-red-500">*</span></label>
                  <CreatableSelect isMulti instanceId="cert-registry-select" options={certOptionsList} value={formData.certifications?.map(c => ({ value: c, label: c }))} onChange={o => handleMultiChange(o, 'certifications')} styles={selectStyles} />
               </div>
            </div>
          ) : (
            <div className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 bg-gray-50 p-8 rounded-[40px] border border-gray-100">
                  <div className="md:col-span-2"><FormInput label="Registered Address" value={formData.registeredAddress} onChange={e => setFormData({...formData, registeredAddress: e.target.value})} border="white" required /></div>
                  <FormInput label="Official Website" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} border="white" />
                  <FormInput label="License (IATA/GST)" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} border="white" required />
                  <FormInput label="Years Active" value={formData.yearsActive} onChange={e => setFormData({...formData, yearsActive: e.target.value})} border="white" />
                  <FormInput label="Team Size" type="number" value={formData.employeeCount} onChange={e => setFormData({...formData, employeeCount: e.target.value})} border="white" required />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <MediaUploadSection title="Association Certificates" items={certificatePreviews} field="certificates" handleFile={handleFile} removeFile={removeFile} />
                  <MediaUploadSection title="Office Photos" items={officePhotoPreviews} field="officePhotos" handleFile={handleFile} removeFile={removeFile} />
               </div>
            </div>
          )}
        </section>

        {/* SECTION 4: REFERRALS */}
        <section className="bg-purple-50 p-10 rounded-[40px] border border-purple-100 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-purple-600 shadow-xl shadow-purple-200/50 border border-purple-100">
                    <CheckCircle size={40}/>
                </div>
                <div>
                   <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-1">Self Referral ID</p>
                   <p className="text-2xl font-black text-purple-900 font-mono tracking-tight">{formData.generatedReferralCode || "N/A"}</p>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                <div className="text-center sm:text-right">
                    <p className="text-sm font-bold text-purple-800 leading-tight">Were you referred?</p>
                    <p className="text-[10px] text-purple-500 font-medium mt-0.5">Enter code if applicable</p>
                </div>
                <input 
                    type="text" 
                    name="referralCode" 
                    value={formData.referralCode} 
                    onChange={e => setFormData({...formData, referralCode: e.target.value})} 
                    className="bg-white border-2 border-purple-100 rounded-2xl px-6 py-4 text-sm font-black text-[#36013F] w-full sm:w-48 shadow-lg shadow-purple-900/5 focus:ring-2 focus:ring-[#36013F] outline-none transition-all placeholder:text-purple-200" 
                    placeholder="ENTER CODE" 
                />
            </div>
        </section>

        {/* SUBMIT ACTIONS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-gray-100">
            <button type="button" onClick={() => router.back()} className="text-sm font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest">Discard Platform Changes</button>
            <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-20 py-5 rounded-2xl bg-gradient-to-r from-[#36013F] to-[#5a1066] text-white font-black shadow-2xl shadow-purple-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 transition-all text-lg">
                {isSubmitting ? <Loader2 className="animate-spin" size={24}/> : <ShieldCheck size={24}/>}
                Synchronize Master Record
            </button>
        </div>
      </form>
    </div>
  );
}

function FormInput({ label, border = "gray-50", ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</label>
      <input 
        className={`w-full bg-${border} border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-[#36013F] transition-all disabled:opacity-50 shadow-sm`}
        {...props} 
      />
    </div>
  );
}

function MediaUploadSection({ title, items, field, handleFile, removeFile }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <label className="text-sm font-black text-gray-900 uppercase tracking-widest">{title}</label>
                <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black hover:bg-blue-100 transition-all border border-blue-100">
                    + UPLOAD NEW
                    <input type="file" multiple accept="image/*,.pdf" className="hidden" onChange={e => handleFile(e, field)} />
                </label>
            </div>
            <div className="grid grid-cols-4 gap-4">
               {items.length > 0 ? items.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-[24px] bg-gray-50 border border-gray-100 overflow-hidden group shadow-sm ring-4 ring-white">
                     {url.includes('.pdf') ? (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-gray-500">PDF DOC</div>
                     ) : (
                        <Image src={url} alt="" fill className="object-cover" />
                     )}
                     <button type="button" onClick={() => removeFile(idx, field)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="text-white" size={20}/>
                     </button>
                  </div>
               )) : <div className="col-span-4 p-8 border-2 border-dashed border-gray-100 rounded-[32px] text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">No Records Uploaded</div>}
            </div>
        </div>
    );
}

const selectStyles = {
  control: (b) => ({ 
      ...b, 
      borderRadius: '1rem', 
      border: '1px solid #f3f4f6', 
      background: '#f9fafb', 
      minHeight: '3.5rem', 
      fontWeight: '800', 
      fontSize: '0.875rem', 
      color: '#1f2937', 
      boxShadow: 'none',
      '&:hover': { borderColor: '#e5e7eb' }
  }),
  multiValue: (b) => ({ ...b, borderRadius: '0.5rem', background: '#36013F15', border: '1px solid #36013F20' }),
  multiValueLabel: (b) => ({ ...b, color: '#36013F', fontWeight: '900', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }),
  placeholder: (b) => ({ ...b, color: '#9ca3af', fontWeight: '500' })
};
