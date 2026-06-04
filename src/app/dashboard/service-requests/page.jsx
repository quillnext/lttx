"use client";

import React, { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, CircleCheckBig, Loader, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import CaseSheetView from "@/app/components/CaseSheetView";
import ExpertPrescriptionBuilder from "@/app/components/ExpertPrescriptionBuilder";
import PrescriptionUserView from "@/app/components/PrescriptionUserView";

const parsePrescription = (reply) => {
  if (!reply || typeof reply !== "string") return null;
  try {
    const parsed = JSON.parse(reply);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const getReplyPreview = (reply) => {
  const parsed = parsePrescription(reply);
  if (parsed) return parsed.coreAdvice || parsed.diagnosis || "Structured prescription saved.";
  return reply || "";
};

const getMessage = (row) =>
  row.form_data?.confusion ||
  row.form_data?.question ||
  row.form_data?.context ||
  row.form_data?.mustHaves ||
  row.form_data?.exp ||
  "New service request";

const fetchLeads = async () => {
  const response = await fetch("/api/leads", { cache: "no-store" });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch service requests");
  }

  return result.leads || [];
};

const getStatusLabel = (status) => {
  const labels = {
    pending: "Pending",
    accepted: "Accepted",
    clarification_requested: "Clarification Requested",
    answered: "Completed",
    admin_prompt: "Admin Prompt",
    escalated: "Escalated",
  };
  return labels[status] || status || "Pending";
};

const normalizeRequest = (row) => {
  const rawDate = row.created_at ? new Date(row.created_at) : new Date();
  const formData = row.form_data || {};

  return {
    id: row.id,
    rawTimestamp: rawDate,
    timestamp:
      rawDate.toLocaleDateString("en-GB") +
      " " +
      rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    userName: row.user_name || formData.name || "Traveller",
    userEmail: row.user_email || formData.email || "",
    userPhone: formData.phone || formData.whatsapp || "",
    expertName: row.expert_name || "Unknown Expert",
    expert_id: row.expert_id,
    serviceType: row.service_type || "Service Request",
    status: row.status || "pending",
    question: getMessage(row),
    reply: row.reply || "",
    replied_at: row.replied_at || null,
    destination: row.destination || formData.destination || formData.dest || "",
    trip_dates:
      row.trip_dates ||
      (formData.startDate && formData.endDate ? `${formData.startDate} to ${formData.endDate}` : formData.dates || ""),
    formData,
  };
};

export default function ServiceRequestsDashboardPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState({});
  const [replyModal, setReplyModal] = useState(null);
  const [replyError, setReplyError] = useState(null);
  const [replyLoading, setReplyLoading] = useState(false);

  const [reminding, setReminding] = useState({});
  const [experts, setExperts] = useState([]);
  const [redirectModal, setRedirectModal] = useState(null);
  const [selectedNewExpert, setSelectedNewExpert] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const response = await fetch("/api/admin/profiles");
        const result = await response.json();
        setExperts(result.profiles || []);
      } catch (err) {
        console.error("Error fetching experts:", err);
      }
    };
    fetchExperts();
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const data = await fetchLeads();
        const list = data.map((row) => normalizeRequest(row));

        setRequests(list);
      } catch (error) {
        console.error("Error fetching service requests:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRequestsSilent = async () => {
      try {
        const data = await fetchLeads();
        const list = data.map((row) => normalizeRequest(row));
        setRequests(list);
      } catch (error) {
        console.error("Error fetching service requests silently:", error);
      }
    };

    fetchRequests();

    // Subscribe to real-time changes on 'leads' table for admin dashboard
    const channel = supabase
      .channel('admin_leads')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          console.log('Admin real-time update on leads table:', payload);
          const { eventType, new: newRow, old: oldRow } = payload;

          if (eventType === 'INSERT') {
            const newRequest = normalizeRequest(newRow);
            setRequests((prev) => {
              // Avoid duplicate inserts
              if (prev.some((r) => r.id === newRequest.id)) return prev;
              return [newRequest, ...prev];
            });
          } else if (eventType === 'UPDATE') {
            const updatedRequest = normalizeRequest(newRow);
            setRequests((prev) =>
              prev.map((r) => (r.id === updatedRequest.id ? updatedRequest : r))
            );
          } else if (eventType === 'DELETE') {
            setRequests((prev) => prev.filter((r) => r.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    // Robust silent background polling fallback every 5 seconds
    const pollInterval = setInterval(() => {
      fetchRequestsSilent();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this service request?");
    if (!confirm) return;

    const response = await fetch(`/api/leads?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const result = await response.json();

    if (!response.ok) {
      console.error("Error deleting service request:", result.error);
      alert(result.error || "Failed to delete service request.");
      return;
    }

    setRequests((prev) => prev.filter((request) => request.id !== id));
  };

  const handleSendReminder = async (q) => {
    setReminding(prev => ({ ...prev, [q.id]: true }));
    try {
      const expertEmail = experts.find(e => e.id === q.expert_id)?.email || "";
      const res = await fetch("/api/leads/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: q.id,
          expertEmail: expertEmail,
          expertName: q.expertName,
          questionText: q.question
        })
      });
      if (res.ok) {
        alert("Reminder sent successfully!");
        setRequests(prev => prev.map(item =>
          item.id === q.id
            ? { ...item, formData: { ...item.formData, reminderCount: (item.formData?.reminderCount || 0) + 1 } }
            : item
        ));
      } else {
        const d = await res.json();
        alert(d.error || "Failed to send reminder");
      }
    } catch (e) {
      console.error(e);
      alert("Error sending reminder");
    } finally {
      setReminding(prev => ({ ...prev, [q.id]: false }));
    }
  };

  const handleRedirectSubmit = async () => {
    if (!redirectModal || !selectedNewExpert) return;

    setRedirecting(true);
    try {
      const expertObj = experts.find(e => e.id === selectedNewExpert);
      if (!expertObj) throw new Error("Selected expert not found");

      const res = await fetch("/api/leads/redirect-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: redirectModal.id,
          newExpertId: expertObj.id,
          newExpertName: expertObj.fullName || expertObj.full_name || expertObj.name,
          newExpertEmail: expertObj.email,
          questionText: redirectModal.question,
          userName: redirectModal.userName,
          userEmail: redirectModal.userEmail
        })
      });

      if (res.ok) {
        alert("Request redirected successfully!");
        setRequests(prev => prev.map(q =>
          q.id === redirectModal.id
            ? { 
                ...q, 
                expert_id: expertObj.id, 
                expertName: expertObj.fullName || expertObj.full_name || expertObj.name, 
                status: "pending",
                formData: { ...q.formData, isRedirected: true, reminderCount: 0 }
              }
            : q
        ));
        setRedirectModal(null);
        setSelectedNewExpert("");
      } else {
        const d = await res.json();
        alert(d.error || "Redirect failed");
      }
    } catch (e) {
      console.error(e);
      alert("Error redirecting request: " + e.message);
    } finally {
      setRedirecting(false);
    }
  };

  const updateLead = async (request, updates) => {
    const response = await fetch("/api/leads/update-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: request.id,
        expertName: request.expertName,
        ...updates,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to update service request.");
    }

    return result.lead;
  };

  const handleStatusChange = async (request, nextStatus) => {
    setReplyError(null);
    setReplyLoading(true);
    try {
      await updateLead(request, { status: nextStatus });
      setRequests((prev) =>
        prev.map((item) => (item.id === request.id ? { ...item, status: nextStatus } : item))
      );
      setReplyModal((prev) => (prev?.id === request.id ? { ...prev, status: nextStatus } : prev));
    } catch (error) {
      console.error("Error updating status:", error);
      setReplyError(error.message || "Failed to update status.");
    } finally {
      setReplyLoading(false);
    }
  };

  const handleReply = async (request, structuredReply) => {
    if (!structuredReply) {
      setReplyError("Reply cannot be empty.");
      return;
    }

    setReplyError(null);
    setReplyLoading(true);
    try {
      const finalReply = typeof structuredReply === "object" ? JSON.stringify(structuredReply) : structuredReply;
      await updateLead(request, { reply: finalReply, status: "answered" });

      const emailResponse = await fetch("/api/send-expert-reply-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: request.userEmail,
          userPhone: request.userPhone || request.formData?.phone || request.formData?.whatsapp || "",
          userName: request.userName,
          expertName: request.expertName,
          expertPhoto: experts.find(e => e.id === request.expert_id)?.photo || "",
          expertUsername: experts.find(e => e.id === request.expert_id)?.username || "",
          question: request.question,
          serviceType: request.serviceType,
          reply: finalReply,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.error || "Reply saved, but email could not be sent.");
      }

      setRequests((prev) =>
        prev.map((item) =>
          item.id === request.id
            ? { ...item, reply: finalReply, status: "answered", replied_at: new Date().toISOString() }
            : item
        )
      );
      setReplyModal(null);
    } catch (error) {
      console.error("Error sending service request reply:", error);
      setReplyError(error.message || "Failed to send reply.");
    } finally {
      setReplyLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const term = searchTerm.toLowerCase();
    return (
      request.userName?.toLowerCase().includes(term) ||
      request.expertName?.toLowerCase().includes(term) ||
      request.serviceType?.toLowerCase().includes(term) ||
      request.status?.toLowerCase().includes(term) ||
      request.question?.toLowerCase().includes(term)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  return (
    <div className="p-4 text-gray-800">
      {/* Redirect Modal */}
      {redirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-4 text-[#36013F]">Redirect Service Request</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select a new expert for: <strong>"{redirectModal.question?.substring(0, 50)}..."</strong>
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">New Expert</label>
              <select
                className="w-full p-3 border rounded-xl bg-gray-50 font-medium outline-none focus:ring-2 focus:ring-[#36013F]"
                value={selectedNewExpert}
                onChange={(e) => setSelectedNewExpert(e.target.value)}
              >
                <option value="">-- Select Expert --</option>
                {experts.filter(e => e.id !== redirectModal.expert_id).map(e => (
                  <option key={e.id} value={e.id}>{e.fullName || e.full_name || e.name} ({e.email})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRedirectModal(null)}
                className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-600 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRedirectSubmit}
                disabled={redirecting || !selectedNewExpert}
                className="flex-1 py-3 rounded-xl bg-[#36013F] text-white font-bold hover:bg-[#4a0152] disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {redirecting && <Loader className="animate-spin w-4 h-4" />} Confirm Redirect
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-black text-[#36013F]">Service Requests</h1>
        <input
          type="text"
          placeholder="Search by user, expert, service, or status..."
          className="p-3 border border-gray-200 rounded-xl w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-[#36013F] bg-white"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin h-5 w-5" /> Loading service requests...
        </div>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
          <p className="text-gray-400 font-medium">
            {searchTerm ? "No matching service requests found." : "No service requests available yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#36013F] text-white">
              <tr>
                <th className="p-4 border-none first:rounded-tl-xl">Date</th>
                <th className="p-4 border-none">User</th>
                <th className="p-4 border-none">Service</th>
                <th className="p-4 border-none">Expert</th>
                <th className="p-4 border-none">Status</th>
                <th className="p-4 border-none">Actions</th>
                <th className="p-4 border-none last:rounded-tr-xl w-12"></th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((request) => (
                <React.Fragment key={request.id}>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="p-4 border-b">{request.timestamp}</td>
                    <td className="p-4 border-b">
                      <p className="font-bold">{request.userName}</p>
                      <p className="text-xs text-gray-500">{request.userEmail || request.userPhone || "No contact saved"}</p>
                    </td>
                    <td className="p-4 border-b">
                      <span className="bg-purple-100 text-purple-800 font-bold px-3 py-1 text-[10px] rounded-full uppercase tracking-wider">
                        {request.serviceType}
                      </span>
                    </td>
                    <td className="p-4 border-b font-bold">
                      {request.expertName}
                      {request.formData?.isRedirected && <span className="block text-[10px] text-red-500 font-bold uppercase mt-1">Redirected</span>}
                    </td>
                    <td className="p-3 border-b">
                      <div className="space-y-1">
                        <span
                          className={`font-medium px-3 py-1 text-xs rounded-lg inline-flex items-center gap-2 ${
                            request.status === "answered"
                              ? "bg-green-100 text-green-800"
                              : request.status === "accepted"
                                ? "bg-blue-100 text-blue-800"
                                : request.status === "clarification_requested"
                                  ? "bg-amber-100 text-amber-800"
                                  : request.status === "escalated"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-secondary text-[#36013F]"
                          }`}
                        >
                          {request.status === "answered" ? <CircleCheckBig size={14} /> : <Loader className="spin-animation" size={14} />}
                          {getStatusLabel(request.status)}
                        </span>
                        {/* Reminder Status Badge */}
                        {request.status !== "answered" && request.formData?.reminderCount > 0 && (
                          <span className="block text-[10px] font-bold text-orange-600 mt-1">
                            {request.formData.reminderCount} Reminders Sent
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 border-b">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          Delete
                        </button>
                        
                        {request.status !== "answered" && (
                          <>
                            <button
                              onClick={() => setReplyModal(request)}
                              className="px-3 py-1 w-full rounded-lg text-xs font-medium bg-[#36013F] text-white hover:bg-[#4a0150]"
                            >
                              {request.status === "accepted" ? "Start Response" : "Reply"}
                            </button>
                            
                            <button
                              onClick={() => handleSendReminder(request)}
                              disabled={reminding[request.id]}
                              className="px-3 py-1 w-full rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:opacity-50"
                            >
                              {reminding[request.id] ? "Sending..." : "Send Reminder"}
                            </button>

                            {(request.formData?.reminderCount >= 3) && (
                              <button
                                onClick={() => setRedirectModal(request)}
                                className="px-3 py-1 w-full rounded-lg text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200"
                              >
                                Redirect
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-3 border-b">
                      <button
                        onClick={() => setExpandedRows((prev) => ({ ...prev, [request.id]: !prev[request.id] }))}
                        className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#36013F] rounded"
                        aria-expanded={expandedRows[request.id] || false}
                        aria-label={expandedRows[request.id] ? "Collapse request details" : "Expand request details"}
                      >
                        {expandedRows[request.id] ? <ChevronUp /> : <ChevronDown />}
                      </button>
                    </td>
                  </tr>
                  {expandedRows[request.id] && (
                    <tr key={`${request.id}-details`}>
                      <td colSpan="7" className="p-4 border-b bg-gray-50">
                        <div className="flex flex-col md:flex-row gap-6 text-gray-700">
                          <div className="w-full md:w-1/2 space-y-3">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Service Context</p>
                              <p className="text-sm font-medium leading-relaxed">{request.question}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Destination</p>
                                <p className="text-xs font-bold text-[#36013F]">{request.destination || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Dates</p>
                                <p className="text-xs font-bold text-[#36013F]">{request.trip_dates || "N/A"}</p>
                              </div>
                              {request.formData?.payment?.status && (
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">Payment</p>
                                  <p className="text-xs font-bold text-[#36013F]">
                                    {request.formData.payment.status === "paid" ? `Paid Rs. ${request.formData.payment.amount}` : "Not required"}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="w-full md:w-1/2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                              {request.status === "answered" ? "Final Prescription" : "Status Note"}
                            </p>
                            <div className="p-3 bg-white rounded-xl border border-gray-200 min-h-[80px]">
                              {request.reply ? (
                                parsePrescription(request.reply) ? (
                                  <PrescriptionUserView prescription={parsePrescription(request.reply)} />
                                ) : (
                                  <p className="text-sm italic text-gray-600">
                                    {getReplyPreview(request.reply).length > 300
                                      ? `${getReplyPreview(request.reply).substring(0, 300)}...`
                                      : getReplyPreview(request.reply)}
                                  </p>
                                )
                              ) : (
                                <p className="text-sm text-gray-400 italic">No reply sent yet. Expert needs to review this case.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`px-3 py-1 rounded-md text-sm font-medium border transition ${
                page === currentPage
                  ? "bg-[#36013F] text-white border-[#36013F]"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {replyModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-50 rounded-[32px] shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-white">
            <div className="p-6 bg-white border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#36013F]">Responding to {replyModal.userName || "User"}</h2>
                <p className="text-xs text-gray-500">
                  Case ID: {replyModal.id} - Status: {getStatusLabel(replyModal.status)}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {replyModal.status === "pending" && (
                  <button
                    onClick={() => handleStatusChange(replyModal, "accepted")}
                    disabled={replyLoading}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100 disabled:opacity-50"
                  >
                    <Check size={14} /> Accept Case
                  </button>
                )}
                <button
                  onClick={() => {
                    setReplyModal(null);
                    setReplyError(null);
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r custom-scrollbar bg-white">
                <CaseSheetView question={replyModal} sessionData={{}} isAdmin={true} />
              </div>

              <div className="w-full md:w-1/2 p-6 overflow-y-auto custom-scrollbar bg-gray-50">
                {replyError && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                    {replyError}
                  </div>
                )}
                <ExpertPrescriptionBuilder
                  question={replyModal}
                  onDraftGenerate={() => setReplyError("AI assist is available in the expert dashboard. You can still write and finalize the response here.")}
                  onSave={(data) => handleReply(replyModal, data)}
                  isLoading={replyLoading}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
