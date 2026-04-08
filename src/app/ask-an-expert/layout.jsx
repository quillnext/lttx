import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../pages/Footer'

export const metadata = {
  title: "Ask a Travel Expert | Personalized Itineraries & Visa Advice",
  description: "Connect with verified travel experts for personalized itineraries, visa consultation, and flight bookings. Get expert answers to your travel questions.",
  openGraph: {
    title: "Ask a Travel Expert | Xmytravel",
    description: "Get real-time answers from verified travel professionals.",
    url: "https://www.xmytravel.com/ask-an-expert",
    type: "website",
  },
};

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