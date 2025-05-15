'use client'; // For App Router; remove this if using Pages Router

import { useEffect, useState } from 'react';
import Image from 'next/image';

const BannerSection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="relative w-full min-h-screen overflow-hidden flex items-start md:items-center justify-start text-[#36013F] font-sans mt-10 mb-10">
      {/* Background Images */}
      <div className="absolute inset-0 -z-10 w-full h-full">
        <Image
          src={isMobile ? '/mobile-banner.jpg' : '/desktop-banner.jpg'}
          alt="Travel X Factor Banner"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Text Content */}
      <div className="relative z-10 w-full max-w-2xl px-6 md:px-20 pt-16 pb-32 md:pt-0 md:pb-0 text-left">
        <h1 className="text-2xl md:text-5xl font-bold leading-snug md:leading-tight mb-4">
          Give your travel <br className="hidden md:block" /> the X factor
        </h1>
        <p className="text-base md:text-xl font-semibold mb-3">
          Travel smarter. Travel deeper. Travel with experts.
        </p>
        <p className="text-sm md:text-lg mb-3 text-black leading-relaxed">
          The X stands for expertise, experience, and exploration, all delivered by verified travel
          professionals, not hobbyists or bots.
        </p>
        <p className="text-sm md:text-base font-semibold text-[#36013F] mb-6">
          This is travel experience, multiplied.
        </p>
        <a
          href="#apply"
          className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-5 py-1.5 rounded-full transition"
        >
          Make your next trip “X” times better!
        </a>
      </div>
    </section>
  );
};

export default BannerSection;
