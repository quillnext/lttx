"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUserAuthStore } from "@/stores/useUserAuthStore";
import PrescriptionUserView from "@/app/components/PrescriptionUserView";

const getMessage = (row) =>
  row.form_data?.confusion ||
  row.form_data?.question ||
  row.form_data?.context ||
  row.form_data?.mustHaves ||
  row.form_data?.exp ||
  "Service request";

const parsePrescription = (reply) => {
  if (!reply || typeof reply !== "string") return null;
  try {
    const parsed = JSON.parse(reply);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export default function UserRequestsPage() {
  const { user } = useUserAuthStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    const fetchRequests = async () => {
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

    const fetchRequestsSilent = async () => {
      try {
        const { data = [], error } = await supabase
          .from("leads")
          .select("*")
          .eq("user_email", user.email)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } catch (error) {
        console.error("Error silently fetching user requests:", error);
      }
    };

    fetchRequests();

    // Subscribe to real-time changes on 'leads' table for this user
    const channel = supabase
      .channel(`user_leads_${user.email}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          console.log('User real-time update on leads table:', payload);
          const { eventType, new: newRow, old: oldRow } = payload;

          if (eventType === 'INSERT') {
            if (newRow.user_email === user.email) {
              setRequests((prev) => {
                // Avoid duplicate inserts
                if (prev.some((r) => r.id === newRow.id)) return prev;
                return [newRow, ...prev];
              });
            }
          } else if (eventType === 'UPDATE') {
            if (newRow.user_email === user.email) {
              setRequests((prev) =>
                prev.map((r) => (r.id === newRow.id ? newRow : r))
              );
            } else {
              // If email changed, filter it out
              setRequests((prev) => prev.filter((r) => r.id !== newRow.id));
            }
          } else if (eventType === 'DELETE') {
            setRequests((prev) => prev.filter((r) => r.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    // Robust silent background polling fallback every 5 seconds
    const pollInterval = setInterval(() => {
      fetchRequestsSilent();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
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
        <section key={request.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between border-b pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {request.service_type || "Service Request"}
              </p>
              <h2 className="mt-1 font-bold text-[#36013F]">{getMessage(request)}</h2>
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
            <div className="mt-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Expert Reply</p>
              {parsePrescription(request.reply) ? (
                <PrescriptionUserView prescription={parsePrescription(request.reply)} />
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
                  <p className="whitespace-pre-line">{request.reply}</p>
                </div>
              )}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
