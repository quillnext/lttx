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
    <section className="py-12 bg-primary rounded-3xl">
      <div className="px-4 sm:px-10">
        {/* Heading */}
        <h2 className="text-2xl lg:text-5xl font-bold text-white text-center  lg:mb-8">
          The Difference Between 
        </h2>
        <h2 className="text-2xl lg:text-5xl font-bold text-white text-center mb-8">A Travel Agent & a Travel Expert</h2>
        {/* Columns with horizontal scroll on small screens */}
        <div className="overflow-x-auto md:overflow-x-visible">
          <div className="flex flex-row gap-4 min-h-[400px] w-max md:w-auto">
            {/* Feature Column (1/5 width) */}
            <div className="md:w-1/5 bg-white p-4 rounded-3xl min-w-[200px]">
              <h3 className="text-3xl font-semibold text-textcolor mb-5 text-center items-center mt-5">Feature</h3>
              <div className='bg-primary h-1 w-full' />
              <ul>
                {features.map((feature, index) => (
                  <li key={index} className="text-secondary text-2xl font-semibold py-2 px-8">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            {/* Travel Agent Column (2/5 width) */}
            <div className="md:w-2/5 bg-white p-4 rounded-3xl min-w-[300px]">
              <h3 className="text-3xl font-semibold text-textcolor mb-5 mt-5 text-center">Travel Agent</h3>
              <div className='bg-primary h-1 w-full' />
              <ul>
                {travelAgentData.map((item, index) => (
                  <li key={index} className="text-textcolor text-xl py-2 px-8">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Travel Expert Column (2/5 width) */}
            <div className="md:w-2/5 bg-secondary p-4 rounded-3xl min-w-[300px]">
              <h3 className="text-3xl font-semibold text-textcolor mb-5 mt-5 text-center items-center">Travel Expert (LTTX)</h3>
              <div className='bg-primary h-1 w-full' />
              <ul>
                {travelExpertData.map((item, index) => (
                  <li key={index} className="text-textcolor text-xl py-2 px-8">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* Footer Note */}
        <p className="text-white text-center mt-6">
          The experts at LTTX do not solicit bookings. We provide unbiased, expert travel guidance.
        </p>
               <style jsx>{`
           .overflow-x-auto::-webkit-scrollbar {
             width: 8px;
             height: 15px;
           }
           .overflow-x-auto::-webkit-scrollbar-track {
             background: #ffffff; 
             border-radius: 8px;
           }
           .overflow-x-auto::-webkit-scrollbar-thumb {
             background-color: #FFC107; /* Yellow scrollbar */
             border-radius: 8px;
           }
           .overflow-x-auto::-webkit-scrollbar-thumb:hover {
             background-color: #E6A200; /* Darker yellow on hover */
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