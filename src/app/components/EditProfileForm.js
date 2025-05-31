
// "use client";

// import { useState } from "react";
// import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/lib/style.css";
// import { getFirestore, query, collection, where, getDocs } from "firebase/firestore";
// import { app } from "@/lib/firebase";
// import Image from "next/image";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// const db = getFirestore(app);

// export default function EditProfileForm({ initialData, onSave }) {
//   const [formData, setFormData] = useState({
//     username: initialData.username || "",
//     fullName: initialData.fullName || "",
//     email: initialData.email || "",
//     phone: initialData.phone || "",
//     dateOfBirth: initialData.dateOfBirth || null,
//     tagline: initialData.tagline || "",
//     location: initialData.location || "",
//     languages: initialData.languages || "",
//     responseTime: initialData.responseTime || "",
//     pricing: initialData.pricing || "",
//     about: initialData.about || "",
//     photo: initialData.photo || null,
//     services: Array.isArray(initialData.services) && initialData.services.length ? initialData.services : [""],
//     regions: Array.isArray(initialData.regions) && initialData.regions.length ? initialData.regions : [],
//     experience: Array.isArray(initialData.experience) && initialData.experience.length
//       ? initialData.experience
//       : [{ title: "", company: "", startDate: null, endDate: null }],
//     certifications: initialData.certifications || "",
//     referred: initialData.referred || "No",
//     referralCode: initialData.referralCode || "",
//     generatedReferralCode: initialData.generatedReferralCode || "",
//   });
//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const fetchLeadByPhone = async (phone) => {
//     if (!phone || phone.length < 7) return;
//     try {
//       const leadsQuery = query(collection(db, "JoinQueries"), where("phone", "==", phone));
//       const querySnapshot = await getDocs(leadsQuery);
//       if (!querySnapshot.empty) {
//         const leads = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//           timestamp: doc.data().timestamp?.toDate() || new Date(),
//         }));
//         const mostRecentLead = leads.sort((a, b) => b.timestamp - a.timestamp)[0];
//         setFormData((prev) => ({
//           ...prev,
//           fullName: mostRecentLead.name || prev.fullName,
//           email: mostRecentLead.email || prev.email,
//           phone: phone,
//         }));
//         setErrors((prev) => ({ ...prev, fullName: "", email: "", phone: "" }));
//       }
//     } catch (error) {
//       console.error("Error fetching lead by phone:", error);
//       setErrors((prev) => ({ ...prev, phone: "Failed to fetch lead data." }));
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   const handlePhoneChange = (phone) => {
//     setFormData((prev) => ({ ...prev, phone }));
//     setErrors((prev) => ({ ...prev, phone: "" }));
//     fetchLeadByPhone(phone);
//   };

//   const handleFileChange = (e) => {
//     setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
//     setErrors((prev) => ({ ...prev, photo: "" }));
//   };

//   const handleArrayChange = (index, key, value) => {
//     const updated = [...formData[key]];
//     updated[index] = value;
//     setFormData((prev) => ({ ...prev, [key]: updated }));
//     setErrors((prev) => ({ ...prev, [key]: "" }));
//   };

//   const addField = (key) => {
//     setFormData((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
//   };

//   const removeField = (key, index) => {
//     const updated = formData[key].filter((_, i) => i !== index);
//     setFormData((prev) => ({ ...prev, [key]: updated }));
//   };

//   const handleExperienceChange = (index, field, value) => {
//     const updated = [...formData.experience];
//     updated[index] = { ...updated[index], [field]: value };
//     setFormData((prev) => ({ ...prev, experience: updated }));
//     setErrors((prev) => ({ ...prev, experience: "" }));
//   };

//   const addExperience = () => {
//     setFormData((prev) => ({
//       ...prev,
//       experience: [...prev.experience, { title: "", company: "", startDate: null, endDate: null }],
//     }));
//   };

//   const removeExperience = (index) => {
//     const updated = formData.experience.filter((_, i) => i !== index);
//     setFormData((prev) => ({ ...prev, experience: updated }));
//   };

//   const handleMultiChange = (e) => {
//     const options = Array.from(e.target.selectedOptions).map((o) => o.value);
//     setFormData((prev) => ({ ...prev, regions: options }));
//     setErrors((prev) => ({ ...prev, regions: "" }));
//   };

//   const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   const validatePhone = (phone) => /^\+?[0-9]{7,15}$/.test(phone);
//   const validateDateOfBirth = (date) => {
//     if (!date) return false;
//     const today = new Date();
//     const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
//     const minDate = new Date(1900, 0, 1);
//     return date <= minAgeDate && date >= minDate && date <= today;
//   };

//   const validateExperienceDates = (experience) => {
//     const today = new Date();
//     for (let i = 0; i < experience.length; i++) {
//       const { startDate, endDate } = experience[i];
//       if (!startDate) return "Start date is required";
//       if (!endDate) return "End date is required";
//       if (startDate > today) return "Start date cannot be in the future";
//       if (endDate !== "Present") {
//         if (!endDate) return "End date is required";
//         if (endDate < startDate) return "End date must be after start date";
//         if (endDate > today) return "End date cannot be in the future";
//       }
//     }
//     return "";
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     ["fullName", "email", "phone", "tagline", "location", "languages", "responseTime", "pricing", "about"].forEach(
//       (field) => {
//         if (!formData[field]?.trim()) newErrors[field] = "This field is required";
//       }
//     );
//     if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
//     if (formData.email && !validateEmail(formData.email)) newErrors.email = "Invalid email address";
//     if (formData.phone && !validatePhone(formData.phone)) newErrors.phone = "Invalid phone number";
//     if (formData.dateOfBirth && !validateDateOfBirth(formData.dateOfBirth)) {
//       newErrors.dateOfBirth = "Invalid date of birth. Must be at least 18 years old and not in the future.";
//     }
//     if (!formData.services.length || formData.services.some((s) => !s.trim())) {
//       newErrors.services = "At least one service is required";
//     }
//     if (!formData.regions.length) newErrors.regions = "At least one region is required";
//     if (
//       !formData.experience.length ||
//       formData.experience.some((exp) => !exp.title.trim() || !exp.company.trim())
//     ) {
//       newErrors.experience = "Title and company are required for each experience";
//     }
//     const dateError = validateExperienceDates(formData.experience);
//     if (dateError) newErrors.experience = dateError;
//     if (formData.referred === "Yes" && !formData.referralCode.trim()) {
//       newErrors.referralCode = "Referral code is required if referred";
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setIsSubmitting(true);
//     try {
//       await onSave(formData);
//     } catch (error) {
//       console.error("Error saving profile:", error);
//       setErrors((prev) => ({ ...prev, submit: "Failed to save profile." }));
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="bg-[#F4D35E] min-h-screen flex items-center justify-center p-3">
//       <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 md:p-10">
//         <form onSubmit={handleSubmit} className="space-y-10">
//           {/* Basic Information */}
//           <div className="space-y-4">
//             <h2 className="text-2xl font-semibold text-[var(--primary)]">👤 Basic Information</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <input
//                   type="text"
//                   name="username"
//                   placeholder="Username"
//                   className="px-4 py-3 border rounded-xl w-full bg-gray-100 cursor-not-allowed"
//                   value={formData.username}
//                   disabled
//                 />
//                 <p className="text-sm text-gray-500 mt-1">Username cannot be changed</p>
//               </div>
//               <div>
//                 <input
//                   type="text"
//                   name="fullName"
//                   placeholder="Full Name"
//                   className={`px-4 py-3 border rounded-xl w-full ${errors.fullName ? "border-red-500" : ""}`}
//                   value={formData.fullName}
//                   onChange={handleChange}
//                 />
//                 <p className="text-sm text-gray-500 mt-1">e.g. Rishabh</p>
//                 {errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>}
//               </div>
//               <div>
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Email"
//                   className={`px-4 py-3 border rounded-xl w-full ${errors.email ? "border-red-500" : ""}`}
//                   value={formData.email}
//                   onChange={handleChange}
//                 />
//                 {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
//               </div>
//               <div>
//                 <PhoneInput
//                   country={"in"}
//                   value={formData.phone}
//                   onChange={handlePhoneChange}
//                   placeholder="Enter phone number"
//                   inputProps={{
//                     id: "phone",
//                     className: `w-full p-3 border px-12 border-gray-300 rounded-2xl bg-white ${
//                       errors.phone ? "border-red-500" : ""
//                     }`,
//                   }}
//                 />
//                 {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
//               </div>
//               <div>
//                 <DatePicker
//                   selected={formData.dateOfBirth}
//                   onChange={(date) => {
//                     setFormData((prev) => ({ ...prev, dateOfBirth: date }));
//                     setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
//                   }}
//                   dateFormat="yyyy-MM-dd"
//                   placeholderText="Date of Birth"
//                   className={`px-4 py-3 border rounded-xl w-full ${errors.dateOfBirth ? "border-red-500" : ""}`}
//                   maxDate={new Date()}
//                   showYearDropdown
//                   yearDropdownItemNumber={100}
//                   scrollableYearDropdown
//                 />
//                 <p className="text-sm text-gray-500 mt-1">e.g. 1990-01-01</p>
//                 {errors.dateOfBirth && <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth}</p>}
//               </div>
//               <div>
//                 <input
//                   type="text"
//                   name="tagline"
//                   placeholder="Tagline"
//                   className={`px-4 py-3 border rounded-xl w-full ${errors.tagline ? "border-red-500" : ""}`}
//                   value={formData.tagline}
//                   onChange={handleChange}
//                 />
//                 <p className="text-sm text-gray-500 mt-1">e.g. Europe Travel Expert</p>
//                 {errors.tagline && <p className="text-sm text-red-600 mt-1">{errors.tagline}</p>}
//               </div>
//               <div>
//                 <input
//                   type="text"
//                   name="location"
//                   placeholder="City & Country"
//                   className={`px-4 py-3 border rounded-xl w-full ${errors.location ? "border-red-500" : ""}`}
//                   value={formData.location}
//                   onChange={handleChange}
//                 />
//                 <p className="text-sm text-gray-500 mt-1">e.g. Mumbai, India</p>
//                 {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
//               </div>
//               <div>
//                 <input
//                   type="text"
//                   name="languages"
//                   placeholder="Languages Spoken"
//                   className={`px-4 py-3 border rounded-xl w-full ${errors.languages ? "border-red-500" : ""}`}
//                   value={formData.languages}
//                   onChange={handleChange}
//                 />
//                 <p className="text-sm text-gray-500 mt-1">e.g. English, French, Hindi</p>
//                 {errors.languages && <p className="text-sm text-red-600 mt-1">{errors.languages}</p>}
//               </div>
//               <div>
//                 <input
//                   type="text"
//                   name="responseTime"
//                   placeholder="Response Time"
//                   className={`px-4 py-3 border rounded-xl w-full ${errors.responseTime ? "border-red-500" : ""}`}
//                   value={formData.responseTime}
//                   onChange={handleChange}
//                 />
//                 <p className="text-sm text-gray-500 mt-1">e.g. Responds in 12 hours</p>
//                 {errors.responseTime && <p className="text-sm text-red-600 mt-1">{errors.responseTime}</p>}
//               </div>
//               <div>
//                 <input
//                   type="text"
//                   name="pricing"
//                   placeholder="Pricing"
//                   className={`px-4 py-3 border rounded-xl w-full ${errors.pricing ? "border-red-500" : ""}`}
//                   value={formData.pricing}
//                   onChange={handleChange}
//                 />
//                 <p className="text-sm text-gray-500 mt-1">e.g. ₹2000/session or $30/consult</p>
//                 {errors.pricing && <p className="text-sm text-red-600 mt-1">{errors.pricing}</p>}
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Upload Profile Photo</label>
//               {formData.photo && typeof formData.photo === "string" && (
//                 <Image
//                   src={formData.photo}
//                   width={500}
//                   height={500}
//                   alt="Profile"
//                   className="w-32 h-32 object-cover rounded-full mb-2"
//                 />
//               )}
//               <input
//                 type="file"
//                 className={`w-full border rounded-xl px-4 py-2 ${errors.photo ? "border-red-500" : ""}`}
//                 onChange={handleFileChange}
//               />
//               {errors.photo && <p className="text-sm text-red-600 mt-1">{errors.photo}</p>}
//             </div>
//             <textarea
//               name="about"
//               placeholder="About Me (e.g. 10+ years guiding travelers across Europe)"
//               className={`w-full px-4 py-3 border rounded-xl ${errors.about ? "border-red-500" : ""}`}
//               rows="4"
//               value={formData.about}
//               onChange={handleChange}
//             />
//             {errors.about && <p className="text-sm text-red-600 mt-1">{errors.about}</p>}
//           </div>

//           {/* Services & Regions */}
//           <div className="space-y-6">
//             <h2 className="text-2xl font-semibold text-[var(--primary)]">🎯 Services & Regions</h2>
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">What I Can Help You With</label>
//               {formData.services.map((service, index) => (
//                 <div key={index} className="flex gap-2 items-center mb-2">
//                   <input
//                     type="text"
//                     className={`w-full px-4 py-2 border rounded-xl ${errors.services ? "border-red-500" : ""}`}
//                     placeholder="e.g. Visa Documentation"
//                     value={service}
//                     onChange={(e) => handleArrayChange(index, "services", e.target.value)}
//                   />
//                   <button
//                     type="button"
//                     className="text-red-500"
//                     onClick={() => removeField("services", index)}
//                   >
//                     ✕
//                   </button>
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 onClick={() => addField("services")}
//                 className="text-sm text-[var(--primary)] mt-2"
//               >
//                 + Add More
//               </button>
//               {errors.services && <p className="text-sm text-red-600 mt-1">{errors.services}</p>}
//             </div>
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Regions You Specialize In</label>
//               <select
//                 multiple
//                 className={`w-full px-4 py-3 border rounded-xl ${errors.regions ? "border-red-500" : ""}`}
//                 value={formData.regions}
//                 onChange={handleMultiChange}
//               >
//                 <option value="south-asia">South Asia</option>
//                 <option value="southeast-asia">Southeast Asia</option>
//                 <option value="east-asia">East Asia</option>
//                 <option value="central-asia">Central Asia</option>
//                 <option value="west-asia">West Asia</option>
//                 <option value="north-africa">North Africa</option>
//                 <option value="west-africa">West Africa</option>
//                 <option value="east-africa">East Africa</option>
//                 <option value="central-africa">Central Africa</option>
//                 <option value="southern-africa">Southern Africa</option>
//                 <option value="north-america">North America</option>
//                 <option value="central-america">Central America</option>
//                 <option value="caribbean">Caribbean</option>
//                 <option value="south-america">South America</option>
//                 <option value="western-europe">Western Europe</option>
//                 <option value="eastern-europe">Eastern Europe</option>
//                 <option value="northern-europe">Northern Europe</option>
//                 <option value="southern-europe">Southern Europe</option>
//                 <option value="australia-nz">Australia & New Zealand</option>
//                 <option value="pacific-islands">Pacific Islands</option>
//                 <option value="mena">MENA</option>
//                 <option value="emea">EMEA</option>
//                 <option value="apac">APAC</option>
//                 <option value="latam">LATAM</option>
//               </select>
//               {errors.regions && <p className="text-sm text-red-600 mt-1">{errors.regions}</p>}
//             </div>
//           </div>

//           {/* Experience */}
//           <div className="space-y-6">
//             <h2 className="text-2xl font-semibold text-[var(--primary)]">📚 Experience</h2>
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Experience</label>
//               {formData.experience.map((exp, index) => (
//                 <div key={index} className="space-y-2 mb-4 border p-4 rounded-xl">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <input
//                         type="text"
//                         placeholder="Job Title (e.g. Travel Consultant)"
//                         className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? "border-red-500" : ""}`}
//                         value={exp.title}
//                         onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
//                       />
//                     </div>
//                     <div>
//                       <input
//                         type="text"
//                         placeholder="Company (e.g. MakeMyTrip)"
//                         className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? "border-red-500" : ""}`}
//                         value={exp.company}
//                         onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
//                       />
//                     </div>
//                     <div>
//                       <DatePicker
//                         selected={exp.startDate}
//                         onChange={(date) => handleExperienceChange(index, "startDate", date)}
//                         dateFormat="yyyy-MM"
//                         placeholderText="Start Date (YYYY-MM)"
//                         className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? "border-red-500" : ""}`}
//                         maxDate={new Date()}
//                         showMonthYearPicker
//                       />
//                       <p className="text-sm text-gray-500 mt-1">e.g. 2020-01</p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <DatePicker
//                         selected={exp.endDate !== "Present" ? exp.endDate : null}
//                         onChange={(date) => handleExperienceChange(index, "endDate", date)}
//                         dateFormat="yyyy-MM"
//                         placeholderText="End Date (YYYY-MM)"
//                         className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? "border-red-500" : ""}`}
//                         maxDate={new Date()}
//                         showMonthYearPicker
//                         disabled={exp.endDate === "Present"}
//                       />
//                       <label className="flex items-center gap-2">
//                         <input
//                           type="checkbox"
//                           checked={exp.endDate === "Present"}
//                           onChange={(e) =>
//                             handleExperienceChange(index, "endDate", e.target.checked ? "Present" : null)
//                           }
//                         />
//                         Present
//                       </label>
//                     </div>
//                   </div>
//                   <button
//                     type="button"
//                     className="text-red-500 mt-2"
//                     onClick={() => removeExperience(index)}
//                   >
//                     ✕ Remove
//                   </button>
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 onClick={addExperience}
//                 className="text-sm text-[var(--primary)] mt-2"
//               >
//                 + Add Experience
//               </button>
//               {errors.experience && <p className="text-sm text-red-600 mt-1">{errors.experience}</p>}
//             </div>
//           </div>

//           {/* Referral Information */}
//           <div className="space-y-6">
//             <h2 className="text-2xl font-semibold text-[var(--primary)]">🤝 Referral Information</h2>
//             <div>
//               <label className="block mb-2 font-medium text-gray-700">Were you referred?</label>
//               <div className="flex gap-4">
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="radio"
//                     name="referred"
//                     value="Yes"
//                     checked={formData.referred === "Yes"}
//                     onChange={handleChange}
//                     className={`${errors.referred ? "ring-2 ring-red-500" : ""}`}
//                   />
//                   Yes
//                 </label>
//                 <label className="flex items-center gap-2">
//                   <input
//                     type="radio"
//                     name="referred"
//                     value="No"
//                     checked={formData.referred === "No"}
//                     onChange={handleChange}
//                     className={`${errors.referred ? "ring-2 ring-red-500" : ""}`}
//                   />
//                   No
//                 </label>
//               </div>
//               {errors.referred && <p className="text-sm text-red-600 mt-1">{errors.referred}</p>}
//             </div>
//             {formData.referred === "Yes" && (
//               <div>
//                 <input
//                   type="text"
//                   name="referralCode"
//                   placeholder="Enter referral code"
//                   className={`w-full px-4 py-2 border rounded-xl ${errors.referralCode ? "border-red-500" : ""}`}
//                   value={formData.referralCode}
//                   onChange={handleChange}
//                 />
//                 <p className="text-sm text-gray-500 mt-1">
//                   A verification call might be made to your referrer to confirm your recommendation.
//                 </p>
//                 {errors.referralCode && <p className="text-sm text-red-600 mt-1">{errors.referralCode}</p>}
//               </div>
//             )}
//           </div>

//           {/* Generated Referral Code */}
//           <div className="space-y-6">
//             <h2 className="text-2xl font-semibold text-[var(--primary)]">🔗 My Referral Code</h2>
//             <div>
//               <input
//                 type="text"
//                 name="generatedReferralCode"
//                 placeholder="Your referral code"
//                 className={`w-full px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed`}
//                 value={formData.generatedReferralCode}
//                 disabled
//               />
//               {errors.generatedReferralCode && (
//                 <p className="text-sm text-red-600 mt-1">{errors.generatedReferralCode}</p>
//               )}
//             </div>
//           </div>

//           {/* Submit Button */}
//           <div className="flex justify-end">
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className={`px-6 py-2 rounded-xl text-white font-semibold ${
//                 isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//               }`}
//             >
//               {isSubmitting ? "Saving..." : "Save Changes"}
//             </button>
//           </div>
//           {errors.submit && <p className="text-sm text-red-600 mt-2">{errors.submit}</p>}
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useCallback } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { getFirestore, query, collection, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import _ from "lodash";

const db = getFirestore(app);

export default function EditProfileForm({ initialData, onSave }) {
  const [formData, setFormData] = useState({
    username: initialData.username || "",
    fullName: initialData.fullName || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    dateOfBirth: initialData.dateOfBirth || null,
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
  const router = useRouter();

  // Check username availability with debouncing
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
          // setErrors((prev) => ({ ...prev, username: "Username is already taken" }));
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

  // Track form changes
  useEffect(() => {
    const isEqual = _.isEqual(formData, {
      ...initialData,
      services: Array.isArray(initialData.services) && initialData.services.length ? initialData.services : [""],
      regions: Array.isArray(initialData.regions) && initialData.regions.length ? initialData.regions : [],
      experience: Array.isArray(initialData.experience) && initialData.experience.length
        ? initialData.experience
        : [{ title: "", company: "", startDate: null, endDate: null }],
    });
    setHasChanges(!isEqual);
  }, [formData, initialData]);

  const fetchLeadByPhone = async (phone) => {
    if (!phone || phone.length < 7) return;
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
          phone: phone,
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "username") {
      checkUsernameAvailability(value);
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
      experience: [...prev.experience, { title: "", company: "", startDate: null, endDate: null }],
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

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\+?[0-9]{7,15}$/.test(phone);
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
    ["fullName", "email", "phone", "tagline", "location", "languages", "responseTime", "pricing", "about"].forEach(
      (field) => {
        if (!formData[field]?.trim()) newErrors[field] = "This field is required";
      }
    );
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (formData.email && !validateEmail(formData.email)) newErrors.email = "Invalid email address";
    if (formData.phone && !validatePhone(formData.phone)) newErrors.phone = "Invalid phone number";
    if (formData.dateOfBirth && !validateDateOfBirth(formData.dateOfBirth)) {
      newErrors.dateOfBirth = "Invalid date of birth. Must be at least 18 years old and not in the future.";
    }
    if (!formData.services.length || formData.services.some((s) => !s.trim())) {
      newErrors.services = "At least one service is required";
    }
    if (!formData.regions.length) newErrors.regions = "At least one region is required";
    if (
      !formData.experience.length ||
      formData.experience.some((exp) => !exp.title.trim() || !exp.company.trim())
    ) {
      newErrors.experience = "Title and company are required for each experience";
    }
    const dateError = validateExperienceDates(formData.experience);
    if (dateError) newErrors.experience = dateError;
    if (formData.referred === "Yes" && !formData.referralCode.trim()) {
      newErrors.referralCode = "Referral code is required if referred";
    }
    if (formData.username !== initialData.username && usernameStatus !== "Username is available") {
      newErrors.username = "Please choose an available username";
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

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="bg-[#F4D35E] min-h-screen flex items-center justify-center p-3">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-6 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-[var(--primary)]">👤 Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className={`px-4 py-3 border rounded-xl w-full ${errors.username ? "border-red-500" : ""}`}
                  value={formData.username}
                  onChange={handleChange}
                />
                {usernameStatus && (
                  <p
                    className={`text-sm mt-1 ${
                      usernameStatus === "Username is available" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {usernameStatus}
                  </p>
                )}
                {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username}</p>}
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
                    className: `w-full p-3 border px-12 border-gray-300 rounded-2xl bg-white ${
                      errors.phone ? "border-red-500" : ""
                    }`,
                  }}
                />
                {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <DatePicker
                  selected={formData.dateOfBirth}
                  onChange={(date) => {
                    setFormData((prev) => ({ ...prev, dateOfBirth: date }));
                    setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
                  }}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Date of Birth"
                  className={`px-4 py-3 border rounded-xl w-full ${errors.dateOfBirth ? "border-red-500" : ""}`}
                  maxDate={new Date()}
                  showYearDropdown
                  yearDropdownItemNumber={100}
                  scrollableYearDropdown
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
                {errors.tagline && <p className="text-sm text-red-600 mt-1">{errors.tagline}</p>}
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
                {errors.location && <p className="text-sm text-red-600 mt-1">{errors.location}</p>}
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
                {errors.languages && <p className="text-sm text-red-600 mt-1">{errors.languages}</p>}
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
                {errors.responseTime && <p className="text-sm text-red-600 mt-1">{errors.responseTime}</p>}
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
                {errors.pricing && <p className="text-sm text-red-600 mt-1">{errors.pricing}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Profile Photo</label>
              {formData.photo && typeof formData.photo === "string" && (
                <Image
                  src={formData.photo}
                  width={500}
                  height={500}
                  alt="Profile"
                  className="w-32 h-32 object-cover rounded-full mb-2"
                />
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
                      <DatePicker
                        selected={exp.startDate}
                        onChange={(date) => handleExperienceChange(index, "startDate", date)}
                        dateFormat="yyyy-MM"
                        placeholderText="Start Date (YYYY-MM)"
                        className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? "border-red-500" : ""}`}
                        maxDate={new Date()}
                        showMonthYearPicker
                      />
                      <p className="text-sm text-gray-500 mt-1">e.g. 2020-01</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DatePicker
                        selected={exp.endDate !== "Present" ? exp.endDate : null}
                        onChange={(date) => handleExperienceChange(index, "endDate", date)}
                        dateFormat="yyyy-MM"
                        placeholderText="End Date (YYYY-MM)"
                        className={`w-full px-4 py-2 border rounded-xl ${errors.experience ? "border-red-500" : ""}`}
                        maxDate={new Date()}
                        showMonthYearPicker
                        disabled={exp.endDate === "Present"}
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={exp.endDate === "Present"}
                          onChange={(e) =>
                            handleExperienceChange(index, "endDate", e.target.checked ? "Present" : null)
                          }
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

          {/* Generated Referral Code */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[var(--primary)]">🔗 My Referral Code</h2>
            <div>
              <input
                type="text"
                name="generatedReferralCode"
                placeholder="Your referral code"
                className={`w-full px-4 py-2 border rounded-xl bg-gray-100 cursor-not-allowed`}
                value={formData.generatedReferralCode}
                disabled
              />
              {errors.generatedReferralCode && (
                <p className="text-sm text-red-600 mt-1">{errors.generatedReferralCode}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            {!hasChanges && (
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 rounded-xl text-white font-semibold bg-red-600 hover:bg-red-700"
              >
                Close
              </button>
            )}
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
      </div>
    </div>
  );
}