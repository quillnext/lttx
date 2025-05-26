"use client";

import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  listAll,
  deleteObject,
} from "firebase/storage";
import { app } from "@/lib/firebase";
import EditProfileForm from "@/app/components/EditProfileForm";

const db = getFirestore(app);
const storage = getStorage(app);

export default function ManageRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Added for pagination
  const [itemsPerPage] = useState(10); // Added for pagination
  const [loading, setLoading] = useState(true);
  const [previewProfile, setPreviewProfile] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});

  const fetchRequests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "ProfileRequests"));
      const profiles = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let rawDate;
        if (data.timestamp && typeof data.timestamp.toDate === "function") {
          rawDate = data.timestamp.toDate();
        } else if (data.timestamp && data.timestamp.seconds) {
          rawDate = new Date(data.timestamp.seconds * 1000);
        } else {
          rawDate = new Date();
        }

        return {
          id: docSnap.id,
          ...data,
          rawTimestamp: rawDate,
          timestamp: rawDate.toLocaleDateString("en-GB"),
        };
      });

      profiles.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
      setRequests(profiles);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const deleteImageFolder = async (photoURL) => {
    try {
      const pathStart = photoURL.indexOf("/o/") + 3;
      const pathEnd = photoURL.indexOf("?alt=");
      const decodedPath = decodeURIComponent(photoURL.substring(pathStart, pathEnd));
      const folderPath = decodedPath.substring(0, decodedPath.lastIndexOf("/"));

      const folderRef = ref(storage, folderPath);
      const result = await listAll(folderRef);
      const deletionTasks = result.items.map((item) => deleteObject(item));
      await Promise.all(deletionTasks);
    } catch (err) {
      console.warn("Error deleting image folder:", err.message);
    }
  };

  const generateUniqueReferralCode = async (profileId) => {
    const prefix = "REF";
    const numberLength = 3;
    const maxAttempts = 30;

    console.log(`Generating referral code for profile ${profileId}...`);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const randomNumber = Math.floor(100 + Math.random() * 900);
      const code = `${prefix}${randomNumber}`;

      console.log(`Attempt ${attempt + 1}: Generated code ${code}`);

      try {
        const codeQuery = query(collection(db, "Profiles"), where("generatedReferralCode", "==", code));
        const querySnapshot = await getDocs(codeQuery);
        if (querySnapshot.empty) {
          console.log(`Code ${code} is unique`);
          return code;
        }
        console.log(`Code ${code} already exists, retrying...`);
      } catch (error) {
        console.error(`Error checking code uniqueness (attempt ${attempt + 1}):`, error);
        if (attempt === maxAttempts - 1) {
          console.warn("Max attempts reached, using fallback code");
          const timestampNum = Date.now().toString().slice(-3);
          return `REF${profileId.slice(0, 2).toUpperCase()}${timestampNum}`;
        }
      }
    }

    console.warn("Using ultimate fallback code");
    const timestampNum = Date.now().toString().slice(-3);
    return `REF${profileId.slice(0, 2).toUpperCase()}${timestampNum}`;
  };

  const handleApprove = async (profile) => {
    setLoadingStates((prev) => ({ ...prev, [`approve-${profile.id}`]: true }));
    try {
      console.log(`Approving profile ${profile.id} for ${profile.fullName}`);
      const docRef = doc(db, "ProfileRequests", profile.id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.warn(`Profile ${profile.id} does not exist in ProfileRequests`);
        alert("Profile no longer exists.");
        return;
      }

      const data = docSnap.data();
      console.log("Profile data:", data);

      let generatedReferralCode;
      try {
        generatedReferralCode = await generateUniqueReferralCode(profile.id);
        console.log(`Generated referral code: ${generatedReferralCode}`);
      } catch (error) {
        console.error("Failed to generate referral code:", error);
        generatedReferralCode = `FB-${profile.id.slice(0, 4).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
        console.warn(`Using fallback referral code: ${generatedReferralCode}`);
      }

      if (!generatedReferralCode || generatedReferralCode.length < 6) {
        console.error("Invalid referral code, using emergency fallback");
        generatedReferralCode = `EM-${profile.id.slice(0, 4).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
      }

      const updatedData = {
        ...data,
        generatedReferralCode,
        approvalTimestamp: new Date().toISOString(),
      };

      console.log("Saving to Profiles with data:", updatedData);
      try {
        await setDoc(doc(db, "Profiles", profile.id), updatedData);
        console.log(`Profile ${profile.id} saved to Profiles`);
      } catch (error) {
        console.error("Failed to save to Profiles:", error);
        throw new Error(`Failed to save profile: ${error.message}`);
      }

      try {
        await deleteDoc(docRef);
        console.log(`Profile ${profile.id} deleted from ProfileRequests`);
      } catch (error) {
        console.error("Failed to delete from ProfileRequests:", error);
        throw new Error(`Failed to delete profile: ${error.message}`);
      }

      const slug = data.username || `${data.fullName.toLowerCase().replace(/\s+/g, '-')}-${profile.id.slice(0, 6)}`;
      try {
        console.log("Sending approval email with payload:", {
          fullName: data.fullName,
          email: data.email,
          slug,
          referred: data.referred,
          referralCode: data.referralCode,
          generatedReferralCode,
        });
        const response = await fetch("/api/send-profile-approved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: data.fullName,
            email: data.email,
            slug,
            referred: data.referred,
            referralCode: data.referralCode,
            generatedReferralCode,
          }),
        });
        if (!response.ok) {
          console.error("Approval email API failed:", response.status);
        } else {
          console.log("Approval email sent successfully");
        }
      } catch (error) {
        console.error("Failed to send approval email:", error);
      }

      fetchRequests();
    } catch (error) {
      console.error("Failed to approve profile:", error);
      alert(`Error approving profile: ${error.message}`);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`approve-${profile.id}`]: false }));
    }
  };

  const handleDelete = async (profile) => {
    const confirm = window.confirm("Are you sure you want to permanently delete this profile?");
    if (!confirm) return;

    setLoadingStates((prev) => ({ ...prev, [`delete-${profile.id}`]: true }));
    try {
      const docRef = doc(db, "ProfileRequests", profile.id);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.photo) {
          await deleteImageFolder(data.photo);
        }
      }

      await deleteDoc(docRef);
      setRequests((prev) => prev.filter((r) => r.id !== profile.id));
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Error deleting profile.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`delete-${profile.id}`]: false }));
    }
  };

  const handlePreview = (profile) => {
    setLoadingStates((prev) => ({ ...prev, [`preview-${profile.id}`]: true }));
    setPreviewProfile({
      ...profile,
      referred: profile.referred || '',
      referralCode: profile.referralCode || '',
    });
    setLoadingStates((prev) => ({ ...prev, [`preview-${profile.id}`]: false }));
  };

  const filteredRequests = requests.filter((profile) =>
    profile.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#36013F]">📥 Manage Requests</h1>
        <input
          type="text"
          placeholder="Search by name..."
          className="p-2 border rounded w-full max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {loading ? (
        <p>Loading requests...</p>
      ) : currentItems.length === 0 ? (
        <p className="text-gray-600">No matching requests found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow border bg-white">
          <table className="min-w-full text-sm text-left border rounded-xl shadow-sm">
            <thead className="bg-[#F4D35E] text-[#36013F]">
              <tr>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Location</th>
                <th className="p-3 border">Referred</th>
                <th className="p-3 border">Referral Code</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((profile) => (
                <tr key={profile.id} className="bg-white hover:bg-gray-50 transition">
                  <td className="p-3 border font-medium">{profile.timestamp}</td>
                  <td className="p-3 border font-medium">{profile.fullName}</td>
                  <td className="p-3 border">{profile.email}</td>
                  <td className="p-3 border">{profile.location}</td>
                  <td className="p-3 border">{profile.referred || 'N/A'}</td>
                  <td className="p-3 border">{profile.referralCode || 'N/A'}</td>
                  <td className="p-3 border space-x-2 flex">
                    <button
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 relative flex items-center justify-center"
                      onClick={() => handlePreview(profile)}
                      disabled={loadingStates[`preview-${profile.id}`]}
                    >
                      {loadingStates[`preview-${profile.id}`] ? (
                        <svg
                          className="animate-spin h-4 w-4 text-blue-800"
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
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                          ></path>
                        </svg>
                      ) : (
                        "Preview"
                      )}
                    </button>
                    <button
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 relative flex items-center justify-center"
                      onClick={() => handleApprove(profile)}
                      disabled={loadingStates[`approve-${profile.id}`]}
                    >
                      {loadingStates[`approve-${profile.id}`] ? (
                        <svg
                          className="animate-spin h-4 w-4 text-green-800"
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
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                          ></path>
                        </svg>
                      ) : (
                        "Approve"
                      )}
                    </button>
                    <button
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 relative flex items-center justify-center"
                      onClick={() => handleDelete(profile)}
                      disabled={loadingStates[`delete-${profile.id}`]}
                    >
                      {loadingStates[`delete-${profile.id}`] ? (
                        <svg
                          className="animate-spin h-4 w-4 text-red-800"
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
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                          ></path>
                        </svg>
                      ) : (
                        "Delete"
                      )}
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

      {previewProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#36013F]">🔍 Preview Profile</h2>
              <button
                onClick={() => setPreviewProfile(null)}
                className="text-red-500 text-lg"
              >
                ✕
              </button>
            </div>
            <EditProfileForm
              initialData={previewProfile}
              onSave={() => {
                setPreviewProfile(null);
                fetchRequests();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}