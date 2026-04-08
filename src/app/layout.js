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


import JsonLd from "@/app/components/JsonLd";

export const metadata = {
  metadataBase: new URL("https://www.xmytravel.com"),
  title: {
    default: "Xmytravel — Book Verified Travel Experts for Visa, Flights & Holidays",
    template: "%s | Xmytravel",
  },
  description: "Connect with verified travel experts in India for visa consultation, flight bookings, and personalized tour packages. Xmytravel ensures trust and expert advice for every trip.",
  keywords: ["travel experts India", "verified travel agents", "visa assistance", "flight booking experts", "personalized travel planning", "Xmytravel"],
  authors: [{ name: "Xmytravel Team" }],
  publisher: "Xmytravel",
  icons: {
    icon: "/favicon.svg",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Xmytravel — India's Top Network of Verified Travel Experts",
    description: "Get expert travel consultation from verified professionals across flights, visas, hotels, holidays, and more. Join Xmytravel, India’s trusted travel hub.",
    url: "https://www.xmytravel.com",
    siteName: "Xmytravel",
    images: [
      {
        url: "/logolttx.svg", // Or a dedicated social banner
        width: 1200,
        height: 630,
        alt: "Xmytravel Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xmytravel — India's Top Network of Verified Travel Experts",
    description: "Connect with verified travel experts for visa, flights, and itineraries.",
    images: ["/logolttx.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Xmytravel",
  "url": "https://www.xmytravel.com",
  "logo": "https://www.xmytravel.com/logolttx.svg",
  "description": "India's Top Network of Verified Travel Experts",
  "email": "Info@xmytravel.com",
  "sameAs": [
    "https://www.instagram.com/x.mytravel/",
    "https://in.linkedin.com/company/xmytravel"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-9811944600",
    "contactType": "customer service",
    "areaServed": "IN",
    "availableLanguage": "en",
    "contactOption": "HearingImpairedSupported" // Used to hint text/WA priority
  }
};

export default function RootLayout({ children }) {
  return (
    // Apply all font variables to the html tag
    <html lang="en" className={`${ralewaySans.variable} ${dmSerifDisplay.variable} ${inter.variable}`}>
      <body
        className={`antialiased`} // Remove ralewaySans.variable from here as it's already on <html> if you want it site-wide, or apply specific font classes via Tailwind
      >
        <GTMHead/>
        <ClarityScript/>
        <JsonLd schema={organizationSchema} />

        {/* <Navbar/> */}
        <GTMNoScript/>

        {children}
        {/* <Footer/> */}
      </body>

    </html>
  );
}