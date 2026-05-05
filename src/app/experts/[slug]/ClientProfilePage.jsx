"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getFirestore, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { app } from "@/lib/firebase";
import Profile2u0Component from "@/app/components/Profile2u0";

// Safe component wrapper to prevent "Element type is invalid" if an import fails
const Profile2u0 = Profile2u0Component || (() => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 italic text-gray-500">
    Initializing profile experience...
  </div>
));

const AskQuestionModal = dynamic(() => import("@/app/components/AskQuestionModal"), { ssr: false });
const db = getFirestore(app);

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ClientProfilePage({ profile, sortedExperience, weeklySchedule }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [nextSlot, setNextSlot] = useState(null);
  const [scarcityCount, setScarcityCount] = useState(0);

  const expertId = profile?.expertId || profile?.id || profile?.userId;
  
  useEffect(() => {
    const fetchNextSlot = async () => {
      if (!expertId || !weeklySchedule) return;
      
      const now = new Date();
      let bestSlot = null;
      
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() + i);
        const dayName = weekdays[checkDate.getDay()];
        const daySlots = weeklySchedule[dayName] || [];
        
        if (daySlots.length > 0) {
          const sortedSlots = [...daySlots].sort();
          for (const slot of sortedSlots) {
            const [hours, minutes] = slot.split(":").map(Number);
            const slotDate = new Date(checkDate);
            slotDate.setHours(hours, minutes, 0, 0);
            
            if (slotDate > now) {
              bestSlot = slotDate;
              break;
            }
          }
        }
        if (bestSlot) break;
      }
      
      if (bestSlot) {
        const isToday = bestSlot.toDateString() === now.toDateString();
        const isTomorrow = new Date(now.getTime() + 86400000).toDateString() === bestSlot.toDateString();
        const dayPrefix = isToday ? "TODAY" : isTomorrow ? "TOMORROW" : bestSlot.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        const timeStr = bestSlot.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        setNextSlot(`${dayPrefix} ${timeStr}`);
      }
    };

    const fetchScarcity = async () => {
      if (!expertId) return;
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      try {
        const q = query(
          collection(db, "Bookings"),
          where("expertId", "==", expertId),
          where("createdAt", ">=", Timestamp.fromDate(startOfMonth))
        );
        const snap = await getDocs(q);
        setScarcityCount(snap.size + 5); 
      } catch (err) {
        console.error("Scarcity fetch error:", err);
        setScarcityCount(5);
      }
    };

    const fetchAnsweredQuestions = async () => {
      if (!expertId) {
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
            timestamp: rawDate.toLocaleDateString("en-GB")
          };
        });
        setAnsweredQuestions(questionList);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchNextSlot();
    fetchScarcity();
    fetchAnsweredQuestions();
  }, [expertId, weeklySchedule]);

  const handleBookService = async (service) => {
    if (service.title === 'ASK A QUESTION') {
       setIsModalOpen(true);
       return;
    }

    if (service.price === 'Quote Based') {
       toast.info("Please contact the expert directly for a custom quote.");
       return;
    }
    
    toast.info(`Initiating payment for ${service.title} (${service.price})...`);
    
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseInt(service.price.replace('₹', '')),
          currency: "INR",
          receipt: `rcpt_${Math.random().toString(36).substring(7)}`,
        }),
      });
      const order = await res.json();
      
      if (order.id) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: "XmyTravel",
          description: service.title,
          order_id: order.id,
          handler: function (response) {
            toast.success("Payment Successful!");
          },
          prefill: {
            name: profile.fullName,
            email: profile.email,
          },
          theme: { color: "#36013F" },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error("Failed to create payment order.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Payment initialization failed.");
    }
  };

  const displayJourney = (profile.professionalJourney && profile.professionalJourney.length > 0) 
    ? profile.professionalJourney 
    : sortedExperience?.map(exp => ({
        title: exp.title,
        company: exp.company,
        period: `${exp.startDateFormatted} - ${exp.endDateFormatted}`,
        desc: exp.desc
      }));

  return (
    <>
      <Profile2u0 
        profile={{
          ...profile, 
          professionalJourney: displayJourney,
          nextSlot: nextSlot || "Check Availability",
          scarcityCount: scarcityCount,
          aaqs: answeredQuestions
        }} 
        onBookService={handleBookService} 
      />
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      {isModalOpen && (
        <AskQuestionModal
          expert={profile}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
