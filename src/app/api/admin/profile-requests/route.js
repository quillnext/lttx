import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { mapSupabaseProfile } from "@/lib/supabaseProfile";

export async function GET() {
  try {
    const { data, error } = await createSupabaseAdminClient()
      .from("profile_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ requests: (data || []).map(mapSupabaseProfile) }, { status: 200 });
  } catch (error) {
    console.error("Profile requests fetch failed:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch profile requests" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    const { error } = await createSupabaseAdminClient()
      .from("profile_requests")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Profile request delete failed:", error);
    return NextResponse.json({ error: error.message || "Failed to delete profile request" }, { status: 500 });
  }
}
