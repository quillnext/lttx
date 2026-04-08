// src/app/news-and-media/layout.js

export const metadata = {
  title: "News & Media | Xmytravel",
  description: "Stay updated with latest news, features, and expert interviews from Xmytravel.",
  openGraph: {
    title: "News & Media | Xmytravel",
    description: "Latest press and media coverage for Xmytravel travel ecosystem.",
    url: "https://www.xmytravel.com/news-and-media",
    type: "article",
  },
};

export default function NewsMediaLayout({ children }) {
  return <>{children}</>;
}
