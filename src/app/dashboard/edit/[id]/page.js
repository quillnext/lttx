

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getFirestore, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import EditProfileForm from "@/app/components/EditProfileForm";
import { use } from "react";

const db = getFirestore(app);
const storage = getStorage(app);

export default function EditProfile({ params }) {
  const resolvedParams = use(params); 
  const id = resolvedParams.id;
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "Profiles", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setProfileData(snapshot.data());
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
        const sanitizedName = updatedData.fullName?.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '') || "Unknown";
        const timestamp = Date.now();
        const ext = updatedData.photo.name.split(".").pop();
        const fileName = `profile_${timestamp}.${ext}`;
        const storageRef = ref(storage, `Profiles/${sanitizedName}/${fileName}`);
        await uploadBytes(storageRef, updatedData.photo);
        newPhotoURL = await getDownloadURL(storageRef);
      }


      const { username, photo, ...dataToSave } = updatedData;
      await updateDoc(doc(db, "Profiles", id), {
        ...dataToSave,
        photo: newPhotoURL,
      });

    
      router.push(`/experts/${profileData.username}`);
    } catch (error) {
      console.error("Error saving profile:", error);
      throw new Error("Failed to save profile");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading profile...</div>;
  if (!profileData) return <div className="p-10 text-center">Profile not found.</div>;

  return <EditProfileForm initialData={profileData} onSave={handleSave} />;
}