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
          // Fallback to Supabase
          const { supabase } = await import("@/lib/supabase");
          const { mapSupabaseProfile, getProfileByUidOrEmail } = await import("@/lib/supabaseProfile");
          const data = await getProfileByUidOrEmail(supabase, user.uid, user.email);

          if (data) {
            const mapped = mapSupabaseProfile(data);
            setProfileData({
              ...mapped,
              dateOfBirth: mapped.dateOfBirth ? parseDate(mapped.dateOfBirth, "YYYY-MM-DD") : null,
              services: Array.isArray(mapped.services)
                ? mapped.services.filter((s) => typeof s === "string" && s.trim())
                : [""],
              regions: Array.isArray(mapped.regions) ? mapped.regions : [],
              expertise: Array.isArray(mapped.expertise) ? mapped.expertise : [],
              experience: Array.isArray(mapped.experience) && mapped.experience.length
                ? mapped.experience.map((exp) => ({
                    ...exp,
                    startDate: exp.startDate ? parseDate(exp.startDate, "YYYY-MM") : null,
                    endDate: exp.endDate === "Present" ? "Present" : parseDate(exp.endDate, "YYYY-MM"),
                  }))
                : [{ title: "", company: "", startDate: null, endDate: null }],
            });
          } else {
            console.error("Profile not found for user in Firestore and Supabase:", user.uid);
          }
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
      
      const payload = {
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
      };

      // 1. Update in Firestore if it exists
      try {
        const docRef = doc(db, "Profiles", user.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          await updateDoc(docRef, payload);
        }
      } catch (firestoreErr) {
        console.error("Firestore update error:", firestoreErr);
      }

      // 2. Always update in Supabase
      try {
        const { mapProfileFormToSupabase } = await import("@/lib/supabaseProfile");

        // Format dates correctly for saving
        const formattedDataForSupabaseMapping = {
          ...updatedData,
          photo: newPhotoURL,
          dateOfBirth: updatedData.dateOfBirth ? formatDate(updatedData.dateOfBirth, "YYYY-MM-DD") : "",
          experience: updatedData.experience.map((exp) => ({
            title: exp.title || "",
            company: exp.company || "",
            startDate: exp.startDate ? formatDate(exp.startDate, "YYYY-MM") : "",
            endDate: exp.endDate === "Present" ? "Present" : exp.endDate ? formatDate(exp.endDate, "YYYY-MM") : "",
          })),
        };

        const supabasePayload = mapProfileFormToSupabase(formattedDataForSupabaseMapping);
        supabasePayload.updated_at = new Date().toISOString();

        const profileId = updatedData.id || user.uid;
        
        const response = await fetch("/api/profile/by-uid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId, payload: supabasePayload }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to update profile via API");
        }
      } catch (supabaseErr) {
        console.error("Supabase update error:", supabaseErr);
      }

    } catch (error) {
      console.error("Error saving profile:", error);
      throw new Error("Failed to save profile");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading profile...</div>;
  if (!profileData) return <div className="p-10 text-center">Profile not found.</div>;

  return <EditProfileForm initialData={profileData} onSave={handleSave} />;
}