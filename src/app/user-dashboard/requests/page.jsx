"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUserAuthStore } from "@/stores/useUserAuthStore";

const getMessage = (row) =>
  row.form_data?.confusion ||
  row.form_data?.question ||
  row.form_data?.context ||
  row.form_data?.mustHaves ||
  row.form_data?.exp ||
  "Service request";

export default function UserRequestsPage() {
  const { user } = useUserAuthStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?.email) return;

      setLoading(true);
      try {
        const { data = [], error } = await supabase
          .from("leads")
          .select("*")
          .eq("user_email", user.email)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } catch (error) {
        console.error("Error fetching user requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user?.email]);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading your requests...</p>;
  }

  if (requests.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <h2 className="text-lg font-bold text-gray-900">No requests yet</h2>
        <p className="mt-1 text-sm text-gray-500">Your submitted service requests will appear here.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <section key={request.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {request.service_type || "Service Request"}
              </p>
              <h2 className="mt-1 font-bold text-gray-900">{getMessage(request)}</h2>
              <p className="mt-1 text-sm text-gray-500">Expert: {request.expert_name || "Assigned Expert"}</p>
            </div>
            <span
              className={`w-fit rounded-lg px-3 py-1 text-xs font-bold ${
                request.status === "answered" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {request.status || "pending"}
            </span>
          </div>

          {request.reply && (
            <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-900">
              <strong>Expert Reply:</strong>
              <p className="mt-1 whitespace-pre-line">{request.reply}</p>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
