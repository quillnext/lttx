"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useUserAuthStore } from "@/stores/useUserAuthStore";
import { Loader, CreditCard, Wallet, AlertCircle, ArrowLeft, CheckCircle, ShieldCheck, Ticket, Plus, Sparkles } from "lucide-react";
import Script from "next/script";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, loading: authLoading } = useUserAuthStore();

  const expertId = searchParams.get("expertId");
  const serviceType = searchParams.get("serviceType") || "1:1 Strategic Consultation";
  const initialPrice = parseFloat(searchParams.get("price") || "0");
  const question = searchParams.get("question") || "";
  const formDataStr = searchParams.get("formData") || "{}";

  let parsedFormData = {};
  try {
    parsedFormData = JSON.parse(formDataStr);
  } catch (e) {
    console.error("Failed to parse formData query param", e);
  }

  const [expert, setExpert] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet"); // default to wallet
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Recharge state
  const [rechargeAmount, setRechargeAmount] = useState("1000");
  const [recharging, setRecharging] = useState(false);

  const fetchWallet = async () => {
    if (!user?.id) return;
    try {
      const walletRes = await fetch(`/api/wallet?userId=${user.id}`);
      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setWallet(walletData.wallet);
      }
    } catch (err) {
      console.error("Failed to load wallet balance", err);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const returnUrl = `/checkout?expertId=${expertId}&serviceType=${encodeURIComponent(serviceType)}&price=${initialPrice}&question=${encodeURIComponent(question)}&formData=${encodeURIComponent(formDataStr)}`;
      router.replace(`/login?returnTo=${encodeURIComponent(returnUrl)}`);
    }
  }, [authLoading, isAuthenticated, expertId, serviceType, initialPrice, question, formDataStr, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || !expertId) return;
      setLoading(true);
      setErrorMsg("");
      try {
        // Fetch expert profile
        const expertRes = await fetch(`/api/profile/by-uid?uid=${expertId}`);
        if (expertRes.ok) {
          const expertData = await expertRes.json();
          setExpert(expertData.profile);
        }

        // Fetch wallet balance
        await fetchWallet();
      } catch (err) {
        console.error("Failed to load checkout details:", err);
        setErrorMsg("Failed to retrieve checkout details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, expertId]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          price: initialPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to validate coupon");

      if (data.valid) {
        setAppliedCoupon(data);
      } else {
        setCouponError(data.error || "Invalid coupon code");
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError(err.message);
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const finalPrice = appliedCoupon ? appliedCoupon.finalPrice : initialPrice;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const walletBalance = parseFloat(wallet?.balance || "0");
  const canUseWallet = walletBalance >= finalPrice;

  // Add Money to Wallet using Razorpay
  const handleRechargeWallet = async () => {
    const amt = parseFloat(rechargeAmount);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg("Please enter a valid recharge amount");
      return;
    }

    setRecharging(true);
    setErrorMsg("");
    try {
      // 1. Create order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          currency: "INR",
          receipt: `rcpt_wallet_${Date.now()}`,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      // 2. Open Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "XmyTravel Wallet",
        description: "Add funds to your Travel Wallet",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // 3. Verify & credit wallet on server
            const loadRes = await fetch("/api/wallet/add-money", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.id,
                amount: amt,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const loadData = await loadRes.json();
            if (!loadRes.ok) throw new Error(loadData.error || "Failed to add money");

            // Success top up
            setSuccessMsg(`₹${amt} added successfully! New balance: ₹${loadData.balance}`);
            await fetchWallet();
            setPaymentMethod("wallet"); // Automatically select wallet
          } catch (err) {
            setErrorMsg(err.message);
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#36013F",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setRecharging(false);
    }
  };

  const handleWalletPayment = async () => {
    setPaying(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/wallet/pay-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          expertId,
          serviceType,
          price: initialPrice,
          question,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          formData: parsedFormData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Wallet payment failed");
      }

      setPaymentSuccess(true);
      setTimeout(() => {
        router.replace(user.role === "expert" ? "/expert-dashboard" : user.role === "agency" ? "/agency-dashboard" : "/user-dashboard");
      }, 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setPaying(false);
    }
  };

  // Direct checkout via Razorpay card payment
  const handleRazorpayPayment = async () => {
    setPaying(true);
    setErrorMsg("");
    try {
      // 1. Create Order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalPrice,
          currency: "INR",
          receipt: `rcpt_direct_${Date.now()}`,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initiate payment gateway");
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "XmyTravel Direct Checkout",
        description: `${serviceType} - Expert Consultation`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // Verify signature
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const verifyData = await verifyRes.json();
              throw new Error(verifyData.error || "Payment verification failed");
            }

            // Create service request on backend using a wallet pay-service equivalent logic 
            // but bypassing wallet balance check (since they paid online directly)
            // To do this securely, we credit the wallet first with finalPrice, then call pay-service!
            // This is extremely elegant and clean!
            const loadRes = await fetch("/api/wallet/add-money", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.id,
                amount: finalPrice,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!loadRes.ok) throw new Error("Failed to process payment receipt");

            // Deduct the wallet right away
            const payRes = await fetch("/api/wallet/pay-service", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: user.id,
                expertId,
                serviceType,
                price: initialPrice,
                question,
                couponCode: appliedCoupon ? appliedCoupon.code : null,
                formData: parsedFormData,
              }),
            });

            if (!payRes.ok) {
              const payData = await payRes.json();
              throw new Error(payData.error || "Failed to confirm request booking");
            }

            setPaymentSuccess(true);
            setTimeout(() => {
              router.replace(user.role === "expert" ? "/expert-dashboard" : user.role === "agency" ? "/agency-dashboard" : "/user-dashboard");
            }, 3000);
          } catch (verifyErr) {
            setErrorMsg(verifyErr.message || "Payment captured but verification failed. Contact support.");
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.phone || "",
        },
        theme: {
          color: "#36013F",
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      setErrorMsg(err.message);
      setPaying(false);
    }
  };

  const handlePay = () => {
    if (paymentMethod === "wallet") {
      handleWalletPayment();
    } else {
      handleRazorpayPayment();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader className="w-8 h-8 text-[#36013F] animate-spin" />
        <p className="text-sm text-gray-500 mt-2 font-medium">Securing checkout session...</p>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-4 border border-gray-100">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
          <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
          <p className="text-gray-500 text-sm">
            Your service request has been confirmed. You will receive notifications shortly. Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBFD] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Checkout Options */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Wallet Balance & Add Money Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-50 rounded-2xl text-[#36013F]">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Travel Wallet</h3>
                    <p className="text-xs text-gray-500">Balance: ₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                {!canUseWallet && (
                  <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full">Low Balance</span>
                )}
              </div>

              {/* Recharge card */}
              <div className="p-4 rounded-2xl bg-purple-50/30 border border-purple-50/50 space-y-4">
                <p className="text-xs font-bold text-[#36013F] flex items-center gap-1.5">
                  <Sparkles size={14} className="animate-spin" /> Recharge Wallet Instantly
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                    <input
                      type="number"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      placeholder="Amount to add"
                      className="w-full pl-6 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#36013F]"
                    />
                  </div>
                  <button
                    onClick={handleRechargeWallet}
                    disabled={recharging}
                    className="bg-[#36013F] hover:bg-[#4a0152] disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition-all shadow-sm"
                  >
                    <Plus size={14} /> Add Money
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Payment Option</h4>
                
                {/* Wallet button */}
                <button
                  type="button"
                  onClick={() => canUseWallet && setPaymentMethod("wallet")}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                    !canUseWallet
                      ? "opacity-50 cursor-not-allowed border-gray-100 bg-gray-50"
                      : paymentMethod === "wallet"
                      ? "border-[#36013F] bg-purple-50/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl text-[#36013F]">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Pay using Travel Wallet</p>
                      <p className="text-xs text-gray-500">Deduct ₹{finalPrice.toFixed(2)} from wallet</p>
                    </div>
                  </div>
                  {canUseWallet ? (
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "wallet" ? "border-[#36013F] bg-[#36013F]" : "border-gray-300"}`}>
                      {paymentMethod === "wallet" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">Insufficient</span>
                  )}
                </button>

                {/* Direct Razorpay button */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                    paymentMethod === "card"
                      ? "border-[#36013F] bg-purple-50/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Cards, UPI & NetBanking</p>
                      <p className="text-xs text-gray-500">Pay directly with Razorpay</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "card" ? "border-[#36013F] bg-[#36013F]" : "border-gray-300"}`}>
                    {paymentMethod === "card" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full bg-[#36013F] hover:bg-[#4a0152] disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {paying ? <Loader className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                <span>Pay ₹{finalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })} Securely</span>
              </button>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Coupon Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-[#36013F]" /> Have a Coupon Code?
              </h3>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 p-3 rounded-2xl border border-green-100 text-xs font-bold text-green-700">
                  <span>Coupon Applied: {appliedCoupon.code}</span>
                  <button onClick={handleRemoveCoupon} className="text-red-500 font-bold hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. WELCOME10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider focus:outline-none"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon}
                    className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    {validatingCoupon ? "Applying..." : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}
            </div>

            {/* Order Summary Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
              <h3 className="font-bold text-gray-900 text-lg">Order Summary</h3>

              {expert && (
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={expert.photo_url || "/default-avatar.png"}
                      alt={expert.full_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{expert.full_name}</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{expert.role || "Expert"}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm font-semibold">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">{serviceType}</span>
                  <span className="font-bold text-gray-900">₹{initialPrice.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 text-xs">
                    <span>Discount Applied</span>
                    <span>- ₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {question && (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-500 italic mt-2">
                    "{question}"
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-900 text-base">Total Amount</span>
                <span className="font-black text-xl text-[#36013F]">₹{finalPrice.toFixed(2)}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader className="w-8 h-8 text-[#36013F] animate-spin" />
        <p className="text-sm text-gray-500 mt-2 font-medium">Loading session...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
