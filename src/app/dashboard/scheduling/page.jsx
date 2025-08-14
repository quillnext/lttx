"use client";

import { useState, useEffect, useMemo } from "react";
import { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { Loader2, CalendarClock, Search, Calendar, Clock, BarChart, Link2 } from "lucide-react";

const db = getFirestore(app);

const StatCard = ({ title, value, icon, loading }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
    <div className="p-3 bg-yellow-100 rounded-full">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {loading ? (
        <div className="h-7 w-12 bg-gray-200 rounded animate-pulse mt-1"></div>
      ) : (
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      )}
    </div>
  </div>
);

const MeetingLinkModal = ({ booking, onClose, onSuccess }) => {
  const [meetingLink, setMeetingLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!meetingLink) {
      setError("Meeting link is required.");
      return;
    }
    if (!/^https?:\/\/(meet\.google\.com|zoom\.us)/.test(meetingLink)) {
      setError("Please provide a valid Google Meet or Zoom link.");
      return;
    }
    setLoading(true);

    try {
      // Fetch expertEmail from Profiles collection if not in booking
      let expertEmail = booking.expertEmail;
      if (!expertEmail && booking.expertId) {
        console.log("Fetching expert email for expertId:", booking.expertId);
        const profileRef = doc(db, "Profiles", booking.expertId);
        const profileSnap = await getDoc(profileRef).catch((err) => {
          console.error("Error fetching Profiles document:", {
            code: err.code,
            message: err.message,
            stack: err.stack,
          });
          throw err;
        });
        console.log("Profile snapshot:", {
          exists: profileSnap.exists(),
          data: profileSnap.exists() ? profileSnap.data() : null,
        });
        if (!profileSnap.exists()) {
          setError("Expert document not found in Profiles collection.");
          return;
        }
        expertEmail = profileSnap.data().email;
        if (!expertEmail) {
          setError("Expert email not found in profile.");
          return;
        }
      }

      // Fetch userEmail from Users collection if not in booking
      let userEmail = booking.userEmail;
      if (!userEmail && booking.userId) {
        console.log("Fetching user email for userId:", booking.userId);
        const userRef = doc(db, "Users", booking.userId);
        const userSnap = await getDoc(userRef).catch((err) => {
          console.error("Error fetching Users document:", {
            code: err.code,
            message: err.message,
            stack: err.stack,
          });
          throw err;
        });
        console.log("User snapshot:", {
          exists: userSnap.exists(),
          data: userSnap.exists() ? userSnap.data() : null,
        });
        if (!userSnap.exists()) {
          setError("User document not found in Users collection.");
          return;
        }
        userEmail = userSnap.data().email;
        if (!userEmail) {
          setError("User email not found in profile.");
          return;
        }
      }

      // Validate emails
      if (!userEmail || !expertEmail) {
        setError("No expert email found or no user email available.");
        return;
      }

      // Update Firestore with the meeting link and status
      console.log("Updating booking with ID:", booking.id);
      const bookingRef = doc(db, "Bookings", booking.id);
      await updateDoc(bookingRef, {
        meetingLink,
        status: "confirmed",
        userEmail,
        expertEmail,
      }).catch((err) => {
        console.error("Error updating Bookings document:", {
          code: err.code,
          message: err.message,
          stack: err.stack,
        });
        throw err;
      });

      // Send emails via API
      console.log("Sending meeting link email:", { userEmail, expertEmail });
      const response = await fetch("/api/send-meeting-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          userName: booking.userName,
          userPhone: booking.userPhone,
          userMessage: booking.userMessage, // Added userMessage
          expertEmail,
          expertName: booking.expertName,
          bookingDate: booking.bookingDate,
          bookingTime: booking.bookingTime,
          meetingLink,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to send meeting link.");
      }

      onSuccess(booking.id, meetingLink);
      setError("");
      alert("Meeting link sent successfully!");
      onClose();
    } catch (err) {
      console.error("Error in handleSubmit:", {
        code: err.code,
        message: err.message,
        stack: err.stack,
      });
      setError(err.message || "Failed to send meeting link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold text-[#36013F] mb-4">Send Meeting Link</h2>
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
          <p>
            <strong>Client:</strong> {booking.userName || "N/A"}
          </p>
          <p>
            <strong>Expert:</strong> {booking.expertName || "N/A"}
          </p>
          <p>
            <strong>Date:</strong> {booking.bookingDate || "N/A"}
          </p>
          <p>
            <strong>Time:</strong> {booking.bookingTime || "N/A"}
          </p>
          {booking.userMessage && (
            <p>
              <strong>Points to Discuss:</strong> {booking.userMessage}
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700">
              Meeting Link (Google Meet or Zoom)
            </label>
            <input
              type="url"
              id="meetingLink"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#36013F] focus:border-transparent"
              placeholder="https://meet.google.com/xxx-xxxx-xxx or https://zoom.us/j/xxx"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#36013F] text-white py-3 rounded-xl hover:bg-[#4a0152] disabled:opacity-50 transition-colors"
          >
            {loading ? "Sending..." : "Send Meeting Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function BookingOverviewPage() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, today: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        console.log("Fetching bookings from Firestore...");
        const q = query(collection(db, "Bookings"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q).catch((err) => {
          console.error("Error fetching Bookings:", {
            code: err.code,
            message: err.message,
            stack: err.stack,
          });
          throw err;
        });
        const data = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let userEmail = data.userEmail;
            let expertEmail = data.expertEmail;

            // Fetch userEmail if userId exists and userEmail is missing
            if (!userEmail && data.userId) {
              console.log("Fetching user email for userId:", data.userId);
              const userRef = doc(db, "Users", data.userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                userEmail = userSnap.data().email;
              } else {
                console.warn(`User document not found for userId: ${data.userId}`);
              }
            }

            // Fetch expertEmail if expertId exists and expertEmail is missing
            if (!expertEmail && data.expertId) {
              console.log("Fetching expert email for expertId:", data.expertId);
              const profileRef = doc(db, "Profiles", data.expertId);
              const profileSnap = await getDoc(profileRef);
              if (profileSnap.exists()) {
                expertEmail = profileSnap.data().email;
              } else {
                console.warn(`Profile document not found for expertId: ${data.expertId}`);
              }
            }

            return {
              id: docSnap.id,
              ...data,
              userEmail,
              expertEmail,
            };
          })
        );
        console.log("Fetched bookings:", data.length, "data:", data);
        setBookings(data);

        // Calculate stats
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const upcoming = data.filter((b) => {
          if (!b.bookingDate || !b.bookingTime) return false;
          return new Date(`${b.bookingDate}T${b.bookingTime}`) >= todayStart;
        }).length;
        const todayBookings = data.filter((b) => {
          if (!b.createdAt) return false;
          const createdAt = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return createdAt >= todayStart;
        }).length;

        setStats({
          total: data.length,
          upcoming,
          today: todayBookings,
        });
      } catch (error) {
        console.error("Error fetching all bookings:", {
          code: error.code,
          message: error.message,
          stack: error.stack,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.expertName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [bookings, searchTerm]
  );

  const paginatedBookings = useMemo(
    () => filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredBookings, currentPage]
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const handleSendMeetingLink = (booking) => {
    console.log("Selected booking for meeting link:", booking);
    setSelectedBooking(booking);
  };

  const handleBookingSuccess = (bookingId, meetingLink) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, meetingLink, status: "confirmed" } : b))
    );
    setSelectedBooking(null);
  };

  return (
    <div className="p-4 md:p-6 text-gray-800 bg-gray-50 min-h-full">
      <div className="flex items-center gap-3 mb-6">
        <BarChart className="w-8 h-8 text-[#36013F]" />
        <h1 className="text-3xl font-bold text-[#36013F]">Booking Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Bookings"
          value={stats.total}
          icon={<CalendarClock className="text-yellow-600" />}
          loading={loading}
        />
        <StatCard
          title="Upcoming Appointments"
          value={stats.upcoming}
          icon={<Calendar className="text-yellow-600" />}
          loading={loading}
        />
        <StatCard
          title="Bookings Today"
          value={stats.today}
          icon={<Clock className="text-yellow-600" />}
          loading={loading}
        />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold text-gray-800">All Appointments</h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by client or expert..."
              className="p-2 pl-10 border rounded-lg w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#36013F]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#36013F]" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="text-gray-500">
                  <tr>
                    <th className="p-3 font-semibold">Client</th>
                    <th className="p-3 font-semibold">Expert</th>
                    <th className="p-3 font-semibold">Appointment</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.map((b) => (
                    <tr key={b.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                      <td className="p-4">
                        <p className="font-medium text-gray-800">{b.userName || "N/A"}</p>
                        <p className="text-gray-500">{b.userEmail || "N/A"}</p>
                        <p className="text-gray-500">{b.userPhone || "N/A"}</p>
                      </td>
                      <td className="p-4 font-medium text-gray-700">{b.expertName || "N/A"}</td>
                      <td className="p-4">
                        <p className="font-medium text-gray-800">{b.bookingDate || "N/A"}</p>
                        <p className="text-gray-500">{b.bookingTime || "N/A"}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                            b.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {b.status || "pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleSendMeetingLink(b)}
                          className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-[#36013F] bg-[#F4D35E] rounded-lg hover:bg-[#e0c54e]"
                          disabled={b.status === "confirmed"}
                        >
                          <Link2 size={16} /> Send Link
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedBookings.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center p-8 text-gray-500 border-t">
                        No matching bookings found.
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
                        : "text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {selectedBooking && (
        <MeetingLinkModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}