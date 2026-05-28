import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

import { useSettingsStore } from "./store";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInMock: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInMock: async () => ({ error: null }),
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // If Supabase URL is not set realistically, we mock auth state for demonstration
  const isMock = !import.meta.env.VITE_SUPABASE_URL;
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMock) {
      const mockSession = localStorage.getItem("mock_session");
      if (mockSession) {
        // Handle migration from "true" to using the email string
        const email = mockSession === "true" ? useSettingsStore.getState().email : mockSession;
        setUser({ id: 'mock-id', email } as User);
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [isMock]);

  const signInMock = async (email: string, pass: string) => {
    const validEmail = (useSettingsStore.getState().email || "adminpaud@gmail.com").trim().toLowerCase();
    const validPass = (useSettingsStore.getState().adminPassword || "654321").trim();
    
    if (email.trim().toLowerCase() === validEmail && pass.trim() === validPass) {
      localStorage.setItem("mock_session", email.trim().toLowerCase());
      setUser({ id: 'mock-id', email: email.trim().toLowerCase() } as User);
      return { error: null };
    }
    return { error: new Error(`Kesalahan login. Info Sistem - Email: "${validEmail}", Sandi: "${validPass}". Anda memasukkan - Email: "${email.trim().toLowerCase()}", Sandi: "${pass.trim()}"`) };
  };

  const signOut = async () => {
    if (!isMock) await supabase.auth.signOut();
    else localStorage.removeItem("mock_session");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInMock, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
