
"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { app } from "@/lib/firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock, Check, Ban, Briefcase, PlusCircle, Save, Repeat, Loader2, Power, PowerOff } from "lucide-react";

const auth = getAuth(app);
const db = getFirestore(app);

const allTimeSlots = Array.from({ length: 22 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = (i % 2) * 30;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WeeklyHoursSetter = ({ user, weeklySchedule, setWeeklySchedule }) => {
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [selectedDays, setSelectedDays] = useState({ Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const handleSlotToggle = (slot) => {
        setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
    };

    const handleDayToggle = (day) => {
        setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }));
    };

    const handleApplySchedule = async () => {
        if (!user || Object.values(selectedDays).every(d => !d)) {
            setMessage("Please select at least one day to apply the schedule.");
            setTimeout(() => setMessage(""), 3000);
            return;
        }
        setSaving(true);
        setMessage("");
        try {
            const updatedSchedule = { ...weeklySchedule };
            for (const day in selectedDays) {
                if (selectedDays[day]) {
                    updatedSchedule[day] = selectedSlots.sort();
                }
            }
            const docRef = doc(db, "ExpertRecurringAvailability", user.uid);
            await setDoc(docRef, { schedule: updatedSchedule, expertId: user.uid }, { merge: true });
            setWeeklySchedule(updatedSchedule); // Update parent state
            setMessage("Weekly hours updated successfully!");
        } catch (error) {
            console.error("Error saving weekly hours:", error);
            setMessage("Failed to save weekly hours.");
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md">
            <p className="text-gray-600 mb-4">Set your default weekly hours. Select time slots, then select the days you want to apply them to.</p>
            
            <div className="mb-6">
                <h4 className="font-semibold text-lg mb-2">1. Select Available Time Slots</h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-4 bg-gray-50 rounded-lg">
                    {allTimeSlots.map(slot => (
                        <button key={slot} onClick={() => handleSlotToggle(slot)} className={`p-2 rounded-md text-sm transition-colors ${selectedSlots.includes(slot) ? 'bg-[#36013F] text-white' : 'bg-white border hover:bg-gray-100'}`}>
                            {slot}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <h4 className="font-semibold text-lg mb-2">2. Select Days to Apply</h4>
                 <div className="flex flex-wrap gap-2">
                    {weekdays.map(day => (
                        <button key={day} onClick={() => handleDayToggle(day)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${selectedDays[day] ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6 flex justify-between items-center gap-4">
                <div className="flex-1">
                 {message && <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
                </div>
                <button onClick={handleApplySchedule} disabled={saving} className="flex items-center gap-2 bg-[#36013F] text-white py-2 px-6 rounded-lg hover:bg-[#4a0152] transition-colors disabled:opacity-50">
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {saving ? "Saving..." : "Apply to Selected Days"}
                </button>
            </div>
            
            <div className="mt-8">
                <h4 className="font-semibold text-lg mb-2">Current Weekly Schedule</h4>
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    {weekdays.map(day => (
                        <div key={day} className="flex items-start">
                            <span className="font-medium w-12">{day}:</span>
                            <span className="flex-1 text-gray-700">{weeklySchedule[day]?.join(', ') || 'Unavailable'}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function AvailabilityPage() {
    const [user, setUser] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dailySchedule, setDailySchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("custom");
    const [isOnline, setIsOnline] = useState(true);
    const [weeklySchedule, setWeeklySchedule] = useState({});

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const profileRef = doc(db, "Profiles", currentUser.uid);
                getDoc(profileRef).then(docSnap => {
                    if (docSnap.exists()) {
                        setIsOnline(docSnap.data().isOnline !== false); // Default to true if undefined
                    }
                });

                const recurringRef = doc(db, "ExpertRecurringAvailability", currentUser.uid);
                getDoc(recurringRef).then(docSnap => {
                    if (docSnap.exists()) {
                        setWeeklySchedule(docSnap.data().schedule || {});
                    }
                });
            }
        });
        return () => unsubscribe();
    }, []);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const fetchDailySchedule = useCallback(async (date) => {
        if (!user) return;
        setLoading(true);
        const dateStr = formatDate(date);
        
        try {
            const availabilityRef = doc(db, "ExpertAvailability", `${user.uid}_${dateStr}`);
            const availabilitySnap = await getDoc(availabilityRef);
            const availableSlots = availabilitySnap.exists() ? availabilitySnap.data().slots || [] : [];
            
            const bookingsQuery = query(collection(db, "Bookings"), where("expertId", "==", user.uid), where("bookingDate", "==", dateStr));
            const bookingsSnap = await getDocs(bookingsQuery);
            const bookedSlots = bookingsSnap.docs.map(d => d.data().bookingTime);
            
            const combinedSchedule = allTimeSlots.map(time => {
                if (bookedSlots.includes(time)) return { time, status: 'booked' };
                if (availableSlots.some(s => s.startTime === time)) return { time, status: 'available' };
                return { time, status: 'unavailable' };
            });
            
            setDailySchedule(combinedSchedule);
        } catch (error) {
            console.error("Error fetching daily schedule:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user && activeTab === "custom") {
            fetchDailySchedule(selectedDate);
        }
    }, [user, selectedDate, fetchDailySchedule, activeTab]);

    const handleSlotToggle = (slotTime) => {
        setDailySchedule(currentSchedule =>
            currentSchedule.map(slot =>
                slot.time === slotTime ? { ...slot, status: slot.status === 'available' ? 'unavailable' : 'available' } : slot
            )
        );
    };

    const handleSaveAvailability = async () => {
        if (!user) return;
        setSaving(true);
        setMessage("");

        const dateStr = formatDate(selectedDate);
        const docRef = doc(db, "ExpertAvailability", `${user.uid}_${dateStr}`);
        
        const slotsToSave = dailySchedule.filter(s => s.status === 'available').map(({ time }) => ({ startTime: time, status: 'available' }));

        try {
            await setDoc(docRef, { expertId: user.uid, date: dateStr, slots: slotsToSave }, { merge: true });
            setMessage("Availability saved successfully!");
        } catch (error) {
            console.error("Error saving availability:", error);
            setMessage("Failed to save availability.");
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };
    
    const handleOnlineToggle = async () => {
        if (!user) return;
        const newStatus = !isOnline;
        setIsOnline(newStatus);
        const profileRef = doc(db, "Profiles", user.uid);
        try {
            await updateDoc(profileRef, { isOnline: newStatus });
        } catch (error) {
            console.error("Failed to update online status:", error);
            setIsOnline(!newStatus); // Revert on error
        }
    };

    return (
        <>
            <style jsx global>{`...`}</style>
            <div className="p-4 md:p-8 text-gray-800 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex items-center gap-3">
                           <Briefcase className="w-8 h-8 text-[#36013F]" />
                           <h1 className="text-3xl font-bold text-[#36013F]">Set Your Availability</h1>
                        </div>
                        <button onClick={handleOnlineToggle} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {isOnline ? <Power size={20} /> : <PowerOff size={20} />}
                            {isOnline ? 'Accepting Bookings' : 'Bookings Paused'}
                        </button>
                    </div>
                     <div className="bg-gray-200 p-1 rounded-xl flex gap-1 w-full sm:w-auto mb-6 max-w-sm">
                        <button onClick={() => setActiveTab('custom')} className={`px-6 py-2 rounded-lg font-semibold transition-colors w-full ${activeTab === 'custom' ? 'bg-white shadow text-[#36013F]' : 'text-gray-600 hover:bg-gray-300'}`}>Custom Dates</button>
                        <button onClick={() => setActiveTab('recurring')} className={`px-6 py-2 rounded-lg font-semibold transition-colors w-full ${activeTab === 'recurring' ? 'bg-white shadow text-[#36013F]' : 'text-gray-600 hover:bg-gray-300'}`}>Weekly Hours</button>
                    </div>

                   {activeTab === 'custom' ? (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 bg-white p-4 sm:p-6 rounded-2xl shadow-md flex flex-col items-center">
                            <h2 className="text-xl font-semibold mb-4 text-center">Select a Date</h2>
                            <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} inline minDate={new Date()} />
                        </div>

                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Available times for <span className="text-[#36013F]">{selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long' })}</span></h2>
                                <button onClick={handleSaveAvailability} disabled={saving || loading} className="flex items-center gap-2 bg-[#36013F] text-white py-2 px-4 rounded-lg hover:bg-[#4a0152] transition-colors disabled:opacity-50">
                                    {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                            {message && <p className={`text-sm text-center mb-3 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
                            
                            {loading ? (
                                <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-10 w-10 text-[#36013F]"/></div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[28rem] overflow-y-auto pr-2">
                                    {dailySchedule.map(({ time, status }) => (
                                        <button key={time} onClick={() => handleSlotToggle(time)} disabled={status === 'booked'} className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${status === 'booked' ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-transparent' : status === 'available' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400 border-gray-300'}`}>
                                           <div className="flex items-center justify-center gap-2">
                                            {status === 'available' ? <Check size={16}/> : status === 'unavailable' ? <PlusCircle size={16}/> : <Ban size={16}/> }
                                            <span>{time}</span>
                                           </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                   ) : (
                       <WeeklyHoursSetter user={user} weeklySchedule={weeklySchedule} setWeeklySchedule={setWeeklySchedule} />
                   )}
                </div>
            </div>
        </>
    );
}
