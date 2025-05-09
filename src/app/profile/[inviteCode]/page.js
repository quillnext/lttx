"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { use, useState, useEffect } from "react";

export default function ExpertProfile({ params }) {
  // Unwrap params using React.use()
  const { inviteCode } = use(params);

  // State to manage user data, loading, and error states
  const [userResponse, setUserResponse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount or when inviteCode changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await fetchUserData(inviteCode);
      setUserResponse(data);
      setLoading(false);
    };

    fetchData();
  }, [inviteCode]); // Re-run only if inviteCode changes

  // Handle loading and error states
  if (loading) {
    return <div className="text-center py-8 text-primary">Loading...</div>;
  }

  if (!userResponse || !userResponse.success) {
    return <div className="text-center py-8 text-primary">User not found</div>;
  }

  const user = userResponse.userData;

  return (
    <div className="min-h-screen py-6 px-4 md:px-16 lg:px-32">
      {/* Header Section */}
      <div className="flex justify-center items-center mb-6">
        <Image
          src="/logolttx.svg" // Replace with actual logo path
          width={120}
          height={40}
          alt="xmytravel"
          className="w-32 h-12 sm:w-40 sm:h-12 bg-primary rounded-full p-2"
          priority={true}
        />
      </div>

      {/* Main Container */}
      <div className=" mx-auto bg-white  rounded-3xl p-6 sm:p-8">
        {/* Profile Picture and Basic Info */}
        <div className="flex flex-col lg:flex-row-reverse items-center lg:items-start gap-6 lg:gap-12 justify-between">
  {/* Profile Image */}
  <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full bg-gray-200 flex items-center justify-center">
    {user.profilePicture ? (
      <Image
        src={userResponse.profilePictureUrl || user.profilePicture}
        alt="Profile Picture"
        width={192} 
        height={192}
        className="rounded-full w-full h-full object-cover"
      />
    ) : (
      <span className="text-4xl sm:text-5xl text-gray-500">👤</span>
    )}
  </div>

  {/* User Info */}
  <div className="text-center lg:text-left">
    <h1 className="text-2xl sm:text-2xl font-bold text-primary mb-1 capitalize">
      {user.fullName}
    </h1>
    <span className="text-white bg-secondary rounded-full px-2">Gold</span>
    <p className="text-sm sm:text-base text-primary mb-1">{user.tagline}</p>
    <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-4 justify-center lg:justify-start">
  <span className="flex flex-col text-center lg:text-left">
    <span>{user.designation}</span>
    <span>{user.organization}</span>
  </span>
  <span className="text-black-400">|</span>
  <span className="flex flex-col text-center lg:text-left">
    <span>{user.city}</span>
    <span>{user.country}</span>
  </span>
</p>


    {/* Years of Experience and Social Links */}
    <div className="flex flex-row  sm:items-center gap-3 mt-4">
      <div className="bg-secondary text-primary px-4 py-2 rounded-2xl text-lg font-bold sm:text-base w-max mx-auto sm:mx-0">
        <span className="text-2xl sm:text-3xl font-bold">{user.yearsOfExperience}+ </span>
        <span className="text-xs sm:text-sm text-primary"> Years</span>
      </div>
      <div className="flex justify-center items-center space-x-3 border border-primary rounded-2xl p-2">
        <a href={user.linkedin || "#"} target="_blank" rel="noopener noreferrer">
          <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 text-primary hover:text-primary" />
        </a>
        <a href={user.facebook || "#"} target="_blank" rel="noopener noreferrer">
          <Facebook className="w-5 h-5 sm:w-6 sm:h-6 text-primary hover:text-primary" />
        </a>
        <a href={user.instagram || "#"} target="_blank" rel="noopener noreferrer">
          <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-primary hover:text-primary" />
        </a>
        <a href={user.twitter || "#"} target="_blank" rel="noopener noreferrer">
          <Twitter className="w-5 h-5 sm:w-6 sm:h-6 text-primary hover:text-primary" />
        </a>
      </div>
    </div>
  </div>
</div>

        {/* Expertise Section */}
        <div className="mt-8">
          <h2 className="text-lg sm:text-xl font-semibold text-primary">Expertise In</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {user.typeOfTravel.map((expertise, index) => (
              <button
                key={index}
                className="text-textcolor  px-3 py-1 rounded-full text-xs sm:text-sm shadow-lg "
              >
                {expertise}
              </button>
            ))}
          </div>
        </div>

        {/* Languages Section */}
        <div className="mt-8">
          <h2 className="text-lg sm:text-xl font-semibold text-primary">Languages</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {user.language.map((lang, index) => (
              <button
                key={index}
                className="text-textcolor  px-3 py-1 rounded-full text-xs sm:text-sm shadow-lg "
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* About Me Section */}
        <div className="mt-8">
          <h2 className="text-lg sm:text-xl font-semibold text-primary">About me</h2>
          <p className="text-sm sm:text-base text-black mt-2">{user.about}</p>
        </div>

        {/* Gallery Section with Swiper */}
        <div className="mt-8">
          <h2 className="text-lg sm:text-xl font-semibold text-primary">Gallery</h2>
          {user.workSamples && user.workSamples.length > 0 ? (
          <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          breakpoints={{
            1024: {
              slidesPerView: 3,
            },
          }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="mt-3 custom-swiper"
        >
          {user.workSamples.map((sample, index) => (
            <SwiperSlide key={index}>
              <div className="w-full h-48 sm:h-64 mb-10">
                <Image
                  src={userResponse.workSampleUrls[index] || sample}
                  alt={`Gallery ${index + 1}`}
                  width={640}
                  height={160}
                  className="rounded-lg object-cover w-full h-full"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
          ) : (
            <p className="text-sm sm:text-base text-primary mt-2">
              No gallery images available.
            </p>
          )}
        </div>

        {/* Testimonials Section with Swiper */}
        <div className="mt-8 ">
          <h2 className="text-lg sm:text-xl font-semibold text-primary">Testimonials</h2>
          {user.testimonials && user.testimonials.length > 0 ? (
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={10}
              slidesPerView={1}
              breakpoints={{
                1024: {
                  slidesPerView: 3,
                },
              }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              className="mt-3 custom-swiper"
            >
              {user.testimonials.map((testimonial, index) => (
                <SwiperSlide key={index}>
                  <div className=" p-6 rounded-xl mb-10 shadow-lg ">
                    <p className="text-sm sm:text-base text-black">{testimonial}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="text-sm sm:text-base text-primary mt-2">
              No testimonials available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Fetch user data from API
async function fetchUserData(inviteCode) {
  try {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/profile?inviteCode=${encodeURIComponent(inviteCode)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { success: false, error: "Failed to fetch user data" };
  }
}