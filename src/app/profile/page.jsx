
// "use client";

// import React, { useState, useEffect } from "react";
// import { useForm, FormProvider, useFormContext, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useSearchParams } from "next/navigation";
// import PhoneInput from "react-phone-input-2";
// import dynamic from "next/dynamic";
// import "react-phone-input-2/lib/style.css";
// import Image from "next/image";
// import { FaQuestionCircle, FaRegFileAlt } from "react-icons/fa";
// import Modal from "../components/Modal";
// import CustomTooltip from "../components/CustomTooltip";
// import { TooltipProvider } from "@/components/ui/tooltip";

// // Dynamically import react-select with SSR disabled
// const Select = dynamic(() => import("react-select"), { ssr: false });

// // Validation schemas for Step 1 and Step 2
// const step1Schema = z.object({
//   inviteCode: z.string().min(1, "Invite Code is required"),
//   fullName: z.string().optional(),
//   email: z.string().optional(),
//   phone: z.string().optional(),
//   city: z.string().optional(),
//   country: z.string().optional(),
//   typeOfTravel: z.array(z.string()).optional(),
//   industrySegment: z.array(z.string()).optional(),
//   destinationExpertise: z.array(z.string()).optional(),
//   language: z.array(z.string()).optional(),
//   designation: z.string().optional(),
//   organization: z.string().optional(),
//   website: z.string().optional(),
//   facebook: z.string().optional(),
//   instagram: z.string().optional(),
//   linkedin: z.string().optional(),
// });

// const step2Schema = z.object({
//   tagline: z.string().min(1, "Tagline is required"),
//   about: z.string().min(1, "About yourself is required"),
//   certifications: z.string().optional(),
//   organizationName: z.string().optional(),
//   certificationFiles: z.any().optional(),
//   access: z.string().optional(),
//   paidConsultations: z.string().optional(),
//   industryDiscussions: z.string().optional(),
//   yearsOfExperience: z.number().min(0, "Years of experience is required"),
//   profilePicture: z.any().optional(),
//   declaration: z.boolean().refine((val) => val === true, {
//     message: "You must agree to the declaration",
//   }),
//   workSamples: z.any().optional(),
//   testimonials: z.array(z.string()).optional(),
// });

// // Options for dropdowns
// const yesNoOptions = [
//   { value: "Yes", label: "Yes" },
//   { value: "No", label: "No" },
// ];

// const typeOfTravelOptions = [
//   { value: "Leisure", label: "Leisure" },
//   { value: "Corporate / Business", label: "Corporate / Business" },
//   { value: "Luxury", label: "Luxury" },
//   { value: "Adventure", label: "Adventure" },
//   { value: "Group Travel", label: "Group Travel" },
// ];

// const industrySegmentOptions = [
//   { value: "Airlines", label: "Airlines" },
//   { value: "Cruises", label: "Cruises" },
//   { value: "Hotels & Resorts", label: "Hotels & Resorts" },
// ];

// const destinationExpertiseOptions = [
//   { value: "North America", label: "North America" },
//   { value: "Europe", label: "Europe" },
//   { value: "Asia", label: "Asia" },
// ];

// const languageOptions = [
//   { value: "English", label: "English" },
//   { value: "Spanish", label: "Spanish" },
//   { value: "French", label: "French" },
//   { value: "Mandarin Chinese", label: "Mandarin Chinese" },
// ];

// // Step 1 Component
// const Step1 = ({ setStep, setUserData, userData }) => {
//   const { register, formState: { errors }, handleSubmit, setValue, control } = useFormContext();
//   const searchParams = useSearchParams();
//   const inviteCodeFromUrl = searchParams.get("inviteCode");

//   useEffect(() => {
//     if (inviteCodeFromUrl) {
//       setValue("inviteCode", inviteCodeFromUrl);
//       handleSubmit(onSubmit)();
//     }
//   }, [inviteCodeFromUrl, setValue, handleSubmit]);

//   useEffect(() => {
//     if (userData) {
//       setValue("fullName", userData.fullName || "");
//       setValue("email", userData.email || "");
//       setValue("phone", userData.phone || "");
//       setValue("city", userData.city || "");
//       setValue("country", userData.country || "");
//       setValue("typeOfTravel", userData.typeOfTravel || []);
//       setValue("industrySegment", userData.industrySegment || []);
//       setValue("destinationExpertise", userData.destinationExpertise || []);
//       setValue("language", userData.language || []);
//       setValue("designation", userData.designation || "");
//       setValue("organization", userData.organization || "");
//       setValue("website", userData.website || "");
//       setValue("facebook", userData.facebook || "");
//       setValue("instagram", userData.instagram || "");
//       setValue("linkedin", userData.linkedin || "");
//     }
//   }, [userData, setValue]);

//   const onSubmit = async (data) => {
//     try {
//       const response = await fetch("/api/profile", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ inviteCode: data.inviteCode }),
//       });
//       const result = await response.json();
//       console.log("Step 1 Response:", result);
//       if (response.ok) {
//         setUserData({ ...result.userData, inviteCode: data.inviteCode });
//       } else {
//         alert(result.error || "Failed to fetch user data");
//       }
//     } catch (error) {
//       alert("Network error: Unable to fetch user data. Please try again later.");
//       console.error("Fetch error:", error);
//     }
//   };

//   const handleNext = () => {
//     setStep(2);
//   };

//   return (
//     <div className="space-y-4 p-6 lg:px-32 bg-secondary rounded-[40px]">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div className="lg:col-span-1">
//           <label htmlFor="inviteCode" className="block text-sm text-formtext mb-1">Invite Code</label>
//           <input
//             type="text"
//             placeholder="Invite Code"
//             id="inviteCode"
//             {...register("inviteCode")}
//             className="w-full p-3 border border-gray-300 rounded-2xl bg-white h-12 shadow-lg"
//           />
//           {errors.inviteCode && (
//             <p className="text-red-500 text-sm mt-1">{errors.inviteCode.message}</p>
//           )}
//         </div>
//         <div className="lg:col-span-1 flex items-end">
//           <button
//             type="submit"
//             onClick={handleSubmit(onSubmit)}
//             className="bg-primary text-white p-3 rounded-2xl w-full h-12 flex items-center justify-center"
//           >
//             Submit
//           </button>
//         </div>
//       </div>
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm text-formtext mb-1">Full Name</label>
//           <input
//             type="text"
//             {...register("fullName")}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
//             disabled
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Email</label>
//           <input
//             type="email"
//             {...register("email")}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
//             disabled
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Phone</label>
//           <Controller
//             name="phone"
//             control={control}
//             render={({ field }) => (
//               <PhoneInput
//                 country="in"
//                 value={field.value}
//                 onChange={field.onChange}
//                 disabled
//                 inputProps={{
//                   className: "w-full p-3 border px-12 border-gray-300 rounded-2xl shadow-lg",
//                 }}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">City</label>
//           <input
//             type="text"
//             {...register("city")}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
//             disabled
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Country</label>
//           <input
//             type="text"
//             {...register("country")}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Type of Travel</label>
//           <Controller
//             name="typeOfTravel"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 isMulti
//                 options={typeOfTravelOptions}
//                 value={typeOfTravelOptions.filter((option) => field.value?.includes(option.value))}
//                 onChange={(selected) => field.onChange(selected.map((option) => option.value))}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//                 isDisabled={true}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Industry Segment</label>
//           <Controller
//             name="industrySegment"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 isMulti
//                 options={industrySegmentOptions}
//                 value={industrySegmentOptions.filter((option) => field.value?.includes(option.value))}
//                 onChange={(selected) => field.onChange(selected.map((option) => option.value))}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//                 isDisabled={true}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Destination Expertise</label>
//           <Controller
//             name="destinationExpertise"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 isMulti
//                 options={destinationExpertiseOptions}
//                 value={destinationExpertiseOptions.filter((option) => field.value?.includes(option.value))}
//                 onChange={(selected) => field.onChange(selected.map((option) => option.value))}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//                 isDisabled={true}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Languages Spoken</label>
//           <Controller
//             name="language"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 isMulti
//                 options={languageOptions}
//                 value={languageOptions.filter((option) => field.value?.includes(option.value))}
//                 onChange={(selected) => field.onChange(selected.map((option) => option.value))}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//                 isDisabled={true}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Current Designation</label>
//           <input
//             type="text"
//             {...register("designation")}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
//             disabled
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Current Organization</label>
//           <input
//             type="text"
//             {...register("organization")}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
//             disabled
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Website (optional)</label>
//           <input
//             type="url"
//             {...register("website")}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Facebook (optional)</label>
//           <input
//             type="url"
//             {...register("facebook")}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Instagram (optional)</label>
//           <input
//             type="url"
//             {...register("instagram")}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">LinkedIn (optional)</label>
//           <input
//             type="url"
//             {...register("linkedin")}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
//           />
//         </div>
//       </div>
//       {userData && (
//         <div className="pt-4 flex justify-center">
//           <button
//             type="button"
//             onClick={handleNext}
//             className="bg-primary text-white px-16 py-3 rounded-full w-5/6 md:w-1/4 flex items-center justify-center cursor-pointer"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// // Step 2 Component
// const Step2 = ({ userData, setStep, showModal, resetForm }) => {
//   const { register, control, formState: { errors }, handleSubmit, watch, setValue } = useFormContext();
//   const [workSamples, setWorkSamples] = useState([]);
//   const [certificationFiles, setCertificationFiles] = useState([]);
//   const [testimonials, setTestimonials] = useState([]);
//   const [newTestimonial, setNewTestimonial] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
//   const isCertified = watch("certifications");

//   useEffect(() => {
//     setValue("workSamples", workSamples);
//     setValue("certificationFiles", certificationFiles);
//     setValue("testimonials", testimonials);
//   }, [workSamples, certificationFiles, testimonials, setValue]);

//   const onSubmit = async (data) => {
//     setIsSubmitting(true); // Start loading
//     try {
//       if (!userData.inviteCode) {
//         showModal("error", "Invite code is missing. Please go back to Step 1 and enter a valid invite code.");
//         return;
//       }

//       const formData = new FormData();
//       formData.append("inviteCode", userData.inviteCode);
//       formData.append("fullName", userData.fullName || "");
//       formData.append("email", userData.email || "");
//       formData.append("phone", userData.phone || "");
//       formData.append("city", userData.city || "");
//       formData.append("country", userData.country || "");
//       formData.append("typeOfTravel", JSON.stringify(userData.typeOfTravel || []));
//       formData.append("industrySegment", JSON.stringify(userData.industrySegment || []));
//       formData.append("destinationExpertise", JSON.stringify(userData.destinationExpertise || []));
//       formData.append("language", JSON.stringify(userData.language || []));
//       formData.append("designation", userData.designation || "");
//       formData.append("organization", userData.organization || "");
//       formData.append("website", data.website || "");
//       formData.append("facebook", data.facebook || "");
//       formData.append("instagram", data.instagram || "");
//       formData.append("linkedin", userData.linkedin || "");
//       formData.append("tagline", data.tagline || "");
//       formData.append("about", data.about || "");
//       formData.append("certifications", data.certifications || "");
//       formData.append("organizationName", data.certifications === "Yes" ? data.organizationName : "");
//       formData.append("access", data.access || "");
//       formData.append("paidConsultations", data.paidConsultations || "");
//       formData.append("industryDiscussions", data.industryDiscussions || "");
//       formData.append("yearsOfExperience", data.yearsOfExperience.toString());
//       formData.append("testimonials", JSON.stringify(testimonials));
//       formData.append("declaration", data.declaration.toString());

//       if (data.profilePicture && data.profilePicture[0]) {
//         formData.append("profilePicture", data.profilePicture[0]);
//       }

//       workSamples.forEach((file) => {
//         formData.append("workSamples", file);
//       });

//       certificationFiles.forEach((file) => {
//         formData.append("certificationFiles", file);
//       });

//       console.log("Submitting FormData with inviteCode:", userData.inviteCode);

//       const response = await fetch("/api/profile", {
//         method: "POST",
//         body: formData,
//       });

//       const result = await response.json();
//       if (response.ok) {
//         showModal("success", "Profile completed successfully!");
//         setWorkSamples([]);
//         setCertificationFiles([]);
//         setTestimonials([]);
//         setNewTestimonial("");
//         resetForm();
//       } else {
//         showModal("error", result.error || "Failed to submit profile");
//       }
//     } catch (error) {
//       showModal("error", "Network error: Unable to submit profile. Please try again later.");
//       console.error("Submit error:", error);
//     } finally {
//       setIsSubmitting(false); // Stop loading
//     }
//   };

//   const handleFileChange = (e, setFiles) => {
//     const files = Array.from(e.target.files);
//     setFiles((prev) => [...prev, ...files]);
//   };

//   const removeFile = (file, setFiles) => {
//     setFiles((prev) => prev.filter((f) => f !== file));
//   };

//   const addTestimonial = () => {
//     if (newTestimonial.trim()) {
//       setTestimonials((prev) => [...prev, newTestimonial.trim()]);
//       setNewTestimonial("");
//     }
//   };

//   const removeTestimonial = (index) => {
//     setTestimonials((prev) => prev.filter((_, i) => i !== index));
//   };

//   return (
//     <div className="space-y-4 p-6 lg:px-32 bg-secondary rounded-[40px]">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm text-formtext mb-1">Years of Experience</label>
//           <input
//             type="number"
//             placeholder="Years of Experience"
//             {...register("yearsOfExperience", { valueAsNumber: true })}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
//           />
//           {errors.yearsOfExperience && (
//             <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience.message}</p>
//           )}
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Tagline</label>
//           <input
//             type="text"
//             placeholder="Tagline"
//             {...register("tagline")}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
//           />
//           {errors.tagline && (
//             <p className="text-red-500 text-sm mt-1">{errors.tagline.message}</p>
//           )}
//         </div>
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1">About yourself</label>
//           <textarea
//             placeholder="About yourself"
//             {...register("about")}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
//             rows="3"
//           />
//           {errors.about && (
//             <p className="text-red-500 text-sm mt-1">{errors.about.message}</p>
//           )}
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">
//             Are you certified by any recognized travel organizations?
//           </label>
//           <Controller
//             name="certifications"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 {...field}
//                 options={yesNoOptions}
//                 value={yesNoOptions.find((option) => option.value === field.value) || null}
//                 onChange={(selected) => field.onChange(selected?.value)}
//                 className="w-full mb-2 shadow-lg"
//                 classNamePrefix="custom-select"
//               />
//             )}
//           />
//         </div>
//         {isCertified === "Yes" && (
//           <div>
//             <label className="block text-sm text-formtext mb-1">Organization Name</label>
//             <input
//               type="text"
//               placeholder="Organization Name"
//               {...register("organizationName")}
//               className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
//             />
//           </div>
//         )}
//         {!isCertified && <div></div>} {/* Placeholder to maintain grid alignment */}
//         <div>
//           <label className="block text-sm text-formtext mb-1">
//             Have you previously provided travel consultations?
//           </label>
//           <Controller
//             name="access"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 {...field}
//                 options={yesNoOptions}
//                 value={yesNoOptions.find((option) => option.value === field.value) || null}
//                 onChange={(selected) => field.onChange(selected?.value)}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">
//             Are you comfortable providing paid travel consultations via Xmytravel Experts?
//           </label>
//           <Controller
//             name="paidConsultations"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 {...field}
//                 options={yesNoOptions}
//                 value={yesNoOptions.find((option) => option.value === field.value) || null}
//                 onChange={(selected) => field.onChange(selected?.value)}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//               />
//             )}
//           />
//         </div>
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1">
//             Are you open to participating in industry discussions, webinars, or content creation? (optional)
//           </label>
//           <Controller
//             name="industryDiscussions"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 {...field}
//                 options={yesNoOptions}
//                 value={yesNoOptions.find((option) => option.value === field.value) || null}
//                 onChange={(selected) => field.onChange(selected?.value)}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//               />
//             )}
//           />
//         </div>
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1 flex items-center">
//             Upload any relevant certifications or recognitions (optional)
//             <CustomTooltip icon={<FaRegFileAlt />}>
//               <span className="ml-2 text-formtext cursor-pointer">
//                 <FaQuestionCircle />
//               </span>
//             </CustomTooltip>
//           </label>
//           <input
//             type="file"
//             onChange={(e) => handleFileChange(e, setCertificationFiles)}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg mb-2"
//             multiple
//             accept="image/jpeg,image/png,application/pdf"
//           />
//           {certificationFiles.length > 0 && (
//             <div className="flex flex-wrap gap-2">
//               {certificationFiles.map((file, index) => (
//                 <div key={index} className="flex items-center bg-gray-100 p-2 rounded-full">
//                   <span className="text-sm text-formtext">{file.name}</span>
//                   <button
//                     type="button"
//                     onClick={() => removeFile(file, setCertificationFiles)}
//                     className="ml-2 text-red-500"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1 flex items-center">
//             Upload any relevant work samples (optional)
//             <CustomTooltip image={"/tooltip.svg"}>
//               <span className="ml-2 text-formtext cursor-pointer">
//                 <FaQuestionCircle />
//               </span>
//             </CustomTooltip>
//           </label>
//           <input
//             type="file"
//             onChange={(e) => handleFileChange(e, setWorkSamples)}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg mb-2"
//             multiple
//             accept="image/jpeg,image/png,application/pdf"
//           />
//           {workSamples.length > 0 && (
//             <div className="flex flex-wrap gap-2">
//               {workSamples.map((file, index) => (
//                 <div key={index} className="flex items-center bg-gray-100 p-2 rounded-full">
//                   <span className="text-sm text-formtext">{file.name}</span>
//                   <button
//                     type="button"
//                     onClick={() => removeFile(file, setWorkSamples)}
//                     className="ml-2 text-red-500"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1 flex items-center">
//             Customer testimonials (optional)
//             <CustomTooltip
//               description={
//                 "I got a good tour plan within 2 days only with all sight seeings for Somnath, nageshwar and dwarkadhish temple along with Gir National park. He is such a friendly person and got my all queries cleared and gave me some additional information too. - Akanksha vyas"
//               }
//             >
//               <span className="ml-2 text-formtext cursor-pointer">
//                 <FaQuestionCircle />
//               </span>
//             </CustomTooltip>
//           </label>
//           <div className="flex gap-2 mb-2">
//             <input
//               type="text"
//               value={newTestimonial}
//               onChange={(e) => setNewTestimonial(e.target.value)}
//               placeholder="Enter a testimonial"
//               className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
//               maxLength={500}
//             />
//             <button
//               type="button"
//               onClick={addTestimonial}
//               className="bg-primary text-white px-4 py-2 rounded-2xl"
//             >
//               Add
//             </button>
//           </div>
//           {testimonials.length > 0 && (
//             <div className="flex flex-col gap-2">
//               {testimonials.map((testimonial, index) => (
//                 <div key={index} className="flex items-center bg-gray-100 p-2 rounded-full">
//                   <span className="text-sm text-formtext">{testimonial}</span>
//                   <button
//                     type="button"
//                     onClick={() => removeTestimonial(index)}
//                     className="ml-2 text-red-500"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1 flex items-center">
//             Upload your profile picture
//             <CustomTooltip image={"/user.png"}>
//               <span className="ml-2 text-formtext cursor-pointer">
//                 <FaQuestionCircle />
//               </span>
//             </CustomTooltip>
//           </label>
//           <input
//             type="file"
//             {...register("profilePicture")}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
//             accept="image/jpeg,image/png,image/jpg"
//           />
//         </div>
//         <div className="lg:col-span-2">
//           <label className="flex items-center text-lg text-formtext">Final Declaration</label>
//           <label className="flex items-center text-sm text-formtext">
//             <input
//               type="checkbox"
//               {...register("declaration")}
//               className="mr-2 h-4 w-4 text-formtext"
//             />
//             I confirm that the information provided is true and adheres to Xmytravel Experts professional and ethical standards
//           </label>
//           {errors.declaration && (
//             <p className="text-red-500 text-sm mt-1">{errors.declaration.message}</p>
//           )}
//         </div>
//         <div className="lg:col-span-2 pt-4 flex flex-col sm:flex-row justify-between gap-4">
//           <button
//             type="button"
//             onClick={() => setStep(1)}
//             className="bg-gray-200 text-formtext px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
//           >
//             Back
//           </button>
//           <button
//             type="submit"
//             onClick={handleSubmit(onSubmit)}
//             disabled={isSubmitting}
//             className={`bg-primary text-white px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer ${
//               isSubmitting ? "opacity-50 cursor-not-allowed" : ""
//             }`}
//           >
//             {isSubmitting ? (
//               <svg
//                 className="animate-spin h-5 w-5 mr-2 text-white"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//             ) : null}
//             {isSubmitting ? "Submitting..." : "Submit"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main ProfilePage Component
// export default function ProfilePage() {
//   const [step, setStep] = useState(1);
//   const [userData, setUserData] = useState(null);
//   const [modalState, setModalState] = useState({
//     isOpen: false,
//     type: "success",
//     message: "",
//   });

//   const methods = useForm({
//     resolver: zodResolver(step === 1 ? step1Schema : step2Schema),
//     mode: "onChange",
//     defaultValues: {
//       inviteCode: "",
//       fullName: "",
//       email: "",
//       phone: "",
//       city: "",
//       country: "",
//       typeOfTravel: [],
//       industrySegment: [],
//       destinationExpertise: [],
//       language: [],
//       designation: "",
//       organization: "",
//       website: "",
//       facebook: "",
//       instagram: "",
//       linkedin: "",
//       tagline: "",
//       about: "",
//       certifications: "",
//       organizationName: "",
//       certificationFiles: [],
//       access: "",
//       paidConsultations: "",
//       industryDiscussions: "",
//       yearsOfExperience: 0,
//       profilePicture: null,
//       declaration: false,
//       workSamples: [],
//       testimonials: [],
//     },
//   });

//   const showModal = (type, message) => {
//     setModalState({ isOpen: true, type, message });
//   };

//   const closeModal = () => {
//     setModalState({ isOpen: false, type: "success", message: "" });
//   };

//   const resetForm = () => {
//     methods.reset({
//       inviteCode: "",
//       fullName: "",
//       email: "",
//       phone: "",
//       city: "",
//       country: "",
//       typeOfTravel: [],
//       industrySegment: [],
//       destinationExpertise: [],
//       language: [],
//       designation: "",
//       organization: "",
//       website: "",
//       facebook: "",
//       instagram: "",
//       linkedin: "",
//       tagline: "",
//       about: "",
//       certifications: "",
//       organizationName: "",
//       certificationFiles: [],
//       access: "",
//       paidConsultations: "",
//       industryDiscussions: "",
//       yearsOfExperience: 0,
//       profilePicture: null,
//       declaration: false,
//       workSamples: [],
//       testimonials: [],
//     });
//   };

//   return (
//     <section className="py-4 bg-secondary">
//       <div className="container mx-auto px-4">
//         <div className="flex justify-center items-center mb-4">
//           <Image
//             src="/logolttx.svg"
//             width={350}
//             height={84}
//             alt="lttx"
//             className="bg-primary rounded-full px-4"
//           />
//         </div>
//         <TooltipProvider>
//           <FormProvider {...methods}>
//             <form className="space-y-6">
//               {step === 1 && <Step1 setStep={setStep} setUserData={setUserData} userData={userData} />}
//               {step === 2 && (
//                 <Step2
//                   userData={userData}
//                   setStep={setStep}
//                   showModal={showModal}
//                   resetForm={resetForm}
//                 />
//               )}
//             </form>
//           </FormProvider>
//         </TooltipProvider>
//         <Modal
//           isOpen={modalState.isOpen}
//           onClose={closeModal}
//           type={modalState.type}
//           message={modalState.message}
//         />
//       </div>
//     </section>
//   );
// }






// "use client";

// import React, { useState, useEffect } from "react";
// import { useForm, FormProvider, useFormContext, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useSearchParams } from "next/navigation";
// import PhoneInput from "react-phone-input-2";
// import dynamic from "next/dynamic";
// import "react-phone-input-2/lib/style.css";
// import Image from "next/image";
// import { FaQuestionCircle, FaRegFileAlt } from "react-icons/fa";
// import Modal from "../components/Modal";
// import CustomTooltip from "../components/CustomTooltip";
// import { TooltipProvider } from "@/components/ui/tooltip";

// // Dynamically import react-select with SSR disabled
// const Select = dynamic(() => import("react-select"), { ssr: false });

// // Validation schemas for each step
// const step1Schema = z.object({
//   inviteCode: z.string().min(1, "Invite Code is required"),
//   fullName: z.string().optional(),
//   email: z.string().optional(),
//   phone: z.string().optional(),
//   city: z.string().optional(),
//   country: z.string().optional(),
//   typeOfTravel: z.array(z.string()).optional(),
//   industrySegment: z.array(z.string()).optional(),
//   destinationExpertise: z.array(z.string()).optional(),
//   language: z.array(z.string()).optional(),
//   designation: z.string().optional(),
//   organization: z.string().optional(),
//   website: z.string().optional(),
//   facebook: z.string().optional(),
//   instagram: z.string().optional(),
//   linkedin: z.string().optional(),
// });

// const step2Schema = z.object({
//   yearsOfExperience: z.number().min(0, "Years of experience is required").default(0),
//   tagline: z.string().min(1, "Tagline is required"),
//   about: z.string().min(1, "About yourself is required"),
//   profilePicture: z.any().optional(),
// });

// const step3Schema = z.object({
//   certifications: z.string().optional(),
//   organizationName: z.string().optional(),
//   access: z.string().optional(),
//   paidConsultations: z.string().optional(),
//   certificationFiles: z.any().optional(),
//   workSamples: z.any().optional(),
//   testimonials: z.array(z.string()).optional(),
// });

// const step4Schema = z.object({
//   declaration: z.boolean().refine((val) => val === true, {
//     message: "You must agree to the declaration",
//   }),
//   industryDiscussions: z.string().optional(),
// });

// // Options for dropdowns
// const yesNoOptions = [
//   { value: "Yes", label: "Yes" },
//   { value: "No", label: "No" },
// ];

// const typeOfTravelOptions = [
//   { value: "Leisure", label: "Leisure" },
//   { value: "Corporate / Business", label: "Corporate / Business" },
//   { value: "Luxury", label: "Luxury" },
//   { value: "Adventure", label: "Adventure" },
//   { value: "Group Travel", label: "Group Travel" },
// ];

// const industrySegmentOptions = [
//   { value: "Airlines", label: "Airlines" },
//   { value: "Cruises", label: "Cruises" },
//   { value: "Hotels & Resorts", label: "Hotels & Resorts" },
// ];

// const destinationExpertiseOptions = [
//   { value: "North America", label: "North America" },
//   { value: "Europe", label: "Europe" },
//   { value: "Asia", label: "Asia" },
// ];

// const languageOptions = [
//   { value: "English", label: "English" },
//   { value: "Spanish", label: "Spanish" },
//   { value: "French", label: "French" },
//   { value: "Mandarin Chinese", label: "Mandarin Chinese" },
// ];

// // Progress Bar Component
// const ProgressBar = ({ currentStep }) => {
//   const steps = [
//     { step: 1, label: "Invite Code" },
//     { step: 2, label: "Personal Details" },
//     { step: 3, label: "Professional Info" },
//     { step: 4, label: "Declaration" },
//   ];
//   const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  
//   return (
//     <div className="mb-6">
//       <div className="flex justify-between mb-2">
//         {steps.map((step) => (
//           <div key={step.step} className="text-center">
//             <div
//               className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
//                 currentStep >= step.step ? "bg-primary text-white" : "bg-gray-300 text-gray-600"
//               }`}
//             >
//               {step.step}
//             </div>
//             <span className="text-sm text-formtext">{step.label}</span>
//           </div>
//         ))}
//       </div>
//       <div className="w-full bg-gray-200 rounded-full h-2.5">
//         <div
//           className="bg-primary h-2.5 rounded-full transition-all duration-300"
//           style={{ width: `${progressPercentage}%` }}
//         ></div>
//       </div>
//     </div>
//   );
// };

// // Step 1 Component
// const Step1 = ({ setStep, setUserData, userData }) => {
//   const { register, formState: { errors }, handleSubmit, setValue, control } = useFormContext();
//   const searchParams = useSearchParams();
//   const inviteCodeFromUrl = searchParams.get("inviteCode");

//   const onSubmit = async (data) => {
//     try {
//       const response = await fetch("/api/profile", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ inviteCode: data.inviteCode }),
//       });
//       const result = await response.json();
//       console.log("Step 1 Response:", result);
//       if (response.ok) {
//         setUserData({ ...result.userData, inviteCode: data.inviteCode });
//       } else {
//         alert(result.error || "Failed to fetch user data");
//       }
//     } catch (error) {
//       alert("Network error: Unable to fetch user data. Please try again later.");
//       console.error("Fetch error:", error);
//     }
//   };

//   useEffect(() => {
//     if (inviteCodeFromUrl) {
//       setValue("inviteCode", inviteCodeFromUrl);
//       handleSubmit(onSubmit)();
//     }
//   }, [inviteCodeFromUrl, setValue, handleSubmit, onSubmit]);

//   useEffect(() => {
//     if (userData) {
//       setValue("fullName", userData.fullName || "");
//       setValue("email", userData.email || "");
//       setValue("phone", userData.phone || "");
//       setValue("city", userData.city || "");
//       setValue("country", userData.country || "");
//       setValue("typeOfTravel", userData.typeOfTravel || []);
//       setValue("industrySegment", userData.industrySegment || []);
//       setValue("destinationExpertise", userData.destinationExpertise || []);
//       setValue("language", userData.language || []);
//       setValue("designation", userData.designation || "");
//       setValue("organization", userData.organization || "");
//       setValue("website", userData.website || "");
//       setValue("facebook", userData.facebook || "");
//       setValue("instagram", userData.instagram || "");
//       setValue("linkedin", userData.linkedin || "");
//     }
//   }, [userData, setValue]);

//   const handleNext = () => {
//     setStep(2);
//   };

//   return (
//     <div className="space-y-4 p-6 lg:px-32 bg-secondary rounded-[40px]">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div className="lg:col-span-1">
//           <label htmlFor="inviteCode" className="block text-sm text-formtext mb-1">Invite Code</label>
//           <input
//             type="text"
//             placeholder="Invite Code"
//             id="inviteCode"
//             {...register("inviteCode")}
//             className="w-full p-3 border border-gray-300 rounded-2xl bg-white h-12 shadow-lg"
//           />
//           {errors.inviteCode && (
//             <p className="text-red-500 text-sm mt-1">{errors.inviteCode.message}</p>
//           )}
//         </div>
//         <div className="lg:col-span-1 flex items-end">
//           <button
//             type="button"
//             onClick={handleSubmit(onSubmit)}
//             className="bg-primary text-white p-3 rounded-2xl w-full h-12 flex items-center justify-center"
//           >
//             Submit
//           </button>
//         </div>
//       </div>
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm text-formtext mb-1">Full Name</label>
//           <input
//             type="text"
//             {...register("fullName")}
//             className="w-full p-3 border border-gray-300 bg-white rounded-2xl shadow-lg"
//             disabled
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Email</label>
//           <input
//             type="email"
//             {...register("email")}
//             className="w-full p-3 border border-gray-300 bg-white rounded-2xl shadow-lg"
//             disabled
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Phone</label>
//           <Controller
//             name="phone"
//             control={control}
//             render={({ field }) => (
//               <PhoneInput
//                 country="in"
//                 value={field.value}
//                 onChange={field.onChange}
//                 disabled
//                 inputProps={{
//                   className: "w-full p-3 border px-12 border-gray-300 bg-white rounded-2xl shadow-lg",
//                 }}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">City</label>
//           <input
//             type="text"
//             {...register("city")}
//             className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg bg-white"
//             disabled
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Country</label>
//           <input
//             type="text"
//             {...register("country")}
//             className="w-full p-3 border border-gray-300 rounded-2xl bg-white shadow-lg"
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Type of Travel</label>
//           <Controller
//             name="typeOfTravel"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 isMulti
//                 options={typeOfTravelOptions}
//                 value={typeOfTravelOptions.filter((option) => field.value?.includes(option.value))}
//                 onChange={(selected) => field.onChange(selected.map((option) => option.value))}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//                 isDisabled={true}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Industry Segment</label>
//           <Controller
//             name="industrySegment"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 isMulti
//                 options={industrySegmentOptions}
//                 value={industrySegmentOptions.filter((option) => field.value?.includes(option.value))}
//                 onChange={(selected) => field.onChange(selected.map((option) => option.value))}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//                 isDisabled={true}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Destination Expertise</label>
//           <Controller
//             name="destinationExpertise"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 isMulti
//                 options={destinationExpertiseOptions}
//                 value={destinationExpertiseOptions.filter((option) => field.value?.includes(option.value))}
//                 onChange={(selected) => field.onChange(selected.map((option) => option.value))}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//                 isDisabled={true}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Languages Spoken</label>
//           <Controller
//             name="language"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 isMulti
//                 options={languageOptions}
//                 value={languageOptions.filter((option) => field.value?.includes(option.value))}
//                 onChange={(selected) => field.onChange(selected.map((option) => option.value))}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//                 isDisabled={true}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Current Designation</label>
//           <input
//             type="text"
//             {...register("designation")}
//             className="w-full p-3 border border-gray-300 rounded-2xl bg-white shadow-lg"
//             disabled
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Current Organization</label>
//           <input
//             type="text"
//             {...register("organization")}
//             className="w-full p-3 border border-gray-300 rounded-2xl bg-white shadow-lg"
//             disabled
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Website (optional)</label>
//           <input
//             type="url"
//             {...register("website")}
//             className="w-full p-3 border border-gray-300 rounded-2xl bg-white shadow-lg"
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Facebook (optional)</label>
//           <input
//             type="url"
//             {...register("facebook")}
//             className="w-full p-3 border border-gray-300 rounded-2xl bg-white shadow-lg"
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Instagram (optional)</label>
//           <input
//             type="url"
//             {...register("instagram")}
//             className="w-full p-3 border border-gray-300 rounded-2xl bg-white shadow-lg"
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">LinkedIn (optional)</label>
//           <input
//             type="url"
//             {...register("linkedin")}
//             className="w-full p-3 border border-gray-300 rounded-2xl bg-white shadow-lg"
//           />
//         </div>
//       </div>
//       {userData && (
//         <div className="pt-4 flex justify-center">
//           <button
//             type="button"
//             onClick={handleNext}
//             className="bg-primary text-white px-16 py-3 rounded-full w-5/6 md:w-1/4 flex items-center justify-center cursor-pointer"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// // Step 2 Component
// const Step2 = ({ setStep }) => {
//   const { register, formState: { errors }, handleSubmit } = useFormContext();

//   const handleNext = async (data) => {
//     // Validate yearsOfExperience explicitly
//     if (typeof data.yearsOfExperience !== "number" || data.yearsOfExperience < 0) {
//       return;
//     }
//     setStep(3);
//   };

//   return (
//     <div className="space-y-4 p-6 lg:px-32 bg-secondary rounded-[40px]">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm text-formtext mb-1">Years of Experience</label>
//           <input
//             type="number"
//             placeholder="Years of Experience"
//             {...register("yearsOfExperience", { valueAsNumber: true, min: 0 })}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//           />
//           {errors.yearsOfExperience && (
//             <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience.message}</p>
//           )}
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Tagline</label>
//           <input
//             type="text"
//             placeholder="Tagline"
//             {...register("tagline")}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//           />
//           {errors.tagline && (
//             <p className="text-red-500 text-sm mt-1">{errors.tagline.message}</p>
//           )}
//         </div>
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1">About yourself</label>
//           <textarea
//             placeholder="About yourself"
//             {...register("about")}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//             rows="3"
//           />
//           {errors.about && (
//             <p className="text-red-500 text-sm mt-1">{errors.about.message}</p>
//           )}
//         </div>
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1 flex items-center">
//             Upload your profile picture
//             <CustomTooltip image={"/user.png"}>
//               <span className="ml-2 text-formtext cursor-pointer">
//                 <FaQuestionCircle />
//               </span>
//             </CustomTooltip>
//           </label>
//           <input
//             type="file"
//             {...register("profilePicture")}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//             accept="image/jpeg,image/png,image/jpg"
//           />
//         </div>
//       </div>
//       <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4">
//         <button
//           type="button"
//           onClick={() => setStep(1)}
//           className="bg-gray-200 text-formtext px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
//         >
//           Back
//         </button>
//         <button
//           type="button"
//           onClick={handleSubmit(handleNext)}
//           className="bg-primary text-white px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// // Step 3 Component
// const Step3 = ({ setStep }) => {
//   const { register, control, formState: { errors }, watch, setValue, handleSubmit } = useFormContext();
//   const [workSamples, setWorkSamples] = useState([]);
//   const [certificationFiles, setCertificationFiles] = useState([]);
//   const [testimonials, setTestimonials] = useState([]);
//   const [newTestimonial, setNewTestimonial] = useState("");
//   const isCertified = watch("certifications");

//   useEffect(() => {
//     setValue("workSamples", workSamples);
//     setValue("certificationFiles", certificationFiles);
//     setValue("testimonials", testimonials);
//   }, [workSamples, certificationFiles, testimonials, setValue]);

//   const handleFileChange = (e, setFiles) => {
//     const files = Array.from(e.target.files || []);
//     setFiles((prev) => [...prev, ...files]);
//   };

//   const removeFile = (index, setFiles) => {
//     setFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   const addTestimonial = () => {
//     if (newTestimonial.trim()) {
//       setTestimonials((prev) => [...prev, newTestimonial.trim()]);
//       setNewTestimonial("");
//     }
//   };

//   const removeTestimonial = (index) => {
//     setTestimonials((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleNext = () => {
//     setStep(4);
//   };

//   return (
//     <div className="space-y-4 p-6 lg:px-32 bg-secondary rounded-[40px]">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         {/* Other fields unchanged */}
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1 flex items-center">
//             Upload any relevant certifications or recognitions (optional)
//             <CustomTooltip icon={<FaRegFileAlt />}>
//               <span className="ml-2 text-formtext cursor-pointer">
//                 <FaQuestionCircle />
//               </span>
//             </CustomTooltip>
//           </label>
//           <input
//             type="file"
//             onChange={(e) => handleFileChange(e, setCertificationFiles)}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg mb-2"
//             multiple
//             accept="image/jpeg,image/png,application/pdf"
//           />
//           {certificationFiles.length > 0 && (
//             <div className="flex flex-wrap gap-2">
//               {certificationFiles.map((file, index) => (
//                 <div key={index} className="flex items-center bg-gray-100 p-2 rounded-full">
//                   <span className="text-sm text-formtext">{file.name}</span>
//                   <button
//                     type="button"
//                     onClick={() => removeFile(index, setCertificationFiles)}
//                     className="ml-2 text-red-500"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1 flex items-center">
//             Upload any relevant work samples (optional)
//             <CustomTooltip image={"/tooltip.svg"}>
//               <span className="ml-2 text-formtext cursor-pointer">
//                 <FaQuestionCircle />
//               </span>
//             </CustomTooltip>
//           </label>
//           <input
//             type="file"
//             onChange={(e) => handleFileChange(e, setWorkSamples)}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg mb-2"
//             multiple
//             accept="image/jpeg,image/png,application/pdf"
//           />
//           {workSamples.length > 0 && (
//             <div className="flex flex-wrap gap-2">
//               {workSamples.map((file, index) => (
//                 <div key={index} className="flex items-center bg-gray-100 p-2 rounded-full">
//                   <span className="text-sm text-formtext">{file.name}</span>
//                   <button
//                     type="button"
//                     onClick={() => removeFile(index, setWorkSamples)}
//                     className="ml-2 text-red-500"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         {/* Testimonials unchanged */}
//       </div>
//       <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4">
//         <button
//           type="button"
//           onClick={() => setStep(2)}
//           className="bg-gray-200 text-formtext px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
//         >
//           Back
//         </button>
//         <button
//           type="button"
//           onClick={handleSubmit(handleNext)}
//           className="bg-primary text-white px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// // Step 4 Component
// const Step4 = ({ userData, setStep, showModal, resetForm }) => {
//   const { register, control, formState: { errors }, handleSubmit, watch } = useFormContext();
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const onSubmit = async (data) => {
//     setIsSubmitting(true);
//     try {
//       if (!userData?.inviteCode) {
//         showModal("error", "Invite code is missing. Please go back to Step 1 and enter a valid invite code.");
//         return;
//       }
  
//       const formData = new FormData();
//       // Append all fields, ensuring arrays are stringified and files are handled
//       const fields = {
//         inviteCode: userData.inviteCode,
//         fullName: userData.fullName || "",
//         email: userData.email || "",
//         phone: userData.phone || "",
//         city: userData.city || "",
//         country: userData.country || "",
//         typeOfTravel: JSON.stringify(data.typeOfTravel || []),
//         industrySegment: JSON.stringify(data.industrySegment || []),
//         destinationExpertise: JSON.stringify(data.destinationExpertise || []),
//         language: JSON.stringify(data.language || []),
//         designation: userData.designation || "",
//         organization: userData.organization || "",
//         website: data.website || "",
//         facebook: data.facebook || "",
//         instagram: data.instagram || "",
//         linkedin: data.linkedin || "",
//         tagline: data.tagline || "",
//         about: data.about || "",
//         certifications: data.certifications || "",
//         organizationName: data.certifications === "Yes" ? data.organizationName : "",
//         access: data.access || "",
//         paidConsultations: data.paidConsultations || "",
//         industryDiscussions: data.industryDiscussions || "",
//         yearsOfExperience: (data.yearsOfExperience ?? 0).toString(),
//         testimonials: JSON.stringify(data.testimonials || []),
//         declaration: data.declaration.toString(),
//       };
  
//       // Append all non-file fields
//       Object.entries(fields).forEach(([key, value]) => {
//         formData.append(key, value);
//       });
  
//       // Append profile picture
//       if (data.profilePicture && data.profilePicture[0]) {
//         formData.append("profilePicture", data.profilePicture[0]);
//       }
  
//       // Append work samples
//       if (data.workSamples && data.workSamples.length > 0) {
//         data.workSamples.forEach((file, index) => {
//           if (file instanceof File) {
//             formData.append(`workSamples[${index}]`, file);
//           }
//         });
//       }
  
//       // Append certification files
//       if (data.certificationFiles && data.certificationFiles.length > 0) {
//         data.certificationFiles.forEach((file, index) => {
//           if (file instanceof File) {
//             formData.append(`certificationFiles[${index}]`, file);
//           }
//         });
//       }
  
//       console.log("Submitting FormData:", Object.fromEntries(formData));
  
//       const response = await fetch("/api/profile", {
//         method: "POST",
//         body: formData,
//       });
  
//       const result = await response.json();
//       if (response.ok) {
//         showModal("success", "Profile completed successfully!");
//         resetForm();
//       } else {
//         showModal("error", result.error || "Failed to submit profile");
//       }
//     } catch (error) {
//       showModal("error", "Network error: Unable to submit profile. Please try again later.");
//       console.error("Submit error:", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-4 p-6 lg:px-32 bg-secondary rounded-[40px]">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1">
//             Are you open to participating in industry discussions, webinars, or content creation? (optional)
//           </label>
//           <Controller
//             name="industryDiscussions"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 {...field}
//                 options={yesNoOptions}
//                 value={yesNoOptions.find((option) => option.value === field.value) || null}
//                 onChange={(selected) => field.onChange(selected?.value)}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//               />
//             )}
//           />
//         </div>
//         <div className="lg:col-span-2">
//           <label className="flex items-center text-lg text-formtext">Final Declaration</label>
//           <label className="flex items-center text-sm text-formtext">
//             <input
//               type="checkbox"
//               {...register("declaration")}
//               className="mr-2 h-4 w-4 text-formtext"
//             />
//             I confirm that the information provided is true and adheres to Xmytravel Experts professional and ethical standards
//           </label>
//           {errors.declaration && (
//             <p className="text-red-500 text-sm mt-1">{errors.declaration.message}</p>
//           )}
//         </div>
//       </div>
//       <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4">
//         <button
//           type="button"
//           onClick={() => setStep(3)}
//           className="bg-gray-200 text-formtext px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
//         >
//           Back
//         </button>
//         <button
//           type="submit"
//           onClick={handleSubmit(onSubmit)}
//           disabled={isSubmitting}
//           className={`bg-primary text-white px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer ${
//             isSubmitting ? "opacity-50 cursor-not-allowed" : ""
//           }`}
//         >
//           {isSubmitting ? (
//             <svg
//               className="animate-spin h-5 w-5 mr-2 text-white"
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//             >
//               <circle
//                 className="opacity-25"
//                 cx="12"
//                 cy="12"
//                 r="10"
//                 stroke="currentColor"
//                 strokeWidth="4"
//               ></circle>
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//               ></path>
//             </svg>
//           ) : null}
//           {isSubmitting ? "Submitting..." : "Submit"}
//         </button>
//       </div>
//     </div>
//   );
// };

// // Main ProfilePage Component
// export default function ProfilePage() {
//   const [step, setStep] = useState(1);
//   const [userData, setUserData] = useState(null);
//   const [modalState, setModalState] = useState({
//     isOpen: false,
//     type: "success",
//     message: "",
//   });

//   const getSchema = (step) => {
//     switch (step) {
//       case 1:
//         return step1Schema;
//       case 2:
//         return step2Schema;
//       case 3:
//         return step3Schema;
//       case 4:
//         return step4Schema;
//       default:
//         return step1Schema;
//     }
//   };

//   const methods = useForm({
//     resolver: zodResolver(getSchema(step)),
//     mode: "onChange",
//     defaultValues: {
//       inviteCode: "",
//       fullName: "",
//       email: "",
//       phone: "",
//       city: "",
//       country: "",
//       typeOfTravel: [],
//       industrySegment: [],
//       destinationExpertise: [],
//       language: [],
//       designation: "",
//       organization: "",
//       website: "",
//       facebook: "",
//       instagram: "",
//       linkedin: "",
//       tagline: "",
//       about: "",
//       certifications: "",
//       organizationName: "",
//       certificationFiles: [],
//       access: "",
//       paidConsultations: "",
//       industryDiscussions: "",
//       yearsOfExperience: 0,
//       profilePicture: null,
//       declaration: false,
//       workSamples: [],
//       testimonials: [],
//     },
//   });

//   useEffect(() => {
//     methods.reset(methods.getValues(), {
//       keepValues: true,
//       keepDefaultValues: false,
//     });
//     methods.trigger();
//   }, [step, methods]);

//   const showModal = (type, message) => {
//     setModalState({ isOpen: true, type, message });
//   };

//   const closeModal = () => {
//     setModalState({ isOpen: false, type: "success", message: "" });
//   };

//   const resetForm = () => {
//     methods.reset({
//       inviteCode: "",
//       fullName: "",
//       email: "",
//       phone: "",
//       city: "",
//       country: "",
//       typeOfTravel: [],
//       industrySegment: [],
//       destinationExpertise: [],
//       language: [],
//       designation: "",
//       organization: "",
//       website: "",
//       facebook: "",
//       instagram: "",
//       linkedin: "",
//       tagline: "",
//       about: "",
//       certifications: "",
//       organizationName: "",
//       certificationFiles: [],
//       access: "",
//       paidConsultations: "",
//       industryDiscussions: "",
//       yearsOfExperience: 0,
//       profilePicture: null,
//       declaration: false,
//       workSamples: [],
//       testimonials: [],
//     });
//     setStep(1);
//     setUserData(null);
//   };

//   return (
//     <section className="py-4 bg-secondary min-h-screen">
//       <div className="container mx-auto px-4">
//         <div className="flex justify-center items-center mb-4">
//           <Image
//             src="/logolttx.svg"
//             width={350}
//             height={84}
//             alt="lttx"
//             className="bg-primary rounded-full px-4"
//           />
//         </div>
//         <ProgressBar currentStep={step} />
//         <TooltipProvider>
//           <FormProvider {...methods}>
//             <form className="space-y-6">
//               {step === 1 && <Step1 setStep={setStep} setUserData={setUserData} userData={userData} />}
//               {step === 2 && <Step2 setStep={setStep} />}
//               {step === 3 && <Step3 setStep={setStep} />}
//               {step === 4 && (
//                 <Step4
//                   userData={userData}
//                   setStep={setStep}
//                   showModal={showModal}
//                   resetForm={resetForm}
//                 />
//               )}
//             </form>
//           </FormProvider>
//         </TooltipProvider>
//         <Modal
//           isOpen={modalState.isOpen}
//           onClose={closeModal}
//           type={modalState.type}
//           message={modalState.message}
//         />
//       </div>
//     </section>
//   );
// }

// "use client";
// import React, { useState, useEffect } from "react";
// import { useForm, FormProvider, useFormContext, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useSearchParams } from "next/navigation";
// import PhoneInput from "react-phone-input-2";
// import dynamic from "next/dynamic";
// import "react-phone-input-2/lib/style.css";
// import Image from "next/image";
// import { FaQuestionCircle, FaRegFileAlt } from "react-icons/fa";
// import Modal from "../components/Modal";
// import CustomTooltip from "../components/CustomTooltip";
// import { TooltipProvider } from "@/components/ui/tooltip";

// // Dynamically import react-select with SSR disabled
// const Select = dynamic(() => import("react-select"), { ssr: false });

// // ProgressBar for Four Steps
// const ProgressBar = ({ step }) => {
//   return (
//     <div className="flex items-center justify-center mb-8">
//       <div className="flex items-center">
//         <div
//           className={`w-8 h-8 rounded-full flex items-center justify-center ${
//             step >= 1 ? "bg-primary text-white" : "bg-gray-200 text-formtext"
//           }`}
//         >
//           1
//         </div>
//         <div className={`h-1 w-12 ${step >= 2 ? "bg-primary" : "bg-gray-200"}`}></div>
//       </div>
//       <div className="flex items-center">
//         <div
//           className={`w-8 h-8 rounded-full flex items-center justify-center ${
//             step >= 2 ? "bg-primary text-white" : "bg-gray-200 text-formtext"
//           }`}
//         >
//           2
//         </div>
//         <div className={`h-1 w-12 ${step >= 3 ? "bg-primary" : "bg-gray-200"}`}></div>
//       </div>
//       <div className="flex items-center">
//         <div
//           className={`w-8 h-8 rounded-full flex items-center justify-center ${
//             step >= 3 ? "bg-primary text-white" : "bg-gray-200 text-formtext"
//           }`}
//         >
//           3
//         </div>
//         <div className={`h-1 w-12 ${step >= 4 ? "bg-primary" : "bg-gray-200"}`}></div>
//       </div>
//       <div
//         className={`w-8 h-8 rounded-full flex items-center justify-center ${
//           step === 4 ? "bg-primary text-white" : "bg-gray-200 text-formtext"
//         }`}
//       >
//         4
//       </div>
//     </div>
//   );
// };

// // Validation schemas
// const step1Schema = z.object({
//   inviteCode: z.string().min(1, "Invite Code is required"),
//   fullName: z.string().optional(),
//   email: z.string().optional(),
//   phone: z.string().optional(),
//   city: z.string().optional(),
//   country: z.string().optional(),
//   typeOfTravel: z.array(z.string()).optional(),
//   industrySegment: z.array(z.string()).optional(),
//   destinationExpertise: z.array(z.string()).optional(),
//   language: z.array(z.string()).optional(),
//   designation: z.string().optional(),
//   organization: z.string().optional(),
//   website: z.string().optional(),
//   facebook: z.string().optional(),
//   instagram: z.string().optional(),
//   linkedin: z.string().optional(),
// });

// const step2Schema = z.object({
//   tagline: z.string().min(1, "Tagline is required"),
//   about: z.string().min(1, "About yourself is required"),
//   yearsOfExperience: z.number().min(0, "Years of experience is required"),
//   profilePicture: z.any().optional(),
// });

// const step3Schema = z.object({
//   certifications: z.string().optional(),
//   organizationName: z.string().optional(),
//   certificationFiles: z.any().optional(),
//   access: z.string().optional(),
//   paidConsultations: z.string().optional(),
//   workSamples: z.any().optional(),
//   testimonials: z.array(z.string()).optional(),
// });

// const step4Schema = z.object({
//   industryDiscussions: z.string().optional(),
//   declaration: z.boolean().refine((val) => val === true, {
//     message: "You must agree to the declaration",
//   }),
// });

// // Options for dropdowns
// const yesNoOptions = [
//   { value: "Yes", label: "Yes" },
//   { value: "No", label: "No" },
// ];

// const typeOfTravelOptions = [
//   { value: "Leisure", label: "Leisure" },
//   { value: "Corporate / Business", label: "Corporate / Business" },
//   { value: "Luxury", label: "Luxury" },
//   { value: "Adventure", label: "Adventure" },
//   { value: "Group Travel", label: "Group Travel" },
// ];

// const industrySegmentOptions = [
//   { value: "Airlines", label: "Airlines" },
//   { value: "Cruises", label: "Cruises" },
//   { value: "Hotels & Resorts", label: "Hotels & Resorts" },
// ];

// const destinationExpertiseOptions = [
//   { value: "North America", label: "North America" },
//   { value: "Europe", label: "Europe" },
//   { value: "Asia", label: "Asia" },
// ];

// const languageOptions = [
//   { value: "English", label: "English" },
//   { value: "Spanish", label: "Spanish" },
//   { value: "French", label: "French" },
//   { value: "Mandarin Chinese", label: "Mandarin Chinese" },
// ];

// // Step 1 Component
// const Step1 = ({ setStep, setUserData, userData }) => {
//   const { register, formState: { errors }, handleSubmit, setValue, control } = useFormContext();
//   const searchParams = useSearchParams();
//   const inviteCodeFromUrl = searchParams.get("inviteCode");

//   useEffect(() => {
//     if (inviteCodeFromUrl) {
//       setValue("inviteCode", inviteCodeFromUrl);
//       handleSubmit(onSubmit)();
//     }
//   }, [inviteCodeFromUrl, setValue, handleSubmit]);

//   useEffect(() => {
//     if (userData) {
//       setValue("fullName", userData.fullName || "");
//       setValue("email", userData.email || "");
//       setValue("phone", userData.phone || "");
//       setValue("city", userData.city || "");
//       setValue("country", userData.country || "");
//       setValue("typeOfTravel", userData.typeOfTravel || []);
//       setValue("industrySegment", userData.industrySegment || []);
//       setValue("destinationExpertise", userData.destinationExpertise || []);
//       setValue("language", userData.language || []);
//       setValue("designation", userData.designation || "");
//       setValue("organization", userData.organization || "");
//       setValue("website", userData.website || "");
//       setValue("facebook", userData.facebook || "");
//       setValue("instagram", userData.instagram || "");
//       setValue("linkedin", userData.linkedin || "");
//     }
//   }, [userData, setValue]);

//   const onSubmit = async (data) => {
//     try {
//       const response = await fetch("/api/profile", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ inviteCode: data.inviteCode }),
//       });
//       const result = await response.json();
//       console.log("Step 1 Response:", result);
//       if (response.ok) {
//         setUserData({ ...result.userData, inviteCode: data.inviteCode });
//         setStep(2); // Auto-advance to Step 2
//       } else {
//         showModal("error", result.error || "Invalid invite code. Please try again.");
//       }
//     } catch (error) {
//       console.error("Fetch error:", error.message, error.stack);
//       showModal("error", `Network error: ${error.message}. Please check your connection and try again.`);
//     }
//   };

//   const showModal = (type, message) => {
//     setUserData((prev) => ({ ...prev, modalState: { isOpen: true, type, message } }));
//   };

//   return (
//     <div className="space-y-4 p-6 lg:px-32 bg-secondary rounded-[40px]">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div className="lg:col-span-1">
//           <label htmlFor="inviteCode" className="block text-sm text-formtext mb-1">Invite Code</label>
//           <input
//             type="text"
//             placeholder="Invite Code"
//             id="inviteCode"
//             {...register("inviteCode")}
//             className="w-full p-3 border border-gray-300 rounded-2xl bg-white h-12 shadow-lg"
//           />
//           {errors.inviteCode && (
//             <p className="text-red-500 text-sm mt-1">{errors.inviteCode.message}</p>
//           )}
//         </div>
//         <div className="lg:col-span-1 flex items-end">
//           <button
//             type="submit"
//             onClick={handleSubmit(onSubmit)}
//             className="bg-primary text-white p-3 rounded-2xl w-full h-12 flex items-center justify-center"
//           >
//             Submit
//           </button>
//         </div>
//       </div>
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm text-formtext mb-1">Full Name</label>
//           <input
//             type="text"
//             {...register("fullName")}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//             disabled
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Email</label>
//           <input
//             type="email"
//             {...register("email")}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//             disabled
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Phone</label>
//           <Controller
//             name="phone"
//             control={control}
//             render={({ field }) => (
//               <PhoneInput
//                 country="in"
//                 value={field.value}
//                 onChange={field.onChange}
//                 disabled
//                 inputProps={{
//                   className: "w-full p-3 border px-12 bg-white border-gray-300 rounded-2xl shadow-lg",
//                 }}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">City</label>
//           <input
//             type="text"
//             {...register("city")}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//             disabled
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Country</label>
//           <input
//             type="text"
//             {...register("country")}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Type of Travel</label>
//           <Controller
//             name="typeOfTravel"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 isMulti
//                 options={typeOfTravelOptions}
//                 value={typeOfTravelOptions.filter((option) => field.value?.includes(option.value))}
//                 onChange={(selected) => field.onChange(selected.map((option) => option.value))}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//                 isDisabled={true}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Industry Segment</label>
//           <Controller
//             name="industrySegment"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 isMulti
//                 options={industrySegmentOptions}
//                 value={industrySegmentOptions.filter((option) => field.value?.includes(option.value))}
//                 onChange={(selected) => field.onChange(selected.map((option) => option.value))}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//                 isDisabled={true}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Destination Expertise</label>
//           <Controller
//             name="destinationExpertise"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 isMulti
//                 options={destinationExpertiseOptions}
//                 value={destinationExpertiseOptions.filter((option) => field.value?.includes(option.value))}
//                 onChange={(selected) => field.onChange(selected.map((option) => option.value))}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//                 isDisabled={true}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Languages Spoken</label>
//           <Controller
//             name="language"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 isMulti
//                 options={languageOptions}
//                 value={languageOptions.filter((option) => field.value?.includes(option.value))}
//                 onChange={(selected) => field.onChange(selected.map((option) => option.value))}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//                 isDisabled={true}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Current Designation</label>
//           <input
//             type="text"
//             {...register("designation")}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//             disabled
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Current Organization</label>
//           <input
//             type="text"
//             {...register("organization")}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//             disabled
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Website (optional)</label>
//           <input
//             type="url"
//             {...register("website")}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Facebook (optional)</label>
//           <input
//             type="url"
//             {...register("facebook")}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Instagram (optional)</label>
//           <input
//             type="url"
//             {...register("instagram")}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">LinkedIn (optional)</label>
//           <input
//             type="url"
//             {...register("linkedin")}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//           />
//         </div>
//       </div>
//       {userData && (
//         <div className="pt-4 flex justify-center">
//           <button
//             type="button"
//             onClick={() => setStep(2)}
//             className="bg-primary text-white px-16 py-3 rounded-full w-5/6 md:w-1/4 flex items-center justify-center cursor-pointer"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// // Step 2 Component (Basic Introduction)
// const Step2 = ({ setStep, showModal }) => {
//   const { register, formState: { errors }, trigger } = useFormContext();

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     const maxSize = 5 * 1024 * 1024; // 5MB
//     const validTypes = ["image/jpeg", "image/png", "image/jpg"];

//     if (file) {
//       if (file.size > maxSize) {
//         showModal("error", `File ${file.name} is too large. Maximum size is 5MB.`);
//         return false;
//       }
//       if (!validTypes.includes(file.type)) {
//         showModal("error", `File ${file.name} has an invalid type. Allowed types: JPEG, PNG, JPG.`);
//         return false;
//       }
//     }
//     return true;
//   };

//   const handleNext = async () => {
//     const isValid = await trigger(["tagline", "about", "yearsOfExperience", "profilePicture"]);
//     if (isValid) {
//       setStep(3);
//     }
//   };

//   return (
//     <div className="space-y-4 p-6 lg:px-32 bg-secondary rounded-[40px]">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm text-formtext mb-1">Years of Experience</label>
//           <input
//             type="number"
//             placeholder="Years of Experience"
//             {...register("yearsOfExperience", { valueAsNumber: true })}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//           />
//           {errors.yearsOfExperience && (
//             <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience.message}</p>
//           )}
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Tagline</label>
//           <input
//             type="text"
//             placeholder="Tagline"
//             {...register("tagline")}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//           />
//           {errors.tagline && (
//             <p className="text-red-500 text-sm mt-1">{errors.tagline.message}</p>
//           )}
//         </div>
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1">About Yourself</label>
//           <textarea
//             placeholder="About yourself"
//             {...register("about")}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//             rows="3"
//           />
//           {errors.about && (
//             <p className="text-red-500 text-sm mt-1">{errors.about.message}</p>
//           )}
//         </div>
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1 flex items-center">
//             Upload your profile picture
//             <CustomTooltip image={"/user.png"}>
//               <span className="ml-2 text-formtext cursor-pointer">
//                 <FaQuestionCircle />
//               </span>
//             </CustomTooltip>
//           </label>
//           <input
//             type="file"
//             {...register("profilePicture")}
//             onChange={handleFileChange}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//             accept="image/jpeg,image/png,image/jpg"
//           />
//         </div>
//       </div>
//       <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4">
//         <button
//           type="button"
//           onClick={() => setStep(1)}
//           className="bg-gray-200 text-formtext px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
//         >
//           Previous
//         </button>
//         <button
//           type="button"
//           onClick={handleNext}
//           className="bg-primary text-white px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// // Step 3 Component (Professional Credentials & Experience)
// const Step3 = ({ setStep, showModal }) => {
//   const { register, control, formState: { errors }, watch, setValue, trigger } = useFormContext();
//   const [workSamples, setWorkSamples] = useState([]);
//   const [certificationFiles, setCertificationFiles] = useState([]);
//   const [testimonials, setTestimonials] = useState([]);
//   const [newTestimonial, setNewTestimonial] = useState("");
//   const isCertified = watch("certifications");

//   useEffect(() => {
//     setValue("workSamples", workSamples);
//     setValue("certificationFiles", certificationFiles);
//     setValue("testimonials", testimonials);
//   }, [workSamples, certificationFiles, testimonials, setValue]);

//   const handleFileChange = (e, setFiles) => {
//     const files = Array.from(e.target.files);
//     const maxSize = 5 * 1024 * 1024; // 5MB
//     const validTypes = ["image/jpeg", "image/png", "application/pdf"];

//     const validFiles = files.filter((file) => {
//       if (file.size > maxSize) {
//         showModal("error", `File ${file.name} is too large. Maximum size is 5MB.`);
//         return false;
//       }
//       if (!validTypes.includes(file.type)) {
//         showModal("error", `File ${file.name} has an invalid type. Allowed types: JPEG, PNG, PDF.`);
//         return false;
//       }
//       return true;
//     });

//     setFiles((prev) => [...prev, ...validFiles]);
//   };

//   const removeFile = (file, setFiles) => {
//     setFiles((prev) => prev.filter((f) => f !== file));
//   };

//   const addTestimonial = () => {
//     if (newTestimonial.trim()) {
//       setTestimonials((prev) => [...prev, newTestimonial.trim()]);
//       setNewTestimonial("");
//     }
//   };

//   const removeTestimonial = (index) => {
//     setTestimonials((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleNext = async () => {
//     const isValid = await trigger([
//       "certifications",
//       "organizationName",
//       "certificationFiles",
//       "access",
//       "paidConsultations",
//       "workSamples",
//       "testimonials",
//     ]);
//     if (isValid) {
//       setStep(4);
//     }
//   };

//   return (
//     <div className="space-y-4 p-6 lg:px-32 bg-secondary rounded-[40px]">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm text-formtext mb-1">
//             Are you certified by any recognized travel organizations?
//           </label>
//           <Controller
//             name="certifications"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 {...field}
//                 options={yesNoOptions}
//                 value={yesNoOptions.find((option) => option.value === field.value) || null}
//                 onChange={(selected) => field.onChange(selected?.value)}
//                 className="w-full mb-2 shadow-lg"
//                 classNamePrefix="custom-select"
//               />
//             )}
//           />
//         </div>
//         {isCertified === "Yes" && (
//           <div>
//             <label className="block text-sm text-formtext mb-1">Organization Name</label>
//             <input
//               type="text"
//               placeholder="Organization Name"
//               {...register("organizationName")}
//               className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//             />
//           </div>
//         )}
//         {!isCertified && <div></div>} {/* Placeholder for grid alignment */}
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1 flex items-center">
//             Upload any relevant certifications or recognitions (optional)
//             <CustomTooltip icon={<FaRegFileAlt />}>
//               <span className="ml-2 text-formtext cursor-pointer">
//                 <FaQuestionCircle />
//               </span>
//             </CustomTooltip>
//           </label>
//           <input
//             type="file"
//             onChange={(e) => handleFileChange(e, setCertificationFiles)}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg mb-2"
//             multiple
//             accept="image/jpeg,image/png,application/pdf"
//           />
//           {certificationFiles.length > 0 && (
//             <div className="flex flex-wrap gap-2">
//               {certificationFiles.map((file, index) => (
//                 <div key={index} className="flex items-center bg-gray-100 p-2 rounded-full">
//                   <span className="text-sm text-formtext">{file.name}</span>
//                   <button
//                     type="button"
//                     onClick={() => removeFile(file, setCertificationFiles)}
//                     className="ml-2 text-red-500"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">
//             Have you previously provided travel consultations?
//           </label>
//           <Controller
//             name="access"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 {...field}
//                 options={yesNoOptions}
//                 value={yesNoOptions.find((option) => option.value === field.value) || null}
//                 onChange={(selected) => field.onChange(selected?.value)}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">
//             Are you comfortable providing paid travel consultations via Xmytravel Experts?
//           </label>
//           <Controller
//             name="paidConsultations"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 {...field}
//                 options={yesNoOptions}
//                 value={yesNoOptions.find((option) => option.value === field.value) || null}
//                 onChange={(selected) => field.onChange(selected?.value)}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//               />
//             )}
//           />
//         </div>
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1 flex items-center">
//             Upload any relevant work samples (optional)
//             <CustomTooltip image={"/tooltip.svg"}>
//               <span className="ml-2 text-formtext cursor-pointer">
//                 <FaQuestionCircle />
//               </span>
//             </CustomTooltip>
//           </label>
//           <input
//             type="file"
//             onChange={(e) => handleFileChange(e, setWorkSamples)}
//             className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg mb-2"
//             multiple
//             accept="image/jpeg,image/png,application/pdf"
//           />
//           {workSamples.length > 0 && (
//             <div className="flex flex-wrap gap-2">
//               {workSamples.map((file, index) => (
//                 <div key={index} className="flex items-center bg-gray-100 p-2 rounded-full">
//                   <span className="text-sm text-formtext">{file.name}</span>
//                   <button
//                     type="button"
//                     onClick={() => removeFile(file, setWorkSamples)}
//                     className="ml-2 text-red-500"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1 flex items-center">
//             Customer testimonials (optional)
//             <CustomTooltip
//               description={
//                 "I got a good tour plan within 2 days only with all sight seeings for Somnath, nageshwar and dwarkadhish temple along with Gir National park. He is such a friendly person and got my all queries cleared and gave me some additional information too. - Akanksha vyas"
//               }
//             >
//               <span className="ml-2 text-formtext cursor-pointer">
//                 <FaQuestionCircle />
//               </span>
//             </CustomTooltip>
//           </label>
//           <div className="flex gap-2 mb-2">
//             <input
//               type="text"
//               value={newTestimonial}
//               onChange={(e) => setNewTestimonial(e.target.value)}
//               placeholder="Enter a testimonial"
//               className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
//               maxLength={500}
//             />
//             <button
//               type="button"
//               onClick={addTestimonial}
//               className="bg-primary text-white px-4 py-2 rounded-2xl"
//             >
//               Add
//             </button>
//           </div>
//           {testimonials.length > 0 && (
//             <div className="flex flex-col gap-2">
//               {testimonials.map((testimonial, index) => (
//                 <div key={index} className="flex items-center bg-gray-100 p-2 rounded-full">
//                   <span className="text-sm text-formtext">{testimonial}</span>
//                   <button
//                     type="button"
//                     onClick={() => removeTestimonial(index)}
//                     className="ml-2 text-red-500"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4">
//         <button
//           type="button"
//           onClick={() => setStep(2)}
//           className="bg-gray-200 text-formtext px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
//         >
//           Previous
//         </button>
//         <button
//           type="button"
//           onClick={handleNext}
//           className="bg-primary text-white px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// // Step 4 Component (Engagement & Final Declaration)
// const Step4 = ({ userData, setStep, showModal, resetForm }) => {
//   const { register, control, formState: { errors }, handleSubmit } = useFormContext();
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const onSubmit = async (data) => {
//     setIsSubmitting(true);
//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

//     try {
//       if (!userData?.inviteCode) {
//         showModal("error", "Invite code is missing. Please go back to Step 1 and enter a valid invite code.");
//         setIsSubmitting(false);
//         return;
//       }

//       const formData = new FormData();
//       formData.append("inviteCode", userData.inviteCode);
//       formData.append("fullName", userData.fullName || "");
//       formData.append("email", userData.email || "");
//       formData.append("phone", userData.phone || "");
//       formData.append("city", userData.city || "");
//       formData.append("country", userData.country || "");
//       formData.append("typeOfTravel", JSON.stringify(userData.typeOfTravel || []));
//       formData.append("industrySegment", JSON.stringify(userData.industrySegment || []));
//       formData.append("destinationExpertise", JSON.stringify(userData.destinationExpertise || []));
//       formData.append("language", JSON.stringify(userData.language || []));
//       formData.append("designation", userData.designation || "");
//       formData.append("organization", userData.organization || "");
//       formData.append("website", data.website || "");
//       formData.append("facebook", data.facebook || "");
//       formData.append("instagram", data.instagram || "");
//       formData.append("linkedin", data.linkedin || "");
//       formData.append("tagline", data.tagline || "");
//       formData.append("about", data.about || "");
//       formData.append("certifications", data.certifications || "");
//       formData.append("organizationName", data.certifications === "Yes" ? data.organizationName : "");
//       formData.append("access", data.access || "");
//       formData.append("paidConsultations", data.paidConsultations || "");
//       formData.append("industryDiscussions", data.industryDiscussions || "");
//       formData.append("yearsOfExperience", data.yearsOfExperience.toString());
//       formData.append("testimonials", JSON.stringify(data.testimonials || []));
//       formData.append("declaration", data.declaration.toString());

//       if (data.profilePicture && data.profilePicture[0]) {
//         formData.append("profilePicture", data.profilePicture[0]);
//       }
//       if (data.workSamples && data.workSamples.length > 0) {
//         data.workSamples.forEach((file, index) => {
//           formData.append(`workSamples[${index}]`, file);
//         });
//       }
//       if (data.certificationFiles && data.certificationFiles.length > 0) {
//         data.certificationFiles.forEach((file, index) => {
//           formData.append(`certificationFiles[${index}]`, file);
//         });
//       }

//       console.log("Submitting FormData with inviteCode:", userData.inviteCode);

//       const response = await fetch("/api/profile", {
//         method: "POST",
//         body: formData,
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);
//       const result = await response.json();
//       console.log("Step 4 Response:", result);
//       if (response.ok) {
//         showModal("success", "Profile completed successfully!");
//         resetForm();
//       } else {
//         showModal("error", result.error || "Failed to submit profile. Please try again.");
//       }
//     } catch (error) {
//       clearTimeout(timeoutId);
//       console.error("Submit error:", error.message, error.stack);
//       if (error.name === "AbortError") {
//         showModal("error", "Request timed out. Please check your connection and try again.");
//       } else {
//         showModal("error", `Network error: ${error.message}. Please check your connection and try again.`);
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-4 p-6 lg:px-32 bg-secondary rounded-[40px]">
//       <h2 className="text-xl font-semibold text-formtext">Engagement & Final Declaration</h2>
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1">
//             Are you open to participating in industry discussions, webinars, or content creation? (optional)
//           </label>
//           <Controller
//             name="industryDiscussions"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 {...field}
//                 options={yesNoOptions}
//                 value={yesNoOptions.find((option) => option.value === field.value) || null}
//                 onChange={(selected) => field.onChange(selected?.value)}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//               />
//             )}
//           />
//         </div>
//         <div className="lg:col-span-2">
//           <label className="flex items-center text-lg text-formtext">Final Declaration</label>
//           <label className="flex items-center text-sm text-formtext">
//             <input
//               type="checkbox"
//               {...register("declaration")}
//               className="mr-2 h-4 w-4 text-formtext"
//             />
//             I confirm that the information provided is true and adheres to Xmytravel Experts professional and ethical standards
//           </label>
//           {errors.declaration && (
//             <p className="text-red-500 text-sm mt-1">{errors.declaration.message}</p>
//           )}
//         </div>
//       </div>
//       <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4">
//         <button
//           type="button"
//           onClick={() => setStep(3)}
//           className="bg-gray-200 text-formtext px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
//         >
//           Previous
//         </button>
//         <button
//           type="submit"
//           onClick={handleSubmit(onSubmit)}
//           disabled={isSubmitting}
//           className={`bg-primary text-white px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer ${
//             isSubmitting ? "opacity-50 cursor-not-allowed" : ""
//           }`}
//         >
//           {isSubmitting ? (
//             <svg
//               className="animate-spin h-5 w-5 mr-2 text-white"
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//             >
//               <circle
//                 className="opacity-25"
//                 cx="12"
//                 cy="12"
//                 r="10"
//                 stroke="currentColor"
//                 strokeWidth="4"
//               ></circle>
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//               ></path>
//             </svg>
//           ) : null}
//           {isSubmitting ? "Submitting..." : "Submit"}
//         </button>
//       </div>
//     </div>
//   );
// };

// // Main ProfilePage Component
// export default function ProfilePage() {
//   const [step, setStep] = useState(1);
//   const [userData, setUserData] = useState(null);
//   const [modalState, setModalState] = useState({
//     isOpen: false,
//     type: "success",
//     message: "",
//   });

//   const getSchema = (step) => {
//     switch (step) {
//       case 1:
//         return step1Schema;
//       case 2:
//         return step2Schema;
//       case 3:
//         return step3Schema;
//       case 4:
//         return step4Schema;
//       default:
//         return step1Schema;
//     }
//   };

//   const methods = useForm({
//     resolver: zodResolver(getSchema(step)),
//     mode: "onChange",
//     defaultValues: {
//       inviteCode: "",
//       fullName: "",
//       email: "",
//       phone: "",
//       city: "",
//       country: "",
//       typeOfTravel: [],
//       industrySegment: [],
//       destinationExpertise: [],
//       language: [],
//       designation: "",
//       organization: "",
//       website: "",
//       facebook: "",
//       instagram: "",
//       linkedin: "",
//       tagline: "",
//       about: "",
//       certifications: "",
//       organizationName: "",
//       certificationFiles: [],
//       access: "",
//       paidConsultations: "",
//       industryDiscussions: "",
//       yearsOfExperience: 0,
//       profilePicture: null,
//       declaration: false,
//       workSamples: [],
//       testimonials: [],
//     },
//   });

//   const showModal = (type, message) => {
//     setModalState({ isOpen: true, type, message });
//   };

//   const closeModal = () => {
//     setModalState({ isOpen: false, type: "success", message: "" });
//   };

//   const resetForm = () => {
//     methods.reset({
//       inviteCode: "",
//       fullName: "",
//       email: "",
//       phone: "",
//       city: "",
//       country: "",
//       typeOfTravel: [],
//       industrySegment: [],
//       destinationExpertise: [],
//       language: [],
//       designation: "",
//       organization: "",
//       website: "",
//       facebook: "",
//       instagram: "",
//       linkedin: "",
//       tagline: "",
//       about: "",
//       certifications: "",
//       organizationName: "",
//       certificationFiles: [],
//       access: "",
//       paidConsultations: "",
//       industryDiscussions: "",
//       yearsOfExperience: 0,
//       profilePicture: null,
//       declaration: false,
//       workSamples: [],
//       testimonials: [],
//     });
//     setStep(1);
//     setUserData(null);
//   };

//   // Pass showModal to Step2 and Step3
//   const step2Props = { setStep, showModal };
//   const step3Props = { setStep, showModal };

//   return (
//     <section className="py-4 bg-secondary min-h-screen">
//       <div className="container mx-auto px-4">
//         <div className="flex justify-center items-center mb-4">
//           <Image
//             src="/logolttx.svg"
//             width={350}
//             height={84}
//             alt="lttx"
//             className="bg-primary rounded-full px-4"
//           />
//         </div>
//         <ProgressBar step={step} />
//         <TooltipProvider>
//           <FormProvider {...methods}>
//             <form className="space-y-6">
//               {step === 1 && <Step1 setStep={setStep} setUserData={setUserData} userData={userData} />}
//               {step === 2 && <Step2 {...step2Props} />}
//               {step === 3 && <Step3 {...step3Props} />}
//               {step === 4 && (
//                 <Step4
//                   userData={userData}
//                   setStep={setStep}
//                   showModal={showModal}
//                   resetForm={resetForm}
//                 />
//               )}
//             </form>
//           </FormProvider>
//         </TooltipProvider>
//         <Modal
//           isOpen={modalState.isOpen}
//           onClose={closeModal}
//           type={modalState.type}
//           message={modalState.message}
//         />
//       </div>
//     </section>
//   );
// }

"use client";
import React, { useState, useEffect } from "react";
import { useForm, FormProvider, useFormContext, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import dynamic from "next/dynamic";
import "react-phone-input-2/lib/style.css";
import Image from "next/image";
import { FaQuestionCircle, FaRegFileAlt } from "react-icons/fa";
import Modal from "../components/Modal";
import CustomTooltip from "../components/CustomTooltip";
import { TooltipProvider } from "@/components/ui/tooltip";

// Dynamically import react-select with SSR disabled
const Select = dynamic(() => import("react-select"), { ssr: false });

// ProgressBar for Four Steps
const ProgressBar = ({ step }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 1 ? "bg-primary text-white" : "bg-gray-200 text-formtext"
          }`}
        >
          1
        </div>
        <div className={`h-1 w-12 ${step >= 2 ? "bg-primary" : "bg-gray-200"}`}></div>
      </div>
      <div className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 2 ? "bg-primary text-white" : "bg-gray-200 text-formtext"
          }`}
        >
          2
        </div>
        <div className={`h-1 w-12 ${step >= 3 ? "bg-primary" : "bg-gray-200"}`}></div>
      </div>
      <div className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 3 ? "bg-primary text-white" : "bg-gray-200 text-formtext"
          }`}
        >
          3
        </div>
        <div className={`h-1 w-12 ${step >= 4 ? "bg-primary" : "bg-gray-200"}`}></div>
      </div>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          step === 4 ? "bg-primary text-white" : "bg-gray-200 text-formtext"
        }`}
      >
        4
      </div>
    </div>
  );
};

// Validation schemas
const step1Schema = z.object({
  inviteCode: z.string().min(1, "Invite Code is required"),
  fullName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  typeOfTravel: z.array(z.string()).optional(),
  industrySegment: z.array(z.string()).optional(),
  destinationExpertise: z.array(z.string()).optional(),
  language: z.array(z.string()).optional(),
  designation: z.string().optional(),
  organization: z.string().optional(),
  website: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
});

const step2Schema = z.object({
  tagline: z.string().min(1, "Tagline is required"),
  about: z.string().min(1, "About yourself is required"),
  yearsOfExperience: z.number().min(0, "Years of experience is required"),
  profilePicture: z.any().optional(),
});

const step3Schema = z.object({
  certifications: z.string().optional(),
  organizationName: z.string().optional(),
  certificationFiles: z.any().optional(),
  access: z.string().optional(),
  paidConsultations: z.string().optional(),
  workSamples: z.any().optional(),
  testimonials: z.array(z.string()).optional(),
});

const step4Schema = z.object({
  industryDiscussions: z.string().optional(),
  declaration: z.boolean().refine((val) => val === true, {
    message: "You must agree to the declaration",
  }),
});

// Options for dropdowns
const yesNoOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const typeOfTravelOptions = [
  { value: "Leisure", label: "Leisure" },
  { value: "Corporate / Business", label: "Corporate / Business" },
  { value: "Luxury", label: "Luxury" },
  { value: "Adventure", label: "Adventure" },
  { value: "Group Travel", label: "Group Travel" },
];

const industrySegmentOptions = [
  { value: "Airlines", label: "Airlines" },
  { value: "Cruises", label: "Cruises" },
  { value: "Hotels & Resorts", label: "Hotels & Resorts" },
];

const destinationExpertiseOptions = [
  { value: "North America", label: "North America" },
  { value: "Europe", label: "Europe" },
  { value: "Asia", label: "Asia" },
];

const languageOptions = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "Mandarin Chinese", label: "Mandarin Chinese" },
];

// Step 1 Component
const Step1 = ({ setStep, setUserData, userData }) => {
  const { register, formState: { errors }, handleSubmit, setValue, control } = useFormContext();
  const searchParams = useSearchParams();
  const inviteCodeFromUrl = searchParams.get("inviteCode");

  useEffect(() => {
    if (inviteCodeFromUrl) {
      setValue("inviteCode", inviteCodeFromUrl);
      handleSubmit(onSubmit)();
    }
  }, [inviteCodeFromUrl, setValue, handleSubmit]);

  useEffect(() => {
    if (userData) {
      setValue("fullName", userData.fullName || "");
      setValue("email", userData.email || "");
      setValue("phone", userData.phone || "");
      setValue("city", userData.city || "");
      setValue("country", userData.country || "");
      setValue("typeOfTravel", userData.typeOfTravel || []);
      setValue("industrySegment", userData.industrySegment || []);
      setValue("destinationExpertise", userData.destinationExpertise || []);
      setValue("language", userData.language || []);
      setValue("designation", userData.designation || "");
      setValue("organization", userData.organization || "");
      setValue("website", userData.website || "");
      setValue("facebook", userData.facebook || "");
      setValue("instagram", userData.instagram || "");
      setValue("linkedin", userData.linkedin || "");
    }
  }, [userData, setValue]);

  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: data.inviteCode }),
      });
      const result = await response.json();
      console.log("Step 1 Response:", result);
      if (response.ok) {
        setUserData({ ...result.userData, inviteCode: data.inviteCode });
        setStep(2); // Auto-advance to Step 2
      } else {
        showModal("error", result.error || "Invalid invite code. Please try again.");
      }
    } catch (error) {
      console.error("Fetch error:", error.message, error.stack);
      showModal("error", `Network error: ${error.message}. Please check your connection and try again.`);
    }
  };

  const showModal = (type, message) => {
    setUserData((prev) => ({ ...prev, modalState: { isOpen: true, type, message } }));
  };

  return (
    <div className="space-y-4 p-6 lg:px-32 bg-secondary rounded-[40px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
       
        <div className="lg:col-span-1">
          <label htmlFor="inviteCode" className="block text-sm text-formtext mb-1">Invite Code</label>
          <input
            type="text"
            placeholder="Invite Code"
            id="inviteCode"
            {...register("inviteCode")}
            className="w-full p-3 border border-gray-300 rounded-2xl bg-white h-12 shadow-lg"
          />
          {errors.inviteCode && (
            <p className="text-red-500 text-sm mt-1">{errors.inviteCode.message}</p>
          )}
        </div>
        <div className="lg:col-span-1 flex items-end">
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            className="bg-primary text-white p-3 rounded-2xl w-full h-12 flex items-center justify-center"
          >
            Submit
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-formtext mb-1">Full Name</label>
          <input
            type="text"
            {...register("fullName")}
            className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Phone</label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                country="in"
                value={field.value}
                onChange={field.onChange}
                disabled
                inputProps={{
                  className: "w-full p-3 border px-12 bg-white border-gray-300 rounded-2xl shadow-lg",
                }}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">City</label>
          <input
            type="text"
            {...register("city")}
            className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Country</label>
          <input
            type="text"
            {...register("country")}
            className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Type of Travel</label>
          <Controller
            name="typeOfTravel"
            control={control}
            render={({ field }) => (
              <Select
                isMulti
                options={typeOfTravelOptions}
                value={typeOfTravelOptions.filter((option) => field.value?.includes(option.value))}
                onChange={(selected) => field.onChange(selected.map((option) => option.value))}
                className="w-full shadow-lg"
                classNamePrefix="custom-select"
                isDisabled={true}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Industry Segment</label>
          <Controller
            name="industrySegment"
            control={control}
            render={({ field }) => (
              <Select
                isMulti
                options={industrySegmentOptions}
                value={industrySegmentOptions.filter((option) => field.value?.includes(option.value))}
                onChange={(selected) => field.onChange(selected.map((option) => option.value))}
                className="w-full shadow-lg"
                classNamePrefix="custom-select"
                isDisabled={true}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Destination Expertise</label>
          <Controller
            name="destinationExpertise"
            control={control}
            render={({ field }) => (
              <Select
                isMulti
                options={destinationExpertiseOptions}
                value={destinationExpertiseOptions.filter((option) => field.value?.includes(option.value))}
                onChange={(selected) => field.onChange(selected.map((option) => option.value))}
                className="w-full shadow-lg"
                classNamePrefix="custom-select"
                isDisabled={true}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Languages Spoken</label>
          <Controller
            name="language"
            control={control}
            render={({ field }) => (
              <Select
                isMulti
                options={languageOptions}
                value={languageOptions.filter((option) => field.value?.includes(option.value))}
                onChange={(selected) => field.onChange(selected.map((option) => option.value))}
                className="w-full shadow-lg"
                classNamePrefix="custom-select"
                isDisabled={true}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Current Designation</label>
          <input
            type="text"
            {...register("designation")}
            className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Current Organization</label>
          <input
            type="text"
            {...register("organization")}
            className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Website (optional)</label>
          <input
            type="url"
            {...register("website")}
            className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Facebook (optional)</label>
          <input
            type="url"
            {...register("facebook")}
            className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Instagram (optional)</label>
          <input
            type="url"
            {...register("instagram")}
            className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">LinkedIn (optional)</label>
          <input
            type="url"
            {...register("linkedin")}
            className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
          />
        </div>
      </div>
      {userData && (
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="bg-primary text-white px-16 py-3 rounded-full w-5/6 md:w-1/4 flex items-center justify-center cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// Step 2 Component (Basic Introduction)
const Step2 = ({ setStep, showModal }) => {
  const { register, formState: { errors }, trigger } = useFormContext();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (file) {
      if (file.size > maxSize) {
        showModal("error", `File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      if (!validTypes.includes(file.type)) {
        showModal("error", `File ${file.name} has an invalid type. Allowed types: JPEG, PNG, JPG.`);
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await trigger(["tagline", "about", "yearsOfExperience", "profilePicture"]);
    if (isValid) {
      setStep(3);
    }
  };

  return (
    <div className="space-y-4 p-6 lg:px-32 bg-secondary rounded-[40px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-formtext mb-1">Years of Experience</label>
          <input
            type="number"
            placeholder="Years of Experience"
            {...register("yearsOfExperience", { valueAsNumber: true })}
            className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
          />
          {errors.yearsOfExperience && (
            <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Tagline</label>
          <input
            type="text"
            placeholder="Tagline"
            {...register("tagline")}
            className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
          />
          {errors.tagline && (
            <p className="text-red-500 text-sm mt-1">{errors.tagline.message}</p>
          )}
        </div>
        <div className="lg:col-span-2">
          <label className="block text-sm text-formtext mb-1">About Yourself</label>
          <textarea
            placeholder="About yourself"
            {...register("about")}
            className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
            rows="3"
          />
          {errors.about && (
            <p className="text-red-500 text-sm mt-1">{errors.about.message}</p>
          )}
        </div>
        <div className="lg:col-span-2">
          <label className="block text-sm text-formtext mb-1 flex items-center">
            Upload your profile picture
            <CustomTooltip image={"/user.png"}>
              <span className="ml-2 text-formtext cursor-pointer">
                <FaQuestionCircle />
              </span>
            </CustomTooltip>
          </label>
          <input
            type="file"
            {...register("profilePicture")}
            onChange={handleFileChange}
            className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
            accept="image/jpeg,image/png,image/jpg"
          />
        </div>
      </div>
      <div className= "pt-4 flex flex-col sm:flex-row justify-between gap-4">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="bg-gray-200 text-formtext px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="bg-primary text-white px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Step 3 Component (Professional Credentials & Experience)
const Step3 = ({ setStep, showModal }) => {
  const { register, control, formState: { errors }, watch, setValue, trigger } = useFormContext();
  const [workSamples, setWorkSamples] = useState([]);
  const [certificationFiles, setCertificationFiles] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState("");
  const isCertified = watch("certifications");

  useEffect(() => {
    setValue("workSamples", workSamples);
    setValue("certificationFiles", certificationFiles);
    setValue("testimonials", testimonials);
  }, [workSamples, certificationFiles, testimonials, setValue]);

  const handleFileChange = (e, setFiles) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];

    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        showModal("error", `File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      if (!validTypes.includes(file.type)) {
        showModal("error", `File ${file.name} has an invalid type. Allowed types: JPEG, PNG, PDF.`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (file, setFiles) => {
    setFiles((prev) => prev.filter((f) => f !== file));
  };

  const addTestimonial = () => {
    if (newTestimonial.trim()) {
      setTestimonials((prev) => [...prev, newTestimonial.trim()]);
      setNewTestimonial("");
    }
  };

  const removeTestimonial = (index) => {
    setTestimonials((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = async () => {
    const isValid = await trigger([
      "certifications",
      "organizationName",
      "certificationFiles",
      "access",
      "paidConsultations",
      "workSamples",
      "testimonials",
    ]);
    if (isValid) {
      setStep(4);
    }
  };

  return (
    <div className="space-y-4 p-6 lg:px-32 bg-secondary rounded-[40px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-formtext mb-1">
            Are you certified by any recognized travel organizations?
          </label>
          <Controller
            name="certifications"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={yesNoOptions}
                value={yesNoOptions.find((option) => option.value === field.value) || null}
                onChange={(selected) => field.onChange(selected?.value)}
                className="w-full mb-2 shadow-lg"
                classNamePrefix="custom-select"
              />
            )}
          />
        </div>
        {isCertified === "Yes" && (
          <div>
            <label className="block text-sm text-formtext mb-1">Organization Name</label>
            <input
              type="text"
              placeholder="Organization Name"
              {...register("organizationName")}
              className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
            />
          </div>
        )}
        {!isCertified && <div></div>} {/* Placeholder for grid alignment */}
        <div className="lg:col-span-2">
          <label className="block text-sm text-formtext mb-1 flex items-center">
            Upload any relevant certifications or recognitions (optional)
            <CustomTooltip icon={<FaRegFileAlt />}>
              <span className="ml-2 text-formtext cursor-pointer">
                <FaQuestionCircle />
              </span>
            </CustomTooltip>
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setCertificationFiles)}
            className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg mb-2"
            multiple
            accept="image/jpeg,image/png,application/pdf"
          />
          {certificationFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {certificationFiles.map((file, index) => (
                <div key={index} className="flex items-center bg-gray-100 p-2 rounded-full">
                  <span className="text-sm text-formtext">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(file, setCertificationFiles)}
                    className="ml-2 text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">
            Have you previously provided travel consultations?
          </label>
          <Controller
            name="access"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={yesNoOptions}
                value={yesNoOptions.find((option) => option.value === field.value) || null}
                onChange={(selected) => field.onChange(selected?.value)}
                className="w-full shadow-lg"
                classNamePrefix="custom-select"
              />
            )}
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">
            Are you comfortable providing paid travel consultations via Xmytravel Experts?
          </label>
          <Controller
            name="paidConsultations"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={yesNoOptions}
                value={yesNoOptions.find((option) => option.value === field.value) || null}
                onChange={(selected) => field.onChange(selected?.value)}
                className="w-full shadow-lg"
                classNamePrefix="custom-select"
              />
            )}
          />
        </div>
        <div className="lg:col-span-2">
          <label className="block text-sm text-formtext mb-1 flex items-center">
            Upload any relevant work samples (optional)
            <CustomTooltip image={"/tooltip.svg"}>
              <span className="ml-2 text-formtext cursor-pointer">
                <FaQuestionCircle />
              </span>
            </CustomTooltip>
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setWorkSamples)}
            className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg mb-2"
            multiple
            accept="image/jpeg,image/png,application/pdf"
          />
          {workSamples.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {workSamples.map((file, index) => (
                <div key={index} className="flex items-center bg-gray-100 p-2 rounded-full">
                  <span className="text-sm text-formtext">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(file, setWorkSamples)}
                    className="ml-2 text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
          <label className="block text-sm text-formtext mb-1 flex items-center">
            Customer testimonials (optional)
            <CustomTooltip
              description={
                "I got a good tour plan within 2 days only with all sight seeings for Somnath, nageshwar and dwarkadhish temple along with Gir National park. He is such a friendly person and got my all queries cleared and gave me some additional information too. - Akanksha vyas"
              }
            >
              <span className="ml-2 text-formtext cursor-pointer">
                <FaQuestionCircle />
              </span>
            </CustomTooltip>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTestimonial}
              onChange={(e) => setNewTestimonial(e.target.value)}
              placeholder="Enter a testimonial"
              className="w-full p-3 border bg-white border-gray-300 rounded-2xl shadow-lg"
              maxLength={500}
            />
            <button
              type="button"
              onClick={addTestimonial}
              className="bg-primary text-white px-4 py-2 rounded-2xl"
            >
              Add
            </button>
          </div>
          {testimonials.length > 0 && (
            <div className="flex flex-col gap-2">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="flex items-center bg-gray-100 p-2 rounded-full">
                  <span className="text-sm text-formtext">{testimonial}</span>
                  <button
                    type="button"
                    onClick={() => removeTestimonial(index)}
                    className="ml-2 text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="bg-gray-200 text-formtext px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="bg-primary text-white px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Step 4 Component (Engagement & Final Declaration)
const Step4 = ({ userData, setStep, showModal, resetForm }) => {
  const { register, control, formState: { errors }, handleSubmit } = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

    try {
      if (!userData?.inviteCode) {
        showModal("error", "Invite code is missing. Please go back to Step 1 and enter a valid invite code.");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("inviteCode", userData.inviteCode || "");
      formData.append("fullName", userData.fullName || "");
      formData.append("email", userData.email || "");
      formData.append("phone", userData.phone || "");
      formData.append("city", userData.city || "");
      formData.append("country", userData.country || "");
      formData.append("typeOfTravel", JSON.stringify(userData.typeOfTravel || []));
      formData.append("industrySegment", JSON.stringify(userData.industrySegment || []));
      formData.append("destinationExpertise", JSON.stringify(userData.destinationExpertise || []));
      formData.append("language", JSON.stringify(userData.language || []));
      formData.append("designation", userData.designation || "");
      formData.append("organization", userData.organization || "");
      formData.append("website", data.website || "");
      formData.append("facebook", data.facebook || "");
      formData.append("instagram", data.instagram || "");
      formData.append("linkedin", data.linkedin || "");
      formData.append("tagline", data.tagline || "");
      formData.append("about", data.about || "");
      formData.append("certifications", data.certifications || "");
      formData.append("organizationName", data.certifications === "Yes" ? data.organizationName || "" : "");
      formData.append("access", data.access || "");
      formData.append("paidConsultations", data.paidConsultations || "");
      formData.append("industryDiscussions", data.industryDiscussions || "");
      formData.append("yearsOfExperience", (data.yearsOfExperience || 0).toString()); // Fallback to 0
      formData.append("testimonials", JSON.stringify(data.testimonials || []));
      formData.append("declaration", data.declaration.toString());

      if (data.profilePicture && data.profilePicture[0]) {
        formData.append("profilePicture", data.profilePicture[0]);
      }
      if (data.workSamples && data.workSamples.length > 0) {
        data.workSamples.forEach((file, index) => {
          formData.append(`workSamples[${index}]`, file);
        });
      }
      if (data.certificationFiles && data.certificationFiles.length > 0) {
        data.certificationFiles.forEach((file, index) => {
          formData.append(`certificationFiles[${index}]`, file);
        });
      }

      console.log("Submitting FormData with inviteCode:", userData.inviteCode);

      const response = await fetch("/api/profile", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();
      console.log("Step 4 Response:", result);
      if (response.ok) {
        showModal("success", "Profile completed successfully!");
        resetForm();
      } else {
        showModal("error", result.error || "Failed to submit profile. Please try again.");
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Submit error:", error.message, error.stack);
      if (error.name === "AbortError") {
        showModal("error", "Request timed out. Please check your connection and try again.");
      } else {
        showModal("error", `Network error: ${error.message}. Please check your connection and try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-6 lg:px-32 bg-secondary rounded-[40px]">
      <h2 className="text-xl font-semibold text-formtext">Engagement & Final Declaration</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="lg:col-span-2">
          <label className="block text-sm text-formtext mb-1">
            Are you open to participating in industry discussions, webinars, or content creation? (optional)
          </label>
          <Controller
            name="industryDiscussions"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={yesNoOptions}
                value={yesNoOptions.find((option) => option.value === field.value) || null}
                onChange={(selected) => field.onChange(selected?.value)}
                className="w-full shadow-lg"
                classNamePrefix="custom-select"
              />
            )}
          />
        </div>
        <div className="lg:col-span-2">
          <label className="flex items-center text-lg text-formtext">Final Declaration</label>
          <label className="flex items-center text-sm text-formtext">
            <input
              type="checkbox"
              {...register("declaration")}
              className="mr-2 h-4 w-4 text-formtext"
            />
            I confirm that the information provided is true and adheres to Xmytravel Experts professional and ethical standards
          </label>
          {errors.declaration && (
            <p className="text-red-500 text-sm mt-1">{errors.declaration.message}</p>
          )}
        </div>
      </div>
      <div className="pt-4 flex flex-col sm:flex-row justify-between gap-4">
        <button
          type="button"
          onClick={() => setStep(3)}
          className="bg-gray-200 text-formtext px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
        >
          Previous
        </button>
        <button
          type="submit"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className={`bg-primary text-white px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : null}
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

// Main ProfilePage Component
export default function ProfilePage() {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "success",
    message: "",
  });

  const getSchema = (step) => {
    switch (step) {
      case 1:
        return step1Schema;
      case 2:
        return step2Schema;
      case 3:
        return step3Schema;
      case 4:
        return step4Schema;
      default:
        return step1Schema;
    }
  };

  const methods = useForm({
    resolver: zodResolver(getSchema(step)),
    mode: "onChange",
    defaultValues: {
      inviteCode: "",
      fullName: "",
      email: "",
      phone: "",
      city: "",
      country: "",
      typeOfTravel: [],
      industrySegment: [],
      destinationExpertise: [],
      language: [],
      designation: "",
      organization: "",
      website: "",
      facebook: "",
      instagram: "",
      linkedin: "",
      tagline: "",
      about: "",
      certifications: "",
      organizationName: "",
      certificationFiles: [],
      access: "",
      paidConsultations: "",
      industryDiscussions: "",
      yearsOfExperience: 0, // Default to 0 to prevent undefined
      profilePicture: null,
      declaration: false,
      workSamples: [],
      testimonials: [],
    },
  });

  const showModal = (type, message) => {
    setModalState({ isOpen: true, type, message });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: "success", message: "" });
  };

  const resetForm = () => {
    methods.reset({
      inviteCode: "",
      fullName: "",
      email: "",
      phone: "",
      city: "",
      country: "",
      typeOfTravel: [],
      industrySegment: [],
      destinationExpertise: [],
      language: [],
      designation: "",
      organization: "",
      website: "",
      facebook: "",
      instagram: "",
      linkedin: "",
      tagline: "",
      about: "",
      certifications: "",
      organizationName: "",
      certificationFiles: [],
      access: "",
      paidConsultations: "",
      industryDiscussions: "",
      yearsOfExperience: 0,
      profilePicture: null,
      declaration: false,
      workSamples: [],
      testimonials: [],
    });
    setStep(1);
    setUserData(null);
  };

  // Pass showModal to Step2 and Step3
  const step2Props = { setStep, showModal };
  const step3Props = { setStep, showModal };

  return (
    <section className="py-4 bg-secondary min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center mb-4">
          <Image
            src="/logolttx.svg"
            width={350}
            height={84}
            alt="lttx"
            className="bg-primary rounded-full px-4"
          />
        </div>
        <ProgressBar step={step} />
        <TooltipProvider>
          <FormProvider {...methods}>
            <form className="space-y-6">
              {step === 1 && <Step1 setStep={setStep} setUserData={setUserData} userData={userData} />}
              {step === 2 && <Step2 {...step2Props} />}
              {step === 3 && <Step3 {...step3Props} />}
              {step === 4 && (
                <Step4
                  userData={userData}
                  setStep={setStep}
                  showModal={showModal}
                  resetForm={resetForm}
                />
              )}
            </form>
          </FormProvider>
        </TooltipProvider>
        <Modal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          type={modalState.type}
          message={modalState.message}
        />
      </div>
    </section>
  );
}