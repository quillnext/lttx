"use client";

import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { ChevronDown, ChevronUp, CircleCheckBig, Loader } from "lucide-react";

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

  useEffect(() => {
    const fetchQuestions = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.error("No user authenticated");
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, "Questions"), where("expertId", "==", user.uid));
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

        const ids = questionList.map((q) => q.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicates.length > 0) {
          console.warn("Duplicate question IDs found:", duplicates);
        }

        // Filter to only show pending or admin_prompt questions (not answered)
        const pendingQuestions = questionList.filter(q => q.status !== "answered");

        const sorted = pendingQuestions.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
        setQuestions(sorted);
      } catch (error) {
        console.error("Error fetching questions:", error.message);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchQuestions();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleReply = async (question) => {
    const finalReply = replyText.trim();
    if (!finalReply) {
      setReplyError("Reply cannot be empty.");
      return;
    }

    setReplyLoading(true);
    try {
      const questionRef = doc(db, "Questions", question.id);
      await updateDoc(questionRef, {
        reply: finalReply,
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
          reply: finalReply,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send reply email");
      }

      // Remove the question from the list since it's now answered
      setQuestions((prev) => prev.filter(q => q.id !== question.id));
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

      // Remove the question from the list since it's now answered
      setQuestions((prev) => prev.filter(q => q.id !== question.id));
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

  const filteredQuestions = questions.filter((question) =>
    question.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

  const isAdminPrompt = (question) => question.isAdminPrompt || question.status === "admin_prompt";

  return (
    <div className="p-4 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">💬 Messages</h1>
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
          Loading messages...
        </div>
      ) : currentItems.length === 0 ? (
        <p className="text-gray-600">
          {filteredQuestions.length === 0 && searchTerm
            ? "No matching messages found."
            : "No pending questions."}
        </p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-yellow-300 text-[#36013F]">
              <tr>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">User Name</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Action</th>
                <th className="p-3 border w-12"></th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((q) => (
                <React.Fragment key={q.id}>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="p-3 border font-medium">{q.timestamp || "N/A"}</td>
                    <td className="p-3 border font-medium">{q.userName || "N/A"}</td>
                    <td className="p-3 border">
                      {q.status === "pending" ? (
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
                      <button
                        onClick={() => setReplyModal(q)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-[#36013F] text-white hover:bg-[#4a0150] focus:outline-none focus:ring-2 focus:ring-[#36013F]"
                      >
                        {isAdminPrompt(q) ? 'Review Prompt' : 'Reply'}
                      </button>
                    </td>
                    <td className="p-3 border">
                      <button
                        onClick={() => toggleRow(q.id)}
                        className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#36013F] rounded"
                        aria-expanded={expandedRows[q.id] || false}
                        aria-label={expandedRows[q.id] ? "Collapse question details" : "Expand question details"}
                      >
                        {expandedRows[q.id] ? <ChevronUp />  : <ChevronDown /> }
                      </button>
                    </td>
                  </tr>
                  {expandedRows[q.id] && (
                    <tr key={`${q.id}-details`}>
                      <td colSpan="5" className="p-3 border bg-gray-50">
                        <div className="flex flex-col md:flex-row gap-4 text-gray-700">
                          <div className="w-[30%] border-r">
                            <p>
                              <strong>Question:</strong> {q.question || "N/A"}
                            </p>
                            {isAdminPrompt(q) && q.suggestedAnswer && (
                              <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
                                <strong>Suggested Answer (Admin):</strong>
                                <p className="text-sm mt-1">{q.suggestedAnswer}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="w-[70%]">
                            {q.reply && (
                              <p>
                                <strong>Your Reply:</strong> {q.reply}
                              </p>
                            )}
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
       <div className="fixed inset-0 bg-gradient-to-br from-black/30 via-gray-900/30 to-black/30 flex items-center justify-center z-50">
  <div className="bg-transparent backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-lg relative border border-white/30">
    <button
      onClick={() => {
        setReplyModal(null);
        setReplyText("");
        setReplyError(null);
      }}
      className="absolute top-4 right-4 text-primary  text-lg font-bold"
      aria-label="Close reply modal"
    >
      ✕
    </button>
    <h2 className="text-3xl font-bold bg-clip-text text-primary mb-6">
      {isAdminPrompt(replyModal) ? 'Review Admin Prompt' : 'Reply to'} {replyModal.userName || "User"}
    </h2>
    <p className="mb-6 text-primary">
      <strong className="font-semibold">Question:</strong> {replyModal.question || "N/A"}
    </p>
    {isAdminPrompt(replyModal) && replyModal.suggestedAnswer && (
      <div className="mb-6 p-4 border border-yellow-200 rounded-xl">
        <strong className="font-semibold text-primary">Suggested Answer from Admin:</strong>
        <p className="text-sm mt-2 text-primary whitespace-pre-wrap">{replyModal.suggestedAnswer}</p>
        <button
          type="button"
          onClick={() => handleAgreeSuggested(replyModal)}
          disabled={replyLoading}
          className="mt-3 w-full bg-secondary text-primary py-2 px-4 rounded-lg font-medium cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {replyLoading ? <Loader className="animate-spin h-4 w-4" /> : 'Agree & Send Reply'}
        </button>
        <p className="text-xs text-primary mt-2 text-center">Or write your own answer below if you disagree</p>
      </div>
    )}
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleReply(replyModal);
      }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-semibold text-primary mb-2">
          Your Reply {isAdminPrompt(replyModal) && '(if you disagree with suggested answer)'}
        </label>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          className={`mt-1 p-4 w-full border rounded-xl bg-white/5 text-primary placeholder-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
            replyError ? "border-red-500" : "border-white/20"
          }`}
          rows="5"
          placeholder="Type your custom reply here..."
          required
        />
        {replyError && (
          <p className="text-red-400 text-sm mt-2">{replyError}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={replyLoading || !replyText.trim()}
        className={`w-full bg-gradient-to-r from-primary to-secondary text-primary p-4 rounded-full font-semibold text-lg  transition-all duration-300 transform hover:scale-105 cursor-pointer ${
          replyLoading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {replyLoading ? "Sending..." : "Send Custom Reply"}
      </button>
    </form>
  </div>
</div>
      )}
    </div>
  );
}