
import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../pages/Footer";

export const metadata = {
  title: "The Xmytravel Trust Framework | Verified Travel Expertise",
  description: "Discover how Xmytravel verifies travel experts through a multi-layered manual process. Learn about our standards for accountability, integrity, and traveller protection.",
  openGraph: {
    title: "The Xmytravel Trust Framework | Verified Travel Expertise",
    description: "Learn how we maintain quality and trust by manually verifying every travel expert on our platform. No bots, no influencers—only verified professionals.",
    url: "https://www.xmytravel.com/verification-process",
    siteName: "Xmytravel",
    images: [
      {
        url: "https://www.xmytravel.com/emailbanner.jpeg",
        width: 1200,
        height: 630,
        alt: "Xmytravel Trust Framework",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Xmytravel Trust Framework",
    description: "Our operating doctrine for accountability and verified expertise in the travel industry.",
    images: ["https://www.xmytravel.com/emailbanner.jpeg"],
  },
};

export default function TrustFrameworkPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white font-sans text-gray-900 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header Section */}
          <header className="mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#36013F] leading-tight mb-6">
              The Xmytravel Trust Framework
            </h1>
            <p className="text-xl md:text-2xl font-medium text-gray-600 leading-relaxed mb-4">
              How We Verify Travel Experts. Why It Matters. What It Means for Travellers.
            </p>
            <div className="h-1.5 w-20 bg-[#F4D35E] rounded-full mb-10"></div>
            
            <div className="space-y-6 text-lg leading-relaxed text-gray-700">
              <p>Travel today suffers from one core problem. <br />
              <span className="font-bold text-[#36013F]">Too much information. Too little accountability.</span></p>
              
              <p>Xmytravel exists to fix that.</p>
              
              <p>This page explains, in full transparency, how Xmytravel verifies travel experts, how we maintain quality over time, and what assurance travellers and partners can expect when using the platform.</p>
              
              <p className="italic font-semibold border-l-4 border-[#36013F] pl-4 py-2 bg-gray-50">
                This is not a marketing page. <br />
                This is our operating doctrine.
              </p>
            </div>
          </header>

          <hr className="border-gray-100 my-12" />

          {/* Why Verification Section */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-[#36013F] mb-6">
              Why Verification Is Non-Negotiable in Travel
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>Travel decisions impact money, time, safety, visas, and once-in-a-lifetime experiences.</p>
              <p>Yet most advice online comes from:</p>
              <ul className="list-disc pl-6 space-y-2 marker:text-[#36013F]">
                <li>Anonymous content creators</li>
                <li>Paid influencers</li>
                <li>Sales-driven agents</li>
                <li>Aggregated AI content with no accountability</li>
              </ul>
              <p className="pt-4 font-bold text-lg text-[#36013F]">
                Xmytravel was built on one principle:
              </p>
              <blockquote className="text-xl font-semibold text-gray-800 py-4 italic">
                "If advice influences a travel decision, the person giving it must be identifiable, qualified, and accountable."
              </blockquote>
              <p>Verification is not a feature for us. It is the foundation.</p>
            </div>
          </section>

          <hr className="border-gray-100 my-12" />

          {/* Who Can Be an Expert Section */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-[#36013F] mb-6">
              Who Can Be an Expert on Xmytravel
            </h2>
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>Xmytravel does not allow open sign-ups for experts.</p>
              <p>Every expert on the platform falls into one or more of the following categories:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none pl-0">
                {[
                  "Destination specialists with proven on-ground experience",
                  "Visa and documentation professionals",
                  "Tour operators and DMCs with operational history",
                  "Corporate travel professionals",
                  "Hospitality and airline industry professionals",
                  "Niche specialists (cruises, adventure, luxury, MICE, religious travel, etc.)"
                ].map((item, idx) => (
                  <li key={idx} className="bg-gray-50 p-4 rounded-xl border-l-2 border-[#F4D35E] text-sm font-medium">
                    {item}
                  </li>
                ))}
              </ul>
              <p className="font-semibold mt-4">
                If someone cannot demonstrate real-world exposure, they do not qualify. <br />
                Followers, likes, or content virality are irrelevant.
              </p>
            </div>
          </section>

          <hr className="border-gray-100 my-12" />

          {/* Process Section */}
          <section className="mb-16 space-y-16">
            <h2 className="text-2xl md:text-3xl font-bold text-[#36013F]">
              The Xmytravel Expert Verification Process
            </h2>
            <p className="text-gray-600 -mt-8 italic">Verification is multi-layered and manual. There is no automated approval.</p>

            <div className="space-y-12">
              <div>
                <h3 className="text-xl font-bold text-[#36013F] mb-4 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#36013F] text-white flex items-center justify-center text-sm">1</span>
                  Identity Verification
                </h3>
                <div className="pl-11 space-y-3">
                  <p>Every expert must submit:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Government-issued identity proof</li>
                    <li>Verified contact details</li>
                    <li>Professional digital footprint validation</li>
                  </ul>
                  <p className="font-medium text-gray-800">Anonymous profiles are not allowed. Pseudonyms are not allowed.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#36013F] mb-4 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#36013F] text-white flex items-center justify-center text-sm">2</span>
                  Professional Background Validation
                </h3>
                <div className="pl-11 space-y-3">
                  <p>We verify:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Years of experience in travel or hospitality</li>
                    <li>Current and past roles</li>
                    <li>Business registrations where applicable</li>
                    <li>Destination or domain specialisation</li>
                  </ul>
                  <p className="font-medium text-gray-800">This step filters out hobbyists and armchair advisors.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#36013F] mb-4 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#36013F] text-white flex items-center justify-center text-sm">3</span>
                  Expertise Relevance Check
                </h3>
                <div className="pl-11 space-y-3">
                  <p>Not all experience equals expertise. We assess:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Depth of destination knowledge</li>
                    <li>Actual involvement in planning or operations</li>
                    <li>Type of traveller handled (budget, luxury, corporate, family, etc.)</li>
                    <li>Relevance of expertise to Xmytravel’s consultation model</li>
                  </ul>
                  <p className="font-medium text-gray-800">Only specialists are approved. Generalists are not prioritised.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#36013F] mb-4 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#36013F] text-white flex items-center justify-center text-sm">4</span>
                  Behavioural & Intent Screening
                </h3>
                <div className="pl-11 space-y-3">
                  <p className="font-semibold text-red-600">This is critical.</p>
                  <p>We screen for:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Over-selling tendencies</li>
                    <li>Commission-first mindset</li>
                    <li>Conflict of interest risks</li>
                    <li>Misinformation patterns</li>
                  </ul>
                  <p className="pt-2">Xmytravel experts are advisors first, sellers second. Anyone unwilling to respect that boundary is rejected.</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#36013F] mb-4 flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#36013F] text-white flex items-center justify-center text-sm">5</span>
                  Internal Approval and Onboarding
                </h3>
                <div className="pl-11 space-y-3">
                  <p>Final approval is granted only after:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Manual internal review</li>
                    <li>Expert category tagging</li>
                    <li>Scope of advice definition</li>
                    <li>Platform conduct agreement acceptance</li>
                  </ul>
                  <p className="font-medium text-gray-800">Approval is intentional, not volume-driven.</p>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-100 my-12" />

          {/* Continuous Monitoring */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-[#36013F] mb-6">
              Verification Does Not End at Onboarding
            </h2>
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>Most platforms stop at onboarding. Xmytravel does not.</p>
              <p className="font-bold">Continuous Monitoring Includes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>User feedback analysis</li>
                <li>Consultation quality checks</li>
                <li>Relevance of answers given</li>
                <li>Pattern reviews of advice shared</li>
              </ul>
              <p className="font-bold pt-4">Experts can be:</p>
              <div className="flex gap-4 ">
                {["Paused", "Re-evaluated", "De-listed"].map((status) => (
                  <span key={status} className="px-3 py-1 bg-red-50 text-red-700 text-xs font-black rounded uppercase border border-red-100">
                    {status}
                  </span>
                ))}
              </div>
              <p className="font-semibold text-lg text-[#36013F]">Verification is a living process.</p>
            </div>
          </section>

          <hr className="border-gray-100 my-12" />

          {/* What Verified Means Section */}
          <section className="mb-16 bg-[#36013F] text-white p-8 rounded-3xl shadow-xl">
            <h2 className="text-2xl font-bold mb-8">What “Verified” Means on Xmytravel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <p className="text-[#F4D35E] font-black uppercase text-xs tracking-widest mb-4">It Means:</p>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2"><span>•</span> They are a real, identifiable professional</li>
                  <li className="flex gap-2"><span>•</span> Their expertise has been manually evaluated</li>
                  <li className="flex gap-2"><span>•</span> Their advice is traceable to a person, not content</li>
                  <li className="flex gap-2"><span>•</span> Their presence is monitored over time</li>
                </ul>
              </div>
              <div>
                <p className="text-red-400 font-black uppercase text-xs tracking-widest mb-4">It Does Not Mean:</p>
                <ul className="space-y-3 text-sm opacity-80">
                  <li className="flex gap-2"><span>•</span> They are paid by Xmytravel to promote anything</li>
                  <li className="flex gap-2"><span>•</span> Their advice is sponsored</li>
                  <li className="flex gap-2"><span>•</span> Their ranking is influenced by commissions</li>
                </ul>
              </div>
            </div>
            <p className="mt-10 text-center font-bold text-lg border-t border-white/10 pt-6">
              Trust is structural, not cosmetic.
            </p>
          </section>

          <hr className="border-gray-100 my-12" />

          {/* Protection & Industry Sections */}
          <div className="space-y-16">
            <section>
              <h2 className="text-2xl font-bold text-[#36013F] mb-6">How Xmytravel Protects Travellers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { t: "1. No Anonymous Advice", d: "Every answer is tied to a verified profile." },
                  { t: "2. Clear Scope of Expertise", d: "Experts only answer within defined domains." },
                  { t: "3. No Algorithmic Opinion Ranking", d: "Experts are surfaced based on relevance, not popularity." },
                  { t: "4. Transparency Over Transactions", d: "Advice can exist without booking pressure." }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-[#36013F] mb-1">{item.t}</h4>
                    <p className="text-sm text-gray-600">{item.d}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#36013F] mb-6">For Travel Experts: Why This Matters</h2>
              <div className="space-y-4">
                <p>Being verified on Xmytravel signals:</p>
                <ul className="list-disc pl-6 space-y-1 font-medium text-gray-700">
                  <li>Professional credibility</li>
                  <li>Domain authority</li>
                  <li>Accountability</li>
                  <li>Long-term trust over short-term sales</li>
                </ul>
                <p className="font-bold text-[#36013F]">Xmytravel is not a lead marketplace. It is a reputation platform.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#36013F] mb-6">For the Industry: What Xmytravel Is Building</h2>
              <div className="space-y-4 text-gray-700">
                <p>Xmytravel is creating:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>A public record of expert-led travel advice</li>
                  <li>A structured alternative to misinformation</li>
                  <li>A trust layer missing in modern travel planning</li>
                </ul>
                <p className="font-bold text-lg pt-2">
                  We believe the future of travel is: <br />
                  <span className="text-[#36013F]">Verified expertise + transparent advice + informed travellers</span>
                </p>
              </div>
            </section>
          </div>

          <hr className="border-gray-100 my-12" />

          {/* Final Sections */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-[#36013F] mb-6">Our Commitment to Transparency</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              This framework is public by design. We will continue to refine it as the platform grows.
            </p>
            <p className="text-xl font-extrabold text-[#36013F]">
              Trust is not claimed. <br />
              It is earned, documented, and defended.
            </p>
          </section>

          <footer className="pt-10 border-t-4 border-[#F4D35E]">
            <h3 className="text-2xl font-bold text-[#36013F] mb-6 text-center">Final Note</h3>
            <div className="space-y-4 text-gray-600 text-sm md:text-base text-center max-w-2xl mx-auto">
              <p>If you are a traveller, this page explains why you can trust the advice you receive.</p>
              <p>If you are an expert, this page explains the standard you are expected to uphold.</p>
              <p>If you are an industry stakeholder, this page explains why Xmytravel exists.</p>
              <p className="text-lg font-bold text-[#36013F] pt-4">This is the Xmytravel standard. We do not dilute it.</p>
            </div>
          </footer>
        </div>
      </main>
      <Footer />
    </>
  );
}
