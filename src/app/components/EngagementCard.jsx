import Image from 'next/image';
import React from 'react';

const EngagementCard = ({ icon, title, description }) => {
  return (
    <div className="bg-secondary p-6 rounded-[25px] text-center">
      {/* Icon */}
      <div className="mb-4 flex justify-start">
        <div className=" p-3  w-15 h-12 flex items-center justify-center">
      <Image src='/engage.png' width={40} height={40} alt='engage' className=''/>
        </div>
      </div>
      {/* Title */}
      <h3 className="text-lg font-semibold text-black mb-2 text-start">{title}</h3>
      {/* Description */}
      <p className="text-black text-sm text-start">{description}</p>
    </div>
  );
};

export default EngagementCard;