import Link from 'next/link'
import React from 'react'

const Button = ({btn}) => {
  return (
    <Link href="/apply">
    <button className="bg-secondary text-black px-6 py-3 rounded-full hover:bg-yellow-400">
     {btn}
    </button>
  </Link>
  )
}

export default Button