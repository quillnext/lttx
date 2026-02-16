"use client";

import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc, query, where, documentId } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { ChevronDown, ChevronUp, CircleCheckBig, Loader } from "lucide-react";
import SessionDetailsModal from "@/app/components/SessionDetailsModal";

const db = getFirestore(app);

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState({});
  const [toggling, setToggling] = useState({});
  const [sessionData, setSessionData] = useState({});
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Questions"));
        const questionList = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const rawDate = new Date(data.createdAt);

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

        const ids = questionList.map((q) => q.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicates.length > 0) {
          console.warn("Duplicate question IDs found:", duplicates);
        }

        const sorted = questionList.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
        setQuestions(sorted);
      } catch (error) {
        console.error("Error fetching questions:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

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
    if (question.sessionSnapshot) {
      setSessionData(prev => ({ ...prev, [question.sessionId]: question.sessionSnapshot }));
      setSelectedSessionId(question.sessionId);
    } else {
      loadSessionData(question.sessionId);
      setSelectedSessionId(question.sessionId);
    }
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this question?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "Questions", id));
      setQuestions((prev) => prev.filter((question) => question.id !== id));
    } catch (error) {
      console.error("Error deleting question:", error.message);
    }
  };

  const handleTogglePublic = async (id, currentIsPublic) => {
    setToggling((prev) => ({ ...prev, [id]: true }));
    try {
      setQuestions((prev) =>
        prev.map((question) =>
          question.id === id ? { ...question, isPublic: !currentIsPublic } : question
        )
      );
      const questionRef = doc(db, "Questions", id);
      await updateDoc(questionRef, { isPublic: !currentIsPublic });
      console.log(`Toggled isPublic for question ${id} to ${!currentIsPublic}`);
    } catch (error) {
      setQuestions((prev) =>
        prev.map((question) =>
          question.id === id ? { ...question, isPublic: currentIsPublic } : question
        )
      );
      console.error("Error toggling public status:", error.message);
      alert("Failed to update public status. Please try again.");
    } finally {
      setToggling((prev) => ({ ...prev, [id]: false }));
    }
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredQuestions = questions.filter((question) =>
    question.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

  const [reminding, setReminding] = useState({});
  const [experts, setExperts] = useState([]);
  const [redirectModal, setRedirectModal] = useState(null); // Question object
  const [selectedNewExpert, setSelectedNewExpert] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Fetch experts for the dropdown
    const fetchExperts = async () => {
      try {
        const q = query(collection(db, "Profiles"), where("profileType", "==", "expert"));
        const snapshot = await getDocs(q);
        const expertList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setExperts(expertList);
      } catch (err) {
        console.error("Error fetching experts:", err);
      }
    };
    fetchExperts();
  }, []);

  const handleSendReminder = async (q) => {
    setReminding(prev => ({ ...prev, [q.id]: true }));
    try {
      const res = await fetch("/api/admin/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: q.id,
          expertEmail: q.expertEmail,
          expertName: q.expertName,
          questionText: q.question
        })
      });
      if (res.ok) {
        alert("Reminder sent successfully!");
        // Optimistic update
        setQuestions(prev => prev.map(item =>
          item.id === q.id
            ? { ...item, reminderCount: (item.reminderCount || 0) + 1, lastReminderSentAt: { seconds: Date.now() / 1000 } }
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

      const res = await fetch("/api/admin/redirect-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: redirectModal.id,
          newExpertId: expertObj.id,
          newExpertName: expertObj.fullName,
          newExpertEmail: expertObj.email,
          questionText: redirectModal.question,
          userName: redirectModal.userName,
          userEmail: redirectModal.userEmail
        })
      });

      if (res.ok) {
        alert("Question redirected successfully!");
        // Update local state
        setQuestions(prev => prev.map(q =>
          q.id === redirectModal.id
            ? { ...q, expertId: expertObj.id, expertName: expertObj.fullName, expertEmail: expertObj.email, reminderCount: 0, isRedirected: true }
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
      alert("Error redirecting question: " + e.message);
    } finally {
      setRedirecting(false);
    }
  };

  return (
    <div className="p-4 text-gray-800">
      <SessionDetailsModal
        isOpen={!!selectedSessionId}
        onClose={() => setSelectedSessionId(null)}
        sessionData={sessionData[selectedSessionId] ? { id: selectedSessionId, ...sessionData[selectedSessionId] } : null}
      />

      {/* Redirect Modal */}
      {redirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-4 text-[#36013F]">Redirect Question</h3>
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
                {experts.filter(e => e.id !== redirectModal.expertId).map(e => (
                  <option key={e.id} value={e.id}>{e.fullName} ({e.email})</option>
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

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">❓ Questions Dashboard</h1>
        <input
          type="text"
          placeholder="Search by user name..."
          className="p-2 border rounded w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-[#36013F]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="animate-spin h-5 w-5" /> Loading questions...
        </div>
      ) : currentItems.length === 0 ? (
        <p className="text-gray-600">No matching questions found.</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-yellow-300 text-[#36013F]">
              <tr>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">User Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Phone</th>
                <th className="p-3 border">Expert Name</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Public</th>
                <th className="p-3 border">Actions</th>
                <th className="p-3 border w-12"></th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((q) => {
                const hasReply = q.reply && q.reply.trim() !== "";
                const reminderCount = q.reminderCount || 0;

                return (
                  <React.Fragment key={q.id}>
                    <tr className="hover:bg-gray-50 transition">
                      <td className="p-3 border font-medium">{q.timestamp}</td>
                      <td className="p-3 border font-medium">{q.userName}</td>
                      <td className="p-3 border">{q.userEmail}</td>
                      <td className="p-3 border">{q.userPhone}</td>
                      <td className="p-3 border">
                        {q.expertName}
                        {q.isRedirected && <span className="block text-[10px] text-red-500 font-bold uppercase">Redirected</span>}
                      </td>
                      <td className="p-3 border">
                        {hasReply ? (
                          <span className="bg-primary text-white font-medium px-3 py-1 text-xs rounded-lg flex items-center gap-1 w-fit">
                            <CircleCheckBig size={14} /> Answered
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <span className="bg-secondary text-[#36013F] font-medium px-3 py-1 text-xs rounded-lg flex items-center gap-1 w-fit">
                              <Loader className="animate-spin w-3 h-3" /> Pending
                            </span>
                            {/* Reminder Status Badge */}
                            {reminderCount > 0 && (
                              <span className="block text-[10px] font-bold text-orange-600">
                                {reminderCount} Reminders Sent
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-3 border">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={q.isPublic || false}
                            onChange={() => handleTogglePublic(q.id, q.isPublic || false)}
                            className="sr-only peer"
                            disabled={toggling[q.id]}
                          />
                          <div className={`w-11 h-6 rounded-full transition-colors ${q.isPublic ? "bg-[#36013F]" : "bg-gray-200"} peer-checked:bg-[#36013F]`}>
                            <div className={`absolute top-0.5 left-[2px] w-5 h-5 bg-white rounded-full transition-transform ${q.isPublic ? "translate-x-5" : "translate-x-0"}`}></div>
                          </div>
                        </label>
                      </td>
                      <td className="p-3 border space-y-2">
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="px-3 py-1 w-full rounded-lg text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                        >
                          Delete
                        </button>

                        {!hasReply && (
                          <>
                            <button
                              onClick={() => handleSendReminder(q)}
                              disabled={reminding[q.id]}
                              className="px-3 py-1 w-full rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:opacity-50"
                            >
                              {reminding[q.id] ? "Sending..." : "Send Reminder"}
                            </button>

                            {/* Show Redirect if reminders >= 3 */}
                            {reminderCount >= 3 && (
                              <button
                                onClick={() => setRedirectModal(q)}
                                className="px-3 py-1 w-full rounded-lg text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200"
                              >
                                Redirect
                              </button>
                            )}
                          </>
                        )}
                      </td>
                      <td className="p-3 border">
                        <button onClick={() => toggleRow(q.id)} className="p-1 hover:bg-gray-200 rounded">
                          {expandedRows[q.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                    </tr>
                    {expandedRows[q.id] && (
                      <tr key={`${q.id}-details`}>
                        <td colSpan="9" className="p-3 border bg-gray-50">
                          <div className="flex flex-col md:flex-row gap-4 text-gray-700">
                            <div className="w-[30%] border-r pr-4">
                              <p><strong>Question:</strong> {q.question || "N/A"}</p>
                              {q.sessionId && (
                                <button
                                  onClick={() => openSessionModal(q)}
                                  className="mt-3 flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-[#36013F] px-4 py-2 rounded-lg text-xs font-bold border border-purple-200"
                                >
                                  <Loader size={12} /> See Search Context
                                </button>
                              )}
                              {q.isRedirected && q.originalExpertName && (
                                <p className="mt-2 text-xs text-gray-500">
                                  Redirected from: <strong>{q.originalExpertName}</strong>
                                </p>
                              )}
                            </div>
                            <div className="w-[70%]">
                              <p><strong>Answer:</strong> {hasReply ? q.reply : "No reply yet"}</p>
                              {q.isAdminPrompt && !hasReply && q.suggestedAnswer && (
                                <p className="text-sm text-gray-500 mt-2"><strong>Suggested Answer:</strong> {q.suggestedAnswer}</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`px-3 py-1 rounded-md text-sm font-medium border transition ${page === currentPage ? "bg-[#36013F] text-white border-[#36013F]" : "border-gray-300 hover:bg-gray-100"}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}