// app/dashboard/deleted/page.js
"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, deleteDoc, setDoc, doc,Timestamp  } from "firebase/firestore";
import { app } from "@/lib/firebase";
import EditProfileForm from "@/app/components/EditProfileForm";

const db = getFirestore(app);

export default function DeletedProfilesPage() {
  const [deletedProfiles, setDeletedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewProfile, setPreviewProfile] = useState(null);

const fetchDeletedProfiles = async () => {
  const querySnapshot = await getDocs(collection(db, "DeletedProfiles"));
  const profiles = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    const rawTimestamp = data.timestamp?.toDate?.() || new Date(data.timestamp ?? Date.now());

    return {
      id: doc.id,
      ...data,
      rawTimestamp,
      timestamp: rawTimestamp.toLocaleDateString("en-GB"), // format for UI
    };
  });

  // Sort by rawTimestamp descending
  const sorted = profiles.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
  setDeletedProfiles(sorted);
  setLoading(false);
};



  useEffect(() => {
    fetchDeletedProfiles();
  }, []);

const handleRestore = async (profile) => {
  const profileToRestore = { ...profile };

  // Recreate timestamp if needed
  if (!(profile.rawTimestamp instanceof Date)) {
    profileToRestore.timestamp = Timestamp.now(); // fallback
  } else {
    profileToRestore.timestamp = Timestamp.fromDate(profile.rawTimestamp);
  }

  await setDoc(doc(db, "ProfileRequests", profile.id), profileToRestore);
  await deleteDoc(doc(db, "DeletedProfiles", profile.id));
  fetchDeletedProfiles();
};
  const handlePermanentDelete = async (id) => {
  const confirm = window.confirm("Are you sure you want to permanently delete this profile?");
  if (!confirm) return;

  try {
    await deleteDoc(doc(db, "DeletedProfiles", id));
    setDeletedProfiles((prev) => prev.filter((p) => p.id !== id));
  } catch (error) {
    console.error("Error deleting permanently:", error);
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