"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { X, Loader, Mail, UserRound, MessageSquare, Shield, Lock } from "lucide-react";
import { useUserAuthStore } from "@/stores/useUserAuthStore";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginModal({ isOpen, onClose }) {
  const {
    sendOtp,
    sendWhatsAppOtpAction,
    verifyOtpAndLogin,
    loginWithPassword,
    loading,
    error,
    otpSent,
    isAuthenticated,
    user,
    clearError,
  } = useUserAuthStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    otp: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("whatsapp"); // "whatsapp" | "email"
  const [loginMethod, setLoginMethod] = useState("otp"); // "otp" | "password"
  const [role, setRole] = useState("user"); // "user" | "expert" | "agency"
  const [verificationType, setVerificationType] = useState("email");

  useEffect(() => {
    if (isOpen) {
      clearError();
      setMessage("");
      // Reset forms
      setForm({ name: "", email: "", phone: "", otp: "" });
      setPasswordForm({ email: "", password: "" });
    }
  }, [isOpen, clearError]);

  useEffect(() => {
    if (isAuthenticated && user) {
      onClose();
    }
  }, [isAuthenticated, user, onClose]);

  // Adjust loginMethod and deliveryMethod when role changes
  useEffect(() => {
    if (role === "user") {
      setLoginMethod("otp");
      setDeliveryMethod("whatsapp");
    } else {
      setLoginMethod("password");
      setDeliveryMethod("whatsapp");
    }
  }, [role]);

  const updateForm = (key, value) => {
    clearError();
    setMessage("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updatePasswordForm = (key, value) => {
    clearError();
    setMessage("");
    setPasswordForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateBaseFields = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Valid email is required.";
    if (!form.phone.trim()) return "Mobile number is required.";
    return "";
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    const validationError = validateBaseFields();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      if (deliveryMethod === "whatsapp") {
        const type = await sendWhatsAppOtpAction({
          email: form.email,
          name: form.name,
          phone: form.phone,
          role,
        });
        setVerificationType(type);
        setMessage("OTP sent successfully to your WhatsApp number.");
      } else {
        await sendOtp({
          email: form.email,
          name: form.name,
          phone: form.phone,
          role,
        });
        setVerificationType("email");
        setMessage("OTP sent successfully to your email address.");
      }
    } catch {
      setMessage("");
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    const validationError = validateBaseFields();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    if (!form.otp.trim()) {
      setMessage(`Enter the OTP sent to your ${deliveryMethod === "whatsapp" ? "WhatsApp" : "email"}.`);
      return;
    }

    try {
      await verifyOtpAndLogin({
        ...form,
        type: verificationType,
        role,
      });
      onClose();
    } catch {
      setMessage("");
    }
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    if (!passwordForm.email.trim() || !/\S+@\S+\.\S+/.test(passwordForm.email)) {
      setMessage("Valid email is required.");
      return;
    }
    if (!passwordForm.password.trim()) {
      setMessage("Password is required.");
      return;
    }

    try {
      await loginWithPassword({
        email: passwordForm.email,
        password: passwordForm.password,
        role,
      });
      onClose();
    } catch {
      setMessage("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[3001]"
          >
            {/* Header / Brand */}
            <div className="bg-[#36013F] p-6 text-center relative overflow-hidden">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-8 -translate-y-8 pointer-events-none" />
              <Image
                src="/dashboardlogo.svg"
                alt="Xmytravel"
                width={140}
                height={38}
                priority
                className="mx-auto relative z-10"
              />
            </div>

            {/* Scrollable Form Area */}
            <div className="p-6 max-h-[75vh] overflow-y-auto no-scrollbar space-y-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
                <p className="text-xs text-gray-500 mt-1">
                  Select your role and verify identity to access your workspace.
                </p>
              </div>

              {/* Role selector with 3 tabs */}
              {!otpSent && (
                <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setRole("user");
                      clearError();
                      setMessage("");
                    }}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                      role === "user"
                        ? "bg-[#36013F] text-white shadow-md"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Traveller
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRole("expert");
                      clearError();
                      setMessage("");
                    }}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                      role === "expert"
                        ? "bg-[#36013F] text-white shadow-md"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Expert
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRole("agency");
                      clearError();
                      setMessage("");
                    }}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                      role === "agency"
                        ? "bg-[#36013F] text-white shadow-md"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Agency
                  </button>
                </div>
              )}

              {/* Method selector for Expert / Agency */}
              {role !== "user" && !otpSent && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 border border-gray-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod("otp");
                      clearError();
                      setMessage("");
                    }}
                    className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      loginMethod === "otp"
                        ? "bg-purple-50 text-[#36013F] border border-purple-200/50 shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    WhatsApp OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod("password");
                      clearError();
                      setMessage("");
                    }}
                    className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      loginMethod === "password"
                        ? "bg-purple-50 text-[#36013F] border border-purple-200/50 shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    Email & Password
                  </button>
                </div>
              )}

              {/* OTP Method Form */}
              {loginMethod === "otp" ? (
                <>
                  {!otpSent && role === "user" && (
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 border border-gray-100 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod("whatsapp")}
                        className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                          deliveryMethod === "whatsapp"
                            ? "bg-green-50 text-green-700 border border-green-200/50 shadow-sm"
                            : "text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp OTP
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod("email")}
                        className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                          deliveryMethod === "email"
                            ? "bg-purple-50 text-[#36013F] border border-purple-200/50 shadow-sm"
                            : "text-gray-500 hover:text-gray-800"
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" /> Email OTP
                      </button>
                    </div>
                  )}

                  <form className="space-y-4" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Name</span>
                      <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 focus-within:border-[#36013F] focus-within:bg-white transition-all">
                        <UserRound size={16} className="text-gray-400" />
                        <input
                          value={form.name}
                          onChange={(event) => updateForm("name", event.target.value)}
                          className="w-full bg-transparent py-2.5 outline-none text-sm text-gray-900 placeholder-gray-400 font-medium"
                          placeholder="Your full name"
                          disabled={otpSent}
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Email</span>
                      <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 focus-within:border-[#36013F] focus-within:bg-white transition-all">
                        <Mail size={16} className="text-gray-400" />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(event) => updateForm("email", event.target.value)}
                          className="w-full bg-transparent py-2.5 outline-none text-sm text-gray-900 placeholder-gray-400 font-medium"
                          placeholder="you@example.com"
                          disabled={otpSent}
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Mobile Number</span>
                      <div className="mt-1">
                        <PhoneInput
                          country="in"
                          value={form.phone}
                          onChange={(value) => updateForm("phone", `+${value}`)}
                          inputClass="!w-full !py-2.5 !pl-12 !border-gray-200 !rounded-xl !bg-gray-50/50 !text-sm !text-gray-900 !font-medium"
                          buttonClass="!border-gray-200 !rounded-l-xl !bg-gray-50/50"
                          dropdownClass="!rounded-xl !shadow-lg"
                          disabled={otpSent}
                        />
                      </div>
                    </label>

                    {otpSent && (
                      <label className="block">
                        <span className="text-[10px] font-bold uppercase text-purple-600 tracking-wider text-center block">
                          {deliveryMethod === "whatsapp" ? "WhatsApp OTP Code" : "Email OTP Code"}
                        </span>
                        <input
                          value={form.otp}
                          onChange={(event) => updateForm("otp", event.target.value)}
                          className="mt-1 w-full rounded-xl border-2 border-purple-200 bg-purple-50/30 px-4 py-2.5 outline-none text-sm text-gray-900 font-bold text-center tracking-[0.5em] focus:border-[#36013F] focus:ring-1 focus:ring-[#36013F] transition-all"
                          placeholder="------"
                          maxLength={6}
                        />
                      </label>
                    )}

                    {(message || error) && (
                      <div className={`p-3 rounded-xl text-xs font-semibold ${error ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
                        {error || message}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
                        deliveryMethod === "whatsapp"
                          ? "bg-green-600 hover:bg-green-700 shadow-green-600/10"
                          : "bg-[#36013F] hover:bg-[#4a0152] shadow-[#36013F]/10"
                      }`}
                    >
                      {loading ? (
                        <Loader className="animate-spin" size={16} />
                      ) : otpSent ? (
                        <Shield size={16} />
                      ) : deliveryMethod === "whatsapp" ? (
                        <MessageSquare size={16} />
                      ) : (
                        <Mail size={16} />
                      )}
                      {loading
                        ? "Processing..."
                        : otpSent
                        ? "Verify & Continue"
                        : deliveryMethod === "whatsapp"
                        ? "Send WhatsApp OTP"
                        : "Send Email OTP"}
                    </button>

                    {otpSent && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleSendOtp}
                        className="w-full text-xs font-bold text-[#36013F] hover:underline disabled:opacity-60 text-center block"
                      >
                        Resend Verification Code
                      </button>
                    )}
                  </form>
                </>
              ) : (
                /* Expert or Agency Password Login Form */
                <form className="space-y-4" onSubmit={handlePasswordLogin}>
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Email Address</span>
                    <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 focus-within:border-[#36013F] focus-within:bg-white transition-all">
                      <Mail size={16} className="text-gray-400" />
                      <input
                        type="email"
                        value={passwordForm.email}
                        onChange={(event) => updatePasswordForm("email", event.target.value)}
                        className="w-full bg-transparent py-2.5 outline-none text-sm text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="you@example.com"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Password</span>
                    <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 focus-within:border-[#36013F] focus-within:bg-white transition-all">
                      <Lock size={16} className="text-gray-400" />
                      <input
                        type="password"
                        value={passwordForm.password}
                        onChange={(event) => updatePasswordForm("password", event.target.value)}
                        className="w-full bg-transparent py-2.5 outline-none text-sm text-gray-900 placeholder-gray-400 font-medium"
                        placeholder="Enter your password"
                      />
                    </div>
                  </label>

                  {(message || error) && (
                    <div className={`p-3 rounded-xl text-xs font-semibold ${error ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
                      {error || message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-md bg-[#36013F] hover:bg-[#4a0152] shadow-[#36013F]/10"
                  >
                    {loading ? (
                      <Loader className="animate-spin" size={16} />
                    ) : (
                      <Shield size={16} />
                    )}
                    <span>Login</span>
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
