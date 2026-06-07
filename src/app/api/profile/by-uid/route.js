import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");
    const email = searchParams.get("email");

    if (!uid) {
      return NextResponse.json({ error: "uid is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    let profile = null;

    // 1. Try by id = uid
    const { data: resId, error: errId } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();

    if (resId && !errId) {
      profile = resId;
    }

    // 2. Try by user_id = uid
    if (!profile) {
      const { data: resUserId, error: errUserId } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();
      if (resUserId && !errUserId) {
        profile = resUserId;
      }
    }

    // 3. Try by email
    if (!profile && email) {
      const { data: resEmail, error: errEmail } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", email.trim())
        .maybeSingle();
      if (resEmail && !errEmail) {
        profile = resEmail;
      }
    }

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("Error fetching profile by UID/email in API:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { profileId, payload } = body;

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Fetch actual columns in the profiles table to dynamically filter out any unsupported/missing columns
    const { data: colSample, error: colError } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    let filteredPayload = { ...payload };
    if (!colError && colSample && colSample.length > 0) {
      const allowedColumns = new Set(Object.keys(colSample[0]));
      filteredPayload = {};
      for (const key of Object.keys(payload)) {
        if (allowedColumns.has(key)) {
          filteredPayload[key] = payload[key];
        }
      }
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(filteredPayload)
      .eq("id", profileId)
      .select()
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ success: true, profile: data }, { status: 200 });
  } catch (error) {
    console.error("Error updating profile by UID in API:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
