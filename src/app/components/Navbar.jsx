"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi"; // Importing icons
import Button from "./Button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // Toggle Menu
  const toggleMenu = () => setIsOpen(!isOpen);

  // Sticky Navbar on Scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 px-8 flex justify-between items-center mt-3 transition-all duration-300 rounded-[40px] h-[84px] ${
        isSticky ? "bg-primary shadow-lg py-3" : "bg-primary py-4"
      }`}
      style={{ maxWidth: "100vw", boxSizing: "border-box" }}
    >
      {/* Logo */}
      <div className="text-4xl font-bold text-white">LTT<span className="text-green-500">X</span></div>

      {/* Desktop Menu */}
      <div className="hidden md:flex space-x-6 text-white text-xl">
        <Link href="/" className="hover:underline">Home</Link>
        <Link href="/why-lttx" className="hover:underline">Why LTTX</Link>
        <Link href="/eligibility" className="hover:underline">Eligibility</Link>
        <Link href="/joining-process" className="hover:underline">Joining Process</Link>
        <Link href="/aoetc" className="hover:underline">AOETC</Link>
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
        <Link href="/why-lttx" className="text-2xl hover:underline" onClick={toggleMenu}>Why LTTX</Link>
        <Link href="/eligibility" className="text-2xl hover:underline" onClick={toggleMenu}>Eligibility</Link>
        <Link href="/joining-process" className="text-2xl hover:underline" onClick={toggleMenu}>Joining Process</Link>
        <Link href="/aoetc" className="text-2xl hover:underline" onClick={toggleMenu}>AOETC</Link>
        <Button btn="Apply Now" />
      </div>
    </nav>
  );
};

export default Navbar;