
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "firebase/auth";
import { doc, getFirestore, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import EditProfileForm from "@/app/components/EditProfileForm";

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export default function UserEditProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      const user = auth.currentUser;
      if (!user) {
        router.push("/expert-login");
        return;
      }

      try {
        const docRef = doc(db, "Profiles", user.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setProfileData({
            ...data,
            dateOfBirth: data.dateOfBirth ? parseDate(data.dateOfBirth, "YYYY-MM-DD") : null,
            services: Array.isArray(data.services)
              ? data.services.filter((s) => typeof s === "string" && s.trim())
              : [""],
            regions: Array.isArray(data.regions) ? data.regions : [],
            expertise: Array.isArray(data.expertise) ? data.expertise : [],
            experience: Array.isArray(data.experience) && data.experience.length
              ? data.experience.map((exp) => ({
                  ...exp,
                  startDate: exp.startDate ? parseDate(exp.startDate, "YYYY-MM") : null,
                  endDate: exp.endDate === "Present" ? "Present" : parseDate(exp.endDate, "YYYY-MM"),
                }))
              : [{ title: "", company: "", startDate: null, endDate: null }],
          });
        } else {
          console.error("Profile not found for user:", user.uid);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleSave = async (updatedData) => {
    const user = auth.currentUser;
    if (!user) {
      router.push("/expert-login");
      return;
    }

    try {
      let newPhotoURL = updatedData.photo;

      if (updatedData.photo instanceof File) {
        const sanitizedName =
          updatedData.fullName?.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "") || "Unknown";
        const timestamp = Date.now();
        const ext = updatedData.photo.name.split(".").pop();
        const fileName = `profile_${timestamp}.${ext}`;
        const storageRef = ref(storage, `Profiles/${sanitizedName}/${fileName}`);
        await uploadBytes(storageRef, updatedData.photo);
        newPhotoURL = await getDownloadURL(storageRef);
      }

      const formatDate = (date, format = "YYYY-MM-DD") => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        if (format === "YYYY-MM") return `${year}-${month}`;
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const { photo, ...dataToSave } = updatedData;
      await updateDoc(doc(db, "Profiles", user.uid), {
        ...dataToSave,
        photo: newPhotoURL,
        dateOfBirth: updatedData.dateOfBirth ? formatDate(updatedData.dateOfBirth, "YYYY-MM-DD") : "",
        services: updatedData.services.filter((s) => typeof s === "string" && s.trim()),
        experience: updatedData.experience.map((exp) => ({
          title: exp.title || "",
          company: exp.company || "",
          startDate: exp.startDate ? formatDate(exp.startDate, "YYYY-MM") : "",
          endDate: exp.endDate === "Present" ? "Present" : exp.endDate ? formatDate(exp.endDate, "YYYY-MM") : "",
        })),
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      throw new Error("Failed to save profile");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading profile...</div>;
  if (!profileData) return <div className="p-10 text-center">Profile not found.</div>;

  return <EditProfileForm initialData={profileData} onSave={handleSave} />;
}