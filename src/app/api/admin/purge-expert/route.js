import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { uid, secret } = await request.json();

    if (secret !== process.env.NEXT_PUBLIC_ADMIN_PASS) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!uid) {
      return NextResponse.json({ error: "UID is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("photo_url, certificates, office_photos, user_id")
      .eq("id", uid)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (profile?.user_id) {
      const { error: authError } = await supabase.auth.admin.deleteUser(profile.user_id);
      if (authError) console.warn("Supabase auth user delete skipped:", authError.message);
    }

    await supabase.from("expert_recurring_availability").delete().eq("expert_id", uid);

    const { error: deleteError } = await supabase.from("profiles").delete().eq("id", uid);
    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: "Expert purged from Supabase.",
      storagePaths: {
        photo: profile?.photo_url || null,
        certificates: profile?.certificates || [],
        officePhotos: profile?.office_photos || [],
      },
    });
  } catch (error) {
    console.error("Purge Error:", error);
    return NextResponse.json({ error: error.message || "Failed to purge expert" }, { status: 500 });
  }
}
