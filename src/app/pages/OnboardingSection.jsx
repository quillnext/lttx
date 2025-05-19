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
      number: null, 
      description: 'Get vetted & approved, then start answering queries and earning!',
    },
  ];

  return (
    <section id='joining-process' className="py-12 bg-white px-4 md:px-8 lg:px-12 ">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <h2 className="text-2xl lg:text-5xl font-bold text-textcolor text-center  mb-12 lg:mb-30">
          Simple & Seamless Expert Onboarding
        </h2>
        {/* Steps */}
        <div className="flex flex-col md:flex-row items-center gap-12">
          {steps.map((step, index) => (
            <Step
              key={index}
              number={step.number}
              description={step.description}
              isLast={index === steps.length - 1}
              hasArrow={index < steps.length - 1} 
              index={index} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OnboardingSection;