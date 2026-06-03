
import ClientProfilePage from "./ClientProfilePage";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/pages/Footer";
import Link from "next/link";
import { redirect } from "next/navigation"; 
import JsonLd from "@/app/components/JsonLd";
import { cache } from "react";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { mapSupabaseProfile } from "@/lib/supabaseProfile";

const getProfileBySlug = cache(async (slug) => {
  const supabase = createSupabaseAdminClient();
  const normalizedSlug = decodeURIComponent(slug || "").trim();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", normalizedSlug)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapSupabaseProfile(data);
});

// ✅ DYNAMIC METADATA FUNCTION
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug).catch((error) => {
    console.error("Meta error:", error);
    return null;
  });

  if (!profile || profile.isPublic === false) {
    return {
      title: "Expert Not Found | XmyTravel",
      description: "This expert profile could not be found or is private.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${profile.fullName} - ${profile.tagline || "Travel Expert"}`;
  const description = profile.about?.substring(0, 200) || "Verified expert on XmyTravel";
  const image = profile.photo || "https://www.xmytravel.com/logolttx.svg";
  const url = `https://www.xmytravel.com/experts/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${profile.fullName}'s profile image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// ✅ MAIN PAGE FUNCTION
export default async function ExpertProfilePage({ params }) {
  const { slug } = await params;
  let profile = null;
  let weeklySchedule = {};

  try {
    const profileData = await getProfileBySlug(slug);
    if (!profileData) return <div>Profile not found</div>;

    profile = {
      ...profileData,
      profileType: profileData.profileType || 'expert',
      timestamp: profileData.timestamp || profileData.createdAt || null,
      isOnline: profileData.isOnline !== false,
    };

    if (profile?.profileType === 'agency') {
      redirect(`/agency/${slug}`);
    }

    if (profile) {
      const { data: availability, error: availabilityError } = await createSupabaseAdminClient()
        .from("expert_recurring_availability")
        .select("schedule")
        .eq("expert_id", profile.id)
        .maybeSingle();

      if (availabilityError) {
        console.warn("Error fetching expert availability:", availabilityError.message);
      } else if (availability?.schedule) {
        weeklySchedule = availability.schedule;
      }
    }

  } catch (error) {
    console.error("Error fetching profile:", error);
    return <div>Error loading profile</div>;
  }

  if (!profile) return <div>Profile not found</div>;

  if (profile.isPublic === false) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-20">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile is Private</h1>
            <p className="text-gray-600">This expert's profile is not currently available to the public.</p>
            <Link href="/ask-an-expert" className="mt-6 inline-block bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all">
              Find Other Experts
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const sortedExperience = profile.experience
    ?.map((exp) => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.endDate === "Present" ? new Date() : new Date(exp.endDate);
      const duration =
        exp.endDate === "Present"
          ? null
          : Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25));
      return {
        ...exp,
        startDateFormatted: startDate.toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        }),
        endDateFormatted:
          exp.endDate === "Present"
            ? "Present"
            : endDate.toLocaleString("en-US", {
                month: "short",
                year: "numeric",
              }),
        duration: duration ? `${duration} year${duration > 1 ? "s" : ""}` : null,
      };
    })
    .sort((a, b) => {
      const dateA = a.endDate === "Present" ? new Date() : new Date(a.endDate);
      const dateB = b.endDate === "Present" ? new Date() : new Date(b.endDate);
      return dateB - dateA;
    });

  // Generate Person Schema for GEO
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": profile.fullName,
    "jobTitle": profile.tagline || "Travel Expert",
    "description": profile.about || `Verified travel expert on Xmytravel specializing in ${profile.expertise?.join(', ') || 'travel consultation'}.`,
    "image": profile.photo || "https://www.xmytravel.com/logolttx.svg",
    "url": `https://www.xmytravel.com/experts/${slug}`,
    "sameAs": profile.socialLinks || [], // Social links help build entity authority
    "knowsAbout": profile.expertise || [],
    "worksFor": {
      "@type": "Organization",
      "name": "Xmytravel"
    }
  };

  return (
    <>
      <JsonLd schema={personSchema} />
      <ClientProfilePage profile={profile} sortedExperience={sortedExperience} weeklySchedule={weeklySchedule} />
    </>
  );
}
