// src/app/aaq/layout.js

export const metadata = {
  title: "Already Answered Questions (AAQ) | Travel Expert Insights",
  description: "Browse thousands of travel questions answered by verified experts. From visa tips to itinerary planning, get authoritative travel advice.",
  openGraph: {
    title: "Already Answered Questions (AAQ) | Xmytravel",
    description: "Search and explore verified travel answers from our community of experts.",
    url: "https://www.xmytravel.com/aaq",
    type: "website",
  },
};

export default function AAQLayout({ children }) {
  return <>{children}</>;
}
