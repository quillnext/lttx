import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const exclude = (searchParams.get("exclude") || "").trim().toLowerCase();
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 5), 1), 20);

    const { data, error } = await createSupabaseAdminClient()
      .from("recent_searches")
      .select("query")
      .order("timestamp", { ascending: false })
      .limit(limit * 3);

    if (error) throw error;

    const seen = new Set();
    const searches = (data || [])
      .map((row) => row.query)
      .filter(Boolean)
      .filter((query) => query !== exclude)
      .filter((query) => {
        if (seen.has(query)) return false;
        seen.add(query);
        return true;
      })
      .slice(0, limit);

    return NextResponse.json({ searches }, { status: 200 });
  } catch (error) {
    console.error("Recent searches fetch failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch recent searches" },
      { status: 500 }
    );
  }
}
