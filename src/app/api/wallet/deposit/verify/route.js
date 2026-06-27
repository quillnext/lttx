import crypto from "crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing Razorpay payment verification fields" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        { error: "Razorpay secret is not configured" },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid Razorpay payment signature" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // Update the transaction status to completed
    const { data: updatedTx, error: updateError } = await supabase
      .from("wallet_transactions")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("reference_id", razorpay_order_id)
      .eq("status", "pending")
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Error updating transaction status:", updateError);
      return NextResponse.json({ error: "Database error during validation" }, { status: 500 });
    }

    if (!updatedTx) {
      // Transaction might already be verified or not found
      return NextResponse.json({ verified: true, message: "Transaction already processed or not found" });
    }

    return NextResponse.json({ verified: true, transaction: updatedTx });
  } catch (error) {
    console.error("Razorpay payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify Razorpay payment." },
      { status: 500 }
    );
  }
}
