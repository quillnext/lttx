"use client";

import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  listAll,
  deleteObject,
} from "firebase/storage";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function ProfilesTablePage() {
  const [profiles, setProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Updated to 10
  const [toast, setToast] = useState("");
  const [loadingStates, setLoadingStates] = useState({});
  const db = getFirestore(app);
  const storage = getStorage(app);
  const router = useRouter();

  useEffect(() => {
    const fetchProfiles = async () => {
      const snapshot = await getDocs(collection(db, "Profiles"));
      const list = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        let rawDate;
        if (data.timestamp && typeof data.timestamp.toDate === "function") {
          rawDate = data.timestamp.toDate();
        } else if (data.timestamp && data.timestamp.seconds) {
          rawDate = new Date(data.timestamp.seconds * 1000);
        } else {
          rawDate = new Date();
        }

        list.push({
          id: docSnap.id,
          fullName: data.fullName,
          username: data.username,
          email: data.email,
          location: data.location,
          phone: data.phone,
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

  const handleView = (username) => {
    setLoadingStates((prev) => ({ ...prev, [`view-${username}`]: true }));
    router.push(`/experts/${username}`);
  };

  const handleEdit = (id) => {
    setLoadingStates((prev) => ({ ...prev, [`edit-${id}`]: true }));
    router.push(`/dashboard/edit/${id}`);
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
        <table className="min-w-full text-sm text-left border rounded-xl shadow-sm">
          <thead className="bg-[#F4D35E] text-[#36013F] font-semibold text-left">
            <tr>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Location</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentItems.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition">
                <td className="p-3 border text-gray-600">{p.timestamp}</td>
                <td className="p-3 border font-medium">{p.fullName}</td>
                <td className="p-3 border">{p.email}</td>
                <td className="p-3 border">{p.location}</td>
                <td className="p-3 border flex gap-2 items-center">
                  <button
                    onClick={() => handleView(p.username)}
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
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
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
    </div>
  );
}