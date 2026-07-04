import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET(request) {
  try {
    const supabase = createSupabaseAdminClient();

    // Fetch all withdrawal requests with expert profile details
    const { data: withdrawals, error: fetchErr } = await supabase
      .from("withdrawal_requests")
      .select("*, profiles:expert_id(full_name, email, phone)")
      .order("created_at", { ascending: false });

    if (fetchErr) {
      console.error("Database fetch of withdrawals failed:", fetchErr);
      return NextResponse.json({ error: "Failed to fetch withdrawal requests" }, { status: 500 });
    }

    return NextResponse.json({ withdrawals: withdrawals || [] }, { status: 200 });
  } catch (error) {
    console.error("Admin withdrawals GET error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { requestId, status, adminFeedback } = await request.json();

    if (!requestId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // 1. Fetch the withdrawal request details
    const { data: withdrawRequest, error: fetchErr } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchErr || !withdrawRequest) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }

    if (withdrawRequest.status !== "pending") {
      return NextResponse.json({ error: "This request has already been processed" }, { status: 400 });
    }

    const expertId = withdrawRequest.expert_id;
    const amount = parseFloat(withdrawRequest.amount);

    if (status === "approved") {
      // 2. Approve: update withdrawal request status
      const { error: updateErr } = await supabase
        .from("withdrawal_requests")
        .update({
          status: "approved",
          admin_feedback: adminFeedback || "Approved by Admin",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateErr) throw updateErr;

      // Update the pending wallet transaction status to success
      const { error: txErr } = await supabase
        .from("wallet_transactions")
        .update({ status: "success", description: "Withdrawal request completed successfully" })
        .eq("reference_id", requestId)
        .eq("transaction_type", "debit");

      if (txErr) console.error("Failed to update wallet transaction status to success:", txErr.message);

      return NextResponse.json({ success: true, message: "Withdrawal request approved successfully" }, { status: 200 });
    } else {
      // 3. Reject: refund the money back to the expert's wallet
      const { error: updateErr } = await supabase
        .from("withdrawal_requests")
        .update({
          status: "rejected",
          admin_feedback: adminFeedback || "Rejected by Admin",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateErr) throw updateErr;

      // Get expert's wallet
      const { data: wallet, error: walletErr } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", expertId)
        .single();

      if (walletErr) throw walletErr;

      // Refund the balance
      const refundedBalance = parseFloat(wallet.balance) + amount;
      const { error: refundErr } = await supabase
        .from("wallets")
        .update({ balance: refundedBalance, updated_at: new Date().toISOString() })
        .eq("id", wallet.id);

      if (refundErr) throw refundErr;

      // Update the pending wallet transaction status to failed (or record refund transaction)
      const { error: txErr } = await supabase
        .from("wallet_transactions")
        .update({ status: "failed", description: `Withdrawal request rejected: ${adminFeedback || "Rejected by Admin"}` })
        .eq("reference_id", requestId)
        .eq("transaction_type", "debit");

      if (txErr) console.error("Failed to update wallet transaction status to failed:", txErr.message);

      // Add a credit transaction detailing the refund
      const { error: refundTxErr } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          amount: amount,
          transaction_type: "credit",
          status: "success",
          description: `Refunded withdrawal request rejection: ${adminFeedback || "Rejected by Admin"}`,
          reference_id: requestId,
        });

      if (refundTxErr) console.error("Failed to insert refund transaction:", refundTxErr.message);

      return NextResponse.json({ success: true, message: "Withdrawal request rejected. Funds refunded to expert wallet." }, { status: 200 });
    }
  } catch (error) {
    console.error("Admin withdrawals PATCH error:", error.message);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
