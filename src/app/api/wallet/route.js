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
