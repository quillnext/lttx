"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getFirestore, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import EditProfileForm from "@/app/components/EditProfileForm";

const db = getFirestore(app);
const storage = getStorage(app);

export default function EditProfile({ params }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const docRef = doc(db, "Profiles", params.id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setProfileData(snapshot.data());
      }
      setLoading(false);
    };
    fetchProfile();
  }, [params.id]);

 const handleSave = async (updatedData) => {
  let newPhotoURL = profileData.photo;

  // Check if a new file is selected
  const isNewFile = typeof updatedData.photo === "object";

  if (isNewFile && updatedData.photo) {
    // Step 1: Delete the existing image from Firebase Storage
    if (profileData.photo) {
      try {
        const existingUrl = profileData.photo;
        const pathStart = existingUrl.indexOf("/o/") + 3;
        const pathEnd = existingUrl.indexOf("?alt=");
        const decodedPath = decodeURIComponent(existingUrl.substring(pathStart, pathEnd));
        const oldImageRef = ref(storage, decodedPath);
        await oldImageRef.delete();
      } catch (error) {
        console.warn("Old image deletion failed:", error.message);
      }
    }

    // Step 2: Upload the new image
    try {
      const sanitizedName = updatedData.fullName?.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || "Unknown";
      const timestamp = Date.now();
      const ext = updatedData.photo.name.split(".").pop();
      const fileName = `profile_${timestamp}.${ext}`;
      const storageRef = ref(storage, `Profiles/${sanitizedName}/${fileName}`);
      await uploadBytes(storageRef, updatedData.photo);
      newPhotoURL = await getDownloadURL(storageRef);
    } catch (uploadErr) {
      console.error("Upload failed:", uploadErr.message);
    }
  }

  // Step 3: Update Firestore with the new URL
  await updateDoc(doc(db, "Profiles", params.id), {
    ...updatedData,
    photo: newPhotoURL, // this ensures the updated URL is saved
  });

  router.push("/dashboard/profiles");
};


  if (loading) return <div className="p-10 text-center">Loading profile...</div>;
  if (!profileData) return <div className="p-10 text-center">Profile not found.</div>;

  return <EditProfileForm initialData={profileData} onSave={handleSave} />;
}
