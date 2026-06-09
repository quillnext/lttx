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
      expert_id: profile.id,
      expert_name: profile.fullName || profile.full_name || "Unknown",
      expert_email: profile.email || "",
      user_name: "Admin",
      user_email: "admin@xmytravel.com",
      status: "admin_prompt",
      question,
      suggested_answer: suggestedAnswer,
      is_admin_prompt: true,
      is_public: false,
    }));

    const { error } = await supabase.from("questions").insert(rows);
    if (error) throw error;

    return NextResponse.json({ success: true, count: rows.length }, { status: 200 });
  } catch (error) {
    console.error("Admin prompt persistence failed:", error);
    return NextResponse.json({ error: error.message || "Failed to save admin prompt" }, { status: 500 });
  }
}
