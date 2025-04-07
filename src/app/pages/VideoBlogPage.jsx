'use client';
import React, { useState } from 'react';

const VideoBlogPage = () => {
  // State to track the active video index
  const [activeIndex, setActiveIndex] = useState(0);

  // Example YouTube video IDs (replace with your own video IDs)
  const videoIds = [
    'JfnVHQ6DZW4', // Example video 1
    'IFO0DIt9GLs', // Example video 2
    '3TWPCXOmVKI', // Example video 3
  ];

  // Update activeIndex based on scroll position (optional, can be enhanced with Intersection Observer)
  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const cardWidth = e.target.children[0].offsetWidth + 24; // Width + gap
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex !== activeIndex && newIndex < videoIds.length) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="container mx-auto bg-white flex flex-col items-center justify-center ">
      {/* Video Slider for mobile, Three-column layout for desktop */}
      <div className="w-full">
        {/* Mobile Slider with Scroll */}
        <div className="md:hidden">
          <div
            className="overflow-x-scroll scrollbar-hide flex gap-6 pb-4"
            onScroll={handleScroll}
          >
            {videoIds.map((videoId, index) => (
              <div
                key={index}
                className=" rounded-2xl p-4 min-w-[350px] flex-shrink-0"
              >
                <iframe
                  width="100%"
                  height="300"
                  src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Video ${index + 1}`}
                  className="rounded-xl"
                ></iframe>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:flex md:flex-row gap-6 w-full">
        
          <div className="bg-gray-200 rounded-2xl w-full md:w-1/3 flex items-center justify-center p-4">
            <iframe
              width="100%"
              height="300"
              src={`https://www.youtube.com/embed/${videoIds[0]}?rel=0`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video 1"
              className="rounded-xl"
            ></iframe>
          </div>

   
          <div className="bg-gray-200 rounded-2xl w-full md:w-1/3 flex items-center justify-center p-4">
            <iframe
              width="100%"
              height="200"
              src={`https://www.youtube.com/embed/${videoIds[1]}?rel=0`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video 2"
              className="rounded-xl"
            ></iframe>
          </div>

      
          <div className="bg-gray-200 rounded-2xl w-full md:w-1/3 flex items-center justify-center p-4">
            <iframe
              width="100%"
              height="200"
              src={`https://www.youtube.com/embed/${videoIds[2]}?rel=0`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video 3"
              className="rounded-xl"
            ></iframe>
          </div>
        </div>
      </div>

   
      <div className="flex items-center justify-center mt-6 space-x-4">
        {videoIds.map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full ${activeIndex === index ? 'bg-yellow-400' : 'bg-gray-300'}`}
            onClick={() => setActiveIndex(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default VideoBlogPage;