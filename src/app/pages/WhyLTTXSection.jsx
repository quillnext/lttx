import React from 'react';
import Card from '../components/Card';
import Image from 'next/image';

const WhyLTTXSection = () => {
  const cards = [
    {
      image: '/card1.png',
      title: 'Exclusive Invite-Only Network',
      description: 'Stand out as a trusted, vetted travel expert.',
    },
    {
      image: '/card2.png',
      title: 'Monetize Your Knowledge',
      description: 'Get paid for consultations & expert insights.',
    },
    {
      image: '/card3.png',
      title: 'Industry Recognition',
      description: 'Elevate your professional credibility.',
    },
    {
      image: '/card4.png',
      title: 'Premium Community Access',
      description: 'Network with the top consultants worldwide.',
    },
    {
      image: '/card5.png',
      title: 'Skill Growth & Learning',
      description: 'Access exclusive training, webinars, and certifications.',
    },
    {
      image: '/card6.png',
      title: 'Lead the Travel Industry',
      description: 'Play a key role in educating and guiding travelers.',
    },
  ];

  return (
    <section className="bg-secondary p-12  rounded-2xl">
     <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        {/* Illustration */}
        <div className="md:w-1/3 mb-8 md:mb-0">
        <Image
        src='/lttxexpert.png'
        width={300}
        height={300}
        alt='Expert'
        /> 
          <h2 className="text-5xl font-bold text-black mb-5 mt-5">Why Become </h2>
          <h2 className="text-5xl font-bold text-black mb-8">An LTTX Expert?</h2>
        </div>
        {/* Content */}
        <div className="md:w-2/3">
         
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <Card
                key={index}
                image={card.image} // Changed from icon to image
                title={card.title}
                description={card.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyLTTXSection;