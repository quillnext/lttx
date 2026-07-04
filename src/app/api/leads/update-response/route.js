import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

const allowedStatuses = new Set([
  "pending",
  "accepted",
  "clarification_requested",
  "answered",
  "admin_prompt",
  "escalated",
]);

export async function POST(request) {
  try {
    const {
      leadId,
      reply,
      status,
      expertName,
    } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: "Missing required field: leadId" },
        { status: 400 }
      );
    }

    const updates = {};

    if (typeof reply === "string") {
      if (!reply.trim()) {
        return NextResponse.json(
          { error: "Reply cannot be empty" },
          { status: 400 }
        );
      }
      updates.reply = reply;
      updates.replied_at = new Date().toISOString();
    }

    if (status) {
      if (!allowedStatuses.has(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    if (expertName) {
      updates.expert_name = expertName;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No lead updates provided" },
        { status: 400 }
      );
    }

    const supabaseClient = createSupabaseAdminClient();
    const { data, error } = await supabaseClient
      .from("leads")
      .update(updates)
      .eq("id", leadId)
      .select("id, reply, status, replied_at, expert_name, expert_id, service_type, payout_amount, payout_status")
      .single();

    if (error) {
      console.error("Supabase lead update failed:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update lead" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Lead not found or no row was updated" },
        { status: 404 }
      );
    }

    // Process expert payout if status is answered, payout is pending, and payout_amount is > 0
    if (data.status === "answered" && data.payout_status === "pending" && data.payout_amount && parseFloat(data.payout_amount) > 0) {
      try {
        const payoutVal = parseFloat(data.payout_amount);
        const expertId = data.expert_id;

        // Fetch expert profile & wallet
        const { data: expertProfile, error: profileErr } = await supabaseClient
          .from("profiles")
          .select("*, wallets(*)")
          .eq("id", expertId)
          .single();

        if (!profileErr && expertProfile) {
          let wallet = expertProfile.wallets;
          if (!wallet) {
            // Create if it doesn't exist
            const { data: newWallet, error: createErr } = await supabaseClient
              .from("wallets")
              .insert({ user_id: expertId, balance: 0.00 })
              .select()
              .single();
            if (!createErr) wallet = newWallet;
          }

          if (wallet) {
            const newExpertBalance = parseFloat(wallet.balance) + payoutVal;

            // Update wallet balance
            const { error: wUpdateErr } = await supabaseClient
              .from("wallets")
              .update({ balance: newExpertBalance, updated_at: new Date().toISOString() })
              .eq("id", wallet.id);

            if (!wUpdateErr) {
              // Record credit transaction
              await supabaseClient
                .from("wallet_transactions")
                .insert({
                  wallet_id: wallet.id,
                  amount: payoutVal,
                  transaction_type: "credit",
                  status: "success",
                  description: `Earned for answering ${data.service_type || "service"}`,
                  reference_id: data.id,
                });

              // Mark lead payout as paid
              await supabaseClient
                .from("leads")
                .update({ payout_status: "paid" })
                .eq("id", data.id);
              
              data.payout_status = "paid";
            }
          }
        }
      } catch (payoutErr) {
        console.error("Failed to process expert payout:", payoutErr.message);
      }
    }

    return NextResponse.json({ success: true, lead: data }, { status: 200 });
  } catch (error) {
    console.error("Error updating lead response:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to update lead response" },
      { status: 500 }
    );
  }
}
