'use client'
import React, { useState } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

//  Zod schemas
const step1Schema = z.object({
  fullName: z.string().min(1, 'Full Name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phone: z.string().min(1, 'Phone Number is required'),
  residence: z.string().min(1, 'City & Country of Residence is required'),
});

const step2Schema = z.object({
  language: z.string().min(1, 'Language Spoken is required'),
  expertise: z.string().min(1, 'Area of Expertise is required'),
  designation: z.string().min(1, 'Current Designation is required'),
  organization: z.string().min(1, 'Current Organization is required'),
});

const step3Schema = z.object({
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

const Step2 = ({ setStep }) => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-4">
      <div><select id="language" {...register('language')} className="w-full p-3 border border-gray-300 rounded-2xl bg-white">
          <option value="">Language Spoken</option>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
        </select>
        {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language.message}</p>}</div>
      <div><select id="expertise" {...register('expertise')} className="w-full p-3 border border-gray-300 rounded-2xl bg-white">
          <option value="">Area of Expertise</option>
          <option value="Adventure Travel">Adventure Travel</option>
          <option value="Luxury Travel">Luxury Travel</option>
          <option value="Cultural Tourism">Cultural Tourism</option>
          <option value="Sustainable Travel">Sustainable Travel</option>
        </select>
        {errors.expertise && <p className="text-red-500 text-sm mt-1">{errors.expertise.message}</p>}</div>
      <div><input type="text" placeholder="Current Designation" id="designation" {...register('designation')} className="w-full p-3 border border-gray-300 rounded-2xl bg-white" />
        {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation.message}</p>}</div>
      <div><input type="text" placeholder="Current Organization" id="organization" {...register('organization')} className="w-full p-3 border border-gray-300 rounded-2xl bg-white" />
        {errors.organization && <p className="text-red-500 text-sm mt-1">{errors.organization.message}</p>}</div>
      <div className="pt-4 flex flex-col md:flex-row space-y-4 justify-between items-center ">
        <button type="button" onClick={() => setStep(1)} className="bg-gray-200 text-primary px-16 py-3 rounded-full w-5/6 md:w-1/4">Previous</button>
        <button type="submit" className="bg-primary text-white px-16 py-3 rounded-full w-5/6 md:w-1/4">Next</button>
      </div>
    </div>
  );
};

const Step3 = ({ setStep }) => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-4">
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

  const methods = useForm({
    resolver: zodResolver(step === 1 ? step1Schema : step === 2 ? step2Schema : step3Schema),
    mode: 'onChange',
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