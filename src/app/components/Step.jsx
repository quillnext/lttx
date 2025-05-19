import Image from 'next/image';
import React from 'react';

const Step = ({ number, description, isLast = false, hasArrow = false, index }) => {
  return (
    <div className="flex flex-col items-center text-center relative">
      {/* Circle with Number or Checkmark */}
      <div
        className={`w-20 h-20 md:w-25 md:h-25 rounded-full flex items-center justify-center mb-4 ${
          isLast ? 'bg-blue-200' : 'bg-secondary'
        }`}
      >
        {isLast ? (
          <Image src="/facheck.svg" width={90} height={90} alt="Checkmark" />
        ) : (
          <span className="text-white text-3xl md:text-5xl font-bold">{number}</span>
        )}
      </div>
      {/* Description */}
      <p className="text-black text-center max-w-xs px-5 mb-6">{description}</p>
      {/* Arrow  */}
      {hasArrow && (
        <div
          className={`absolute top-1/2 transform rotate-90 md:rotate-0  ${
           
            index % 2 === 0
              ? 'translate-x-32 translate-y-10 md:translate-x-36 md:-translate-y-36'
              : 'translate-x-[-100px] rotate-x-180 md:rotate-x-0 translate-y-10 md:translate-x-36 md:-translate-y-36'
          }`}
        >
          <Image

          
            src="/arrow.png"
            width={150}
            height={150}
            alt="Arrow"
            className="contain"
          />
        </div>
      )}
    </div>
  );
};

export default Step;