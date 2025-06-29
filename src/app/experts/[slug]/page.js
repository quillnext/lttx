

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
  const profileDoc = querySnapshot.docs[0];

  if (!profileDoc) {
    return <div>Expert not found</div>;
  }

  // Convert Firestore data to plain objects
  const profile = profileDoc.data();
  const convertedProfile = {
    ...profile,
    timestamp: profile.timestamp instanceof Timestamp ? profile.timestamp.toDate() : profile.timestamp,
    approvalTimestamp: profile.approvalTimestamp instanceof Timestamp ? profile.approvalTimestamp.toDate() : profile.approvalTimestamp,
    experience: profile.experience?.map((exp) => ({
      ...exp,
      startDate: exp.startDate instanceof Timestamp ? exp.startDate.toDate() : exp.startDate,
      endDate: exp.endDate instanceof Timestamp ? exp.endDate.toDate() : exp.endDate,
    })) || [],
  };

  const experience = convertedProfile.experience || [];
  const sortedExperience = experience
    .map((exp) => {
      // Parse startDate (expected format: "YYYY-MM" or Date object)
      const startDate = typeof exp.startDate === "string" && exp.startDate.match(/^\d{4}-\d{2}$/)
        ? new Date(`${exp.startDate}-01`)
        : exp.startDate instanceof Date
        ? exp.startDate
        : null;
      const startDateFormatted = startDate && !isNaN(startDate) ? startDate.getFullYear().toString() : "Unknown";

      // Handle endDate (could be "Present", "YYYY-MM", or Date object)
      let endDateFormatted;
      if (exp.endDate === "Present") {
        endDateFormatted = "Present";
      } else {
        const endDate = typeof exp.endDate === "string" && exp.endDate.match(/^\d{4}-\d{2}$/)
          ? new Date(`${exp.endDate}-01`)
          : exp.endDate instanceof Date
          ? exp.endDate
          : null;
        endDateFormatted = endDate && !isNaN(endDate) ? endDate.getFullYear().toString() : "Unknown";
      }

      // Calculate duration
      let duration = null;
      if (startDate && !isNaN(startDate)) {
        if (exp.endDate === "Present") {
          const currentYear = new Date().getFullYear();
          const years = currentYear - startDate.getFullYear();
          duration = years > 0 ? `${years} year${years > 1 ? "s" : ""}` : "Less than a year";
        } else if (exp.endDate && typeof exp.endDate === "string" && exp.endDate.match(/^\d{4}-\d{2}$/)) {
          const endDate = new Date(`${exp.endDate}-01`);
          if (endDate && !isNaN(endDate)) {
            const years = endDate.getFullYear() - startDate.getFullYear();
            duration = years > 0 ? `${years} year${years > 1 ? "s" : ""}` : "Less than a year";
          }
        } else if (exp.endDate instanceof Date && !isNaN(exp.endDate)) {
          const years = exp.endDate.getFullYear() - startDate.getFullYear();
          duration = years > 0 ? `${years} year${years > 1 ? "s" : ""}` : "Less than a year";
        }
      }

      return {
        ...exp,
        startDateFormatted,
        endDateFormatted,
        duration,
      };
    })
    .sort((a, b) => {
      const aDate = a.startDate && typeof a.startDate === "string" && a.startDate.match(/^\d{4}-\d{2}$/)
        ? new Date(`${a.startDate}-01`)
        : a.startDate instanceof Date
        ? a.startDate
        : new Date(0);
      const bDate = b.startDate && typeof b.startDate === "string" && b.startDate.match(/^\d{4}-\d{2}$/)
        ? new Date(`${b.startDate}-01`)
        : b.startDate instanceof Date
        ? b.startDate
        : new Date(0);
      return bDate - aDate;
    });

  return <ClientProfilePage profile={convertedProfile} sortedExperience={sortedExperience} />;
}