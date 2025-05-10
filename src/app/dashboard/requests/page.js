// app/dashboard/requests/page.js
"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import EditProfileForm from "@/app/components/EditProfileForm";

const db = getFirestore(app);

export default function ManageRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewProfile, setPreviewProfile] = useState(null);

const fetchRequests = async () => {
  const querySnapshot = await getDocs(collection(db, "ProfileRequests"));
  const profiles = querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      timestamp: data.timestamp?.toDate
  ? data.timestamp.toDate().toLocaleDateString("en-GB") // gives DD/MM/YYYY
  : "N/A"
// fallback if invalid or missing
    };
  });
  setRequests(profiles);
  setLoading(false);
};



  useEffect(() => {
    fetchRequests();
  }, []);

const handleApprove = async (profile) => {
  const docRef = doc(db, "ProfileRequests", profile.id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return;

  const data = docSnap.data(); // ✅ Firestore timestamp preserved
  await setDoc(doc(db, "Profiles", profile.id), data);
  await deleteDoc(docRef);
  fetchRequests();
};

 const handleDelete = async (id) => {
  const confirm = window.confirm("Are you sure you want to permanently delete this profile?");
  if (!confirm) return;

  try {
    await deleteDoc(doc(db, "Profiles", id));
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    setToast("Profile permanently deleted.");
    setTimeout(() => setToast(""), 3000);
  } catch (error) {
    console.error("Failed to delete:", error);
    alert("Error deleting profile.");
  }
};


  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-[#36013F] mb-6">📥 Manage Requests</h1>
      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-600">No pending requests.</p>
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
              {requests.map((profile) => (
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
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
                      onClick={() => handleApprove(profile)}
                    >
                      Approve
                    </button>
                    <button
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                      onClick={() => handleDelete(profile)}
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
