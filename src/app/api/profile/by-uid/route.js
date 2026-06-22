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

    // 4. Try from Firestore/Firebase Auth, and sync if found
    if (!profile) {
      try {
        const { initializeApp, getApps, cert } = await import("firebase-admin/app");
        const { getFirestore } = await import("firebase-admin/firestore");
        const { getAuth } = await import("firebase-admin/auth");

        if (!getApps().length) {
          const parsedCert = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
          initializeApp({
            credential: cert(parsedCert),
          });
        }

        const firestoreDb = getFirestore();
        const firebaseAuth = getAuth();

        const firestoreRef = firestoreDb.collection("Profiles").doc(uid);
        const firestoreSnap = await firestoreRef.get();

        let firestoreData = null;
        if (firestoreSnap.exists === true || (firestoreSnap.exists && typeof firestoreSnap.exists !== "function")) {
          firestoreData = firestoreSnap.data();
        } else if (typeof firestoreSnap.exists === "function" && firestoreSnap.exists()) {
          firestoreData = firestoreSnap.data();
        }

        const { mapProfileFormToSupabase, defaultExpertSchedule } = await import("@/lib/supabaseProfile");

        if (firestoreData) {
          console.log("Found profile in Firestore. Syncing to Supabase:", firestoreData);
          const mappedPayload = mapProfileFormToSupabase({
            fullName: firestoreData.fullName || firestoreData.name || "",
            username: firestoreData.username || `user_${uid.substring(0, 5)}`,
            email: firestoreData.email || email || "",
            phone: firestoreData.phone || "",
            photo: firestoreData.photo || "",
            location: firestoreData.location || "",
            languages: firestoreData.languages || [],
            responseTime: firestoreData.responseTime || "in 20 mins",
            pricing: firestoreData.pricing || "Rs 799/session",
            about: firestoreData.about || "",
            services: firestoreData.services || [],
            regions: firestoreData.regions || [],
            expertise: firestoreData.expertise || [],
            experience: firestoreData.experience || [],
            certifications: firestoreData.certifications || [],
            referred: firestoreData.referred || "No",
            referralCode: firestoreData.referralCode || "",
            profileType: firestoreData.profileType || "expert",
          });

          const { data: insertedData, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: uid,
              user_id: uid,
              status: "approved",
              is_public: true,
              is_handed_over: true,
              force_password_change: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...mappedPayload,
            })
            .select()
            .maybeSingle();

          if (insertError) {
            console.error("Failed to sync Firestore profile to Supabase:", insertError);
          } else if (insertedData) {
            console.log("Successfully synced profile to Supabase:", insertedData);
            profile = insertedData;

            await supabase.from("expert_recurring_availability").upsert({
              expert_id: uid,
              schedule: defaultExpertSchedule,
              updated_at: new Date().toISOString(),
            });
          }
        } else {
          // If not in Firestore, try querying Firebase Auth using the Admin SDK
          try {
            const userRecord = await firebaseAuth.getUser(uid);
            console.log("User found in Firebase Auth. Auto-provisioning skeleton profile:", userRecord.email);

            const defaultUsername = `user_${uid.substring(0, 5)}`;
            const mappedPayload = mapProfileFormToSupabase({
              fullName: userRecord.displayName || "",
              username: defaultUsername,
              email: userRecord.email || email || "",
              profileType: "expert",
            });

            const { data: insertedData, error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: uid,
                user_id: uid,
                status: "approved",
                is_public: true,
                is_handed_over: true,
                force_password_change: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                ...mappedPayload,
              })
              .select()
              .maybeSingle();

            if (insertError) {
              console.error("Failed to auto-provision skeleton profile in Supabase:", insertError);
            } else if (insertedData) {
              console.log("Successfully auto-provisioned skeleton profile in Supabase:", insertedData);
              profile = insertedData;

              await supabase.from("expert_recurring_availability").upsert({
                expert_id: uid,
                schedule: defaultExpertSchedule,
                updated_at: new Date().toISOString(),
              });
            }
          } catch (authErr) {
            console.error("Error retrieving user from Firebase Auth:", authErr);
          }
        }
      } catch (firestoreErr) {
        console.error("Error in Firestore/Firebase fallback sync flow:", firestoreErr);
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
