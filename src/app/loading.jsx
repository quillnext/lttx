import React from 'react'

const loading = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-secondary bg-opacity-75 z-50">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-primary u/pulse-primary border-t-white"></div>
    <p className="mt-4 text-white text-lg">Loading...</p>
  </div>
  )
}

export default loading