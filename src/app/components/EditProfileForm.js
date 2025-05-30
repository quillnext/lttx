
"use client";

import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { getFirestore } from "firebase/firestore";
import { app } from "@/lib/firebase";
import Image from "next/image";

const db = getFirestore(app);

export default function EditProfileForm({ initialData, onSave }) {
  const [formData, setFormData] = useState({
    username: initialData.username || "",
    fullName: initialData.fullName || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    dateOfBirth: initialData.dateOfBirth || "", 
    tagline: initialData.tagline || "",
    location: initialData.location || "",
    languages: initialData.languages || "",
    responseTime: initialData.responseTime || "",
    pricing: initialData.pricing || "",
    about: initialData.about || "",
    photo: initialData.photo || null,
    services: Array.isArray(initialData.services) && initialData.services.length ? initialData.services : [""],
    regions: Array.isArray(initialData.regions) && initialData.regions.length ? initialData.regions : [],
    experience: Array.isArray(initialData.experience) && initialData.experience.length
      ? initialData.experience.map((exp) => ({
          title: exp.title || "",
          company: exp.company || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
        }))
      : [{ title: "", company: "", startDate: "", endDate: "" }],
    certifications: initialData.certifications || "",
    referred: initialData.referred || "No", 
    referralCode: initialData.referralCode || "",
    generatedReferralCode: initialData.generatedReferralCode || "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePhoneChange = (phone) => {
    setFormData((prev) => ({ ...prev, phone }));
    setErrors((prev) => ({ ...prev, phone: "" }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
    setErrors((prev) => ({ ...prev, photo: "" }));
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
    setFormData((prev) => ({ ...prev, [key]: updated }));
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
      experience: [...prev.experience, { title: "", company: "", startDate: "", endDate: "" }],
    }));
  };

  const removeExperience = (index) => {
    const updated = formData.experience.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, experience: updated }));
  };

  const handleMultiChange = (e) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setFormData((prev) => ({ ...prev, regions: options }));
    setErrors((prev) => ({ ...prev, regions: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    ["fullName", "email", "phone"].forEach((field) => {
      if (!formData[field]?.trim()) newErrors[field] = "This field is required";
    });
    if (!formData.services.length || formData.services.some((s) => !s.trim())) {
      newErrors.services = "At least one service is required";
    }
    if (!formData.regions.length) newErrors.regions = "At least one region is required";
    if (
      !formData.experience.length ||
      formData.experience.some((exp) => !exp.title.trim() || !exp.company.trim() || !exp.startDate.trim())
    ) {
      newErrors.experience = "Title, company, and start date are required for each experience";
    }
    if (formData.referred === "Yes" && !formData.referralCode.trim()) {
      newErrors.referralCode = "Referral code is required if referred";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrors((prev) => ({ ...prev, submit: "Failed to save profile." }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 p-6 md:p-10">
      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-[var(--primary)]">👤 Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="px-4 py-3 border rounded-xl w-full bg-gray-100 cursor-not-allowed"
              value={formData.username}
              disabled
            />
            <p className="text-sm text-gray-500 mt-1">Username cannot be changed</p>
          </div>
          <div>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              className={`px-4 py-3 border rounded-xl w-full ${errors.fullName ? "border-red-500" : ""}`}
              value={formData.fullName}
              onChange={handleChange}
            />
            <p className="text-sm text-gray-500 mt-1">e.g. Rishabh</p>
            {errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={`px-4 py-3 border rounded-xl w-full ${errors.email ? "border-red-500" : ""}`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <PhoneInput
              country={"in"}
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="Enter phone number"
              inputProps={{
                id: "phone",
                className: `w-full p-3 border px-12 border-gray-300 rounded-2xl bg-white ${errors.phone ? "border-red-500" : ""}`,
              }}
            />
            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
          </div>
          <div>
            <input
              type="text"
              name="dateOfBirth"
              placeholder="Date of Birth (YYYY-MM-DD)"
              className={`px-4 py-3 border rounded-xl w-full ${errors.dateOfBirth ? "border-red-500" : ""}`}
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
            <p className="text-sm text-gray-500 mt-1">e.g. 1990-01-01</p>
            {errors.dateOfBirth && <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth}</p>}
          </div>
          <div>
            <input
              type="text"
              name="tagline"
              placeholder="Tagline"
              className={`px-4 py-3 border rounded-xl w-full ${errors.tagline ? "border-red-500" : ""}`}
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
              className={`px-4 py-3 border rounded-xl w-full ${errors.location ? "border-red-500" : ""}`}
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
              className={`px-4 py-3 border rounded-xl w-full ${errors.languages ? "border-red-500" : ""}`}
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
              className={`px-4 py-3 border rounded-xl w-full ${errors.responseTime ? "border-red-500" : ""}`}
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
              className={`px-4 py-3 border rounded-xl w-full ${errors.pricing ? "border-red-500" : ""}`}
              value={formData.pricing}
              onChange={handleChange}
            />
            <p className="text-sm text-gray-500 mt-1">e.g. ₹2000/session or $30/consult</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Profile Photo</label>
          {formData.photo && typeof formData.photo === "string" && (
            <Image src={formData.photo} width={500} height={500} alt="Profile" className="w-32 h-32 object-cover rounded-full mb-2" />
          )}
          <input
            type="file"
            className={`w-full border rounded-xl px-4 py-2 ${errors.photo ? "border-red-500" : ""}`}
            onChange={handleFileChange}
          />
          {errors.photo && <p className="text-sm text-red-600 mt-1">{errors.photo}</p>}
        </div>
        <textarea
          name="about"
          placeholder="About Me (e.g. 10+ years guiding travelers across Europe)"
          className={`w-full px-4 py-3 border rounded-xl ${errors.about ? "border-red-500" : ""}`}
          rows="4"
          value={formData.about}
          onChange={handleChange}
        />
        {errors.about && <p className="text-sm text-red-600 mt-1">{errors.about}</p>}
      </div>

      {/* Services & Regions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-[var(--primary)]">🎯 Services & Regions</h2>
        <div>
          <label className="block mb-2 font-medium text-gray-700">What I Can Help You With</label>
          {formData.services.map((service, index) => (
            <div key={index} className="flex gap-2 items-center mb-2">
              <input
                type="text"
                className={`w-full px-4 py-2 border rounded-xl ${errors.services ? "border-red-500" : ""}`}
                placeholder="e.g. Visa Documentation"
                value={service}
                onChange={(e) => handleArrayChange(index, "services", e.target.value)}
              />
              <button
                type="button"
                className="text-red-500"
                onClick={() => removeField("services", index)}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addField("services")}
            className="text-sm text-[var(--primary)] mt-2"
          >
            + Add More
          </button>
          {errors.services && <p className="text-sm text-red-600 mt-1">{errors.services}</p>}
        </div>
        <div>
          <label className="block mb-2 font-medium text-gray-700">Regions You Specialize In</label>
          <select
            multiple
            className={`w-full px-4 py-3 border rounded-xl ${errors.regions ? "border-red-500" : ""}`}
            value={formData.regions}
            onChange={handleMultiChange}
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
          {errors.regions && <p className="text-sm text-red-600 mt-1">{errors.regions}</p>}
        </div>
      </div>

      {/* Experience */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-[var(--primary)]">📚 Experience</h2>
        <div>
          <label className="block mb-2 font-medium text-gray-700">Experience</label>
          {formData.experience.map((exp, index) => (
            <div key={index} className="space-y-2 mb-4 border p-4 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Job Title (e.g. Travel Consultant)"
                    className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? "border-red-500" : ""}`}
                    value={exp.title}
                    onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Company (e.g. MakeMyTrip)"
                    className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? "border-red-500" : ""}`}
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Start Date (YYYY-MM)"
                    className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? "border-red-500" : ""}`}
                    value={exp.startDate}
                    onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">e.g. 2020-01</p>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="End Date (YYYY-MM or Present)"
                    className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? "border-red-500" : ""}`}
                    value={exp.endDate}
                    onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">e.g. 2023-06 or Present</p>
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
          {errors.experience && <p className="text-sm text-red-600 mt-1">{errors.experience}</p>}
        </div>
      </div>

      {/* Referral Information */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-[var(--primary)]">🤝 Referral Information</h2>
        <div>
          <label className="block mb-2 font-medium text-gray-700">Were you referred?</label>
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
            <input
              type="text"
              name="referralCode"
              placeholder="Enter referral code"
              className={`w-full px-4 py-2 border rounded-xl ${errors.referralCode ? "border-red-500" : ""}`}
              value={formData.referralCode}
              onChange={handleChange}
            />
            <p className="text-sm text-gray-500 mt-1">
              A verification call might be made to your referrer to confirm your recommendation.
            </p>
            {errors.referralCode && <p className="text-sm text-red-600 mt-1">{errors.referralCode}</p>}
          </div>
          
        )}
      </div>
       <div className="space-y-6">
        <div>
          <label className="block mb-2 font-medium text-gray-700">My  referal code is </label>
          <div className="flex gap-4">
            
          </div>
          {errors.referred && <p className="text-sm text-red-600 mt-1">{errors.referred}</p>}
        </div>
      
          <div>
            <input
              type="text"
              name="generatedReferralCode"
              placeholder="Enter referral code"
              className={`w-full px-4 py-2 border rounded-xl ${errors.referralCode ? "border-red-500" : ""}`}
              value={formData.generatedReferralCode}
            
              disabled
            />
          
            {errors.generatedReferralCode && <p className="text-sm text-red-600 mt-1">{errors.generatedReferralCode}</p>}
          </div>
          
      
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 rounded-xl text-white font-semibold ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
      {errors.submit && <p className="text-sm text-red-600 mt-2">{errors.submit}</p>}
    </form>
  );
}