import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { code, price } = await request.json();

    if (!code || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const priceNumeric = parseFloat(price);
    if (isNaN(priceNumeric) || priceNumeric < 0) {
      return NextResponse.json({ error: "Invalid price value" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .ilike("code", code.trim())
      .maybeSingle();

    if (couponError) {
      console.error("Database coupon fetch failed:", couponError);
      return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
    }

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid coupon code" }, { status: 200 });
    }

    if (!coupon.active) {
      return NextResponse.json({ valid: false, error: "This coupon is no longer active" }, { status: 200 });
    }

    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon has expired" }, { status: 200 });
    }

    if (priceNumeric < parseFloat(coupon.min_purchase)) {
      return NextResponse.json({
        valid: false,
        error: `Minimum purchase of ₹${parseFloat(coupon.min_purchase).toFixed(2)} required for this coupon`,
      }, { status: 200 });
    }

    let discountAmount = 0;
    if (coupon.discount_type === "percentage") {
      discountAmount = (priceNumeric * parseFloat(coupon.discount_value)) / 100;
      if (coupon.max_discount && discountAmount > parseFloat(coupon.max_discount)) {
        discountAmount = parseFloat(coupon.max_discount);
      }
    } else if (coupon.discount_type === "fixed") {
      discountAmount = parseFloat(coupon.discount_value);
    }

    // Discount cannot exceed price
    if (discountAmount > priceNumeric) {
      discountAmount = priceNumeric;
    }

    const finalPrice = priceNumeric - discountAmount;

    return NextResponse.json({
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountAmount,
      finalPrice,
    }, { status: 200 });
  } catch (error) {
    console.error("Coupon validation error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
