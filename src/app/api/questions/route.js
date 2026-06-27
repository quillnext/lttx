import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const expertId = searchParams.get("expertId");
    const id = searchParams.get("id");

    const supabase = createSupabaseAdminClient();

    let query = supabase.from("questions").select("*");

    if (id) {
      query = query.eq("id", id).single();
    } else if (expertId) {
      query = query.eq("expert_id", expertId).order("created_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase questions fetch failed:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch questions" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { questions: id ? (data ? [data] : []) : (data || []) },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("questions")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("Supabase question creation failed:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create question" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, question: data }, { status: 200 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create question" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { id, updates } = await request.json();

    if (!id || !updates) {
      return NextResponse.json(
        { error: "Missing required fields: id or updates" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("questions")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase question update failed:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update question" },
        { status: 500 }
      );
    }

    // If the question is being answered/replied, release the pending payment in the wallet system
    if (updates && (updates.reply || updates.status === "replied")) {
      try {
        await supabase
          .from("wallet_transactions")
          .update({ status: "completed", updated_at: new Date().toISOString() })
          .eq("reference_id", id)
          .eq("type", "question_earnings")
          .eq("status", "pending");
      } catch (walletErr) {
        console.error("Failed to release expert earnings on question reply:", walletErr);
      }
    }

    return NextResponse.json({ success: true, question: data?.[0] }, { status: 200 });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update question" },
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

    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase question delete failed:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete question" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete question" },
      { status: 500 }
    );
  }
}
