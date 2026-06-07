// app/expert-dashboard/change-password/page.js
"use client";

import { useState } from "react";
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { app } from "@/lib/firebase";

const auth = getAuth(app);

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Failed to update password. Please check your current password.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#F4D35E] 
    ">
      <div className="text-gray-800 w-[80%]  md:w-[60%]">
      <h1 className="text-2xl font-semibold mb-6 text-center">Change Password</h1>
      <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg mx-auto">
        <div>
          <input
            type="password"
            placeholder="Current Password"
            className="w-full px-4 py-3 border rounded-xl bg-white"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="New Password"
            className="w-full px-4 py-3 border rounded-xl bg-white"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full px-4 py-3 border rounded-xl bg-white"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}
        <button
          type="submit"
          className="w-full bg-[#36013F] text-white py-3 rounded-xl hover:bg-[#4a0152]"
        >
          Update Password
        </button>
      </form>
    </div>
    </div>
  );
}