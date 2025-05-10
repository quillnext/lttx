import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import Image from "next/image";
import Head from "next/head";

export async function generateStaticParams() {
  const db = getFirestore(app);
  const querySnapshot = await getDocs(collection(db, "Profiles"));

  const slugs = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.fullName) {
      slugs.push({ slug: data.fullName.toLowerCase().replace(/\s+/g, '-') });
    }
  });

  return slugs;
}

export async function generateMetadata({ params }) {
  return {
    title: `${params.slug.replace(/-/g, ' ')} | Travel Expert`,
  };
}

export default async function ProfilePage({ params }) {
  const db = getFirestore(app);
  const querySnapshot = await getDocs(collection(db, "Profiles"));

  let profile = null;
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const slug = data.fullName?.toLowerCase().replace(/\s+/g, '-');
    if (slug === params.slug) {
      profile = data;
    }
  });

  if (!profile) {
    return <div className="p-10 text-center text-xl">Profile not found.</div>;
  }

  return (

    <div className="bg-gray-100 text-gray-800 ">
     <Head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-[#36013F] rounded-3xl shadow-lg p-6 text-center sticky top-8 ">
            <div className="mb-4">
              <div className="flex justify-center lg:justify-end">
                <div className="border border-[#F4D35E] rounded-lg p-2 mb-2 lg:mb-0">
                  <Image src="https://lttx.vercel.app/logolttx.svg" alt="LTTX Logo" width={24} height={24} className="h-6 w-auto" />
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
            <h1 className="text-xl font-semibold text-white " style={{ fontFamily: `'DM Serif Display', serif` }}>{profile.fullName}</h1>
            {profile.tagline && <p className="text-sm mt-1 text-white">{profile.tagline}</p>}

            <span className="inline-flex items-center gap-1 bg-[#F4D35E] text-black text-xs font-medium px-3 py-1 mt-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
              </svg>
              Verified by Xmytravel
            </span>

            <div className="mt-4 text-sm text-left space-y-2 text-white">
              {profile.location && <p className="flex items-center gap-2">📍 {profile.location}</p>}
              {profile.languages && <p className="flex items-center gap-2">🗣️ Languages: {profile.languages}</p>}
              {profile.responseTime && <p className="flex items-center gap-2">⏱️ {profile.responseTime}</p>}
              {profile.pricing && <p className="flex items-center gap-2">💵 {profile.pricing}</p>}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-2 space-y-6">
          {profile.about && (
            <div className="bg-white rounded-3xl shadow-lg border border-[#F4D35E30] p-6">
              <h2 style={{ fontFamily: `'DM Serif Display', serif` }} className="text-xl font-semibold text-[#36013F] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#F4D35E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A4.992 4.992 0 015 16V9a7 7 0 1114 0v7a4.992 4.992 0 01-.121 1.804M15 21v-2a3 3 0 00-6 0v2" />
                </svg>
                About Me
              </h2>
              <p className="text-sm mt-2 text-gray-700 leading-relaxed">{profile.about}</p>
            </div>
          )}

          {profile.services?.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg border border-[#F4D35E30] p-6">
              <h2 style={{ fontFamily: `'DM Serif Display', serif` }} className="text-xl font-semibold text-[#36013F] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#F4D35E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                What I Can Help You With
              </h2>
              <ul className="list-disc list-inside text-sm mt-2 text-gray-700 leading-relaxed">
                {profile.services.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {(profile.experience?.length > 0 || profile.companies || profile.certifications) && (
            <div className="bg-white rounded-3xl shadow-lg border border-[#F4D35E30] p-6">
              <h2 style={{ fontFamily: `'DM Serif Display', serif` }} className="text-xl font-semibold text-[#36013F] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#F4D35E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 8H7a2 2 0 01-2-2V8a2 2 0 012-2h2V4a1 1 0 011-1h4a1 1 0 011 1v2h2a2 2 0 012 2v10a2 2 0 01-2 2z" />
                </svg>
                Experience & Credentials
              </h2>
              <ul className="list-disc list-inside text-sm mt-2 text-gray-700 leading-relaxed">
                {profile.experience?.map((e, i) => <li key={i}>{e}</li>)}
                {profile.companies && <li>Companies: {profile.companies}</li>}
                {profile.certifications && <li>Certifications: {profile.certifications}</li>}
              </ul>
            </div>
          )}

          {profile.regions?.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg border border-[#F4D35E30] p-6">
              <h2 style={{ fontFamily: `'DM Serif Display', serif` }} className="text-xl font-semibold text-[#36013F] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#F4D35E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.553-1.894L9 2m0 0l6 2.724M9 2v18m6-15.276l5.447 2.724A2 2 0 0121 8.618v9.764a2 2 0 01-1.553 1.894L15 22m0 0V4.724" />
                </svg>
                Regions I Specialize In
              </h2>
              <p className="text-sm mt-2 text-gray-700 leading-relaxed">
                {profile.regions.join(', ')}
              </p>
            </div>
          )}

          {profile.regions?.length > 0 && (
            
      <div className="bg-[#FFF9E0] border-l-4 border-[#F4D35E] rounded-3xl shadow p-6 transition-all duration-200">
        <h2 style={{ fontFamily: `'DM Serif Display', serif` }} className="text-xl font-semibold text-[#36013F] flex items-center gap-2">
          <svg className="w-5 h-5 text-[#F4D35E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6v12m0 0a4 4 0 004-4H4a4 4 0 000 8z" />
          </svg>
          Ask Me a Free Question
        </h2>
        <p className="text-sm mt-2 text-gray-700 leading-relaxed">
          One quick doubt before booking?<br/>
          <a href="#" className="underline text-[#36013F] hover:text-black transition-all">Ask your first question here →</a>
        </p>
      </div>
          )}
        </section>
      </div>
    </div>
  );
}
