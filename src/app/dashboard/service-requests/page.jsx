"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const getMessage = (row) =>
  row.form_data?.confusion ||
  row.form_data?.question ||
  row.form_data?.context ||
  row.form_data?.mustHaves ||
  row.form_data?.exp ||
  "New service request";

export default function ServiceRequestsDashboardPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const { data = [], error } = await supabase
          .from("leads")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const list = (data || []).map((row) => {
          const rawDate = row.created_at ? new Date(row.created_at) : new Date();

          return {
            id: row.id,
            rawTimestamp: rawDate,
            timestamp:
              rawDate.toLocaleDateString("en-GB") +
              " " +
              rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
            name: row.user_name || row.form_data?.name || "Traveller",
            email: row.user_email || row.form_data?.email || "",
            phone: row.user_phone || row.form_data?.phone || row.form_data?.whatsapp || "",
            serviceType: row.service_type || "Service Request",
            expertName: row.expert_name || "Unknown Expert",
            status: row.status || "pending",
            message: getMessage(row),
            reply: row.reply || "",
          };
        });

        setRequests(list);
      } catch (error) {
        console.error("Error fetching service requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this service request?");
    if (!confirm) return;

    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      console.error("Error deleting service request:", error);
      alert("Failed to delete service request.");
      return;
    }

    setRequests((prev) => prev.filter((request) => request.id !== id));
  };

  const filteredRequests = requests.filter((request) => {
    const term = searchTerm.toLowerCase();
    return (
      request.name?.toLowerCase().includes(term) ||
      request.expertName?.toLowerCase().includes(term) ||
      request.serviceType?.toLowerCase().includes(term) ||
      request.status?.toLowerCase().includes(term)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  return (
    <div className="p-4 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Service Requests</h1>
        <input
          type="text"
          placeholder="Search by user, expert, service, or status..."
          className="p-2 border rounded w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-[#36013F]"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {loading ? (
        <p>Loading service requests...</p>
      ) : currentItems.length === 0 ? (
        <p className="text-gray-600">No matching service requests found.</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-yellow-300 text-[#36013F]">
              <tr>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">User</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Phone</th>
                <th className="p-3 border">Service</th>
                <th className="p-3 border">Expert Name</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Request / Reply</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 border font-medium">{request.timestamp}</td>
                  <td className="p-3 border font-medium">{request.name}</td>
                  <td className="p-3 border">{request.email || "N/A"}</td>
                  <td className="p-3 border">{request.phone || "N/A"}</td>
                  <td className="p-3 border">{request.serviceType}</td>
                  <td className="p-3 border font-medium">{request.expertName}</td>
                  <td className="p-3 border">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        request.status === "answered" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="p-3 border text-gray-700 min-w-[280px]">
                    <p>{request.message}</p>
                    {request.reply && (
                      <p className="mt-2 text-xs text-green-700">
                        <strong>Reply:</strong>{" "}
                        {request.reply.length > 220 ? `${request.reply.substring(0, 220)}...` : request.reply}
                      </p>
                    )}
                  </td>
                  <td className="p-3 border">
                    <button
                      onClick={() => handleDelete(request.id)}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                    >
                      Delete
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
    </div>
  );
}
