import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { razorpay_order_id, reason } = await request.json();

    if (!razorpay_order_id) {
      return NextResponse.json({ error: "razorpay_order_id is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Update the transaction status from pending to failed/cancelled
    const { data: updatedTx, error: updateError } = await supabase
      .from("wallet_transactions")
      .update({
        status: "failed",
        description: reason || "Payment cancelled or dismissed by user",
        updated_at: new Date().toISOString(),
      })
      .eq("reference_id", razorpay_order_id)
      .eq("status", "pending")
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Error cancelling transaction status:", updateError);
      return NextResponse.json({ error: "Database error during cancellation" }, { status: 500 });
    }

    return NextResponse.json({ success: true, transaction: updatedTx });
  } catch (error) {
    console.error("Deposit cancellation error:", error);
    return NextResponse.json(
      { error: "Failed to process cancellation." },
      { status: 500 }
    );
  }
}
