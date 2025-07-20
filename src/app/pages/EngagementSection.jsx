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
      description: 'Answer real traveller questions & build credibility.',
    },
  ];

  return (
    <section className="py-12 bg-white px-4 md:px-8 lg:px-12 ">
      <div className="container mx-auto px-2 lg:px-4">
        <div className="flex flex-col-reverse md:flex-row items-center gap-8">
          {/* Left Side: Cards */}
          <div className="md:w-1/2">
            <h2 className="hidden md:block text-2xl font-semibold text-textcolor mb-6">
            Xmytravel.com Keeps Travel eXperts Engaged Through:
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
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
          <div className="md:w-1/2 text-start lg:ml-10">
            <h3 className="text-2xl lg:text-5xl font-bold text-textcolor mb-4">
              Engage. Answer. Lead.
            </h3>
            <p className="text-textcolor mb-6 text-xl">
              Stay active, earn points, and be featured as a top-ranked expert in
              your category!
            </p>
           <Button btn='Explore' />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EngagementSection;