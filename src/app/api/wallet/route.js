import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Fetch user's wallet. If it doesn't exist, create it.
    let { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (walletError) throw walletError;

    if (!wallet) {
      const { data: newWallet, error: createError } = await supabase
        .from("wallets")
        .insert({ user_id: userId, balance: 0.00 })
        .select()
        .single();
      if (createError) throw createError;
      wallet = newWallet;
    }

    // Fetch recent wallet transactions
    const { data: transactions, error: transError } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("wallet_id", wallet.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (transError) throw transError;

    return NextResponse.json({
      wallet,
      transactions,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching wallet data:", error.message);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
