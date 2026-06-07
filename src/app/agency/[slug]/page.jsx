import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import ClientProfilePage from "../../experts/[slug]/ClientProfilePage"; // Adjust path as needed
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/pages/Footer";
import Link from "next/link";
import JsonLd from "@/app/components/JsonLd";
import { cache } from "react";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { mapSupabaseProfile } from "@/lib/supabaseProfile";

const getProfileBySlug = cache(async (slug) => {
  const normalizedSlug = decodeURIComponent(slug || "").trim();

  // 1. Try Supabase
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", normalizedSlug)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (data) {
      return mapSupabaseProfile(data);
    }
  } catch (err) {
    console.error("Supabase slug fetch error:", err);
  }

  // 2. Try Firestore as fallback
  try {
    const db = getFirestore(app);
    const q = query(collection(db, "Profiles"), where("username", "==", normalizedSlug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      let profile = null;
      querySnapshot.forEach((doc) => {
        profile = { ...doc.data(), id: doc.id };
      });
      return profile;
    }
  } catch (err) {
    console.error("Firestore slug fetch error:", err);
  }

  return null;
});

// ✅ DYNAMIC METADATA FUNCTION
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const profile = await getProfileBySlug(slug).catch((error) => {
    console.error("Meta error:", error);
    return null;
  });

  if (!profile || profile.isPublic === false || profile.profileType !== "agency") {
    return {
      title: "Agency Not Found | XmyTravel",
      description: "This agency profile could not be found or is not an agency.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${profile.fullName} - ${profile.tagline || "Travel Agency"}`;
  const description = profile.about?.substring(0, 200) || "Verified travel agency on XmyTravel";
  const image = profile.photo || "https://www.xmytravel.com/logolttx.svg";
  const url = `https://www.xmytravel.com/agency/${slug}`;

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
export default async function AgencyProfilePage({ params }) {
  const { slug } = await params;
  const db = getFirestore(app);
  let profile = null;
  let weeklySchedule = {};

  try {
    const profileData = await getProfileBySlug(slug);
    if (!profileData) return <div>Agency not found</div>;

    profile = {
      ...profileData,
      profileType: profileData.profileType || 'expert',
      timestamp: profileData.timestamp || profileData.createdAt || null,
      isOnline: profileData.isOnline !== false,
    };

    // Ensure this is an agency profile
    if (profile?.profileType !== 'agency') {
      return <div>This profile is not an agency</div>;
    }

    if (profile) {
      // 1. Try Supabase for availability schedule
      try {
        const { data: availability, error: availabilityError } = await createSupabaseAdminClient()
          .from("expert_recurring_availability")
          .select("schedule")
          .eq("expert_id", profile.id)
          .maybeSingle();

        if (availabilityError) {
          console.warn("Error fetching expert availability from Supabase:", availabilityError.message);
        } else if (availability?.schedule) {
          weeklySchedule = availability.schedule;
        }
      } catch (err) {
        console.error("Supabase availability fetch error:", err);
      }

      // 2. Fallback to Firestore for availability schedule
      if (Object.keys(weeklySchedule).length === 0) {
        try {
          const recurringRef = doc(db, "ExpertRecurringAvailability", profile.id);
          const recurringSnap = await getDoc(recurringRef);
          if (recurringSnap.exists()) {
            weeklySchedule = recurringSnap.data().schedule || {};
          }
        } catch (err) {
          console.error("Firestore availability fetch error:", err);
        }
      }
    }

  } catch (error) {
    console.error("Error fetching agency profile:", error);
    return <div>Error loading agency profile</div>;
  }

  if (!profile) return <div>Agency not found</div>;

  if (profile.isPublic === false) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-100 pt-20">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Agency Profile is Private</h1>
            <p className="text-gray-600">This agency's profile is not currently available to the public.</p>
            <Link href="/ask-an-expert" className="mt-6 inline-block bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all">
              Find Other Agencies or Experts
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

  // Generate Agency Schema for GEO
  const agencySchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": profile.fullName,
    "description": profile.about || `Verified travel agency on Xmytravel specializing in ${profile.expertise?.join(', ') || 'travel services'}.`,
    "image": profile.photo || "https://www.xmytravel.com/logolttx.svg",
    "url": `https://www.xmytravel.com/agency/${slug}`,
    "sameAs": profile.socialLinks || [],
    "knowsAbout": profile.expertise || [],
    "location": {
      "@type": "Place",
      "name": profile.location || "Global"
    }
  };

  return (
    <>
      <JsonLd schema={agencySchema} />
      <ClientProfilePage profile={profile} sortedExperience={sortedExperience} weeklySchedule={weeklySchedule} />
    </>
  );
}
