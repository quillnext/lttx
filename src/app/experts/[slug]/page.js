import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import ClientProfilePage from "./ClientProfilePage";

// ✅ DYNAMIC METADATA FUNCTION
export async function generateMetadata({ params }) {
  const db = getFirestore(app);
  const q = query(collection(db, "Profiles"), where("username", "==", params.slug));
  let profile = null;

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        profile = { ...doc.data(), id: doc.id };
      });
    }
  } catch (error) {
    console.error("Meta error:", error);
  }

   if (!profile) {
    return {
      title: "Expert Not Found | XmyTravel",
      description: "This expert profile could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${profile.fullName} - ${profile.tagline || "Travel Expert"}`;
  const description = profile.about?.substring(0, 200) || "Verified expert on XmyTravel";
  const image = profile.photo || "https://www.xmytravel.com/logolttx.svg";
  const url = `https://www.xmytravel.com/experts/${params.slug}`;

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
  const db = getFirestore(app);
  const q = query(collection(db, "Profiles"), where("username", "==", params.slug));
  let profile = null;

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return <div>Profile not found</div>;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      profile = {
        id: doc.id,
        ...data,
        timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : null,
      };
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return <div>Error loading profile</div>;
  }

  if (!profile) return <div>Profile not found</div>;

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

  return <ClientProfilePage profile={profile} sortedExperience={sortedExperience} />;
}
