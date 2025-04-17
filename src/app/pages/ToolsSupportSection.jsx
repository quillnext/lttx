import Image from 'next/image';
import React from 'react';

const BulletSVG = ({ circleColor, arrowColor }) => (
  <svg width="32" height="32" viewBox="0 0 50 50">
    <circle cx="14" cy="25" r="8" fill={circleColor} />
    <polygon points="25,17 36,25 25,33" fill={arrowColor} />
  </svg>
);

const ToolsSupportSection = () => {
  const features = [
    'Profile Moderation & Verification to maintain Xmytravel.com’s high standards.',
    'Custom Q&A Moderation to prevent spam and ensure quality expert responses.',
    'Daily Question-of-the-Day with handpicked industry-relevant topics.',
    'Real-Time Analytics Dashboard to view expert rankings, engagement, and impact.',
    'Performance-Based Levels & Rewards for progressing through Xmytravel.com tiers.',
    'Personal Branding & Marketing Tools to get promoted as a travel expert.',
  ];
  const bulletStyles = [
    // { circleColor: "#FF6A00", arrowColor: "#FF9900" }, // Orange
    // { circleColor: "#1DA1F2", arrowColor: "#007BFF" }, // Blue
    // { circleColor: "#E91E63", arrowColor: "#FF1493" }, // Pink
    { circleColor: "#FFD700", arrowColor: "#FFB300" }, // Yellow
    { circleColor: "#9C27B0", arrowColor: "#BA55D3" }, // Purple
  ];

  return (
    <section className="py-12 bg-white px-4 md:px-8 lg:px-12 ">
      <div className="container mx-auto px-4">
        <div className="flex flex-col-reverse md:flex-row items-center gap-8">
          {/* Left Side */}
          <div className="md:w-1/2">
            <h2 className="text-2xl lg:text-5xl font-bold text-textcolor mb-6">
              Powerful Tools & Support for Travel Experts
            </h2>
            <ul className="list-disc list-inside space-y-1 text-textcolor text-md md:text-xl">
              {features.map((feature, index) => {
                const style = bulletStyles[index % bulletStyles.length];
                return (
                  <li key={index} className="flex items-center  text-[14px] ">
                    <BulletSVG
                      circleColor={style.circleColor}
                      arrowColor={style.arrowColor}
                    />
                    <span className="ml-2">{feature}</span>
                  </li>
                );
              })}
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