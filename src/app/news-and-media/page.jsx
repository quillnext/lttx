"use client";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../pages/Footer";

export default function BlogPage() {
  const articles = [
    {
      date: "16 Sept 2025",
      title:
        "XmyTravel: Redefining Trust, Creating Jobs & Building New Travel Ecosystem",
      description:
        "In an era where travellers are flooded with online content, anonymous advice, and AI-generated itineraries, trust has become the missing link in the travel ecosystem.....",
      url: "https://travtalkindia.com/xmytravel-redefining-trust-creating-jobs-building-new-travel-ecosystem/",
    },
    {
      date: "13 Sept 2025",
      title:
        "XmyTravel: Why Human Expertise Matters More Than Ever in an Age of Travel Misinformation",
      description:
        "In an age where algorithms, AI tools, and online marketplaces dominate the travel landscape, one truth remains constant: travellers need accountability, expertise....",
      url: "https://traveltradejournal.com/xmytravel-why-human-expertise-matters-more-than-ever-in-an-age-of-travel-misinformation/",
    },
  ];

  const reels = [
    { code: "DOYke2FCWIV" },
    { code: "DPEI9nBCXje" },
    { code: "DQMiBh5Djbb" },
    { code: "DQelYJoCc1B" },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const scrollToIndex = (index) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.children[0].offsetWidth + 16;
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
    setActiveIndex(index);
  };

  const next = () =>
    scrollToIndex((activeIndex + 1) % reels.length);
  const prev = () =>
    scrollToIndex((activeIndex - 1 + reels.length) % reels.length);

  useEffect(() => {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => {
      window.instgrm?.Embeds.process();
    };
    document.body.appendChild(script);
  }, []);

 
  useEffect(() => {
    window.instgrm?.Embeds.process();
  }, [activeIndex]);

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-24">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#36013f] mb-4 ">
            News & Media
          </h1>
          <p className="text-sm md:text-lg text-[#36013f] max-w-3xl mx-auto">
            Stay updated with the latest coverage, interviews, and features
            about XmyTravel.
          </p>
        </div>

        {/* ARTICLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {articles.map((article, i) => (
            <article
              key={i}
              className=" rounded-3xl shadow-xl p-8 flex flex-col justify-between bg-secondary"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FaCalendarAlt />
                  <span>{article.date}</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  {article.title}
                </h3>
                <p className="text-gray-700 mb-6">
                  {article.description}
                </p>
              </div>

              <Link
                href={article.url}
                target="_blank"
                className="inline-flex items-center gap-2 bg-[#36013f] text-white px-5 py-2 rounded-full w-fit"
              >
                Read Full Article <FaExternalLinkAlt />
              </Link>
            </article>
          ))}
        </div>

       
        <section>
          <h2 className="text-3xl font-bold text-center text-[#36013f] mb-12">
            Watch & Learn from XmyTravel
          </h2>

        
          <div className="md:hidden relative -mb-28">
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-2"
            >
              {reels.map((reel, i) => (
                <div
                  key={i}
                  className="min-w-[100%] h-[500px] snap-start bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                  <blockquote
                    className="instagram-media w-full h-full"
                    data-instgrm-permalink={`https://www.instagram.com/reel/${reel.code}/`}
                    data-instgrm-version="14"
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              ))}
            </div>

            {/* ARROWS */}
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-12 h-12 rounded-full flex items-center justify-center"
            >
              <FaArrowLeft />
            </button>

            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-12 h-12 rounded-full flex items-center justify-center"
            >
              <FaArrowRight />
            </button>

            {/* DOTS */}
            <div className="flex justify-center gap-3 mt-6">
              {reels.map((_, i) => (
                <div
                  key={i}
                  onClick={() => scrollToIndex(i)}
                  className={`w-3 h-3 rounded-full cursor-pointer ${
                    activeIndex === i
                      ? "bg-[#36013f] scale-125"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

        
        {/* DESKTOP */}
<div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
  {reels.map((reel, i) => (
    <div
      key={i}
      className="bg-white rounded-2xl shadow-xl overflow-visible"
    >
      {/* Aspect-ratio wrapper */}
      <div className="relative w-full aspect-[9/16]">
        <blockquote
          className="instagram-media absolute inset-0"
          data-instgrm-permalink={`https://www.instagram.com/reel/${reel.code}/`}
          data-instgrm-version="14"
          style={{
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
          }}
        />
      </div>
    </div>
  ))}
</div>

        </section>
      </main>

      <Footer />
    </>
  );
}
