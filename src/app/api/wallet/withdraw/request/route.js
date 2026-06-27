import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { resolveOrCreateProfileId } from "@/lib/walletHelper";

export async function POST(request) {
  try {
    const { profileId, amount, bankDetailsId, userEmail } = await request.json();

    if (!profileId || !amount || !bankDetailsId) {
      return NextResponse.json(
        { error: "profileId, amount, and bankDetailsId are required" },
        { status: 400 }
      );
    }

    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount < 100.00) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is Rs. 100.00" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const targetProfileId = await resolveOrCreateProfileId(supabase, profileId, userEmail);

    // 1. Verify Bank Details belong to the user and are verified
    const { data: bankDetails, error: bankError } = await supabase
      .from("bank_details")
      .select("id, verification_status")
      .eq("id", bankDetailsId)
      .eq("profile_id", targetProfileId)
      .maybeSingle();

    if (bankError || !bankDetails) {
      return NextResponse.json(
        { error: "Valid bank details not found for this profile" },
        { status: 404 }
      );
    }

    if (bankDetails.verification_status !== "verified") {
      return NextResponse.json(
        { error: "Cannot request withdrawal. Bank details are not verified." },
        { status: 400 }
      );
    }

    // 2. Lock and Check Wallet Balance
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id, balance")
      .eq("profile_id", targetProfileId)
      .maybeSingle();

    if (walletError || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    if (parseFloat(wallet.balance) < withdrawalAmount) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    const referenceId = `wd_${Date.now()}`;

    // 3. Insert transaction (debit immediately) and create withdrawal request
    const { error: txError } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        amount: -withdrawalAmount,
        type: "withdrawal",
        status: "completed",
        reference_id: referenceId,
        description: `Withdrawal request of Rs. ${withdrawalAmount}`,
        idempotency_key: referenceId,
      });

    if (txError) {
      console.error("Error debiting wallet for withdrawal:", txError);
      return NextResponse.json({ error: "Failed to deduct funds for withdrawal" }, { status: 500 });
    }

    const { data: withdrawalRequest, error: requestError } = await supabase
      .from("withdrawal_requests")
      .insert({
        profile_id: targetProfileId,
        amount: withdrawalAmount,
        bank_details_id: bankDetailsId,
        status: "pending",
        payout_id: referenceId,
      })
      .select()
      .maybeSingle();

    if (requestError) {
      console.error("Error creating withdrawal request log:", requestError);
      // Attempt rollback transaction (re-credit)
      await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          amount: withdrawalAmount,
          type: "payout_refund",
          status: "completed",
          reference_id: `rb_${referenceId}`,
          description: `Rollback: Failed withdrawal request registration`,
        });

      return NextResponse.json({ error: "Failed to create withdrawal request log" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      withdrawalRequest,
    });
  } catch (error) {
    console.error("Withdrawal request API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process withdrawal request." },
      { status: 500 }
    );
  }
}
