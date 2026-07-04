"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useUserAuthStore } from "@/stores/useUserAuthStore";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  XCircle, 
  Loader, 
  AlertCircle, 
  RefreshCw, 
  PlusCircle 
} from "lucide-react";

export default function UserWalletPage() {
  const { user } = useUserAuthStore();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Recharge State
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [recharging, setRecharging] = useState(false);

  const fetchWalletData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/wallet?userId=${user.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load wallet data");
      setWallet(data.wallet);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to retrieve wallet information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [user?.id]);

  const handleRecharge = async (e) => {
    e.preventDefault();
    const amt = parseFloat(rechargeAmount);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg("Please enter a valid amount to add.");
      return;
    }

    setRecharging(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // 1. Create Order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          currency: "INR",
          receipt: `rcpt_wallet_user_${Date.now()}`,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to initiate transaction.");

      // 2. Configure Razorpay Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "XmyTravel Wallet",
        description: "Add funds to your Travel Wallet",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            setLoading(true);
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
            if (!loadRes.ok) throw new Error(loadData.error || "Verification failed");

            setSuccessMsg(`₹${amt.toFixed(2)} successfully credited to your wallet!`);
            setRechargeAmount("");
            await fetchWalletData();
          } catch (err) {
            setErrorMsg(err.message || "Failed to credit wallet.");
            setLoading(false);
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

      if (!window.Razorpay) {
        throw new Error("Razorpay script not loaded yet. Please wait a moment and try again.");
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong during recharge.");
    } finally {
      setRecharging(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircle2 size={12} /> Success
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle size={12} /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
    }
  };

  if (loading && !wallet) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="w-8 h-8 animate-spin text-[#36013F] mb-2" />
        <p className="text-gray-500 font-medium">Fetching wallet information...</p>
      </div>
    );
  }

  const balance = parseFloat(wallet?.balance || "0");

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#36013F] flex items-center gap-2">
            <Wallet className="w-8 h-8 text-[#F4D35E]" /> My Wallet
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your travel wallet, top up funds, and view recent transaction statements.
          </p>
        </div>
        <button
          onClick={fetchWalletData}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#36013F] hover:text-[#520260] bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl self-start md:self-auto transition-colors"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Feedback Messages */}
      {errorMsg && (
        <div className="flex items-start gap-2 bg-red-50 text-red-800 p-4 rounded-2xl border border-red-100 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-2 bg-green-50 text-green-800 p-4 rounded-2xl border border-green-100 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
          <div>{successMsg}</div>
        </div>
      )}

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-[#36013F] text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden md:col-span-2">
          <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-10">
            <Wallet size={180} />
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-gray-300 font-bold">Current Balance</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#F4D35E] tracking-tight">
              ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="mt-8 text-xs text-gray-300">
            Securely powered by Razorpay. Use your wallet balance for seamless one-click bookings.
          </div>
        </div>

        {/* Add Money Form */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-1.5">
              <PlusCircle className="text-[#36013F]" size={20} /> Add Funds
            </h3>
            <p className="text-xs text-gray-500 mt-1">Load money directly to pay experts instantly.</p>
          </div>

          <form onSubmit={handleRecharge} className="mt-6 space-y-4">
            <div>
              <label htmlFor="amount" className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Amount (INR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                <input
                  type="number"
                  id="amount"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="500"
                  min="1"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-8 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#36013F]"
                  disabled={recharging}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={recharging || !rechargeAmount}
              className="w-full bg-[#36013F] hover:bg-[#520260] text-white py-2.5 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {recharging ? (
                <>
                  <Loader size={16} className="animate-spin" /> Processing...
                </>
              ) : (
                "Load Funds"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg">Transaction History</h3>
          <span className="text-xs font-semibold text-gray-400 uppercase">
            Showing latest {transactions.length} entries
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Wallet size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-sm">No transactions yet</p>
            <p className="text-xs text-gray-400 mt-1">Your wallet activity history will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Reference / Order ID</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {transactions.map((tx) => {
                  const isCredit = tx.transaction_type === "credit";
                  const date = new Date(tx.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50/55 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-1.5 rounded-xl flex items-center justify-center ${
                              isCredit ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                            }`}
                          >
                            {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          </span>
                          <span className="font-semibold capitalize">{tx.transaction_type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate font-medium text-gray-700">
                        {tx.description || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-500">
                        {tx.reference_id || tx.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                        {date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(tx.status)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-right font-bold text-sm ${
                          isCredit ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isCredit ? "+" : "-"}₹{parseFloat(tx.amount).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
