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
    <section id='why-Xmytravel' className=" scroll-mt-[100px] bg-secondary p-2 py-10   rounded-[40px] ">
     <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
        {/* Illustration */}
        <div className="md:w-1/3 mb-8 md:mb-0">
        <Image
        src='/lttxexpert.svg'
        width={300}
        height={300}
        alt='Expert'
        className="w-[85%] h-auto object-cover "
        /> 
          <h2 className="text-2xl lg:text-5xl font-bold text-textcolor mb-5 mt-5">Why Become 

          <span className="text-2xl lg:text-5xl font-bold text-textcolor mb-8">   a Travel eXpert on Xmytravel.com?</span>
          </h2>
         
        </div>
        {/* Content */}
        <div className="md:w-2/3 -mt-20 md:-mt-0">
         
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <Card
                key={index}
                image={card.image} 
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