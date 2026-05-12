"use client";

import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, documentId } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { ChevronDown, ChevronUp, CircleCheckBig, Loader, Sparkles, X } from "lucide-react";
import SessionDetailsModal from "@/app/components/SessionDetailsModal";
import CaseSheetView from "@/app/components/CaseSheetView";
import ExpertPrescriptionBuilder from "@/app/components/ExpertPrescriptionBuilder";
import { supabase } from "@/lib/supabase";

const auth = getAuth(app);
const db = getFirestore(app);

export default function Messages() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState(null);
  const [replyLoading, setReplyLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState({});
  const [sessionData, setSessionData] = useState({});
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [activeTab, setActiveTab] = useState("questions");
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchQuestions(user.uid);
        fetchLeads(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchQuestions = async (expertId) => {
    try {
      const q = query(collection(db, "Questions"), where("expertId", "==", expertId));
      const querySnapshot = await getDocs(q);
      const questionList = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const rawDate = data.createdAt?.toDate?.() ?? new Date(data.createdAt);

        return {
          id: docSnap.id,
          ...data,
          rawTimestamp: rawDate,
          timestamp:
            rawDate.toLocaleDateString("en-GB") +
            " " +
            rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        };
      });

      const sorted = questionList.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
      setQuestions(sorted);
    } catch (error) {
      console.error("Error fetching questions:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async (expertId) => {
    try {
      console.log("Fetching leads for expert:", expertId);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('expert_id', expertId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("Supabase response data:", data);

      const leadList = data.map((item) => ({
        ...item,
        rawTimestamp: new Date(item.created_at),
        timestamp: new Date(item.created_at).toLocaleDateString("en-GB") + " " + new Date(item.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        userName: item.user_name || item.form_data?.name || "Traveller",
        question: item.form_data?.confusion || item.form_data?.question || item.form_data?.context || "New Service Request",
        serviceType: item.service_type,
        formData: item.form_data,
      }));
      setLeads(leadList);
    } catch (error) {
      console.error("Error fetching leads from Supabase:", error);
    }
  };

  const loadSessionData = async (sessionId) => {
    if (!sessionId || sessionData[sessionId]) return;
    try {
      const docSnap = await getDocs(query(collection(db, "RecentSearches"), where(documentId(), "==", sessionId)));
      if (!docSnap.empty) {
        setSessionData(prev => ({ ...prev, [sessionId]: docSnap.docs[0].data() }));
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };

  const openSessionModal = (question) => {
    if (!question.sessionId) return;

    // Prefer snapshot if available (handles permission issues)
    if (question.sessionSnapshot) {
      setSessionData(prev => ({ ...prev, [question.sessionId]: question.sessionSnapshot }));
      setSelectedSessionId(question.sessionId);
    } else {
      // Fallback for old data or if snapshot missing
      loadSessionData(question.sessionId);
      setSelectedSessionId(question.sessionId);
    }
  };

  const handleReply = async (question, structuredReply) => {
    const finalReply = structuredReply || replyText.trim();
    if (!finalReply) {
      setReplyError("Reply cannot be empty.");
      return;
    }

    setReplyLoading(true);
    try {
      const finalReplyToSave = typeof finalReply === 'object' ? JSON.stringify(finalReply) : finalReply;

      if (activeTab === "questions") {
        const questionRef = doc(db, "Questions", question.id);
        await updateDoc(questionRef, {
          reply: finalReplyToSave,
          status: "answered",
          repliedAt: new Date().toISOString(),
        });
      } else {
        const { error } = await supabase
          .from('leads')
          .update({
            reply: finalReplyToSave,
            status: "answered",
            replied_at: new Date().toISOString()
          })
          .eq('id', question.id);
        
        if (error) throw error;
      }

      const response = await fetch("/api/send-reply-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: question.userEmail || question.user_email || "",
          userName: question.userName,
          expertName: question.expertName || question.expert_name,
          question: question.question,
          reply: typeof finalReply === 'object' ? finalReply.coreAdvice : finalReply,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send reply email");
      }

      // Update local state
      if (activeTab === "questions") {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === question.id
              ? { ...q, reply: finalReplyToSave, status: "answered", repliedAt: new Date().toISOString() }
              : q
          )
        );
      } else {
        setLeads((prev) =>
          prev.map((q) =>
            q.id === question.id
              ? { ...q, reply: finalReplyToSave, status: "answered", replied_at: new Date().toISOString() }
              : q
          )
        );
      }

      setReplyModal(null);
      setReplyText("");
      setReplyError(null);
      setReplyLoading(false);
    } catch (error) {
      console.error("Error sending reply:", error.message);
      setReplyError(error.message);
      setReplyLoading(false);
    }
  };

  const handleGenerateDraft = async (question) => {
    setReplyLoading(true);
    try {
      const response = await fetch("/api/generate-expert-prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          sessionData: sessionData[question.sessionId]
        }),
      });
      const result = await response.json();
      if (result.success) {
        // Set the draft into the question object so the builder can see it
        setQuestions(prev => prev.map(q => q.id === question.id ? { ...q, aiDraft: result.data } : q));
        setReplyModal(prev => ({ ...prev, aiDraft: result.data }));
      }
    } catch (err) {
      console.error("Draft generation failed", err);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleAgreeSuggested = async (question) => {
    if (!question.suggestedAnswer || !question.suggestedAnswer.trim()) {
      setReplyError("No suggested answer available.");
      return;
    }

    setReplyLoading(true);
    try {
      const questionRef = doc(db, "Questions", question.id);
      await updateDoc(questionRef, {
        reply: question.suggestedAnswer,
        status: "answered",
        repliedAt: new Date().toISOString(),
      });

      const response = await fetch("/api/send-reply-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: question.userEmail,
          userName: question.userName,
          expertName: question.expertName,
          question: question.question,
          reply: question.suggestedAnswer,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send reply email");
      }

      // Update the question in the state to reflect the reply and status
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? { ...q, reply: question.suggestedAnswer, status: "answered", repliedAt: new Date().toISOString() }
            : q
        )
      );
      setReplyModal(null);
      setReplyText("");
      setReplyError(null);
      setReplyLoading(false);
    } catch (error) {
      console.error("Error agreeing with suggested answer:", error.message);
      setReplyError(error.message);
      setReplyLoading(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const currentData = activeTab === "questions" ? questions : leads;

  const filteredData = currentData.filter((item) =>
    item.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const isAdminPrompt = (question) => question.isAdminPrompt || question.status === "admin_prompt";

  return (
    <div className="p-4 text-gray-800">
      <SessionDetailsModal
        isOpen={!!selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
        sessionData={sessionData[selectedSessionId] ? { id: selectedSessionId, ...sessionData[selectedSessionId] } : null}
      />

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-black text-[#36013F]">💬 Messages & Requests</h1>
        <div className="flex items-center bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => { setActiveTab("questions"); setCurrentPage(1); }}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "questions" ? "bg-white text-[#36013F] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Questions
          </button>
          <button 
            onClick={() => { setActiveTab("leads"); setCurrentPage(1); }}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "leads" ? "bg-white text-[#36013F] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Service Requests
          </button>
        </div>
        <input
          type="text"
          placeholder="Search by user name..."
          className="p-3 border border-gray-200 rounded-xl w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-[#36013F] bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-600">
          <svg
            className="animate-spin h-5 w-5 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          Loading {activeTab === "questions" ? "questions" : "requests"}...
        </div>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
           <p className="text-gray-400 font-medium">
            {searchTerm ? "No matching results found." : `No ${activeTab === "questions" ? "questions" : "requests"} available yet.`}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#36013F] text-white">
              <tr>
                <th className="p-4 border-none first:rounded-tl-xl">Date</th>
                <th className="p-4 border-none">User</th>
                <th className="p-4 border-none">{activeTab === "questions" ? "Source" : "Service"}</th>
                <th className="p-4 border-none">Status</th>
                <th className="p-4 border-none">Action</th>
                <th className="p-4 border-none last:rounded-tr-xl w-12"></th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((q) => (
                <React.Fragment key={q.id}>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="p-4 border-b">{q.timestamp || "N/A"}</td>
                    <td className="p-4 border-b font-bold">{q.userName || "N/A"}</td>
                    <td className="p-4 border-b">
                      {activeTab === "questions" ? (
                        isAdminPrompt(q) ? (
                          <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 text-[10px] rounded-full uppercase tracking-wider">
                            Admin
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 font-bold px-3 py-1 text-[10px] rounded-full uppercase tracking-wider">
                            User
                          </span>
                        )
                      ) : (
                        <span className="bg-purple-100 text-purple-800 font-bold px-3 py-1 text-[10px] rounded-full uppercase tracking-wider">
                          {q.serviceType || "Custom"}
                        </span>
                      )}
                    </td>
                    <td className="p-3 border">
                      {q.status === "answered" ? (
                        <span className="bg-primary text-white font-medium px-3 py-1 text-xs rounded-lg flex items-center gap-2">
                          <CircleCheckBig size={14} /> Answered
                        </span>
                      ) : q.status === "pending" ? (
                        <span className="bg-secondary text-[#36013F] font-medium px-3 py-1 text-xs rounded-lg flex items-center gap-2">
                          <Loader className="spin-animation" size={14} /> Pending
                        </span>
                      ) : q.status === "admin_prompt" ? (
                        <span className="bg-yellow-200 text-yellow-800 font-medium px-3 py-1 text-xs rounded-lg flex items-center gap-2">
                          <Loader className="spin-animation" size={14} /> Admin Prompt
                        </span>
                      ) : null}
                    </td>
                    <td className="p-3 border">
                      {q.status !== "answered" && (
                        <button
                          onClick={() => setReplyModal(q)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-[#36013F] text-white hover:bg-[#4a0150] focus:outline-none focus:ring-2 focus:ring-[#36013F]"
                        >
                          {isAdminPrompt(q) ? "Review Prompt" : "Reply"}
                        </button>
                      )}
                    </td>
                    <td className="p-3 border">
                      <button
                        onClick={() => toggleRow(q.id)}
                        className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#36013F] rounded"
                        aria-expanded={expandedRows[q.id] || false}
                        aria-label={expandedRows[q.id] ? "Collapse question details" : "Expand question details"}
                      >
                        {expandedRows[q.id] ? <ChevronUp /> : <ChevronDown />}
                      </button>
                    </td>
                  </tr>
                  {expandedRows[q.id] && (
                    <tr key={`${q.id}-details`}>
                      <td colSpan="6" className="p-4 border-b bg-gray-50">
                        <div className="flex flex-col md:flex-row gap-6 text-gray-700">
                          <div className="w-full md:w-1/2 space-y-3">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {activeTab === "questions" ? "The Question" : "Service Context"}
                              </p>
                              <p className="text-sm font-medium leading-relaxed">
                                {q.question || "N/A"}
                              </p>
                            </div>

                            {activeTab === "leads" && (
                              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">Destination</p>
                                  <p className="text-xs font-bold text-[#36013F]">{q.destination || "N/A"}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">Dates</p>
                                  <p className="text-xs font-bold text-[#36013F]">{q.trip_dates || "N/A"}</p>
                                </div>
                                {q.formData?.budget && (
                                  <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Budget</p>
                                    <p className="text-xs font-bold text-[#36013F]">{q.formData.budget}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {isAdminPrompt(q) && q.suggestedAnswer && (
                              <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
                                <strong>Suggested Answer (Admin):</strong>
                                <p className="text-sm mt-1">{q.suggestedAnswer}</p>
                              </div>
                            )}

                            {q.sessionId && (
                              <div className="mt-3">
                                <button
                                  onClick={() => openSessionModal(q)}
                                  className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-[#36013F] px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-purple-200"
                                >
                                  <Loader size={12} />
                                  See Search Context & Insights
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="w-full md:w-1/2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                              {q.status === "answered" ? "Final Prescription" : "Status Note"}
                            </p>
                            <div className="p-3 bg-white rounded-xl border border-gray-200 min-h-[80px]">
                              {q.reply && q.reply.trim() !== "" ? (
                                <p className="text-sm italic text-gray-600">
                                  {q.reply.length > 300 ? q.reply.substring(0, 300) + "..." : q.reply}
                                </p>
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
              className={`px-3 py-1 rounded-md text-sm font-medium border transition ${page === currentPage
                ? "bg-[#36013F] text-white border-[#36013F]"
                : "text-gray-700 border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#36013F]"
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
            {/* Modal Header */}
            <div className="p-6 bg-white border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#36013F]">
                  {isAdminPrompt(replyModal) ? "Review Admin Prompt" : "Responding to"} {replyModal.userName || "User"}
                </h2>
                <p className="text-xs text-gray-500">Case ID: {replyModal.id}</p>
              </div>
              <button
                onClick={() => {
                  setReplyModal(null);
                  setReplyText("");
                  setReplyError(null);
                }}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Two Column Layout */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Left: Case Sheet (Scrollable) */}
              <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r custom-scrollbar bg-white">
                <CaseSheetView question={replyModal} sessionData={sessionData} />
              </div>

              {/* Right: Prescription Builder (Scrollable) */}
              <div className="w-full md:w-1/2 p-6 overflow-y-auto custom-scrollbar bg-gray-50">
                {isAdminPrompt(replyModal) && replyModal.suggestedAnswer && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="text-yellow-600" size={16} />
                      <strong className="text-sm font-bold text-yellow-800 uppercase tracking-wider">Admin Suggestion</strong>
                    </div>
                    <p className="text-xs text-yellow-900 mb-4 leading-relaxed italic">
                      "{replyModal.suggestedAnswer}"
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAgreeSuggested(replyModal)}
                      disabled={replyLoading}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-950 py-2 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      {replyLoading ? <Loader className="animate-spin" size={14} /> : <CircleCheckBig size={14} />}
                      Use Admin Suggestion
                    </button>
                  </div>
                )}

                <ExpertPrescriptionBuilder
                  question={replyModal}
                  onDraftGenerate={() => handleGenerateDraft(replyModal)}
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