

"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaExternalLinkAlt, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../pages/Footer";

export default function BlogPage() {
  const articles = [
    {
      date: "16 Sept 2025",
      source: "TravTalk India",
      title: "XmyTravel: Redefining Trust, Creating Jobs & Building New Travel Ecosystem",
      description: "In an era where travellers are flooded with online content, anonymous advice, and AI-generated itineraries, trust has become the missing link in the travel ecosystem. Rishabh Vyas, Founder, Xmytravel, observed this gap while running his travel management company .... ",
      url: "https://travtalkindia.com/xmytravel-redefining-trust-creating-jobs-building-new-travel-ecosystem/",
      hours: "Monday to Sunday<br />9 AM — 9 PM",
      imageUrl: "/rishab.jpeg", // Image from public folder
    },
    {
      date: "13 Sept 2025",
      source: "Travel Trade Journal (TTJ)",
      title: "XmyTravel: Why Human Expertise Matters More Than Ever in an Age of Travel Misinformation XmyTravel: Why Human Expertise Matters More Than Ever in an Age of Travel Misinformation",
      description: "In an age where algorithms, AI tools, and online marketplaces dominate the travel landscape, one truth remains constant: travellers need accountability, expertise, and trust. Rishabh Vyas, Founder of Xmytravel, believes that the growing reliance on half-verified online .... ",
      url: "https://traveltradejournal.com/xmytravel-why-human-expertise-matters-more-than-ever-in-an-age-of-travel-misinformation/",
      hours: "Monday to Sunday<br />9 AM — 9 PM",
      imageUrl: "https://traveltradejournal.com/wp-content/uploads/2025/09/Rishabh-Vyas-Founder-Xmytravel.jpg",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <style jsx global>{`
      
       
        .navigate-btn {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .navigate-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#36013f] mt-16 mb-4">
            News & Media
          </h1>
          <p className="text-lg text-[#36013f] max-w-3xl mx-auto">
            Stay updated with the latest coverage, interviews, and features about XmyTravel from leading travel industry publications.
          </p>
        </div>

        {/* Articles Grid - Horizontal scrolling on mobile, grid on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article, index) => (
            <article
              key={index}
              className="relative  md:w-full flex-shrink-0 snap-center rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300 md:h-[350px] bg-secondary"
             >
         
             
              <div className="absolute inset-0 card-overlay pointer-events-none" />

          
              <div className="relative h-full p-8 flex flex-col justify-between ">
               
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <FaCalendarAlt className="text-lg" />
                    <span className="font-medium">{article.date}</span>
                  </div>

                  <h3 className="text-2xl font-bold mb-3">{article.source}</h3>

                  <p
                    className="text-lg leading-relaxed mb-6 opacity-95"
                    dangerouslySetInnerHTML={{ __html: article.description }}
                  />
                </div>

             
                <div>
                  <Link
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-white font-semibold hover:gap-4 transition-all bg-primary rounded-4xl py-2 px-5"
                  >
                    Read Full Article
                    <FaExternalLinkAlt />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {articles.length < 6 && (
          <div className="text-center mt-12">
            <p className="text-[#36013f] text-lg">
              More articles coming soon...
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}