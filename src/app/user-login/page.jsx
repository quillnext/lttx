"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Loader, Mail, Phone, UserRound } from "lucide-react";
import { useUserAuthStore } from "@/stores/useUserAuthStore";

export default function UserLoginPage() {
  const router = useRouter();
  const {
    sendOtp,
    verifyOtpAndLogin,
    loading,
    error,
    otpSent,
    isAuthenticated,
    clearError,
  } = useUserAuthStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    otp: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/user-dashboard");
    }
  }, [isAuthenticated, router]);

  const updateForm = (key, value) => {
    clearError();
    setMessage("");
    setForm((prev) => ({ ...prev, [key]: value }));
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
      await sendOtp({ email: form.email, name: form.name });
      setMessage("OTP sent to your email.");
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
      setMessage("Enter the OTP sent to your email.");
      return;
    }

    try {
      await verifyOtpAndLogin(form);
      router.replace("/user-dashboard");
    } catch {
      setMessage("");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-[#36013F] p-6">
          <Image
            src="/dashboardlogo.svg"
            alt="Xmytravel"
            width={160}
            height={44}
            priority
            className="mx-auto"
          />
        </div>

        <form className="p-6 space-y-4" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
          <div>
            <h1 className="text-2xl font-bold text-[#36013F]">User Login</h1>
            <p className="text-sm text-gray-500 mt-1">
              Verify your email with OTP to access your travel dashboard.
            </p>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase text-gray-500">Name</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3">
              <UserRound size={18} className="text-gray-400" />
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                className="w-full bg-transparent py-3 outline-none text-sm"
                placeholder="Your full name"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase text-gray-500">Email</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                className="w-full bg-transparent py-3 outline-none text-sm"
                placeholder="you@example.com"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase text-gray-500">Mobile Number</span>
            <div className="mt-1">
              <PhoneInput
                country="in"
                value={form.phone}
                onChange={(value) => updateForm("phone", `+${value}`)}
                inputClass="!w-full !py-3 !pl-12 !border-gray-200 !rounded-xl !bg-gray-50 !text-sm"
                buttonClass="!border-gray-200 !rounded-l-xl !bg-gray-50"
                dropdownClass="!rounded-xl !shadow-lg"
                inputProps={{ id: "phone" }}
              />
            </div>
          </label>

          {otpSent && (
            <label className="block">
              <span className="text-xs font-bold uppercase text-gray-500">Email OTP</span>
              <input
                value={form.otp}
                onChange={(event) => updateForm("otp", event.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none text-sm focus:ring-2 focus:ring-[#36013F]"
                placeholder="Enter 6 digit OTP"
                maxLength={6}
              />
            </label>
          )}

          {(message || error) && (
            <p className={`text-sm font-medium ${error ? "text-red-600" : "text-green-700"}`}>
              {error || message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#36013F] py-3 text-white font-bold hover:bg-[#4a0152] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="animate-spin" size={18} /> : otpSent ? <Phone size={18} /> : <Mail size={18} />}
            {otpSent ? "Verify OTP & Login" : "Send Email OTP"}
          </button>

          {otpSent && (
            <button
              type="button"
              disabled={loading}
              onClick={handleSendOtp}
              className="w-full text-sm font-bold text-[#36013F] hover:underline disabled:opacity-60"
            >
              Resend OTP
            </button>
          )}
        </form>
      </section>
    </main>
  );
}
