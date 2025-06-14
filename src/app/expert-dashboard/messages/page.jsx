
// "use client";

// import { useState, useEffect } from "react";
// import { getAuth } from "firebase/auth";
// import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
// import { app } from "@/lib/firebase";

// const auth = getAuth(app);
// const db = getFirestore(app);

// export default function Messages() {
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [replyModal, setReplyModal] = useState(null);
//   const [replyText, setReplyText] = useState("");
//   const [replyError, setReplyError] = useState(null);
//   const [replyLoading, setReplyLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       // Ensure the user is authenticated
//       const user = auth.currentUser;
//       if (!user) {
//         console.error("No user authenticated");
//         setLoading(false);
//         return;
//       }

//       try {
//         const q = query(collection(db, "Questions"), where("expertId", "==", user.uid));
//         const querySnapshot = await getDocs(q);
//         const questionList = querySnapshot.docs.map((docSnap) => {
//           const data = docSnap.data();
//           // Handle Firestore Timestamp for createdAt
//           const rawDate = data.createdAt?.toDate?.() ?? new Date(data.createdAt); // Fallback to ISO string parsing

//           return {
//             id: docSnap.id,
//             ...data,
//             rawTimestamp: rawDate,
//             timestamp:
//               rawDate.toLocaleDateString("en-GB") +
//               " " +
//               rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
//           };
//         });

//         // Sort questions by timestamp (newest first)
//         const sorted = questionList.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
//         setQuestions(sorted);
//       } catch (error) {
//         console.error("Error fetching questions:", error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     // Add a slight delay to ensure auth.currentUser is available
//     const timer = setTimeout(() => {
//       fetchQuestions();
//     }, 100);

//     return () => clearTimeout(timer);
//   }, []);

//   const handleReply = async (question) => {
//     if (!replyText.trim()) {
//       setReplyError("Reply cannot be empty.");
//       return;
//     }

//     setReplyLoading(true);
//     try {
//       // Update Firestore with the reply
//       const questionRef = doc(db, "Questions", question.id);
//       await updateDoc(questionRef, {
//         reply: replyText,
//         status: "answered",
//         repliedAt: new Date().toISOString(),
//       });

//       // Send email via API route
//       const response = await fetch("/api/send-reply-email", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           userEmail: question.userEmail,
//           userName: question.userName,
//           expertName: question.expertName,
//           question: question.question,
//           reply: replyText,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to send reply email");
//       }

//       // Update local state
//       setQuestions((prev) =>
//         prev.map((q) =>
//           q.id === question.id ? { ...q, reply: replyText, status: "answered" } : q
//         )
//       );
//       setReplyModal(null);
//       setReplyText("");
//       setReplyError(null);
//       setReplyLoading(false);
//     } catch (error) {
//       console.error("Error sending reply:", error.message);
//       setReplyError(error.message); // Use the specific error message from the API
//       setReplyLoading(false);
//     }
//   };

//   // Filter questions by user name
//   const filteredQuestions = questions.filter((question) =>
//     question.userName?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

//   return (
//     <div className="p-4 text-gray-800">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-semibold">💬 Messages</h1>
//         <input
//           type="text"
//           placeholder="Search by user name..."
//           className="p-2 border rounded w-full max-w-sm"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       {loading ? (
//         <p>Loading messages...</p>
//       ) : currentItems.length === 0 ? (
//         <p className="text-gray-600">
//           {filteredQuestions.length === 0 && searchTerm
//             ? "No matching messages found."
//             : "No questions yet."}
//         </p>
//       ) : (
//         <div className="overflow-x-auto bg-white border rounded-xl shadow">
//           <table className="min-w-full text-sm text-left">
//             <thead className="bg-yellow-300 text-[#36013F]">
//               <tr>
//                 <th className="p-3 border">Date</th>
//                 <th className="p-3 border">User Name</th>
//                 <th className="p-3 border">Email</th>
//                 <th className="p-3 border">Phone</th>
//                 <th className="p-3 border">Question</th>
//                 <th className="p-3 border">Status</th>
//                 <th className="p-3 border">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentItems.map((q) => (
//                 <tr key={q.id} className="hover:bg-gray-50 transition">
//                   <td className="p-3 border font-medium">{q.timestamp || "N/A"}</td>
//                   <td className="p-3 border font-medium">{q.userName || "N/A"}</td>
//                   <td className="p-3 border">{q.userEmail || "N/A"}</td>
//                   <td className="p-3 border">{q.userPhone || "N/A"}</td>
//                   <td className="p-3 border text-gray-700">{q.question || "N/A"}</td>
//                   <td className="p-3 border">
//                     {q.status === "pending" ? (
//                       <span className="bg-yellow-500 text-[#36013F] font-medium px-3 py-1 text-xs rounded-lg">Pending</span>
//                     ) : (
//                       <span className="bg-green-500 text-white font-medium px-3 py-1 text-xs rounded-lg">Answered</span>
//                     )}
//                   </td>
//                   <td className="p-3 border">
//                     {q.status === "pending" ? (
//                       <button
//                         onClick={() => setReplyModal(q)}
//                         className="px-3 py-1 rounded-lg text-xs font-medium bg-[#36013F] text-white hover:bg-[#4a0150]"
//                       >
//                         Reply
//                       </button>
//                     ) : (
//                       <span className="bg-green-500 text-white font-medium px-3 py-1 text-xs rounded-lg">Replied</span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {totalPages > 1 && (
//         <div className="flex justify-center mt-6 gap-2">
//           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//             <button
//               key={page}
//               className={`px-3 py-1 rounded-md text-sm font-medium border transition ${
//                 page === currentPage
//                   ? "bg-[#36013F] text-white border-[#36013F]"
//                   : "text-gray-700 border-gray-300 hover:bg-gray-100"
//               }`}
//               onClick={() => setCurrentPage(page)}
//             >
//               {page}
//             </button>
//           ))}
//         </div>
//       )}

//       {replyModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
//             <button
//               onClick={() => {
//                 setReplyModal(null);
//                 setReplyText("");
//                 setReplyError(null);
//               }}
//               className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//             >
//               ✕
//             </button>
//             <h2 className="text-2xl font-bold text-[#36013F] mb-4">
//               Reply to {replyModal.userName || "User"}
//             </h2>
//             <p className="mb-4">
//               <strong>Question:</strong> {replyModal.question || "N/A"}
//             </p>
//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 handleReply(replyModal);
//               }}
//               className="space-y-4"
//             >
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Your Reply
//                 </label>
//                 <textarea
//                   value={replyText}
//                   onChange={(e) => setReplyText(e.target.value)}
//                   className="mt-1 p-2 w-full border rounded-md focus:ring-[#36013F] focus:border-[#36013F]"
//                   rows="4"
//                   required
//                 />
//                 {replyError && (
//                   <p className="text-red-500 text-sm">{replyError}</p>
//                 )}
//               </div>
//               <button
//                 type="submit"
//                 disabled={replyLoading}
//                 className={`w-full bg-[#36013F] text-white p-2 rounded-md hover:bg-[#4a0150] transition ${
//                   replyLoading ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
//               >
//                 {replyLoading ? "Sending..." : "Send Reply"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect } from "react"; // Added React import
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

        const sorted = questionList.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
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
    if (!replyText.trim()) {
      setReplyError("Reply cannot be empty.");
      return;
    }

    setReplyLoading(true);
    try {
      const questionRef = doc(db, "Questions", question.id);
      await updateDoc(questionRef, {
        reply: replyText,
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
          reply: replyText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send reply email");
      }

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id ? { ...q, reply: replyText, status: "answered" } : q
        )
      );
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
            : "No questions yet."}
        </p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-yellow-300 text-[#36013F]">
              <tr>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">User Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Phone</th>
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
                    <td className="p-3 border">{q.userEmail || "N/A"}</td>
                    <td className="p-3 border">{q.userPhone || "N/A"}</td>
                    <td className="p-3 border">
                      {q.status === "pending" ? (
                        <span className="bg-secondary text-[#36013F] font-medium px-3 py-1 text-xs rounded-lg flex items-center gap-2">
                        <Loader className="spin-animation" />  Pending
                        </span>
                      ) : (
                        <span className="bg-green-500 text-white font-medium px-3 py-1 text-xs rounded-lg flex items-center gap-1">
                         <CircleCheckBig /> Answered
                        </span>
                      )}
                    </td>
                    <td className="p-3 border">
                      {q.status === "pending" ? (
                        <button
                          onClick={() => setReplyModal(q)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-[#36013F] text-white hover:bg-[#4a0150] focus:outline-none focus:ring-2 focus:ring-[#36013F]"
                        >
                          Reply
                        </button>
                      ) : (
                        <span className="bg-primary text-white font-medium px-3 py-1 text-xs rounded-lg">
                          Replied
                        </span>
                      )}
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
                      <td colSpan="7" className="p-3 border bg-gray-50">
                        <div className="flex flex-col md:flex-row gap-4 text-gray-700">
                          <div className="w-[30%] border-r">
                            <p>
                              <strong>Question:</strong> {q.question || "N/A"}
                            </p>
                          </div>
                          
                          <div className="w-[70%]">
                            {q.status === "answered" && (
                              <p>
                                <strong>Answer:</strong> {q.reply || "No reply yet"}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => {
                setReplyModal(null);
                setReplyText("");
                setReplyError(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#36013F]"
              aria-label="Close reply modal"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-[#36013F] mb-4">
              Reply to {replyModal.userName || "User"}
            </h2>
            <p className="mb-4">
              <strong>Question:</strong> {replyModal.question || "N/A"}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleReply(replyModal);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="mt-1 p-2 w-full border rounded-md focus:ring-[#36013F] focus:border-[#36013F]"
                  rows="4"
                  required
                />
                {replyError && (
                  <p className="text-red-500 text-sm">{replyError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={replyLoading}
                className={`w-full bg-[#36013F] text-white p-2 rounded-md hover:bg-[#4a0150] transition ${
                  replyLoading ? "opacity-50 cursor-not-allowed" : ""
                } focus:outline-none focus:ring-2 focus:ring-[#36013F]`}
              >
                {replyLoading ? "Sending..." : "Send Reply"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}