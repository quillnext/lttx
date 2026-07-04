"use client";

import React, { useState, useEffect } from "react";
import { useUserAuthStore } from "@/stores/useUserAuthStore";
import { Loader, Wallet, Landmark, ArrowUpRight, ArrowDownLeft, CheckCircle2, XCircle, AlertCircle, RefreshCw, PlusCircle, ArrowLeftRight } from "lucide-react";

export default function ExpertWalletPage() {
  const { user, isAuthenticated, loading: authLoading } = useUserAuthStore();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
  });

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [submittingBank, setSubmittingBank] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setErrorMsg("");
    try {
      // 1. Fetch wallet
      const walletRes = await fetch(`/api/wallet?userId=${user.id}`);
      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setWallet(walletData.wallet);
        setTransactions(walletData.transactions || []);
      }

      // 2. Fetch bank details
      const bankRes = await fetch(`/api/expert/bank-details?expertId=${user.id}`);
      if (bankRes.ok) {
        const bankData = await bankRes.json();
        if (bankData.bankDetails) {
          setBankDetails({
            bankName: bankData.bankDetails.bank_name || "",
            accountHolderName: bankData.bankDetails.account_holder_name || "",
            accountNumber: bankData.bankDetails.account_number || "",
            ifscCode: bankData.bankDetails.ifsc_code || "",
          });
        }
      }

      // 3. Fetch withdrawal history
      const withdrawRes = await fetch(`/api/expert/withdraw?expertId=${user.id}`);
      if (withdrawRes.ok) {
        const withdrawData = await withdrawRes.json();
        setWithdrawals(withdrawData.withdrawals || []);
      }
    } catch (err) {
      console.error("Failed to load wallet data:", err);
      setErrorMsg("Failed to load wallet details. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setSubmittingBank(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/expert/bank-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertId: user.id,
          bankName: bankDetails.bankName,
          accountHolderName: bankDetails.accountHolderName,
          accountNumber: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save bank details");

      setSuccessMsg("Bank details updated successfully!");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmittingBank(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setSubmittingWithdrawal(true);
    setErrorMsg("");
    setSuccessMsg("");

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 5000) {
      setErrorMsg("Minimum withdrawal amount is ₹5,000");
      setSubmittingWithdrawal(false);
      return;
    }

    if (parseFloat(wallet?.balance || "0") < amt) {
      setErrorMsg("Insufficient wallet balance");
      setSubmittingWithdrawal(false);
      return;
    }

    try {
      const res = await fetch("/api/expert/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertId: user.id,
          amount: amt,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request withdrawal");

      setSuccessMsg(data.message);
      setWithdrawAmount("");
      fetchData(); // Reload wallet balance and withdrawal requests list
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader className="w-8 h-8 text-[#36013F] animate-spin" />
        <p className="text-sm text-gray-500 mt-2 font-medium">Securing connection to ledger...</p>
      </div>
    );
  }

  const walletBalance = parseFloat(wallet?.balance || "0");

  return (
    <div className="min-h-screen bg-[#FDFBFD] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Earnings & Wallet</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your consultations revenue, bank account details, and withdrawals.</p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-semibold transition-colors"
          >
            <RefreshCw size={15} /> Refresh Balance
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-semibold rounded-2xl flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-green-50 border border-green-100 text-green-700 text-sm font-semibold rounded-2xl flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 animate-bounce" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Balance & Withdraw Form */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Wallet Balance Card */}
            <div className="bg-gradient-to-br from-[#36013F] via-[#4d035a] to-[#25012b] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl transform translate-x-12 -translate-y-12" />
              <div className="relative space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-2xl text-[#F4D35E]">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-purple-200/80 uppercase tracking-widest font-bold">Available Revenue Balance</span>
                    <h2 className="text-4xl font-black mt-0.5">₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h2>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs text-purple-200/90 font-medium">
                  <p>All transactions processed securely in INR (₹)</p>
                  <p>Status: Active</p>
                </div>
              </div>
            </div>

            {/* Withdrawal Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 text-[#36013F] rounded-xl">
                  <PlusCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Request Withdrawal</h3>
                  <p className="text-xs text-gray-500">Submit a payout request to your bank account.</p>
                </div>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Withdrawal Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min="5000"
                      step="1"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Minimum 5,000"
                      className="w-full pl-8 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#36013F] focus:ring-1 focus:ring-[#36013F] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingWithdrawal || walletBalance < 5000}
                  className="w-full bg-[#36013F] hover:bg-[#4a0152] disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {submittingWithdrawal ? <Loader className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
                  <span>Request Payout (Min ₹5,000)</span>
                </button>

                {walletBalance < 5000 && (
                  <p className="text-center text-xs text-red-500 font-medium">Your wallet balance is below the minimum payout threshold of ₹5,000.</p>
                )}
              </form>
            </div>

            {/* Transaction Ledger */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
              <h3 className="font-bold text-lg text-gray-900">Earnings Transaction History</h3>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ArrowLeftRight className="w-8 h-8 mx-auto opacity-40 mb-2" />
                  <p className="text-sm font-semibold">No transactions recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/30">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${tx.amount > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                          {tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{tx.description}</p>
                          <span className="text-[10px] text-gray-400 font-medium">{new Date(tx.created_at).toLocaleString("en-GB")}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-black text-sm ${tx.amount > 0 ? "text-green-600" : "text-gray-900"}`}>
                          {tx.amount > 0 ? "+" : ""}₹{parseFloat(tx.amount).toFixed(2)}
                        </p>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          tx.status === "success" ? "bg-green-100/50 text-green-700" :
                          tx.status === "pending" ? "bg-amber-100/50 text-amber-700" :
                          "bg-red-100/50 text-red-700"
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right panel: Bank details & Withdrawal request history */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Bank Details Form */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Landmark size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 font-sans">Bank Account Information</h3>
                  <p className="text-xs text-gray-500">Provide bank details where payout will be sent.</p>
                </div>
              </div>

              <form onSubmit={handleBankSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#36013F] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    value={bankDetails.accountHolderName}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                    placeholder="Name in bank records"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#36013F] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Account Number</label>
                  <input
                    type="text"
                    required
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    placeholder="Savings or Current account number"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#36013F] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={bankDetails.ifscCode}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                    placeholder="IFSC Code (11 alphanumeric characters)"
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:border-[#36013F] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingBank}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                >
                  {submittingBank ? <Loader className="w-5 h-5 animate-spin" /> : null}
                  <span>Save Bank Details</span>
                </button>
              </form>
            </div>

            {/* Withdrawal Request List */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
              <h3 className="font-bold text-lg text-gray-900">Payout Requests History</h3>
              {withdrawals.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-xs font-semibold">No payout requests submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {withdrawals.map((req) => (
                    <div key={req.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-black text-gray-900">₹{parseFloat(req.amount).toLocaleString("en-IN")}</p>
                          <span className="text-[9px] text-gray-400 font-bold">{new Date(req.created_at).toLocaleDateString("en-GB")}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          req.status === "approved" ? "bg-green-50 text-green-700 border border-green-100" :
                          req.status === "rejected" ? "bg-red-50 text-red-700 border border-red-100" :
                          "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      {/* Small bank detail snapshot */}
                      <div className="bg-white p-2.5 rounded-xl border border-gray-100/50 text-[10px] text-gray-500 space-y-0.5">
                        <p><strong>Bank:</strong> {req.bank_details_snapshot?.bank_name}</p>
                        <p><strong>A/c Number:</strong> {req.bank_details_snapshot?.account_number}</p>
                      </div>

                      {req.admin_feedback && (
                        <div className="text-[10px] text-gray-500 bg-purple-50/30 p-2 rounded-xl border border-purple-50">
                          <strong>Admin Feedback:</strong> {req.admin_feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
