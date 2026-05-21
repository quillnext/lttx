import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const expertId = searchParams.get("expertId");
    const userEmail = searchParams.get("userEmail");

    let query = createSupabaseAdminClient()
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (expertId) {
      query = query.eq("expert_id", expertId);
    }

    if (userEmail) {
      query = query.eq("user_email", userEmail);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase leads fetch failed:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch leads" },
        { status: 500 }
      );
    }

    return NextResponse.json({ leads: data || [] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required query parameter: id" },
        { status: 400 }
      );
    }

    const { error } = await createSupabaseAdminClient()
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase lead delete failed:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete lead" },
      { status: 500 }
    );
  }
}
