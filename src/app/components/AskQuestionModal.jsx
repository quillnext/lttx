

"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getFirestore, query, where, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const db = getFirestore(app);
const auth = getAuth(app);

export default function AskQuestionModal({ expert, onClose }) {
  const searchParams = useSearchParams();
  const urlQuestion = searchParams.get("question") || "";
  const urlKeywordsParam = searchParams.get("keywords") || "";
  const urlKeywords = urlKeywordsParam === "all" ? [] : urlKeywordsParam.split(",").filter(k => k.trim());

  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [user, setUser] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem("userFormData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setName(parsedData.name || "");
      setEmail(parsedData.email || "");
      setPhone(parsedData.phone || "");
      setHasSubmitted(true);
      setIsEmailVerified(true);
    }

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

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || "");
        setEmail(currentUser.email || "");
        setPhone(currentUser.phoneNumber || "");
        setHasSubmitted(true);
        setIsEmailVerified(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update question
  useEffect(() => {
    console.log("AskQuestionModal: initialQuestion updated:", initialQuestion);
    setQuestion(initialQuestion || "");
  }, [initialQuestion]);

  // Clear on close
  useEffect(() => {
    return () => {
      console.log("AskQuestionModal: Cleaning up on close");
      setQuestion("");
      setOtp("");
      setErrors({});
      setIsOtpSent(false);
      setIsEmailVerified(false);
    };
  }, []);

  // Reset OTP states on email change
  useEffect(() => {
    setIsOtpSent(false);
    setIsEmailVerified(false);
    setOtp("");
  }, [email]);

  const validateForm = () => {
    const newErrors = {};
    if (!question.trim()) newErrors.question = "Question is required.";
    if (!(hasSubmitted || user)) {
      if (!name.trim()) newErrors.name = "Name is required.";
      if (!email.trim()) newErrors.email = "Email is required.";
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format.";
      if (!isEmailVerified) newErrors.email = "Please verify your email with OTP.";
      if (!phone.trim()) newErrors.phone = "Phone number is required.";
      else if (!/^\+?[1-9]\d{1,14}$/.test(phone)) newErrors.phone = "Invalid phone number.";
    }
    if (referredByAgency === "Yes" && !selectedAgency) newErrors.agency = "Please select an agency.";
    if (!expert?.id) newErrors.form = "Expert profile ID is missing.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        toast.success("OTP sent to your email!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to send OTP.");
      }
    } catch (error) {
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
      toast.error("Error verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill out all required fields correctly.");
      return;
    }

    setLoading(true);
    try {
        const questionData = {
            expertId: expert.id,
            expertName: expert.fullName || "Unknown Expert",
            expertEmail: expert.email || "no-email@placeholder.com",
            question,
            userName: name,
            userEmail: email,
            userPhone: phone,
            status: "pending",
            isPublic: false,
            createdAt: new Date().toISOString(),
            reply: null,
        };
      
        if (referredByAgency === 'Yes' && selectedAgency) {
            questionData.referredByAgencyId = selectedAgency.value;
            questionData.referredByAgencyName = selectedAgency.label;
        }

      await addDoc(collection(db, "Questions"), questionData);

      if (!hasSubmitted && !user) {
        const userData = { name, email, phone, purpose: "General Query" };
        localStorage.setItem("userFormData", JSON.stringify(userData));
        setHasSubmitted(true);
      }

      if (expert.email && expert.email.trim() && /\S+@\S+\.\S+/.test(expert.email)) {
        const emailPayload = {
          userEmail: email,
          userName: name,
          expertEmail: expert.email,
          expertName: expert.fullName || "Unknown Expert",
          question,
          userPhone: phone,
        };

        console.log("AskQuestionModal: Email payload:", emailPayload);

        const validationError = validateEmailPayload(emailPayload);
        if (validationError) {
          throw new Error(validationError);
        }

        const response = await fetch("/api/send-question-emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to send emails: ${errorData.error || "Unknown error"}`);
        }
      } else {
        console.warn("AskQuestionModal: Skipping email sending due to missing or invalid expert.email:", expert.email);
        toast.warn("Question submitted, but expert email is missing or invalid. Notification not sent to expert.");
      }

      setQuestion("");
      if (!hasSubmitted && !user) {
        setName("");
        setEmail("");
        setPhone("");
        setOtp("");
        setIsOtpSent(false);
        setIsEmailVerified(false);
      }
      setErrors({});

      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      toast.error(`Failed to submit question: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/30 via-gray-900/30 to-black/30 flex items-center justify-center z-50">
      <div className="bg-transparent backdrop-blur-lg rounded-2xl shadow-xl p-6 w-full max-w-lg relative border border-white/10 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-xl font-bold"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold bg-clip-text text-white">
          {isAgency ? `Request a Quote from ${expert?.fullName}` : `Ask a Question to ${expert?.fullName || "Expert"}`}
        </h2>
        {success ? (
          <p className="text-green-400 text-center font-medium text-lg animate-pulse">
            Question submitted successfully! Closing...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                {isAgency ? 'Your Request' : 'Your Question'}
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className={`mt-0.5 p-2 w-full border rounded-xl bg-white/5 text-white placeholder-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
                  errors.question ? "border-red-500" : "border-white/20"
                }`}
                rows="5"
                placeholder={isAgency ? "Please describe your travel plans, including destination, number of travelers, duration, and estimated budget." : "Type your question here..."}
                required
              />
              {errors.question && (
                <p className="text-red-400 text-sm mt-2">{errors.question}</p>
              )}
              {/* Display keywords below the input */}
              {(urlKeywords.length > 0 || (urlQuestion && keywords.length > 0)) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {urlKeywords.length > 0 ? (
                    urlKeywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-[#F4D35E] text-[#36013F] px-2 py-1 rounded-full text-sm font-medium"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : keywords.length > 0 ? (
                    keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="bg-[#F4D35E] text-[#36013F] px-2 py-1 rounded-full text-sm font-medium"
                      >
                        {keyword}
                      </span>
                    ))
                  ) : null}
                </div>
              )}
            </div>
            {!(hasSubmitted || user) && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`p-2 w-full border rounded-xl bg-white/5 text-white placeholder-white/50 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 ${
                      errors.name ? "border-red-500" : "border-white/20"
                    }`}
                    placeholder="Enter your name"
                    required
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-2">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`p-2 flex-grow border rounded-xl bg-white/5 text-white placeholder-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 ${
                        errors.email ? "border-red-500" : "border-white/20"
                      }`}
                      placeholder="Enter your email"
                      required
                    />
                    {!isOtpSent && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-indigo-600"
                        disabled={loading}
                      >
                        Send OTP
                      </button>
                    )}
                  </div>
                  {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email}</p>}
                  {isOtpSent && !isEmailVerified && (
                    <div className="mt-2 flex items-center space-x-2">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="p-2 flex-grow border rounded-xl bg-white/5 text-white placeholder-white/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 border-white/20"
                        placeholder="Enter OTP"
                        maxLength={6}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="bg-green-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-green-600"
                        disabled={loading}
                      >
                        Verify
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Phone Number
                  </label>
                  <PhoneInput
                    country={"in"}
                    value={phone}
                    onChange={(phone) => setPhone(`+${phone}`)}
                    placeholder="Enter phone number"
                    inputProps={{
                      id: "phone",
                      className: `w-full p-2 border rounded-xl bg-white/5 text-white placeholder-white/50 focus:ring-2 focus:ring-primary focus:border-transparent pl-12 transition-all duration-300 ${
                        errors.phone ? "border-red-500" : "border-white/20"
                      }`,
                      required: true,
                    }}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-sm mt-2">{errors.phone}</p>
                  )}
                </div>
              </>
            )}
            <div className="pt-2">
              <label className="block text-sm font-semibold text-white/90 mb-2">Referred by an agency?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-white">
                  <input type="radio" name="referredByAgency" value="Yes" checked={referredByAgency === 'Yes'} onChange={(e) => setReferredByAgency(e.target.value)} />
                  Yes
                </label>
                <label className="flex items-center gap-2 text-white">
                  <input type="radio" name="referredByAgency" value="No" checked={referredByAgency === 'No'} onChange={(e) => setReferredByAgency(e.target.value)} />
                  No
                </label>
              </div>
            </div>
            {referredByAgency === 'Yes' && (
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">Select Agency</label>
                <Select
                  options={agencies}
                  value={selectedAgency}
                  onChange={setSelectedAgency}
                  placeholder="Select an agency..."
                  styles={{
                      control: (base) => ({
                        ...base,
                        background: "rgba(255, 255, 255, 0.05)",
                        borderColor: "rgba(255, 255, 255, 0.2)",
                      }),
                      singleValue: (base) => ({ ...base, color: "white" }),
                      input: (base) => ({...base, color: "white"}),
                      menu: (base) => ({...base, color: "black"}),
                  }}
                  classNamePrefix="react-select"
                />
                {errors.agency && <p className="text-red-400 text-sm mt-2">{errors.agency}</p>}
              </div>
            )}
            {errors.form && (
              <p className="text-red-400 text-sm mt-2">{errors.form}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-primary to-secondary text-white p-2 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Submitting..." : "Submit Question"}
            </button>
          </form>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
}