"use client";

import React, { useState, useEffect } from "react";
import { Loader, Landmark, Check, X, AlertCircle, RefreshCw, Clock, CheckCircle, XCircle } from "lucide-react";

export default function AdminWithdrawalsPage() {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [feedbackText, setFeedbackText] = useState({});

  const fetchWithdrawals = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/withdrawals");
      if (!res.ok) throw new Error("Failed to fetch withdrawals");
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load withdrawal requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (requestId, status) => {
    setProcessingId(requestId);
    setErrorMsg("");
    setSuccessMsg("");

    const feedback = feedbackText[requestId] || "";

    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          status,
          adminFeedback: feedback,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process withdrawal");

      setSuccessMsg(data.message);
      // Remove or update the item in state
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === requestId ? { ...w, status, admin_feedback: feedback } : w))
      );
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = withdrawals.filter((w) => w.status === "pending");
  const processedRequests = withdrawals.filter((w) => w.status !== "pending");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader className="w-8 h-8 text-[#36013F] animate-spin" />
        <p className="text-sm text-gray-500 mt-2 font-medium">Loading withdrawal requests ledger...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBFD] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Withdrawal Approvals</h1>
            <p className="text-sm text-gray-500 mt-1">Review and approve expert payout withdrawal requests.</p>
          </div>
          <button
            onClick={fetchWithdrawals}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-semibold transition-colors bg-white shadow-sm"
          >
            <RefreshCw size={15} /> Refresh List
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
            <CheckCircle className="w-5 h-5 shrink-0 animate-bounce" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Pending Requests Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Clock className="text-amber-500 w-5 h-5" />
            <span>Pending Payout Requests ({pendingRequests.length})</span>
          </h2>

          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-400">
              <Landmark className="w-12 h-12 mx-auto opacity-35 mb-3" />
              <p className="text-sm font-bold">No pending withdrawal requests found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900">{req.profiles?.full_name || "Expert"}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">{req.profiles?.email}</p>
                      </div>
                      <p className="text-lg font-black text-[#36013F]">₹{parseFloat(req.amount).toLocaleString("en-IN")}</p>
                    </div>

                    <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100 text-xs text-gray-600 space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bank Snapshot</p>
                      <p><strong>Bank:</strong> {req.bank_details_snapshot?.bank_name}</p>
                      <p><strong>Holder:</strong> {req.bank_details_snapshot?.account_holder_name}</p>
                      <p><strong>A/c No:</strong> {req.bank_details_snapshot?.account_number}</p>
                      <p><strong>IFSC:</strong> {req.bank_details_snapshot?.ifsc_code}</p>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Admin feedback (optional)"
                        value={feedbackText[req.id] || ""}
                        onChange={(e) => setFeedbackText({ ...feedbackText, [req.id]: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#36013F] transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleAction(req.id, "approved")}
                      disabled={processingId !== null}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      {processingId === req.id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Check size={14} />}
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "rejected")}
                      disabled={processingId !== null}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 disabled:opacity-50 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      {processingId === req.id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <X size={14} />}
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Processed requests log */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <CheckCircle className="text-green-600 w-5 h-5" />
            <span>Completed Payout History ({processedRequests.length})</span>
          </h2>

          {processedRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center text-gray-400">
              <p className="text-sm font-semibold">No payout requests have been approved or rejected yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500 border-collapse">
                  <thead className="text-xs uppercase bg-gray-50 text-gray-700 font-bold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Expert</th>
                      <th className="px-6 py-4">Bank Snapshot</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date processed</th>
                      <th className="px-6 py-4">Admin Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold text-gray-900">
                    {processedRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-extrabold text-gray-900">{req.profiles?.full_name || "Expert"}</p>
                            <span className="text-[10px] text-gray-400">{req.profiles?.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          <p>{req.bank_details_snapshot?.bank_name} - {req.bank_details_snapshot?.account_number}</p>
                          <span className="text-[10px] text-gray-400">IFSC: {req.bank_details_snapshot?.ifsc_code}</span>
                        </td>
                        <td className="px-6 py-4 font-black">₹{parseFloat(req.amount).toLocaleString("en-IN")}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            req.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                          {new Date(req.updated_at).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 font-medium italic">
                          {req.admin_feedback || "Processed successfully."}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
