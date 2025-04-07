import Image from "next/image";
import WhyLTTXSection from "./pages/WhyLTTXSection";
import TravelExpertSection from "./pages/TravelExpertSection";
import OnboardingSection from "./pages/OnboardingSection";
import ComparisonSection from "./pages/ComparisonSection";
import AOETCSection from "./pages/AOETCSection";
import EngagementSection from "./pages/EngagementSection";
import ContactForm from "./components/ContactForm";
import Button from "./components/Button";
import ToolsSupportSection from "./pages/ToolsSupportSection";
import Hero from "./pages/Hero";
import VideoBlogPage from "./pages/VideoBlogPage";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="px-4 md:px-8 lg:px-12">
      <Navbar/>
      <Hero/>

  <WhyLTTXSection/>
  <TravelExpertSection/>
  <OnboardingSection/>
  <ComparisonSection/>
  <AOETCSection/>
  <VideoBlogPage/>
  <EngagementSection/>
  <ToolsSupportSection/>
  <ContactForm/>
  </div>
    

  );
}
