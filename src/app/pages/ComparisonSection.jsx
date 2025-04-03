import React from 'react';

const ComparisonSection = () => {
  const features = [
    'Primary Role',
    'Motive',
    'Skills',
    'Independence',
    'Ethical Boundaries',
  ];

  const travelAgentData = [
    'Sells travel packages & services',
    'Earns through commissions & bookings',
    'Focused on selling',
    'Works for travel companies',
    'Can be influenced by commissions',
  ];

  const travelExpertData = [
    'Provides unbiased travel expertise',
    'Earns by sharing trusted knowledge',
    'Deep insights, experience, and industry expertise',
    'Independent, verified professional',
    'LTTX Experts NEVER solicit bookings',
  ];

  return (
    <section className="py-12 bg-primary rounded-3xl">
      <div className="container mx-auto px-10">
        {/* Heading */}
        <h2 className="text-5xl font-bold text-white text-center mb-8">
          The Difference Between 
        </h2>
        <h2 className="text-5xl font-bold text-white text-center mb-8">A Travel Agent & a Travel Expert</h2>
        {/* Columns */}
        <div className="flex flex-col md:flex-row gap-4 min-h-[400px]">
          {/* Feature Column (1/5 width) */}
          <div className="md:w-1/5 bg-white p-4 rounded-3xl">
            <h3 className="text-3xl font-semibold text-textcolor mb-5  text-center items-center mt-5">Feature</h3>
            <div className='bg-primary h-1 w-full'/>
            <ul>
              {features.map((feature, index) => (
                <li key={index} className="text-secondary text-2xl font-semibold py-2 px-8">
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          {/* Travel Agent Column (2/5 width) */}
          <div className="md:w-2/5 bg-white p-4 rounded-3xl">
            <h3 className="text-3xl font-semibold text-textcolor mb-5 mt-5  text-center">Travel Agent</h3>
            <div className='bg-primary h-1 w-full'/>
            <ul>
              {travelAgentData.map((item, index) => (
                <li key={index} className="text-textcolor text-xl py-2 px-8">
                  {item}
                </li>
              ))}
            </ul>
          </div>
         
          <div className="md:w-2/5 bg-secondary p-4 rounded-3xl">
            <h3 className="text-3xl font-semibold text-textcolor mb-5 mt-5 text-center items-center">Travel Expert (LTTX)</h3>
            <div className='bg-primary h-1 w-full'/>
            <ul>
              {travelExpertData.map((item, index) => (
                <li key={index} className="text-textcolor text-xl py-2 px-8">
                  {item}
                 
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Footer Note */}
        <p className="text-white text-center mt-6">
          The experts at LTTX do not solicit bookings. We provide unbiased, expert travel guidance.
        </p>
      </div>
    </section>
  );
};

export default ComparisonSection;