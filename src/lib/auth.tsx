import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

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
      if (mockSession === "true") {
        setUser({ id: 'mock-id', email: 'adminpaud@gmail.com' } as User);
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
    if (email === "adminpaud@gmail.com" && pass === "654321") {
      localStorage.setItem("mock_session", "true");
      setUser({ id: 'mock-id', email: 'adminpaud@gmail.com' } as User);
      return { error: null };
    }
    return { error: new Error("Email atau kata sandi yang Anda masukkan salah") };
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
