import Image from 'next/image';
import React from 'react';

const ToolsSupportSection = () => {
  const features = [
    'Profile Moderation & Verification to maintain LTTX’s high standards.',
    'Custom Q&A Moderation to prevent spam and ensure quality expert responses.',
    'Daily Question-of-the-Day with handpicked industry-relevant topics.',
    'Real-Time Analytics Dashboard to view expert rankings, engagement, and impact.',
    'Performance-Based Levels & Rewards for progressing through LTTX tiers.',
    'Personal Branding & Marketing Tools to get promoted as a travel expert.',
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col-reverse md:flex-row items-center gap-8">
          {/* Left Side */}
          <div className="md:w-1/2">
            <h2 className="text-2xl lg:text-4xl font-bold text-black mb-6">
              Powerful Tools & Support for Travel Experts
            </h2>
            <ul className="list-disc list-inside text-black text-md md:text-xl">
              {features.map((feature, index) => (
                <li key={index} className="mb-3">
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          {/* Right Side:  */}
          <div className="md:w-1/2">
            <div className=" w-full h-full rounded-lg flex items-center justify-center">
             <Image src='/support.svg' height={400} width={400}  className='contain'alt='tool' />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsSupportSection;