// src/app/complete-profile/layout.js

export const metadata = {
  title: "Complete Your Expert Profile | Xmytravel",
  description: "Join India's most trusted travel expert network. Verify your expertise, showcase your services, and connect with travellers.",
  robots: {
    index: false, // Onboarding pages should generally not be indexed
    follow: false,
  },
};

export default function CompleteProfileLayout({ children }) {
  return <>{children}</>;
}
