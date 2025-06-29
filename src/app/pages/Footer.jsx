'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer
      className="bg-primary text-white bg-cover bg-center rounded-t-[40px] mt-20"
      style={{
        backgroundImage: "url('/footer.png')",
      }}
    >
      <div className="container mx-auto px-12 lg:px-14 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
          {/* Left Section */}
          <div className="text-center">
           
               <Image
                                  src='/logolttx.svg'
                                   width={100}
                                   height={100}
                                   alt="Let’s Talk Travel"
                                   className='w-100'
                                    
                                  />
          
           
          </div>
          <div className="flex flex-col space-x-6 text-white text-md mb-4 gap-2 text-left">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/#about" className="hover:underline">
                About
              </Link>
              <Link href="/#why-us" className="hover:underline">
                Why us
              </Link>
              <Link href="/#features" className="hover:underline">
                Features
              </Link>
              <Link href="/#joining-process" className="hover:underline">
                Joining Process
              </Link>
              
            </div>

          

          {/* Center Section */}
          <div className="text-start">
            <p className="mb-2">
              <span className="font-semibold text-md">E-mail</span>
              <br />
              Info@xmytravel.com
            </p>
            <p>
              <span className="font-semibold text-md">Location</span>
              <br />
              220-221, The Galleria Mall Mayur Vihar
              <br />
              Phase 1 Extension New Delhi - 110091
            </p>
          </div>

      
        </div>

        {/*  Copyright */}
        <div className="text-center mt-8">
          <p className="text-sm">Copyright ©2025 Xmytravel.com | <span><a href='/privacy-policy'>Privacy Policy</a></span></p>
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