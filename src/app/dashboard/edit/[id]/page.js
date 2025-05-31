
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getFirestore, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import { use } from "react";
import EditProfileForm from "@/app/components/EditProfileForm";

const db = getFirestore(app);
const storage = getStorage(app);

export default function EditProfile({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper to parse date strings to Date objects
  const parseDate = (dateString, format = "YYYY-MM-DD") => {
    if (!dateString) return null;
    const parts = dateString.split("-");
    if (format === "YYYY-MM" && parts.length === 2) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1);
    }
    if (format === "YYYY-MM-DD" && parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return null;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "Profiles", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setProfileData({
            ...data,
            dateOfBirth: data.dateOfBirth ? parseDate(data.dateOfBirth, "YYYY-MM-DD") : null,
            experience: data.experience?.length
              ? data.experience.map((exp) => ({
                  ...exp,
                  startDate: exp.startDate ? parseDate(exp.startDate, "YYYY-MM") : null,
                  endDate: exp.endDate === "Present" ? "Present" : parseDate(exp.endDate, "YYYY-MM"),
                }))
              : [{ title: "", company: "", startDate: null, endDate: null }],
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  const handleSave = async (updatedData) => {
    try {
      let newPhotoURL = updatedData.photo;

      if (updatedData.photo instanceof File) {
        const sanitizedName = updatedData.fullName?.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "") || "Unknown";
        const timestamp = Date.now();
        const ext = updatedData.photo.name.split(".").pop();
        const fileName = `profile_${timestamp}.${ext}`;
        const storageRef = ref(storage, `Profiles/${sanitizedName}/${fileName}`);
        await uploadBytes(storageRef, updatedData.photo);
        newPhotoURL = await getDownloadURL(storageRef);
      }

      // Format dates for Firestore
      const formatDate = (date, format = "YYYY-MM-DD") => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        if (format === "YYYY-MM") return `${year}-${month}`;
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const { photo, ...dataToSave } = updatedData;
      await updateDoc(doc(db, "Profiles", id), {
        ...dataToSave,
        photo: newPhotoURL,
        dateOfBirth: updatedData.dateOfBirth ? formatDate(updatedData.dateOfBirth, "YYYY-MM-DD") : "",
        experience: updatedData.experience.map((exp) => ({
          title: exp.title,
          company: exp.company,
          startDate: exp.startDate ? formatDate(exp.startDate, "YYYY-MM") : "",
          endDate: exp.endDate === "Present" ? "Present" : exp.endDate ? formatDate(exp.endDate, "YYYY-MM") : "",
        })),
      });

      router.push(`/experts/${updatedData.username}`);
    } catch (error) {
      console.error("Error saving profile:", error);
      throw new Error("Failed to save profile");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading profile...</div>;
  if (!profileData) return <div className="p-10 text-center">Profile not found.</div>;

  return <EditProfileForm initialData={profileData} onSave={handleSave} />;
}