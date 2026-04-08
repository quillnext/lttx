// src/app/expert-login/layout.js

export const metadata = {
  title: "Expert Login | Manage Your Profile on Xmytravel",
  description: "Travel experts can login to their Xmytravel dashboard to manage inquiries, update their profile, and connect with travellers.",
  robots: {
    index: false, // Login pages are usually not indexed to keep search results clean
    follow: false,
  },
};

export default function ExpertLoginLayout({ children }) {
  return <>{children}</>;
}
