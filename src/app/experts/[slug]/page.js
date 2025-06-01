
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const db = getFirestore(app);
  const querySnapshot = await getDocs(collection(db, "Profiles"));
  const paths = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.username) {
      paths.push({ slug: data.username });
    }
  });
  return paths;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const db = getFirestore(app);
  const q = query(collection(db, "Profiles"), where("username", "==", slug));
  const querySnapshot = await getDocs(q);
  let profile = null;
  querySnapshot.forEach((doc) => {
    profile = { ...doc.data(), id: doc.id };
  });

  if (!profile) {
    return {
      title: "Profile Not Found | Travel Expert",
      description: "The requested travel expert profile could not be found.",
    };
  }

  const metaTitle = `${profile.fullName} - ${profile.tagline}`;
  const metaDescription = `${profile.about}`;
  const metaImage = `${profile.photo}`;

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: `${profile.fullName}'s Profile Image`,
        },
      ],
      url: `https://lttx.vercel.app/experts/${slug}`,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      site: "@Xmytravel",
      creator: `@${slug}`,
    },
  };
}

export default async function ProfilePage({ params }) {
  const { slug } = await params;
  const db = getFirestore(app);
  const q = query(collection(db, "Profiles"), where("username", "==", slug));
  const querySnapshot = await getDocs(q);

  let profile = null;
  querySnapshot.forEach((doc) => {
    profile = { ...doc.data(), id: doc.id };
  });

  if (!profile) {
    return <div className="p-10 text-center text-xl">Profile not found.</div>;
  }

  const metaTitle = `${profile.fullName} - ${profile.tagline}`;
  const metaDescription = `${profile.about}`;
  const metaImage = `${profile.photo}`;

  // Function to parse date strings (e.g., "2023-01" to Date)
  const parseDate = (dateString) => {
    if (!dateString || typeof dateString !== "string") return null;
    const [year, month] = dateString.split("-").map(Number);
    if (!year || !month) return null;
    return new Date(year, month - 1); // Month is 0-based in JavaScript
  };

  // Function to format date to "MMM YYYY" (e.g., "Jan 2025")
  const formatDate = (dateString) => {
    if (dateString === "Present") return "Present";
    const date = parseDate(dateString);
    if (!date) return "";
    return date.toLocaleString("en-US", { month: "short", year: "numeric" }).replace(" ", " ");
  };

  // Function to calculate duration in "X years Y months" or "X months" format
  const calculateDuration = (startDateStr, endDateStr) => {
    const startDate = parseDate(startDateStr);
    const endDate = endDateStr === "Present" ? new Date() : parseDate(endDateStr);

    if (!startDate || !endDate || startDate > endDate) return "";

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (endDate.getDate() < startDate.getDate()) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    }

    const totalMonths = years * 12 + months;

    if (totalMonths < 12) {
      return totalMonths > 0
        ? `${totalMonths} ${totalMonths === 1 ? "month" : "months"}`
        : "Less than a month";
    }

    const parts = [];
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? "year" : "years"}`);
    }
    if (months > 0) {
      parts.push(`${months} ${months === 1 ? "month" : "months"}`);
    }

    return parts.length > 0 ? parts.join(" ") : "Less than a month";
  };

  // Sort experiences by startDate (latest first) and add formatted dates and duration
  const sortedExperience = profile.experience
    ?.map((exp) => ({
      ...exp,
      startDateParsed: parseDate(exp.startDate),
      startDateFormatted: formatDate(exp.startDate),
      endDateFormatted: formatDate(exp.endDate),
      duration: calculateDuration(exp.startDate, exp.endDate),
    }))
    .filter((exp) => exp.startDateParsed) // Exclude invalid dates
    .sort((a, b) => b.startDateParsed - a.startDateParsed) // Latest first
    .map(({ startDateParsed, ...exp }) => exp); // Remove temporary parsed date

  return (
    <div className="text-gray-800">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`https://lttx.vercel.app/experts/${slug}`} />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />
        <meta name="twitter:site" content="@Xmytravel" />
        <meta name="twitter:creator" content={`@${slug}`} />
      </Head>
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-[#36013F] rounded-3xl shadow-lg p-6 text-center sticky top-8 relative">
            <div className="mb-4">
              <div className="flex justify-center lg:justify-end">
                <div className="border border-[#F4D35E] rounded-lg p-2 mb-2 lg:mb-0">
                  <Image
                    src="https://lttx.vercel.app/logolttx.svg"
                    alt="LTTX Logo"
                    width={24}
                    height={24}
                    className="h-6 w-auto"
                  />
                </div>
              </div>
              <Image
                src={profile.photo || "/default.jpg"}
                alt={profile.fullName}
                width={112}
                height={112}
                className="w-28 h-28 rounded-full border-4 border-[#F4D35E] object-cover mx-auto shadow-md"
              />
            </div>
            <p className="text-sm mt-1 text-white">@{profile.username}</p>
            <h1
              className="text-xl font-semibold text-white"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              {profile.fullName}
            </h1>
            {profile.title && (
              <p className="text-sm mt-1 text-white">{profile.title}</p>
            )}
            {profile.tagline && (
              <p className="text-sm mt-1 text-white">{profile.tagline}</p>
            )}
            <span className="inline-flex items-center gap-1 bg-[#F4D35E] text-black text-xs font-medium px-3 py-1 mt-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                  clipRule="evenodd"
                />
              </svg>
              Verified by Xmytravel
            </span>
            <div className="mt-4 text-sm text-left space-y-2 text-white">
              {profile.location && (
                <p className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
                  >
                    <path
                      fillRule="evenodd"
                      d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {profile.location}
                </p>
              )}
              {profile.languages && (
                <p className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 1.357L14.25 7.5l.165.33a.809.809 0 0 1-1.086 1.085l-.604-.302a1.125 1.125 0 0 0-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 0 1-2.288 4.04l-.723.724a1.125 1.125 0 0 1-1.298.21l-.153-.076a1.125 1.125 0 0 1-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 0 1-.21-1.298L9.75 12l-1.64-1.64a6 6 0 0 1-1.676-3.257l-.172-1.03Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Languages: {profile.languages}
                </p>
              )}
              {profile.responseTime && (
                <p className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {profile.responseTime}
                </p>
              )}
              {profile.pricing && (
                <p className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-[#F4D35E] border border-[#F4D35E] rounded-[50%]"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 7.5A.75.75 0 0 0 9 9h1.5c.98 0 1.813.626 2.122 1.5H9A.75.75 0 0 0 9 12h3.622a2.251 2.251 0 0 1-2.122 1.5H9a.75.75 0 0 0-.53 1.28l3 3a.75.75 0 1 0 1.06-1.06L10.8 14.988A3.752 3.752 0 0 0 14.175 12H15a.75.75 0 0 0 0-1.5h-.825A3.733 3.733 0 0 0 13.5 9H15a.75.75 0 0 0 0-1.5H9Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {profile.pricing}
                </p>
              )}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-2 space-y-4">
          {profile.about && (
            <details
              open
              className="group bg-white rounded-2xl shadow border border-[#F4D35E30] overflow-hidden"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors duration-200 hover:bg-gray-50">
                <h2
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                  className="text-lg font-semibold text-[#36013F]"
                >
                  About Me
                </h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5 text-[#36013F] transition-transform duration-300 group-open:rotate-180"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed">
                {profile.about}
              </div>
            </details>
          )}

          {profile.services?.length > 0 && (
            <details
              className="group bg-white rounded-2xl shadow border border-[#F4D35E30] overflow-hidden"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors duration-200 hover:bg-gray-50">
                <h2
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                  className="text-lg font-semibold text-[#36013F]"
                >
                  What I Can Help You With
                </h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5 text-[#36013F] transition-transform duration-300 group-open:rotate-180"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed">
                <ul className="list-disc list-inside space-y-1">
                  {profile.services.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </details>
          )}

          {sortedExperience?.length > 0 && (
            <details
              className="group bg-white rounded-2xl shadow border border-[#F4D35E30] overflow-hidden"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors duration-200 hover:bg-gray-50">
                <h2
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                  className="text-lg font-semibold text-[#36013F]"
                >
                  Experience
                </h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5 text-[#36013F] transition-transform duration-300 group-open:rotate-180"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed">
                <ul className="list-disc list-inside space-y-2">
                  {sortedExperience.map((exp, i) => (
                    <li key={i}>
                      {exp.title} at {exp.company} <strong>| {exp.startDateFormatted} - {exp.endDateFormatted}
                     <span className="text-gray-400"> {exp.duration && `, ${exp.duration}`}</span></strong>
                    </li>
                    
                  ))}
                </ul>
              </div>
            </details>
          )}

          {profile.regions?.length > 0 && (
            <details
              className="group bg-white rounded-2xl shadow border border-[#F4D35E30] overflow-hidden"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors duration-200 hover:bg-gray-50">
                <h2
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                  className="text-lg font-semibold text-[#36013F]"
                >
                  Regions I Specialize In
                </h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5 text-[#36013F] transition-transform duration-300 group-open:rotate-180"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed">
                {profile.regions.join(", ")}
              </div>
            </details>
          )}

          <details
            className="group bg-[#FFF9E0] border-l-4 border-[#F4D35E] rounded-2xl shadow overflow-hidden"
          >
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors duration-200">
              <h2
                style={{ fontFamily: "'DM Serif Display', serif" }}
                className="text-lg font-semibold text-[#36013F]"
              >
                Ask Me a Free Question
              </h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5 text-[#36013F] transition-transform duration-300 group-open:rotate-180"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed">
              One quick doubt before booking?
              <br />
              <a
                href="#"
                className="underline text-[#36013F] hover:text-black transition-all"
              >
                Ask your first question here →
              </a>
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}