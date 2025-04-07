import React from 'react'
import Button from '../components/Button'
import Image from 'next/image'

const Hero = () => {
  return (
    <div className="h-screen flex flex-col-reverse md:flex-row items-center justify-between p-6   px-2 md:px-8 lg:px-16">
  {/* Content Section */}
  <div className="max-w-full w-full  text-left  md:mt-20 ">
    <h1 className="text-2xl md:text-5xl font-bold text-black">
      Join the Invite-Only 
    </h1>
    <h1 className="text-2xl md:text-5xl font-bold text-black">Network of Verified Travel Experts</h1>
    <p className="text-gray-700 mt-4 text-md md:text-xl">
    Become part of an elite community dedicated to transforming travel consultancy. Get recognized for your expertise, connect with travelers worldwide, and contribute to an organized, misinformation-free travel industry.
    </p>
    <div className="mt-6 md:mt-8">
      <Button btn="Apply Now" />
    </div>
  </div>

  {/* Image Section */}
  <div className="flex justify-center md:justify-end w-full mt-30 md:mt-20">
    <Image
      src="/home.svg"
      width={300}
      height={300}
      className=" sm:w-[150px] md:w-[350px] lg:w-[500px] h-auto object-cover"
      alt="Home"
    />
  </div>
</div>
  )
}

export default Hero