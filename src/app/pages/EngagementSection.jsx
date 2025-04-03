import React from 'react';



import Button from '../components/Button';
import EngagementCard from '../components/EngagementCard';

const EngagementSection = () => {
  const cards = [
    {
   
      title: 'Daily Travel Challenges',
      description: 'Test your knowledge & earn recognition.',
    },
    {
   
      title: 'Expert Debates & Discussions',
      description: 'Collaborate on key industry topics.',
    },
    {

      title: 'Leaderboard Rankings',
      description: 'Get rewarded for your contributions & insights.',
    },
    {

      title: 'Public Q&A Forums',
      description: 'Answer real traveler questions & build credibility.',
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Left Side: Cards */}
          <div className="md:w-2/3">
            <h2 className="text-2xl font-semibold text-black mb-6">
              LTTX Keeps Experts Engaged Through:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {cards.map((card, index) => (
                <EngagementCard
                  key={index}
                //   icon={card.icon}
                  title={card.title}
                  description={card.description}
                />
              ))}
            </div>
          </div>
          {/* Right Side: Call to Action */}
          <div className="md:w-1/3 text-center">
            <h3 className="text-4xl font-bold text-black mb-4">
              Engage. Answer. Lead.
            </h3>
            <p className="text-black mb-6">
              Stay active, earn points, and be featured as a top-ranked expert in
              your category!
            </p>
           <Button btn='Apply Now' />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EngagementSection;