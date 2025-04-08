import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Button = ({btn}) => {
  return (
    <Link href="#apply">
    <button className=" flex bg-secondary text-primary px-6 py-3 rounded-[40px] hover:bg-yellow-400 gap-5 text-xl">
     {btn}
     <Image src='/rightarrow.png' height={16} width={16} className='items-center mt-1 ' alt='arrow '/>
    </button>
  </Link>
  )
}

export default Button