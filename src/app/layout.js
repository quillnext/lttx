import { Raleway } from "next/font/google";
import "./globals.css";

import Footer from "./pages/Footer";
import Navbar from "./components/Navbar";


const ralewaySans = Raleway({
  variable: "--font-ralewaySans-sans",
  subsets: ["latin"],
});


export const metadata = {
  title: "LTTX",
  description: "We turn every trip into an unforgettable experience.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
       <head>
        <link rel="icon" href="/LTTX.svg" sizes="any" />
        <link rel="icon" href="/LTTX.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${ralewaySans.variable}  antialiased  `}
      > 
     
<div className="px-2">
<Navbar/>
    
    {children}
</div>
        <Footer/>
      </body>

    </html>
  );
}
