import Image from "next/image";
import WhyLTTXSection from "./pages/WhyLTTXSection";
import TravelExpertSection from "./pages/TravelExpertSection";
import OnboardingSection from "./pages/OnboardingSection";
import ComparisonSection from "./pages/ComparisonSection";
import AOETCSection from "./pages/AOETCSection";
import EngagementSection from "./pages/EngagementSection";
import ContactForm from "./components/ContactForm";

export default function Home() {
  return (
    <div className="px-8">
  <div className="min-h-[calc(100vh-80px)] flex items-center justify-between p-10">
  <div className="max-w-lg">
    <h1 className="text-4xl font-bold text-black">
      Join the Invite-Only Network of Verified Travel Experts
    </h1>
    <p className="text-gray-700 mt-4">
      Become part of the elite community dedicated to transforming travel worldwide, and contribute to an organized, misinformation-free travel industry.
    </p>
    <button className="bg-secondary text-black px-6 py-3 mt-6 rounded-full hover:bg-yellow-400">
      Apply Now
    </button>
  </div>
  <div className="flex space-x-4">
    <Image
      src="/home.png"
      width={500}
      height={500}
      className="w-[500px] h-[500px] object-cover"
      alt="Home"
    />
  </div>
</div>

  <WhyLTTXSection/>
  <TravelExpertSection/>
  <OnboardingSection/>
  <ComparisonSection/>
  <AOETCSection/>
  <EngagementSection/>
  <ContactForm/>
  </div>
    

  );
}
