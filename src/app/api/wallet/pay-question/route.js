import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { resolveOrCreateProfileId } from "@/lib/walletHelper";

export async function POST(request) {
  let supabase;
  try {
    const { userId, expertId, questionPrice, questionId } = await request.json();

    if (!userId || !expertId || !questionPrice || !questionId) {
      return NextResponse.json(
        { error: "userId, expertId, questionPrice, and questionId are required" },
        { status: 400 }
      );
    }

    const price = parseFloat(questionPrice);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: "Invalid price amount" }, { status: 400 });
    }

    supabase = createSupabaseAdminClient();
    const targetUserId = await resolveOrCreateProfileId(supabase, userId);
    const targetExpertId = await resolveOrCreateProfileId(supabase, expertId);

    // 1. Fetch user wallet and check balance
    const { data: userWallet, error: userWalletError } = await supabase
      .from("wallets")
      .select("id, balance")
      .eq("profile_id", targetUserId)
      .maybeSingle();

    if (userWalletError || !userWallet) {
      return NextResponse.json({ error: "User wallet not found" }, { status: 404 });
    }

    if (parseFloat(userWallet.balance) < price) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    // 2. Fetch expert wallet
    let { data: expertWallet, error: expertWalletError } = await supabase
      .from("wallets")
      .select("id")
      .eq("profile_id", targetExpertId)
      .maybeSingle();

    if (!expertWallet) {
      // Create expert wallet if not exists
      const { data: newExpertWallet, error: createError } = await supabase
        .from("wallets")
        .insert({ profile_id: targetExpertId, balance: 0.00, currency: "INR" })
        .select("id")
        .maybeSingle();

      if (createError) {
        console.error("Error creating expert wallet:", createError);
        return NextResponse.json({ error: "Failed to initialize expert wallet" }, { status: 500 });
      }
      expertWallet = newExpertWallet;
    }

    // 3. Create transactions
    // User debit (completed immediately)
    const { error: userTxError } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: userWallet.id,
        amount: -price,
        type: "payment",
        status: "completed",
        reference_id: questionId,
        description: `Paid for Question #${questionId}`,
        idempotency_key: `pay_user_${questionId}`,
      });

    if (userTxError) {
      console.error("Error debiting user wallet:", userTxError);
      return NextResponse.json({ error: "Failed to process payment debit" }, { status: 500 });
    }

    // Expert credit (pending escrow until answered)
    const { error: expertTxError } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: expertWallet.id,
        amount: price,
        type: "question_earnings",
        status: "pending",
        reference_id: questionId,
        description: `Earnings for Question #${questionId} (Pending Reply)`,
        idempotency_key: `earn_expert_${questionId}`,
      });

    if (expertTxError) {
      console.warn("Failed to create pending expert transaction:", expertTxError);
    }

    return NextResponse.json({ success: true, message: "Payment processed successfully" });
  } catch (error) {
    console.error("Pay question API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process question payment." },
      { status: 500 }
    );
  }
}
