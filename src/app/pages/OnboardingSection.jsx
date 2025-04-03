import React from 'react';
import Step from '../components/Step';


const OnboardingSection = () => {
  const steps = [
    {
      number: 1,
      description: 'Submit your basic details and select your expertise areas.',
    },
    {
      number: 2,
      description: 'Showcase your experience, certifications, and industry achievements.',
    },
    {
      number: 3,
      description: 'Upload documents, photos, and recognitions that prove your credibility.',
    },
    {
      number: null, // No number for the last step (checkmark)
      description: 'Get vetted & approved, then start answering queries and earning!',
    },
  ];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <h2 className="text-4xl font-bold text-black text-center mb-12">
          Simple & Seamless Expert Onboarding
        </h2>
        {/* Steps */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 mt-20">
          {steps.map((step, index) => (
            <Step
              key={index}
              number={step.number}
              description={step.description}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OnboardingSection;