"use client";

import { useEffect, useState } from "react";


import { supabase } from "@/lib/supabase";
import { useUserAuthStore } from "@/stores/useUserAuthStore";
import PrescriptionUserView from "@/app/components/PrescriptionUserView";
import { History, Calendar, CheckCircle, Clock, CreditCard, DollarSign, ChevronDown, ChevronUp } from "lucide-react";

const getMessage = (row) =>
  row.form_data?.confusion ||
  row.form_data?.question ||
  row.form_data?.context ||
  row.form_data?.mustHaves ||
  row.form_data?.exp ||
  "Service request";

const parsePrescription = (reply) => {
  if (!reply || typeof reply !== "string") return null;
  try {
    const parsed = JSON.parse(reply);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const fetchUserLeads = async (email) => {
  const response = await fetch(`/api/leads?userEmail=${encodeURIComponent(email)}`, {
    cache: "no-store",
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch user requests");
  }

  return result.leads || [];
};

export default function AgencyRequestsHistoryPage() {
  const { user: supabaseUser } = useUserAuthStore();
  const [currentUser, setCurrentUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((fUser) => {
      if (fUser) {
        setCurrentUser(fUser);
      } else if (supabaseUser) {
        setCurrentUser(supabaseUser);
      } else {
        setCurrentUser(null);
      }
    });

    if (!getAuth(app).currentUser && supabaseUser) {
      setCurrentUser(supabaseUser);
    }
    return () => unsubscribe();
  }, [supabaseUser]);

  useEffect(() => {
    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const data = await fetchUserLeads(currentUser.email);
        setRequests(data || []);
      } catch (error) {
        console.error("Error fetching agency requests:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRequestsSilent = async () => {
      try {
        const data = await fetchUserLeads(currentUser.email);
        setRequests(data || []);
      } catch (error) {
        console.error("Error silently fetching agency requests:", error);
      }
    };

    fetchRequests();

    // Subscribe to real-time changes on 'leads' table for this agency's email
    const channel = supabase
      .channel(`agency_leads_${currentUser.email}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          console.log('Agency real-time update on leads table:', payload);
          const { eventType, new: newRow, old: oldRow } = payload;

          if (eventType === 'INSERT') {
            if (newRow.user_email?.toLowerCase() === currentUser.email?.toLowerCase()) {
              setRequests((prev) => {
                if (prev.some((r) => r.id === newRow.id)) return prev;
                return [newRow, ...prev];
              });
            }
          } else if (eventType === 'UPDATE') {
            if (newRow.user_email?.toLowerCase() === currentUser.email?.toLowerCase()) {
              setRequests((prev) =>
                prev.map((r) => (r.id === newRow.id ? newRow : r))
              );
            } else {
              setRequests((prev) => prev.filter((r) => r.id !== newRow.id));
            }
          } else if (eventType === 'DELETE') {
            setRequests((prev) => prev.filter((r) => r.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    const pollInterval = setInterval(() => {
      fetchRequestsSilent();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [currentUser?.email]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-screen bg-gray-50">
        <svg className="animate-spin h-8 w-8 text-[#36013F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <History className="w-8 h-8 text-[#36013F]" />
          <div>
            <h1 className="text-3xl font-bold text-[#36013F]">My Requests & Payments</h1>
            <p className="text-sm text-gray-500 mt-1">Track all your requested expert services, replies, and payment status.</p>
          </div>
        </div>

        {requests.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-800">No requests submitted yet</h2>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">Your outbound queries, consultation sessions, and payments will show up here.</p>
          </section>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => {
              const payment = request.form_data?.payment;
              const dateStr = request.created_at
                ? new Date(request.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A";

              return (
                <section key={request.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#36013F]"></div>

                  {/* Header Row */}
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between border-b border-gray-100 pb-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        {request.service_type || "Service Request"}
                      </p>
                      <h2 className="mt-1.5 font-bold text-lg text-[#36013F] leading-snug">
                        {getMessage(request)}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Requested: {dateStr}
                        </span>
                        <span>•</span>
                        <span>Expert: <strong className="text-gray-700">{request.expert_name || "Assigned Expert"}</strong></span>
                      </div>
                    </div>
                    
                    <span
                      className={`w-fit rounded-lg px-3 py-1.5 text-xs font-bold self-start md:self-auto ${
                        request.status === "answered" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.status === "answered" ? "Completed" : (request.status || "Pending")}
                    </span>
                  </div>

                  {/* Payment Details Container */}
                  <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>Payment Status:</span>
                      <strong className={`uppercase font-bold ${payment?.status === "paid" ? "text-green-700" : "text-gray-500"}`}>
                        {payment?.status || "unpaid"}
                      </strong>
                    </div>
                    {payment?.status === "paid" && (
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-500">
                        <div>Amount: <strong className="text-gray-800">₹{payment.amount}</strong></div>
                        {payment.paymentId && (
                          <div>Payment ID: <code className="bg-gray-150 px-1.5 py-0.5 rounded text-[11px] text-gray-600 font-mono">{payment.paymentId}</code></div>
                        )}
                        {payment.orderId && (
                          <div>Order ID: <code className="bg-gray-150 px-1.5 py-0.5 rounded text-[11px] text-gray-600 font-mono">{payment.orderId}</code></div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Reply Details */}
                  {request.reply && (
                    <div className="mt-2 border-t border-gray-100 pt-4">
                      <button
                        onClick={() => toggleRow(request.id)}
                        className="flex items-center justify-between w-full text-left focus:outline-none group"
                      >
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-[#36013F] transition-colors">
                          Expert Response
                        </p>
                        <span className="text-gray-400 group-hover:text-[#36013F] transition-colors">
                          {expandedRows[request.id] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                      </button>

                      {expandedRows[request.id] && (
                        <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                          {parsePrescription(request.reply) ? (
                            <PrescriptionUserView prescription={parsePrescription(request.reply)} />
                          ) : (
                            <div className="rounded-2xl border border-gray-250 bg-gray-50 p-5 text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                              {request.reply}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
