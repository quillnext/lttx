
"use client";

import { useState, useEffect, useCallback } from "react";
import { getFirestore, collection, getDocs, query, doc, updateDoc, getDoc, writeBatch, where, setDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { Loader2, Save, Power, PowerOff, Check, PlusCircle, Ban } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";

const db = getFirestore(app);

const allTimeSlots = Array.from({ length: 22 }, (_, i) => {
    const hour = Math.floor(i / 2) + 9;
    const minute = (i % 2) * 30;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const defaultSchedule = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [], Sun: [] };

function WeeklyHoursManager({ expert, weeklySchedule, onSave }) {
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [selectedDays, setSelectedDays] = useState({ Mon: false, Tue: false, Wed: false, Thu: false, Fri: false, Sat: false, Sun: false });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const handleSlotToggle = (slot) => setSelectedSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
    const handleDayToggle = (day) => setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }));

    const handleApplySchedule = async () => {
        if (Object.values(selectedDays).every(d => !d)) {
            setMessage("Please select at least one day.");
            setTimeout(() => setMessage(""), 3000);
            return;
        }
        setSaving(true);
        setMessage("");
        
        const updatedSchedule = { ...weeklySchedule };
        for (const day in selectedDays) {
            if (selectedDays[day]) {
                updatedSchedule[day] = selectedSlots.sort();
            }
        }

        try {
            await onSave(updatedSchedule);
            setMessage("Weekly hours updated successfully!");
        } catch (error) {
            setMessage(`Failed to update weekly hours: ${error.message}`);
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    return (
        <div>
            <p className="text-gray-600 mb-4">Set default weekly hours for {expert.label}. Select time slots, then select the days to apply them to.</p>
            <div className="mb-6">
                <h4 className="font-semibold text-lg mb-2">1. Select Time Slots</h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-4 bg-gray-50 rounded-lg">
                    {allTimeSlots.map(slot => (
                        <button key={slot} onClick={() => handleSlotToggle(slot)} className={`p-2 rounded-md text-sm transition-colors ${selectedSlots.includes(slot) ? 'bg-[#36013F] text-white' : 'bg-white border hover:bg-gray-100'}`}>{slot}</button>
                    ))}
                </div>
            </div>
            <div className="mb-6">
                <h4 className="font-semibold text-lg mb-2">2. Select Days to Apply</h4>
                 <div className="flex flex-wrap gap-2">
                    {weekdays.map(day => (
                        <button key={day} onClick={() => handleDayToggle(day)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${selectedDays[day] ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{day}</button>
                    ))}
                </div>
            </div>
            <div className="mt-6 flex justify-between items-center gap-4">
                <div className="flex-1">{message && <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}</div>
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
}

function ExpertAvailabilityManager({ expert }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dailySchedule, setDailySchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("custom");
    const [isOnline, setIsOnline] = useState(true);
    const [weeklySchedule, setWeeklySchedule] = useState({});

    useEffect(() => {
        setIsOnline(expert.isOnline !== false);
        const recurringRef = doc(db, "ExpertRecurringAvailability", expert.value);
        getDoc(recurringRef).then(docSnap => setWeeklySchedule(docSnap.exists() ? (docSnap.data().schedule || defaultSchedule) : defaultSchedule));
    }, [expert]);
    
    const formatDate = (date) => date.toISOString().split('T')[0];

    const fetchDailySchedule = useCallback(async (date) => {
        setLoading(true);
        const dateStr = formatDate(date);
        try {
            const availabilityRef = doc(db, "ExpertAvailability", `${expert.value}_${dateStr}`);
            const availabilitySnap = await getDoc(availabilityRef);
            const availableSlots = availabilitySnap.exists() ? availabilitySnap.data().slots || [] : [];
            const bookingsQuery = query(collection(db, "Bookings"), where("expertId", "==", expert.value), where("bookingDate", "==", dateStr));
            const bookingsSnap = await getDocs(bookingsQuery);
            const bookedSlots = bookingsSnap.docs.map(d => d.data().bookingTime);
            setDailySchedule(allTimeSlots.map(time => ({ time, status: bookedSlots.includes(time) ? 'booked' : availableSlots.some(s => s.startTime === time) ? 'available' : 'unavailable' })));
        } catch (error) {
            console.error("Error fetching daily schedule:", error);
        } finally {
            setLoading(false);
        }
    }, [expert.value]);

    useEffect(() => {
        if (activeTab === "custom") fetchDailySchedule(selectedDate);
    }, [selectedDate, fetchDailySchedule, activeTab]);

    const handleSlotToggle = (slotTime) => setDailySchedule(prev => prev.map(slot => slot.time === slotTime ? { ...slot, status: slot.status === 'available' ? 'unavailable' : 'available' } : slot));
    const handleSaveAvailability = async () => {
        setSaving(true);
        setMessage("");
        const dateStr = formatDate(selectedDate);
        const docRef = doc(db, "ExpertAvailability", `${expert.value}_${dateStr}`);
        const slotsToSave = dailySchedule.filter(s => s.status === 'available').map(({ time }) => ({ startTime: time, status: 'available' }));
        try {
            await setDoc(docRef, { expertId: expert.value, date: dateStr, slots: slotsToSave }, { merge: true });
            setMessage("Availability saved successfully!");
        } catch (error) {
            setMessage("Failed to save availability.");
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };
    
    const handleOnlineToggle = async () => {
        const newStatus = !isOnline;
        setIsOnline(newStatus);
        const profileRef = doc(db, "Profiles", expert.value);
        try {
            await updateDoc(profileRef, { isOnline: newStatus });
        } catch (error) {
            setIsOnline(!newStatus);
        }
    };
    
    const handleWeeklyScheduleSave = async (newSchedule) => {
        const docRef = doc(db, "ExpertRecurringAvailability", expert.value);
        await setDoc(docRef, { schedule: newSchedule, expertId: expert.value }, { merge: true });
        setWeeklySchedule(newSchedule);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800">Managing: <span className="text-[#36013F]">{expert.label}</span></h2>
                <button onClick={handleOnlineToggle} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {isOnline ? <Power size={20} /> : <PowerOff size={20} />}
                    {isOnline ? 'Accepting Bookings' : 'Bookings Paused'}
                </button>
            </div>
            <div className="bg-gray-100 p-1 rounded-xl flex gap-1 w-full sm:w-auto mb-6 max-w-sm">
                <button onClick={() => setActiveTab('custom')} className={`px-4 py-2 rounded-lg font-semibold transition-colors w-full ${activeTab === 'custom' ? 'bg-white shadow text-[#36013F]' : 'text-gray-600 hover:bg-gray-200'}`}>Custom Dates</button>
                <button onClick={() => setActiveTab('recurring')} className={`px-4 py-2 rounded-lg font-semibold transition-colors w-full ${activeTab === 'recurring' ? 'bg-white shadow text-[#36013F]' : 'text-gray-600 hover:bg-gray-200'}`}>Weekly Hours</button>
            </div>
            {activeTab === 'custom' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-gray-50 p-4 rounded-2xl flex flex-col items-center"><h3 className="text-xl font-semibold mb-4 text-center">Select a Date</h3><DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} inline minDate={new Date()} /></div>
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold">Available times for <span className="text-[#36013F]">{selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}</span></h3><button onClick={handleSaveAvailability} disabled={saving || loading} className="flex items-center gap-2 bg-[#36013F] text-white py-2 px-4 rounded-lg hover:bg-[#4a0152] transition-colors disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}{saving ? "Saving..." : "Save Changes"}</button></div>
                        {message && <p className={`text-sm text-center mb-3 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
                        {loading ? (<div className="flex items-center justify-center h-64"><Loader2 className="animate-spin h-10 w-10 text-[#36013F]"/></div>) : (<div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[28rem] overflow-y-auto pr-2">{dailySchedule.map(({ time, status }) => (<button key={time} onClick={() => handleSlotToggle(time)} disabled={status === 'booked'} className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${status === 'booked' ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-transparent' : status === 'available' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400 border-gray-300'}`}><div className="flex items-center justify-center gap-2">{status === 'available' ? <Check size={16}/> : status === 'unavailable' ? <PlusCircle size={16}/> : <Ban size={16}/> }<span>{time}</span></div></button>))}</div>)}
                    </div>
                </div>
            ) : (<WeeklyHoursManager expert={expert} weeklySchedule={weeklySchedule} onSave={handleWeeklyScheduleSave} />)}
        </div>
    );
}

function AllExpertsAvailabilityManager({ experts }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [customSlots, setCustomSlots] = useState([]);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState("custom");
    const [weeklySchedule, setWeeklySchedule] = useState(defaultSchedule);
    const formatDate = (date) => date.toISOString().split('T')[0];

    const handleSaveForAllCustom = async () => {
        if (!window.confirm(`Are you sure you want to set these available slots for ALL ${experts.length} experts on ${selectedDate.toLocaleDateString()}? This will override their custom availability for this day.`)) return;
        setSaving(true);
        setMessage("");
        const dateStr = formatDate(selectedDate);
        const slotsToSave = customSlots.map(time => ({ startTime: time, status: 'available' }));
        try {
            const batch = writeBatch(db);
            experts.forEach(expert => {
                const docRef = doc(db, "ExpertAvailability", `${expert.id}_${dateStr}`);
                batch.set(docRef, { expertId: expert.id, date: dateStr, slots: slotsToSave }, { merge: true });
            });
            await batch.commit();
            setMessage("Availability for all experts saved successfully!");
        } catch (error) {
            setMessage("Failed to save availability for all experts.");
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    const handleSaveForAllRecurring = async (schedule) => {
        if (!window.confirm(`Are you sure you want to apply this weekly schedule to ALL ${experts.length} experts? This will override their existing weekly schedules.`)) return;
        try {
            const batch = writeBatch(db);
            experts.forEach(expert => {
                const docRef = doc(db, "ExpertRecurringAvailability", expert.id);
                batch.set(docRef, { schedule, expertId: expert.id }, { merge: true });
            });
            await batch.commit();
            setWeeklySchedule(schedule);
        } catch (error) {
            throw error;
        }
    };

    return (
         <div className="bg-white p-6 rounded-2xl shadow-sm border mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"><h2 className="text-xl font-bold text-gray-800">Managing Schedule for: <span className="text-[#36013F]">All Experts ({experts.length})</span></h2></div>
            <div className="bg-gray-100 p-1 rounded-xl flex gap-1 w-full sm:w-auto mb-6 max-w-sm"><button onClick={() => setActiveTab('custom')} className={`px-4 py-2 rounded-lg font-semibold transition-colors w-full ${activeTab === 'custom' ? 'bg-white shadow text-[#36013F]' : 'text-gray-600 hover:bg-gray-200'}`}>Custom Dates</button><button onClick={() => setActiveTab('recurring')} className={`px-4 py-2 rounded-lg font-semibold transition-colors w-full ${activeTab === 'recurring' ? 'bg-white shadow text-[#36013F]' : 'text-gray-600 hover:bg-gray-200'}`}>Weekly Hours</button></div>
            {message && <p className={`text-sm text-center mb-3 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
            {activeTab === 'custom' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-gray-50 p-4 rounded-2xl flex flex-col items-center"><h3 className="text-xl font-semibold mb-4 text-center">1. Select a Date</h3><DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} inline minDate={new Date()} /></div>
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold">2. Select Available Slots</h3><button onClick={handleSaveForAllCustom} disabled={saving} className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}{saving ? "Saving..." : "Apply to All"}</button></div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">{allTimeSlots.map(time => (<button key={time} onClick={() => setCustomSlots(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time])} className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${customSlots.includes(time) ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'}`}><div className="flex items-center justify-center gap-2">{customSlots.includes(time) ? <Check size={16}/> : <PlusCircle size={16}/> }<span>{time}</span></div></button>))}</div>
                    </div>
                </div>
            ) : (<WeeklyHoursManager expert={{ value: 'all', label: `All ${experts.length} Experts` }} weeklySchedule={weeklySchedule} onSave={handleSaveForAllRecurring} />)}
        </div>
    );
}

export default function ManageAvailability() {
    const [experts, setExperts] = useState([]);
    const [selectedExpert, setSelectedExpert] = useState(null);
    const [loadingExperts, setLoadingExperts] = useState(true);
    const [managementMode, setManagementMode] = useState('one-on-one');

    useEffect(() => {
        const fetchExperts = async () => {
            setLoadingExperts(true);
            try {
                const profilesQuery = query(collection(db, "Profiles")); // Fetch all profiles
                const querySnapshot = await getDocs(profilesQuery);
                const expertData = querySnapshot.docs
                    .filter(doc => doc.data().profileType !== 'agency') // Filter out agencies on the client-side
                    .map(doc => ({ 
                        value: doc.id, 
                        label: doc.data().fullName || doc.data().username || `Expert ID: ${doc.id}`, 
                        ...doc.data(), 
                        id: doc.id 
                    }));
                setExperts(expertData);
            } catch (error) {
                console.error("Error fetching experts:", error);
            }
            setLoadingExperts(false);
        };
        fetchExperts();
    }, []);

    return (
        <div>
            <div className="mb-6 p-4 bg-white rounded-xl border">
                <label className="block text-lg font-semibold text-gray-700 mb-2">Management Mode</label>
                 <div className="bg-gray-100 p-1 rounded-xl flex gap-1 w-full sm:w-auto max-w-sm">
                    <button onClick={() => { setManagementMode('one-on-one'); setSelectedExpert(null); }} className={`px-4 py-2 rounded-lg font-semibold transition-colors w-full ${managementMode === 'one-on-one' ? 'bg-white shadow text-[#36013F]' : 'text-gray-600 hover:bg-gray-200'}`}>One on One</button>
                    <button onClick={() => { setManagementMode('all-at-once'); setSelectedExpert(null); }} className={`px-4 py-2 rounded-lg font-semibold transition-colors w-full ${managementMode === 'all-at-once' ? 'bg-white shadow text-[#36013F]' : 'text-gray-600 hover:bg-gray-200'}`}>All Experts at Once</button>
                </div>
            </div>

            {managementMode === 'one-on-one' && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select an Expert</label>
                    <Select options={experts} onChange={setSelectedExpert} isLoading={loadingExperts} value={selectedExpert} placeholder="Search and select an expert..." isSearchable className="react-select-container" classNamePrefix="react-select" />
                </div>
            )}

            {managementMode === 'one-on-one' && selectedExpert && <ExpertAvailabilityManager key={selectedExpert.value} expert={selectedExpert} />}

            {managementMode === 'all-at-once' && (
                loadingExperts ? (
                    <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-[#36013F]"/><span className="ml-4 text-lg">Loading experts...</span></div>
                ) : (
                    <AllExpertsAvailabilityManager experts={experts} />
                )
            )}
        </div>
    );
}
