"use client";

import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { ChevronDown, ChevronUp, CircleCheckBig, Loader } from "lucide-react";

const db = getFirestore(app);

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState({});

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
    try {
      const questionRef = doc(db, "Questions", id);
      await updateDoc(questionRef, { isPublic: !currentIsPublic });
      setQuestions((prev) =>
        prev.map((question) =>
          question.id === id ? { ...question, isPublic: !currentIsPublic } : question
        )
      );
    } catch (error) {
      console.error("Error toggling public status:", error.message);
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

  return (
    <div className="p-4 text-gray-800">
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
          Loading questions...
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
              {currentItems.map((q) => (
                <React.Fragment key={q.id}>
                  <tr className="hover:bg-gray-50 transition">
                    <td className="p-3 border font-medium">{q.timestamp}</td>
                    <td className="p-3 border font-medium">{q.userName}</td>
                    <td className="p-3 border">{q.userEmail}</td>
                    <td className="p-3 border">{q.userPhone}</td>
                    <td className="p-3 border">{q.expertName}</td>
                    <td className="p-3 border">
                      {q.status === "pending" ? (
                        <span className="bg-secondary text-[#36013F] font-medium px-3 py-1 text-xs rounded-lg flex items-center gap-1">
                          <Loader className="animate-spin" /> Pending
                        </span>
                      ) : (
                        <span className="bg-primary text-white font-medium px-3 py-1 text-xs rounded-lg flex items-center gap-1">
                          <CircleCheckBig /> Answered
                        </span>
                      )}
                    </td>
                    <td className="p-3 border">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.isPublic || false}
                          onChange={() => handleTogglePublic(q.id, q.isPublic || false)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#36013F] transition-colors">
                          <div className="w-5 h-5 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                        </div>
                        <span className="ml-2 text-xs font-medium">
                          {q.isPublic ? "Public" : "Private"}
                        </span>
                      </label>
                    </td>
                    <td className="p-3 border">
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
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
                      <td colSpan="9" className="p-3 border bg-gray-50">
                        <div className="flex flex-col md:flex-row gap-4 text-gray-700">
                          <div className="w-[30%] border-r">
                            <p>
                              <strong>Question:</strong> {q.question || "N/A"}
                            </p>
                          </div>
                          <div className="w-[70%]">
                            <p>
                              <strong>Answer:</strong>{" "}
                              {q.status === "pending" ? "No reply yet" : q.reply || "No reply yet"}
                            </p>
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
    </div>
  );
}