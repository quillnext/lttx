import Image from 'next/image';
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
      <div className="container mx-auto px-16 lg:px-32 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Left Section */}
          <div className="text-center">
           
               <Image
                                  src='/logolttx.svg'
                                   width={100}
                                   height={100}
                                   alt="Let’s Talk Travel"
                                   className='w-100'
                                    
                                  />
          
            <div className="flex justify-center  gap-4 mt-5">
              <a href="/" target="_blank" rel="noopener noreferrer">
                <FaFacebookF className="text-white hover:text-green-500" size={20} />
              </a>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <FaInstagram className="text-white hover:text-green-500" size={20} />
              </a>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <FaTwitter className="text-white hover:text-green-500" size={20} />
              </a>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <FaLinkedinIn className="text-white hover:text-green-500" size={20} />
              </a>
            </div>
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

          {/* Right Section */}
          <div className="text-start flex flex-col items-start">

            <Image src='/plant.svg' width={32} height={32} alt='paant' className='w-40 h-20 ' />
            <p className="mb-4">
            
              <span className="text-sm">
                Let’s Travel is backed by Planit Holidays
              </span>
            </p>

        
          <div className="text-start flex flex-col items-start mt-5">
          <Image
           src='/letstalk.svg'
            width={32}
            height={32}
            alt="Let’s Talk Travel"
            className='w-20 h-20'
             
           />
           
             
           
              <p className="text-sm">
                
                We turn every trip into an unforgettable experience.
              </p>
            </div>
          
          </div>
        </div>

        {/*  Copyright */}
        <div className="text-center mt-8">
          <p className="text-sm">Copyright ©2025 LTTX</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;