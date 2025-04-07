import Image from 'next/image';
import React from 'react';

const Card = ({ image, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-4xl shadow-lg  transition-transform transform hover:scale-105">
      {/* Image Container */}
      <div className="mb-4 flex ">
        <div className="bg-blue-100 p-3 rounded-full w-12 h-12 relative">
        <Image
              src={image}
              alt={title}
              width={40}
              height={40}
              className="rounded-full object-contain"
              
            />
        </div>
      </div>
      {/* Title */}
      <h3 className="text-2xl lg:text-lg font-semibold text-black mb-2">{title}</h3>
      {/* Description */}
      <p className="text-gray-600 text-lg lg:text-sm">{description}</p>
    </div>
  );
};

export default Card;