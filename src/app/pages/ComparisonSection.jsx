'use client'
import React from 'react';

const ComparisonSection = () => {
  const features = [
    'Primary Role',
    'Motive',
    'Skills',
    'Independence',
    'Ethical Boundaries',
  ];

  const travelAgentData = [
    'Sells travel packages & services',
    'Earns through commissions & bookings',
    'Focused on selling',
    'Works for travel companies',
    'Can be influenced by commissions',
  ];

  const travelExpertData = [
    'Provides unbiased travel expertise',
    'Earns by sharing trusted knowledge',
    'Deep insights, experience, and industry expertise',
    'Independent, verified professional',
    'LTTX Experts NEVER solicit bookings',
  ];

  return (
    <section className="container mx-auto py-12 bg-primary rounded-3xl">
      <div className="px-4 sm:px-10 ">
        {/* Heading */}
        <h2 className="text-2xl lg:text-5xl font-bold text-white text-center">
          The Difference Between
        </h2>
        <h2 className="text-2xl lg:text-5xl font-bold text-white text-center mb-8">
          A Travel Agent & a Travel Expert
        </h2>

        {/* Scrollable Row */}
        <div className="relative mt-4 pb-6">
          <div className="overflow-x-auto lg:overflow-x-visible px-1 pb-4">
            <div className="flex gap-4 w-max md:w-full">
              {/* Features Column */}
              <div className="flex-[1] bg-white rounded-3xl min-w-[210px]  ">
                <h3 className="text-2xl md:text-3xl font-semibold text-textcolor mb-5 text-center mt-5">
                  Feature
                </h3>
                <hr className="border-3" />
                <div className="bg-primary  w-full" />
                <ul className=" p-3">
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

              {/* Travel Agent Column */}
              <div className="flex-[2] bg-white rounded-3xl min-w-[300px] ">
                <h3 className="text-2xl md:text-3xl font-semibold text-textcolor mb-5 mt-5 text-center">
                  Travel Agent
                </h3>
                <hr className="border-3" />
                <div className="bg-primary  w-full" />
                <ul className=" p-3">
                  {travelAgentData.map((item, index) => (
                    <li
                      key={index}
                      className="text-textcolor text-lg lg:text-xl py-2 px-4"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Travel Expert Column */}
              <div className="flex-[2] bg-secondary rounded-3xl min-w-[300px] ">
                <h3 className="text-2xl md:text-3xl font-semibold text-white mb-5 mt-5 text-center">
                  Travel Expert (LTTX)
                </h3>
                <hr className="border-3" />
                <div className="bg-primary  w-full" />
                <ul className=" p-3">
                  {travelExpertData.map((item, index) => (
                    <li
                      key={index}
                      className="text-white text-lg lg:text-xl py-2 px-4"
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
        <p className="text-white text-center mt-6">
          The experts at LTTX do not solicit bookings. We provide unbiased, expert travel guidance.
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

export default ComparisonSection;

// 'use client'
// import React from 'react';

// const ComparisonSection = () => {
//   const comparisonData = [
//     {
//       feature: 'Primary Role',
//       travelAgent: 'Sells travel packages & services',
//       travelExpert: 'Provides unbiased travel expertise',
//     },
//     {
//       feature: 'Motive',
//       travelAgent: 'Earns through commissions & bookings',
//       travelExpert: 'Earns by sharing trusted knowledge',
//     },
//     {
//       feature: 'Skills',
//       travelAgent: 'Focused on selling',
//       travelExpert: 'Deep insights, experience, and industry expertise',
//     },
//     {
//       feature: 'Independence',
//       travelAgent: 'Works for travel companies',
//       travelExpert: 'Independent, verified professional',
//     },


    
//     {
//       feature: 'Ethical Boundaries',
//       travelAgent: 'Can be influenced by commissions',
//       travelExpert: 'LTTX Experts NEVER solicit bookings',
//     },
//   ];

//   return (
//     <section className="py-12 bg-primary rounded-[40px]">
//       <div className="container mx-auto px-4 lg:px-16">
//         {/* Heading */}
//         <h2 className="text-4xl font-bold text-white text-center mb-8">
//           The Difference Between a Travel Agent & a Travel Expert
//         </h2>
//         {/* Table */}
//         <div className="overflow-x-auto rounded-3xl">
//           <table className="w-full">
//             {/* Table Header */}
//             <thead>
//               <tr>
//                 <th className="p-6 bg-white text-black text-left font-semibold border-b border-gray-300 text-xl lg:text-3xl min-w-[200px]">
//                   Feature
//                 </th>
//                 <th className="p-6 bg-white text-black text-left font-semibold border-b border-gray-300 text-xl lg:text-3xl min-w-[200px]">
//                   Travel Agent
//                 </th>
//                 <th className="p-6 bg-secondary text-black text-left font-semibold border-b border-gray-300 text-xl lg:text-3xl min-w-[200px]">
//                   Travel Expert (LTTX)
//                 </th>
//               </tr>
//             </thead>
//             {/* Table Body */}
//             <tbody>
//               {comparisonData.map((row, index) => (
//                 <tr key={index}>
//                   <td className="p-3 lg:p-6 bg-white text-black border-b border-gray-300 text-md lg:text-xl">
//                     {row.feature}
//                   </td>
//                   <td className="p-3 lg:p-6 bg-white text-black border-b border-gray-300 text-md lg:text-xl">
//                     {row.travelAgent}
//                   </td>
//                   <td className="p-3 lg:p-6 bg-secondary text-black border-b border-gray-300 text-md lg:text-xl">
//                     {row.travelExpert}
                    
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         {/* Footer Note */}
//         <p className="text-white text-center mt-6">
//           The experts at LTTX do not solicit bookings. We provide unbiased, expert travel guidance.
//         </p>

//         {/* Custom Scrollbar Styles with styled-jsx */}
//         <style jsx>{`
//           .overflow-x-auto::-webkit-scrollbar {
//             width: 8px;
//             height: 8px;
//           }
//           .overflow-x-auto::-webkit-scrollbar-track {
//             background: #4B0082; /* Matches bg-primary */
//           }
//           .overflow-x-auto::-webkit-scrollbar-thumb {
//             background-color: #FFC107; /* Yellow scrollbar */
//             border-radius: 4px;
//           }
//           .overflow-x-auto::-webkit-scrollbar-thumb:hover {
//             background-color: #E6A200; /* Darker yellow on hover */
//           }
//         `}</style>
//       </div>
//     </section>
//   );
// };

// export default ComparisonSection;