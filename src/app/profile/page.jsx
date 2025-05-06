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
// import { FaQuestionCircle, FaRegFileAlt, FaRegUserCircle } from "react-icons/fa";
// // import Tooltip from "@mui/material/Tooltip";
// // import { styled } from '@mui/material/styles';
// import Modal from "../components/Modal";
// import { Tooltip, styled } from '@mui/material';
// import CustomTooltip from "../components/CustomTooltip";

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
//   declaration: z.boolean().refine(val => val === true, {
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
//     <div className="space-y-4 p-6 lg:px-32 bg-white rounded-[40px]">
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
//             className="bg-primary text-white p-3 rounded-2xl w-full h-12"
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
//                 value={typeOfTravelOptions.filter(option => field.value?.includes(option.value))}
//                 onChange={selected => field.onChange(selected.map(option => option.value))}
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
//                 value={industrySegmentOptions.filter(option => field.value?.includes(option.value))}
//                 onChange={selected => field.onChange(selected.map(option => option.value))}
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
//                 value={destinationExpertiseOptions.filter(option => field.value?.includes(option.value))}
//                 onChange={selected => field.onChange(selected.map(option => option.value))}
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
//                 value={languageOptions.filter(option => field.value?.includes(option.value))}
//                 onChange={selected => field.onChange(selected.map(option => option.value))}
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
//             className="bg-primary text-white px-16 py-3 rounded-full w-5/6 md:w-1/4 cursor-pointer"
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
//   const isCertified = watch("certifications");

//   useEffect(() => {
//     setValue("workSamples", workSamples);
//     setValue("certificationFiles", certificationFiles);
//     setValue("testimonials", testimonials);
//   }, [workSamples, certificationFiles, testimonials, setValue]);

//   const onSubmit = async (data) => {
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
//     }
//   };

//   const handleFileChange = (e, setFiles) => {
//     const files = Array.from(e.target.files);
//     setFiles(prev => [...prev, ...files]);
//   };

//   const removeFile = (file, setFiles) => {
//     setFiles(prev => prev.filter(f => f !== file));
//   };

//   const addTestimonial = () => {
//     if (newTestimonial.trim()) {
//       setTestimonials(prev => [...prev, newTestimonial.trim()]);
//       setNewTestimonial("");
//     }
//   };

//   const removeTestimonial = (index) => {
//     setTestimonials(prev => prev.filter((_, i) => i !== index));
//   };

//   // const CustomTooltip = styled(({ className, ...props }) => (
//   //   <Tooltip
//   //     {...props}
//   //     arrow
//   //     classes={{ popper: className }}
//   //     PopperProps={{
//   //       modifiers: [
//   //         {
//   //           name: 'offset',
//   //           options: {
//   //             offset: [0, 10],
//   //           },
//   //         },
//   //       ],
//   //     }}
//   //   />
//   // ))(() => ({
//   //   [`& .MuiTooltip-tooltip`]: {
//   //     backgroundColor: 'transparent',
//   //     padding: 0,
//   //     margin: 0,
//   //   },
//   // }));
// // 1. Custom Tooltip with NO arrow
// // 1. Custom styled Tooltip


//   // const CustomTooltipContent = ({ description, image, icon }) => (
//   //   <div className="max-w-xs bg-white rounded-lg shadow-lg p-3 text-center">
//   //     <h3 className="font-semibold text-sm mb-1 text-primary">Reference</h3>
//   //     {description && <p className="text-xs text-gray-700 mb-2">{description}</p>}
//   //     {image && (
//   //       <img
//   //         src={image}
//   //         alt="Tooltip"
//   //         className="w-full rounded-md border mb-2"
//   //       />
//   //     )}
//   //     {icon && <div className="text-xl text-gray-700">{icon}</div>}
//   //   </div>
//   // );

//   return (
//     <div className="space-y-4 p-6 lg:px-32 bg-white rounded-[40px]">
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
//           <label className="block text-sm text-formtext mb-1">Are you certified by any recognized travel organizations?</label>
//           <Controller
//             name="certifications"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 {...field}
//                 options={yesNoOptions}
//                 value={yesNoOptions.find(option => option.value === field.value) || null}
//                 onChange={selected => field.onChange(selected?.value)}
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
//           <label className="block text-sm text-formtext mb-1">Have you previously provided travel consultations?</label>
//           <Controller
//             name="access"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 {...field}
//                 options={yesNoOptions}
//                 value={yesNoOptions.find(option => option.value === field.value) || null}
//                 onChange={selected => field.onChange(selected?.value)}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label className="block text-sm text-formtext mb-1">Are you comfortable providing paid travel consultations via Xmytravel Experts?</label>
//           <Controller
//             name="paidConsultations"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 {...field}
//                 options={yesNoOptions}
//                 value={yesNoOptions.find(option => option.value === field.value) || null}
//                 onChange={selected => field.onChange(selected?.value)}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//               />
//             )}
//           />
//         </div>
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1">Are you open to participating in industry discussions, webinars, or content creation? (optional)</label>
//           <Controller
//             name="industryDiscussions"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 {...field}
//                 options={yesNoOptions}
//                 value={yesNoOptions.find(option => option.value === field.value) || null}
//                 onChange={selected => field.onChange(selected?.value)}
//                 className="w-full shadow-lg"
//                 classNamePrefix="custom-select"
//               />
//             )}
//           />
//         </div>
//         <div className="lg:col-span-2">
//           <label className="block text-sm text-formtext mb-1 flex items-center">
//             Upload any relevant certifications or recognitions (optional)
//             {/* <Tooltip 
//               title={
//                 <CustomTooltipContent
//                   icon={<FaRegFileAlt />}
//                 />
//               }
//               // arrow
//             >
//               <span className="ml-2 text-formtext cursor-pointer">
//                 <FaQuestionCircle />
//               </span>
//             </Tooltip> */}
//             <CustomTooltip
//                 icon={<FaRegFileAlt />}
//             >
//             <span className="ml-2 text-formtext cursor-pointer">
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
//             {/* <Tooltip 
//               title={
//                 <CustomTooltipContent
//                   image={"/tooltip.svg"}
//                 />
//               }
//               // arrow
//             >
//               <span className="ml-2 text-formtext cursor-pointer">
//                 <FaQuestionCircle />
//               </span>
//             </Tooltip> */}
//               <CustomTooltip
//                 image={"/tooltip.svg"}
//             >
//             <span className="ml-2 text-formtext cursor-pointer">
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
//             {/* <Tooltip 
//               title={
//                 <CustomTooltipContent
//                   description={"I got a good tour plan within 2 days only with all sight seeings for Somnath, nageshwar and dwarkadhish temple along with Gir National park. He is such a friendly person and got my all queries cleared and gave me some additional information too. - Akanksha vyas"}
//                 />
//               }
//               // arrow
//             >
//               <span className="ml-2 text-formtext cursor-pointer">
//                 <FaQuestionCircle />
//               </span>
//             </Tooltip> */}
//               <CustomTooltip
//                     description={"I got a good tour plan within 2 days only with all sight seeings for Somnath, nageshwar and dwarkadhish temple along with Gir National park. He is such a friendly person and got my all queries cleared and gave me some additional information too. - Akanksha vyas"}
//             >
//             <span className="ml-2 text-formtext cursor-pointer">
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
//             {/* <Tooltip 
//               title={
//                 <CustomTooltipContent
//                   image={"/user.png"}
//                 />
//               }
//               // arrow
//             >
//               <span className="ml-2 text-formtext cursor-pointer">
//                 <FaQuestionCircle />
//               </span>
//             </Tooltip> */}
//               <CustomTooltip
//                 image={"/user.png"}
//             >
//             <span className="ml-2 text-formtext cursor-pointer">
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
//         <div className="lg:col-span-2 pt-4 flex justify-between">
//           <button
//             type="button"
//             onClick={() => setStep(1)}
//             className="bg-gray-200 text-formtext px-16 py-3 rounded-full w-1/3 cursor-pointer"
//           >
//             Back
//           </button>
//           <button
//             type="submit"
//             onClick={handleSubmit(onSubmit)}
//             className="bg-primary text-white px-16 py-3 rounded-full w-1/3 cursor-pointer"
//           >
//             Submit
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
//     <section className="py-4">
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
//         <FormProvider {...methods}>
//           <form className="space-y-6">
//             {step === 1 && <Step1 setStep={setStep} setUserData={setUserData} userData={userData} />}
//             {step === 2 && (
//               <Step2
//                 userData={userData}
//                 setStep={setStep}
//                 showModal={showModal}
//                 resetForm={resetForm}
//               />
//             )}
//           </form>
//         </FormProvider>
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
// 
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

// Validation schemas for Step 1 and Step 2
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
  certifications: z.string().optional(),
  organizationName: z.string().optional(),
  certificationFiles: z.any().optional(),
  access: z.string().optional(),
  paidConsultations: z.string().optional(),
  industryDiscussions: z.string().optional(),
  yearsOfExperience: z.number().min(0, "Years of experience is required"),
  profilePicture: z.any().optional(),
  declaration: z.boolean().refine((val) => val === true, {
    message: "You must agree to the declaration",
  }),
  workSamples: z.any().optional(),
  testimonials: z.array(z.string()).optional(),
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
      } else {
        alert(result.error || "Failed to fetch user data");
      }
    } catch (error) {
      alert("Network error: Unable to fetch user data. Please try again later.");
      console.error("Fetch error:", error);
    }
  };

  const handleNext = () => {
    setStep(2);
  };

  return (
    <div className="space-y-4 p-6 py-9 lg:px-32 bg-white border rounded-[40px]">
       <h1 className="text-1xl sm:text-3xl md:text-4xl font-bold text-textcolor leading-tight">Complete Your Profile</h1>
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
            className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
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
                  className: "w-full p-3 border px-12 border-gray-300 rounded-2xl shadow-lg",
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
            className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Country</label>
          <input
            type="text"
            {...register("country")}
            className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
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
            className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Current Organization</label>
          <input
            type="text"
            {...register("organization")}
            className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Website (optional)</label>
          <input
            type="url"
            {...register("website")}
            className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Facebook (optional)</label>
          <input
            type="url"
            {...register("facebook")}
            className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">Instagram (optional)</label>
          <input
            type="url"
            {...register("instagram")}
            className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
          />
        </div>
        <div>
          <label className="block text-sm text-formtext mb-1">LinkedIn (optional)</label>
          <input
            type="url"
            {...register("linkedin")}
            className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
          />
        </div>
      </div>
      {userData && (
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={handleNext}
            className="bg-primary text-white px-16 py-3 rounded-full w-5/6 md:w-1/4 flex items-center justify-center cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// Step 2 Component
const Step2 = ({ userData, setStep, showModal, resetForm }) => {
  const { register, control, formState: { errors }, handleSubmit, watch, setValue } = useFormContext();
  const [workSamples, setWorkSamples] = useState([]);
  const [certificationFiles, setCertificationFiles] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state
  const isCertified = watch("certifications");

  useEffect(() => {
    setValue("workSamples", workSamples);
    setValue("certificationFiles", certificationFiles);
    setValue("testimonials", testimonials);
  }, [workSamples, certificationFiles, testimonials, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true); // Start loading
    try {
      if (!userData.inviteCode) {
        showModal("error", "Invite code is missing. Please go back to Step 1 and enter a valid invite code.");
        return;
      }

      const formData = new FormData();
      formData.append("inviteCode", userData.inviteCode);
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
      formData.append("linkedin", userData.linkedin || "");
      formData.append("tagline", data.tagline || "");
      formData.append("about", data.about || "");
      formData.append("certifications", data.certifications || "");
      formData.append("organizationName", data.certifications === "Yes" ? data.organizationName : "");
      formData.append("access", data.access || "");
      formData.append("paidConsultations", data.paidConsultations || "");
      formData.append("industryDiscussions", data.industryDiscussions || "");
      formData.append("yearsOfExperience", data.yearsOfExperience.toString());
      formData.append("testimonials", JSON.stringify(testimonials));
      formData.append("declaration", data.declaration.toString());

      if (data.profilePicture && data.profilePicture[0]) {
        formData.append("profilePicture", data.profilePicture[0]);
      }

      workSamples.forEach((file) => {
        formData.append("workSamples", file);
      });

      certificationFiles.forEach((file) => {
        formData.append("certificationFiles", file);
      });

      console.log("Submitting FormData with inviteCode:", userData.inviteCode);

      const response = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        showModal("success", "Profile completed successfully!");
        setWorkSamples([]);
        setCertificationFiles([]);
        setTestimonials([]);
        setNewTestimonial("");
        resetForm();
      } else {
        showModal("error", result.error || "Failed to submit profile");
      }
    } catch (error) {
      showModal("error", "Network error: Unable to submit profile. Please try again later.");
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  const handleFileChange = (e, setFiles) => {
    const files = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...files]);
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

  return (
    <div className="space-y-4 p-6 lg:px-32 bg-white rounded-[40px]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-formtext mb-1">Years of Experience</label>
          <input
            type="number"
            placeholder="Years of Experience"
            {...register("yearsOfExperience", { valueAsNumber: true })}
            className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
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
            className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
          />
          {errors.tagline && (
            <p className="text-red-500 text-sm mt-1">{errors.tagline.message}</p>
          )}
        </div>
        <div className="lg:col-span-2">
          <label className="block text-sm text-formtext mb-1">About yourself</label>
          <textarea
            placeholder="About yourself"
            {...register("about")}
            className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
            rows="3"
          />
          {errors.about && (
            <p className="text-red-500 text-sm mt-1">{errors.about.message}</p>
          )}
        </div>
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
              className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
            />
          </div>
        )}
        {!isCertified && <div></div>} {/* Placeholder to maintain grid alignment */}
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
            className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg mb-2"
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
            className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg mb-2"
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
              className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
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
            className="w-full p-3 border border-gray-300 rounded-2xl shadow-lg"
            accept="image/jpeg,image/png,image/jpg"
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
        <div className="lg:col-span-2 pt-4 flex flex-col sm:flex-row justify-between gap-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="bg-gray-200 text-formtext px-16 py-3 rounded-full w-full sm:w-1/3 flex items-center justify-center cursor-pointer"
          >
            Back
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

  const methods = useForm({
    resolver: zodResolver(step === 1 ? step1Schema : step2Schema),
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
      yearsOfExperience: 0,
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
  };

  return (
    <section className="py-4">
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
        <TooltipProvider>
          <FormProvider {...methods}>
            <form className="space-y-6">
              {step === 1 && <Step1 setStep={setStep} setUserData={setUserData} userData={userData} />}
              {step === 2 && (
                <Step2
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