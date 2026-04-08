// src/app/about/layout.js

export const metadata = {
  title: "About Us | Xmytravel",
  description: "Learn how Xmytravel is redefining travel by connecting you with verified experts for a trust-driven travel ecosystem.",
  openGraph: {
    title: "About Us | Xmytravel",
    description: "Discover the vision behind India's most trusted travel expert network.",
    url: "https://www.xmytravel.com/about",
    type: "website",
  },
};

export default function AboutLayout({ children }) {
  return <>{children}</>;
}
