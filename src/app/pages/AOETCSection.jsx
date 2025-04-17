import React from 'react';

const BulletSVG = ({ circleColor, arrowColor }) => (
  <svg width="32" height="32" viewBox="0 0 50 50">
    <circle cx="14" cy="25" r="8" fill={circleColor} />
    <polygon points="25,17 36,25 25,33" fill={arrowColor} />
  </svg>
);

const AOETCSection = () => {
  const benefits = [
    'Recognition as an Industry Expert',
    'Participation in Webinars, Seminars & Think Tanks',
    'Networking with Global Travel Experts',
    'Access to Exclusive Research & Reports',
    'Opportunities to Shape Travel Policies & Best Practices',
  ];
  const bulletStyles = [
    // { circleColor: "#FF6A00", arrowColor: "#FF9900" }, // Orange
    // { circleColor: "#1DA1F2", arrowColor: "#007BFF" }, // Blue
    // { circleColor: "#E91E63", arrowColor: "#FF1493" }, // Pink
    { circleColor: "#FFD700", arrowColor: "#FFB300" }, // Yellow
    { circleColor: "#9C27B0", arrowColor: "#BA55D3" }, // Purple
  ];
  return (
    <section id='aoetc' className="py-12 bg-white px-4 md:px-8 lg:px-12 ">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
         
          <div className="md:w-1/2">
            <h2 className=" text-2xl lg:text-5xl font-bold text-textcolor mb-2">
            Xmytravel.com Experts Are Automatically Part of{' '}
              <span className="text-2xl lg:text-4xl">ASSOTEC</span>
            </h2>
            <p className="text-textcolor font-semibold text-lg mb-4">
              (The Most Prestigious Travel Expert Body)
            </p>
            <p className="text-textcolor mb-6 text-base sm:text-lg md:text-xl">
              Every Approved Travel eXpert on Xmytravel.com gains exclusive membership to ASSOTEC
              (Association of Travel Experts & Consultants), the only global body
              uniting verified travel consultants.
            </p>
           
         
          </div>
          {/* Right Side: Benefits List */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold text-textcolor mb-4">
              Exclusive Benefits:
            </h3>
            <ul className="text-textcolor space-y-1">
              {benefits.map((benefit, index) => {
                const style = bulletStyles[index % bulletStyles.length];
                return (
                  // Using the BulletSVG component to render the bullet points
                  // and passing the circleColor and arrowColor as props
                  <li key={index} className="flex items-center   text-[14px]">
                    <BulletSVG
                      circleColor={style.circleColor}
                      arrowColor={style.arrowColor}
                    />
                    <span>{benefit}</span>
                  </li>
                );
              }
            )}
            </ul>
          </div>
        </div>
        <h3 className="text-lg lg:text-xl font-semibold text-secondary underline mb-4">
              Apply to Join Xmytravel.com & Become an ASSOTEC Member
            </h3>
      </div>
    </section>
  );
};

export default AOETCSection;