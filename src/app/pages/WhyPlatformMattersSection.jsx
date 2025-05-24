import React from 'react';
import Image from 'next/image';
import Button from '../components/Button';

// SVG bullet combining circle + arrow
const BulletSVG = ({ circleColor, arrowColor }) => (
  <svg width="32" height="32" viewBox="0 0 50 50">
    <circle cx="14" cy="25" r="8" fill={circleColor} />
    <polygon points="25,17 36,25 25,33" fill={arrowColor} />
  </svg>
);

const WhyPlatformMattersSection = () => {
  const platformPoints = [
    'You get real consultations with professionals, not random DMs.',
    'You avoid expensive mistakes caused by bad advice.',
    'You connect with people who’ve worked in airlines, tourism boards, embassies, and global operations.',
  ];

  // Matching bullet styles from TravelExpertSection
  const bulletStyles = [
    { circleColor: '#FFD700', arrowColor: '#FFB300' }, // Yellow
    { circleColor: '#9C27B0', arrowColor: '#BA55D3' }, // Purple
  ];

  return (
    <section id="why-platform-matters" className="py-12 px-4 md:px-8 lg:px-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
        {/* Image Section */}
        <div className="md:w-1/2 mb-8 md:mb-0 w-full">
          <Image
            src="/home/third.png"
          width={600}
            height={300}
            alt="Platform Matters"
            className="w-full  rounded-lg "
          />
        </div>

        {/* Text and List Section */}
        <div className="md:w-1/2">
          <h2 className="text-2xl lg:text-5xl font-bold text-textcolor mb-4">
            Why This Platform Matters
          </h2>
          <p className="text-textcolor mb-6 text-base sm:text-lg md:text-xl">
            You don’t need more opinions. You need expertise. The internet is flooded with conflicting information. One search gives you five answers. Most are outdated, biased, or just plain wrong.
          </p>
          <p className="text-textcolor mb-6 text-base sm:text-lg md:text-xl">
            At Xmytravel:
          </p>
          <ul className="text-textcolor mb-6 space-y-1">
            {platformPoints.map((point, index) => {
              const style = bulletStyles[index % bulletStyles.length];
              return (
                <li key={index} className="flex items-center text-[14px]">
                  <BulletSVG
                    circleColor={style.circleColor}
                    arrowColor={style.arrowColor}
                  />
                  <span>{point}</span>
                </li>
              );
            })}
          </ul>
          <p className="text-textcolor mb-6 text-base sm:text-lg md:text-xl font-bold">
            Think of it as having a panel of travel scientists — for your life’s most memorable decisions.
          </p>
          <Button btn="Learn More" />
        </div>
      </div>
    </section>
  );
};

export default WhyPlatformMattersSection;