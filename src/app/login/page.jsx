"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Loader, Mail, Phone, UserRound, MessageSquare, Shield, Sparkles, Lock } from "lucide-react";
import { useUserAuthStore } from "@/stores/useUserAuthStore";

function CentralizedLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const roleParam = searchParams.get("role");
  const [role, setRole] = useState(roleParam === "expert" || roleParam === "agency" ? roleParam : "user"); // "user" | "expert" | "agency"
  const [verificationType, setVerificationType] = useState("email");

  const returnToParam = searchParams.get("returnTo");

  // Dynamic dashboard redirect based on role
  const getDashboardRedirect = (userRole) => {
    if (userRole === "admin") return "/dashboard/profiles";
    if (userRole === "expert") return "/expert-dashboard";
    if (userRole === "agency") return "/agency-dashboard";
    return "/user-dashboard";
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = returnToParam || getDashboardRedirect(user.role);
      router.replace(redirectPath);
    }
  }, [isAuthenticated, user, returnToParam, router]);

  // Adjust loginMethod and deliveryMethod when role changes
  useEffect(() => {
    if (role === "user") {
      setLoginMethod("otp");
      setDeliveryMethod("whatsapp");
    } else {
      setLoginMethod("password");
      setDeliveryMethod("whatsapp"); // lock to whatsapp if they choose OTP
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
      const verifiedUser = await verifyOtpAndLogin({
        ...form,
        type: verificationType,
        role,
      });
      const redirectPath = returnToParam || getDashboardRedirect(verifiedUser.role || role);
      router.replace(redirectPath);
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
      const loggedUser = await loginWithPassword({
        email: passwordForm.email,
        password: passwordForm.password,
        role,
      });
      const redirectPath = returnToParam || getDashboardRedirect(loggedUser.role || role);
      router.replace(redirectPath);
    } catch {
      setMessage("");
    }
  };

  return (
    <main className="min-h-screen bg-secondary flex items-center justify-center p-4 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
          <div className="bg-white p-6 rounded-3xl flex flex-col items-center gap-3 shadow-2xl">
            <Loader className="animate-spin text-[#36013F] w-10 h-10" />
            <p className="text-sm font-bold text-gray-700">Verifying details...</p>
          </div>
        </div>
      )}

      <section className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/10 overflow-hidden transition-all duration-300">
        <div className="bg-[#36013F] p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12 pointer-events-none" />
          <Image
            src="/dashboardlogo.svg"
            alt="Xmytravel"
            width={180}
            height={50}
            priority
            className="mx-auto relative z-10"
          />
        
        </div>

        <div className="p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
            <p className="text-sm text-gray-500 mt-1">
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

          {/* Method selector for Expert / Agency (Only WhatsApp OTP or Password) */}
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
              {/* Delivery Method selector (Only shown for Traveller tab) */}
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
                  <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Name</span>
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 focus-within:border-[#36013F] focus-within:bg-white transition-all">
                    <UserRound size={18} className="text-gray-400" />
                    <input
                      value={form.name}
                      onChange={(event) => updateForm("name", event.target.value)}
                      className="w-full bg-transparent py-3 outline-none text-sm text-gray-900 placeholder-gray-400 font-medium"
                      placeholder="Your full name"
                      disabled={otpSent}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Email</span>
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 focus-within:border-[#36013F] focus-within:bg-white transition-all">
                    <Mail size={18} className="text-gray-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => updateForm("email", event.target.value)}
                      className="w-full bg-transparent py-3 outline-none text-sm text-gray-900 placeholder-gray-400 font-medium"
                      placeholder="you@example.com"
                      disabled={otpSent}
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Mobile Number</span>
                  <div className="mt-1">
                    <PhoneInput
                      country="in"
                      value={form.phone}
                      onChange={(value) => updateForm("phone", `+${value}`)}
                      inputClass="!w-full !py-3 !pl-12 !border-gray-200 !rounded-xl !bg-gray-50/50 !text-sm !text-gray-900 !font-medium"
                      buttonClass="!border-gray-200 !rounded-l-xl !bg-gray-50/50"
                      dropdownClass="!rounded-xl !shadow-lg"
                      disabled={otpSent}
                    />
                  </div>
                </label>

                {otpSent && (
                  <label className="block">
                    <span className="text-xs font-bold uppercase text-purple-600 tracking-wider">
                      {deliveryMethod === "whatsapp" ? "WhatsApp OTP Code" : "Email OTP Code"}
                    </span>
                    <input
                      value={form.otp}
                      onChange={(event) => updateForm("otp", event.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-purple-200 bg-purple-50/30 px-4 py-3 outline-none text-sm text-gray-900 font-bold text-center tracking-[0.5em] focus:border-[#36013F] focus:ring-1 focus:ring-[#36013F] transition-all"
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
                  className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
                    deliveryMethod === "whatsapp"
                      ? "bg-green-600 hover:bg-green-700 shadow-green-600/10"
                      : "bg-[#36013F] hover:bg-[#4a0152] shadow-[#36013F]/10"
                  }`}
                >
                  {loading ? (
                    <Loader className="animate-spin" size={18} />
                  ) : otpSent ? (
                    <Shield size={18} />
                  ) : deliveryMethod === "whatsapp" ? (
                    <MessageSquare size={18} />
                  ) : (
                    <Mail size={18} />
                  )}
                  {otpSent
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
                    className="w-full text-xs font-bold text-[#36013F] hover:underline disabled:opacity-60 text-center"
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
                <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Email Address</span>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 focus-within:border-[#36013F] focus-within:bg-white transition-all">
                  <Mail size={18} className="text-gray-400" />
                  <input
                    type="email"
                    value={passwordForm.email}
                    onChange={(event) => updatePasswordForm("email", event.target.value)}
                    className="w-full bg-transparent py-3 outline-none text-sm text-gray-900 placeholder-gray-400 font-medium"
                    placeholder="you@example.com"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Password</span>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 focus-within:border-[#36013F] focus-within:bg-white transition-all">
                  <Lock size={18} className="text-gray-400" />
                  <input
                    type="password"
                    value={passwordForm.password}
                    onChange={(event) => updatePasswordForm("password", event.target.value)}
                    className="w-full bg-transparent py-3 outline-none text-sm text-gray-900 placeholder-gray-400 font-medium"
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
                className="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-md bg-[#36013F] hover:bg-[#4a0152] shadow-[#36013F]/10"
              >
                {loading ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <Shield size={18} />
                )}
                <span>Login</span>
              </button>

              <div className="text-right">
                <Link
                  href="/expert-forgot-password"
                  className="text-xs font-semibold text-gray-500 hover:text-[#36013F] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default function CentralizedLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#36013F] flex items-center justify-center text-white italic">Loading...</div>}>
      <CentralizedLoginContent />
    </Suspense>
  );
}
