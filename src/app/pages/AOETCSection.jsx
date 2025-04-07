import React from 'react';

import Button from '../components/Button';

const AOETCSection = () => {
  const benefits = [
    'Recognition as an Industry Expert',
    'Participation in Webinars, Seminars & Think Tanks',
    'Networking with Global Travel Experts',
    'Access to Exclusive Research & Reports',
    'Opportunities to Shape Travel Policies & Best Practices',
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
         
          <div className="md:w-1/2">
            <h2 className=" text-2xl lg:text-4xl font-bold text-black mb-2">
              LTTX Experts Are Automatically Part of{' '}
              <span className="text-2xl lg:text-4xl">AOETC</span>
            </h2>
            <p className="text-black text-lg mb-4">
              (The Most Prestigious Travel Expert Body)
            </p>
            <p className="text-black mb-6">
              Every approved expert on LTTX gains exclusive membership to AOETC
              (Association of Travel Experts & Consultants), the only global body
              uniting verified travel consultants.
            </p>
           
         
          </div>
          {/* Right Side: Benefits List */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold text-black mb-4">
              Exclusive Benefits:
            </h3>
            <ul className="list-disc list-inside text-black">
              {benefits.map((benefit, index) => (
                <li key={index} className="mb-2">
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-secondary underline mb-4">
              Apply to Join LTTX & Become an AOETC Member
            </h3>
      </div>
    </section>
  );
};

export default AOETCSection;