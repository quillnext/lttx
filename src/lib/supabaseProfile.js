export const PROFILE_ASSETS_BUCKET = "profile-assets";

const toCamelProfile = (row = {}) => ({
  id: row.id,
  username: row.username || "",
  fullName: row.full_name || row.fullName || row.name || "",
  email: row.email || "",
  phone: row.phone || "",
  dateOfBirth: row.date_of_birth || row.dateOfBirth || "",
  yearsActive: row.years_active || row.yearsActive || "",
  tagline: row.tagline || "",
  location: row.location || "",
  languages: row.languages || [],
  responseTime: row.response_time || row.responseTime || "in 20 mins",
  pricing: row.pricing || "Rs 799/session",
  about: row.about || "",
  photo: row.photo_url || row.photo || "",
  services: row.services || [],
  regions: row.regions || [],
  expertise: row.expertise || [],
  experience: row.experience || [],
  certifications: row.certifications || [],
  licenseNumber: row.license_number || row.licenseNumber || "",
  referred: row.referred || "No",
  referralCode: row.referral_code || row.referralCode || "",
  generatedReferralCode: row.generated_referral_code || row.generatedReferralCode || "",
  certificates: row.certificates || [],
  officePhotos: row.office_photos || row.officePhotos || [],
  registeredAddress: row.registered_address || row.registeredAddress || "",
  website: row.website || "",
  employeeCount: row.employee_count || row.employeeCount || "",
  profileType: row.profile_type || row.profileType || "expert",
  isPublic: row.is_public ?? row.isPublic ?? false,
  isOnline: row.is_online ?? row.isOnline ?? false,
  isHandedOver: row.is_handed_over ?? row.isHandedOver ?? false,
  status: row.status || "",
  userId: row.user_id || row.userId || "",
  forcePasswordChange: row.force_password_change ?? row.forcePasswordChange ?? false,
  approvalTimestamp: row.approval_timestamp || row.approvalTimestamp || "",
  timestamp: row.created_at || row.timestamp || null,
  createdAt: row.created_at || row.createdAt || null,
  updatedAt: row.updated_at || row.updatedAt || null,
  bio: row.bio || "",
  whyConsult: row.why_consult || [],
  experienceDNA: row.experience_dna || null,
});

export function mapSupabaseProfile(row) {
  return row ? toCamelProfile(row) : null;
}

export function mapProfileFormToSupabase(formData = {}) {
  return {
    username: formData.username || "",
    full_name: formData.fullName || "",
    email: formData.email || "",
    phone: formData.phone || "",
    date_of_birth: formData.dateOfBirth || null,
    years_active: formData.yearsActive || "",
    tagline: formData.tagline || "",
    location: formData.location || "",
    languages: Array.isArray(formData.languages) ? formData.languages : [],
    response_time: formData.responseTime || "",
    pricing: formData.pricing || "",
    about: formData.about || "",
    photo_url: formData.photo || "",
    services: Array.isArray(formData.services) ? formData.services : [],
    regions: Array.isArray(formData.regions) ? formData.regions : [],
    expertise: Array.isArray(formData.expertise) ? formData.expertise : [],
    experience: Array.isArray(formData.experience) ? formData.experience : [],
    certifications: Array.isArray(formData.certifications)
      ? formData.certifications
      : [],
    referred: formData.referred || "No",
    referral_code: formData.referred === "Yes" ? formData.referralCode || null : null,
    profile_type: formData.profileType || "expert",
    license_number: formData.licenseNumber || "",
    certificates: Array.isArray(formData.certificates) ? formData.certificates : [],
    office_photos: Array.isArray(formData.officePhotos) ? formData.officePhotos : [],
    registered_address: formData.registeredAddress || "",
    website: formData.website || "",
    employee_count: formData.employeeCount || "",
    lead_id: formData.leadId || null,
    status: formData.status || undefined,
    is_public: formData.isPublic ?? undefined,
    is_handed_over: formData.isHandedOver ?? undefined,
    user_id: formData.userId || undefined,
    force_password_change: formData.forcePasswordChange ?? undefined,
    approval_timestamp: formData.approvalTimestamp || undefined,
    bio: formData.bio || "",
    why_consult: Array.isArray(formData.whyConsult) ? formData.whyConsult : [],
    experience_dna: formData.experienceDNA || null,
  };
}

export const defaultExpertSchedule = {
  Mon: ["09:00", "13:30", "14:00"],
  Tue: ["09:00", "13:30", "14:00"],
  Wed: ["09:00", "13:30", "14:00"],
  Thu: ["09:00", "13:30", "14:00"],
  Fri: ["09:00", "13:30", "14:00"],
  Sat: ["09:00", "13:30", "14:00"],
  Sun: ["14:00", "17:30"],
};

export async function getProfileByUidOrEmail(supabase, uid, email) {
  // Use server-side API on browser to bypass RLS and handle columns gracefully
  if (typeof window !== "undefined") {
    try {
      const emailParam = email ? `&email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/profile/by-uid?uid=${encodeURIComponent(uid)}${emailParam}`);
      if (res.ok) {
        const data = await res.json();
        return data.profile || null;
      }
    } catch (err) {
      console.error("Failed to fetch profile via API helper:", err);
    }
  }

  // Fallback / Server-side check
  // 1. Try by id = uid
  let { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .single();
  if (data && !error) return data;

  // 2. Try by user_id = uid (catch column not existing)
  try {
    const resUserId = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();
    if (resUserId.data) return resUserId.data;
  } catch (e) {
    // Column user_id doesn't exist
  }

  // 3. Try by email
  if (email) {
    const resEmail = await supabase
      .from("profiles")
      .select("*")
      .ilike("email", email.trim())
      .maybeSingle();
    if (resEmail.data) return resEmail.data;
  }

  return null;
}

