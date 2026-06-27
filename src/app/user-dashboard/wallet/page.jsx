"use client";

import { useState, useEffect } from "react";
import { useUserAuthStore } from "@/stores/useUserAuthStore";
import { supabase } from "@/lib/supabase";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, AlertCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function UserWalletPage() {
  const { user, isAuthenticated } = useUserAuthStore();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchWalletDetails = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Trigger server-side wallet auto-initialization
      await fetch(`/api/profile/by-uid?uid=${encodeURIComponent(user.id)}&email=${encodeURIComponent(user.email || "")}`);

      // 1. Fetch wallet
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (walletError) throw walletError;
      setWallet(walletData);

      // 2. Fetch transactions
      if (walletData) {
        const { data: txData, error: txError } = await supabase
          .from("wallet_transactions")
          .select("*")
          .eq("wallet_id", walletData.id)
          .order("created_at", { ascending: false });

        if (txError) throw txError;
        setTransactions(txData || []);
      }
    } catch (err) {
      console.error("Error loading wallet details:", err);
      toast.error("Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchWalletDetails();
    }
  }, [user, isAuthenticated]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    const amountVal = parseFloat(depositAmount);
    if (isNaN(amountVal) || amountVal < 100) {
      toast.error("Minimum deposit amount is Rs. 100.00");
      return;
    }

    setActionLoading(true);
    try {
      // 1. Call api to create order
      const response = await fetch("/api/wallet/deposit/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountVal,
          currency: "INR",
          profileId: user.id,
          userEmail: user.email || "",
        }),
      });

      const orderData = await response.json();
      if (!response.ok) {
        throw new Error(orderData.error || "Failed to create payment order.");
      }

      // Helper to handle payment cancellation / dismissal
      const handlePaymentCancel = async (reason) => {
        try {
          await fetch("/api/wallet/deposit/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: orderData.orderId,
              reason,
            }),
          });
          fetchWalletDetails();
        } catch (err) {
          console.error("Error logging cancellation:", err);
        } finally {
          setActionLoading(false);
        }
      };

      // 2. Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Xmytravel Wallet",
        description: `Add money to wallet: Rs. ${amountVal}`,
        order_id: orderData.orderId,
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled.");
            handlePaymentCancel("User closed payment window.");
          },
        },
        handler: async function (response) {
          setActionLoading(true);
          try {
            // Verify payment
            const verifyRes = await fetch("/api/wallet/deposit/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.verified) {
              toast.success(`Successfully loaded Rs. ${amountVal} to your wallet!`);
              setDepositAmount("");
              fetchWalletDetails();
            } else {
              toast.error(verifyData.error || "Failed to verify deposit.");
              handlePaymentCancel("Verification failed.");
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            toast.error("Verification error occurred.");
            handlePaymentCancel("Verification error.");
          } finally {
            setActionLoading(false);
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
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error(`Payment failed: ${response.error.description}`);
        handlePaymentCancel(`Failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to initiate payment.");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#36013F] border-t-transparent"></div>
        <p className="ml-3 text-sm text-gray-500">Loading wallet details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <ToastContainer position="top-right" autoClose={3500} theme="dark" />

      {/* Hero Balance Card & Deposit */}
      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-7 bg-gradient-to-br from-[#36013F] to-[#5a0568] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wider text-purple-200 font-bold">Personal Wallet Balance</p>
              <h2 className="text-4xl md:text-5xl font-black mt-2">
                Rs. {parseFloat(wallet?.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <Wallet className="h-6 w-6 text-[#F4D35E]" />
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center text-xs text-purple-200">
            <div>
              <p className="opacity-75">Currency</p>
              <p className="font-bold text-white text-sm">{wallet?.currency || "INR"}</p>
            </div>
            <button 
              onClick={fetchWalletDetails} 
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <RefreshCw className="h-3 w-3" /> Refresh
            </button>
          </div>
        </div>

        {/* Deposit Panel */}
        <div className="md:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" /> Add Funds
          </h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">Top up your balance instantly using cards, UPI, or NetBanking.</p>

          <form onSubmit={handleDeposit} className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rs.</span>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount (min Rs. 100)"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 font-medium focus:ring-2 focus:ring-[#36013F] focus:border-transparent outline-none transition-all"
                min="100"
                required
                disabled={actionLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-[#36013F] text-white py-3 rounded-2xl font-bold text-sm shadow-md hover:bg-[#50035d] transition-all flex items-center justify-center gap-2"
            >
              {actionLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Proceed to Payment"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Transaction History Section */}
      <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-black text-gray-900 mb-4">Transaction History</h3>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="text-sm font-medium">No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Reference / Details</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {transactions.map((tx) => {
                  const isCredit = parseFloat(tx.amount) > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-bold flex items-center gap-2">
                        {isCredit ? (
                          <span className="p-1.5 bg-green-50 text-green-600 rounded-lg">
                            <ArrowDownLeft className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
                        )}
                        <span className="capitalize">{tx.type.replace("_", " ")}</span>
                      </td>
                      <td className={`py-4 font-bold ${isCredit ? "text-green-600" : "text-red-600"}`}>
                        {isCredit ? "+" : "-"} Rs. {Math.abs(parseFloat(tx.amount)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          tx.status === "completed" 
                            ? "bg-green-100 text-green-800" 
                            : tx.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-gray-500 max-w-[200px] truncate">
                        {tx.description || tx.reference_id}
                      </td>
                      <td className="py-4 text-xs text-gray-400">
                        {new Date(tx.created_at).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
