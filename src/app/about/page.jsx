"use client";

import Image from "next/image";
import WhyLTTXSection from "../pages/WhyLTTXSection";
import TravelExpertSection from "../pages/TravelExpertSection";
import OnboardingSection from "../pages/OnboardingSection";
import ComparisonSection from "../pages/ComparisonSection";
import EngagementSection from "../pages/EngagementSection";
import ContactForm from "../components/ContactForm";
import Button from "../components/Button";
import ToolsSupportSection from "../pages/ToolsSupportSection";
import VideoBlogPage from "../pages/VideoBlogPage";
import Navbar from "../components/Navbar";
import Footer from "../pages/Footer";
import JoinOrQueryForm from "../components/JoinOrQueryForm";
import BannerSection from "../pages/Banner-section";
import WhatIsXmytravelSection from "../pages/WhatIsXmytravelSection";
import WhyPlatformMattersSection from "../pages/WhyPlatformMattersSection";
import PlatformComparisonSection from "../pages/PlatformComparisonSection";
import YoureInvitedSection from "../pages/YoureInvitedSection";
import WordsThatDefineUsSection from "../pages/WordsThatDefineUsSection";
import JoinUsSection from "../pages/JoinUsSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <BannerSection />
      <div className="px-4 md:px-8 lg:px-12 gap-4">
        <WhatIsXmytravelSection />
      </div>
      <WhyPlatformMattersSection />
      <YoureInvitedSection />
      <div className="px-4 md:px-8 lg:px-12">
        <PlatformComparisonSection />
      </div>
      <OnboardingSection />
      <WordsThatDefineUsSection />
      <VideoBlogPage />
      <div className="px-4 md:px-8 lg:px-12">
        <JoinOrQueryForm />
        
      </div>
      <Footer />
    </>
  );
}