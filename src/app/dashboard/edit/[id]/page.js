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
    let photoURL = updatedData.photo;

    if (typeof updatedData.photo === "object") {
      const storageRef = ref(storage, `Profiles/${updatedData.photo.name}`);
      await uploadBytes(storageRef, updatedData.photo);
      photoURL = await getDownloadURL(storageRef);
    }

    await updateDoc(doc(db, "Profiles", params.id), {
      ...updatedData,
      photo: photoURL,
    });

    router.push("/dashboard/profiles");
  };

  if (loading) return <div className="p-10 text-center">Loading profile...</div>;
  if (!profileData) return <div className="p-10 text-center">Profile not found.</div>;

  return <EditProfileForm initialData={profileData} onSave={handleSave} />;
}
