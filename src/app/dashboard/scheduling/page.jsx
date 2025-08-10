
"use client";

import { useState, useEffect, useMemo } from "react";
import { getFirestore, collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { Loader2, CalendarClock, Search, Users, Calendar, Clock, BarChart } from "lucide-react";

const db = getFirestore(app);

const StatCard = ({ title, value, icon, loading }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
        <div className="p-3 bg-yellow-100 rounded-full">
            {icon}
        </div>
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

export default function BookingOverviewPage() {
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({ total: 0, upcoming: 0, today: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, "Bookings"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setBookings(data);

                // Calculate stats
                const now = new Date();
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const upcoming = data.filter(b => new Date(`${b.bookingDate}T${b.bookingTime}`) >= todayStart).length;
                const todayBookings = data.filter(b => b.createdAt.toDate() >= todayStart).length;

                setStats({
                    total: data.length,
                    upcoming: upcoming,
                    today: todayBookings
                });

            } catch (error) {
                console.error("Error fetching all bookings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const filteredBookings = useMemo(() =>
        bookings.filter(b =>
            b.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.expertName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
        ), [bookings, searchTerm]);

    const paginatedBookings = useMemo(() =>
        filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredBookings, currentPage]);
    
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

    return (
        <div className="p-4 md:p-6 text-gray-800 bg-gray-50 min-h-full">
            <div className="flex items-center gap-3 mb-6">
                <BarChart className="w-8 h-8 text-[#36013F]" />
                <h1 className="text-3xl font-bold text-[#36013F]">Booking Overview</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Bookings" value={stats.total} icon={<CalendarClock className="text-yellow-600" />} loading={loading} />
                <StatCard title="Upcoming Appointments" value={stats.upcoming} icon={<Calendar className="text-yellow-600" />} loading={loading} />
                <StatCard title="Bookings Today" value={stats.today} icon={<Clock className="text-yellow-600" />} loading={loading} />
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
                     <div className="flex justify-center items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#36013F]" /></div>
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedBookings.map(b => (
                                        <tr key={b.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                                            <td className="p-4">
                                                <p className="font-medium text-gray-800">{b.userName}</p>
                                                <p className="text-gray-500">{b.userEmail}</p>
                                                <p className="text-gray-500">{b.userPhone}</p>
                                            </td>
                                            <td className="p-4 font-medium text-gray-700">{b.expertName}</td>
                                            <td className="p-4">
                                                 <p className="font-medium text-gray-800">{b.bookingDate}</p>
                                                 <p className="text-gray-500">{b.bookingTime}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                                                    b.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>{b.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedBookings.length === 0 && (
                                        <tr><td colSpan="4" className="text-center p-8 text-gray-500 border-t">No matching bookings found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6 gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button key={page} className={`px-3 py-1 rounded-md text-sm font-medium border transition ${page === currentPage ? "bg-[#36013F] text-white border-[#36013F]" : "text-gray-700 border-gray-200 hover:bg-gray-100"}`} onClick={() => setCurrentPage(page)}>{page}</button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
