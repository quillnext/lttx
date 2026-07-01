import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { defaultExpertSchedule, mapProfileFormToSupabase, mapSupabaseProfile } from "@/lib/supabaseProfile";
import crypto from "crypto";

const generateReferralCode = () => {
  const timestamp = Date.now().toString().slice(-4);
  const rand = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `REFX${timestamp}${rand}`;
};

const cleanPayload = (payload) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));

const mapPartialProfileUpdates = (updates = {}) => {
  const full = mapProfileFormToSupabase(updates);
  const keyMap = {
    username: "username",
    fullName: "full_name",
    email: "email",
    phone: "phone",
    dateOfBirth: "date_of_birth",
    yearsActive: "years_active",
    tagline: "tagline",
    location: "location",
    languages: "languages",
    responseTime: "response_time",
    pricing: "pricing",
    about: "about",
    photo: "photo_url",
    services: "services",
    regions: "regions",
    expertise: "expertise",
    experience: "experience",
    certifications: "certifications",
    referred: "referred",
    referralCode: "referral_code",
    profileType: "profile_type",
    licenseNumber: "license_number",
    certificates: "certificates",
    officePhotos: "office_photos",
    registeredAddress: "registered_address",
    website: "website",
    employeeCount: "employee_count",
    leadId: "lead_id",
    status: "status",
    isPublic: "is_public",
    isHandedOver: "is_handed_over",
    userId: "user_id",
    forcePasswordChange: "force_password_change",
    approvalTimestamp: "approval_timestamp",
    approvalNotes: "approval_notes",
    approvedBy: "approved_by",
  };

  return Object.fromEntries(
    Object.entries(keyMap)
      .filter(([source]) => Object.prototype.hasOwnProperty.call(updates, source))
      .map(([, target]) => [target, full[target]])
  );
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");
    let query = createSupabaseAdminClient()
      .from("profiles")
      .select("*");

    if (id) {
      const { data, error } = await query.eq("id", id).single();
      if (error) throw error;
      return NextResponse.json({ profile: mapSupabaseProfile(data) }, { status: 200 });
    }

    if (userId) {
      // Firebase UID equals the Supabase profile id (set during authenticate-profile flow)
      const { data, error } = await query.eq("id", userId).single();
      if (error && error.code !== "PGRST116") throw error;
      return NextResponse.json({ profile: data ? mapSupabaseProfile(data) : null }, { status: 200 });
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ profiles: (data || []).map(mapSupabaseProfile) }, { status: 200 });
  } catch (error) {
    console.error("Profiles fetch failed:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch profiles" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const supabase = createSupabaseAdminClient();

    if (!body.fullName || !body.username) {
      return NextResponse.json({ error: "Name and username are required" }, { status: 400 });
    }

    const profileData = cleanPayload({
      id: crypto.randomUUID(),
      ...mapProfileFormToSupabase(body),
      status: "approved",
      is_public: body.isPublic !== false,
      is_handed_over: false,
      generated_referral_code: generateReferralCode(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const { data, error } = await supabase
      .from("profiles")
      .insert(profileData)
      .select("*")
      .single();

    if (error) throw error;

    await supabase.from("expert_recurring_availability").upsert({
      expert_id: data.id,
      schedule: defaultExpertSchedule,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, profile: mapSupabaseProfile(data), id: data.id }, { status: 200 });
  } catch (error) {
    console.error("Profile creation failed:", error);
    return NextResponse.json({ error: error.message || "Failed to create profile" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, updates } = await request.json();
    if (!id || !updates || typeof updates !== "object") {
      return NextResponse.json({ error: "id and updates are required" }, { status: 400 });
    }

    const updatePayload = cleanPayload({
      ...mapPartialProfileUpdates(updates),
      updated_at: new Date().toISOString(),
    });

    const { data, error } = await createSupabaseAdminClient()
      .from("profiles")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, profile: mapSupabaseProfile(data) }, { status: 200 });
  } catch (error) {
    console.error("Profile update failed:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
