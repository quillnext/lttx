import { sendApprovalNotificationEmail } from "@/app/utils/sendApprovalNotificationEmail";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { defaultExpertSchedule, mapSupabaseProfile } from "@/lib/supabaseProfile";
import { NextResponse } from "next/server";

function generatePassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  return password;
}

async function findAuthUserByEmail(supabase, email) {
  const normalizedEmail = email.trim().toLowerCase();
  let page = 1;
  const perPage = 1000;

  while (page < 50) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) throw error;

    const user = data?.users?.find((item) => item.email?.toLowerCase() === normalizedEmail);
    if (user) return user;

    if (!data?.users?.length || data.users.length < perPage) return null;
    page += 1;
  }

  return null;
}

const isAlreadyRegisteredError = (error) => {
  const message = error?.message?.toLowerCase() || "";
  return message.includes("already registered") || message.includes("already been registered");
};

const getMissingColumn = (error) => {
  const message = error?.message || "";
  return message.match(/Could not find the '([^']+)' column/)?.[1] || null;
};

async function upsertProfileWithSchemaFallback(supabase, payload) {
  const workingPayload = { ...payload };

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { data, error } = await supabase
      .from("profiles")
      .upsert(workingPayload)
      .select("*")
      .single();

    if (!error) return data;

    const missingColumn = getMissingColumn(error);
    if (!missingColumn || !Object.prototype.hasOwnProperty.call(workingPayload, missingColumn)) {
      throw error;
    }

    console.warn(`profiles.${missingColumn} is missing in Supabase schema cache; approving without that optional field.`);
    delete workingPayload[missingColumn];
  }

  throw new Error("Could not approve profile because too many profile columns are missing.");
}

export async function POST(req) {
  try {
    const { profileId } = await req.json();
    if (!profileId) {
      return NextResponse.json({ error: "Missing required profileId" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: requestProfile, error: requestError } = await supabase
      .from("profile_requests")
      .select("*")
      .eq("id", profileId)
      .single();

    if (requestError) throw requestError;
    if (!requestProfile) {
      return NextResponse.json({ error: "Profile request not found" }, { status: 404 });
    }

    const profile = mapSupabaseProfile(requestProfile);
    const missingFields = ["email", "fullName", "username", "phone"].filter((field) => !profile[field]);
    if (missingFields.length) {
      return NextResponse.json(
        { error: `Profile request is missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    let password = generatePassword();
    let authUser = null;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: profile.email,
      password,
      email_confirm: false,
      user_metadata: {
        name: profile.fullName,
        phone: profile.phone,
        role: "expert",
      },
    });

    if (authError && !isAlreadyRegisteredError(authError)) {
      throw authError;
    }

    if (authError && isAlreadyRegisteredError(authError)) {
      authUser = await findAuthUserByEmail(supabase, profile.email);
      password = null;
    } else {
      authUser = authData?.user || null;
    }

    const authUserId = authUser?.id || requestProfile.user_id || null;
    const finalProfileData = {
      ...requestProfile,
      id: authUserId || requestProfile.id,
      status: "approved",
      is_public: true,
      is_handed_over: true,
      user_id: authUserId,
      force_password_change: true,
      approval_timestamp: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    delete finalProfileData.created_at;

    const approvedProfile = await upsertProfileWithSchemaFallback(supabase, finalProfileData);

    const { error: availabilityError } = await supabase.from("expert_recurring_availability").upsert({
      expert_id: approvedProfile.id,
      schedule: defaultExpertSchedule,
      updated_at: new Date().toISOString(),
    });
    if (availabilityError) {
      console.warn("Default availability was not saved:", availabilityError.message);
    }

    const { error: deleteError } = await supabase
      .from("profile_requests")
      .delete()
      .eq("id", profileId);

    if (deleteError) throw deleteError;

    const slug = profile.username.toLowerCase().replace(/\s+/g, "-");
    await sendApprovalNotificationEmail({
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      slug,
      generatedReferralCode: profile.generatedReferralCode || requestProfile.generated_referral_code || "N/A",
      username: profile.username,
      profileType: profile.profileType || requestProfile.profile_type || "expert",
      password,
    });

    return NextResponse.json({ success: true, newProfileId: approvedProfile.id }, { status: 200 });
  } catch (error) {
    console.error("Error in profile approval:", error.message, error.stack);
    return NextResponse.json({ error: error.message || "Failed to approve profile" }, { status: 500 });
  }
}
