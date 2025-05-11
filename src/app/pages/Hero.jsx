import React from 'react';
import Button from '../components/Button';
import Image from 'next/image';

const Hero = () => {
  return (
    <div className="min-h-screen flex flex-col-reverse md:flex-row items-center justify-between px-4 py-8 md:px-12 lg:px-20 pt-[120px]">
      {/* Content Section */}
      <div className="w-full text-left">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-textcolor leading-tight">
          Travel better. Travel wiser. 
        </h1>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-textcolor leading-tight">
          Travel with experts.
        </h1>
        <p className="text-textcolor mt-4 text-base sm:text-lg md:text-xl max-w-xl">
         Xmytravel connects travelers with verified travel experts — not hobbyists, not bots, not
crowd-sourced confusion.
This is where insight meets integrity.
        </p>
        <div className="mt-6 md:mt-8">
          <Button btn="Join Xmytravel" />
        </div>
      </div>

      {/* Image Section */}
      <div className="w-full md:w-auto flex justify-center md:justify-end">
        <div
          className="relative"
          style={{
            width: '409.31px',
            height: '418.93px',
          }}
        >
          <Image
            src="/home.svg"
            fill
            alt="Home"
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
