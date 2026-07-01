"use client";

import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfileLoadingShell = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 italic text-gray-500">
    Loading profile experience...
  </div>
);

const AskQuestionModal = dynamic(() => import("@/app/components/AskQuestionModal"), { ssr: false });
const Profile2u0 = dynamic(() => import("@/app/components/Profile2u0"), {
  ssr: false,
  loading: ProfileLoadingShell,
});

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
        const { count, error } = await supabase
          .from("service_requests")
          .select("*", { count: "exact", head: true })
          .eq("expert_id", expertId)
          .gte("created_at", startOfMonth.toISOString());
        
        if (error) throw error;
        setScarcityCount((count || 0) + 5);
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
        const { data, error } = await supabase
          .from("questions")
          .select("*")
          .eq("expert_id", expertId)
          .eq("status", "answered")
          .limit(6);
        
        if (error) throw error;
        
        const questionList = (data || []).map((item) => {
          const rawDate = new Date(item.created_at);
          return {
            id: item.id,
            question: item.question,
            reply: item.reply,
            userName: item.user_name,
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
    const loadSecondaryData = () => {
      fetchScarcity();
      fetchAnsweredQuestions();
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(loadSecondaryData, { timeout: 1500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timer = window.setTimeout(loadSecondaryData, 500);
    return () => window.clearTimeout(timer);
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
      {isModalOpen && (
        <AskQuestionModal
          expert={profile}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
