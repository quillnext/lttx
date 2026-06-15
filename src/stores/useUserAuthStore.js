"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";

const initialState = {
  otpSent: false,
  otpEmail: "",
};

export const useUserAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: true,
      error: "",
      ...initialState,

      // Initialize Auth
      initializeAuth: async () => {
        set({ loading: true });

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const mappedUser = {
            ...session.user,
            name: session.user.user_metadata?.name || "",
            phone: session.user.user_metadata?.phone || "",
          };

          set({
            user: mappedUser,
            isAuthenticated: true,
            loading: false,
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }

        supabase.auth.onAuthStateChange((event, session) => {
          const mappedUser = session?.user
            ? {
                ...session.user,
                name: session.user.user_metadata?.name || "",
                phone: session.user.user_metadata?.phone || "",
              }
            : null;

          set({
            user: mappedUser,
            isAuthenticated: !!session,
            loading: false,
          });
        });
      },

      // 1. SEND OTP
      sendOtp: async ({ email, name, phone }) => {
        set({ loading: true, error: "" });

        const cleanEmail = email.trim().toLowerCase();

        try {
          const { error } = await supabase.auth.signInWithOtp({
            email: cleanEmail,
            options: {
              shouldCreateUser: true,
              data: { name, phone },
            },
          });

          if (error) throw error;

          set({
            loading: false,
            otpSent: true,
            otpEmail: cleanEmail,
          });
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      // SEND WHATSAPP OTP ACTION
      sendWhatsAppOtpAction: async ({ email, name, phone }) => {
        set({ loading: true, error: "" });

        try {
          const res = await fetch("/api/user-auth/send-whatsapp-otp", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, name, phone }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || "Failed to send WhatsApp OTP");
          }

          set({
            loading: false,
            otpSent: true,
            otpEmail: email.trim().toLowerCase(),
          });

          return data.verificationType;
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      // 2. VERIFY OTP + LOGIN
      verifyOtpAndLogin: async ({ email, otp, name, phone, type = "email" }) => {
        set({ loading: true, error: "" });

        try {
          const cleanEmail = email.trim().toLowerCase();

          const { data, error } = await supabase.auth.verifyOtp({
            email: cleanEmail,
            token: otp,
            type,
          });

          if (error) throw error;

          const user = data.user;

          // SAVE extra user data
          await supabase.from("profiles").upsert({
            id: user.id,
            email: cleanEmail,
            name,
            phone,
          });

          // Wait for session to be established via onAuthStateChange or just update immediately
          set({
            user: { ...user, name, phone },
            isAuthenticated: true,
            loading: false,
            error: "",
            ...initialState,
          });

          return user;
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      // UPDATE USER
      updateUser: async (updates) => {
        const current = get().user;
        if (!current) return;

        try {
          if (current.id) {
            const profileUpdates = { id: current.id, email: current.email };
            if (updates.name !== undefined) profileUpdates.name = updates.name;
            if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
            
            await supabase.from("profiles").upsert(profileUpdates);
          }
        } catch (error) {
          console.error("Failed to update profile in database:", error);
        }

        set({
          user: { ...current, ...updates },
        });
      },

      // LOGOUT
      logout: async () => {
        await supabase.auth.signOut();

        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: "",
          ...initialState,
        });
      },

      clearError: () => set({ error: "" }),
    }),
    {
      name: "xmytravel-auth",
      partialize: () => ({}),
    }
  )
);
