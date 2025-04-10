'use client'
import React, { useState } from 'react';
import { useForm, FormProvider, useFormContext,Controller } from 'react-hook-form';
import Select from 'react-select';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import CreatableSelect from 'react-select/creatable';

//  Zod schemas
const step1Schema = z.object({
  fullName: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phone: z.string().min(1, 'Phone Number is required'),
  residence: z.string().min(1, 'City & Country of Residence is required'),
});

// const step2Schema = z.object({
//   language: z.string().min(1, 'Language Spoken is required'),
//   expertise: z.string().min(1, 'Area of Expertise is required'),
//   designation: z.string().min(1, 'Current Designation is required'),
//   organization: z.string().min(1, 'Current Organization is required'),
// });
const step2Schema = z.object({
  typeOfTravel: z
    .array(z.string())
    .min(1, 'At least one type of travel is required')
    .max(5, 'You can select up to 5 types of travel'),
  industrySegment: z
    .array(z.string())
    .min(1, 'At least one industry segment is required')
    .max(5, 'You can select up to 5 industry segments'),
  destinationExpertise: z
    .array(z.string())
    .min(1, 'At least one destination expertise is required')
    .max(5, 'You can select up to 5 destinations'),
  language: z
    .array(z.string())
    .min(1, 'At least one language is required')
    .max(5, 'You can select up to 5 languages'),
});

const step3Schema = z.object({
  designation: z.string().min(1, 'Current Designation is required'),
  organization: z.string().min(1, 'Current Organization is required'),
  linkedin: z.string().optional(),
  inviteCode: z.string().optional(),
});

// Progress Bar 
const ProgressBar = ({ step }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
        <div className={`h-1 w-24 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
      </div>
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
        <div className={`h-1 w-24 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
    </div>
  );
};

// Step Components
const Step1 = () => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-4 ">
      <div><input  type="text" placeholder="Full Name" id="fullName" {...register('fullName')} className="w-full p-3 border border-gray-300 rounded-2xl bg-white" />
        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}</div>
      <div><input  type="email" placeholder="Email Address" id="email" {...register('email')} className="w-full p-3 border border-gray-300 rounded-2xl bg-white" />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}</div>
      <div><input  type="tel" placeholder="Phone Number" id="phone" {...register('phone')} className="w-full p-3 border border-gray-300 rounded-2xl bg-white" />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}</div>
      <div><input  type="text" placeholder="City & Country of Residence" id="residence" {...register('residence')} className="w-full p-3 border border-gray-300 rounded-2xl bg-white" />
        {errors.residence && <p className="text-red-500 text-sm mt-1">{errors.residence.message}</p>}</div>
      <div className="pt-4 flex justify-center  ">
        <button type="submit" className="bg-primary text-white px-16 py-3 rounded-full w-5/6 md:w-1/4">Next</button>
      </div>
    </div>
  );
};

// Options for Type of Travel
const typeOfTravelOptions = [
  { value: 'Leisure', label: 'Leisure' },
  { value: 'Corporate / Business', label: 'Corporate / Business' },
  { value: 'Luxury', label: 'Luxury' },
  { value: 'Adventure', label: 'Adventure' },
  { value: 'Group Travel', label: 'Group Travel' },
  { value: 'Solo Travel', label: 'Solo Travel' },
  { value: 'Family Travel', label: 'Family Travel' },
  { value: 'Honeymoon / Romance', label: 'Honeymoon / Romance' },
  { value: 'Religious / Pilgrimage', label: 'Religious / Pilgrimage' },
  { value: 'Wellness / Retreats', label: 'Wellness / Retreats' },
  { value: 'Educational / Student', label: 'Educational / Student' },
  { value: 'Events / Weddings', label: 'Events / Weddings' },
];

// Options for Industry Segment
const industrySegmentOptions = [
  { value: 'Airlines', label: 'Airlines' },
  { value: 'Cruises', label: 'Cruises' },
  { value: 'Hotels & Resorts', label: 'Hotels & Resorts' },
  { value: 'Tour Operators', label: 'Tour Operators' },
  { value: 'Travel Agencies', label: 'Travel Agencies' },
  { value: 'DMC (Destination Management Company)', label: 'DMC (Destination Management Company)' },
  { value: 'Visa Services', label: 'Visa Services' },
  { value: 'Car Rentals / Transfers', label: 'Car Rentals / Transfers' },
  { value: 'Insurance', label: 'Insurance' },
  { value: 'Travel Tech', label: 'Travel Tech' },
  { value: 'Tourism Board', label: 'Tourism Board' },
  { value: 'Luxury Concierge', label: 'Luxury Concierge' },
  { value: 'OTA (Online Travel Agency)', label: 'OTA (Online Travel Agency)' },
];

// Options for Destination Expertise (Regions)
const destinationExpertiseOptions = [
  { value: 'North America', label: 'North America' },
  { value: 'South America', label: 'South America' },
  { value: 'Europe', label: 'Europe' },
  { value: 'Africa', label: 'Africa' },
  { value: 'Middle East', label: 'Middle East' },
  { value: 'South Asia', label: 'South Asia' },
  { value: 'Southeast Asia', label: 'Southeast Asia' },
  { value: 'East Asia', label: 'East Asia' },
  { value: 'Australia & Oceania', label: 'Australia & Oceania' },
];

// Options for Languages Spoken
const languageOptions = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Mandarin Chinese', label: 'Mandarin Chinese' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'French', label: 'French' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Russian', label: 'Russian' },
  { value: 'German', label: 'German' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Turkish', label: 'Turkish' },
  { value: 'Vietnamese', label: 'Vietnamese' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Malay / Indonesian', label: 'Malay / Indonesian' },
  { value: 'Swahili', label: 'Swahili' },
];

// const Step2 = ({ setStep }) => {
//   const { register, formState: { errors } } = useFormContext();
//   return (
//     <div className="space-y-4">
//       <div><select id="language" {...register('language')} className="w-full p-3 border border-gray-300 rounded-2xl bg-white">
//           <option value="">Language Spoken</option>
//           <option value="English">English</option>
//           <option value="Spanish">Spanish</option>
//           <option value="French">French</option>
//           <option value="German">German</option>
//         </select>
//         {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language.message}</p>}</div>
//       <div><select id="expertise" {...register('expertise')} className="w-full p-3 border border-gray-300 rounded-2xl bg-white">
//           <option value="">Area of Expertise</option>
//           <option value="Adventure Travel">Adventure Travel</option>
//           <option value="Luxury Travel">Luxury Travel</option>
//           <option value="Cultural Tourism">Cultural Tourism</option>
//           <option value="Sustainable Travel">Sustainable Travel</option>
//         </select>
//         {errors.expertise && <p className="text-red-500 text-sm mt-1">{errors.expertise.message}</p>}</div>
//       <div><input type="text" placeholder="Current Designation" id="designation" {...register('designation')} className="w-full p-3 border border-gray-300 rounded-2xl bg-white" />
//         {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation.message}</p>}</div>
//       <div><input type="text" placeholder="Current Organization" id="organization" {...register('organization')} className="w-full p-3 border border-gray-300 rounded-2xl bg-white" />
//         {errors.organization && <p className="text-red-500 text-sm mt-1">{errors.organization.message}</p>}</div>
//       <div className="pt-4 flex flex-col md:flex-row space-y-4 justify-between items-center ">
//         <button type="button" onClick={() => setStep(1)} className="bg-gray-200 text-primary px-16 py-3 rounded-full w-5/6 md:w-1/4">Previous</button>
//         <button type="submit" className="bg-primary text-white px-16 py-3 rounded-full w-5/6 md:w-1/4">Next</button>
//       </div>
//     </div>
//   );
// };


const Step2 = ({ setStep }) => {
  const { control, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6">
      {/* Type of Travel */}
      <div>
        <label className="block text-primary mb-2">Type of Travel (select up to 5)</label>
        <Controller
          name="typeOfTravel"
          control={control}
          render={({ field }) => (
            <Select
              isMulti
              options={typeOfTravelOptions}
              value={typeOfTravelOptions.filter((option) =>
                field.value?.includes(option.value)
              )}
              onChange={(selectedOptions) => {
                const selectedValues = selectedOptions
                  ? selectedOptions.map((option) => option.value)
                  : [];
                field.onChange(selectedValues);
              }}
              placeholder="Select the kinds of travel you specialize in"
              className="w-full"
              classNamePrefix="custom-select"
              isOptionDisabled={() => field.value?.length >= 5}
            />
          )}
        />
        {errors.typeOfTravel && (
          <p className="text-red-500 text-sm mt-1">{errors.typeOfTravel.message}</p>
        )}
       
      </div>

      {/* Industry Segment */}
      <div>
        <label className="block text-primary mb-2">Industry Segment (select up to 5)</label>
        <Controller
          name="industrySegment"
          control={control}
          render={({ field }) => (
            <Select
              isMulti
              options={industrySegmentOptions}
              value={industrySegmentOptions.filter((option) =>
                field.value?.includes(option.value)
              )}
              onChange={(selectedOptions) => {
                const selectedValues = selectedOptions
                  ? selectedOptions.map((option) => option.value)
                  : [];
                field.onChange(selectedValues);
              }}
              placeholder="What part of the travel industry are you from?"
              className="w-full"
              classNamePrefix="custom-select"
              isOptionDisabled={() => field.value?.length >= 5}
            />
          )}
        />
        {errors.industrySegment && (
          <p className="text-red-500 text-sm mt-1">{errors.industrySegment.message}</p>
        )}
        
      </div>

      {/* Destination Expertise */}
      <div>
        <label className="block text-primary mb-2">Destination Expertise (select up to 5)</label>
        <Controller
          name="destinationExpertise"
          control={control}
          render={({ field }) => (
            <CreatableSelect
              isMulti
              options={destinationExpertiseOptions}
              value={destinationExpertiseOptions.filter((option) =>
                field.value?.includes(option.value)
              ).concat(
                field.value
                  ?.filter((val) => !destinationExpertiseOptions.some((opt) => opt.value === val))
                  .map((val) => ({ value: val, label: val }))
              )}
              onChange={(selectedOptions) => {
                const selectedValues = selectedOptions
                  ? selectedOptions.map((option) => option.value)
                  : [];
                field.onChange(selectedValues);
              }}
              placeholder="Choose regions or type to add specific countries (e.g., Japan, Italy)"
              className="w-full"
              classNamePrefix="custom-select"
              isOptionDisabled={() => field.value?.length >= 5}
              formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
            />
          )}
        />
        {errors.destinationExpertise && (
          <p className="text-red-500 text-sm mt-1">{errors.destinationExpertise.message}</p>
        )}
       
      </div>

      {/* Languages Spoken */}
      <div>
        <label className="block text-primary mb-2">Languages Spoken (select up to 5)</label>
        <Controller
          name="language"
          control={control}
          render={({ field }) => (
            <CreatableSelect
              isMulti
              options={languageOptions}
              value={languageOptions.filter((option) =>
                field.value?.includes(option.value)
              ).concat(
                field.value
                  ?.filter((val) => !languageOptions.some((opt) => opt.value === val))
                  .map((val) => ({ value: val, label: val }))
              )}
              onChange={(selectedOptions) => {
                const selectedValues = selectedOptions
                  ? selectedOptions.map((option) => option.value)
                  : [];
                field.onChange(selectedValues);
              }}
              placeholder="Select languages you are fluent or conversational in"
              className="w-full"
              classNamePrefix="custom-select"
              isOptionDisabled={() => field.value?.length >= 5}
              formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
            />
          )}
        />
        {errors.language && (
          <p className="text-red-500 text-sm mt-1">{errors.language.message}</p>
        )}
      
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 flex flex-col md:flex-row space-y-4 justify-between items-center">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="bg-gray-200 text-primary px-16 py-3 rounded-full w-5/6 md:w-1/4"
        >
          Previous
        </button>
        <button
          type="submit"
          className="bg-primary text-white px-16 py-3 rounded-full w-5/6 md:w-1/4"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const Step3 = ({ setStep }) => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Current Designation"
          id="designation"
          {...register('designation')}
          className="w-full p-3 border border-gray-300 rounded-2xl bg-white"
        />
        {errors.designation && (
          <p className="text-red-500 text-sm mt-1">{errors.designation.message}</p>
        )}
      </div>
      <div>
        <input
          type="text"
          placeholder="Current Organization"
          id="organization"
          {...register('organization')}
          className="w-full p-3 border border-gray-300 rounded-2xl bg-white"
        />
        {errors.organization && (
          <p className="text-red-500 text-sm mt-1">{errors.organization.message}</p>
        )}
      </div>

      
      <div><input type="url" placeholder="LinkedIn Profile or Website (optional)" id="linkedin" {...register('linkedin')} className="w-full p-3 border border-gray-300 rounded-2xl bg-white" />
        {errors.linkedin && <p className="text-red-500 text-sm mt-1">{errors.linkedin.message}</p>}</div>
      <div><input type="text" placeholder="Invite Code (optional)" id="inviteCode" {...register('inviteCode')} className="w-full p-3 border border-gray-300 rounded-2xl bg-white" />
        {errors.inviteCode && <p className="text-red-500 text-sm mt-1">{errors.inviteCode.message}</p>}</div>
      <div className="pt-20 flex justify-center items-center  space-y-4">
        <button className='bg-[#00FFFF] text-primary px-16 py-3 rounded-full w-5/6 md:w-full'>Request for Code</button>
    
      </div>
      <div className="pt-1 flex justify-between items-center flex-col md:flex-row space-y-4">
        <button type="button" onClick={() => setStep(2)} className="bg-gray-200 text-primary px-16 py-3 rounded-full w-5/6 md:w-1/4">Previous</button>
        <button type="submit" className="bg-primary text-white px-16 py-3  rounded-full w-5/6 md:w-1/4">Proceed</button>
      </div>
    </div>
  );
};

const ContactForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  // const methods = useForm({
  //   resolver: zodResolver(step === 1 ? step1Schema : step === 2 ? step2Schema : step3Schema),
  //   mode: 'onChange',
  // });

  const methods = useForm({
    resolver: zodResolver(step === 1 ? step1Schema : step === 2 ? step2Schema : step3Schema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      residence: '',
      typeOfTravel: [], // New field
      industrySegment: [], // New field
      destinationExpertise: [], // New field
      language: [],
      designation: '',
      organization: '',
      linkedin: '',
      inviteCode: '',
    },
  });

  const { handleSubmit, getValues, trigger } = methods;

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
      console.log('Final Form Data:', currentData);
      // Submit to backend here
    }
  };

  return (
    <section id='apply' className="py-12 bg-secondary rounded-[40px]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <h2 className="text-2xl lg:text-5xl font-bold text-primary mb-4">
            Shape the Future of Travel Consultancy with LTTX
          </h2>
          <p className="text-primary text-base sm:text-lg md:text-xl">
          Step beyond the ordinary and join an elite, invite-only community where your expertise gets the recognition it deserves. Gain exclusive access to global travellers, establish yourself as a verified travel expert, and unlock opportunities to earn, learn, and lead.
          </p>
        </div>

        <ProgressBar step={step} />

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto bg-secondary  space-y-6">
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 setStep={setStep} />}
            {step === 3 && <Step3 setStep={setStep} />}
          </form>
        </FormProvider>
      </div>
    </section>
  );
};

export default ContactForm;