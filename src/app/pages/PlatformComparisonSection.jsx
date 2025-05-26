'use client'
import React from 'react';

const PlatformComparisonSection = () => {
  const features = [
    'Anyone Can Post?',
    'Verified Expertise?',
    'Commission-Free?',
    'Personalized Advice?',
    'Human Responsibility?',
  ];

  const googleData = [
    'Yes',
    'No',
    'N/A',
    'No',
    'No',
  ];

  const redditData = [
    'Yes',
    'No',
    'Yes',
    'No',
    'No',
  ];

  const chatGPTData = [
    'Yes',
    'No',
    'N/A',
    'Generic',
    'No',
  ];

  const xmytravelData = [
    'No',
    'Yes',
    'Yes',
    'Yes',
    'Yes',
  ];

  return (
    <section className="container mx-auto py-12 bg-primary rounded-3xl mt-20">
      <div className="px-4 sm:px-10">
        {/* Heading */}
        <h2 className="text-2xl lg:text-5xl font-bold text-white text-center">
          How Xmytravel Stands Out
        </h2>
        <h2 className="text-2xl lg:text-5xl font-bold text-white text-center mb-8">
          Compared to Other Platforms
        </h2>

        {/* Scrollable Row */}
        <div className="relative mt-4 pb-6">
          <div className="overflow-x-auto lg:overflow-x-visible px-1 pb-4">
            <div className="flex gap-4 w-max md:w-full">
              {/* Features Column */}
              <div className="flex-[1] bg-white rounded-3xl min-w-[250px]">
                <h3 className="text-2xl md:text-3xl font-semibold text-textcolor mb-5 text-center mt-5">
                  Feature
                </h3>
                <hr className="border-3" />
                <div className="bg-primary w-full" />
                <ul className="p-3">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="text-secondary text-lg lg:text-xl font-semibold py-2 px-4"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Google Column */}
              <div className="flex-[2] bg-white rounded-3xl min-w-[200px]">
                <h3 className="text-2xl md:text-3xl font-semibold text-textcolor mb-5 mt-5 text-center">
                  Google
                </h3>
                <hr className="border-3" />
                <div className="bg-primary w-full" />
                <ul className="p-3 text-center">
                  {googleData.map((item, index) => (
                    <li
                      key={index}
                      className="text-textcolor text-lg lg:text-xl py-2 px-4"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reddit Column */}
              <div className="flex-[2] bg-white rounded-3xl min-w-[200px]">
                <h3 className="text-2xl md:text-3xl font-semibold text-textcolor mb-5 mt-5 text-center">
                  Reddit
                </h3>
                <hr className="border-3" />
                <div className="bg-primary w-full" />
                <ul className="p-3 text-center">
                  {redditData.map((item, index) => (
                    <li
                      key={index}
                      className="text-textcolor text-lg lg:text-xl py-2 px-4"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ChatGPT/AI Column */}
              <div className="flex-[2] bg-white rounded-3xl min-w-[200px]">
                <h3 className="text-2xl md:text-3xl font-semibold text-textcolor mb-5 mt-5 text-center">
                  ChatGPT/AI
                </h3>
                <hr className="border-3" />
                <div className="bg-primary w-full" />
                <ul className="p-3 text-center">
                  {chatGPTData.map((item, index) => (
                    <li
                      key={index}
                      className="text-textcolor text-lg lg:text-xl py-2 px-4"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Xmytravel Column */}
              <div className="flex-[2] bg-secondary rounded-3xl min-w-[200px]">
                <h3 className="text-2xl md:text-3xl font-semibold text-primary mb-5 mt-5 text-center">
                  Xmytravel
                </h3>
                <hr className="border-3" />
                <div className="bg-primary w-full" />
                <ul className="p-3 text-center">
                  {xmytravelData.map((item, index) => (
                    <li
                      key={index}
                      className="text-primary text-lg lg:text-xl py-2 px-4"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-secondary text-center mt-6">
          Xmytravel offers verified, commission-free expertise with personalized advice and human responsibility, unlike other platforms.
        </p>

        {/* Scrollbar Style */}
        <style jsx>{`
          .overflow-x-auto::-webkit-scrollbar {
            height: 14px;
          }
          .overflow-x-auto::-webkit-scrollbar-track {
            background: #ffffff;
            border-radius: 15px;
            margin-top: 10px;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb {
            background-color: #FFC107;
            border-radius: 15px;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb:hover {
            background-color: #E6A200;
          }
        `}</style>
      </div>
    </section>
  );
};

export default PlatformComparisonSection;