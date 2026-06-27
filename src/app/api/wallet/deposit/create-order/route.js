import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { resolveOrCreateProfileId } from "@/lib/walletHelper";

export async function POST(request) {
  try {
    const { amount, currency, profileId, userEmail } = await request.json();

    if (!amount || !profileId) {
      return NextResponse.json({ error: "Amount and profileId are required" }, { status: 400 });
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount < 100) {
      return NextResponse.json({ error: "Minimum deposit amount is Rs. 100.00" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials are not configured" },
        { status: 500 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // Resolve or auto-provision valid profile ID in profiles table
    const targetProfileId = await resolveOrCreateProfileId(supabase, profileId, userEmail);

    // 1. Ensure wallet exists
    let { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id")
      .eq("profile_id", targetProfileId)
      .maybeSingle();

    if (!wallet) {
      // Create wallet if it doesn't exist
      const { data: newWallet, error: createError } = await supabase
        .from("wallets")
        .insert({ profile_id: targetProfileId, balance: 0.00, currency: currency || "INR" })
        .select("id")
        .maybeSingle();

      if (createError) {
        console.error("Error creating wallet:", createError);
        return NextResponse.json({ error: "Failed to initialize wallet" }, { status: 500 });
      }
      wallet = newWallet;
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const receiptId = `dep_${Date.now()}`;
    const options = {
      amount: Math.round(amount * 100), // amount in paisa
      currency: currency || "INR",
      receipt: receiptId,
    };

    const order = await instance.orders.create(options);

    // 2. Insert a pending wallet transaction
    const { error: txError } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        amount: amount,
        type: "deposit",
        status: "pending",
        reference_id: order.id,
        description: `Deposit via Razorpay (Order: ${order.id})`,
        idempotency_key: order.id,
      });

    if (txError) {
      console.error("Error creating wallet transaction:", txError);
      return NextResponse.json({ error: "Failed to log transaction" }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error) {
    console.error("Deposit order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create deposit order." },
      { status: 500 }
    );
  }
}
