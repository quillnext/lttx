import { Raleway } from "next/font/google";
import "./globals.css";

import Footer from "./pages/Footer";
import Navbar from "./components/Navbar";


const ralewaySans = Raleway({
  variable: "--font-ralewaySans-sans",
  subsets: ["latin"],
});


export const metadata = {
  title: "Join the Invite-Only Network of Verified Travel Experts | Xmytravel.com",
  description: "Become part of an elite community dedicated to transforming travel consultancy.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
       <head>
        <link rel="icon" href="/favicon.svg" sizes="any" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${ralewaySans.variable}  antialiased  `}
      > 
     
<div className="px-2">
{/* <Navbar/> */}
    
    {children}
</div>
        {/* <Footer/> */}
      </body>

    </html>
  );
}
