import Image from "next/image";
import WhyLTTXSection from "./pages/WhyLTTXSection";
import TravelExpertSection from "./pages/TravelExpertSection";
import OnboardingSection from "./pages/OnboardingSection";
import ComparisonSection from "./pages/ComparisonSection";
import EngagementSection from "./pages/EngagementSection";
import ContactForm from "./components/ContactForm";
import Button from "./components/Button";
import ToolsSupportSection from "./pages/ToolsSupportSection";
import Hero from "./pages/Hero";
import VideoBlogPage from "./pages/VideoBlogPage";
import Navbar from "./components/Navbar";
import Footer from "./pages/Footer";


export default function Home() {
  return (
    <>
    <Navbar/>

      <Hero/>
 <div className="px-4 md:px-8 lg:px-12 ">
 <WhyLTTXSection/>
 </div>

  <TravelExpertSection/>
  <OnboardingSection/>
  <div className="px-4 md:px-8 lg:px-12 ">
  <ComparisonSection/>
 </div>

  <VideoBlogPage/>
  <EngagementSection/>
  <ToolsSupportSection/>
  
  <div className="px-4 md:px-8 lg:px-12 ">
  <ContactForm/>
  <Footer/>
 </div>
  

  </>
    

  );
}
