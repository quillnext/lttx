import React from 'react';
import Image from 'next/image';
import Button from '../components/Button';

const WordsThatDefineUsSection = () => {
  return (
    <section id="words-that-define-us" className="py-12 px-4 md:px-8 lg:px-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
        {/* Image Section */}
        <div className="md:w-1/2 mb-8 md:mb-0 w-full">
          <Image
            src="/lttxexpert.svg"
            width={400}
            height={300}
            alt="Words That Define Us"
            className="w-[85%] h-auto object-cover rounded-lg"
          />
        </div>
        {/* Text Section */}
        <div className="md:w-1/2">
          <h2 className="text-2xl lg:text-5xl font-bold text-textcolor mb-4">
            Words That Define Us
          </h2>
          <p className="text-textcolor mb-6 text-base sm:text-lg md:text-xl">
            Expertise. Integrity. Responsibility. Authority. Clarity.
          </p>
          <p className="text-textcolor mb-6 text-base sm:text-lg md:text-xl">
            This isn’t just a travel Q&A platform. It’s a correction of everything wrong with online travel information today.
          </p>
          <Button btn="Discover More" />
        </div>
      </div>
    </section>
  );
};

export default WordsThatDefineUsSection;