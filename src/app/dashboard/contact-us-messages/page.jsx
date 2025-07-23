"use client";

import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { app } from "@/lib/firebase";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { MailPlus } from "lucide-react";

const db = getFirestore(app);

export default function ContactUsMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchContactMessages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ContactQueries"));
        const messagesData = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const rawDate = data.timestamp?.toDate?.() ?? new Date();

          return {
            id: docSnap.id,
            ...data,
            rawTimestamp: rawDate,
            timestamp: rawDate.toLocaleDateString("en-GB") +
              " " +
              rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          };
        });

        const sorted = messagesData.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
        setMessages(sorted);
      } catch (err) {
        console.error("Error fetching contact messages:", err);
        if (err.code === "permission-denied") {
          router.push("/admin-login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContactMessages();
  }, [router]);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this message?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "ContactQueries", id));
      setMessages((prev) => prev.filter((message) => message.id !== id));
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const handleReply = (message) => {
    setSelectedMessage(message);
    setReplyText("");
    setReplyError("");
    setReplySuccess("");
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      setReplyError("Reply cannot be empty.");
      return;
    }

    setReplyLoading(true);
    setReplyError("");
    setReplySuccess("");

    try {
      const response = await fetch("/api/send-contact-reply-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: selectedMessage.email,
          userName: selectedMessage.name,
          subject: `Re: ${selectedMessage.subject}`,
          reply: replyText,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to send reply");

      // Update Firestore document with status "replied"
      await updateDoc(doc(db, "ContactQueries", selectedMessage.id), {
        status: "replied",
      });

      // Refresh messages to reflect the updated status
      const querySnapshot = await getDocs(collection(db, "ContactQueries"));
      const messagesData = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const rawDate = data.timestamp?.toDate?.() ?? new Date();
        return {
          id: docSnap.id,
          ...data,
          rawTimestamp: rawDate,
          timestamp: rawDate.toLocaleDateString("en-GB") +
            " " +
            rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        };
      });
      setMessages(messagesData.sort((a, b) => b.rawTimestamp - a.rawTimestamp));

      setReplySuccess("Reply sent successfully!");
      setSelectedMessage(null);
      setTimeout(() => setReplySuccess(""), 3000);
    } catch (error) {
      console.error("Error sending reply:", error);
      setReplyError("Failed to send reply. Please try again.");
    } finally {
      setReplyLoading(false);
    }
  };

  const filteredMessages = messages.filter((message) =>
    (message.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (message.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMessages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);

  return (
    <div className="p-4 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          <MailPlus className="inline mr-2" /> Contact Us Messages
        </h1>
        <input
          type="text"
          placeholder="Search by name or email..."
          className="p-2 border rounded w-full max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading messages...</p>
      ) : currentItems.length === 0 ? (
        <p className="text-gray-600">No matching messages found.</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-yellow-300 text-[#36013F]">
              <tr><th className="p-3 border">Date</th><th className="p-3 border">Name</th><th className="p-3 border">Email</th><th className="p-3 border">Subject</th><th className="p-3 border">Message</th><th className="p-3 border">Status</th><th className="p-3 border">Actions</th></tr>
            </thead>
            <tbody>
              {currentItems.map((message) => (
                <tr key={message.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 border font-medium">{message.timestamp}</td>
                  <td className="p-3 border font-medium">{message.name || "N/A"}</td>
                  <td className="p-3 border">{message.email || "N/A"}</td>
                  <td className="p-3 border">{message.subject || "N/A"}</td>
                  <td className="p-3 border text-gray-700">{message.message || "N/A"}</td>
                  <td className="p-3 border font-medium">{message.status || "pending"}</td>
                  <td className="p-3 border">
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 mr-2"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleReply(message)}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-[#36013F] text-white hover:bg-[#4a0152]"
                      disabled={message.status === "replied"}
                    >
                      Reply
                    </button>
                  </td>
                </tr>
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

      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-[#36013F] mb-4">
              Reply to {selectedMessage.name || "User"}
            </h2>
            <form onSubmit={handleSendReply} className="space-y-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#36013F]"
                rows={4}
                required
              />
              {replyError && <p className="text-sm text-red-600">{replyError}</p>}
              {replySuccess && <p className="text-sm text-green-600">{replySuccess}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replyLoading}
                  className={`px-4 py-2 bg-[#36013F] text-white rounded-lg hover:bg-[#4a0152] ${
                    replyLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {replyLoading ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}