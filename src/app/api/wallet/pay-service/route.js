import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { sendWhatsAppServiceRequestToUser, sendWhatsAppServiceRequestToExpert } from "@/lib/aisensy";

export async function POST(request) {
  try {
    const { userId, expertId, serviceType, price, question } = await request.json();

    if (!userId || !expertId || !serviceType || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const priceNumeric = parseFloat(price);
    if (isNaN(priceNumeric) || priceNumeric < 0) {
      return NextResponse.json({ error: "Invalid price value" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // 1. Get user profile and wallet
    const { data: userProfile, error: userError } = await supabase
      .from("profiles")
      .select("*, wallets(*)")
      .eq("id", userId)
      .single();

    if (userError || !userProfile) {
      return NextResponse.json({ error: "User profile or wallet not found" }, { status: 404 });
    }

    const userWallet = userProfile.wallets;
    if (!userWallet || parseFloat(userWallet.balance) < priceNumeric) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    // 2. Get expert profile and wallet
    const { data: expertProfile, error: expertError } = await supabase
      .from("profiles")
      .select("*, wallets(*)")
      .eq("id", expertId)
      .single();

    if (expertError || !expertProfile) {
      return NextResponse.json({ error: "Expert profile or wallet not found" }, { status: 404 });
    }

    const expertWallet = expertProfile.wallets;
    if (!expertWallet) {
      return NextResponse.json({ error: "Expert wallet not initialized" }, { status: 404 });
    }

    // 3. Deduct from User Wallet and Add to Expert Wallet
    const newUserBalance = parseFloat(userWallet.balance) - priceNumeric;
    const newExpertBalance = parseFloat(expertWallet.balance) + priceNumeric;

    // Perform updates
    const { error: userWalletUpdateErr } = await supabase
      .from("wallets")
      .update({ balance: newUserBalance })
      .eq("id", userWallet.id);

    if (userWalletUpdateErr) throw userWalletUpdateErr;

    const { error: expertWalletUpdateErr } = await supabase
      .from("wallets")
      .update({ balance: newExpertBalance })
      .eq("id", expertWallet.id);

    if (expertWalletUpdateErr) throw expertWalletUpdateErr;

    // 4. Create Transactions
    const { error: debitTxErr } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: userWallet.id,
        amount: -priceNumeric,
        transaction_type: "debit",
        status: "success",
        description: `Paid for ${serviceType} consultation`,
      });

    if (debitTxErr) console.error("Failed to create user debit transaction record:", debitTxErr);

    const { error: creditTxErr } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: expertWallet.id,
        amount: priceNumeric,
        transaction_type: "credit",
        status: "success",
        description: `Earned from ${serviceType} consultation by ${userProfile.full_name}`,
      });

    if (creditTxErr) console.error("Failed to create expert credit transaction record:", creditTxErr);

    // 5. Create Service Request
    const { data: serviceReq, error: serviceReqErr } = await supabase
      .from("service_requests")
      .insert({
        user_id: userId,
        expert_id: expertId,
        service_type: serviceType,
        price: priceNumeric,
        status: "pending",
        payment_status: "paid",
        question: question || "",
      })
      .select()
      .single();

    if (serviceReqErr) throw serviceReqErr;

    // 6. Send WhatsApp notifications asynchronously
    try {
      if (userProfile.phone) {
        await sendWhatsAppServiceRequestToUser({
          phone: userProfile.phone,
          userName: userProfile.full_name,
          expertName: expertProfile.full_name,
          serviceType,
          question: question || "Consultation request placed",
        });
      }

      if (expertProfile.phone) {
        await sendWhatsAppServiceRequestToExpert({
          phone: expertProfile.phone,
          userName: userProfile.full_name,
          expertName: expertProfile.full_name,
          serviceType,
          question: question || "A traveller has requested your consultation service.",
        });
      }
    } catch (notifErr) {
      console.error("Failed to send WhatsApp service request notification:", notifErr.message);
    }

    return NextResponse.json({
      success: true,
      serviceRequest: serviceReq,
    }, { status: 200 });
  } catch (error) {
    console.error("Error processing service payment:", error.message);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
