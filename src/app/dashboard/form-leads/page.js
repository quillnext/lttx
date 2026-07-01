"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LeadsDashboardPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .from("join_queries")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const list = (data || []).map((row) => {
          const rawDate = new Date(row.created_at || Date.now());

          return {
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            purpose: row.purpose,
            message: row.message,
            rawTimestamp: rawDate,
            timestamp: rawDate.toLocaleDateString("en-GB") +
              " " +
              rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          };
        });

        setLeads(list);
      } catch (err) {
        console.error("Error fetching leads:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this lead?");
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from("join_queries")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    } catch (err) {
      console.error("Error deleting lead:", err.message);
    }
  };

  const filteredLeads = leads.filter((lead) =>
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  return (
    <div className="p-4 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">📋 Form Leads</h1>
        <input
          type="text"
          placeholder="Search by name..."
          className="p-2 border rounded w-full max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading leads...</p>
      ) : currentItems.length === 0 ? (
        <p className="text-gray-600">No matching leads found.</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-yellow-300 text-[#36013F]">
              <tr>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Phone</th>
                <th className="p-3 border">Purpose</th>
                <th className="p-3 border">Message</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 border font-medium">{lead.timestamp}</td>
                  <td className="p-3 border font-medium">{lead.name}</td>
                  <td className="p-3 border">{lead.email}</td>
                  <td className="p-3 border">{lead.phone}</td>
                  <td className="p-3 border">{lead.purpose}</td>
                  <td className="p-3 border text-gray-700">{lead.message}</td>
                  <td className="p-3 border">
                    <button
                      onClick={() => handleDelete(lead.id)}
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
