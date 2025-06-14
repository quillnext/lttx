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

const YoureInvitedSection = () => {
  const platformPoints = [
    'You don’t sell packages. You share wisdom.',
    'You don’t compete for attention. You stand out with credibility.',
    'You don’t answer to algorithms. You serve travellers with ethics and knowledge.',
  ];

  // Matching bullet styles from previous sections
  const bulletStyles = [
    { circleColor: '#FFD700', arrowColor: '#FFB300' }, // Yellow
    { circleColor: '#9C27B0', arrowColor: '#BA55D3' }, // Purple
  ];

  return (
    <section id="youre-invited" className="py-12 px-4 md:px-8 lg:px-12">
      <div className="container mx-auto px-4 flex md:flex-row items-center gap-2 md:gap-10 flex-col-reverse">
        {/* Text and List Section */}
        <div className="md:w-1/2">
          <h2 className="text-2xl lg:text-5xl font-bold text-textcolor mb-4">
            You Don’t Just Join, You’re Invited
          </h2>
          <p className="text-textcolor mb-6 text-base sm:text-lg md:text-xl">
            Not everyone can call themselves an “Xmytravel Expert.” This is a vetted, invite-only space for professionals who’ve earned their stripes in the travel industry.
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
          <p className="text-textcolor mb-6 text-base sm:text-lg md:text-xl">
            <span className="font-bold">Roles we welcome:</span> Airline professionals, visa specialists, luxury travel planners, revenue managers, logistics experts, operations heads, DMC veterans, and more.
          </p>
          <Button btn="Apply Now" />
        </div>
        {/* Image Section */}
        <div className="md:w-1/2 mb-8 md:mb-0 w-full">
          <Image
            src="/home/fourth.png"
         width={600}
            height={300}
            alt="Invited Expert"
            className="w-full rounded-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default YoureInvitedSection;