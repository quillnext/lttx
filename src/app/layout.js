// src/app/layout.js
import { Raleway, DM_Serif_Display, Inter } from "next/font/google"; // Import all necessary fonts
import "./globals.css";

import Footer from "./pages/Footer"; // Assuming these are correctly resolved in your app structure
import Navbar from "./components/Navbar";
import GTMHead from "@/components/GTMHead";
import GTMNoScript from "@/components/GTMNoScript";
import ClarityScript from "@/components/ClarityScript";


const ralewaySans = Raleway({
  variable: "--font-ralewaySans-sans",
  subsets: ["latin"],
  display: 'swap', // Add display swap for better loading
});

const dmSerifDisplay = DM_Serif_Display({
  weight: '400', // You had this in your original <link> query. Ensure you specify the correct weight(s).
  subsets: ["latin"],
  variable: "--font-dm-serif-display",
  display: 'swap',
});

const inter = Inter({
  weight: ['400', '500', '600'], // Specify all weights you need from Inter
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});


export const metadata = {
  title: "Xmytravel — India's Top Network of Verified Travel Experts",
  description: "Get expert travel consultation from verified professionals across flights, visas, hotels, holidays, and more. Join Xmytravel, India’s trusted travel hub.",
};

export default function RootLayout({ children }) {
  return (
    // Apply all font variables to the html tag
    <html lang="en" className={`${ralewaySans.variable} ${dmSerifDisplay.variable} ${inter.variable}`}>
      <head>
        {/* Keep your favicon links here if you want them in the head */}
        <link rel="icon" href="/favicon.svg" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* REMOVE the direct Google Fonts <link> tags from here */}
        {/* <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" /> */}
        <GTMHead/>
        <ClarityScript/>
      </head>
      <body
        className={`antialiased`} // Remove ralewaySans.variable from here as it's already on <html> if you want it site-wide, or apply specific font classes via Tailwind
      >

        {/* <Navbar/> */}
        <GTMNoScript/>

        {children}
        {/* <Footer/> */}
      </body>

    </html>
  );
}