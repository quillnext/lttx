
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
import { getStorage, ref, listAll, deleteObject } from "firebase/storage";
import { app } from "@/lib/firebase";
import Image from "next/image";

const db = getFirestore(app);
const storage = getStorage(app);

function ProfilePreview({ profile, onClose }) {
  return (
    <div className="relative bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-red-500 text-xl hover:text-red-700"
      >
        ✕
      </button>
      <h2 className="text-2xl font-bold text-[#36013F] mb-6">
        🔍 Profile: {profile.fullName || "Unnamed Profile"}
      </h2>

      {profile.referred === "Yes" && profile.referrerUsername && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm font-medium text-gray-700">
            Referred by: <span className="text-[#36013F] font-semibold">{profile.referrerUsername}</span>
          </p>
          {profile.referralCode && (
            <p className="text-sm text-gray-600 mt-1">Referral Code: {profile.referralCode}</p>
          )}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-[#36013F]">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <p><strong>Username:</strong> {profile.username || "N/A"}</p>
            <p><strong>Full Name:</strong> {profile.fullName || "N/A"}</p>
            <p><strong>Email:</strong> {profile.email || "N/A"}</p>
            <p><strong>Phone:</strong> {profile.phone || "N/A"}</p>
            <p><strong>Date of Birth:</strong> {profile.dateOfBirth || "N/A"}</p>
            <p><strong>Tagline:</strong> {profile.tagline || "N/A"}</p>
            <p><strong>Location:</strong> {profile.location || "N/A"}</p>
            <p><strong>Languages:</strong> {profile.languages || "N/A"}</p>
            <p><strong>Response Time:</strong> {profile.responseTime || "N/A"}</p>
            <p><strong>Pricing:</strong> {profile.pricing || "N/A"}</p>
          </div>
          <p className="mt-2"><strong>About:</strong> {profile.about || "N/A"}</p>
          {profile.photo && (
            <div className="mt-2">
              <strong>Photo:</strong>
              <Image src={profile.photo} alt="Profile" width={500} height={500} className="w-32 h-32 object-cover rounded-full mt-1" />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-[#36013F]">Services & Regions</h3>
          <p><strong>Services:</strong> {profile.services?.join(", ") || "N/A"}</p>
          <p><strong>Regions:</strong> {profile.regions?.join(", ") || "N/A"}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-[#36013F]">Experience & Credentials</h3>
          <p><strong>Certifications:</strong> {profile.certifications || "N/A"}</p>
          <div className="mt-2">
            <strong>Experience:</strong>
            {profile.experience?.length ? (
              <ul className="list-disc pl-5 mt-1">
                {profile.experience.map((exp, idx) => (
                  <li key={idx}>
                    {exp.title} at {exp.company} ({exp.startDate} - {exp.endDate})
                  </li>
                ))}
              </ul>
            ) : (
              <p>N/A</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-[#36013F]">Referral Information</h3>
          <p><strong>Referred:</strong> {profile.referred}</p>
          {profile.referred === "Yes" && (
            <p><strong>Referral Code:</strong> {profile.referralCode || "N/A"}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ManageRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
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
          referred: data.referred || "No", 
          dateOfBirth: data.dateOfBirth || "N/A", 
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

  const handleApprove = async (profile) => {
    setLoadingStates((prev) => ({ ...prev, [`approve-${profile.id}`]: true }));
    try {
      console.log(`Approving profile ${profile.id}...`);
      
      const response = await fetch("/api/send-profile-approved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to approve profile");
      }

      console.log("Approval successful for profile:", profile.id);
      await fetchRequests(); // Reload data to remove the request from the list
    
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

  const handlePreview = async (profile) => {
    setLoadingStates((prev) => ({ ...prev, [`preview-${profile.id}`]: true }));
    try {
      let referrerUsername = "";
      if (profile.referred === "Yes" && profile.referralCode) {
        const codeQuery = query(
          collection(db, "Profiles"),
          where("generatedReferralCode", "==", profile.referralCode)
        );
        const querySnapshot = await getDocs(codeQuery);
        referrerUsername = querySnapshot.empty
          ? "Not Found"
          : querySnapshot.docs[0].data().username || "Unknown";
      }

      setPreviewProfile({
        id: profile.id,
        username: profile.username || "",
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        dateOfBirth: profile.dateOfBirth || "", 
        tagline: profile.tagline || "",
        location: profile.location || "",
        languages: profile.languages || "",
        responseTime: profile.responseTime || "",
        pricing: profile.pricing || "",
        about: profile.about || "",
        photo: profile.photo || null,
        services: Array.isArray(profile.services) && profile.services.length ? profile.services : [""],
        regions: Array.isArray(profile.regions) && profile.regions.length ? profile.regions : [],
        experience: Array.isArray(profile.experience) && profile.experience.length
          ? profile.experience.map((exp) => ({
              title: exp.title || "",
              company: exp.company || "",
              startDate: exp.startDate || "",
              endDate: exp.endDate || "",
            }))
          : [{ title: "", company: "", startDate: "", endDate: "" }],
        certifications: profile.certifications || "",
        referred: profile.referred || "No",
        referralCode: profile.referralCode || "",
        referrerUsername: referrerUsername,
      });
    } catch (error) {
      console.error("Error fetching referrer username:", error);
      setPreviewProfile({
        id: profile.id,
        username: profile.username || "",
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        dateOfBirth: profile.dateOfBirth || "", 
        tagline: profile.tagline || "",
        location: profile.location || "",
        languages: profile.languages || "",
        responseTime: profile.responseTime || "",
        pricing: profile.pricing || "",
        about: profile.about || "",
        photo: profile.photo || null,
        services: Array.isArray(profile.services) && profile.services.length ? profile.services : [""],
        regions: Array.isArray(profile.regions) && profile.regions.length ? profile.regions : [],
        experience: Array.isArray(profile.experience) && profile.experience.length
          ? profile.experience.map((exp) => ({
              title: exp.title || "",
              company: exp.company || "",
              startDate: exp.startDate || "",
              endDate: exp.endDate || "",
            }))
          : [{ title: "", company: "", startDate: "", endDate: "" }],
        certifications: profile.certifications || "",
        referred: profile.referred || "No",
        referralCode: profile.referralCode || "",
        referrerUsername: "Error",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`preview-${profile.id}`]: false }));
    }
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
                <th className="p-3 border">Date of Birth</th>
                <th className="p-3 border">Referred</th>
                <th className="p-3 border">Referred By (Code)</th>
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
                  <td className="p-3 border">{profile.dateOfBirth}</td>
                  <td className="p-3 border">{profile.referred}</td>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ProfilePreview profile={previewProfile} onClose={() => setPreviewProfile(null)} />
        </div>
      )}
    </div>
  );
}
