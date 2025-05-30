import React from 'react';
import Image from 'next/image';

const WhatIsXmytravelSection = () => {
  return (
    <section id='what-is-xmytravel' className="mt-20 bg-secondary p-2 py-10 rounded-[40px]">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
        {/* Content */}
        <div className="md:w-2/3">
          <h2 className="text-2xl lg:text-5xl font-bold text-textcolor mb-5">
            What is Xmytravel?
          </h2>
          <p className="text-lg text-textcolor mb-4">
            The world doesn’t need more travel content. It needs clarity.
          </p>
          <p className="text-lg text-textcolor mb-4">
            Xmytravel is a curated platform that bridges the gap between confused travelers and credible travel experts. Whether you need help with visas, planning a multi-country trip, or navigating aviation rules, here, you get more than advice you get accountability.
          </p>
          <p className="text-lg text-textcolor font-bold">
            This is not Reddit.<br />
            This is not AI guesswork.<br />
            This is Xmytravel expert-led, purpose-built.
          </p>
        </div>
        {/* Illustration */}
        <div className="md:w-1/3 mb-8 md:mb-0">
          <Image
            src='/home/second.png'
           width={600}
            height={300}
            alt='Xmytravel Illustration'
            className="w-full  rounded-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default WhatIsXmytravelSection;