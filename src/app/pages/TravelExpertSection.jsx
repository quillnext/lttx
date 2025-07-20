import React from "react";
import Button from "../components/Button";
import Image from "next/image";

// SVG bullet combining circle + arrow
const BulletSVG = ({ circleColor, arrowColor }) => (
  <svg width="32" height="32" viewBox="0 0 50 50">
    <circle cx="14" cy="25" r="8" fill={circleColor} />
    <polygon points="25,17 36,25 25,33" fill={arrowColor} />
  </svg>
);

const TravelExpertSection = () => {
  const expertCategories = [
    "Airline & Aviation Experts",
    "Cruise & Luxury Travel Specialists",
    "Visa & Immigration Consultants",
    "Hotel & Hospitality Professionals",
    "Destination & Cultural Experts",
    "MICE (Meetings, Incentives, Conferences, and Exhibitions) Specialists",
    "Transport & Chauffeur Service Experts",
    "Adventure & Wildlife Travel Specialists",
  ];

  // Matching your image's color scheme
  const bulletStyles = [
    // { circleColor: "#FF6A00", arrowColor: "#FF9900" }, // Orange
    // { circleColor: "#1DA1F2", arrowColor: "#007BFF" }, // Blue
    // { circleColor: "#E91E63", arrowColor: "#FF1493" }, // Pink
    { circleColor: "#FFD700", arrowColor: "#FFB300" }, // Yellow
    { circleColor: "#9C27B0", arrowColor: "#BA55D3" }, // Purple
  ];

  return (
    <section id="eligibility"  className="py-12 px-4 md:px-8 lg:px-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
        
        {/* Image Section */}
        <div className="md:w-1/2 mb-8 md:mb-0 w-full">
          <Image
            src="/travelexpert.svg"
            width={400}
            height={300}
            alt="Expert"
            className="w-[85%] h-auto object-cover rounded-lg"
          />
        </div>

        {/* Text and List Section */}
        <div className="md:w-1/2">
          <h2 className="text-2xl lg:text-5xl font-bold text-textcolor mb-4">
            Are You a Travel Expert?
          </h2>
          <p className="text-textcolor mb-6 text-base sm:text-lg md:text-xl">
          Xmytravel.com is NOT a platform for travel agents. This is an invite-only
            membership for professionals who shape the travel industry.
          </p>
          <ul className="text-textcolor mb-6 space-y-1">
            {expertCategories.map((category, index) => {
              const style = bulletStyles[index % bulletStyles.length];
              return (
                <li key={index} className="flex items-center  text-[14px]">
                  <BulletSVG
                    circleColor={style.circleColor}
                    arrowColor={style.arrowColor}
                  />
                  <span>{category}</span>
                </li>
              );
            })}
          </ul>
          <Button btn="Explore" />
        </div>
      </div>
    </section>
  );
};

export default TravelExpertSection;
