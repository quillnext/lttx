import Image from 'next/image'
import React from 'react'

const Step = ({ number, description, isLast = false }) => {
  return (
    <div className="flex flex-col items-center relative">
    {/* Circle with Number or Checkmark */}
    <div
      className={`w-25 h-25 rounded-full flex items-center justify-center mb-4 ${
        isLast ? '' : 'bg-secondary'
      }`}
    >
      {isLast ? (
       <Image src='/facheck.png' width={90} height={90} alt='facheck'/>
      ) : (
        <span className="text-white text-5xl font-bold">{number}</span>
      )}
    </div>
    {/* Description */}
    <p className="text-black text-center max-w-xs">{description}</p>
    {/* Arrow (not shown for the last step) */}
    {!isLast && (
      <div className="absolute -top-12 left-1/2 transform translate-x-12 hidden md:block">
       <Image
       src='/arrow.png'
       width={250}
       height={150}
       alt='Arrow'

       />
      </div>
    )}
  </div>
  )
}

export default Step