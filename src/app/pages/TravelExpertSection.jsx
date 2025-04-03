import React from 'react'
import Button from '../components/Button';
import Image from 'next/image';

const TravelExpertSection = () => {
    const expertCategories = [
        'Airline & Aviation Experts',
        'Cruise & Luxury Travel Specialists',
        'Visa & Immigration Consultants',
        'Hotel & Hospitality Professionals',
        'Destination & Cultural Experts',
        'MICE (Meetings, Incentives, Conferences, and Exhibitions) Specialists',
        'Transport & Chauffeur Service Experts',
        'Adventure & Wildlife Travel Specialists',
      ];
  return (
    <section className="py-12">
    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
    
      <div className="md:w-1/2 mb-8 md:mb-0">
      <Image
                src='/travelexpert.png'
                width={500}
                height={400}
                alt='Expert'
                /> 
         
      </div>
   
      <div className="md:w-1/2">
        <h2 className="text-4xl font-bold text-black mb-4">Are You a Travel Expert?</h2>
        <p className="text-black mb-6">
          LTTX is NOT a platform for travel agents. This is an invite-only membership for professionals who shape the travel industry.
        </p>
        <ul className="list-disc list-inside text-black mb-6">
          {expertCategories.map((category, index) => (
            <li key={index}>{category}</li>
          ))}
        </ul>
       <Button btn='Apply '/>
      </div>
    </div>
  </section>
  )
}

export default TravelExpertSection