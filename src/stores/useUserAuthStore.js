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
      loading: false,
      error: "",
      ...initialState,

      initializeAuth: async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .maybeSingle();

            const mappedUser = {
              ...session.user,
              name: profile?.full_name || session.user.user_metadata?.name || "",
              phone: profile?.phone || session.user.user_metadata?.phone || "",
              role: profile?.role || "user",
              status: profile?.status || "approved",
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

          supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .maybeSingle();

              const mappedUser = {
                ...session.user,
                name: profile?.full_name || session.user.user_metadata?.name || "",
                phone: profile?.phone || session.user.user_metadata?.phone || "",
                role: profile?.role || "user",
                status: profile?.status || "approved",
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
          });
        } catch (err) {
          console.error("Error during initializeAuth:", err);
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },

      // 1. SEND OTP
      sendOtp: async ({ email, name, phone, role = "user" }) => {
        set({ loading: true, error: "" });

        const cleanEmail = email.trim().toLowerCase();

        try {
          // Perform server validation check before sending OTP to verify duplicate emails/phone numbers
          const valRes = await fetch("/api/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail, userName: name, phone, role }),
          });
          const valData = await valRes.json();
          if (!valRes.ok) throw new Error(valData.error || "Failed to validate profile details.");

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
      sendWhatsAppOtpAction: async ({ email, name, phone, role = "user" }) => {
        set({ loading: true, error: "" });

        try {
          const res = await fetch("/api/user-auth/send-whatsapp-otp", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, name, phone, role }),
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
      verifyOtpAndLogin: async ({ email, otp, name, phone, type = "email", role = "user" }) => {
        set({ loading: true, error: "" });

        try {
          const cleanEmail = email.trim().toLowerCase();

          let verifyToken = otp;
          let verifyType = type;

          if (type === "whatsapp_custom") {
            const verifyRes = await fetch("/api/user-auth/verify-otp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, otp, name, phone, role }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Failed to verify OTP");
            verifyToken = verifyData.supabaseToken;
            verifyType = verifyData.verificationType;
          }

          const verifyPromise = supabase.auth.verifyOtp({
            email: cleanEmail,
            token: verifyToken,
            type: verifyType,
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Connection to verification server timed out. Please disable ad-blockers/shields and try again.")), 10000)
          );

          const { data, error } = await Promise.race([verifyPromise, timeoutPromise]);

          if (error) throw error;

          const user = data.user;

          // Establish session cookie for Next.js middleware
          const sessionRes = await fetch("/api/login", { method: "POST" });
          if (!sessionRes.ok) throw new Error("Failed to establish session cookie.");

          // Retrieve or create profile in profiles table
          let { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (!profile) {
            const { data: newProfile, error: profileErr } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                email: cleanEmail,
                full_name: name,
                phone,
                role: role,
                status: role === "user" ? "approved" : "pending",
              })
              .select()
              .single();
            if (profileErr) throw profileErr;
            profile = newProfile;
          } else if ((!profile.phone || profile.phone !== phone) && phone) {
            const { data: updatedProfile, error: profileErr } = await supabase
              .from("profiles")
              .update({ phone })
              .eq("id", user.id)
              .select()
              .single();
            if (!profileErr && updatedProfile) {
              profile = updatedProfile;
            }
          }

          set({
            user: {
              ...user,
              name: profile.full_name,
              phone: profile.phone,
              role: profile.role,
              status: profile.status,
            },
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

      // loginWithPassword
      loginWithPassword: async ({ email, password, role }) => {
        set({ loading: true, error: "" });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

          if (error) throw error;

          const user = data.user;

          // Establish session cookie for Next.js middleware
          const sessionRes = await fetch("/api/login", { method: "POST" });
          if (!sessionRes.ok) throw new Error("Failed to establish session cookie.");

          // Retrieve profile to verify role
          const { data: profile, error: profileErr } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (profileErr) throw profileErr;

          if (!profile) {
            await supabase.auth.signOut();
            throw new Error("User profile not found.");
          }

          if (profile.role !== role) {
            await supabase.auth.signOut();
            throw new Error(`This account is not registered as an ${role === "expert" ? "Expert" : "Agency"}.`);
          }

          set({
            user: {
              ...user,
              name: profile.full_name,
              phone: profile.phone,
              role: profile.role,
              status: profile.status,
            },
            isAuthenticated: true,
            loading: false,
            error: "",
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
            if (updates.name !== undefined) profileUpdates.full_name = updates.name;
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
