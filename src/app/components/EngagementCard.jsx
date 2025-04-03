import React from 'react';

const EngagementCard = ({ icon, title, description }) => {
  return (
    <div className="bg-yellow-200 p-6 rounded-lg text-center">
      {/* Icon */}
      <div className="mb-4 flex justify-center">
        <div className="bg-white p-3 rounded-full w-12 h-12 flex items-center justify-center">
          {icon}
        </div>
      </div>
      {/* Title */}
      <h3 className="text-lg font-semibold text-black mb-2">{title}</h3>
      {/* Description */}
      <p className="text-black text-sm">{description}</p>
    </div>
  );
};

export default EngagementCard;