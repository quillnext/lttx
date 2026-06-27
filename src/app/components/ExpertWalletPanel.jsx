"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Building, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Send 
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ExpertWalletPanel({ firebaseUid, email }) {
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  
  // Form states
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [loading, setLoading] = useState(true);
  const [bankVerifying, setBankVerifying] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const fetchDetails = async () => {
    if (!firebaseUid) return;
    setLoading(true);
    try {
      // 1. Fetch profile to map ID
      const { getProfileByUidOrEmail } = await import("@/lib/supabaseProfile");
      const profileData = await getProfileByUidOrEmail(supabase, firebaseUid, email);
      
      if (!profileData) {
        toast.error("Profile record not found. Please complete your profile setup.");
        setLoading(false);
        return;
      }
      setProfile(profileData);

      // 2. Fetch Wallet
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("profile_id", profileData.id)
        .maybeSingle();

      if (walletError) throw walletError;
      setWallet(walletData);

      // 3. Fetch Bank Details
      const { data: bankData, error: bankError } = await supabase
        .from("bank_details")
        .select("*")
        .eq("profile_id", profileData.id)
        .maybeSingle();

      if (!bankError && bankData) {
        setBankDetails(bankData);
        setAccountHolderName(bankData.account_holder_name || "");
        setAccountNumber(bankData.account_number || "");
        setIfscCode(bankData.ifsc_code || "");
        setBankName(bankData.bank_name || "");
      }

      // 4. Fetch Transactions
      if (walletData) {
        const { data: txData, error: txError } = await supabase
          .from("wallet_transactions")
          .select("*")
          .eq("wallet_id", walletData.id)
          .order("created_at", { ascending: false });

        if (!txError) setTransactions(txData || []);
      }

      // 5. Fetch Withdrawal Requests
      const { data: wrData, error: wrError } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .eq("profile_id", profileData.id)
        .order("created_at", { ascending: false });

      if (!wrError) setWithdrawRequests(wrData || []);

    } catch (err) {
      console.error("Error fetching wallet details:", err.message || err);
      toast.error(`Failed to load financial records: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [firebaseUid]);

  const handleBankVerify = async (e) => {
    e.preventDefault();
    if (!accountHolderName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
      toast.error("Please fill in all bank details.");
      return;
    }

    setBankVerifying(true);
    try {
      const res = await fetch("/api/bank/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          accountHolderName,
          accountNumber,
          ifscCode,
          bankName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify bank details.");
      }

      if (data.status === "verified") {
        toast.success("Bank details verified successfully! (Penny drop passed)");
      } else {
        toast.warn(`Bank validation status: ${data.status}`);
      }
      fetchDetails();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to verify bank details.");
    } finally {
      setBankVerifying(false);
    }
  };

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    const amountVal = parseFloat(withdrawAmount);
    if (isNaN(amountVal) || amountVal < 100) {
      toast.error("Minimum withdrawal amount is Rs. 100.00");
      return;
    }

    if (!bankDetails || bankDetails.verification_status !== "verified") {
      toast.error("Please add and verify your bank details before requesting withdrawal.");
      return;
    }

    if (amountVal > parseFloat(wallet?.balance || 0)) {
      toast.error("Insufficient balance in your wallet.");
      return;
    }

    setWithdrawLoading(true);
    try {
      const res = await fetch("/api/wallet/withdraw/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          amount: amountVal,
          bankDetailsId: bankDetails.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate withdrawal.");
      }

      toast.success("Withdrawal request submitted successfully!");
      setWithdrawAmount("");
      fetchDetails();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to submit withdrawal request.");
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#36013F] border-t-transparent"></div>
        <p className="ml-3 text-sm text-gray-500">Loading wallet & payout panel...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      <ToastContainer position="top-right" autoClose={3500} theme="colored" />

      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Financial Hub</p>
        <h1 className="text-2xl font-black text-[#36013F]">Wallet & Bank Payouts</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Earnings Card & Request Payout */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-[#36013F] to-[#550363] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[200px]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-wider text-purple-200 font-bold">Total Wallet Balance</p>
                <h2 className="text-3xl font-black mt-2">
                  Rs. {parseFloat(wallet?.balance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl">
                <Wallet className="h-6 w-6 text-[#F4D35E]" />
              </div>
            </div>
            <div className="mt-8 flex justify-between items-center text-xs text-purple-200">
              <div>
                <p className="opacity-75">Currency</p>
                <p className="font-bold text-white text-sm">INR</p>
              </div>
              <button onClick={fetchDetails} className="flex items-center gap-1 hover:text-white transition-colors">
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>
          </div>

          {/* Withdrawal Panel */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-md font-bold text-gray-800 flex items-center gap-2 mb-3">
              <Send className="h-5 w-5 text-[#36013F]" /> Request Withdrawal
            </h3>
            <p className="text-xs text-gray-500 mb-4">Minimum amount to withdraw is Rs. 100.00. Requires verified bank details.</p>

            <form onSubmit={handleWithdrawal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rs.</span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Min 100"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#36013F] outline-none"
                    min="100"
                    disabled={withdrawLoading || !bankDetails || bankDetails.verification_status !== "verified"}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={withdrawLoading || !bankDetails || bankDetails.verification_status !== "verified"}
                className="w-full bg-[#36013F] text-white py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-[#50035d] transition-all flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {withdrawLoading ? "Processing..." : "Submit Payout Request"}
              </button>
            </form>
          </div>
        </div>

        {/* Bank details panel */}
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Building className="h-5 w-5 text-gray-500" /> Bank Payout Account
            </h3>
            {bankDetails && (
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                bankDetails.verification_status === "verified"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : bankDetails.verification_status === "pending"
                  ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {bankDetails.verification_status === "verified" && <CheckCircle2 size={14} />}
                {bankDetails.verification_status === "rejected" && <XCircle size={14} />}
                <span className="capitalize">{bankDetails.verification_status}</span>
              </span>
            )}
          </div>

          <form onSubmit={handleBankVerify} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Account Holder Name</label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Name as in bank account"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#36013F] outline-none"
                required
                disabled={bankDetails?.verification_status === "verified"}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Bank account number"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#36013F] outline-none"
                required
                disabled={bankDetails?.verification_status === "verified"}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">IFSC Code</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="e.g. SBIN0001234"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#36013F] outline-none uppercase"
                required
                disabled={bankDetails?.verification_status === "verified"}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. State Bank of India"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#36013F] outline-none"
                disabled={bankDetails?.verification_status === "verified"}
              />
            </div>

            {bankDetails?.verification_status !== "verified" && (
              <div className="md:col-span-2 mt-2">
                <button
                  type="submit"
                  disabled={bankVerifying}
                  className="bg-gray-900 text-white font-bold text-xs py-3 px-6 rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                  {bankVerifying ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    "Save & Verify Bank Details"
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Transaction & Payout Request Logs */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Ledger */}
        <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-md font-bold text-gray-800 mb-3 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-gray-400" /> Wallet Transactions
          </h3>
          {transactions.length === 0 ? (
            <p className="text-xs text-gray-400 py-4">No wallet transactions recorded.</p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {transactions.map((tx) => {
                const isCredit = parseFloat(tx.amount) > 0;
                return (
                  <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-all">
                    <div className="flex items-center gap-2">
                      {isCredit ? (
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-gray-800 capitalize">{tx.type.replace("_", " ")}</p>
                        <p className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${isCredit ? "text-green-600" : "text-red-600"}`}>
                        {isCredit ? "+" : "-"} Rs. {Math.abs(parseFloat(tx.amount))}
                      </p>
                      <span className="text-[10px] capitalize text-gray-400">{tx.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Withdrawal Log */}
        <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h3 className="text-md font-bold text-gray-800 mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-gray-400" /> Withdrawal History
          </h3>
          {withdrawRequests.length === 0 ? (
            <p className="text-xs text-gray-400 py-4">No withdrawal requests found.</p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {withdrawRequests.map((wr) => (
                <div key={wr.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-all border border-gray-50">
                  <div>
                    <p className="text-xs font-bold text-gray-800">Payout of Rs. {parseFloat(wr.amount)}</p>
                    <p className="text-[10px] text-gray-400">{new Date(wr.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                    wr.status === "completed" 
                      ? "bg-green-50 text-green-700" 
                      : wr.status === "pending"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-red-50 text-red-700"
                  }`}>
                    {wr.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
