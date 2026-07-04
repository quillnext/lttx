import { NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const {
      userId,
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json();

    if (!userId || !amount || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required fields for wallet load" }, { status: 400 });
    }

    const amountNumeric = parseFloat(amount);
    if (isNaN(amountNumeric) || amountNumeric <= 0) {
      return NextResponse.json({ error: "Invalid amount value" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay credentials not configured" }, { status: 500 });
    }

    // 1. Verify Razorpay Signature
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // 2. Fetch User's Wallet (or create if it doesn't exist)
    let { data: wallet, error: walletErr } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (walletErr) throw walletErr;

    if (!wallet) {
      // Check if profile exists. If not, create it first.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        const { data: authData, error: authErr } = await supabase.auth.admin.getUserById(userId);
        if (authErr || !authData?.user) {
          throw new Error(authErr?.message || "User not found in auth.users");
        }
        const user = authData.user;
        const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
        const phone = user.phone || user.user_metadata?.phone || "0000000000";

        const { error: createProfileErr } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            email: user.email,
            full_name: name,
            name: name,
            phone: phone,
            role: user.user_metadata?.role || "user",
            status: "approved",
            is_public: false
          });
        if (createProfileErr) throw createProfileErr;
      }

      const { data: newWallet, error: createErr } = await supabase
        .from("wallets")
        .insert({ user_id: userId, balance: 0.00 })
        .select()
        .single();
      if (createErr) throw createErr;
      wallet = newWallet;
    }

    // 3. Update Wallet Balance
    const newBalance = parseFloat(wallet.balance) + amountNumeric;
    const { error: balanceUpdateErr } = await supabase
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    if (balanceUpdateErr) throw balanceUpdateErr;

    // 4. Record Wallet Credit Transaction
    const { error: txErr } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        amount: amountNumeric,
        transaction_type: "credit",
        status: "success",
        description: "Recharged wallet via online payment",
        reference_id: razorpay_payment_id,
      });

    if (txErr) {
      console.error("Failed to record credit transaction:", txErr.message);
    }

    return NextResponse.json({
      success: true,
      balance: newBalance,
      message: `₹${amountNumeric.toFixed(2)} successfully added to wallet.`,
    }, { status: 200 });

  } catch (error) {
    console.error("Add money to wallet error:", error.message);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
