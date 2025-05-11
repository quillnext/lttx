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
  const [itemsPerPage] = useState(15);
  const [toast, setToast] = useState("");
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
    }
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
                  <a target="_blank"
                    href={`/experts/${p.fullName
                      ?.toLowerCase()
                      .replace(/\s+/g, "-")}-${p.id.slice(0, 6)}`}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
                  >
                    View
                  </a>
                  <button
                    onClick={() => router.push(`/dashboard/edit/${p.id}`)}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1 rounded-lg text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    Delete
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
