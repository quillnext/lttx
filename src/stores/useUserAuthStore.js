"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialOtpState = {
  otpSent: false,
  otpEmail: "",
};

export const useUserAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: "",
      ...initialOtpState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: Boolean(user),
          error: "",
          loading: false,
        }),

      sendOtp: async ({ email, name }) => {
        set({ loading: true, error: "" });
        const normalizedEmail = email.trim().toLowerCase();

        try {
          const response = await fetch("/api/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: normalizedEmail, userName: name }),
          });

          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || "Failed to send OTP");
          }

          set({
            loading: false,
            otpSent: true,
            otpEmail: normalizedEmail,
            error: "",
          });

          return result;
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      verifyOtpAndLogin: async ({ email, otp, name, phone }) => {
        set({ loading: true, error: "" });

        try {
          const response = await fetch("/api/user-auth/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email.trim().toLowerCase(),
              otp,
              name,
              phone,
            }),
          });

          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || "Failed to verify OTP");
          }

          set({
            user: result.user,
            isAuthenticated: true,
            loading: false,
            error: "",
            ...initialOtpState,
          });

          return result.user;
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({
          user: {
            ...currentUser,
            ...updates,
          },
        });
      },

      clearError: () => set({ error: "" }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: "",
          ...initialOtpState,
        }),
    }),
    {
      name: "xmytravel-user-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
