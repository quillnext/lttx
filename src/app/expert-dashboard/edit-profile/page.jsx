"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EditProfileForm from "@/app/components/EditProfileForm";
import { supabase } from "@/lib/supabase";
import { mapSupabaseProfile, getProfileByUidOrEmail, mapProfileFormToSupabase } from "@/lib/supabaseProfile";
import { useUserAuthStore } from "@/stores/useUserAuthStore";

export default function UserEditProfile() {
  const { user } = useUserAuthStore();
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
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        const data = await getProfileByUidOrEmail(supabase, user.id, user.email);

        if (data) {
          const mapped = mapSupabaseProfile(data);
          
          const safeArray = (val) => {
              if (Array.isArray(val)) return val;
              if (typeof val === 'string' && val.trim()) return val.split(',').map(s => s.trim());
              return [];
          };

          setProfileData({
            ...mapped,
            dateOfBirth: mapped.dateOfBirth ? parseDate(mapped.dateOfBirth, "YYYY-MM-DD") : null,
            languages: safeArray(mapped.languages),
            expertise: safeArray(mapped.expertise),
            certifications: safeArray(mapped.certifications),
            services: Array.isArray(mapped.services)
              ? mapped.services.filter((s) => typeof s === "string" && s.trim())
              : [""],
            regions: Array.isArray(mapped.regions) ? mapped.regions : [],
            experience: Array.isArray(mapped.experience) && mapped.experience.length
              ? mapped.experience.map((exp) => ({
                  ...exp,
                  startDate: exp.startDate ? parseDate(exp.startDate, "YYYY-MM") : null,
                  endDate: exp.endDate === "Present" ? "Present" : parseDate(exp.endDate, "YYYY-MM"),
                }))
              : [{ title: "", company: "", startDate: null, endDate: null }],
            certificates: safeArray(mapped.certificates),
            officePhotos: safeArray(mapped.officePhotos),
          });
        } else {
          console.error("Profile not found for user in Supabase:", user.id);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, router]);

  const handleSave = async (updatedData) => {
    if (!user) {
      router.push("/login");
      return;
    }

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

      const formattedDataForSupabaseMapping = {
        ...updatedData,
        photo: photoURL,
        certificates: finalCertificates,
        officePhotos: finalOfficePhotos,
        dateOfBirth: updatedData.dateOfBirth ? formatDate(updatedData.dateOfBirth, "YYYY-MM-DD") : "",
        services: Array.isArray(updatedData.services)
          ? updatedData.services.filter((s) => typeof s === "string" && s.trim())
          : [],
        experience: Array.isArray(updatedData.experience)
          ? updatedData.experience.map((exp) => ({
              title: exp.title || "",
              company: exp.company || "",
              startDate: exp.startDate instanceof Date ? formatDate(exp.startDate, "YYYY-MM") : exp.startDate || "",
              endDate: exp.endDate === "Present" ? "Present" : (exp.endDate instanceof Date ? formatDate(exp.endDate, "YYYY-MM") : exp.endDate || ""),
            }))
          : [],
      };

      const supabasePayload = mapProfileFormToSupabase(formattedDataForSupabaseMapping);
      supabasePayload.updated_at = new Date().toISOString();

      const profileId = updatedData.id || user.id;
      
      const response = await fetch("/api/profile/by-uid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, payload: supabasePayload }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update profile via API");
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