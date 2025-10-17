

"use client";

import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  listAll,
  deleteObject,
} from "firebase/storage";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader, Send, ChevronDown, ChevronUp } from "lucide-react";

export default function ProfilesTablePage() {
  const [profiles, setProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [toast, setToast] = useState("");
  const [loadingStates, setLoadingStates] = useState({});
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState(new Set());
  const [promptModal, setPromptModal] = useState(false);
  const [promptQuestion, setPromptQuestion] = useState("");
  const [promptAnswer, setPromptAnswer] = useState("");
  const [promptError, setPromptError] = useState(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [sendToAll, setSendToAll] = useState(false);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const router = useRouter();

  useEffect(() => {
    const fetchProfiles = async () => {
      const snapshot = await getDocs(collection(db, "Profiles"));
      const list = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        console.log(data)
        let rawDate;
        if (data.timestamp && typeof data.timestamp.toDate === "function") {
          rawDate = data.timestamp.toDate();
        } else if (data.timestamp && data.timestamp.seconds) {
          rawDate = new Date(data.timestamp.seconds * 1000);
        } else {
          rawDate = new Date();
        }
        console.log(rawDate)

        list.push({
          id: docSnap.id,
          fullName: data.fullName,
          profileType: data.profileType || 'expert',
          username: data.username,
          generatedReferralCode: data.generatedReferralCode,
          referralCode: data.referralCode,
          email: data.email,
          location: data.location,
          phone: data.phone,
          uid: data.uid || "",
          status: data.status || "",
          authStatus: data.authStatus || "",
          isPublic: data.isPublic !== false,
          rawTimestamp: rawDate,
          timestamp:
            rawDate.toLocaleDateString("en-GB") +
            " " +
            rawDate.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            }),
        });
      });

      list.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
      setProfiles(list);
    };

    fetchProfiles();
  }, [db]);

  const handleToggleSelect = (id) => {
    const newSelected = new Set(selectedProfiles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProfiles(newSelected);
  };

  const handleSelectAll = () => {
    const filteredIds = filteredProfiles.map(p => p.id);
    if (selectedProfiles.size === filteredIds.length) {
      setSelectedProfiles(new Set());
    } else {
      setSelectedProfiles(new Set(filteredIds));
    }
  };

  const handleSendPrompt = async () => {
    if (!promptQuestion.trim() || !promptAnswer.trim()) {
      setPromptError("Question and answer are required.");
      return;
    }

    const targets = sendToAll ? profiles : profiles.filter(p => selectedProfiles.has(p.id));
    if (targets.length === 0) {
      setPromptError("No profiles selected.");
      return;
    }

    setPromptLoading(true);
    try {
      for (const profile of targets) {
        await addDoc(collection(db, "Questions"), {
          expertId: profile.uid,
          expertName: profile.fullName || "Unknown",
          expertEmail: profile.email || "",
          question: promptQuestion,
          userName: "Admin",
          userEmail: "admin@xmytravel.com",
          userPhone: "",
          status: "admin_prompt",
          isAdminPrompt: true,
          suggestedAnswer: promptAnswer,
          isPublic: false,
          createdAt: new Date().toISOString(),
          reply: null,
        });

        if (profile.email && profile.email.trim()) {
          const response = await fetch("/api/send-admin-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              expertEmail: profile.email,
              expertName: profile.fullName || "Unknown",
              question: promptQuestion,
              suggestedAnswer: promptAnswer,
              profileType: profile.profileType || "expert",
            }),
          });

          if (!response.ok) {
            console.error(`Failed to send email to ${profile.email}`);
          }
        }
      }

      setPromptModal(false);
      setPromptQuestion("");
      setPromptAnswer("");
      setPromptError(null);
      setSendToAll(false);
      setSelectedProfiles(new Set());
      setToast("Prompts sent successfully!");
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error("Error sending prompts:", error.message);
      setPromptError(error.message);
    } finally {
      setPromptLoading(false);
    }
  };

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

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to permanently delete this profile?"
    );
    if (!confirm) return;

    setLoadingStates((prev) => ({ ...prev, [`delete-${id}`]: true }));

    try {
      const docRef = doc(db, "Profiles", id);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.photo) {
          await deleteImageFolder(data.photo);
        }
        if (data.certificates && Array.isArray(data.certificates)) {
          await Promise.all(data.certificates.map(url => deleteImageFolder(url)));
        }
        if (data.officePhotos && Array.isArray(data.officePhotos)) {
          await Promise.all(data.officePhotos.map(url => deleteImageFolder(url)));
        }
      }

      await deleteDoc(docRef);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      setToast("Profile deleted.");
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Error deleting profile.");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`delete-${id}`]: false }));
    }
  };

  const handleAuthenticate = async (profile) => {
    setLoadingStates((prev) => ({ ...prev, [`auth-${profile.id}`]: true }));
    try {
      if (!profile.email) {
        throw new Error("Profile has no email, cannot authenticate.");
      }

      const response = await fetch("/api/authenticate-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          email: profile.email,
          displayName: profile.fullName,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to authenticate profile.");
      }

      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profile.id
            ? { ...p, uid: result.uid, status: "approved", authStatus: "" }
            : p
        )
      );
      setToast(`Profile authenticated successfully. Reset link: ${result.resetLink}`);
      setTimeout(() => setToast(""), 5000);
    } catch (error) {
      console.error("Error authenticating profile:", error.message);
      setToast(`Error: ${error.message}`);
      setTimeout(() => setToast(""), 5000);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`auth-${profile.id}`]: false }));
    }
  };

  const handleTogglePublic = async (id, currentStatus) => {
    setLoadingStates((prev) => ({ ...prev, [`toggle-${id}`]: true }));
    try {
      const profileRef = doc(db, "Profiles", id);
      await updateDoc(profileRef, {
        isPublic: !currentStatus,
      });
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isPublic: !currentStatus } : p))
      );
      setToast(`Profile visibility updated to ${!currentStatus ? "Public" : "Private"}.`);
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error("Error toggling public status:", error);
      setToast("Failed to update visibility.");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`toggle-${id}`]: false }));
    }
  };

  const handleView = (profile) => {
    setLoadingStates((prev) => ({ ...prev, [`view-${profile.username}`]: true }));
    const route = profile.profileType === 'agency' ? `/agency/${profile.username}` : `/experts/${profile.username}`;
    router.push(route);
  };

  const handleEdit = (id) => {
    setLoadingStates((prev) => ({ ...prev, [`edit-${id}`]: true }));
    router.push(`/dashboard/edit/${id}`);
  };

  const handleViewFullProfile = async (id) => {
    setLoadingStates((prev) => ({ ...prev, [`full-profile-${id}`]: true }));
    try {
      const docRef = doc(db, "Profiles", id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setSelectedProfile({ id: snapshot.id, ...snapshot.data() });
        setIsModalOpen(true);
      } else {
        setToast("Profile not found.");
        setTimeout(() => setToast(""), 3000);
      }
    } catch (error) {
      console.error("Error fetching full profile:", error);
      setToast("Failed to load profile details.");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`full-profile-${id}`]: false }));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProfile(null);
  };

  const filteredProfiles = profiles.filter((p) =>
    p.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProfiles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);

  return (
    <div className="text-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">All Profiles</h1>
        <input
          type="text"
          placeholder="Search by name..."
          className="p-2 border rounded w-full max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {toast && (
        <div className="bg-green-100 text-green-800 px-4 py-2 mb-4 rounded-lg shadow-sm">
          {toast}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl shadow border bg-white">
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm text-[#36013F] hover:underline"
          >
            {selectedProfiles.size === filteredProfiles.length ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Select All ({selectedProfiles.size}/{filteredProfiles.length})
          </button>
          <button
            onClick={() => setPromptModal(true)}
            disabled={sendToAll ? false : selectedProfiles.size === 0}
            className="px-4 py-2 bg-[#36013F] text-white rounded-lg hover:bg-[#4a0150] disabled:opacity-50 flex items-center gap-2 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            Send Prompt
          </button>
        </div>
        <table className="min-w-full text-sm text-left border rounded-xl shadow-sm">
          <thead className="bg-[#F4D35E] text-[#36013F] font-semibold text-left">
            <tr>
              <th className="p-3 border w-12"></th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Own Referral Code</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Location</th>
              <th className="p-3 border">Referred By (Code)</th>
              <th className="p-3 border">Visibility</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentItems.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition">
                <td className="p-3 border">
                  <input
                    type="checkbox"
                    checked={selectedProfiles.has(p.id)}
                    onChange={() => handleToggleSelect(p.id)}
                    className="rounded"
                  />
                </td>
                <td className="p-3 border text-gray-600">{p.timestamp}</td>
                <td className="p-3 border text-gray-600">
                  <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-secondary2 border border-primary/20">
                    {p.profileType}
                  </span>
                  <br />
                  {p.generatedReferralCode}
                </td>
                <td className="p-3 border font-medium">
                  {p.fullName}
                  <br />
                  <span className="font-light">{p.email}</span>
                </td>
                <td className="p-3 border">{p.location}</td>
                <td className="p-3 border">{p.referralCode}</td>
                <td className="p-3 border">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={p.isPublic}
                      onChange={() => handleTogglePublic(p.id, p.isPublic)}
                      className="sr-only peer"
                      disabled={loadingStates[`toggle-${p.id}`]}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {loadingStates[`toggle-${p.id}`] ? '...' : p.isPublic ? 'Public' : 'Private'}
                    </span>
                  </label>
                </td>
                <td className="p-3 border flex gap-2 items-center">
                  <button
                    onClick={() => handleViewFullProfile(p.id)}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 relative flex items-center justify-center"
                    disabled={loadingStates[`full-profile-${p.id}`]}
                  >
                    {loadingStates[`full-profile-${p.id}`] ? (
                      <svg
                        className="animate-spin h-4 w-4 text-purple-800"
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
                      "View Full Profile"
                    )}
                  </button>
                  <button
                    onClick={() => handleView(p)}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 relative flex items-center justify-center"
                    disabled={loadingStates[`view-${p.username}`]}
                  >
                    {loadingStates[`view-${p.username}`] ? (
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
                      "View"
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(p.id)}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 relative flex items-center justify-center"
                    disabled={loadingStates[`edit-${p.id}`]}
                  >
                    {loadingStates[`edit-${p.id}`] ? (
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
                      "Edit"
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1 rounded-lg text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 relative flex items-center justify-center"
                    disabled={loadingStates[`delete-${p.id}`]}
                  >
                    {loadingStates[`delete-${p.id}`] ? (
                      <svg
                        className="animate-spin h-4 w-4 text-red-700"
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
                  {(!p.uid || p.status !== "approved") && (
                    <button
                      onClick={() => handleAuthenticate(p)}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 relative flex items-center justify-center"
                      disabled={loadingStates[`auth-${p.id}`]}
                    >
                      {loadingStates[`auth-${p.id}`] ? (
                        <svg
                          className="animate-spin h-4 w-4 text-yellow-800"
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
                        "Authenticate"
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500">
                  No matching profiles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

      {isModalOpen && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold text-[#36013F] mb-4">Full Profile Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Type</label>
                <p className="text-gray-900 capitalize">{selectedProfile.profileType || ''}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="text-gray-900">{selectedProfile.fullName || ''}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="text-gray-900">{selectedProfile.username || ''}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{selectedProfile.email || ''}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="text-gray-900">{selectedProfile.phone || ''}</p>
              </div>
              {selectedProfile.profileType === 'expert' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="text-gray-900">{selectedProfile.dateOfBirth || ''}</p>
                </div>
              )}
              {selectedProfile.profileType === 'agency' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Years Active</label>
                  <p className="text-gray-900">{selectedProfile.yearsActive || ''}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="text-gray-900">{selectedProfile.location || ''}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Languages</label>
                <p className="text-gray-900">{Array.isArray(selectedProfile.languages) ? selectedProfile.languages.join(', ') : ''}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Response Time</label>
                <p className="text-gray-900">{selectedProfile.responseTime || ''}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pricing</label>
                <p className="text-gray-900">{selectedProfile.pricing || ''}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tagline</label>
                <p className="text-gray-900">{selectedProfile.tagline || ''}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">About</label>
                <p className="text-gray-900">{selectedProfile.about || ''}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Services</label>
                <p className="text-gray-900">{Array.isArray(selectedProfile.services) ? selectedProfile.services.join(', ') : ''}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Regions</label>
                <p className="text-gray-900">{Array.isArray(selectedProfile.regions) ? selectedProfile.regions.join(', ') : ''}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expertise</label>
                <p className="text-gray-900">{Array.isArray(selectedProfile.expertise) ? selectedProfile.expertise.join(', ') : ''}</p>
              </div>
              {selectedProfile.profileType === 'expert' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience</label>
                  {Array.isArray(selectedProfile.experience) && selectedProfile.experience.length > 0 ? (
                    selectedProfile.experience.map((exp, index) => (
                      <div key={index} className="border p-3 rounded-lg mb-2">
                        <p><strong>Title:</strong> {exp.title || ''}</p>
                        <p><strong>Company:</strong> {exp.company || ''}</p>
                        <p><strong>Start Date:</strong> {exp.startDate || ''}</p>
                        <p><strong>End Date:</strong> {exp.endDate || ''}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-900"></p>
                  )}
                </div>
              )}
              {selectedProfile.profileType === 'expert' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Certifications</label>
                  <p className="text-gray-900">{selectedProfile.certifications || ''}</p>
                </div>
              )}
              {selectedProfile.profileType === 'agency' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registered Address</label>
                    <p className="text-gray-900">{selectedProfile.registeredAddress || ''}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <p className="text-gray-900">{selectedProfile.website || ''}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Employees</label>
                    <p className="text-gray-900">{selectedProfile.employeeCount || ''}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">License Number</label>
                    <p className="text-gray-900">{selectedProfile.licenseNumber || ''}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Association Membership Certificates</label>
                    {Array.isArray(selectedProfile.certificates) && selectedProfile.certificates.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedProfile.certificates.map((url, index) => (
                          <div key={index} className="relative w-24 h-24">
                            {url.endsWith('.pdf') ? (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg text-sm text-gray-600">
                                PDF
                              </div>
                            ) : (
                              <img
                                src={url}
                                alt={`Certificate ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-900"></p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Office/Establishment Photos</label>
                    {Array.isArray(selectedProfile.officePhotos) && selectedProfile.officePhotos.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedProfile.officePhotos.map((url, index) => (
                          <div key={index} className="relative w-24 h-24">
                            <img
                              src={url}
                              alt={`Office Photo ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-900"></p>
                    )}
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Referred</label>
                <p className="text-gray-900">{selectedProfile.referred || ''}</p>
              </div>
              {selectedProfile.referred === 'Yes' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Referral Code</label>
                  <p className="text-gray-900">{selectedProfile.referralCode || ''}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                {selectedProfile.photo ? (
                  <img
                    src={selectedProfile.photo}
                    alt="Profile Photo"
                    className="w-24 h-24 object-cover rounded-full"
                  />
                ) : (
                  <p className="text-gray-900"></p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {promptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative">
            <button
              onClick={() => {
                setPromptModal(false);
                setPromptQuestion("");
                setPromptAnswer("");
                setPromptError(null);
                setSendToAll(false);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-[#36013F] mb-6">
              Send Prompt {sendToAll ? "to All" : `to ${selectedProfiles.size} Selected`}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Question</label>
                <textarea
                  value={promptQuestion}
                  onChange={(e) => setPromptQuestion(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
                  rows="3"
                  placeholder="Enter the question..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Suggested Answer</label>
                <textarea
                  value={promptAnswer}
                  onChange={(e) => setPromptAnswer(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#36013F]"
                  rows="5"
                  placeholder="Enter the suggested answer..."
                  required
                />
              </div>
              {promptError && <p className="text-red-500 text-sm">{promptError}</p>}
              <button
                type="submit"
                disabled={promptLoading}
                className="w-full bg-[#36013F] text-white py-3 rounded-lg hover:bg-[#4a0150] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {promptLoading ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
                {promptLoading ? "Sending..." : "Send Prompt"}
              </button>
             
            </form>
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sendToAll}
                  onChange={(e) => setSendToAll(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Send to all profiles</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}