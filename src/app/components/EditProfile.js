
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getFirestore, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";
import EditProfileForm from "./EditProfileForm";

const db = getFirestore(app);
const storage = getStorage(app);

export default function EditProfile({ id }) { 
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
      try {
        const docRef = doc(db, "Profiles", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          
          const safeArray = (val) => {
              if (Array.isArray(val)) return val;
              if (typeof val === 'string' && val.trim()) return val.split(',').map(s => s.trim());
              return [];
          };

          setProfileData({
            ...data,
            dateOfBirth: data.dateOfBirth ? parseDate(data.dateOfBirth, "YYYY-MM-DD") : null,
            languages: safeArray(data.languages),
            expertise: safeArray(data.expertise),
            certifications: safeArray(data.certifications),
            experience: Array.isArray(data.experience) && data.experience.length
              ? data.experience.map((exp) => ({
                  ...exp,
                  startDate: exp.startDate ? parseDate(exp.startDate, "YYYY-MM") : null,
                  endDate: exp.endDate === "Present" ? "Present" : parseDate(exp.endDate, "YYYY-MM"),
                }))
              : [{ title: "", company: "", startDate: null, endDate: null }],
            certificates: safeArray(data.certificates),
            officePhotos: safeArray(data.officePhotos),
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
      const sanitizedName = updatedData.fullName?.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "") || "Unknown";
      
      // 1. Handle Profile Photo
      let photoURL = updatedData.photo;
      if (updatedData.photo instanceof File) {
        const timestamp = Date.now();
        const ext = updatedData.photo.name.split(".").pop();
        const fileName = `profile_${timestamp}.${ext}`;
        const storageRef = ref(storage, `Profiles/${sanitizedName}/${fileName}`);
        await uploadBytes(storageRef, updatedData.photo);
        photoURL = await getDownloadURL(storageRef);
      }

      // 2. Handle Multi-File Certificates
      const finalCertificates = [];
      const certificatesList = Array.isArray(updatedData.certificates) ? updatedData.certificates : [];
      for (const cert of certificatesList) {
        if (cert instanceof File) {
          const certName = `cert_${Date.now()}_${cert.name}`;
          const certRef = ref(storage, `Certificates/${sanitizedName}/${certName}`);
          await uploadBytes(certRef, cert);
          const url = await getDownloadURL(certRef);
          finalCertificates.push(url);
        } else if (typeof cert === 'string') {
          finalCertificates.push(cert);
        }
      }

      // 3. Handle Multi-File Office Photos
      const finalOfficePhotos = [];
      const officePhotosList = Array.isArray(updatedData.officePhotos) ? updatedData.officePhotos : [];
      for (const oPhoto of officePhotosList) {
        if (oPhoto instanceof File) {
          const oName = `office_${Date.now()}_${oPhoto.name}`;
          const oRef = ref(storage, `OfficePhotos/${sanitizedName}/${oName}`);
          await uploadBytes(oRef, oPhoto);
          const url = await getDownloadURL(oRef);
          finalOfficePhotos.push(url);
        } else if (typeof oPhoto === 'string') {
          finalOfficePhotos.push(oPhoto);
        }
      }

      const formatDate = (date, format = "YYYY-MM-DD") => {
        if (!date) return "";
        if (typeof date === 'string') return date;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        if (format === "YYYY-MM") return `${year}-${month}`;
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const dataForFirestore = {
        ...updatedData,
        photo: photoURL,
        certificates: finalCertificates,
        officePhotos: finalOfficePhotos,
        dateOfBirth: updatedData.profileType === 'expert' && updatedData.dateOfBirth ? formatDate(updatedData.dateOfBirth, "YYYY-MM-DD") : "",
        experience: updatedData.profileType === 'expert' ? updatedData.experience.map((exp) => ({
          title: exp.title || "",
          company: exp.company || "",
          startDate: exp.startDate instanceof Date ? formatDate(exp.startDate, "YYYY-MM") : exp.startDate || "",
          endDate: exp.endDate === "Present" ? "Present" : (exp.endDate instanceof Date ? formatDate(exp.endDate, "YYYY-MM") : exp.endDate || ""),
        })) : [],
      };

      await updateDoc(doc(db, "Profiles", id), dataForFirestore);
    } catch (error) {
      console.error("Error saving profile:", error);
      throw new Error("Failed to save profile");
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-400 font-black animate-pulse uppercase tracking-[0.2em]">Synchronizing Record...</div>;
  if (!profileData) return <div className="p-20 text-center text-red-500 font-bold">Profile not found.</div>;

  return <EditProfileForm initialData={profileData} onSave={handleSave} />;
}
