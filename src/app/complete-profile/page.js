"use client";

import { useState, useRef, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import '@/app/globals.css';
import Link from 'next/link';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; // or 'bootstrap.css' / 'material.css'

const storage = getStorage(app);
const db = getFirestore(app);

export default function CompleteProfile() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    tagline: '',
    location: '',
    languages: '',
    responseTime: '',
    pricing: '',
    about: '',
    photo: null,
    services: [''],
    regions: [],
    experience: [''],
    companies: '',
    certifications: '',
  });
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
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

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\+?[0-9]{7,15}$/.test(phone);

  const validateStep = () => {
    const newErrors = {};

    if (currentStep === 0) {
      ['fullName', 'email', 'phone', 'tagline', 'location', 'languages', 'responseTime', 'pricing', 'about'].forEach(field => {
        if (!formData[field]?.trim()) newErrors[field] = true;
      });
      if (!formData.photo) newErrors.photo = true;

      if (formData.email && !validateEmail(formData.email)) newErrors.email = "Invalid email address";
      if (formData.phone && !validatePhone(formData.phone)) newErrors.phone = "Invalid phone number";
    }

    if (currentStep === 1) {
      if (!formData.services.length || formData.services.some((s) => !s.trim())) {
        newErrors.services = true;
      }
      if (!formData.regions.length) newErrors.regions = true;
    }

    if (currentStep === 2) {
      if (!formData.experience.length || formData.experience.some((e) => !e.trim())) {
        newErrors.experience = true;
      }
      if (!formData.companies.trim()) newErrors.companies = true;
      if (!formData.certifications.trim()) newErrors.certifications = true;
      if (!agreed) newErrors.agreed = true;
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
      fullName: '',
      email: '',
      phone: '',
      tagline: '',
      location: '',
      languages: '',
      responseTime: '',
      pricing: '',
      about: '',
      photo: null,
      services: [''],
      regions: [],
      experience: [''],
      companies: '',
      certifications: '',
    });
    setCurrentStep(0);
    setErrors({});
    setAgreed(false);
  };

 const handleSubmit = async () => {
  if (!validateStep()) return;

  setIsSubmitting(true); // Start loading

  try {
    let photoURL = '';
    if (formData.photo && formData.fullName) {
      const sanitizedFullName = formData.fullName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
      const timestamp = Date.now();
      const fileExtension = formData.photo.name.split('.').pop();
      const fileName = `profile_${timestamp}.${fileExtension}`;
      const storageRef = ref(storage, `Profiles/${sanitizedFullName}/${fileName}`);

      await uploadBytes(storageRef, formData.photo);
      photoURL = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, 'ProfileRequests'), {
      ...formData,
      photo: photoURL,
      timestamp: serverTimestamp(),
    });

    await fetch("/api/send-profile-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      resetForm();
    }, 3000);
  } catch (error) {
    console.error("Submission failed", error);
  } finally {
    setIsSubmitting(false); // Stop loading
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
      <h2 className="text-lg font-semibold text-[var(--primary)] mb-2">🎉 Profile Submitted!</h2>
      <p className="text-gray-700 mb-4 text-sm">
        Your expert profile has been successfully submitted.<br />
        Our team will review the details and reach out if anything more is needed.
      </p>
      <button
        onClick={() => setShowSuccessModal(false)}
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
      <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        className={`px-4 py-3 border rounded-xl w-full ${errors.fullName ? 'border-red-500' : ''}`}
        value={formData.fullName}
        onChange={handleChange}
      />
      <div>
       
        <input
        type="text"
        name="email"
        placeholder="Email"
        className={`px-4 py-3 border rounded-xl w-full ${errors.email ? 'border-red-500' : ''}`}
        value={formData.email}
        onChange={handleChange}
      />
       {errors.email === "Invalid email address" && (
        <p className="text-sm text-red-600 mt-1">Invalid email address</p>
      )}
      </div>
      
      <div>
        
        {/* <input
        type="text"
        name="phone"
        placeholder="Phone"
        className={`px-4 py-3 border rounded-xl w-full ${errors.phone ? 'border-red-500' : ''}`}
        value={formData.phone}
        onChange={handleChange}
      />
      {errors.phone === "Invalid phone number" && (
        <p className="text-sm text-red-600 mt-1">Invalid phone number</p>
      )} */}

      <PhoneInput
          country={"in"}
          value={formData.phone}
         onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
          placeholder="Enter phone number"
          inputProps={{
            id: "phone",
            className: `w-full p-3 border px-12 border-gray-300 rounded-2xl bg-white ${errors.phone ? 'border-red-500' : ''}`,
            required: true,
            autoFocus: false,
          }}
        />

{errors.phone === "Invalid phone number" && (
  <p className="text-sm text-red-600 mt-1">Invalid phone number</p>
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
    </div>

    <textarea
      placeholder="About Me (e.g. 10+ years guiding travelers across Europe)"
      className={`w-full px-4 py-3 border rounded-xl ${errors.about ? 'border-red-500' : ''}`}
      rows="4"
      name="about"
      value={formData.about}
      onChange={handleChange}
    ></textarea>
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
      <button type="button" onClick={() => addField('services')} className="text-sm text-[var(--primary)] mt-2">
        + Add More
      </button>
    </div>

    <div>
      <label className="block mb-2 font-medium text-gray-700">Regions You Specialize In</label>
      <select
        multiple
        className={`w-full px-4 py-3 border rounded-xl ${errors.regions ? 'border-red-500' : ''}`}
        onChange={handleMultiChange}
      >
        {/* region options here */}
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
    </div>
  </div>
)}


        {currentStep === 2 && (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold text-[var(--primary)] mb-4">📚 Experience & Credentials</h2>

    {formData.experience.map((exp, index) => (
      <div key={index} className="flex gap-2 items-center">
        <input
          type="text"
          className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? 'border-red-500' : ''}`}
          placeholder="e.g. 8+ years at MakeMyTrip"
          value={exp}
          onChange={(e) => handleArrayChange(index, 'experience', e.target.value)}
        />
        <button type="button" className="text-red-500" onClick={() => removeField('experience', index)}>✕</button>
      </div>
    ))}
    <button type="button" onClick={() => addField('experience')} className="text-sm text-[var(--primary)] mt-2">
      + Add Experience
    </button>

    <div>
      <input
        type="text"
        name="companies"
        className={`w-full px-4 py-2 border rounded-xl ${errors.companies ? 'border-red-500' : ''}`}
        placeholder="Companies Worked With (comma separated)"
        value={formData.companies}
        onChange={handleChange}
      />
      <p className="text-sm text-gray-500 mt-1">e.g. MakeMyTrip, TravelTriangle, DMCs</p>
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
        <span>
          I confirm that the information provided is accurate and complies with{" "}
          <strong>Xmytravel Experts&apos;</strong> professional and ethical standards. I also agree to the{" "}
          <Link href="/privacy-policy" className="text-blue-600 underline hover:text-blue-800" target="_blank">
            Privacy Policy
          </Link>.
        </span>
      </label>
    </div>
  </div>
)}


          <div className="flex justify-between pt-4">
            {currentStep > 0 && <button type="button" onClick={handleBack} className="px-4 py-2 text-sm font-medium text-[var(--primary)]">Back</button>}
            {currentStep < 2
              ? <button type="button" onClick={handleNext} className="px-6 py-2 text-sm font-semibold bg-[var(--primary)] text-white rounded-xl">Next</button>
              : <button
  type="button"
  onClick={handleSubmit}
  disabled={isSubmitting}
  className={`px-6 py-2 text-sm font-semibold text-white rounded-xl ${
    isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
  }`}
>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</button>
}
          </div>
        </form>
      </div>
    </div>
  );
}
