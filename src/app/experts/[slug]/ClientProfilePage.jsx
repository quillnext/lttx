
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Share2, MessageCircle, Calendar as CalendarIcon, Loader2, PowerOff, HelpCircle, Users } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/pages/Footer";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, runTransaction, Timestamp, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";

const AskQuestionModal = dynamic(() => import("@/app/components/AskQuestionModal"), { ssr: false });
const Select = dynamic(() => import("react-select"), { ssr: false });
const db = getFirestore(app);
const auth = getAuth(app);

const allTimeSlots = Array.from({ length: 22 }, (_, i) => {
  const hour = Math.floor(i / 2) + 9;
  const minute = (i % 2) * 30;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const calculateTotalExperience = (experience) => {
  if (!Array.isArray(experience) || experience.length === 0) return "0+";

  const today = new Date();
  let earliestStart = null;
  let latestEnd = null;

  experience.forEach((exp) => {
    const startDate = exp.startDate ? new Date(exp.startDate) : null;
    const endDate = exp.endDate === "Present" ? today : exp.endDate ? new Date(exp.endDate) : null;

    if (startDate && (!earliestStart || startDate < earliestStart)) {
      earliestStart = startDate;
    }
    if (endDate && (!latestEnd || endDate > latestEnd)) {
      latestEnd = endDate;
    }
  });

  if (!earliestStart || !latestEnd || latestEnd < earliestStart) {
    return "0+";
  }

  const totalMonths =
    (latestEnd.getFullYear() - earliestStart.getFullYear()) * 12 +
    (latestEnd.getMonth() - earliestStart.getMonth());

  const years = Math.floor(totalMonths / 12);
  return `${years}+`;
};

const BookingConfirmationModal = ({ expert, selectedDate, selectedSlot, onClose, onBookingSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [referredByAgency, setReferredByAgency] = useState("No");
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const agenciesQuery = query(collection(db, "Profiles"), where("profileType", "==", "agency"));
        const querySnapshot = await getDocs(agenciesQuery);
        if (!querySnapshot.empty) {
          const agencyData = querySnapshot.docs.map(doc => ({ value: doc.id, label: doc.data().fullName }));
          setAgencies(agencyData);
        }
      } catch (error) {
        console.error("Failed to fetch agencies:", error);
        toast.error("Could not load agency list.");
      }
    };
    fetchAgencies();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || "");
        setEmail(currentUser.email || "");
        setPhone(currentUser.phoneNumber || "");
        setHasSubmitted(true);
        setIsEmailVerified(true);
      } else {
        const savedData = localStorage.getItem("userFormData");
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setName(parsedData.name || "");
          setEmail(parsedData.email || "");
          setPhone(parsedData.phone || "");
          setHasSubmitted(true);
          setIsEmailVerified(true);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let timer;
    if (isOtpSent && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
    } else if (resendTimer === 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isOtpSent, resendTimer]);

  const validateForm = () => {
    if (!name) return "Name is required.";
    if (!email || !/\S+@\S+\.\S+/.test(email)) return "Invalid email format.";
    if (!hasSubmitted && !user && !isEmailVerified) return "Please verify your email with OTP.";
    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone)) return "Invalid phone number format.";
    if (referredByAgency === "Yes" && !selectedAgency) return "Please select an agency.";
    return "";
  };

  const handleSendOtp = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email first.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userName: name }),
      });
      if (response.ok) {
        setIsOtpSent(true);
        setResendTimer(60);
        toast.success("OTP sent to your email!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Error sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (data.verified) {
        setIsEmailVerified(true);
        toast.success("Email verified successfully!");
      } else {
        toast.error(data.error || "Invalid or expired OTP.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Error verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }
    setError("");
    setLoading(true);

    const dateStr = selectedDate.toISOString().split("T")[0];

    try {
      await runTransaction(db, async (transaction) => {
        const availabilityRef = doc(db, "ExpertAvailability", `${expert.id}_${dateStr}`);
        const availabilityDoc = await transaction.get(availabilityRef);

        if (availabilityDoc.exists()) {
          const data = availabilityDoc.data();
          const slots = data.slots || [];
          const slotIndex = slots.findIndex((s) => s.startTime === selectedSlot.startTime);

          if (slotIndex === -1 || slots[slotIndex].status !== "available") {
            throw new Error("This time slot is no longer available. Please select another one.");
          }
          slots[slotIndex].status = "booked";
          transaction.update(availabilityRef, { slots });
        }

        const bookingRef = doc(collection(db, "Bookings"));
        const bookingData = {
          expertId: expert.id,
          expertName: expert.fullName,
          userId: user ? user.uid : null,
          userName: name,
          userEmail: email,
          userPhone: phone,
          userMessage: message,
          bookingDate: dateStr,
          bookingTime: selectedSlot.startTime,
          status: "pending",
          createdAt: Timestamp.now(),
        };

        if (referredByAgency === 'Yes' && selectedAgency) {
            bookingData.referredByAgencyId = selectedAgency.value;
            bookingData.referredByAgencyName = selectedAgency.label;
        }
        transaction.set(bookingRef, bookingData);
      });

      if (!user && !hasSubmitted) {
        const userData = { name, email, phone };
        localStorage.setItem("userFormData", JSON.stringify(userData));
        setHasSubmitted(true);
      }

      await fetch("/api/send-booking-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: email,
          userName: name,
          userPhone: phone,
          userMessage: message,
          expertEmail: expert.email,
          expertName: expert.fullName,
          bookingDate: selectedDate.toISOString().split("T")[0],
          bookingTime: selectedSlot.startTime,
          referredByAgencyName: referredByAgency === 'Yes' && selectedAgency ? selectedAgency.label : null,
        }),
      });

      setIsSuccess(true);
      onBookingSuccess();
    } catch (err) {
      console.error("Booking failed:", err);
      setError(err.message || "Failed to book the appointment. Please try again.");
      toast.error(err.message || "Failed to book the appointment.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-700">
            Your meeting with <strong>{expert.fullName}</strong> on{" "}
            <strong>
              {selectedDate.toLocaleDateString()} at {selectedSlot.startTime}
            </strong>{" "}
            is confirmed.
          </p>
          <p className="text-gray-600 mt-2">Check your email for details.</p>
          <button
            onClick={onClose}
            className="mt-6 w-full bg-[#36013F] text-white py-3 rounded-xl hover:bg-[#4a0152]"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold text-[#36013F] mb-4">Confirm Your Booking</h2>
        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
          <p>
            <strong>Expert:</strong> {expert.fullName}
          </p>
          <p>
            <strong>Date:</strong> {selectedDate.toLocaleDateString()}
          </p>
          <p>
            <strong>Time:</strong> {selectedSlot.startTime}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#36013F] focus:border-transparent"
              disabled={!!user && !!user.displayName}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#36013F] focus:border-transparent ${
                  error.includes("email") ? "border-red-500" : ""
                }`}
                disabled={!!user && !!user.email}
              />
              {!(hasSubmitted || user) && !isOtpSent && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="mt-1 bg-[#36013F] text-white px-4 py-2 rounded-lg hover:bg-[#4a0152] disabled:opacity-50"
                  disabled={loading || resendTimer > 0}
                >
                  {resendTimer > 0 ? `Resend (${resendTimer}s)` : "Send OTP"}
                </button>
              )}
            </div>
            {!(hasSubmitted || user) && isOtpSent && !isEmailVerified && (
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#36013F] focus:border-transparent"
                  placeholder="Enter OTP"
                  maxLength={6}
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="mt-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  disabled={loading}
                >
                  Verify
                </button>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <PhoneInput
              country={"in"}
              value={phone}
              onChange={(p) => setPhone(`+${p}`)}
              inputProps={{
                id: "phone",
                name: "phone",
                required: true,
                className: `w-full border rounded-lg focus:ring-2 focus:ring-[#36013F] focus:border-transparent pl-12 py-2 ${
                  error.includes("phone") ? "border-red-500" : ""
                }`,
              }}
              containerClassName="mt-1"
              disabled={!!user && !!user.phoneNumber}
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Points to discuss
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#36013F] focus:border-transparent"
              placeholder="Anything you'd like the expert to know?"
            />
          </div>
           <div>
              <label className="block text-sm font-medium text-gray-700">Referred by an agency?</label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2">
                  <input type="radio" name="referredByAgency" value="Yes" checked={referredByAgency === 'Yes'} onChange={(e) => setReferredByAgency(e.target.value)} />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="referredByAgency" value="No" checked={referredByAgency === 'No'} onChange={(e) => setReferredByAgency(e.target.value)} />
                  No
                </label>
              </div>
            </div>
            {referredByAgency === 'Yes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Agency</label>
                <Select
                  options={agencies}
                  value={selectedAgency}
                  onChange={setSelectedAgency}
                  placeholder="Select an agency..."
                  className="mt-1"
                  classNamePrefix="react-select"
                />
              </div>
            )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || (!hasSubmitted && !user && !isEmailVerified)}
            className="w-full bg-[#36013F] text-white py-3 rounded-xl hover:bg-[#4a0152] disabled:opacity-50 transition-colors"
          >
            {loading ? "Confirming..." : "Confirm & Book"}
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </div>
  );
};

const BookingComponent = ({ expert, weeklySchedule }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [slotsForSelectedDate, setSlotsForSelectedDate] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const expertId = expert?.id;
  const isAgency = expert.profileType === 'agency';

  const fetchSlotsForDate = useCallback(
    async (date) => {
      if (!expertId || !date) return;
      setLoadingSlots(true);
      setSlotsForSelectedDate([]);
      const dateStr = date.toISOString().split("T")[0];
      const dayOfWeek = weekdays[date.getDay()];

      try {
        const availabilityRef = doc(db, "ExpertAvailability", `${expert.id}_${dateStr}`);
        const availabilitySnap = await getDoc(availabilityRef);

        let potentialSlots = [];
        if (availabilitySnap.exists()) {
          potentialSlots = availabilitySnap.data().slots?.filter((s) => s.status === "available").map((s) => s.startTime) || [];
        } else {
          potentialSlots = weeklySchedule[dayOfWeek] || [];
        }

        const bookingsQuery = query(
          collection(db, "Bookings"),
          where("expertId", "==", expert.id),
          where("bookingDate", "==", dateStr)
        );
        const bookingsSnap = await getDocs(bookingsQuery);
        const bookedTimes = bookingsSnap.docs.map((d) => d.data().bookingTime);

        const finalAvailableSlots = potentialSlots
          .filter((time) => !bookedTimes.includes(time))
          .map((time) => ({ startTime: time, status: "available" }))
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        setSlotsForSelectedDate(finalAvailableSlots);
      } catch (err) {
        console.error("Error fetching slots for date:", err);
        setSlotsForSelectedDate([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    [expertId, expert.id, weeklySchedule]
  );

  useEffect(() => {
    if (selectedDate) {
      fetchSlotsForDate(selectedDate);
    }
  }, [selectedDate, fetchSlotsForDate]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    fetchSlotsForDate(selectedDate);
  };

  const setToday = () => {
    handleDateSelect(new Date());
  };

  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    handleDateSelect(tomorrow);
  };

  const CustomCalendarInput = ({ value, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full justify-center px-4 py-2 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 transition-colors"
    >
      <CalendarIcon size={16} /> {value ? `Date: ${value}` : "Pick a Date"}
    </button>
  );

  return (
    <>
      <details className="group bg-white rounded-2xl shadow border border-[#F4D35E30] overflow-hidden">
        <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors duration-200 hover:bg-gray-50">
          <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-lg font-semibold text-[#36013F]">
            {isAgency ? 'Schedule a Meeting' : 'Book a 1-on-1 Meeting'}
          </h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-5 h-5 text-[#36013F] transition-transform duration-300 group-open:rotate-180"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed">
          {!expert.isOnline ? (
            <div className="text-center py-10 px-4 border-2 border-dashed rounded-2xl mt-6 bg-gray-50">
              <div className="flex justify-center text-gray-400 mb-4">
                <PowerOff size={48} />
              </div>
              <h3 className="text-xl font-semibold text-gray-700">Bookings are currently paused</h3>
              <p className="text-gray-500 mt-1">This expert is not accepting new bookings at this time. Please check back later.</p>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">1. Pick a Date</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={setToday}
                  className="px-4 py-2 rounded-lg border-2 bg-white hover:bg-gray-50 border-gray-300 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={setTomorrow}
                  className="px-4 py-2 rounded-lg border-2 bg-white hover:bg-gray-50 border-gray-300 transition-colors"
                >
                  Tomorrow
                </button>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateSelect}
                  minDate={new Date()}
                  customInput={<CustomCalendarInput value={selectedDate ? selectedDate.toLocaleDateString() : ""} />}
                  popperPlacement="top-end"
                />
              </div>

              {loadingSlots && (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="animate-spin h-8 w-8 text-[#36013F]" />
                </div>
              )}

              {selectedDate && !loadingSlots && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    2. Pick a Time for{" "}
                    {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </h3>
                  {slotsForSelectedDate.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {allTimeSlots.map((time) => {
                        const slot = slotsForSelectedDate.find((s) => s.startTime === time);
                        const isAvailable = !!slot;
                        return (
                          <button
                            key={time}
                            onClick={() => isAvailable && handleSlotClick(slot)}
                            disabled={!isAvailable}
                            className={`p-2 border rounded-lg text-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#36013F] ${
                              isAvailable
                                ? "bg-gray-100 hover:bg-[#36013F] hover:text-white"
                                : "bg-gray-50 text-gray-400 cursor-not-allowed line-through"
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-10">
                      This expert has no availability on this date. Please try another day.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </details>
      {isBookingModalOpen && selectedDate && selectedSlot && (
        <BookingConfirmationModal
          expert={expert}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          onClose={() => setIsBookingModalOpen(false)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </>
  );
};

export default function ClientProfilePage({ profile, sortedExperience, weeklySchedule }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareMessageVisible, setIsShareMessageVisible] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const expertId = profile?.expertId || profile?.id || profile?.userId;
  if (!profile || !expertId) {
    console.error("Profile or expertId is missing:", profile);
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-600 text-center">
          <p>Unable to load profile. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#F4D35E] text-[#36013F] rounded-lg hover:bg-[#e0c54e]"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  const username = profile?.username;
  const isAgency = profile.profileType === 'agency';
  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/experts/${username}` : "";

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.fullName} | ${isAgency ? 'Travel Agency' : 'Travel Expert'}`,
          text: profile.tagline || `Check out this ${isAgency ? 'travel agency' : 'travel expert'}'s profile!`,
          url: profileUrl,
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        setIsShareMessageVisible(true);
        setTimeout(() => setIsShareMessageVisible(false), 2000);
      }
    } catch (error) {
      console.error("Error sharing profile:", error);
    }
  };

  const openLightbox = (imageSrc) => {
    setSelectedImage(imageSrc);
    setIsLightboxOpen(true);
  };

  const totalExperience = calculateTotalExperience(sortedExperience);

  useEffect(() => {
    const fetchAnsweredQuestions = async () => {
      if (!expertId) {
        console.error("Expert ID is missing:", profile);
        setLoadingQuestions(false);
        return;
      }

      setLoadingQuestions(true);
      try {
        const q = query(
          collection(db, "Questions"),
          where("expertId", "==", expertId),
          where("status", "==", "answered")
        );
        const querySnapshot = await getDocs(q);
        const questionList = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const rawDate = data.createdAt?.toDate?.() ?? new Date(data.createdAt);
          return {
            id: docSnap.id,
            ...data,
            timestamp:
              rawDate.toLocaleDateString("en-GB") +
              " " +
              rawDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
          };
        });

        const sortedQuestions = questionList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAnsweredQuestions(sortedQuestions);
      } catch (error) {
        console.error("Error fetching answered questions:", error.message);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchAnsweredQuestions();
  }, [expertId]);

  const totalPages = Math.ceil(answeredQuestions.length / itemsPerPage);
  const paginatedQuestions = answeredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const cardClass = `rounded-3xl shadow-lg p-6 text-center sticky top-8 relative ${
    isAgency ? 'animate-gradientShift2 text-primary-foreground' : 'animate-gradientShift text-primary-foreground'
  }`;

  return (
    <>
      <Navbar />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <div className="text-gray-800 relative mt-20 pb-16 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <aside className="lg:col-span-1 space-y-4">
            <div className={cardClass}>
              <span className="absolute top-2 left-2 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm uppercase">
                {isAgency ? 'Travel Agency' : 'Expert'}
              </span>
              <div className="mb-4 relative">
                <button
                  onClick={() => openLightbox(profile.photo || "/default.jpg")}
                  className="w-28 h-28 rounded-full border-4 border-secondary object-cover mx-auto shadow-md overflow-hidden"
                >
                  <Image
                    src={profile.photo || "/default.jpg"}
                    alt={profile.fullName}
                    width={112}
                    height={112}
                    className="rounded-full object-cover mx-auto shadow-md"
                  />
                </button>
                <div className="flex justify-center items-center py-1 absolute top-0 right-0 space-y-0.5">
                  <div className="text-secondary border-2 border-white rounded-lg px-2 w-[48px] flex flex-col items-center">
                    <h1 className="font-bold text-center text-base text-white">{isAgency ? (profile.yearsActive || '0+') : totalExperience}</h1>
                    <span className="font-semibold text-xs text-center text-white">YEARS</span>
                  </div>
                </div>
              </div>
              <p className="text-sm mt-1 text-primary-foreground">@{username}</p>
              <h1
                className="text-xl font-semibold"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                {profile.fullName}
              </h1>
              {profile.title && !isAgency && (
                <p className="text-sm mt-1">{profile.title}</p>
              )}
              {profile.tagline && (
                <p className="text-sm mt-1">{profile.tagline}</p>
              )}
              <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1 mt-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 2.122 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                    clipRule="evenodd"
                  />
                </svg>
                Verified by Xmytravel
              </span>
              <div className="mt-4 text-sm text-left space-y-2">
                {profile.location && (
                  <p className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-4 h-4 text-secondary border border-secondary rounded-[50%]"
                    >
                      <path
                        fillRule="evenodd"
                        d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {profile.location}
                  </p>
                )}
                {profile.languages && profile.languages.length > 0 && (
                  <p className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 text-secondary border border-secondary rounded-[50%]"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 1.357L14.25 7.5l.165.33a.809.809 0 0 1-1.086 1.085l-.604-.302a1.125 1.125 0 0 0-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 0 1-2.288 4.04l-.723.724a1.125 1.125 0 0 1-1.298.21l-.153-.076a1.125 1.125 0 0 1-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 0 1-.21-1.298L9.75 12l-1.64-1.64a6 6 0 0 1-1.676-3.257l-.172-1.03Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Languages: {profile.languages.join(", ")}
                  </p>
                )}
                {profile.responseTime && (
                  <p className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-4 h-4 text-secondary border border-secondary rounded-[50%]"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {profile.responseTime}
                  </p>
                )}
                {profile.pricing && (
                  <p className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-4 h-4 text-secondary border border-secondary rounded-[50%]"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM9 7.5A.75.75 0 0 0 9 9h1.5c.98 0 1.813.626 2.122 1.5H9A.75.75 0 0 0 9 12h3.622a2.251 2.251 0 0 1-2.122 1.5H9a.75.75 0 0 0-.53 1.28l3 3a.75.75 0 1 0 1.06-1.06L10.8 14.988A3.752 3.752 0 0 0 14.175 12H15a.75.75 0 0 0 0-1.5h-.825A3.733 3.733 0 0 0 13.5 9H15a.75.75 0 0 0 0-1.5H9Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {profile.pricing}
                  </p>
                )}
              </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 flex justify-between items-center bg-opacity-10 backdrop-blur-md border-t z-50 lg:hidden p-2">
              {isAgency ? (
                <>
                  <Link href="/ask-an-expert" className="flex-1 bg-gray-300 bg-opacity-20 backdrop-blur-md text-gray-800 py-3 px-4 rounded-lg shadow-md border border-white hover:bg-opacity-30 transition-all flex items-center justify-center gap-2 mx-1" title="Find Other Experts">
                    <Users className="w-5 h-5" />
                    <span className="text-sm">Find Other Experts</span>
                  </Link>
                  <button onClick={() => setIsModalOpen(true)} className="flex-1 bg-primary bg-opacity-20 backdrop-blur-md text-primary-foreground py-3 px-4 rounded-lg shadow-md border border-white hover:bg-opacity-30 transition-all flex items-center justify-center gap-2 mx-1" title="Request a Quote">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">Request Quote</span>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleShare} className="flex-1 bg-gray-300 bg-opacity-20 backdrop-blur-md text-gray-800 py-3 px-4 rounded-lg shadow-md border border-white hover:bg-opacity-30 transition-all flex items-center justify-center gap-2 mx-1" title="Share Profile">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">Share</span>
                  </button>
                  <button onClick={() => setIsModalOpen(true)} className="flex-1 bg-primary bg-opacity-20 backdrop-blur-md text-primary-foreground py-3 px-4 rounded-lg shadow-md border border-white hover:bg-opacity-30 transition-all flex items-center justify-center gap-2 mx-1" title="Ask a Question">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">Ask Question</span>
                  </button>
                </>
              )}
            </div>

            {isAgency ? (
              <>
                 <Link href="/ask-an-expert" className="fixed bottom-4 left-4 bg-secondary text-secondary-foreground p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-all flex items-center gap-2 z-50 hidden lg:flex" title="Find Other Experts">
                   <Users />
                   <span className="text-sm hidden sm:inline">Find Other Experts</span>
                 </Link>
                 <button onClick={() => setIsModalOpen(true)} className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-all flex items-center gap-2 z-50 hidden lg:flex" title="Request a Quote">
                   <MessageCircle />
                   <span className="text-sm hidden sm:inline">Request Quote</span>
                 </button>
              </>
            ) : (
              <>
                <button onClick={handleShare} className="fixed bottom-4 left-4 bg-secondary text-secondary-foreground p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-all flex items-center gap-2 z-50 hidden lg:flex" title="Share Profile">
                  <Share2 />
                  <span className="text-sm hidden sm:inline">Share</span>
                </button>
                <button onClick={() => setIsModalOpen(true)} className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-all flex items-center gap-2 z-50 hidden lg:flex" title="Ask a Question">
                  <MessageCircle />
                  <span className="text-sm hidden sm:inline">Ask Question</span>
                </button>
              </>
            )}

            {isShareMessageVisible && (
              <div className="fixed bottom-16 left-4 bg-secondary text-secondary-foreground text-sm px-4 py-2 rounded-lg shadow-lg z-50">
                Profile URL copied to clipboard!
              </div>
            )}
          </aside>
          <section className="lg:col-span-2 space-y-4">
            {profile.about && (
              <details
                open
                className="group bg-white rounded-2xl shadow border border-[#F4D35E30] overflow-hidden"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors duration-200 hover:bg-gray-50">
                  <h2
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                    className="text-lg font-semibold text-[#36013F]"
                  >
                    {isAgency ? 'About Us' : 'About Me'}
                  </h2>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-5 h-5 text-[#36013F] transition-transform duration-300 group-open:rotate-180"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed">
                  {profile.about}
                </div>
              </details>
            )}
            {(profile.services?.length > 0 || profile.expertise?.length > 0 || profile.regions?.length > 0) && (
              <details
                className="group bg-white rounded-2xl shadow border border-[#F4D35E30] overflow-hidden"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors duration-200 hover:bg-gray-50">
                  <h2
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                    className="text-lg font-semibold text-[#36013F]"
                  >
                    {isAgency ? 'Services & Specialisations' : 'What I Can Help You With'}
                  </h2>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-5 h-5 text-[#36013F] transition-transform duration-300 group-open:rotate-180"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed">
                  {profile.services?.length > 0 && (
                    <>
                      <h3 className="font-semibold text-gray-800">Services</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {profile.services.map((s, i) => (
                          <li key={`service-${i}`}>{s}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {profile.expertise?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-800">{isAgency ? 'Specialisations' : 'Expertise'}</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {profile.expertise.map((exp, i) => (
                          <li key={`expertise-${i}`}>{exp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {profile.regions?.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-800">{isAgency ? 'Destination Specialisations' : 'Regions'}</h3>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Regions: {profile.regions.join(", ")}</li>
                      </ul>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            {isAgency ? (
                profile.licenseNumber && (
                    <details className="group bg-white rounded-2xl shadow border border-[#F4D35E30] overflow-hidden">
                        <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors duration-200 hover:bg-gray-50">
                            <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-lg font-semibold text-[#36013F]">
                                Trust & Credentials
                            </h2>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-[#36013F] transition-transform duration-300 group-open:rotate-180">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </summary>
                        <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed">
                            <p><strong>Licence / IATA / GST No.:</strong> {profile.licenseNumber}</p>
                        </div>
                    </details>
                )
            ) : (
                sortedExperience?.length > 0 && (
                  <details
                    className="group bg-white rounded-2xl shadow border border-[#F4D35E30] overflow-hidden"
                  >
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors duration-200 hover:bg-gray-50">
                      <h2
                        style={{ fontFamily: "'DM Serif Display', serif" }}
                        className="text-lg font-semibold text-[#36013F]"
                      >
                        Experience
                      </h2>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-5 h-5 text-[#36013F] transition-transform duration-300 group-open:rotate-180"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="px-1 pb-5 text-sm text-gray-700 leading-relaxed">
                      <ul className="list-disc list-inside space-y-2">
                        {sortedExperience.map((exp, i) => (
                          <li key={i}>
                            {exp.title} at {exp.company}{" "}
                            <strong>
                              | {exp.startDateFormatted} - {exp.endDateFormatted}
                              <span className="text-gray-400">
                                {" "}
                                {exp.duration && `, ${exp.duration}`}
                              </span>
                            </strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                )
            )}

            <details
              className="group bg-[#FFF9E0] border-l-4 border-[#F4D35E] rounded-2xl shadow overflow-hidden"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors duration-200">
                <h2
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                  className="text-lg font-semibold text-[#36013F]"
                >
                  {isAgency ? 'Request an Itinerary / Quote' : 'Ask Me a Free Question'}
                </h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5 text-[#36013F] transition-transform duration-300 group-open:rotate-180"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed">
                {isAgency ? 'Have a trip in mind? Get a custom quote from us.' : 'One quick doubt before booking?'}
                <br />
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="underline text-[#36013F] hover:text-black transition-all cursor-pointer"
                >
                  {isAgency ? 'Get a Quote →' : 'Ask your first question here →'}
                </button>
              </div>
            </details>
            <details
              className="group bg-white rounded-2xl shadow border border-[#F4D35E30] overflow-hidden"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors duration-200 hover:bg-gray-50">
                <h2
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                  className="text-lg font-semibold text-[#36013F]"
                >
                  Already Answered Questions
                </h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5 text-[#36013F] transition-transform duration-300 group-open:rotate-180"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed">
                {loadingQuestions ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg
                      className="animate-spin h-5 w-5 text-gray-600"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Loading answered questions...
                  </div>
                ) : paginatedQuestions.length === 0 ? (
                  <p className="text-gray-600 text-center">No answered questions found.</p>
                ) : (
                  <div className="space-y-4">
                    {paginatedQuestions.map((q) => (
                      <details
                        key={q.id}
                        className="group rounded-xl overflow-hidden border border-primary"
                      >
                        <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold bg-white transition-colors">
                          <span>{q.question}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-5 h-5 text-[#36013F] transition-transform group-open:rotate-180"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </summary>
                        <div className="px-6 py-4 text-gray-800">
                          <p className="mb-4 text-gray-800">{q.reply || "No reply yet"}</p>
                        </div>
                      </details>
                    ))}
                    {totalPages > 1 && (
                      <div className="flex justify-center gap-4 mt-4">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-[#F4D35E] text-[#36013F] rounded-lg hover:bg-[#e0c54e] disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2 text-gray-700">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-[#F4D35E] text-[#36013F] rounded-lg hover:bg-[#e0c54e] disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </details>
            <BookingComponent expert={profile} weeklySchedule={weeklySchedule} />
          </section>
        </div>
        {isModalOpen && (
          <AskQuestionModal
            expert={profile}
            onClose={() => setIsModalOpen(false)}
          />
        )}
        {isLightboxOpen && (
          <Lightbox
            mainSrc={selectedImage}
            onCloseRequest={() => setIsLightboxOpen(false)}
            imageTitle={selectedImage.includes("default.jpg") ? "Default Profile Image" : "Profile Image"}
          />
        )}
      </div>
      <Footer />
    </>
  );
}
