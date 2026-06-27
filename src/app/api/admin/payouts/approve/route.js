import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { requestId, status, adminNotes } = await request.json();

    if (!requestId || !status) {
      return NextResponse.json(
        { error: "requestId and status ('completed' or 'rejected') are required" },
        { status: 400 }
      );
    }

    if (status !== "completed" && status !== "rejected") {
      return NextResponse.json(
        { error: "Invalid status. Must be 'completed' or 'rejected'" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // 1. Fetch withdrawal request
    const { data: wrRequest, error: fetchError } = await supabase
      .from("withdrawal_requests")
      .select("*, bank_details(*)")
      .eq("id", requestId)
      .maybeSingle();

    if (fetchError || !wrRequest) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }

    if (wrRequest.status !== "pending") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 }
      );
    }

    if (status === "completed") {
      // Execute Razorpay Payout or log manual transaction
      const payoutId = `pay_out_${Date.now()}`;
      
      // Update withdrawal request to completed
      const { error: updateError } = await supabase
        .from("withdrawal_requests")
        .update({
          status: "completed",
          payout_id: payoutId,
          admin_notes: adminNotes || "Approved and disbursed.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        success: true,
        message: "Payout completed and recorded successfully.",
        payoutId,
      });

    } else if (status === "rejected") {
      // 1. Update withdrawal request status to rejected
      const { error: updateError } = await supabase
        .from("withdrawal_requests")
        .update({
          status: "rejected",
          admin_notes: adminNotes || "Request rejected by administrator.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateError) {
        throw updateError;
      }

      // 2. Fetch User's Wallet to perform rollback refund
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("id")
        .eq("profile_id", wrRequest.profile_id)
        .maybeSingle();

      if (walletError || !wallet) {
        return NextResponse.json(
          { error: "Withdrawal marked rejected but wallet refund failed (wallet not found)" },
          { status: 500 }
        );
      }

      // 3. Rollback the debit by inserting a positive refund transaction
      const { error: rollbackError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          amount: parseFloat(wrRequest.amount),
          type: "payout_refund",
          status: "completed",
          reference_id: `ref_${requestId}`,
          description: `Refund: Rejected withdrawal request #${requestId}`,
          idempotency_key: `refund_${requestId}`,
        });

      if (rollbackError) {
        console.error("Critical: Failed to insert rollback refund transaction:", rollbackError);
        return NextResponse.json(
          { error: "Withdrawal marked rejected but wallet refund transaction failed" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Payout rejected and funds successfully refunded to user's wallet.",
      });
    }

  } catch (error) {
    console.error("Admin payouts api error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process payout decision." },
      { status: 500 }
    );
  }
}
