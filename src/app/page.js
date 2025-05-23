import Image from "next/image";
import WhyLTTXSection from "./pages/WhyLTTXSection";
import TravelExpertSection from "./pages/TravelExpertSection";
import OnboardingSection from "./pages/OnboardingSection";
import ComparisonSection from "./pages/ComparisonSection";
import EngagementSection from "./pages/EngagementSection";
import ContactForm from "./components/ContactForm";
import Button from "./components/Button";
import ToolsSupportSection from "./pages/ToolsSupportSection";
// import Hero from "./pages/Hero";
import VideoBlogPage from "./pages/VideoBlogPage";
import Navbar from "./components/Navbar";
import Footer from "./pages/Footer";
import JoinOrQueryForm from "./components/JoinOrQueryForm";
import BannerSection from "./pages/Banner-section";
import WhatIsXmytravelSection from "./pages/WhatIsXmytravelSection";
import WhyPlatformMattersSection from "./pages/WhyPlatformMattersSection";
import PlatformComparisonSection from "./pages/PlatformComparisonSection";
import YoureInvitedSection from "./pages/YoureInvitedSection";
import WordsThatDefineUsSection from "./pages/WordsThatDefineUsSection";
import JoinUsSection from "./pages/JoinUsSection";


export default function Home() {
  return (
    <>
    <Navbar/>

      {/* <Hero/> */}
      <BannerSection/>
 <div className="px-4 md:px-8 lg:px-12 gap-4 ">
 {/* <WhyLTTXSection/> */}
 <WhatIsXmytravelSection/>
 
 </div>
 
<WhyPlatformMattersSection/>
<YoureInvitedSection/>
  {/* <TravelExpertSection/> */}
  <div className="px-4 md:px-8 lg:px-12 ">
  {/* <ComparisonSection/> */}
  <PlatformComparisonSection/>
 </div>
   <OnboardingSection/>
  <WordsThatDefineUsSection/>

  

  <VideoBlogPage/>
  {/* <EngagementSection/> */}
  {/* <ToolsSupportSection/> */}
  
  <div className="px-4 md:px-8 lg:px-12 ">
  {/* <ContactForm/> */}
  {/* <JoinUsSection/> */}

  <JoinOrQueryForm/>
  <Footer/>
 </div>
  

  </>
    

  );
}
