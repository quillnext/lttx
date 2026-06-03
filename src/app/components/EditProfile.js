
"use client";

import { useEffect, useState } from "react";
import EditProfileForm from "./EditProfileForm";

export default function EditProfile({ id }) { 
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        const response = await fetch(`/api/admin/profiles?id=${encodeURIComponent(id)}`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to fetch profile");
        if (result.profile) {
          const data = result.profile;
          
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
      const uploadProfileAsset = async (file, folder, namePrefix) => {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("folder", folder);
        uploadData.append("namePrefix", namePrefix);

        const response = await fetch("/api/profile-assets/upload", {
          method: "POST",
          body: uploadData,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to upload file");
        return result.publicUrl;
      };
      
      let photoURL = updatedData.photo;
      if (updatedData.photo instanceof File) {
        photoURL = await uploadProfileAsset(updatedData.photo, "profiles", `profile_${sanitizedName}`);
      }

      const finalCertificates = [];
      const certificatesList = Array.isArray(updatedData.certificates) ? updatedData.certificates : [];
      for (const cert of certificatesList) {
        if (cert instanceof File) {
          finalCertificates.push(await uploadProfileAsset(cert, "certificates", `cert_${sanitizedName}`));
        } else if (typeof cert === 'string') {
          finalCertificates.push(cert);
        }
      }

      const finalOfficePhotos = [];
      const officePhotosList = Array.isArray(updatedData.officePhotos) ? updatedData.officePhotos : [];
      for (const oPhoto of officePhotosList) {
        if (oPhoto instanceof File) {
          finalOfficePhotos.push(await uploadProfileAsset(oPhoto, "office-photos", `office_${sanitizedName}`));
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

      const dataForSupabase = {
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

      const response = await fetch("/api/admin/profiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, updates: dataForSupabase }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save profile");
    } catch (error) {
      console.error("Error saving profile:", error);
      throw new Error("Failed to save profile");
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-400 font-black animate-pulse uppercase tracking-[0.2em]">Synchronizing Record...</div>;
  if (!profileData) return <div className="p-20 text-center text-red-500 font-bold">Profile not found.</div>;

  return <EditProfileForm initialData={profileData} onSave={handleSave} />;
}
