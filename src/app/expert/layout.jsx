import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../pages/Footer'

const ExpertLayout = ({children}) => {
  return (
    <>
    <Navbar/>
    {children}
    <Footer/>
    </>
  )
}

export default ExpertLayout