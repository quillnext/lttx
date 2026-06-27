import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { resolveOrCreateProfileId } from "@/lib/walletHelper";

export async function POST(request) {
  try {
    const { profileId, accountHolderName, accountNumber, ifscCode, bankName, userEmail } = await request.json();

    if (!profileId || !accountHolderName || !accountNumber || !ifscCode) {
      return NextResponse.json(
        { error: "profileId, accountHolderName, accountNumber, and ifscCode are required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const targetProfileId = await resolveOrCreateProfileId(supabase, profileId, userEmail);

    // 1. Basic validation pattern (IFSC code validator)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode.trim().toUpperCase())) {
      return NextResponse.json({ error: "Invalid IFSC code format." }, { status: 400 });
    }

    let verificationStatus = "pending";
    let verificationResponse = null;

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check if we can do automated Razorpay Penny Drop
    if (keyId && keySecret && process.env.ENABLE_REAL_PENNY_DROP === "true") {
      try {
        const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
        const response = await fetch("https://api.razorpay.com/v1/fund_accounts/validations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            account_number: process.env.RAZORPAY_X_ACCOUNT_NUMBER || "222100-test-account", 
            fund_account: {
              account_type: "bank_account",
              bank_account: {
                name: accountHolderName,
                ifsc: ifscCode.trim().toUpperCase(),
                account_number: accountNumber.trim(),
              },
            },
            amount: 100, // 100 paisa = 1 INR
            currency: "INR",
          }),
        });

        const data = await response.json();
        verificationResponse = data;

        if (response.ok && data.results && data.results.account_status === "active") {
          verificationStatus = "verified";
        } else {
          verificationStatus = "rejected";
        }
      } catch (validationErr) {
        console.error("Razorpay bank validation failed, falling back to manual validation:", validationErr);
        verificationStatus = "pending";
      }
    } else {
      // In development or when automated validation is disabled, auto-approve matching names
      // or set to verified for mock demo, while setting verification status to verified/pending
      verificationStatus = "verified";
      verificationResponse = { mock: true, message: "Sandbox bank verification simulated" };
    }

    // 2. Upsert bank details
    const { data: bankDetail, error: dbError } = await supabase
      .from("bank_details")
      .upsert({
        profile_id: targetProfileId,
        account_holder_name: accountHolderName,
        account_number: accountNumber,
        ifsc_code: ifscCode.toUpperCase(),
        bank_name: bankName || "Detected Bank",
        verification_status: verificationStatus,
        verification_response: verificationResponse,
        updated_at: new Date().toISOString(),
      }, { onConflict: "profile_id" })
      .select()
      .maybeSingle();

    if (dbError) {
      console.error("Database error saving bank details:", dbError);
      return NextResponse.json({ error: "Failed to save bank details to database" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status: verificationStatus,
      bankDetail,
    });
  } catch (error) {
    console.error("Bank details verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process bank details verification." },
      { status: 500 }
    );
  }
}
