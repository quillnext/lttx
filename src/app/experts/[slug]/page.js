

import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import ClientProfilePage from "./ClientProfilePage";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";

export async function generateMetadata({ params }) {
  const db = getFirestore(app);
  const q = query(collection(db, "Profiles"), where("username", "==", params.slug));
  const querySnapshot = await getDocs(q);
  const profile = querySnapshot.docs[0]?.data() || null;

  return {
    title: profile ? `${profile.fullName} | Travel Expert` : "Expert Not Found",
    description: profile?.tagline || "Profile of a travel expert",
  };
}

export default async function ExpertProfilePage({ params }) {
  const db = getFirestore(app);
  const q = query(collection(db, "Profiles"), where("username", "==", params.slug));
  const querySnapshot = await getDocs(q);

  let profile = null;
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    profile = {
      id: doc.id,
      ...data,
      // Convert Firestore Timestamp to a plain string
      timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : null,
    };
  });

  if (!profile) {
    return <div>Profile not found</div>;
  }

  // Process experience data for sorting
  const sortedExperience = profile.experience
    ?.map((exp) => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.endDate === "Present" ? new Date() : new Date(exp.endDate);
      const duration = exp.endDate === "Present" ? null : Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25));
      return {
        ...exp,
        startDateFormatted: startDate.toLocaleString("en-US", { month: "short", year: "numeric" }),
        endDateFormatted: exp.endDate === "Present" ? "Present" : endDate.toLocaleString("en-US", { month: "short", year: "numeric" }),
        duration: duration ? `${duration} year${duration > 1 ? "s" : ""}` : null,
      };
    })
    .sort((a, b) => (b.endDate === "Present" ? new Date() : new Date(b.endDate)) - (a.endDate === "Present" ? new Date() : new Date(a.endDate)));

  return <ClientProfilePage profile={profile} sortedExperience={sortedExperience} />;
}