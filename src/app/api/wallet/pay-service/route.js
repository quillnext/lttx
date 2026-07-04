import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { sendWhatsAppServiceRequestToExpert } from "@/lib/aisensy";

export async function POST(request) {
  try {
    const { userId, expertId, serviceType, price, question, couponCode, formData } = await request.json();

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
    if (!userWallet) {
      return NextResponse.json({ error: "User wallet not found" }, { status: 404 });
    }

    // 2. Validate Coupon if provided
    let discountAmount = 0;
    let finalPrice = priceNumeric;
    let couponId = null;

    if (couponCode && couponCode.trim()) {
      const { data: coupon, error: couponErr } = await supabase
        .from("coupons")
        .select("*")
        .ilike("code", couponCode.trim())
        .maybeSingle();

      if (!couponErr && coupon && coupon.active) {
        const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < new Date();
        const meetsMinPurchase = priceNumeric >= parseFloat(coupon.min_purchase);

        if (!isExpired && meetsMinPurchase) {
          couponId = coupon.id;
          if (coupon.discount_type === "percentage") {
            discountAmount = (priceNumeric * parseFloat(coupon.discount_value)) / 100;
            if (coupon.max_discount && discountAmount > parseFloat(coupon.max_discount)) {
              discountAmount = parseFloat(coupon.max_discount);
            }
          } else if (coupon.discount_type === "fixed") {
            discountAmount = parseFloat(coupon.discount_value);
          }

          if (discountAmount > priceNumeric) {
            discountAmount = priceNumeric;
          }
          finalPrice = priceNumeric - discountAmount;
        }
      }
    }

    if (parseFloat(userWallet.balance) < finalPrice) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    // 3. Get expert profile and wallet (to verify existence)
    const { data: expertProfile, error: expertError } = await supabase
      .from("profiles")
      .select("*, wallets(*)")
      .eq("id", expertId)
      .single();

    if (expertError || !expertProfile) {
      return NextResponse.json({ error: "Expert profile or wallet not found" }, { status: 404 });
    }

    // 4. Deduct finalPrice from User Wallet
    const newUserBalance = parseFloat(userWallet.balance) - finalPrice;
    const { error: userWalletUpdateErr } = await supabase
      .from("wallets")
      .update({ balance: newUserBalance, updated_at: new Date().toISOString() })
      .eq("id", userWallet.id);

    if (userWalletUpdateErr) throw userWalletUpdateErr;

    // 5. Create Debit Transaction for User
    const { error: debitTxErr } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: userWallet.id,
        amount: -finalPrice,
        transaction_type: "debit",
        status: "success",
        description: `Paid for ${serviceType} consultation${couponCode ? ` (Coupon: ${couponCode})` : ""}`,
      });

    if (debitTxErr) console.error("Failed to create user debit transaction record:", debitTxErr);

    // 6. Create Service Request
    const { data: serviceReq, error: serviceReqErr } = await supabase
      .from("service_requests")
      .insert({
        user_id: userId,
        expert_id: expertId,
        service_type: serviceType,
        price: finalPrice,
        status: "pending",
        payment_status: "paid",
        question: question || "",
      })
      .select()
      .single();

    if (serviceReqErr) throw serviceReqErr;

    // 7. Create a corresponding Lead so it appears in the expert & admin dashboards
    const calculatedPayout = parseFloat((finalPrice * 0.70).toFixed(2));
    const userPhone = formData?.phone || formData?.whatsapp || userProfile.phone || "";

    const { error: leadErr } = await supabase
      .from("leads")
      .insert({
        service_type: serviceType,
        form_data: {
          ...formData,
          phone: userPhone,
          payment: {
            status: "paid",
            amount: finalPrice,
            method: "wallet",
            couponCode: couponCode || null,
            discount: discountAmount,
          },
        },
        expert_id: expertId,
        expert_name: expertProfile.full_name,
        status: "pending",
        user_name: userProfile.full_name,
        user_email: userProfile.email,
        destination: formData?.destination || formData?.dest || "",
        trip_dates: (formData?.startDate && formData?.endDate) ? `${formData.startDate} to ${formData.endDate}` : (formData?.dates || ""),
        source: "checkout_wallet",
        payout_amount: calculatedPayout,
        payout_status: "pending",
      });

    if (leadErr) {
      console.error("Failed to create lead record for expert dashboard:", leadErr);
    }

    // 8. Send WhatsApp notifications asynchronously
    try {
      if (expertProfile.phone) {
        await sendWhatsAppServiceRequestToExpert({
          phone: expertProfile.phone,
          userName: userProfile.full_name,
          expertName: expertProfile.full_name,
          serviceType,
          question: question || "A traveller has requested your consultation service.",
        });
      }

      const adminPhone = process.env.ADMIN_PHONE;
      if (adminPhone) {
        await sendWhatsAppServiceRequestToExpert({
          phone: adminPhone,
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
      finalPrice,
      discountAmount,
    }, { status: 200 });
  } catch (error) {
    console.error("Error processing service payment:", error.message);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
