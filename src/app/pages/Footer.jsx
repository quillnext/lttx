'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer
      className="bg-primary text-white bg-cover bg-center rounded-t-[40px] mt-16 shadow-2xl"
      style={{
        backgroundImage: "url('/footer.png')",
      }}
    >
      <div className="container mx-auto px-6 lg:px-14 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10 border-b border-white/10 pb-10">
          {/* Left Section: Branding & Contact */}
          <div className="flex flex-col gap-6 max-w-xs">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Image
                src="/logolttx.svg"
                width={130}
                height={50}
                alt="Let’s Talk Travel"
                className="h-auto w-auto"
              />
            </Link>
            <div className="space-y-1 text-center md:text-left">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">Get in touch</p>
              <a
                href="mailto:Info@xmytravel.com"
                className="text-base font-semibold hover:text-secondary animation-all duration-300 block"
              >
                Info@xmytravel.com
              </a>
            </div>
          </div>

          {/* Right Section: Navigation Grid */}
          <nav className="flex flex-wrap gap-x-8 gap-y-4 justify-center md:justify-end flex-1 max-w-2xl">
            {[
              { label: 'Home', href: '/' },
              { label: 'About', href: '/about/#about' },
              { label: 'Why us', href: '/about/#why-us' },
              { label: 'Features', href: '/about/#features' },
              { label: 'Joining Process', href: '/about/#joining-process' },
              { label: 'News and Media', href: '/news-and-media' },
              { label: 'Verification Process', href: '/verification-process' },
              { label: 'Aaq', href: '/aaq' },
              { label: 'Ask an Expert', href: '/ask-an-expert' },
              { label: 'Privacy Policy', href: '/privacy-policy' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors relative group py-1"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Section: Legal & Secondary Brand */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">

            <div className="h-4 w-px bg-white/10 hidden md:block"></div>
            <p className="text-xs md:text-sm text-white/40 tracking-wide">
              Copyright ©2025 Xmytravel.com
              <span className="mx-2">|</span>
              <Link href="/privacy-policy" className="hover:text-white transition-colors underline underline-offset-4 decoration-white/20">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Optional: Add smooth scroll to top or social icons if they appear later */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

// import Image from 'next/image';
// import React from 'react';
// import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
// import Link from 'next/link';

// const Footer = () => {
//   return (
//     <footer
//       className="bg-primary text-white bg-cover bg-center rounded-t-[40px] mt-20"
//       style={{
//         backgroundImage: "url('/footer.png')",
//       }}
//     >
//       <div className="container mx-auto px-12 lg:px-14 py-12">
//         <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
//           {/* Left Section */}
//           <div className="text-center">
//             <Image
//               src="/logolttx.svg"
//               width={100}
//               height={100}
//               alt="Let’s Talk Travel"
//               className="w-100"
//             />
//           </div>

//           {/* Center Section */}
//           <div className="text-start">
//             {/* Navigation Links */}
//             <div className="hidden md:flex space-x-6 text-white text-xl mb-4">
//               <Link href="/" className="hover:underline">
//                 Home
//               </Link>
//               <Link href="/#about" className="hover:underline">
//                 About
//               </Link>
//               <Link href="/#why-us" className="hover:underline">
//                 Why us
//               </Link>
//               <Link href="/#features" className="hover:underline">
//                 Features
//               </Link>
//               <Link href="/#joining-process" className="hover:underline">
//                 Joining Process
//               </Link>
//             </div>
//             {/* Contact Information */}
//             <p className="mb-2">
//               <span className="font-semibold text-md">E-mail</span>
//               <br />
//               Info@xmytravel.com
//             </p>
//             <p>
//               <span className="font-semibold text-md">Location</span>
//               <br />
//               220-221, The Galleria Mall Mayur Vihar
//               <br />
//               Phase 1 Extension New Delhi - 110091
//             </p>
//           </div>
//         </div>

//         {/* Copyright */}
//         <div className="text-center mt-8">
//           <p className="text-sm">
//             Copyright ©2025 Xmytravel.com |{' '}
//             <span>
//               <Link href="/privacy-policy" className="hover:underline">
//                 Privacy Policy
//               </Link>
//             </span>
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;