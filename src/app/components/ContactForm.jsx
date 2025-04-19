"use client"; // Ensures this component runs on the client

import React, { useState } from "react";
import { useForm, FormProvider, useFormContext, Controller } from "react-hook-form";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
const step1Schema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z.string().min(1, "Phone Number is required"),
  residence: z.string().min(1, "City & Country of Residence is required"),
});

const step2Schema = z.object({
  typeOfTravel: z
    .array(z.string())
    .min(1, "At least one type of travel is required")
    .max(5, "You can select up to 5 types of travel"),
  industrySegment: z
    .array(z.string())
    .min(1, "At least one industry segment is required")
    .max(5, "You can select up to 5 industry segments"),
  destinationExpertise: z
    .array(z.string())
    .min(1, "At least one destination expertise is required")
    .max(5, "You can select up to 5 destinations"),
  language: z
    .array(z.string())
    .min(1, "At least one language is required")
    .max(5, "You can select up to 5 languages"),
});

const step3Schema = z.object({
  designation: z.string().min(1, "Current Designation is required"),
  organization: z.string().min(1, "Current Organization is required"),
  linkedin: z.string().optional(),
  inviteCode: z.string().min(1, "Invite Code is required"),
});

// Progress Bar
const ProgressBar = ({ step }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          1
        </div>
        <div className={`h-1 w-24 ${step >= 2 ? "bg-primary" : "bg-gray-200"}`}></div>
      </div>
      <div className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 2 ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          2
        </div>
        <div className={`h-1 w-24 ${step >= 3 ? "bg-primary" : "bg-gray-200"}`}></div>
      </div>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          step === 3 ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
        }`}
      >
        3
      </div>
    </div>
  );
};

// Step Components
const Step1 = ({ setStep, isLoading }) => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Step 1: Personal Information</h3>
      <div>
        <label htmlFor="fullName" className="block text-sm text-primary mb-1">Full Name</label>
        <input
          type="text"
          placeholder="Full Name"
          id="fullName"
          {...register("fullName")}
          className="w-full p-3 border border-gray-300 rounded-2xl bg-white"
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm text-primary mb-1">Email Address</label>
        <input
          type="email"
          placeholder="Email Address"
          id="email"
          {...register("email")}
          className="w-full p-3 border border-gray-300 rounded-2xl bg-white"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm text-primary mb-1">Phone Number</label>
        <input
          type="tel"
          placeholder="Phone Number"
          id="phone"
          {...register("phone")}
          className="w-full p-3 border border-gray-300 rounded-2xl bg-white"
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="residence" className="block text-sm text-primary mb-1">City & Country of Residence</label>
        <input
          type="text"
          placeholder="City & Country of Residence"
          id="residence"
          {...register("residence")}
          className="w-full p-3 border border-gray-300 rounded-2xl bg-white"
        />
        {errors.residence && (
          <p className="text-red-500 text-sm mt-1">{errors.residence.message}</p>
        )}
      </div>
      <div className="pt-4 flex justify-center">
        <button
          type="submit"
          className="bg-primary text-white px-16 py-3 rounded-full w-5/6 md:w-1/4 cursor-pointer"
          disabled={isLoading} 
        >
          {isLoading ? "Loading..." : "Next"}
        </button>
      </div>
    </div>
  );
};


const typeOfTravelOptions = [
  { value: "Leisure", label: "Leisure" },
  { value: "Corporate / Business", label: "Corporate / Business" },
  { value: "Luxury", label: "Luxury" },
  { value: "Adventure", label: "Adventure" },
  { value: "Group Travel", label: "Group Travel" },
  { value: "Solo Travel", label: "Solo Travel" },
  { value: "Family Travel", label: "Family Travel" },
  { value: "Honeymoon / Romance", label: "Honeymoon / Romance" },
  { value: "Religious / Pilgrimage", label: "Religious / Pilgrimage" },
  { value: "Wellness / Retreats", label: "Wellness / Retreats" },
  { value: "Educational / Student", label: "Educational / Student" },
  { value: "Events / Weddings", label: "Events / Weddings" },
];

const industrySegmentOptions = [
  { value: "Airlines", label: "Airlines" },
  { value: "Cruises", label: "Cruises" },
  { value: "Hotels & Resorts", label: "Hotels & Resorts" },
  { value: "Tour Operators", label: "Tour Operators" },
  { value: "Travel Agencies", label: "Travel Agencies" },
  { value: "DMC (Destination Management Company)", label: "DMC (Destination Management Company)" },
  { value: "Visa Services", label: "Visa Services" },
  { value: "Car Rentals / Transfers", label: "Car Rentals / Transfers" },
  { value: "Insurance", label: "Insurance" },
  { value: "Travel Tech", label: "Travel Tech" },
  { value: "Tourism Board", label: "Tourism Board" },
  { value: "Luxury Concierge", label: "Luxury Concierge" },
  { value: "OTA (Online Travel Agency)", label: "OTA (Online Travel Agency)" },
];

const destinationExpertiseOptions = [
  { value: "North America", label: "North America" },
  { value: "South America", label: "South America" },
  { value: "Europe", label: "Europe" },
  { value: "Africa", label: "Africa" },
  { value: "Middle East", label: "Middle East" },
  { value: "South Asia", label: "South Asia" },
  { value: "Southeast Asia", label: "Southeast Asia" },
  { value: "East Asia", label: "East Asia" },
  { value: "Australia & Oceania", label: "Australia & Oceania" },
];

const languageOptions = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "Mandarin Chinese", label: "Mandarin Chinese" },
  { value: "Hindi", label: "Hindi" },
  { value: "Arabic", label: "Arabic" },
  { value: "French", label: "French" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Russian", label: "Russian" },
  { value: "German", label: "German" },
  { value: "Japanese", label: "Japanese" },
  { value: "Korean", label: "Korean" },
  { value: "Italian", label: "Italian" },
  { value: "Bengali", label: "Bengali" },
  { value: "Turkish", label: "Turkish" },
  { value: "Vietnamese", label: "Vietnamese" },
  { value: "Thai", label: "Thai" },
  { value: "Malay / Indonesian", label: "Malay / Indonesian" },
  { value: "Swahili", label: "Swahili" },
];

// const Step2 = ({ setStep, isLoading }) => {
//   const { control, formState: { errors } } = useFormContext();
//   return (
//     <div className="space-y-4">
//       <h3 className="text-lg font-semibold text-primary">Step 2: Travel Preferences</h3>
//       {/* Type of Travel */}
//       <div>
//         <label className="block text-sm text-primary mb-1">Type of Travel (select up to 5)</label>
//         <Controller
//           name="typeOfTravel"
//           control={control}
//           render={({ field }) => (
//             <Select
//               isMulti
//               options={typeOfTravelOptions}
//               value={typeOfTravelOptions.filter((option) =>
//                 field.value?.includes(option.value)
//               )}
//               onChange={(selectedOptions) => {
//                 const selectedValues = selectedOptions
//                   ? selectedOptions.map((option) => option.value)
//                   : [];
//                 field.onChange(selectedValues);
//               }}
//               placeholder="Select the kinds of travel you specialize in"
//               className="w-full"
//               classNamePrefix="custom-select"
//               isOptionDisabled={() => field.value?.length >= 5}
//             />
//           )}
//         />
//         {errors.typeOfTravel && (
//           <p className="text-red-500 text-sm mt-1">{errors.typeOfTravel.message}</p>
//         )}
//       </div>

//       {/* Industry Segment */}
//       <div>
//         <label className="block text-sm text-primary mb-1">Industry Segment (select up to 5)</label>
//         <Controller
//           name="industrySegment"
//           control={control}
//           render={({ field }) => (
//             <Select
//               isMulti
//               options={industrySegmentOptions}
//               value={industrySegmentOptions.filter((option) =>
//                 field.value?.includes(option.value)
//               )}
//               onChange={(selectedOptions) => {
//                 const selectedValues = selectedOptions
//                   ? selectedOptions.map((option) => option.value)
//                   : [];
//                 field.onChange(selectedValues);
//               }}
//               placeholder="What part of the travel industry are you from?"
//               className="w-full"
//               classNamePrefix="custom-select"
//               isOptionDisabled={() => field.value?.length >= 5}
//             />
//           )}
//         />
//         {errors.industrySegment && (
//           <p className="text-red-500 text-sm mt-1">{errors.industrySegment.message}</p>
//         )}
//       </div>

//       {/* Destination Expertise */}
//       <div>
//         <label className="block text-sm text-primary mb-1">Destination Expertise (select up to 5)</label>
//         <Controller
//           name="destinationExpertise"
//           control={control}
//           render={({ field }) => (
//             <CreatableSelect
//               isMulti
//               options={destinationExpertiseOptions}
//               value={destinationExpertiseOptions.filter((option) =>
//                 field.value?.includes(option.value)
//               ).concat(
//                 field.value
//                   ?.filter((val) => !destinationExpertiseOptions.some((opt) => opt.value === val))
//                   .map((val) => ({ value: val, label: val }))
//               )}
//               onChange={(selectedOptions) => {
//                 const selectedValues = selectedOptions
//                   ? selectedOptions.map((option) => option.value)
//                   : [];
//                 field.onChange(selectedValues);
//               }}
//               placeholder="Choose regions or type to add specific countries (e.g., Japan, Italy)"
//               className="w-full"
//               classNamePrefix="custom-select"
//               isOptionDisabled={() => field.value?.length >= 5}
//               formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
//             />
//           )}
//         />
//         {errors.destinationExpertise && (
//           <p className="text-red-500 text-sm mt-1">{errors.destinationExpertise.message}</p>
//         )}
//       </div>

//       {/* Languages Spoken */}
//       <div>
//         <label className="block text-sm text-primary mb-1">Languages Spoken (select up to 5)</label>
//         <Controller
//           name="language"
//           control={control}
//           render={({ field }) => (
//             <CreatableSelect
//               isMulti
//               options={languageOptions}
//               value={languageOptions.filter((option) =>
//                 field.value?.includes(option.value)
//               ).concat(
//                 field.value
//                   ?.filter((val) => !languageOptions.some((opt) => opt.value === val))
//                   .map((val) => ({ value: val, label: val }))
//               )}
//               onChange={(selectedOptions) => {
//                 const selectedValues = selectedOptions
//                   ? selectedOptions.map((option) => option.value)
//                   : [];
//                 field.onChange(selectedValues);
//               }}
//               placeholder="Select languages you are fluent or conversational in"
//               className="w-full"
//               classNamePrefix="custom-select"
//               isOptionDisabled={() => field.value?.length >= 5}
//               formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
//             />
//           )}
//         />
//         {errors.language && (
//           <p className="text-red-500 text-sm mt-1">{errors.language.message}</p>
//         )}
//       </div>

//       <div className="pt-4 flex flex-col md:flex-row space-y-4 justify-between items-center">
//         <button
//           type="button"
//           onClick={() => setStep(1)}
//           className="bg-gray-200 text-primary px-16 py-3 rounded-full w-5/6 md:w-1/4 cursor-pointer"
//           disabled={isLoading} 
//         >
//          Previous
//         </button>
//         <button
//           type="submit"
//           className="bg-primary text-white px-16 py-3 rounded-full w-5/6 md:w-1/4 cursor-pointer"
//           disabled={isLoading} 
//         >
//          Next
//         </button>
//       </div>
//     </div>
//   );
// };


// Custom styles for react-select

// Custom Option component to show checkbox

// Custom Option component to show checkbox

const CustomOption = ({ innerProps, innerRef, data, isSelected, isDisabled }) => {
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className={`flex items-center px-3 py-2 ${
        isSelected || isDisabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "hover:bg-gray-50 cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        disabled={isSelected || isDisabled}
        readOnly 
        className="mr-2 h-4 w-4 text-primary"
      />
      <span>{data.label}</span>
    </div>
  );
};

const customStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: "#e5e7eb",
    "&:hover": { borderColor: "#d1d5db" },
    boxShadow: "none",
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "#e0f2fe",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "#0369a1",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: "#0369a1",
    "&:hover": {
      backgroundColor: "#bae6fd",
      color: "#075985",
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#f3f4f6"
      : state.isDisabled
      ? "#e5e7eb"
      : state.isFocused
      ? "#f9fafb"
      : "white",
    color: state.isSelected || state.isDisabled ? "#9ca3af" : "#111827",
    cursor: state.isSelected || state.isDisabled ? "not-allowed" : "pointer",
  }),
};

const Step2 = ({ setStep, isLoading }) => {
  const { control, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Step 2: Travel Preferences</h3>

      {[
        { name: "typeOfTravel", label: "Type of Travel", options: typeOfTravelOptions },
        { name: "industrySegment", label: "Industry Segment", options: industrySegmentOptions },
      ].map(({ name, label, options }) => (
        <div key={name}>
          <label className="block text-sm text-primary mb-1">{label} (select up to 5)</label>
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Select
                isMulti
                options={options}
                value={options.filter((option) => field.value?.includes(option.value))}
                onChange={(selectedOptions) => {
                  const selectedValues = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
                  field.onChange(selectedValues);
                }}
                placeholder={`Select ${label.toLowerCase()}`}
                className="w-full"
                classNamePrefix="custom-select"
                components={{ Option: CustomOption }}
                styles={customStyles}
                isOptionDisabled={(option) =>
                  field.value?.length >= 5 && !field.value?.includes(option.value)
                }
              />
            )}
          />
          {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>}
        </div>
      ))}

      {["destinationExpertise", "language"].map((name) => {
        const options = name === "destinationExpertise" ? destinationExpertiseOptions : languageOptions;
        const label = name === "destinationExpertise" ? "Destination Expertise" : "Languages Spoken";

        return (
          <div key={name}>
            <label className="block text-sm text-primary mb-1">{label} (select up to 5)</label>
            <Controller
              name={name}
              control={control}
              render={({ field }) => {
                const selectedValues = field.value || [];
                return (
                  <CreatableSelect
                    isMulti
                    options={options}
                    value={options
                      .filter((option) => selectedValues.includes(option.value))
                      .concat(
                        selectedValues
                          .filter((val) => !options.some((opt) => opt.value === val))
                          .map((val) => ({ value: val, label: val }))
                      )}
                    onChange={(selectedOptions) => {
                      const newValues = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
                      field.onChange(newValues);
                    }}
                    placeholder={`Select ${label.toLowerCase()}`}
                    className="w-full"
                    classNamePrefix="custom-select"
                    components={{ Option: CustomOption }}
                    styles={customStyles}
                    isOptionDisabled={(option) =>
                      selectedValues.length >= 5 && !selectedValues.includes(option.value)
                    }
                    formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                  />
                );
              }}
            />
            {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>}
          </div>
        );
      })}

      <div className="pt-4 flex flex-col md:flex-row space-y-4 justify-between items-center">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="bg-gray-200 text-primary px-16 py-3 rounded-full w-5/6 md:w-1/4 cursor-pointer"
          disabled={isLoading}
        >
          Previous
        </button>
        <button
          type="submit"
          className="bg-primary text-white px-16 py-3 rounded-full w-5/6 md:w-1/4 cursor-pointer"
          disabled={isLoading}
        >
          Next
        </button>
      </div>
    </div>
  );
};




const Step3 = ({ setStep, setFormData, isLoading, setIsLoading, formData }) => { 
  const { register, formState: { errors }, watch, reset,getValues } = useFormContext();
  const inviteCode = watch("inviteCode");

  const handleRequestCode = async () => {
    const email = watch("email");
    if (!email) {
      toast.error("Email is required to request a code. Please go back to Step 1.");
      return;
    }
    try {
      setIsLoading(true); 
      const currentFormData = getValues();
      const fullData = {
        ...formData,
        ...currentFormData,
        fullName: formData.fullName || currentFormData.fullName || "",
        email: email,
        phone: formData.phone || currentFormData.phone || "",
        residence: formData.residence || currentFormData.residence || "",
        destinationExpertise: formData.destinationExpertise || currentFormData.destinationExpertise || [],
        language: formData.language || currentFormData.language || [],
        typeOfTravel: formData.typeOfTravel || currentFormData.typeOfTravel || [],
        industrySegment: formData.industrySegment || currentFormData.industrySegment || [],
        designation: currentFormData.designation || "",
        organization: currentFormData.organization || "",
        linkedin: currentFormData.linkedin || "",
        inviteCode: currentFormData.inviteCode || "",
      };
      const response = await fetch("/api/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullData),
      });
      // console.log("Request Code fullData:", fullData);
      const result = await response.json();
      // console.log("Request Code Result:", result);
      if (response.ok) {
        toast.success("Code request submitted! Check your email.");
        reset(); 
        setStep(1); 
        setFormData({});
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Request failed: ${error.message}`);
    } finally {
      setIsLoading(false); 
    }
  };


  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary">Step 3: Professional Details & Invite</h3>
      <div>
        <label htmlFor="designation" className="block text-sm text-primary mb-1">Current Designation</label>
        <input
          type="text"
          placeholder="Current Designation"
          id="designation"
          {...register("designation")}
          className="w-full p-3 border border-gray-300 rounded-2xl bg-white"
        />
        {errors.designation && (
          <p className="text-red-500 text-sm mt-1">{errors.designation.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="organization" className="block text-sm text-primary mb-1">Current Organization</label>
        <input
          type="text"
          placeholder="Current Organization"
          id="organization"
          {...register("organization")}
          className="w-full p-3 border border-gray-300 rounded-2xl bg-white"
        />
        {errors.organization && (
          <p className="text-red-500 text-sm mt-1">{errors.organization.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="linkedin" className="block text-sm text-primary mb-1">LinkedIn Profile or Website (optional)</label>
        <input
          type="url"
          placeholder="LinkedIn Profile or Website (optional)"
          id="linkedin"
          {...register("linkedin")}
          className="w-full p-3 border border-gray-300 rounded-2xl bg-white"
        />
        {errors.linkedin && (
          <p className="text-red-500 text-sm mt-1">{errors.linkedin.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="inviteCode" className="block text-sm text-primary mb-1">Invite Code (required)</label>
        <input
          type="text"
          placeholder="Invite Code (required)"
          id="inviteCode"
          {...register("inviteCode")}
          className="w-full p-3 border border-gray-300 rounded-2xl bg-white"
        />
        {errors.inviteCode && (
          <p className="text-red-500 text-sm mt-1">{errors.inviteCode.message}</p>
        )}
      </div>
      <div className="pt-20 flex justify-center items-center space-y-4">
        <button
          type="button"
          onClick={handleRequestCode}
          className={`bg-[#00FFFF] text-primary px-16 py-3 rounded-full w-5/6 md:w-full cursor-pointer ${
            isLoading || inviteCode ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading }
        >
          Request for Code
        </button>
      </div>
      <div className="pt-1 flex justify-between items-center flex-col md:flex-row space-y-4">
        <button
          type="button"
          onClick={() => setStep(2)}
          className={`bg-gray-200 text-primary px-16 py-3 rounded-full w-5/6 md:w-1/4 cursor-pointer ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading} 
        >
          Previous
        </button>
        <button
          type="submit"
          disabled={isLoading || !inviteCode}
          className={`bg-primary text-white px-16 py-3 rounded-full w-5/6 md:w-1/4 cursor-pointer ${
            isLoading || !inviteCode ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
        Proceed
        </button>
      </div>
    </div>
  );
};

const ContactForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false); 

  const methods = useForm({
    resolver: zodResolver(step === 1 ? step1Schema : step === 2 ? step2Schema : step3Schema),
    mode: "onChange",
    defaultValues: {
      typeOfTravel: [],
      industrySegment: [],
      destinationExpertise: [],
      language: [],
      designation: "",
      organization: "",
      linkedin: "",
      inviteCode: "",
    },
  });

  const { handleSubmit, getValues, trigger, reset } = methods;

  const onSubmit = async (data) => {
    const currentData = { ...formData, ...data };

    if (step === 1) {
      const isValid = await trigger();
      if (isValid) {
        setFormData(currentData);
        setStep(2);
      }
    } else if (step === 2) {
      const isValid = await trigger();
      if (isValid) {
        setFormData(currentData);
        setStep(3);
      }
    } else {
      // Final submission
      setIsLoading(true); 
      const fullData = {
        ...formData, 
        ...currentData,
        destinationExpertise: currentData.destinationExpertise,
        language: currentData.language,
        typeOfTravel: currentData.typeOfTravel,
        industrySegment: currentData.industrySegment,
      };
      try {
        const response = await fetch("/api/submit-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fullData),
        });
        const result = await response.json();
        if (response.ok) {
          toast.success("Form submitted successfully!");
          reset(); 
          setStep(1);
          setFormData({});
        } else {
          toast.error(`Submission failed: ${result.error}`);
        }
      } catch (error) {
        toast.error(`Submission failed: ${error.message}`);
      } finally {
        setIsLoading(false); 
      }
    }
  };

  return (
    <section className="py-12 bg-secondary rounded-[40px]" id="apply">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-primary mb-4">
          Shape the Future of Travel Consultancy with Xmytravel.com
          </h2>
          <p className="text-primary">
            Step beyond the ordinary and join an elite, invite-only community where your expertise gets the recognition it deserves...
          </p>
        </div>

        <ProgressBar step={step} />

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto bg-secondary space-y-6">
            {step === 1 && <Step1 setStep={setStep} isLoading={isLoading} />}
            {step === 2 && <Step2 setStep={setStep} isLoading={isLoading} />}
            {step === 3 && <Step3 setStep={setStep} setFormData={setFormData} isLoading={isLoading} setIsLoading={setIsLoading} formData={formData} />}
          </form>
        </FormProvider>
        <ToastContainer /> 
      </div>
    </section>
  );
};

export default ContactForm;