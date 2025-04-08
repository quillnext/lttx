'use client';
import React, { useRef, useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const VideoBlogPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const videoIds = [
    '4obhi0uV4cs',
    'nCBCYQZNcEI',
    '3TWPCXOmVKI',
    '6xC7BE1bwm0',
    'e48dojEIrY8',
  ];

  // Scroll to index
  const scrollToIndex = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const childWidth = container.children[0].offsetWidth;
      container.scrollTo({
        left: index * (childWidth + 16), // includes margin
        behavior: 'smooth',
      });
    }
    setActiveIndex(index);
  };

  const nextVideo = () => {
    const newIndex = (activeIndex + 1) % videoIds.length;
    scrollToIndex(newIndex);
  };

  const prevVideo = () => {
    const newIndex = (activeIndex - 1 + videoIds.length) % videoIds.length;
    scrollToIndex(newIndex);
  };

  // Sync index on manual scroll
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const childWidth = scrollContainerRef.current.children[0].offsetWidth + 16;
      const newIndex = Math.round(scrollLeft / childWidth);
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    container?.addEventListener('scroll', handleScroll, { passive: true });
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [activeIndex]);

  return (
    <div className="container mx-auto flex flex-col items-center justify-center p-6 px-4 md:px-8 lg:px-12">
      {/* Mobile View */}
      <div className="w-full md:hidden relative">
        {/* Scrollable Carousel */}
        <div
          className="overflow-x-auto flex space-x-4 w-full px-2 scrollbar-thin snap-x snap-mandatory scroll-smooth"
          ref={scrollContainerRef}
        >
          {videoIds.map((id, index) => (
            <div
              key={index}
              className="min-w-[85%] flex-shrink-0 snap-start"
            >
              <iframe
                width="100%"
                height="300"
                src={`https://www.youtube.com/embed/${id}?rel=0`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`Video ${index + 1}`}
                className="rounded-xl"
              ></iframe>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="absolute top-1/2 left-2 z-10">
          <button
            onClick={prevVideo}
            className="bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/70 transition-all focus:outline-none"
          >
            <FaArrowLeft size={20} />
          </button>
        </div>
        <div className="absolute top-1/2 right-2 z-10">
          <button
            onClick={nextVideo}
            className="bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/70 transition-all focus:outline-none"
          >
            <FaArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex md:flex-wrap gap-6 w-full justify-center mt-6">
        {videoIds.map((id, index) => (
          <div key={index} className="rounded-2xl w-full md:w-[18%] flex items-center justify-center p-4">
            <iframe
              width="100%"
              height="300"
              src={`https://www.youtube.com/embed/${id}?rel=0`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`Video ${index + 1}`}
              className="rounded-xl"
            ></iframe>
          </div>
        ))}
      </div>

      {/* Progress Indicators */}
      <div className="flex items-center justify-center mt-6 space-x-4">
        {videoIds.map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full cursor-pointer ${
              activeIndex === index ? 'bg-yellow-400' : 'bg-gray-300'
            }`}
            onClick={() => scrollToIndex(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default VideoBlogPage;
