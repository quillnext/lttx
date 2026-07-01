"use client";

// app/dashboard/deleted/page.js


import { useEffect, useState } from "react";
import EditProfileForm from "@/app/components/EditProfileForm";
import { supabase } from "@/lib/supabase";

export default function DeletedProfilesPage() {
  const [deletedProfiles, setDeletedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewProfile, setPreviewProfile] = useState(null);

  const fetchDeletedProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profile_requests")
        .select("*")
        .eq("status", "rejected")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const profiles = (data || []).map((row) => {
        const rawDate = new Date(row.created_at || Date.now());
        return {
          id: row.id,
          fullName: row.full_name,
          email: row.email,
          phone: row.phone,
          location: row.location,
          tagline: row.tagline,
          about: row.about,
          pricing: row.pricing,
          status: row.status,
          username: row.username,
          experience: row.experience,
          expertise: row.expertise,
          certifications: row.certifications,
          photo: row.photo_url,
          rawTimestamp: rawDate,
          timestamp: rawDate.toLocaleDateString("en-GB"),
        };
      });
      setDeletedProfiles(profiles);
    } catch (err) {
      console.error("Error fetching rejected profiles:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedProfiles();
  }, []);

  const handleRestore = async (profile) => {
    try {
      const { error } = await supabase
        .from("profile_requests")
        .update({ status: "pending", updated_at: new Date().toISOString() })
        .eq("id", profile.id);
      if (error) throw error;
      fetchDeletedProfiles();
    } catch (err) {
      console.error("Error restoring profile:", err.message);
    }
  };

  const handlePermanentDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to permanently delete this profile?");
    if (!confirm) return;

    try {
      const { error } = await supabase
        .from("profile_requests")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setDeletedProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error permanently deleting profile:", error.message);
      alert("Failed to delete profile.");
    }
  };


  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-[#36013F] mb-6">🗑️ Deleted Profiles</h1>
      {loading ? (
        <p>Loading deleted profiles...</p>
      ) : deletedProfiles.length === 0 ? (
        <p className="text-gray-600">No deleted profiles found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow border bg-white">
          <table className="min-w-full text-sm text-left border rounded-xl shadow-sm">
            <thead className="bg-[#F4D35E] text-[#36013F]">
              <tr>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Location</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deletedProfiles.map((profile) => (
                <tr key={profile.id} className="bg-white hover:bg-gray-50 transition">
                    <td className="p-3 border font-medium">{profile.timestamp}</td>
                  <td className="p-3 border font-medium">{profile.fullName}</td>
                  <td className="p-3 border">{profile.email}</td>
                  <td className="p-3 border">{profile.location}</td>
                  <td className="p-3 border space-x-2">
                    <button
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                      onClick={() => setPreviewProfile(profile)}
                    >
                      Preview
                    </button>
                    <button
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      onClick={() => handleRestore(profile)}
                    >
                      Restore
                    </button>
                     <button
    className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
    onClick={() => handlePermanentDelete(profile.id)}
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

      {previewProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#36013F]">🔍 Preview Profile</h2>
              <button onClick={() => setPreviewProfile(null)} className="text-red-500 text-lg">✕</button>
            </div>
            <EditProfileForm initialData={previewProfile} onSave={() => setPreviewProfile(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
