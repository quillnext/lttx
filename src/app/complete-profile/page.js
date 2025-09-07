
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import '@/app/globals.css';
import Link from 'next/link';
import Footer from '../pages/Footer';
import Navbar from '../components/Navbar';
import Cropper from 'react-easy-crop';
import getCroppedImg from './getCroppedImg';
import Step1_BasicInfo from './components/Step1_BasicInfo';
import Step2_Services from './components/Step2_Services';
import Step3_Experience from './components/Step3_Experience';

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
    profileType: 'expert',
    username: '',
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
    yearsActive: '',
    tagline: '',
    location: '',
    languages: [],
    responseTime: '',
    pricing: '',
    about: '',
    photo: null,
    services: [''],
    regions: [],
    expertise: [],
    experience: [{ title: '', company: '', startDate: null, endDate: null }],
    certifications: '',
    licenseNumber: '',
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
  const [cityOptions, setCityOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [selectedExpertise, setSelectedExpertise] = useState(null);
  const [apiError, setApiError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

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
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/cities');
        if (!response.ok) {
          if (response.status === 405) {
            throw new Error('Method Not Allowed: Ensure the API supports GET requests');
          }
          throw new Error(`Failed to fetch cities: ${response.status}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response format from cities API');
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        const sortedCities = data.sort((a, b) => {
          const isAIndia = a.country === 'India';
          const isBIndia = b.country === 'India';
          if (isAIndia && !isBIndia) return -1;
          if (!isAIndia && isBIndia) return 1;
          if (isAIndia && isBIndia) {
            const cityA = a.label.replace(', India', '');
            const cityB = b.label.replace(', India', '');
            return cityA.localeCompare(cityB);
          }
          return a.label.localeCompare(b.label);
        });
        setCityOptions(sortedCities);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setApiError(`Failed to load city options: ${error.message}. Please try again later.`);
      }
    };

    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/languages');
        if (!response.ok) {
          if (response.status === 405) {
            throw new Error('Method Not Allowed: Ensure the API supports GET requests');
          }
          throw new Error(`Failed to fetch languages: ${response.status}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response format from languages API');
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        const uniqueLanguages = Array.from(new Map(data.map(item => [item.value, item])).values());
        setLanguageOptions(uniqueLanguages);
      } catch (error) {
        console.error('Error fetching languages:', error);
        setApiError(`Failed to load language options: ${error.message}. Please try again later.`);
      }
    };

    fetchCities();
    fetchLanguages();
  }, []);

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
              profileType: data.profileType || 'expert',
              username: data.username || '',
              fullName: data.fullName || '',
              email: data.email || '',
              phone: data.phone || '',
              dateOfBirth: data.dateOfBirth ? parseDate(data.dateOfBirth, 'YYYY-MM-DD') : null,
              yearsActive: data.yearsActive || '',
              tagline: data.tagline || '',
              location: data.location || '',
              languages: Array.isArray(data.languages) ? data.languages : [],
              responseTime: data.responseTime || '',
              pricing: data.pricing || '',
              about: data.about || '',
              photo: null,
              services: data.services?.length ? data.services : [''],
              regions: data.regions?.length ? data.regions : [],
              expertise: Array.isArray(data.expertise) ? data.expertise : [],
              experience: data.experience?.length
                ? data.experience.map(exp => ({
                    title: exp.title || '',
                    company: exp.company || '',
                    startDate: exp.startDate ? parseDate(exp.startDate, 'YYYY-MM') : null,
                    endDate: exp.endDate === 'Present' ? 'Present' : parseDate(exp.endDate, 'YYYY-MM'),
                  }))
                : [{ title: '', company: '', startDate: null, endDate: null }],
              certifications: data.certifications || '',
              licenseNumber: data.licenseNumber || '',
              referred: data.referred || '',
              referralCode: data.referralCode || '',
            });
            setImagePreview(data.photo || null);
            setAgreed(true);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          setErrors(prev => ({ ...prev, fetch: 'Failed to load profile data.' }));
        }
      };
      fetchProfile();
    }
  }, [profileId]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropConfirm = useCallback(async () => {
    try {
      const croppedImage = await getCroppedImg(imagePreview, croppedAreaPixels);
      const blob = await (await fetch(croppedImage)).blob();
      const file = new File([blob], `cropped_${formData.photo.name}`, { type: blob.type });
      setFormData(prev => ({ ...prev, photo: file }));
      setImagePreview(croppedImage);
      setShowCropModal(false);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error('Error cropping image:', error);
      setErrors(prev => ({ ...prev, photo: 'Failed to crop image.' }));
    }
  }, [imagePreview, croppedAreaPixels, formData.photo]);

  const handleFile = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      setImagePreview(URL.createObjectURL(file));
      setShowCropModal(true);
      setErrors(prev => ({ ...prev, photo: '' }));
    }
  };

  const fetchLeadByPhone = async phone => {
    if (!phone || phone.length < 7) return;
    try {
      const leadsQuery = query(collection(db, 'JoinQueries'), where('phone', '==', phone));
      const querySnapshot = await getDocs(leadsQuery);
      if (!querySnapshot.empty) {
        const leads = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));
        const mostRecentLead = leads.sort((a, b) => b.timestamp - a.timestamp)[0];
        setFormData(prev => ({
          ...prev,
          fullName: mostRecentLead.name || prev.fullName,
          email: mostRecentLead.email || prev.email,
          phone,
        }));
        setErrors(prev => ({ ...prev, fullName: '', email: '', phone: '' }));
      }
    } catch (error) {
      console.error('Error fetching lead by phone:', error);
      setErrors(prev => ({ ...prev, phone: 'Failed to fetch lead data.' }));
    }
  };

  const checkUsernameAvailability = async username => {
    if (!username || profileId) return;
    try {
      const profilesQuery = query(collection(db, 'Profiles'), where('username', '==', username));
      const profileRequestsQuery = query(collection(db, 'ProfileRequests'), where('username', '==', username));
      const [profilesSnap, profileRequestsSnap] = await Promise.all([getDocs(profilesQuery), getDocs(profileRequestsQuery)]);
      if (!profilesSnap.empty || !profileRequestsSnap.empty) {
        setUsernameStatus('Username is already taken');
        setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
      } else {
        setUsernameStatus('Username is available');
        setErrors(prev => ({ ...prev, username: '' }));
      }
    } catch (error) {
      console.error('Error checking usernames:', error);
      setUsernameStatus('Error checking username');
    }
  };

  const checkReferralCode = async code => {
    if (!code || formData.referred !== 'Yes') {
      setReferralCodeStatus('');
      setReferrerUsername('');
      setErrors(prev => ({ ...prev, referralCode: '' }));
      return;
    }
    try {
      const codeQuery = query(collection(db, 'Profiles'), where('generatedReferralCode', '==', code));
      const querySnapshot = await getDocs(codeQuery);
      if (querySnapshot.empty) {
        setReferralCodeStatus('Invalid referral code');
        setReferrerUsername('');
        setErrors(prev => ({ ...prev, referralCode: 'Invalid referral code' }));
      } else {
        const referrerData = querySnapshot.docs[0].data();
        const fullName = referrerData.fullName || 'Unknown';
        setReferralCodeStatus(`Referred by ${fullName}`);
        setReferrerUsername(fullName);
        setErrors(prev => ({ ...prev, referralCode: '' }));
      }
    } catch (error) {
      console.error('Error checking referral code:', error);
      setReferralCodeStatus('Error checking referral code');
      setReferrerUsername('');
      setErrors(prev => ({ ...prev, referralCode: 'Error checking referral code' }));
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'tagline' && value.length > 150) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'username') {
      setUsernameStatus('');
      if (value.trim()) checkUsernameAvailability(value);
    }
    if (name === 'referralCode') checkReferralCode(value);
    if (name === 'referred' && value === 'No') {
      setFormData(prev => ({ ...prev, referralCode: '' }));
      setErrors(prev => ({ ...prev, referralCode: '' }));
      setReferralCodeStatus('');
      setReferrerUsername('');
    }
  };

  const handleSingleChange = (selectedOption, field) => {
    const value = selectedOption ? selectedOption.value : '';
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleMultiChange = (selectedOptions, field) => {
    const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
    if (values.length > 5) {
      setErrors(prev => ({ ...prev, [field]: `You can select up to 5 ${field}.` }));
      return;
    }
    setFormData(prev => ({ ...prev, [field]: values }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleExpertiseChange = selectedOption => {
    setSelectedExpertise(selectedOption);
  };

  const addExpertise = () => {
    if (selectedExpertise && formData.expertise.length < 5 && !formData.expertise.includes(selectedExpertise.value)) {
      const expertiseValue = selectedExpertise.value.trim();
      if (!expertiseValue) {
        setErrors(prev => ({ ...prev, expertise: 'Expertise cannot be empty.' }));
        return;
      }
      setFormData(prev => ({ ...prev, expertise: [...prev.expertise, expertiseValue] }));
      setSelectedExpertise(null);
      setErrors(prev => ({ ...prev, expertise: '' }));
    } else if (formData.expertise.length >= 5) {
      setErrors(prev => ({ ...prev, expertise: 'You can add up to 5 expertise areas.' }));
    } else if (selectedExpertise && formData.expertise.includes(selectedExpertise.value)) {
      setErrors(prev => ({ ...prev, expertise: 'This expertise is already added.' }));
    } else {
      setErrors(prev => ({ ...prev, expertise: 'Please select or enter an expertise.' }));
    }
  };

  const handleExpertiseKeyDown = e => {
    if (e.key === 'Enter' && selectedExpertise) {
      e.preventDefault();
      addExpertise();
    }
  };

  const removeExpertise = expertise => {
    setFormData(prev => ({ ...prev, expertise: prev.expertise.filter(e => e !== expertise) }));
    setErrors(prev => ({ ...prev, expertise: '' }));
  };

  const handleArrayChange = (index, key, value) => {
    const updated = [...formData[key]];
    updated[index] = value;
    setFormData(prev => ({ ...prev, [key]: updated }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const addField = key => {
    setFormData(prev => ({ ...prev, [key]: [...prev[key], ''] }));
  };

  const removeField = (key, index) => {
    const updated = formData[key].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [key]: updated.length > 0 ? updated : [''] }));
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...formData.experience];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, experience: updated }));
    setErrors(prev => ({ ...prev, experience: '' }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', startDate: null, endDate: null }],
    }));
  };

  const removeExperience = index => {
    const updated = formData.experience.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      experience: updated.length > 0 ? updated : [{ title: '', company: '', startDate: null, endDate: null }],
    }));
  };

  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = phone => /^\+?[0-9]{7,15}$/.test(phone);
  const validateUsername = username => /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/.test(username);

  const validateDateOfBirth = date => {
    if (!date) return false;
    const today = new Date();
    const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const minDate = new Date(1900, 0, 1);
    return date <= minAgeDate && date >= minDate && date <= today;
  };

  const validateExperienceDates = experience => {
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
    const { profileType } = formData;

    if (currentStep === 0) {
      ['username', 'fullName', 'email', 'phone', 'responseTime', 'pricing'].forEach(field => {
        if (!formData[field]?.trim()) newErrors[field] = 'This field is required';
      });

      if (profileType === 'expert') {
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (formData.dateOfBirth && !validateDateOfBirth(formData.dateOfBirth)) {
          newErrors.dateOfBirth = 'Invalid date of birth. Must be at least 18 years old and not in the future.';
        }
      } else { // agency
        if (!formData.yearsActive?.trim()) newErrors.yearsActive = 'This field is required';
      }

      if (!formData.location) newErrors.location = 'Location is required';
      if (!formData.languages.length) newErrors.languages = 'At least one language is required';
      if (formData.email && !validateEmail(formData.email)) newErrors.email = 'Invalid email address';
      if (formData.phone && !validatePhone(formData.phone)) newErrors.phone = 'Invalid phone number';
      if (formData.username && !validateUsername(formData.username)) {
        newErrors.username = 'Username must be 3-20 characters, start with a letter, and contain only letters, numbers, or underscores';
      }
      if (usernameStatus === 'Username is already taken') newErrors.username = 'Username is already taken';
    }

    if (currentStep === 1) {
      if (!formData.services.length || formData.services.some(s => !s.trim())) {
        newErrors.services = 'At least one valid service is required';
      }
      if (!formData.regions.length) newErrors.regions = 'At least one region is required';
      if (!formData.expertise.length) newErrors.expertise = 'At least one expertise area is required';
      if (formData.expertise.length > 5) newErrors.expertise = 'You can add up to 5 expertise areas';
    }

    if (currentStep === 2) {
      if (profileType === 'expert') {
        if (!formData.experience.length || formData.experience.some(exp => !exp.title.trim() || !exp.company.trim())) {
          newErrors.experience = 'All experience fields (title, company) are required';
        }
        const dateError = validateExperienceDates(formData.experience);
        if (dateError) newErrors.experience = dateError;
        if (!formData.certifications.trim()) newErrors.certifications = 'This field is required';
      }
      
      if (!formData.tagline?.trim()) newErrors.tagline = 'This field is required';
      if (!formData.about?.trim()) newErrors.about = 'This field is required';
      if (!profileId && !formData.photo) newErrors.photo = 'Profile photo is required';
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
      profileType: 'expert',
      username: '',
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: null,
      yearsActive: '',
      tagline: '',
      location: '',
      languages: [],
      responseTime: '',
      pricing: '',
      about: '',
      photo: null,
      services: [''],
      regions: [],
      expertise: [],
      experience: [{ title: '', company: '', startDate: null, endDate: null }],
      certifications: '',
      licenseNumber: '',
      referred: '',
      referralCode: '',
    });
    setImagePreview(null);
    setShowCropModal(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCurrentStep(0);
    setErrors({});
    setAgreed(false);
    setOriginalProfile(null);
    setSavedProfileId(null);
    setUsernameStatus('');
    setReferralCodeStatus('');
    setReferrerUsername('');
    setSelectedExpertise(null);
    setApiError('');
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);

    try {
      let photoURL = profileId ? (await getDoc(doc(db, 'Profiles', profileId))).data().photo : '';
      if (formData.photo && typeof formData.photo !== 'string' && formData.fullName) {
        const sanitizedFullName = formData.fullName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        const timestamp = Date.now();
        const fileExtension = formData.photo.name.split('.').pop();
        const fileName = `profile_${timestamp}.${fileExtension}`;
        const storageRef = ref(storage, `Profiles/${sanitizedFullName}/${fileName}`);

        await uploadBytes(storageRef, formData.photo);
        photoURL = await getDownloadURL(storageRef);
      }

      const profileData = {
        profileType: formData.profileType,
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.profileType === 'expert' && formData.dateOfBirth ? formatDate(formData.dateOfBirth, 'YYYY-MM-DD') : '',
        yearsActive: formData.profileType === 'agency' ? formData.yearsActive : '',
        tagline: formData.tagline,
        location: formData.location,
        languages: formData.languages,
        responseTime: formData.responseTime,
        pricing: formData.pricing,
        about: formData.about,
        photo: photoURL,
        services: formData.services,
        regions: formData.regions,
        expertise: formData.expertise,
        experience: formData.profileType === 'expert' ? formData.experience.map(exp => ({
          title: exp.title,
          company: exp.company,
          startDate: exp.startDate ? formatDate(exp.startDate, 'YYYY-MM') : '',
          endDate: exp.endDate === 'Present' ? 'Present' : exp.endDate ? formatDate(exp.endDate, 'YYYY-MM') : '',
        })) : [],
        certifications: formData.profileType === 'expert' ? formData.certifications : '',
        licenseNumber: formData.profileType === 'agency' ? formData.licenseNumber : '',
        referred: formData.referred || 'No',
        referralCode: formData.referred === 'Yes' ? formData.referralCode : '',
        timestamp: serverTimestamp(),
      };

      let localProfileId = profileId;
      const response = await fetch('/api/send-profile-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profileData, profileId: localProfileId }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format from profile submission API');
      }
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
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
      alert(error.message || 'Failed to submit profile. Please try again.');
      setErrors(prev => ({ ...prev, submit: error.message || 'Failed to submit profile.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = Math.round(((currentStep + 1) / 3) * 100);

  return (
    <>
      <Navbar />
      <div className="bg-[#F4D35E] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden mt-20">
          <div className="relative">
            <div className="bg-[#D8E7EC] h-3 w-full">
              <div
                id="progress-bar"
                className="bg-[var(--primary)] h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="absolute right-4 top-[-1.75rem] text-sm font-semibold text-[var(--primary)]">
              Step {currentStep + 1} of 3 ({progress}%)
            </div>
          </div>
          {showSuccessModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full shadow-xl">
                <h2 className="text-xl font-semibold text-[var(--primary)] mb-3">
                  🎉 Profile {profileId ? 'Updated' : 'Submitted'}!
                </h2>
                <p className="text-gray-700 mb-6 text-sm">
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
                  className="px-6 py-2 rounded-full text-white bg-[var(--primary)] hover:bg-green-700 transition"
                >
                  Got it!
                </button>
              </div>
            </div>
          )}
          {showCropModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
                <h3 className="text-lg font-semibold text-[var(--primary)] mb-4">Crop Your Photo</h3>
                <div className="relative w-full h-64">
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
                    style={{
                      containerStyle: { height: '100%', width: '100%' },
                    }}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zoom</label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={e => setZoom(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300"
                    onClick={() => {
                      setShowCropModal(false);
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, photo: null }));
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm text-white bg-[var(--primary)] rounded-xl hover:bg-opacity-90"
                    onClick={handleCropConfirm}
                  >
                    Confirm Crop
                  </button>
                </div>
              </div>
            </div>
          )}
          <form className="p-6 md:p-8 space-y-8">
            {apiError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                {apiError}
              </div>
            )}
            
            {currentStep === 0 && (
              <Step1_BasicInfo
                formData={formData}
                errors={errors}
                handleChange={handleChange}
                handleSingleChange={handleSingleChange}
                handleMultiChange={handleMultiChange}
                cityOptions={cityOptions}
                setCityOptions={setCityOptions}
                languageOptions={languageOptions}
                usernameStatus={usernameStatus}
                profileId={profileId}
                fetchLeadByPhone={fetchLeadByPhone}
                setFormData={setFormData}
                setErrors={setErrors}
                setApiError={setApiError}
              />
            )}

            {currentStep === 1 && (
              <Step2_Services
                formData={formData}
                errors={errors}
                setFormData={setFormData}
                setErrors={setErrors}
                handleArrayChange={handleArrayChange}
                removeField={removeField}
                addField={addField}
                selectedExpertise={selectedExpertise}
                setSelectedExpertise={setSelectedExpertise}
                handleExpertiseChange={handleExpertiseChange}
                handleExpertiseKeyDown={handleExpertiseKeyDown}
                addExpertise={addExpertise}
                removeExpertise={removeExpertise}
              />
            )}

            {currentStep === 2 && (
              <Step3_Experience
                formData={formData}
                errors={errors}
                handleExperienceChange={handleExperienceChange}
                removeExperience={removeExperience}
                addExperience={addExperience}
                handleChange={handleChange}
                handleFile={handleFile}
                imagePreview={imagePreview}
                agreed={agreed}
                setAgreed={setAgreed}
                referralCodeStatus={referralCodeStatus}
                profileId={profileId}
                setShowCropModal={setShowCropModal}
              />
            )}

            <div className="flex justify-between pt-6">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-2 text-sm font-semibold text-[var(--primary)] hover:text-gray-800"
                >
                  Back
                </button>
              )}
              <div className="flex-1"></div>
              {currentStep < 2 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 text-sm font-semibold text-white bg-[var(--primary)] rounded-xl cursor-pointer transition"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-6 py-2 text-sm font-semibold text-white rounded-xl transition cursor-pointer ${
                    isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--primary)] '
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : profileId ? 'Update Profile' : 'Submit'}
                </button>
              )}
            </div>
            {errors.submit && <p className="text-sm text-red-600 mt-2">{errors.submit}</p>}
          </form>
        </div>
      </div>
      <div className="-mt-20">
        <Footer />
      </div>
    </>
  );
}