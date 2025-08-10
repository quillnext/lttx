
"use client";

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { CalendarCheck, User, Clock, CheckCircle, CalendarX } from "lucide-react";

const auth = getAuth(app);
const db = getFirestore(app);

export default function BookingsPage() {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchBookings = async () => {
            setLoading(true);
            try {
                // Removed orderBy from query to prevent composite index requirement.
                const bookingsQuery = query(
                    collection(db, "Bookings"),
                    where("expertId", "==", user.uid)
                );
                const querySnapshot = await getDocs(bookingsQuery);
                const bookingsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        // Combine date and time for comparison
                        bookingDateTime: new Date(`${data.bookingDate}T${data.bookingTime || '00:00'}:00`)
                    };
                });

                // Sort client-side
                bookingsData.sort((a,b) => b.bookingDateTime - a.bookingDateTime);

                setBookings(bookingsData);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user]);

    const today = new Date();
    today.setHours(0,0,0,0);

    const upcomingBookings = bookings.filter(b => b.bookingDateTime >= today).sort((a,b) => a.bookingDateTime - b.bookingDateTime);
    const pastBookings = bookings.filter(b => b.bookingDateTime < today);

    const renderBookings = (bookingList, type) => {
        if (loading) {
            return (
                <div className="flex justify-center items-center py-20">
                    <svg className="animate-spin h-8 w-8 text-[#36013F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            );
        }

        if (bookingList.length === 0) {
            return (
                <div className="text-center py-16 px-4 border-2 border-dashed rounded-2xl mt-6 bg-gray-50">
                    <div className="flex justify-center text-gray-400 mb-4">
                        {type === 'upcoming' ? <CalendarCheck size={48} /> : <CalendarX size={48} />}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700">No {type} bookings</h3>
                    <p className="text-gray-500 mt-1">You currently have no {type} bookings.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4 mt-6">
                {bookingList.map(booking => (
                    <div key={booking.id} className="bg-white p-5 rounded-2xl shadow-sm border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-full ${type === 'upcoming' ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <User className={`w-6 h-6 ${type === 'upcoming' ? 'text-green-700' : 'text-gray-500'}`} />
                            </div>
                            <div>
                                <p className="font-semibold text-lg text-gray-800">{booking.userName}</p>
                                <p className="text-gray-600 flex items-center gap-2 text-sm">
                                    <Clock size={14} />
                                    {new Date(booking.bookingDateTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {booking.bookingTime}
                                </p>
                            </div>
                        </div>
                        <div className="w-full sm:w-auto flex justify-end">
                             <span className={`px-4 py-1.5 text-sm font-medium rounded-full flex items-center gap-2 ${
                                booking.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                             }`}>
                                <CheckCircle size={16}/>
                                {booking.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 text-gray-800 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <CalendarCheck className="w-8 h-8 text-[#36013F]" />
                    <h1 className="text-3xl font-bold text-[#36013F]">My Bookings</h1>
                </div>

                <div className="bg-gray-200 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
                    <button 
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors w-full ${activeTab === 'upcoming' ? 'bg-white shadow text-[#36013F]' : 'text-gray-600 hover:bg-gray-300'}`}
                    >
                        Upcoming
                    </button>
                    <button 
                        onClick={() => setActiveTab('past')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors w-full ${activeTab === 'past' ? 'bg-white shadow text-[#36013F]' : 'text-gray-600 hover:bg-gray-300'}`}
                    >
                        Past
                    </button>
                </div>

                {activeTab === 'upcoming' ? renderBookings(upcomingBookings, 'upcoming') : renderBookings(pastBookings, 'past')}
            </div>
        </div>
    );
}
