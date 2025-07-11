
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getFirestore, query, collection, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import _ from "lodash";

// Dynamically import react-select with SSR disabled
const Select = dynamic(() => import("react-select"), { ssr: false });

const db = getFirestore(app);

const expertiseOptions = [
  { value: "Visa and Documentation Services", label: "Visa and Documentation Services" },
  { value: "Air/Flight Ticketing and Management", label: "Air/Flight Ticketing and Management" },
  { value: "Transfer and Car Rentals", label: "Transfer and Car Rentals" },
  { value: "Holiday Packages", label: "Holiday Packages" },
  { value: "Hotel Bookings", label: "Hotel Bookings" },
  { value: "MICE Logistics Arrangements", label: "MICE Logistics Arrangements" },
  { value: "FRRO Assistance", label: "FRRO Assistance" },
  { value: "Luxury Cruise Trip Planning", label: "Luxury Cruise Trip Planning" },
];

export default function EditProfileForm({ initialData, onSave }) {
  const [formData, setFormData] = useState({
    username: initialData.username || "",
    fullName: initialData.fullName || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    dateOfBirth: initialData.dateOfBirth || null,
    tagline: initialData.tagline || "",
    location: initialData.location || "",
    languages: Array.isArray(initialData.languages) ? initialData.languages : [],
    responseTime: initialData.responseTime || "",
    pricing: initialData.pricing || "",
    about: initialData.about || "",
    photo: initialData.photo || null,
    services: Array.isArray(initialData.services) && initialData.services.filter(s => typeof s === "string" && s.trim()).length > 0 ? initialData.services : [""],
    regions: Array.isArray(initialData.regions) && initialData.regions.length ? initialData.regions : [],
    expertise: Array.isArray(initialData.expertise) ? initialData.expertise : [],
    experience: Array.isArray(initialData.experience) && initialData.experience.length
      ? initialData.experience
      : [{ title: "", company: "", startDate: null, endDate: null }],
    certifications: initialData.certifications || "",
    referred: initialData.referred || "No",
    referralCode: initialData.referralCode || "",
    generatedReferralCode: initialData.generatedReferralCode || "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [referrerName, setReferrerName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [cityOptions, setCityOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [selectedExpertise, setSelectedExpertise] = useState(null);
  const [apiError, setApiError] = useState("");
  const [agreed, setAgreed] = useState(true); // Default to true for editing
  const router = useRouter();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch("/api/cities");
        if (!response.ok) {
          throw new Error(`Failed to fetch cities: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response format from cities API");
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setCityOptions(data);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setApiError(`Failed to load city options: ${error.message}. Please try again later.`);
      }
    };

    const fetchLanguages = async () => {
      try {
        const response = await fetch("/api/languages");
        if (!response.ok) {
          throw new Error(`Failed to fetch languages: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response format from languages API");
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setLanguageOptions(data);
      } catch (error) {
        console.error("Error fetching languages:", error);
        setApiError(`Failed to load language options: ${error.message}. Please try again later.`);
      }
    };

    fetchCities();
    fetchLanguages();
  }, []);

  useEffect(() => {
    const fetchReferrer = async () => {
      if (formData.referred === "Yes" && formData.referralCode) {
        try {
          const profilesQuery = query(
            collection(db, "Profiles"),
            where("generatedReferralCode", "==", formData.referralCode)
          );
          const profilesSnap = await getDocs(profilesQuery);
          if (!profilesSnap.empty) {
            const referrerProfile = profilesSnap.docs[0].data();
            setReferrerName(referrerProfile.fullName || "Unknown Referrer");
          } else {
            setReferrerName("Invalid Referral Code");
            setErrors(prev => ({ ...prev, referralCode: "Invalid referral code" }));
          }
        } catch (error) {
          console.error("Error fetching referrer name:", error);
          setReferrerName("Error checking referral code");
          setErrors(prev => ({ ...prev, referralCode: "Error checking referral code" }));
        }
      } else {
        setReferrerName("");
      }
    };
    fetchReferrer();
  }, [formData.referred, formData.referralCode]);

  const checkUsernameAvailability = useCallback(
    _.debounce(async (username) => {
      if (!username || username === initialData.username) {
        setUsernameStatus("");
        setErrors((prev) => ({ ...prev, username: "" }));
        return;
      }
      try {
        const profilesQuery = query(collection(db, "Profiles"), where("username", "==", username));
        const profileRequestsQuery = query(collection(db, "ProfileRequests"), where("username", "==", username));
        const [profilesSnap, profileRequestsSnap] = await Promise.all([
          getDocs(profilesQuery),
          getDocs(profileRequestsQuery),
        ]);
        if (!profilesSnap.empty || !profileRequestsSnap.empty) {
          setUsernameStatus("Username is already taken");
          setErrors((prev) => ({ ...prev, username: "Username is already taken" }));
        } else {
          setUsernameStatus("Username is available");
          setErrors((prev) => ({ ...prev, username: "" }));
        }
      } catch (error) {
        console.error("Error checking usernames:", error);
        setUsernameStatus("Error checking username");
        setErrors((prev) => ({ ...prev, username: "Error checking username" }));
      }
    }, 500),
    [initialData.username]
  );

  useEffect(() => {
    const isEqual = _.isEqual(formData, {
      ...initialData,
      services: Array.isArray(initialData.services) && initialData.services.filter(s => typeof s === "string" && s.trim()).length > 0 ? initialData.services : [""],
      regions: Array.isArray(initialData.regions) && initialData.regions.length ? initialData.regions : [],
      expertise: Array.isArray(initialData.expertise) ? initialData.expertise : [],
      experience: Array.isArray(initialData.experience) && initialData.experience.length
        ? initialData.experience
        : [{ title: "", company: "", startDate: null, endDate: null }],
    });
    setHasChanges(!isEqual);
  }, [formData, initialData]);

  const fetchLeadByPhone = async (phone) => {
    if (!phone || phone.length < 6) return;
    try {
      const leadsQuery = query(collection(db, "JoinQueries"), where("phone", "==", phone));
      const querySnapshot = await getDocs(leadsQuery);
      if (!querySnapshot.empty) {
        const leads = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        }));
        const mostRecentLead = leads.sort((a, b) => b.timestamp - a.timestamp)[0];
        setFormData((prev) => ({
          ...prev,
          fullName: mostRecentLead.name || prev.fullName,
          email: mostRecentLead.email || prev.email,
          phone,
        }));
        setErrors((prev) => ({ ...prev, fullName: "", email: "", phone: "" }));
      }
    } catch (error) {
      console.error("Error fetching lead by phone:", error);
      setErrors((prev) => ({ ...prev, phone: "Failed to fetch lead data." }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "tagline" && value.length > 150) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "username") {
      checkUsernameAvailability(value);
    }
    if (name === "referred" && value === "No") {
      setFormData((prev) => ({ ...prev, referralCode: "", referred: "No" }));
      setReferrerName("");
      setErrors((prev) => ({ ...prev, referralCode: "" }));
    }
  };

  const handlePhoneChange = (phone) => {
    setFormData((prev) => ({ ...prev, phone }));
    setErrors((prev) => ({ ...prev, phone: "" }));
    fetchLeadByPhone(phone);
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
    setErrors((prev) => ({ ...prev, photo: "" }));
  };

  const handleSingleChange = (selectedOption, field) => {
    const value = selectedOption ? selectedOption.value : "";
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleMultiChange = (selectedOptions, field) => {
    const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
    if (values.length > 5) {
      setErrors((prev) => ({ ...prev, [field]: `You can select up to 5 ${field}.` }));
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: values }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleExpertiseChange = (selectedOption) => {
    setSelectedExpertise(selectedOption);
  };

  const addExpertise = () => {
    if (selectedExpertise && formData.expertise.length < 5 && !formData.expertise.includes(selectedExpertise.value)) {
      setFormData((prev) => ({ ...prev, expertise: [...prev.expertise, selectedExpertise.value] }));
      setSelectedExpertise(null);
      setErrors((prev) => ({ ...prev, expertise: "" }));
    } else if (formData.expertise.length >= 5) {
      setErrors((prev) => ({ ...prev, expertise: "You can add up to 5 expertise areas." }));
    } else if (selectedExpertise && formData.expertise.includes(selectedExpertise.value)) {
      setErrors((prev) => ({ ...prev, expertise: "This expertise is already added." }));
    } else {
      setErrors((prev) => ({ ...prev, expertise: "Please select an expertise." }));
    }
  };

  const removeExpertise = (expertise) => {
    setFormData((prev) => ({ ...prev, expertise: prev.expertise.filter((e) => e !== expertise) }));
    setErrors((prev) => ({ ...prev, expertise: "" }));
  };

  const handleArrayChange = (index, key, value) => {
    const updated = [...formData[key]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [key]: updated }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const addField = (key) => {
    setFormData((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  };

  const removeField = (key, index) => {
    const updated = formData[key].filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, [key]: updated.length > 0 ? updated : [""] }));
  };

  const handleExperienceChange = (index, field, value) => {
    const updated = [...formData.experience];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, experience: updated }));
    setErrors((prev) => ({ ...prev, experience: "" }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [...prev.experience, { title: "", company: "", startDate: null, endDate: null }],
    }));
  };

  const removeExperience = (index) => {
    const updated = formData.experience.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      experience: updated.length > 0 ? updated : [{ title: "", company: "", startDate: null, endDate: null }],
    }));
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
      if (!startDate) return "Start date is required";
      if (!endDate) return "End date is required";
      if (startDate > today) return "Start date cannot be in the future";
      if (endDate !== "Present") {
        if (!endDate) return "End date is required";
        if (endDate < startDate) return "End date must be after start date";
        if (endDate > today) return "End date cannot be in the future";
      }
    }
    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    ["username", "fullName", "email", "phone", "tagline", "location", "responseTime", "pricing", "about", "certifications"].forEach(
      (field) => {
        if (!formData[field]?.trim()) newErrors[field] = "This field is required";
      }
    );
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.languages.length) newErrors.languages = "At least one language is required";
    if (formData.email && !validateEmail(formData.email)) newErrors.email = "Invalid email address";
    if (formData.phone && !validatePhone(formData.phone)) newErrors.phone = "Invalid phone number";
    if (formData.username && !validateUsername(formData.username)) {
      newErrors.username = "Username must be 3-20 characters, start with a letter, and contain only letters, numbers, or underscores";
    }
    if (formData.dateOfBirth && !validateDateOfBirth(formData.dateOfBirth)) {
      newErrors.dateOfBirth = "Invalid date of birth. Must be at least 18 years old and not in the future.";
    }
    if (!formData.services.length || formData.services.some((s) => s == null || typeof s !== "string" || !s.trim())) {
      newErrors.services = "At least one valid service is required";
    }
    if (!formData.regions.length) newErrors.regions = "At least one region is required";
    if (!formData.expertise.length) newErrors.expertise = "At least one expertise area is required";
    if (formData.expertise.length > 5) newErrors.expertise = "You can add up to 5 expertise areas";
    if (
      !formData.experience.length ||
      formData.experience.some((exp) => !exp.title?.trim() || !exp.company?.trim())
    ) {
      newErrors.experience = "Title and company are required for each experience";
    }
    const dateError = validateExperienceDates(formData.experience);
    if (dateError) newErrors.experience = dateError;
    if (formData.referred === "Yes" && !formData.referralCode?.trim()) {
      newErrors.referralCode = "Referral code is required if referred";
    }
    if (formData.referred === "Yes" && referrerName === "Invalid Referral Code") {
      newErrors.referralCode = "Invalid referral code";
    }
    if (formData.username !== initialData.username && usernameStatus !== "Username is available") {
      newErrors.username = "Please choose an available username";
    }
    if (!agreed) newErrors.agreed = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!hasChanges) {
      setErrors((prev) => ({ ...prev, submit: "No changes to save." }));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push(`/experts/${formData.username}`);
      }, 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrors((prev) => ({ ...prev, submit: error.message || "Failed to save profile. Please try again." }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 md:p-4 bg-[#F4D35E]">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 md:p-10">
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full shadow-xl">
              <h2 className="text-xl font-semibold text-[var(--primary)] mb-3">
                🎉 Profile Updated!
              </h2>
              <p className="text-gray-700 mb-6 text-sm">
                Your expert profile has been successfully updated.<br />
                Changes have been saved.
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push(`/experts/${formData.username}`);
                }}
                className="px-6 py-2 rounded-full text-white bg-[var(--primary)] hover:bg-green-700 transition"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
              {apiError}
            </div>
          )}
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-[var(--primary)]">👤 Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter username (e.g., travelwithjohn)"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.username ? "border-red-500" : ""}`}
                  value={formData.username}
                  onChange={handleChange}
                />
                {usernameStatus && (
                  <p className={`text-sm mt-1 ${usernameStatus === "Username is available" ? "text-green-600" : "text-red-600"}`}>
                    {usernameStatus}
                  </p>
                )}
                {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username}</p>}
                <p className="text-sm text-gray-500 mt-1">e.g., travelwithjohn</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter full name (e.g., John Doe)"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.fullName ? "border-red-500" : ""}`}
                  value={formData.fullName}
                  onChange={handleChange}
                />
                <p className="text-sm text-gray-500 mt-1">e.g., John Doe</p>
                {errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>}
              </div>
              <div className="row-span-2 flex flex-col items-center justify-center">
                {formData.photo && typeof formData.photo === "string" && (
                  <Image
                    src={formData.photo}
                    width={150}
                    height={150}
                    alt="Profile"
                    className="w-32 h-32 object-cover rounded-full mb-2 shadow-lg"
                  />
                )}
                <input
                  type="file"
                  className={`w-full border rounded-xl px-2 py-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.photo ? "border-red-500" : ""}`}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png"
                />
                <p className="text-sm text-gray-500 mt-1">Upload a professional photo (JPG, PNG)</p>
                {errors.photo && <p className="text-sm text-red-600 mt-1">{errors.photo}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email (e.g., john@example.com)"
                  className={`w-full px-4 py-3 border rounded-xl bg-gray-100 cursor-not-allowed focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.email ? "border-red-500" : ""}`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">e.g., john@example.com</p>
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <DatePicker
                  selected={formData.dateOfBirth}
                  onChange={(date) => {
                    setFormData((prev) => ({ ...prev, dateOfBirth: date }));
                    setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
                  }}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select date of birth (YYYY-MM-DD)"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.dateOfBirth ? "border-red-500" : ""}`}
                  maxDate={new Date()}
                  showYearDropdown
                  yearDropdownItemNumber={100}
                  scrollableYearDropdown
                />
                <p className="text-sm text-gray-500 mt-1">e.g., 1990-01-01</p>
                {errors.dateOfBirth && <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input
                  type="text"
                  name="tagline"
                  placeholder="Enter tagline (e.g., Europe Travel Expert)"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.tagline ? "border-red-500" : ""}`}
                  value={formData.tagline}
                  onChange={handleChange}
                  maxLength={150}
                />
                <p className="text-sm text-gray-500 mt-1">e.g., Europe Travel Expert (max 150 characters)</p>
                {errors.tagline && <p className="text-sm text-red-600 mt-1">{errors.tagline}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <Select
                  instanceId="location-select"
                  options={cityOptions}
                  value={cityOptions.find(option => option.value === formData.location) || null}
                  onChange={selected => handleSingleChange(selected, "location")}
                  placeholder="Select a location (e.g., Mumbai, India)"
                  className={`w-full ${errors.location ? "border-red-500" : ""}`}
                  classNamePrefix="react-select"
                  isDisabled={cityOptions.length === 0}
                  isSearchable={true}
                  onInputChange={inputValue => {
                    if (inputValue) {
                      fetch(`/api/cities?search=${encodeURIComponent(inputValue)}`)
                        .then(res => {
                          if (!res.ok) throw new Error(`Failed to fetch cities: ${res.status}`);
                          return res.json();
                        })
                        .then(data => setCityOptions(data))
                        .catch(err => {
                          console.error("Error fetching cities:", err);
                          setApiError("Failed to fetch city options. Please try again.");
                        });
                    }
                  }}
                />
                {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
                <p className="text-sm text-gray-500 mt-1">Select a location (e.g., Mumbai, India)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                <Select
                  instanceId="language-select"
                  isMulti
                  options={languageOptions}
                  value={languageOptions.filter(option => formData.languages.includes(option.value))}
                  onChange={selected => handleMultiChange(selected, "languages")}
                  placeholder="Select up to 5 languages (e.g., English, Hindi)"
                  className={`w-full ${errors.languages ? "border-red-500" : ""}`}
                  classNamePrefix="react-select"
                  isDisabled={languageOptions.length === 0}
                />
                {errors.languages && <p className="text-sm text-red-600 mt-1">{errors.languages}</p>}
                <p className="text-sm text-gray-500 mt-1">Select up to 5 languages (e.g., English, Hindi)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Response Time</label>
                <input
                  type="text"
                  name="responseTime"
                  placeholder="Enter response time (e.g., Within 12 hours)"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.responseTime ? "border-red-500" : ""}`}
                  value={formData.responseTime}
                  onChange={handleChange}
                />
                <p className="text-sm text-gray-500 mt-1">e.g., Within 12 hours</p>
                {errors.responseTime && <p className="text-sm text-red-600 mt-1">{errors.responseTime}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pricing</label>
                <input
                  type="text"
                  name="pricing"
                  placeholder="Enter pricing (e.g., ₹2000/session)"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.pricing ? "border-red-500" : ""}`}
                  value={formData.pricing}
                  onChange={handleChange}
                />
                <p className="text-sm text-gray-500 mt-1">e.g., ₹2000/session or $30/consult</p>
                {errors.pricing && <p className="text-sm text-red-600 mt-1">{errors.pricing}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
              <textarea
                name="about"
                placeholder="Enter about me (e.g., 10+ years guiding travellers across Europe)"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.about ? "border-red-500" : ""}`}
                rows="4"
                value={formData.about}
                onChange={handleChange}
              ></textarea>
              <p className="text-sm text-gray-500 mt-1">Provide a brief overview of your expertise and experience</p>
              {errors.about && <p className="text-sm text-red-600 mt-1">{errors.about}</p>}
            </div>
          </div>

          {/* Services & Regions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[var(--primary)]">🎯 Services, Expertise & Regions</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What I Can Help You With</label>
              {formData.services.map((service, index) => (
                <div key={index} className="flex gap-2 items-center mb-2">
                  <input
                    type="text"
                    className={`w-full px-4 py-2 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.services ? "border-red-500" : ""}`}
                    placeholder="Enter service (e.g., Visa Documentation)"
                    value={service}
                    onChange={(e) => handleArrayChange(index, "services", e.target.value)}
                  />
                  {formData.services.length > 1 && (
                    <button
                      type="button"
                      className="text-red-500 text-sm hover:text-red-700"
                      onClick={() => removeField("services", index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField("services")}
                className="text-sm text-[var(--primary)] hover:underline mt-2"
              >
                + Add More
              </button>
              {errors.services && <p className="text-sm text-red-600 mt-1">{errors.services}</p>}
              <p className="text-sm text-gray-500 mt-1">e.g., Visa Documentation, Itinerary Planning</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expertise Areas (Up to 5)</label>
              <div className="flex gap-2 mb-2">
                <Select
                  instanceId="expertise-select"
                  options={expertiseOptions}
                  value={selectedExpertise}
                  onChange={handleExpertiseChange}
                  placeholder="Select expertise area"
                  className={`w-full ${errors.expertise ? "border-red-500" : ""}`}
                  classNamePrefix="react-select"
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:bg-green-700"
                  onClick={addExpertise}
                  disabled={!selectedExpertise}
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.expertise.map((exp) => (
                  <span
                    key={exp}
                    className="bg-[var(--primary)] text-white px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    {exp}
                    <button
                      type="button"
                      className="ml-2 text-white"
                      onClick={() => removeExpertise(exp)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              {errors.expertise && <p className="text-sm text-red-600 mt-1">{errors.expertise}</p>}
              <p className="text-sm text-gray-500 mt-1">Select up to 5 expertise areas (e.g., Visa Documentation)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Regions You Specialize In</label>
              <select
                multiple
                className={`w-full px-4 py-3 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.regions ? "border-red-500" : ""}`}
                value={formData.regions}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions).map((o) => o.value);
                  if (options.length > 5) {
                    setErrors((prev) => ({ ...prev, regions: "You can select up to 5 regions." }));
                    return;
                  }
                  setFormData((prev) => ({ ...prev, regions: options }));
                  setErrors((prev) => ({ ...prev, regions: "" }));
                }}
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
              <p className="text-sm text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select up to 5 regions</p>
              {errors.regions && <p className="text-sm text-red-600 mt-1">{errors.regions}</p>}
            </div>
          </div>

          {/* Experience & Credentials */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[var(--primary)]">📚 Experience & Credentials</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              {formData.experience.map((exp, index) => (
                <div key={index} className="space-y-2 mb-4 border p-4 rounded-xl bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Enter job title (e.g., Travel Consultant)"
                        className={`w-full px-4 py-2 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.experience ? "border-red-500" : ""}`}
                        value={exp.title}
                        onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Enter company (e.g., MakeMyTrip)"
                        className={`w-full px-4 py-2 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.experience ? "border-red-500" : ""}`}
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                      />
                    </div>
                    <div>
                      <DatePicker
                        selected={exp.startDate}
                        onChange={(date) => handleExperienceChange(index, "startDate", date)}
                        dateFormat="yyyy-MM"
                        placeholderText="Select start date (YYYY-MM)"
                        className={`w-full px-4 py-2 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.experience ? "border-red-500" : ""}`}
                        maxDate={new Date()}
                        showMonthYearPicker
                      />
                      <p className="text-sm text-gray-500 mt-1">e.g., 2020-01</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DatePicker
                        selected={exp.endDate !== "Present" ? exp.endDate : null}
                        onChange={(date) => handleExperienceChange(index, "endDate", date)}
                        dateFormat="yyyy-MM"
                        placeholderText="Select end date (YYYY-MM)"
                        className={`w-full px-4 py-2 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.experience ? "border-red-500" : ""}`}
                        maxDate={new Date()}
                        showMonthYearPicker
                        disabled={exp.endDate === "Present"}
                      />
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={exp.endDate === "Present"}
                          onChange={(e) => handleExperienceChange(index, "endDate", e.target.checked ? "Present" : null)}
                        />
                        Present
                      </label>
                    </div>
                  </div>
                  {formData.experience.length > 1 && (
                    <button
                      type="button"
                      className="text-red-500 text-sm hover:text-red-700"
                      onClick={() => removeExperience(index)}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addExperience}
                className="text-sm text-[var(--primary)] hover:underline mt-2"
              >
                + Add Experience
              </button>
              {errors.experience && <p className="text-sm text-red-600 mt-1">{errors.experience}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
              <input
                type="text"
                name="certifications"
                placeholder="Enter certifications (e.g., Aussie Specialist, VisitBritain)"
                className={`w-full px-4 py-2 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.certifications ? "border-red-500" : ""}`}
                value={formData.certifications}
                onChange={handleChange}
              />
              <p className="text-sm text-gray-500 mt-1">e.g., Aussie Specialist, VisitBritain, Fremden Visa Coach</p>
              {errors.certifications && <p className="text-sm text-red-600 mt-1">{errors.certifications}</p>}
            </div>
          </div>

          {/* Referral Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-[var(--primary)]">🤝 Referral Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Were you referred by someone?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="referred"
                    value="Yes"
                    checked={formData.referred === "Yes"}
                    onChange={handleChange}
                    className={`${errors.referred ? "ring-2 ring-red-500" : ""}`}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="referred"
                    value="No"
                    checked={formData.referred === "No"}
                    onChange={handleChange}
                    className={`${errors.referred ? "ring-2 ring-red-500" : ""}`}
                  />
                  No
                </label>
              </div>
              {errors.referred && <p className="text-sm text-red-600 mt-1">{errors.referred}</p>}
            </div>
            {formData.referred === "Yes" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referral Code</label>
                <input
                  type="text"
                  name="referralCode"
                  placeholder="Enter referral code"
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-[var(--primary)] focus:border-[var(--primary)] ${errors.referralCode ? "border-red-500" : ""}`}
                  value={formData.referralCode}
                  onChange={handleChange}
                />
                {referrerName && (
                  <p className={`text-sm mt-1 ${referrerName === "Invalid Referral Code" ? "text-red-600" : "text-green-600"}`}>
                    {referrerName === "Invalid Referral Code" ? "Invalid referral code" : `Referred by ${referrerName}`}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  A verification call might be made to your referrer to confirm your recommendation.
                </p>
                {errors.referralCode && <p className="text-sm text-red-600 mt-1">{errors.referralCode}</p>}
              </div>
            )}
            {formData.referred === "No" && (
              <p className="text-sm text-gray-700 mt-2">
                Your profile approval may take a little longer. A short interview might be scheduled before activation.
              </p>
            )}
          </div>

          {/* Final Declaration */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-1">Final Declaration</label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className={`mt-1 ${errors.agreed ? "ring-2 ring-red-500" : ""}`}
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
              />
              <span>
                I confirm that the information provided is accurate and complies with{" "}
                <strong>Xmytravel Experts&#39;</strong> professional and ethical standards. I also agree to the{" "}
                <Link
                  href="/privacy-policy"
                  className="text-blue-600 underline hover:text-blue-800"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.agreed && <p className="text-sm text-red-600 mt-1">{errors.agreed}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className={`px-6 py-2 text-sm font-semibold text-white rounded-xl ${
                isSubmitting || !hasChanges ? "bg-gray-400 cursor-not-allowed" : "bg-[var(--primary)] hover:bg-green-700"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
          {errors.submit && <p className="text-sm text-red-600 mt-2">{errors.submit}</p>}
        </form>
      </div>
    </div>
  );
}