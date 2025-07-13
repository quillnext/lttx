
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "@/lib/firebase";
import ClientProfilePage from "./ClientProfilePage";

export default async function ExpertProfilePage({ params }) {
  const db = getFirestore(app);
  const q = query(collection(db, "Profiles"), where("username", "==", params.slug));
  let profile = null;

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return <div>Profile not found</div>;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      profile = {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to a plain string
        timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : null,
      };
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return <div>Error loading profile. Please try again later.</div>;
  }

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
    .sort((a, b) => {
      const dateA = a.endDate === "Present" ? new Date() : new Date(a.endDate);
      const dateB = b.endDate === "Present" ? new Date() : new Date(b.endDate);
      return dateB - dateA;
    });

  return <ClientProfilePage profile={profile} sortedExperience={sortedExperience} />;
}