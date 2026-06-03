import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { mapProfileFormToSupabase, mapSupabaseProfile } from "@/lib/supabaseProfile";
import { sendProfileSubmissionEmails } from "@/app/utils/sendProfileSubmissionEmails";

const MISSING_PROFILE_REQUESTS = "Supabase table profile_requests is missing. Run scripts/supabase-complete-profile.sql first.";

const generateReferralCode = () => {
  const timestamp = Date.now().toString().slice(-4);
  const rand = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `REFX${timestamp}${rand}`;
};

const isMissingRelationError = (error) =>
  error?.code === "42P01" ||
  error?.code === "PGRST205" ||
  error?.message?.toLowerCase().includes("could not find the table") ||
  error?.message?.toLowerCase().includes("does not exist");

async function existsByColumn(supabase, table, column, value) {
  if (!value) return false;
  const { data, error } = await supabase.from(table).select("id").eq(column, value).limit(1);
  if (error) {
    if (table === "profile_requests" && isMissingRelationError(error)) return false;
    throw error;
  }
  return (data || []).length > 0;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const supabase = createSupabaseAdminClient();

    if (action === "profile") {
      const profileId = searchParams.get("profileId");
      if (!profileId) return NextResponse.json({ error: "profileId is required" }, { status: 400 });

      const { data, error } = await supabase.from("profiles").select("*").eq("id", profileId).single();
      if (error) throw error;
      return NextResponse.json({ profile: mapSupabaseProfile(data) }, { status: 200 });
    }

    if (action === "lead") {
      const phone = searchParams.get("phone");
      if (!phone) return NextResponse.json({ lead: null }, { status: 200 });

      const { data, error } = await supabase
        .from("join_queries")
        .select("*")
        .eq("phone", phone)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return NextResponse.json({ lead: data || null }, { status: 200 });
    }

    if (action === "username") {
      const username = searchParams.get("username");
      if (!username) return NextResponse.json({ available: false }, { status: 200 });

      const [inProfiles, inRequests] = await Promise.all([
        existsByColumn(supabase, "profiles", "username", username),
        existsByColumn(supabase, "profile_requests", "username", username),
      ]);

      return NextResponse.json({ available: !inProfiles && !inRequests }, { status: 200 });
    }

    if (action === "referral") {
      const code = searchParams.get("code");
      if (!code) return NextResponse.json({ referrer: null }, { status: 200 });

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, generated_referral_code")
        .eq("generated_referral_code", code)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return NextResponse.json({ referrer: mapSupabaseProfile(data) }, { status: 200 });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("Error in send-profile-form GET:", error);
    return NextResponse.json({ error: error.message || "Request failed" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      username,
      fullName,
      email,
      phone,
      referred,
      referralCode,
      profileId,
    } = body;

    if (!email || !fullName || !phone || (!profileId && !username)) {
      return NextResponse.json({ error: "Missing required fields: email, fullName, phone, username" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const profileData = mapProfileFormToSupabase(body);
    let savedProfileId = profileId;

    if (profileId) {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);

      if (error) throw error;
    } else {
      if (!["Yes", "No"].includes(referred)) throw new Error("Referred must be 'Yes' or 'No'");
      if (!/^[a-zA-Z][a-zA-Z0-9_]{2,19}$/.test(username)) {
        throw new Error("Username must be 3-20 characters, start with a letter, and contain only letters, numbers, or underscores");
      }

      const [usernameInProfiles, usernameInRequests, emailInProfiles] = await Promise.all([
        existsByColumn(supabase, "profiles", "username", username),
        existsByColumn(supabase, "profile_requests", "username", username),
        existsByColumn(supabase, "profiles", "email", email),
      ]);

      if (usernameInProfiles || usernameInRequests) throw new Error("Username is already taken");
      if (emailInProfiles) throw new Error("User already exists. No duplicate profile allowed.");

      if (referred === "Yes") {
        if (!referralCode) throw new Error("Referral code is required when referred is 'Yes'");
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("generated_referral_code", referralCode)
          .limit(1);
        if (error) throw error;
        if (!data?.length) throw new Error("Invalid referral code");
      }

      const { data, error } = await supabase
        .from("profile_requests")
        .insert({
          ...profileData,
          generated_referral_code: generateReferralCode(),
        })
        .select("id")
        .single();

      if (error) {
        if (isMissingRelationError(error)) throw new Error(MISSING_PROFILE_REQUESTS);
        throw error;
      }
      savedProfileId = data.id;
    }

    await sendProfileSubmissionEmails({
      ...body,
      profileId: savedProfileId,
    });

    const slug = `${(username || "").toLowerCase().replace(/\s+/g, "-")}`;

    return NextResponse.json({ success: true, profileId: savedProfileId, slug }, { status: 200 });
  } catch (error) {
    console.error("Error in send-profile-form:", error.message, error.stack);
    return NextResponse.json(
      { error: error.message || "Failed to process profile submission" },
      { status: 500 }
    );
  }
}
