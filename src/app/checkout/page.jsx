"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useUserAuthStore } from "@/stores/useUserAuthStore";
import { Loader, CreditCard, Wallet, AlertCircle, ArrowLeft, CheckCircle, ShieldCheck } from "lucide-react";
import Script from "next/script";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, loading: authLoading } = useUserAuthStore();

  const expertId = searchParams.get("expertId");
  const serviceType = searchParams.get("serviceType") || "1:1 Strategic Consultation";
  const price = parseFloat(searchParams.get("price") || "0");
  const question = searchParams.get("question") || "";

  const [expert, setExpert] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("wallet"); // "wallet" | "card"
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const returnUrl = `/checkout?expertId=${expertId}&serviceType=${encodeURIComponent(serviceType)}&price=${price}&question=${encodeURIComponent(question)}`;
      router.replace(`/login?returnTo=${encodeURIComponent(returnUrl)}`);
    }
  }, [authLoading, isAuthenticated, expertId, serviceType, price, question, router]);

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

        // Fetch user wallet balance
        const walletRes = await fetch(`/api/wallet?userId=${user.id}`);
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          setWallet(walletData.wallet);
          // Default to card payment if wallet balance is insufficient
          if (parseFloat(walletData.wallet?.balance || "0") < price) {
            setPaymentMethod("card");
          }
        }
      } catch (err) {
        console.error("Failed to load checkout details:", err);
        setErrorMsg("Failed to retrieve checkout details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, expertId, price]);

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
          price,
          question,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Wallet payment failed");
      }

      setPaymentSuccess(true);
      setTimeout(() => {
        router.replace("/user-dashboard");
      }, 3000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setPaying(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setPaying(true);
    setErrorMsg("");
    try {
      // 1. Create Order on Server Side
      const orderRes = await fetch("/api/payments/razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initiate payment gateway");
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "XmyTravel",
        description: `${serviceType} - Expert Consultation`,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            // Verify payment on server and record service request
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
                expertId,
                serviceType,
                price,
                question,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            setPaymentSuccess(true);
            setTimeout(() => {
              router.replace("/user-dashboard");
            }, 3000);
          } catch (verifyErr) {
            setErrorMsg("Payment captured but record verification failed. Contact support.");
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
        <p className="text-sm text-gray-500 mt-2 font-medium">Securing checkout checkout...</p>
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
            Your service request has been confirmed. You will receive WhatsApp/Email notifications shortly. Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const walletBalance = parseFloat(wallet?.balance || "0");
  const canUseWallet = walletBalance >= price;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to profile
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Checkout Options */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Select Payment Method</h2>

              <div className="space-y-3">
                {/* Wallet Option */}
                <button
                  type="button"
                  onClick={() => canUseWallet && setPaymentMethod("wallet")}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                    !canUseWallet
                      ? "opacity-50 cursor-not-allowed border-gray-100 bg-gray-50"
                      : paymentMethod === "wallet"
                      ? "border-[#36013F] bg-purple-50/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-xl text-[#36013F]">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Pay using Travel Wallet</p>
                      <p className="text-xs text-gray-500">Available: ₹{walletBalance.toFixed(2)}</p>
                    </div>
                  </div>
                  {canUseWallet ? (
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "wallet" ? "border-[#36013F] bg-[#36013F]" : "border-gray-300"}`}>
                      {paymentMethod === "wallet" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Low Balance</span>
                  )}
                </button>

                {/* Card / UPI Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                    paymentMethod === "card"
                      ? "border-[#36013F] bg-purple-50/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Cards, UPI & NetBanking</p>
                      <p className="text-xs text-gray-500">Processed securely via Razorpay</p>
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
                <span>Pay ₹{price} Securely</span>
              </button>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
              <h3 className="font-bold text-gray-900 text-lg">Order Summary</h3>

              {expert && (
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={expert.photo_url || "/default.jpg"}
                      alt={expert.full_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{expert.full_name}</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{expert.role || "Expert"}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">{serviceType}</span>
                  <span className="font-bold text-gray-900">₹{price}</span>
                </div>
                {question && (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-500 italic mt-2">
                    "{question}"
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-900 text-base">Total Amount</span>
                <span className="font-black text-xl text-[#36013F]">₹{price}</span>
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
