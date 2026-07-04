import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const expertId = searchParams.get("expertId");

    if (!expertId) {
      return NextResponse.json({ error: "Expert ID is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data: bankDetails, error: fetchErr } = await supabase
      .from("expert_bank_details")
      .select("*")
      .eq("expert_id", expertId)
      .maybeSingle();

    if (fetchErr) {
      console.error("Database bank details fetch failed:", fetchErr);
      return NextResponse.json({ error: "Failed to fetch bank details" }, { status: 500 });
    }

    return NextResponse.json({ bankDetails: bankDetails || null }, { status: 200 });
  } catch (error) {
    console.error("Expert bank details GET error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { expertId, bankName, accountHolderName, accountNumber, ifscCode } = await request.json();

    if (!expertId || !bankName || !accountHolderName || !accountNumber || !ifscCode) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data: upsertedDetails, error: upsertErr } = await supabase
      .from("expert_bank_details")
      .upsert({
        expert_id: expertId,
        bank_name: bankName,
        account_holder_name: accountHolderName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        updated_at: new Date().toISOString(),
      }, { onConflict: "expert_id" })
      .select()
      .single();

    if (upsertErr) {
      console.error("Database bank details upsert failed:", upsertErr);
      return NextResponse.json({ error: "Failed to save bank details" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      bankDetails: upsertedDetails,
      message: "Bank details saved successfully",
    }, { status: 200 });
  } catch (error) {
    console.error("Expert bank details POST error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
