import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { targets, question, suggestedAnswer } = await request.json();

    if (!Array.isArray(targets) || targets.length === 0) {
      return NextResponse.json({ error: "At least one target profile is required." }, { status: 400 });
    }
    if (!question?.trim() || !suggestedAnswer?.trim()) {
      return NextResponse.json({ error: "Question and answer are required." }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const rows = targets.map((profile) => ({
      service_type: "admin_prompt",
      source: "admin",
      expert_id: profile.id,
      expert_name: profile.fullName || profile.full_name || "Unknown",
      user_name: "Admin",
      user_email: "admin@xmytravel.com",
      status: "admin_prompt",
      form_data: {
        question,
        suggestedAnswer,
        isAdminPrompt: true,
      },
    }));

    const { error } = await supabase.from("leads").insert(rows);
    if (error) throw error;

    return NextResponse.json({ success: true, count: rows.length }, { status: 200 });
  } catch (error) {
    console.error("Admin prompt persistence failed:", error);
    return NextResponse.json({ error: error.message || "Failed to save admin prompt" }, { status: 500 });
  }
}
