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

    // Fetch withdrawal history
    const { data: withdrawals, error: fetchErr } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("expert_id", expertId)
      .order("created_at", { ascending: false });

    if (fetchErr) {
      console.error("Database withdrawals fetch failed:", fetchErr);
      return NextResponse.json({ error: "Failed to fetch withdrawal history" }, { status: 500 });
    }

    return NextResponse.json({ withdrawals: withdrawals || [] }, { status: 200 });
  } catch (error) {
    console.error("Expert withdraw GET error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { expertId, amount } = await request.json();

    if (!expertId || !amount) {
      return NextResponse.json({ error: "Expert ID and amount are required" }, { status: 400 });
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < 5000) {
      return NextResponse.json({ error: "Minimum withdrawal amount is ₹5,000" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // 1. Get expert bank details
    const { data: bankDetails, error: bankErr } = await supabase
      .from("expert_bank_details")
      .select("*")
      .eq("expert_id", expertId)
      .maybeSingle();

    if (bankErr || !bankDetails) {
      return NextResponse.json({ error: "Please add and save bank details before requesting a withdrawal" }, { status: 400 });
    }

    // 2. Fetch expert's wallet
    const { data: wallet, error: walletErr } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", expertId)
      .maybeSingle();

    if (walletErr || !wallet) {
      return NextResponse.json({ error: "Expert wallet not found" }, { status: 404 });
    }

    const currentBalance = parseFloat(wallet.balance);
    if (currentBalance < withdrawAmount) {
      return NextResponse.json({ error: "Insufficient wallet balance for withdrawal" }, { status: 400 });
    }

    // 3. Perform withdrawal request transaction:
    // Deduct from expert's wallet balance
    const newBalance = currentBalance - withdrawAmount;
    const { error: balanceErr } = await supabase
      .from("wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    if (balanceErr) throw balanceErr;

    // Create a pending debit transaction in wallet_transactions
    const { data: tx, error: txErr } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        amount: -withdrawAmount,
        transaction_type: "debit",
        status: "pending",
        description: `Pending bank withdrawal request`,
      })
      .select()
      .single();

    if (txErr) console.error("Failed to insert wallet transaction:", txErr);

    // Create a withdrawal request row
    const { data: withdrawRequest, error: withdrawRequestErr } = await supabase
      .from("withdrawal_requests")
      .insert({
        expert_id: expertId,
        amount: withdrawAmount,
        status: "pending",
        bank_details_snapshot: {
          bank_name: bankDetails.bank_name,
          account_holder_name: bankDetails.account_holder_name,
          account_number: bankDetails.account_number,
          ifsc_code: bankDetails.ifsc_code,
        },
      })
      .select()
      .single();

    if (withdrawRequestErr) throw withdrawRequestErr;

    // Link transaction reference if possible
    if (tx && withdrawRequest) {
      await supabase
        .from("wallet_transactions")
        .update({ reference_id: withdrawRequest.id })
        .eq("id", tx.id);
    }

    return NextResponse.json({
      success: true,
      withdrawRequest,
      message: "Withdrawal request of ₹" + withdrawAmount.toFixed(2) + " submitted successfully. Awaiting admin approval.",
    }, { status: 200 });

  } catch (error) {
    console.error("Expert withdraw POST error:", error.message);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
