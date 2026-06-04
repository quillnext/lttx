"use client";

import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { Check, ChevronDown, ChevronUp, CircleCheckBig, Loader, Sparkles, X } from "lucide-react";
import SessionDetailsModal from "@/app/components/SessionDetailsModal";
import CaseSheetView from "@/app/components/CaseSheetView";
import ExpertPrescriptionBuilder from "@/app/components/ExpertPrescriptionBuilder";
import PrescriptionUserView from "@/app/components/PrescriptionUserView";
import { supabase } from "@/lib/supabase";

const auth = getAuth(app);
const db = getFirestore(app);

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
  if (parsed) {
    return parsed.answer || parsed.coreRecommendation || parsed.planVerdict || parsed.packageConcept || parsed.coreAdvice || parsed.diagnosis || "Response saved.";
  }
  return reply || "";
};

const Block = ({ label, color = "gray", children }) => {
  const colors = {
    gray:   "bg-gray-50 border-gray-200 text-gray-500",
    blue:   "bg-blue-50 border-blue-200 text-blue-600",
    green:  "bg-green-50 border-green-200 text-green-700",
    amber:  "bg-amber-50 border-amber-200 text-amber-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    red:    "bg-red-50 border-red-200 text-red-700",
    dark:   "bg-[#36013F] border-[#36013F] text-white",
  };
  return (
    <div className={`p-3 rounded-xl border ${colors[color]} mb-2`}>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
      {children}
    </div>
  );
};

// Labels for the builder's saved fields — adapt per service type
const SERVICE_LABELS = {
  "1:1 STRATEGIC CONSULTATION": {
    diagnosis: "Situation Read",
    coreAdvice: "Recommendation",
    risks: "Book Now",
    risksIcon: "→",
    risksColor: "green",
    optNextSteps: "Call Agenda",
  },
  "ASK A QUESTION": {
    diagnosis: "Key Point",
    coreAdvice: "Answer",
    risks: "Watch Out",
    risksIcon: "⚠",
    risksColor: "red",
    optNextSteps: null,
  },
  "THE MASTER PLAN": {
    diagnosis: "Plan Verdict",
    coreAdvice: "Day Structure",
    risks: "Must Dos",
    risksIcon: "✓",
    risksColor: "green",
    optNextSteps: null,
  },
  "CUSTOM LUXE PACKAGE": {
    diagnosis: "Package Concept",
    coreAdvice: "Package Details",
    risks: "Signature Experiences",
    risksIcon: "★",
    risksColor: "purple",
    optNextSteps: null,
  },
  "Itinerary Review": {
    diagnosis: "Itinerary Verdict",
    coreAdvice: "Fixes & Improvements",
    risks: "Issues Found",
    risksIcon: "⚠",
    risksColor: "red",
    optNextSteps: null,
  },
  "Hotel/Area Check": {
    diagnosis: "Area Verdict",
    coreAdvice: "Expert Reasoning",
    risks: "Best Suited For",
    risksIcon: "→",
    risksColor: "blue",
    optNextSteps: null,
  },
  "Flight Choice": {
    diagnosis: "Key Reasoning",
    coreAdvice: "Recommendation",
    risks: "Watch Out",
    risksIcon: "⚠",
    risksColor: "amber",
    optNextSteps: null,
  },
  "Packing Checklist": {
    diagnosis: "Packing Verdict",
    coreAdvice: "Clothing & Documents",
    risks: "Must Not Forget",
    risksIcon: "✓",
    risksColor: "green",
    optNextSteps: null,
  },
};

const ServiceResponseDisplay = ({ reply, serviceType }) => {
  if (!reply?.trim()) {
    return <p className="text-sm text-gray-400 italic">No reply sent yet.</p>;
  }

  const data = parsePrescription(reply);

  if (!data) {
    const preview = reply.length > 300 ? reply.substring(0, 300) + "…" : reply;
    return <p className="text-sm italic text-gray-600 leading-relaxed">{preview}</p>;
  }

  const lbl = SERVICE_LABELS[serviceType] || {
    diagnosis: "Situation Read",
    coreAdvice: "Recommendation",
    risks: "Watch Out",
    risksIcon: "→",
    risksColor: "red",
    optNextSteps: "Next Steps",
  };

  const opt = data.optionalSections || {};

  return (
    <div className="space-y-2">
      {data.diagnosis && (
        <Block label={lbl.diagnosis} color="blue">
          <p className="text-sm leading-relaxed">{data.diagnosis}</p>
        </Block>
      )}
      {data.coreAdvice && (
        <Block label={lbl.coreAdvice} color="gray">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{data.coreAdvice}</p>
        </Block>
      )}
      {Array.isArray(data.risks) && data.risks.length > 0 && (
        <Block label={lbl.risks} color={lbl.risksColor}>
          <ul className="space-y-1">
            {data.risks.map((r, i) => (
              <li key={i} className="text-sm flex gap-2"><span>{lbl.risksIcon}</span>{r}</li>
            ))}
          </ul>
        </Block>
      )}
      {lbl.optNextSteps && opt.nextSteps && (
        <Block label={lbl.optNextSteps} color="purple">
          <p className="text-sm whitespace-pre-line">{opt.nextSteps}</p>
        </Block>
      )}
      {opt.dayWiseStructure && (
        <Block label="Day-wise Structure" color="blue">
          <p className="text-sm whitespace-pre-line">{opt.dayWiseStructure}</p>
        </Block>
      )}
      {opt.stayStrategy && (
        <Block label="Stay Strategy" color="amber">
          <p className="text-sm">{opt.stayStrategy}</p>
        </Block>
      )}
      {opt.routeLogic && (
        <Block label="Route Logic" color="gray">
          <p className="text-sm">{opt.routeLogic}</p>
        </Block>
      )}
      {data.nextStepCta && (
        <div className="p-3 bg-[#36013F] rounded-xl mt-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">Next Step for Traveller</p>
          <p className="text-sm text-white font-bold">{data.nextStepCta}</p>
        </div>
      )}
    </div>
  );
};

const fetchExpertLeads = async (expertId) => {
  const response = await fetch(`/api/leads?expertId=${encodeURIComponent(expertId)}`, {
    cache: "no-store",
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Failed to fetch expert leads");
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
  const [expertProfile, setExpertProfile] = useState(null);

  useEffect(() => {
    let channel;
    let pollInterval;
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchExpertProfile(user.uid);
        fetchQuestions(user.uid);
        fetchLeads(user.uid);

        // Subscribe to real-time changes on 'leads' table
        channel = supabase
          .channel(`expert_leads_${user.uid}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'leads',
            },
            (payload) => {
              console.log('Real-time update on leads table:', payload);
              const { eventType, new: newRow, old: oldRow } = payload;

              if (eventType === 'INSERT') {
                // Check if this lead belongs to this expert
                if (newRow.expert_id === user.uid) {
                  const item = newRow;
                  const newLead = {
                    ...item,
                    rawTimestamp: new Date(item.created_at),
                    timestamp: new Date(item.created_at).toLocaleDateString("en-GB") + " " + new Date(item.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
                    userName: item.user_name || item.form_data?.name || "Traveller",
                    userEmail: item.user_email || item.form_data?.email || "",
                    expertName: item.expert_name || "XMyTravel Expert",
                    question: item.form_data?.confusion || item.form_data?.question || item.form_data?.context || "New Service Request",
                    serviceType: item.service_type,
                    formData: item.form_data,
                  };
                  setLeads((prev) => {
                    // Avoid duplicate inserts
                    if (prev.some((l) => l.id === newLead.id)) return prev;
                    return [newLead, ...prev];
                  });
                }
              } else if (eventType === 'UPDATE') {
                if (newRow.expert_id === user.uid) {
                  const item = newRow;
                  setLeads((prev) =>
                    prev.map((l) => {
                      if (l.id === item.id) {
                        return {
                          ...l,
                          ...item,
                          rawTimestamp: new Date(item.created_at),
                          timestamp: new Date(item.created_at).toLocaleDateString("en-GB") + " " + new Date(item.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
                          userName: item.user_name || item.form_data?.name || "Traveller",
                          userEmail: item.user_email || item.form_data?.email || "",
                          question: item.form_data?.confusion || item.form_data?.question || item.form_data?.context || "New Service Request",
                          serviceType: item.service_type,
                          formData: item.form_data,
                        };
                      }
                      return l;
                    })
                  );
                } else {
                  // If the expert_id has changed (e.g. redirected to another expert), filter it out
                  setLeads((prev) => prev.filter((l) => l.id !== newRow.id));
                }
              } else if (eventType === 'DELETE') {
                setLeads((prev) => prev.filter((l) => l.id !== oldRow.id));
              }
            }
          )
          .subscribe();

        // Robust silent background polling fallback every 5 seconds
        pollInterval = setInterval(() => {
          fetchQuestions(user.uid);
          fetchLeads(user.uid);
        }, 5000);
      } else {
        setLoading(false);
        if (channel) {
          supabase.removeChannel(channel);
          channel = null;
        }
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      }
    });

    return () => {
      unsubscribe();
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []);

  const fetchExpertProfile = async (expertId) => {
    try {
      const response = await fetch(`/api/admin/profiles?userId=${encodeURIComponent(expertId)}`);
      const result = await response.json();
      if (result.profile) {
        setExpertProfile(result.profile);
      }
    } catch (error) {
      console.error("Error fetching expert profile:", error.message);
    }
  };

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
      const data = await fetchExpertLeads(expertId);

      console.log("Supabase response data:", data);

      const leadList = data.map((item) => ({
        ...item,
        rawTimestamp: new Date(item.created_at),
        timestamp: new Date(item.created_at).toLocaleDateString("en-GB") + " " + new Date(item.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        userName: item.user_name || item.form_data?.name || "Traveller",
        userEmail: item.user_email || item.form_data?.email || "",
        expertName: item.expert_name || expertProfile?.fullName || "XMyTravel Expert",
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
    if (question?.status !== "accepted") {
      setReplyError("Accept the case before sending the response.");
      return;
    }

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
          responseQuality: structuredReply?.qualityScores || null,
          prescriptionVersion: structuredReply ? 1 : null,
        });
      } else {
        const saveResponse = await fetch("/api/leads/update-response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: question.id,
            reply: finalReplyToSave,
            status: "answered",
            expertName: question.expertName || question.expert_name || expertProfile?.fullName || "XMyTravel Expert",
          }),
        });

        const saveResult = await saveResponse.json();
        if (!saveResponse.ok) {
          throw new Error(saveResult.error || "Failed to save reply in Supabase");
        }
      }

      const response = await fetch("/api/send-expert-reply-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: question.userEmail || question.user_email || "",
          userPhone: question.formData?.phone || question.formData?.whatsapp || question.user_phone || "",
          userName: question.userName,
          expertName: question.expertName || question.expert_name || expertProfile?.fullName || "XMyTravel Expert",
          expertPhoto: expertProfile?.photo || "",
          expertUsername: expertProfile?.username || "",
          question: question.question,
          serviceType: question.serviceType || question.service_type,
          reply: finalReplyToSave,
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
              ? { ...q, reply: finalReplyToSave, status: "answered", repliedAt: new Date().toISOString(), responseQuality: structuredReply?.qualityScores || null }
              : q
          )
        );
      } else {
        setLeads((prev) =>
          prev.map((q) =>
            q.id === question.id
              ? { ...q, reply: finalReplyToSave, status: "answered", replied_at: new Date().toISOString(), expertName: question.expertName || question.expert_name || expertProfile?.fullName || "XMyTravel Expert" }
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
    if (question?.status !== "accepted") {
      setReplyError("Accept the case before generating an AI draft.");
      return;
    }

    setReplyError(null);
    setReplyLoading(true);
    try {
      const response = await fetch("/api/generate-expert-prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: {
            ...question,
            serviceType: question.serviceType || question.service_type,
          },
          sessionData: sessionData[question.sessionId],
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

      const response = await fetch("/api/send-expert-reply-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: question.userEmail,
          userPhone: question.formData?.phone || question.formData?.whatsapp || question.user_phone || "",
          userName: question.userName,
          expertName: question.expertName,
          expertPhoto: expertProfile?.photo || "",
          expertUsername: expertProfile?.username || "",
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

  const handleStatusChange = async (caseItem, nextStatus) => {
    setReplyError(null);
    setReplyLoading(true);
    try {
      const updatedAt = new Date().toISOString();

      if (activeTab === "questions") {
        await updateDoc(doc(db, "Questions", caseItem.id), {
          status: nextStatus,
          workflowUpdatedAt: updatedAt,
        });
        setQuestions((prev) =>
          prev.map((item) =>
            item.id === caseItem.id ? { ...item, status: nextStatus, workflowUpdatedAt: updatedAt } : item
          )
        );
      } else {
        const response = await fetch("/api/leads/update-response", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: caseItem.id,
            status: nextStatus,
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Failed to update lead status in Supabase");
        }

        setLeads((prev) =>
          prev.map((item) =>
            item.id === caseItem.id ? { ...item, status: nextStatus, updated_at: updatedAt } : item
          )
        );
      }

      setReplyModal((prev) =>
        prev && prev.id === caseItem.id ? { ...prev, status: nextStatus, workflowUpdatedAt: updatedAt } : prev
      );
    } catch (error) {
      console.error("Error updating case status:", error.message);
      setReplyError(error.message || "Failed to update case status.");
    } finally {
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

  const filteredData = currentData.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.userName?.toLowerCase().includes(term) ||
      item.question?.toLowerCase().includes(term) ||
      item.status?.toLowerCase().includes(term)
    );
  });

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
                      <span className={`font-medium px-3 py-1 text-xs rounded-lg inline-flex items-center gap-2 ${
                        q.status === "answered"
                          ? "bg-green-100 text-green-800"
                          : q.status === "accepted"
                            ? "bg-blue-100 text-blue-800"
                            : q.status === "clarification_requested"
                              ? "bg-amber-100 text-amber-800"
                              : q.status === "escalated" || q.status === "admin_prompt"
                                ? "bg-red-100 text-red-800"
                                : "bg-secondary text-[#36013F]"
                      }`}>
                        {q.status === "answered" ? <CircleCheckBig size={14} /> : <Loader className="spin-animation" size={14} />}
                        {getStatusLabel(q.status)}
                      </span>
                    </td>
                    <td className="p-3 border">
                      {q.status !== "answered" && (
                        <button
                          onClick={() => setReplyModal(q)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-[#36013F] text-white hover:bg-[#4a0150] focus:outline-none focus:ring-2 focus:ring-[#36013F]"
                        >
                          {isAdminPrompt(q) ? "Review Prompt" : q.status === "accepted" ? "Start Response" : "Reply"}
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
                                {q.formData?.payment?.status && (
                                  <div>
                                    {/* <p className="text-[10px] font-bold text-gray-400 uppercase">Payment</p>
                                    <p className="text-xs font-bold text-[#36013F]">
                                      {q.formData.payment.status === "paid" ? `Paid Rs. ${q.formData.payment.amount}` : "Not required"}
                                    </p> */}
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
                              <ServiceResponseDisplay
                                reply={q.reply}
                                serviceType={q.serviceType || q.service_type}
                              />
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
                <p className="text-xs text-gray-500">
                  Case ID: {replyModal.id} - Status: {getStatusLabel(replyModal.status)}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {replyModal.status !== "accepted" && replyModal.status !== "answered" && (
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
                    setReplyText("");
                    setReplyError(null);
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body: Two Column Layout */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Left: Case Sheet (Scrollable) */}
              <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r custom-scrollbar bg-white">
                <CaseSheetView question={replyModal} sessionData={sessionData} />
              </div>

              {/* Right: Prescription Builder (Scrollable) */}
              <div className="w-full md:w-1/2 p-6 overflow-y-auto custom-scrollbar bg-gray-50">
                {replyError && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                    {replyError}
                  </div>
                )}
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
                  canGenerateDraft={replyModal.status === "accepted"}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
