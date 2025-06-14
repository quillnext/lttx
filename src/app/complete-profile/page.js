
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import '@/app/globals.css';
import Link from 'next/link';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const storage = getStorage(app);
const db = getFirestore(app);

export default function CompleteProfile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get('profileId');

  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedProfileId, setSavedProfileId] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
    tagline: '',
    location: '',
    languages: '',
    responseTime: '',
    pricing: '',
    about: '',
    photo: null,
    services: [''],
    regions: [],
    experience: [{ title: '', company: '', startDate: null, endDate: null }],
    certifications: '',
    referred: '',
    referralCode: '',
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState('');
  const [referralCodeStatus, setReferralCodeStatus] = useState('');
  const [referrerUsername, setReferrerUsername] = useState('');


  const formatDate = (date, format = 'YYYY-MM-DD') => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    if (format === 'YYYY-MM') return `${year}-${month}`;
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

 
  const parseDate = (dateString, format = 'YYYY-MM-DD') => {
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (format === 'YYYY-MM' && parts.length === 2) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1);
    }
    if (format === 'YYYY-MM-DD' && parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return null;
  };

  useEffect(() => {
    if (profileId) {
      const fetchProfile = async () => {
        try {
          const profileRef = doc(db, 'Profiles', profileId);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const data = profileSnap.data();
            setOriginalProfile({ id: profileSnap.id, ...data });
            setFormData({
              username: data.username || '',
              fullName: data.fullName || '',
              email: data.email || '',
              phone: data.phone || '',
              dateOfBirth: data.dateOfBirth ? parseDate(data.dateOfBirth, 'YYYY-MM-DD') : null,
              tagline: data.tagline || '',
              location: data.location || '',
              languages: data.languages || '',
              responseTime: data.responseTime || '',
              pricing: data.pricing || '',
              about: data.about || '',
              photo: null,
              services: data.services?.length ? data.services : [''],
              regions: data.regions?.length ? data.regions : [],
              experience: data.experience?.length
                ? data.experience.map(exp => ({
                    title: exp.title || '',
                    company: exp.company || '',
                    startDate: exp.startDate ? parseDate(exp.startDate, 'YYYY-MM') : null,
                    endDate: exp.endDate === 'Present' ? 'Present' : parseDate(exp.endDate, 'YYYY-MM'),
                  }))
                : [{ title: '', company: '', startDate: null, endDate: null }],
              certifications: data.certifications || '',
              referred: data.referred || '',
              referralCode: data.referralCode || '',
            });
            setAgreed(true);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          setErrors((prev) => ({ ...prev, fetch: 'Failed to load profile data.' }));
        }
      };
      fetchProfile();
    }
  }, [profileId]);

  const fetchLeadByPhone = async (phone) => {
    if (!phone || phone.length < 7) return;
  
    try {
      const leadsQuery = query(collection(db, 'JoinQueries'), where('phone', '==', phone));
      const querySnapshot = await getDocs(leadsQuery);
      if (!querySnapshot.empty) {
        const leads = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), timestamp: doc.data().timestamp?.toDate() || new Date() }));
        const mostRecentLead = leads.sort((a, b) => b.timestamp - a.timestamp)[0];
        setFormData((prev) => ({
          ...prev,
          fullName: mostRecentLead.name || prev.fullName,
          email: mostRecentLead.email || prev.email,
          phone: phone,
        }));
        setErrors((prev) => ({ ...prev, fullName: '', email: '', phone: '' }));
      }
    } catch (error) {
      console.error('Error fetching lead by phone:', error);
      setErrors((prev) => ({ ...prev, phone: 'Failed to fetch lead data.' }));
    }
  };

  const checkUsernameAvailability = async (username) => {
    if (!username || profileId) return;
    try {
      const profilesQuery = query(collection(db, 'Profiles'), where('username', '==', username));
      const profileRequestsQuery = query(collection(db, 'ProfileRequests'), where('username', '==', username));
      const [profilesSnap, profileRequestsSnap] = await Promise.all([
        getDocs(profilesQuery),
        getDocs(profileRequestsQuery),
      ]);
      if (!profilesSnap.empty || !profileRequestsSnap.empty) {
        setUsernameStatus('Username is already taken');
        setErrors((prev) => ({ ...prev, username: 'Username is already taken' }));
      } else {
        setUsernameStatus('Username is available');
        setErrors((prev) => ({ ...prev, username: '' }));
      }
    } catch (error) {
      console.error('Error checking usernames:', error);
      setUsernameStatus('Error checking username');
    }
  };

  const checkReferralCode = async (code) => {
    if (!code || formData.referred !== 'Yes') {
      setReferralCodeStatus('');
      setReferrerUsername('');
      setErrors((prev) => ({ ...prev, referralCode: '' }));
      return;
    }
    try {
      const codeQuery = query(collection(db, 'Profiles'), where('generatedReferralCode', '==', code));
      const querySnapshot = await getDocs(codeQuery);
      if (querySnapshot.empty) {
        setReferralCodeStatus('Invalid referral code');
        setReferrerUsername('');
        setErrors((prev) => ({ ...prev, referralCode: 'Invalid referral code' }));
      } else {
        const referrerData = querySnapshot.docs[0].data();
        const fullName = referrerData.fullName || 'Unknown';
        setReferralCodeStatus(`Referred by ${fullName}`);
        setReferrerUsername(fullName);
        setErrors((prev) => ({ ...prev, referralCode: '' }));
      }
    } catch (error) {
      console.error('Error checking referral code:', error);
      setReferralCodeStatus('Error checking referral code');
      setReferrerUsername('');
      setErrors((prev) => ({ ...prev, referralCode: 'Error checking referral code' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'username') {
      setUsernameStatus('');
      if (value.trim()) {
        checkUsernameAvailability(value);
      }
    }
    if (name === 'referralCode') {
      checkReferralCode(value);
    }
    if (name === 'referred' && value === 'No') {
      setFormData((prev) => ({ ...prev, referralCode: '' }));
      setErrors((prev) => ({ ...prev, referralCode: '' }));
      setReferralCodeStatus('');
      setReferrerUsername('');
    }
  };

  const handleMultiChange = (e) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setFormData((prev) => ({ ...prev, regions: options }));
    setErrors((prev) => ({ ...prev, regions: '' }));
  };

  const handleFile = (e) => {
    setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
    setErrors((prev) => ({ ...prev, photo: '' }));
  };

  const handleArrayChange = (index, key, value) => {
    const updated = [...formData[key]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [key]: updated }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const addField = (key) => {
    setFormData((prev) => ({ ...prev, [key]: [...prev[key], ''] }));
  };

  const removeField = (key, index) => {
    const updated = formData[key].filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [key]: updated }));
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...formData.experience];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, experience: updated }));
    setErrors((prev) => ({ ...prev, experience: '' }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', startDate: null, endDate: null }],
    }));
  };

  const removeExperience = (index) => {
    const updated = formData.experience.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, experience: updated }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\+?[0-9]{7,15}$/.test(phone);
  const validateUsername = (username) => /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/.test(username);

  const validateDateOfBirth = (date) => {
    if (!date) return false;
    const today = new Date();
    const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const minDate = new Date(1900, 0, 1);
    return date <= minAgeDate && date >= minDate && date <= today;
  };

  const validateExperienceDates = (experience) => {
    const today = new Date();
    for (let i = 0; i < experience.length; i++) {
      const { startDate, endDate } = experience[i];
      if (!startDate) return 'Start date is required';
      if (!endDate) return 'End date is required';
      if (startDate > today) return 'Start date cannot be in the future';
      if (endDate !== 'Present') {
        if (!endDate) return 'End date is required';
        if (endDate < startDate) return 'End date must be after start date';
        if (endDate > today) return 'End date cannot be in the future';
      }
    }
    return '';
  };

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 0) {
      ['username', 'fullName', 'email', 'phone', 'tagline', 'location', 'languages', 'responseTime', 'pricing', 'about'].forEach(field => {
        if (!formData[field]?.trim()) newErrors[field] = 'This field is required';
      });
      if (!profileId && !formData.photo) newErrors.photo = 'Profile photo is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (formData.email && !validateEmail(formData.email)) newErrors.email = 'Invalid email address';
      if (formData.phone && !validatePhone(formData.phone)) newErrors.phone = 'Invalid phone number';
      if (formData.username && !validateUsername(formData.username)) {
        newErrors.username = 'Username must be 3-20 characters, start with a letter, and contain only letters, numbers, or underscores';
      }
      if (usernameStatus === 'Username is already taken') newErrors.username = 'Username is already taken';
      if (formData.dateOfBirth && !validateDateOfBirth(formData.dateOfBirth)) {
        newErrors.dateOfBirth = 'Invalid date of birth. Must be at least 18 years old and not in the future.';
      }
    }

    if (currentStep === 1) {
      if (!formData.services.length || formData.services.some(s => !s.trim())) {
        newErrors.services = 'At least one service is required';
      }
      if (!formData.regions.length) newErrors.regions = 'At least one region is required';
    }

    if (currentStep === 2) {
      if (!formData.experience.length || formData.experience.some((exp) => 
        !exp.title.trim() || !exp.company.trim()
      )) {
        newErrors.experience = 'All experience fields (title, company) are required';
      }
      const dateError = validateExperienceDates(formData.experience);
      if (dateError) newErrors.experience = dateError;
      if (!formData.certifications.trim()) newErrors.certifications = 'This field is required';
      if (!agreed) newErrors.agreed = 'You must agree to the terms';
      if (!formData.referred) newErrors.referred = 'Please select whether you were referred';
      if (formData.referred === 'Yes' && !formData.referralCode.trim()) {
        newErrors.referralCode = 'Referral code is required';
      }
      if (formData.referred === 'Yes' && referralCodeStatus === 'Invalid referral code') {
        newErrors.referralCode = 'Invalid referral code';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: null,
      tagline: '',
      location: '',
      languages: '',
      responseTime: '',
      pricing: '',
      about: '',
      photo: null,
      services: [''],
      regions: [],
      experience: [{ title: '', company: '', startDate: null, endDate: null }],
      certifications: '',
      referred: '',
      referralCode: '',
    });
    setCurrentStep(0);
    setErrors({});
    setAgreed(false);
    setOriginalProfile(null);
    setSavedProfileId(null);
    setUsernameStatus('');
    setReferralCodeStatus('');
    setReferrerUsername('');
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);

    try {
      let photoURL = profileId ? (await getDoc(doc(db, 'Profiles', profileId))).data().photo : '';
      if (formData.photo && formData.fullName) {
        const sanitizedFullName = formData.fullName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        const timestamp = Date.now();
        const fileExtension = formData.photo.name.split('.').pop();
        const fileName = `profile_${timestamp}.${fileExtension}`;
        const storageRef = ref(storage, `Profiles/${sanitizedFullName}/${fileName}`);

        await uploadBytes(storageRef, formData.photo);
        photoURL = await getDownloadURL(storageRef);
      }

      const profileData = {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth ? formatDate(formData.dateOfBirth, 'YYYY-MM-DD') : '',
        tagline: formData.tagline,
        location: formData.location,
        languages: formData.languages,
        responseTime: formData.responseTime,
        pricing: formData.pricing,
        about: formData.about,
        photo: photoURL,
        services: formData.services,
        regions: formData.regions,
        experience: formData.experience.map(exp => ({
          title: exp.title,
          company: exp.company,
          startDate: exp.startDate ? formatDate(exp.startDate, 'YYYY-MM') : '',
          endDate: exp.endDate === 'Present' ? 'Present' : exp.endDate ? formatDate(exp.endDate, 'YYYY-MM') : '',
        })),
        certifications: formData.certifications,
        referred: formData.referred || 'No',
        referralCode: formData.referred === 'Yes' ? formData.referralCode : '',
        timestamp: serverTimestamp(),
      };

      let localProfileId = profileId;
      const response = await fetch("/api/send-profile-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profileData, profileId: localProfileId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit profile');
      }

      setSavedProfileId(result.profileId);

      const slug = `${formData.username.toLowerCase().replace(/\s+/g, '-')}`;

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        resetForm();
        router.push(`/`);
      }, 3000);
    } catch (error) {
      alert(error.message || 'Failed to submit profile. Please try again.');
      setErrors((prev) => ({ ...prev, submit: error.message || 'Failed to submit profile. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = Math.round(((currentStep + 1) / 3) * 100);

  return (
    <div className="bg-[#F4D35E] min-h-screen flex items-center justify-center p-3">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="relative">
          <div className="bg-[#D8E7EC] h-2 w-full">
            <div
              id="progress-bar"
              className="bg-[var(--primary)] h-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="absolute right-4 top-[-1.5rem] text-sm font-semibold text-[var(--primary)]">
            Step {currentStep + 1} of 3 ({progress}%)
          </div>
        </div>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 text-center w-[500px] shadow-xl">
              <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">
                🎉 Profile {profileId ? 'Updated' : 'Submitted'}!
              </h2>
              <p className="text-gray-700 mb-4 text-sm">
                Your expert profile has been successfully {profileId ? 'updated' : 'submitted'}.<br />
                {profileId
                  ? 'Changes have been saved.'
                  : 'Our team will review the details and reach out if anything more is needed.'}
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  resetForm();
                  const slug = `${formData.username.toLowerCase().replace(/\s+/g, '-')}`;
                  router.push(`/experts/${slug}`);
                }}
                className="px-6 py-2 rounded-full text-white bg-green-600 hover:bg-green-700 transition"
              >
                Got it!
              </button>
            </div>
          </div>
        )}

        <form className="p-6 md:p-10 space-y-10">
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-[var(--primary)] mb-4">👤 Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <PhoneInput
                    country={"in"}
                    value={formData.phone}
                    onChange={(phone) => {
                      setFormData((prev) => ({ ...prev, phone }));
                      fetchLeadByPhone(phone);
                    }}
                    placeholder="Enter phone number"
                    inputProps={{
                      id: "phone",
                      className: `w-full p-3 border px-12 border-gray-300 rounded-2xl bg-white ${errors.phone ? 'border-red-500' : ''}`,
                      required: true,
                      autoFocus: false,
                    }}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    className={`px-4 py-3 border rounded-xl w-full ${errors.username ? 'border-red-500' : ''}`}
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!!profileId}
                  />
                  {usernameStatus && (
                    <p className={`text-sm mt-1 ${usernameStatus.includes('available') ? 'text-green-600' : 'text-red-600'}`}>
                      {usernameStatus}
                    </p>
                  )}
                  {errors.username && errors.username !== 'Username is already taken' && (
                    <p className="text-sm text-red-600 mt-1">{errors.username}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    className={`px-4 py-3 border rounded-xl w-full ${errors.fullName ? 'border-red-500' : ''}`}
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-gray-500 mt-1">e.g. Rishabh</p>
                </div>
                <div>
                  <input
                    type="text"
                    name="email"
                    placeholder="Email"
                    className={`px-4 py-3 border rounded-xl w-full ${errors.email ? 'border-red-500' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <DatePicker
                    selected={formData.dateOfBirth}
                    onChange={(date) => {
                      setFormData((prev) => ({ ...prev, dateOfBirth: date }));
                      setErrors((prev) => ({ ...prev, dateOfBirth: '' }));
                    }}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Date of Birth"
                    className={`px-4 py-3 border rounded-xl w-full ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                    maxDate={new Date()}
                    showYearDropdown
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                  />
                  <p className="text-sm text-gray-500 mt-1">e.g. 1990-01-01</p>
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    name="tagline"
                    placeholder="Tagline"
                    className={`px-4 py-3 border rounded-xl w-full ${errors.tagline ? 'border-red-500' : ''}`}
                    value={formData.tagline}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-gray-500 mt-1">e.g. Europe Travel Expert</p>
                </div>
                <div>
                  <input
                    type="text"
                    name="location"
                    placeholder="City & Country"
                    className={`px-4 py-3 border rounded-xl w-full ${errors.location ? 'border-red-500' : ''}`}
                    value={formData.location}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-gray-500 mt-1">e.g. Mumbai, India</p>
                </div>
                <div>
                  <input
                    type="text"
                    name="languages"
                    placeholder="Languages Spoken"
                    className={`px-4 py-3 border rounded-xl w-full ${errors.languages ? 'border-red-500' : ''}`}
                    value={formData.languages}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-gray-500 mt-1">e.g. English, French, Hindi</p>
                </div>
                <div>
                  <input
                    type="text"
                    name="responseTime"
                    placeholder="Response Time"
                    className={`px-4 py-3 border rounded-xl w-full ${errors.responseTime ? 'border-red-500' : ''}`}
                    value={formData.responseTime}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-gray-500 mt-1">e.g. Responds in 12 hours</p>
                </div>
                <div>
                  <input
                    type="text"
                    name="pricing"
                    placeholder="Pricing"
                    className={`px-4 py-3 border rounded-xl w-full ${errors.pricing ? 'border-red-500' : ''}`}
                    value={formData.pricing}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-gray-500 mt-1">e.g. ₹2000/session or $30/consult</p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Profile Photo</label>
                <input
                  type="file"
                  className={`w-full border rounded-xl px-4 py-2 ${errors.photo ? 'border-red-500' : ''}`}
                  onChange={handleFile}
                />
                {errors.photo && (
                  <p className="text-sm text-red-600 mt-1">{errors.photo}</p>
                )}
              </div>

              <textarea
                placeholder="About Me (e.g. 10+ years guiding travelers across Europe)"
                className={`w-full px-4 py-3 border rounded-xl ${errors.about ? 'border-red-500' : ''}`}
                rows="4"
                name="about"
                value={formData.about}
                onChange={handleChange}
              ></textarea>
              {errors.submit && (
                <p className="text-sm text-red-600 mt-2">{errors.submit}</p>
              )}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[var(--primary)] mb-4">🎯 Services & Regions</h2>
              <div>
                <label className="block mb-2 font-medium text-gray-700">What I Can Help You With</label>
                {formData.services.map((service, index) => (
                  <div key={index} className="flex gap-2 items-center mb-2">
                    <input
                      type="text"
                      className={`w-full px-4 py-2 border rounded-xl ${errors.services ? 'border-red-500' : ''}`}
                      placeholder="e.g. Visa Documentation"
                      value={service}
                      onChange={(e) => handleArrayChange(index, 'services', e.target.value)}
                    />
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={() => removeField('services', index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addField('services')}
                  className="text-sm text-[var(--primary)] mt-2"
                >
                  + Add More
                </button>
                {errors.services && (
                  <p className="text-sm text-red-600 mt-1">{errors.services}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Regions You Specialize In</label>
                <select
                  multiple
                  className={`w-full px-4 py-3 border rounded-xl ${errors.regions ? 'border-red-500' : ''}`}
                  onChange={handleMultiChange}
                  value={formData.regions}
                >
                  <option value="south-asia">South Asia</option>
                  <option value="southeast-asia">Southeast Asia</option>
                  <option value="east-asia">East Asia</option>
                  <option value="central-asia">Central Asia</option>
                  <option value="west-asia">West Asia</option>
                  <option value="north-africa">North Africa</option>
                  <option value="west-africa">West Africa</option>
                  <option value="east-africa">East Africa</option>
                  <option value="central-africa">Central Africa</option>
                  <option value="southern-africa">Southern Africa</option>
                  <option value="north-america">North America</option>
                  <option value="central-america">Central America</option>
                  <option value="caribbean">Caribbean</option>
                  <option value="south-america">South America</option>
                  <option value="western-europe">Western Europe</option>
                  <option value="eastern-europe">Eastern Europe</option>
                  <option value="northern-europe">Northern Europe</option>
                  <option value="southern-europe">Southern Europe</option>
                  <option value="australia-nz">Australia & New Zealand</option>
                  <option value="pacific-islands">Pacific Islands</option>
                  <option value="mena">MENA</option>
                  <option value="emea">EMEA</option>
                  <option value="apac">APAC</option>
                  <option value="latam">LATAM</option>
                </select>
                {errors.regions && (
                  <p className="text-sm text-red-600 mt-1">{errors.regions}</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[var(--primary)] mb-4">📚 Experience & Credentials</h2>
              <div>
                <label className="block mb-2 font-medium text-gray-700">Experience</label>
                {formData.experience.map((exp, index) => (
                  <div key={index} className="space-y-2 mb-4 border p-4 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Job Title (e.g. Travel Consultant)"
                          className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? 'border-red-500' : ''}`}
                          value={exp.title}
                          onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Company (e.g. MakeMyTrip)"
                          className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? 'border-red-500' : ''}`}
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                        />
                      </div>
                      <div>
                        <DatePicker
                          selected={exp.startDate}
                          onChange={(date) => handleExperienceChange(index, 'startDate', date)}
                          dateFormat="yyyy-MM"
                          placeholderText="Start Date (YYYY-MM)"
                          className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? 'border-red-500' : ''}`}
                          maxDate={new Date()}
                          showMonthYearPicker
                        />
                        <p className="text-sm text-gray-500 mt-1">e.g. 2020-01</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <DatePicker
                          selected={exp.endDate !== 'Present' ? exp.endDate : null}
                          onChange={(date) => handleExperienceChange(index, 'endDate', date)}
                          dateFormat="yyyy-MM"
                          placeholderText="End Date (YYYY-MM)"
                          className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? 'border-red-500' : ''}`}
                          maxDate={new Date()}
                          showMonthYearPicker
                          disabled={exp.endDate === 'Present'}
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={exp.endDate === 'Present'}
                            onChange={(e) => handleExperienceChange(index, 'endDate', e.target.checked ? 'Present' : null)}
                          />
                          Present
                        </label>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-red-500 mt-2"
                      onClick={() => removeExperience(index)}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExperience}
                  className="text-sm text-[var(--primary)] mt-2"
                >
                  + Add Experience
                </button>
                {errors.experience && (
                  <p className="text-sm text-red-600 mt-1">{errors.experience}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  name="certifications"
                  className={`w-full px-4 py-2 border rounded-xl ${errors.certifications ? 'border-red-500' : ''}`}
                  placeholder="Certifications (comma separated)"
                  value={formData.certifications}
                  onChange={handleChange}
                />
                <p className="text-sm text-gray-500 mt-1">e.g. Aussie Specialist, VisitBritain, Fremden Visa Coach</p>
                {errors.certifications && (
                  <p className="text-sm text-red-600 mt-1">{errors.certifications}</p>
                )}
              </div>

              <div className="pt-4 border-t">
                <label className="block mb-2 font-medium text-gray-700">Referral Information</label>
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">Were you referred by someone?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="referred"
                        value="Yes"
                        checked={formData.referred === 'Yes'}
                        onChange={handleChange}
                        className={`${errors.referred ? 'ring-2 ring-red-500' : ''}`}
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="referred"
                        value="No"
                        checked={formData.referred === 'No'}
                        onChange={handleChange}
                        className={`${errors.referred ? 'ring-2 ring-red-500' : ''}`}
                      />
                      No
                    </label>
                  </div>
                  {errors.referred && (
                    <p className="text-sm text-red-600 mt-1">{errors.referred}</p>
                  )}
                </div>

                {formData.referred === 'Yes' && (
                  <div className="mt-4">
                    <input
                      type="text"
                      name="referralCode"
                      placeholder="Enter referral code"
                      className={`w-full px-4 py-2 border rounded-xl ${errors.referralCode ? 'border-red-500' : ''}`}
                      value={formData.referralCode}
                      onChange={handleChange}
                    />
                    {referralCodeStatus && (
                      <p className={`text-sm mt-1 ${referralCodeStatus.includes('Referred by') ? 'text-green-600' : 'text-red-600'}`}>
                        {referralCodeStatus}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      A verification call might be made to your referrer to confirm your recommendation.
                    </p>
                    {errors.referralCode && errors.referralCode !== 'Invalid referral code' && (
                      <p className="text-sm text-red-600 mt-1">{errors.referralCode}</p>
                    )}
                  </div>
                )}

                {formData.referred === 'No' && (
                  <p className="text-sm text-gray-700 mt-2">
                    Your profile approval may take a little longer. A short interview might be scheduled before activation.
                  </p>
                )}
              </div>

              <div className="pt-4 border-t">
                <label className="block mb-2 font-medium text-gray-700">Final Declaration</label>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className={`mt-1 ${errors.agreed ? 'ring-2 ring-red-500' : ''}`}
                    checked={agreed}
                    onChange={() => setAgreed(!agreed)}
                  />
                  <label>
                    I confirm that the information provided is accurate and complies with{" "}
                    <strong>Xmytravel Experts&#39;</strong> professional and ethical standards. I also agree to the{" "}
                    <Link
                      href="/privacy-policy"
                      className="text-blue-600 underline hover:text-blue-800"
                      target="_blank"
                    >
                      Privacy Policy
                    </Link>.
                  </label>
                </label>
                {errors.agreed && (
                  <p className="text-sm text-red-600 mt-1">{errors.agreed}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-[var(--primary)]"
              >
                Back
              </button>
            )}
            {currentStep < 2 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 text-sm font-semibold bg-[var(--primary)] text-white rounded-xl"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-2 text-sm font-semibold text-white rounded-xl ${
                  isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSubmitting ? 'Submitting...' : profileId ? 'Update Profile' : 'Submit'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}