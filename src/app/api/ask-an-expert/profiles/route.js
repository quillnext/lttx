import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { mapSupabaseProfile } from "@/lib/supabaseProfile";

const PAGE_SIZE_LIMIT = 60;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams
      .get("ids")
      ?.split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    const from = Math.max(0, Number(searchParams.get("from") || 0));
    const requestedTo = Number(searchParams.get("to") || from + 29);
    const to = Math.min(requestedTo, from + PAGE_SIZE_LIMIT - 1);

    let query = createSupabaseAdminClient()
      .from("profiles")
      .select("*")
      .eq("is_public", true);

    if (ids?.length) {
      query = query.in("id", ids);
    } else {
      query = query.order("created_at", { ascending: false }).range(from, to);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(
      {
        experts: (data || []).map(mapSupabaseProfile),
        hasMore: !ids?.length && (data || []).length === to - from + 1,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ask an expert profiles fetch failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch experts" },
      { status: 500 }
    );
  }
}
