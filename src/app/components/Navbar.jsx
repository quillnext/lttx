"use client";
import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi";
import Button from "./Button";
import Image from "next/image";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="fixed top-3 left-0 w-full z-50">
      <nav
        className={`flex justify-between items-center rounded-[40px] h-[84px] px-4 md:px-8 bg-primary shadow-lg transition-all duration-300`}
        style={{
          width: "calc(100% - 8px)",
          boxSizing: "border-box",
          margin: "0 auto",
          position: "relative",
          left: "2px",
        }}
      >
        {/* Add 2px visual spacing on left/right */}
        <style jsx>{`
          nav::before,
          nav::after {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            width: 2px;
            background: transparent;
            z-index: 40;
          }
          nav::before {
            left: -2px;
          }
          nav::after {
            right: -2px;
          }
        `}</style>

        {/* Logo */}
        <div className="text-4xl font-bold text-white">
          <Image
                    src='/logolttx.svg'
                     width={100}
                     height={32}
                     alt="Let’s Talk Travel"
                     className='w-50 h-20'
                      
                    />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 text-white text-xl">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="#why-Xmytravel" className="hover:underline">Why Xmytravel</Link>
          <Link href="#eligibility" className="hover:underline">Eligibility</Link>
          <Link href="#joining-process" className="hover:underline">Joining Process</Link>
          {/* <Link href="#aoetc" className="hover:underline">ASSOTEC</Link> */}
        </div>

        {/* Button (Desktop) */}
        <div className="hidden md:block">
          <Button btn="Apply Now" />
        </div>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden text-white text-2xl">
          {isOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 left-0 w-full h-full bg-primary text-white flex flex-col items-center justify-center space-y-6 transition-transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button onClick={toggleMenu} className="absolute top-6 right-6 text-3xl">
            <FiX />
          </button>
          <Link href="/" className="text-2xl hover:underline" onClick={toggleMenu}>Home</Link>
          <Link href="#why-Xmytravel" className="text-2xl hover:underline" onClick={toggleMenu}>Why Xmytravel</Link>
          <Link href="#eligibility" className="text-2xl hover:underline" onClick={toggleMenu}>Eligibility</Link>
          <Link href="#joining-process" className="text-2xl hover:underline" onClick={toggleMenu}>Joining Process</Link>
          {/* <Link href="#aoetc" className="text-2xl hover:underline" onClick={toggleMenu}>ASSOTEC</Link> */}
          <Button btn="Apply Now" />
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
