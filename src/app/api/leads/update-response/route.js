import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const allowedStatuses = new Set([
  "pending",
  "accepted",
  "clarification_requested",
  "answered",
  "admin_prompt",
  "escalated",
]);

const supabaseAdmin = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase server configuration missing");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

export async function POST(request) {
  try {
    const {
      leadId,
      reply,
      status,
      expertName,
    } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: "Missing required field: leadId" },
        { status: 400 }
      );
    }

    const updates = {};

    if (typeof reply === "string") {
      if (!reply.trim()) {
        return NextResponse.json(
          { error: "Reply cannot be empty" },
          { status: 400 }
        );
      }
      updates.reply = reply;
      updates.replied_at = new Date().toISOString();
    }

    if (status) {
      if (!allowedStatuses.has(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    if (expertName) {
      updates.expert_name = expertName;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No lead updates provided" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin()
      .from("leads")
      .update(updates)
      .eq("id", leadId)
      .select("id, reply, status, replied_at, expert_name")
      .single();

    if (error) {
      console.error("Supabase lead update failed:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update lead" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Lead not found or no row was updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, lead: data }, { status: 200 });
  } catch (error) {
    console.error("Error updating lead response:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to update lead response" },
      { status: 500 }
    );
  }
}
