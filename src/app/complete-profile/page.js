
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import '@/app/globals.css';
import Link from 'next/link';
import Footer from '../pages/Footer';
import Navbar from '../components/Navbar';
import getCroppedImg from './getCroppedImg';
import Step1_BasicInfo from './components/Step1_BasicInfo';
import Step2_Services from './components/Step2_Services';
import Step3_Experience from './components/Step3_Experience';
import Image from 'next/image';
import { FileText, Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

// Dynamically import components with error handling
const loadComponent = (importFn, name) =>
  dynamic(
    () =>
      importFn()
        .then((mod) => mod.default || mod)
        .catch((err) => {
          console.error(`Failed to load ${name}:`, err);
          return { default: () => <div className="text-red-500">Error loading {name} component.</div> };
        }),
    {
      ssr: false,
      loading: () => <div>Loading {name}...</div>,
    }
  );

const Cropper = loadComponent(() => import('react-easy-crop'), 'Cropper');

const storage = getStorage(app);
const db = getFirestore(app);

export default function CompleteProfile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get('profileId');

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
    services: [], // Changed to tags
    regions: [],
    expertise: [],
    experience: [{ title: '', company: '', startDate: null, endDate: null }],
    certifications: [], // Changed to tags
    licenseNumber: '',
    referred: 'No',
    referralCode: '',
    certificates: [],
    officePhotos: [],
    registeredAddress: '',
    website: '',
    employeeCount: '',
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
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
  const [certificatePreviews, setCertificatePreviews] = useState([]);
  const [officePhotoPreviews, setOfficePhotoPreviews] = useState([]);
  const [isMainDescriptionExpanded, setIsMainDescriptionExpanded] = useState(false);

  // Profile write-ups
  const profileWriteUps = {
    expert: "Become a recognised travel authority on the world’s first platform dedicated to human expertise in travel. As an Individual Expert, you showcase your specialised knowledge, from destinations and cultures to niche travel themes.",
    agency: "Position your agency as a trusted voice in the global travel community. By joining, you gain visibility as a credible, verified travel partner while connecting with travellers actively seeking professional consultation."
  };

  useEffect(() => {
    const loadCSS = (href, fallback) => {
      const link = document.createElement("link");
      link.href = href;
      link.rel = "stylesheet";
      link.onerror = () => {
        console.warn(`Failed to load local CSS: ${href}. Loading fallback: ${fallback}`);
        const fallbackLink = document.createElement("link");
        fallbackLink.href = fallback;
        fallbackLink.rel = "stylesheet";
        document.head.appendChild(fallbackLink);
      };
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
        const fallbackElement = document.querySelector(`link[href="${fallback}"]`);
        if (fallbackElement) {
          document.head.removeChild(fallbackElement);
        }
      };
    };

    const cssFiles = [
      { local: "/css/react-phone-input-2.css", fallback: "https://unpkg.com/react-phone-input-2@2.15.1/lib/style.css" },
      { local: "/css/react-datepicker.css", fallback: "https://unpkg.com/react-datepicker@4.8.0/dist/react-datepicker.css" },
      { local: "/css/react-easy-crop.css", fallback: "https://unpkg.com/react-easy-crop@5.0.7/react-easy-crop.css" }
    ];

    const cleanups = cssFiles.map(({ local, fallback }) => loadCSS(local, fallback));
    return () => cleanups.forEach(cleanup => cleanup());
  }, []);

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

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setApiError("File size exceeds 5MB.");
      return;
    }

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setApiError("Please upload a PDF, DOCX, or Image file.");
      return;
    }

    setIsParsingResume(true);
    setApiError("");

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("resume", file);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formDataUpload,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to parse resume");
      }

      const { data } = result;

      // Sanitize phone number
      const sanitizedPhone = data.phone ? data.phone.replace(/[^\d+]/g, '') : formData.phone;

      // Merge data into state
      setFormData(prev => ({
        ...prev,
        fullName: data.fullName || prev.fullName,
        email: data.email || prev.email,
        phone: sanitizedPhone,
        location: data.location || prev.location,
        tagline: data.tagline || prev.tagline,
        about: data.about || prev.about,
        languages: data.languages && data.languages.length > 0 ? data.languages : prev.languages,
        expertise: data.expertise && data.expertise.length > 0 ? data.expertise : prev.expertise,
        experience: data.experience && data.experience.length > 0
          ? data.experience.map(exp => ({
              title: exp.title,
              company: exp.company,
              startDate: exp.startDate ? parseDate(exp.startDate, 'YYYY-MM') : null,
              endDate: exp.endDate === 'Present' ? 'Present' : (exp.endDate ? parseDate(exp.endDate, 'YYYY-MM') : null),
            }))
          : prev.experience,
      }));

      // Update City Options
      if (data.location && !cityOptions.some(opt => opt.value === data.location)) {
        setCityOptions(prev => [{ value: data.location, label: data.location }, ...prev]);
      }

      // Update Language Options
      if (data.languages && data.languages.length > 0) {
        setLanguageOptions(prev => {
          const newLangs = data.languages.filter(l => !prev.some(opt => opt.value === l)).map(l => ({ value: l, label: l }));
          return [...prev, ...newLangs];
        });
      }

    } catch (error) {
      console.error("Resume parsing error:", error);
      setApiError(error.message);
    } finally {
      setIsParsingResume(false);
    }
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/cities');
        if (!response.ok) throw new Error(`Failed to fetch cities: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        if (data.length === 0) throw new Error("No city data returned.");
        const sortedCities = [...data].sort((a, b) => a.label.localeCompare(b.label));
        setCityOptions(sortedCities);
      } catch (error) {
        console.error('Error fetching cities:', error);
        setApiError(`Failed to load city options: ${error.message}. Using fallback options.`);
        setCityOptions([{ value: 'Unknown', label: 'Unknown' }]);
      }
    };

    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/languages');
        if (!response.ok) throw new Error(`Failed to fetch languages: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        if (data.length === 0) throw new Error("No language data returned.");
        setLanguageOptions(data);
      } catch (error) {
        console.error('Error fetching languages:', error);
        setApiError(`Failed to load language options: ${error.message}. Using fallback options.`);
        setLanguageOptions([{ value: 'English', label: 'English' }]);
      }
    };

    fetchCities();
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (formData.location && cityOptions.length > 0 && !cityOptions.some(option => option.value === formData.location)) {
      setCityOptions(prevOptions => [{ value: formData.location, label: formData.location }, ...prevOptions]);
    }
  }, [formData.location, cityOptions]);

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
              photo: data.photo || null,
              services: Array.isArray(data.services) ? data.services : [],
              regions: Array.isArray(data.regions) ? data.regions : [],
              expertise: Array.isArray(data.expertise) ? data.expertise : [],
              experience: Array.isArray(data.experience) && data.experience.length > 0
                ? data.experience.map(exp => ({
                    title: exp.title || '',
                    company: exp.company || '',
                    startDate: exp.startDate ? parseDate(exp.startDate, 'YYYY-MM') : null,
                    endDate: exp.endDate === 'Present' ? 'Present' : parseDate(exp.endDate, 'YYYY-MM'),
                  }))
                : [{ title: '', company: '', startDate: null, endDate: null }],
              certifications: Array.isArray(data.certifications) ? data.certifications : [],
              licenseNumber: data.licenseNumber || '',
              referred: data.referred || 'No',
              referralCode: data.referralCode || '',
              certificates: Array.isArray(data.certificates) ? data.certificates : [],
              officePhotos: Array.isArray(data.officePhotos) ? data.officePhotos : [],
              registeredAddress: data.registeredAddress || '',
              website: data.website || '',
              employeeCount: data.employeeCount || '',
            });
            setImagePreview(data.photo || null);
            setCertificatePreviews(data.certificates || []);
            setOfficePhotoPreviews(data.officePhotos || []);
            setAgreed(true);
          } else {
            setApiError(`Profile with ID "${profileId}" not found.`);
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
      if (!imagePreview || !croppedAreaPixels) return;
      const croppedImageFile = await getCroppedImg(imagePreview, croppedAreaPixels, formData.photo?.name || 'profile.jpg');
      setFormData(prev => ({ ...prev, photo: croppedImageFile }));
      setImagePreview(URL.createObjectURL(croppedImageFile));
      setShowCropModal(false);
    } catch (error) {
      console.error('Error cropping image:', error);
      setErrors(prev => ({ ...prev, photo: 'Failed to crop image.' }));
    }
  }, [imagePreview, croppedAreaPixels, formData.photo]);

  const handleFile = (e, field) => {
    const files = Array.from(e.target.files);
    if (field === 'photo') {
      const file = files[0];
      if (file) {
        setFormData(prev => ({ ...prev, photo: file }));
        setImagePreview(URL.createObjectURL(file));
        setShowCropModal(true);
        setErrors(prev => ({ ...prev, photo: '' }));
      }
    } else if (field === 'certificates') {
      if (files.length + formData.certificates.length > 5) {
        setErrors(prev => ({ ...prev, certificates: 'You can upload up to 5 certificates.' }));
        return;
      }
      setFormData(prev => ({ ...prev, certificates: [...prev.certificates, ...files] }));
      setCertificatePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
      setErrors(prev => ({ ...prev, certificates: '' }));
    } else if (field === 'officePhotos') {
      if (files.length + formData.officePhotos.length > 5) {
        setErrors(prev => ({ ...prev, officePhotos: 'You can upload up to 5 office photos.' }));
        return;
      }
      setFormData(prev => ({ ...prev, officePhotos: [...prev.officePhotos, ...files] }));
      setOfficePhotoPreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
      setErrors(prev => ({ ...prev, officePhotos: '' }));
    }
  };

  const removeFile = (index, field) => {
    if (field === 'certificates') {
      setFormData(prev => ({
        ...prev,
        certificates: prev.certificates.filter((_, i) => i !== index),
      }));
      setCertificatePreviews(prev => prev.filter((_, i) => i !== index));
    } else if (field === 'officePhotos') {
      setFormData(prev => ({
        ...prev,
        officePhotos: prev.officePhotos.filter((_, i) => i !== index),
      }));
      setOfficePhotoPreviews(prev => prev.filter((_, i) => i !== index));
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
    if (values.length > 5 && field !== 'services' && field !== 'certifications') {
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
    setFormData(prev => ({ ...prev, [key]: updated.length > 0 ? updated : (key === 'services' ? [] : ['']) }));
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
  const validateWebsite = website => !website || /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(website);

  const validateDateOfBirth = date => {
    if (!date) return true; // Optional now
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

  const validateForm = () => {
    const newErrors = {};
    const { profileType } = formData;

    // Step 1 check
    ['fullName', 'email', 'phone'].forEach(field => {
      if (!formData[field]?.trim()) newErrors[field] = 'This field is required';
    });
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.languages.length) newErrors.languages = 'At least one language is required';

    // Step 2 check
    if (!formData.services.length) newErrors.services = 'At least one service is required';
    if (!formData.regions.length) newErrors.regions = 'At least one region is required';
    if (!formData.expertise.length) newErrors.expertise = 'At least one expertise area is required';

    // Step 3 check
    ['username', 'responseTime', 'pricing'].forEach(field => {
        if (!formData[field]?.trim()) newErrors[field] = 'This field is required';
    });
    if (profileType === 'expert') {
      if (formData.dateOfBirth && !validateDateOfBirth(formData.dateOfBirth)) {
        newErrors.dateOfBirth = 'Invalid date of birth. Must be at least 18 years old.';
      }
      if (!formData.experience.length || formData.experience.some(exp => !exp.title.trim() || !exp.company.trim())) {
        newErrors.experience = 'All experience fields (title, company) are required';
      }
      const dateError = validateExperienceDates(formData.experience);
      if (dateError) newErrors.experience = dateError;
      if (!formData.certifications.length) newErrors.certifications = 'At least one certification tag is required';
    } else {
      if (!formData.registeredAddress.trim()) newErrors.registeredAddress = 'Registered address is required';
      if (!formData.employeeCount.trim()) newErrors.employeeCount = 'Number of employees is required';
      if (!profileId && !formData.officePhotos.length) newErrors.officePhotos = 'At least one office photo is required';
    }

    if (!formData.tagline?.trim()) newErrors.tagline = 'This field is required';
    if (!formData.about?.trim()) newErrors.about = 'This field is required';
    if (!profileId && !formData.photo) newErrors.photo = 'Profile photo is required';
    if (!agreed) newErrors.agreed = 'You must agree to the terms';

    if (formData.email && !validateEmail(formData.email)) newErrors.email = 'Invalid email address';
    if (formData.phone && !validatePhone(formData.phone)) newErrors.phone = 'Invalid phone number';
    if (formData.username && !validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters, start with a letter, and contain only letters, numbers, or underscores';
    }
    if (usernameStatus === 'Username is already taken') newErrors.username = 'Username is already taken';

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return Object.keys(newErrors).length === 0;
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
      services: [],
      regions: [],
      expertise: [],
      experience: [{ title: '', company: '', startDate: null, endDate: null }],
      certifications: [],
      licenseNumber: '',
      referred: 'No',
      referralCode: '',
      certificates: [],
      officePhotos: [],
      registeredAddress: '',
      website: '',
      employeeCount: '',
    });
    setImagePreview(null);
    setCertificatePreviews([]);
    setOfficePhotoPreviews([]);
    setShowCropModal(false);
    setErrors({});
    setAgreed(false);
    setOriginalProfile(null);
    setSavedProfileId(null);
    setUsernameStatus('');
    setReferralCodeStatus('');
    setReferrerUsername('');
    setSelectedExpertise(null);
    setApiError('');
    setIsMainDescriptionExpanded(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const sanitizedFullName = formData.fullName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

      let photoURL = profileId && originalProfile ? originalProfile.photo : '';
      let certificateURLs = profileId && originalProfile ? [...originalProfile.certificates] : [];
      let officePhotoURLs = profileId && originalProfile ? [...originalProfile.officePhotos] : [];

      if (formData.photo && typeof formData.photo !== 'string') {
        const timestamp = Date.now();
        const fileExtension = formData.photo.name.split('.').pop();
        const fileName = `profile_${sanitizedFullName}_${timestamp}.${fileExtension}`;
        const storageRef = ref(storage, `Profiles/${fileName}`);
        await uploadBytes(storageRef, formData.photo);
        photoURL = await getDownloadURL(storageRef);
      }

      if (formData.certificates.length > 0) {
        for (const cert of formData.certificates) {
          if (typeof cert === 'string') {
            if (!certificateURLs.includes(cert)) certificateURLs.push(cert);
            continue;
          }
          const certName = `certificate_${sanitizedFullName}_${Date.now()}_${cert.name}`;
          const certRef = ref(storage, `Certificates/${certName}`);
          await uploadBytes(certRef, cert);
          const url = await getDownloadURL(certRef);
          if (!certificateURLs.includes(url)) certificateURLs.push(url);
        }
      }

      if (formData.officePhotos.length > 0) {
        for (const photo of formData.officePhotos) {
          if (typeof photo === 'string') {
            if (!officePhotoURLs.includes(photo)) officePhotoURLs.push(photo);
            continue;
          }
          const photoName = `office_${sanitizedFullName}_${Date.now()}_${photo.name}`;
          const photoRef = ref(storage, `OfficePhotos/${photoName}`);
          await uploadBytes(photoRef, photo);
          const url = await getDownloadURL(photoRef);
          if (!officePhotoURLs.includes(url)) officePhotoURLs.push(url);
        }
      }

      const profileData = {
        profileType: formData.profileType,
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.profileType === 'expert' && formData.dateOfBirth ? formatDate(formData.dateOfBirth, 'YYYY-MM-DD') : '',
        yearsActive: formData.yearsActive || '',
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
        certifications: formData.certifications,
        licenseNumber: formData.licenseNumber,
        referred: formData.referred || 'No',
        referralCode: formData.referred === 'Yes' ? formData.referralCode : '',
        certificates: certificateURLs,
        officePhotos: officePhotoURLs,
        registeredAddress: formData.registeredAddress,
        website: formData.website,
        employeeCount: formData.employeeCount,
      };

      const response = await fetch('/api/send-profile-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profileData, profileId }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to submit profile');

      setSavedProfileId(result.profileId);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        resetForm();
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
      alert(error.message || 'Failed to submit profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-[#F4D35E] min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-9xl bg-white rounded-3xl shadow-2xl overflow-hidden mt-20 relative">
          
          <div className="bg-gray-50 border-b border-gray-100 p-6 md:p-8">
             <div className="flex justify-between items-center mb-6">
                <Image src="/emailbanner.jpeg" alt="Logo" width={200} height={40} className="object-contain" />
                <div className="flex bg-gray-200 rounded-lg p-1">
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, profileType: 'expert' }))} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${formData.profileType === 'expert' ? 'bg-white shadow text-[var(--primary)]' : 'text-gray-500 hover:text-gray-700'}`}>Expert</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, profileType: 'agency' }))} className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${formData.profileType === 'agency' ? 'bg-white shadow text-[var(--primary)]' : 'text-gray-500 hover:text-gray-700'}`}>Agency</button>
                </div>
             </div>
             <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--primary)] mb-3">
              {formData.profileType === 'expert' ? 'Join as an Expert' : 'Partner as an Agency'}
            </h1>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl">
                {profileWriteUps[formData.profileType]}
            </p>
          </div>

          {!profileId && (
            <div className="bg-[var(--primary)] p-6 md:p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="text-yellow-400 w-5 h-5 animate-pulse" />
                            <span className="text-yellow-400 font-bold text-sm uppercase tracking-wider">AI Fast Track</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Auto-fill with Resume</h3>
                        <p className="text-white/80 text-sm">Upload your CV/Resume (PDF/DOCX) and let our AI populate your profile instantly.</p>
                    </div>
                    <label className={`cursor-pointer bg-white text-[var(--primary)] px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 ${isParsingResume ? 'opacity-75 pointer-events-none' : ''}`}>
                        {isParsingResume ? <Loader2 className="animate-spin w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        <span>{isParsingResume ? 'Analyzing...' : 'Upload Resume'}</span>
                        <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleResumeUpload} className="hidden" disabled={isParsingResume} />
                    </label>
                </div>
            </div>
          )}

          <div className="p-6 md:p-10 space-y-12">
            {apiError && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{apiError}</p>
              </div>
            )}

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative group hover:shadow-md transition-shadow">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--primary)] rounded-l-2xl"></div>
               <Step1_BasicInfo
                formData={formData}
                errors={errors}
                handleChange={handleChange}
                handleSingleChange={handleSingleChange}
                handleMultiChange={handleMultiChange}
                cityOptions={cityOptions}
                setCityOptions={setCityOptions}
                languageOptions={languageOptions}
                profileId={profileId}
                fetchLeadByPhone={fetchLeadByPhone}
                setFormData={setFormData}
                setErrors={setErrors}
              />
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative group hover:shadow-md transition-shadow">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 rounded-l-2xl"></div>
               <Step2_Services
                formData={formData}
                errors={errors}
                setFormData={setFormData}
                setErrors={setErrors}
                handleMultiChange={handleMultiChange}
              />
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative group hover:shadow-md transition-shadow">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500 rounded-l-2xl"></div>
               <Step3_Experience
                formData={formData}
                errors={errors}
                handleExperienceChange={handleExperienceChange}
                removeExperience={removeExperience}
                addExperience={addExperience}
                handleChange={handleChange}
                handleFile={handleFile}
                removeFile={removeFile}
                imagePreview={imagePreview}
                certificatePreviews={certificatePreviews}
                officePhotoPreviews={officePhotoPreviews}
                agreed={agreed}
                setAgreed={setAgreed}
                referralCodeStatus={referralCodeStatus}
                profileId={profileId}
                setShowCropModal={setShowCropModal}
                usernameStatus={usernameStatus}
                handleMultiChange={handleMultiChange}
              />
            </section>

            <div className="pt-6">
                <button type="button" onClick={handleSubmit} disabled={isSubmitting} className={`w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-all transform hover:-translate-y-1 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[var(--primary)] to-purple-800 hover:shadow-xl'}`}>
                  {isSubmitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> Submitting...</span> : <span>{profileId ? 'Update Profile' : 'Submit Application'}</span>}
                </button>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 text-center max-w-md w-full shadow-2xl transform scale-100 transition-transform">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-600" /></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">🎉 Application Received!</h2>
            <p className="text-gray-600 mb-8 text-sm leading-relaxed">Your profile has been successfully {profileId ? 'updated' : 'submitted'}. Our team will review your details and get back to you shortly.</p>
            <button onClick={() => { setShowSuccessModal(false); resetForm(); router.push('/'); }} className="w-full py-3 rounded-xl text-white font-bold bg-[var(--primary)] hover:bg-opacity-90 transition shadow-lg">Go to Home</button>
          </div>
        </div>
      )}

      {showCropModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Adjust Photo</h3>
            <div className="relative w-full h-72 bg-gray-100 rounded-xl overflow-hidden mb-6">
              <Cropper image={imagePreview} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} cropShape="round" showGrid={true} style={{ containerStyle: { height: '100%', width: '100%' } }} />
            </div>
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Zoom</label>
                    <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="w-full accent-[var(--primary)]" />
                </div>
                <div className="flex gap-3">
                    <button type="button" className="flex-1 py-3 text-gray-700 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition" onClick={() => { setShowCropModal(false); setImagePreview(originalProfile?.photo || null); setFormData(prev => ({ ...prev, photo: null })); }}>Cancel</button>
                    <button type="button" className="flex-1 py-3 text-white bg-[var(--primary)] rounded-xl font-semibold hover:bg-opacity-90 transition shadow-md" onClick={handleCropConfirm}>Save Crop</button>
                </div>
            </div>
          </div>
        </div>
      )}
      <div className="-mt-20 relative z-0"><Footer /></div>
    </>
  );
}
