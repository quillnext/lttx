"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Check, X, Building, User, AlertCircle, RefreshCw, ClipboardCheck } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminPayoutsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // stores request.id if executing
  const [notes, setNotes] = useState({}); // stores adminNotes per request

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      // Fetch withdrawal requests join with profiles and bank_details
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select(`
          *,
          profiles:profile_id (id, full_name, email, phone, profile_type),
          bank_details:bank_details_id (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load withdrawal requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleDecision = async (requestId, status) => {
    setActionLoading(requestId);
    try {
      const res = await fetch("/api/admin/payouts/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          status,
          adminNotes: notes[requestId] || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Decision execution failed.");
      }

      toast.success(
        status === "completed"
          ? "Payout approved and marked completed!"
          : "Payout request rejected and funds returned."
      );
      
      // Clean notes for this request
      setNotes((prev) => {
        const next = { ...prev };
        delete next[requestId];
        return next;
      });

      fetchWithdrawals();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to submit decision.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#36013F] border-t-transparent"></div>
        <p className="ml-3 text-sm text-gray-500">Loading payout records...</p>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" autoClose={3500} theme="colored" />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#36013F]">Payouts Manager</h1>
          <p className="text-xs text-gray-500">Approve withdrawal payouts and audit transaction histories.</p>
        </div>
        <button
          onClick={fetchWithdrawals}
          className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-black border border-gray-200 px-3 py-1.5 rounded-xl bg-white hover:shadow-sm transition-all"
        >
          <RefreshCw size={14} /> Refresh Requests
        </button>
      </div>

      {/* PENDING REQUESTS PANEL */}
      <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="text-yellow-600 h-5 w-5" /> Pending Withdrawals ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center font-medium">No pending withdrawal requests.</p>
        ) : (
          <div className="space-y-6">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-6"
              >
                {/* Profile info & Bank info */}
                <div className="space-y-4 md:flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-[#36013F] font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                      <User size={12} /> {req.profiles?.full_name || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-400 font-bold uppercase">{req.profiles?.profile_type}</span>
                    <span className="text-xs text-gray-500">| {req.profiles?.email}</span>
                  </div>

                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-gray-150 flex items-start gap-2">
                      <Building className="text-gray-400 shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="font-bold text-gray-800">Holder: {req.bank_details?.account_holder_name}</p>
                        <p className="text-gray-500">Bank: {req.bank_details?.bank_name || "N/A"}</p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-150">
                      <p className="font-bold text-gray-800">A/C: {req.bank_details?.account_number}</p>
                      <p className="text-gray-500 font-mono">IFSC: {req.bank_details?.ifsc_code}</p>
                    </div>
                  </div>
                </div>

                {/* Amount, decision & notes */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-2xl font-black text-gray-900">
                      Rs. {parseFloat(req.amount).toLocaleString("en-IN")}
                    </span>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Requested Amt</p>
                  </div>

                  {/* Notes input */}
                  <input
                    type="text"
                    value={notes[req.id] || ""}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                    }
                    placeholder="Decision notes (optional)"
                    className="w-full md:w-56 p-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#36013F]"
                    disabled={actionLoading === req.id}
                  />

                  {/* Buttons */}
                  <div className="flex gap-2 w-full justify-end">
                    <button
                      onClick={() => handleDecision(req.id, "rejected")}
                      disabled={actionLoading === req.id}
                      className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
                    >
                      <X size={16} /> Reject
                    </button>
                    <button
                      onClick={() => handleDecision(req.id, "completed")}
                      disabled={actionLoading === req.id}
                      className="bg-green-600 text-white hover:bg-green-700 py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm transition-all"
                    >
                      {actionLoading === req.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <Check size={16} /> Approve & Payout
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PROCESSED REQUESTS AUDIT LOG */}
      <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardCheck className="text-gray-500 h-5 w-5" /> Processed Withdrawals Log
        </h2>

        {processedRequests.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No processed records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3">Requester</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Payout Details</th>
                  <th className="pb-3">Decision Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {processedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-gray-800">{req.profiles?.full_name}</p>
                      <p className="text-xs text-gray-400">{req.profiles?.email}</p>
                    </td>
                    <td className="py-4 font-bold text-gray-900">
                      Rs. {parseFloat(req.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          req.status === "completed"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 text-xs text-gray-500 max-w-[220px]">
                      <p className="font-semibold text-gray-800">TX ID: {req.payout_id || "N/A"}</p>
                      <p className="text-gray-400 italic">Notes: {req.admin_notes || "None"}</p>
                    </td>
                    <td className="py-4 text-xs text-gray-400">
                      {new Date(req.updated_at).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
