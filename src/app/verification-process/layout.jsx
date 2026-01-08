import React from "react";

export const metadata = {
  title: "The Xmytravel Trust Framework | Verified Travel Expertise",
  description: "Discover how Xmytravel verifies travel experts through a multi-layered manual process. Learn about our standards for accountability, integrity, and traveller protection.",
  openGraph: {
    title: "The Xmytravel Trust Framework | Verified Travel Expertise",
    description: "Learn how we maintain quality and trust by manually verifying every travel expert on our platform. No bots, no influencers—only verified professionals.",
    url: "https://www.xmytravel.com/verification-process",
    siteName: "Xmytravel",
    images: [
      {
        url: "https://www.xmytravel.com/emailbanner.jpeg",
        width: 1200,
        height: 630,
        alt: "Xmytravel Trust Framework",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Xmytravel Trust Framework",
    description: "Our operating doctrine for accountability and verified expertise in the travel industry.",
    images: ["https://www.xmytravel.com/emailbanner.jpeg"],
  },
};

export default function TrustFrameworkLayout({ children }) {
  return <>{children}</>;
}
