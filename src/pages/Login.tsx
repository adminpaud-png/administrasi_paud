import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import { useSettingsStore } from "../lib/store";
import bgImage from "../assets/images/paud_kids_background_1779772623548.png";

export function Login() {
  const settings = useSettingsStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { signInMock } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Automatically bypass if no supabase url is set in env
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setTimeout(async () => {
        const { error } = await signInMock(email, password);
        if (error) {
          setError(error.message);
          setLoading(false);
        } else {
          setIsSuccess(true);
          setTimeout(() => navigate("/"), 2500);
        }
      }, 500); // Simulate short network delay
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setIsSuccess(true);
      setTimeout(() => navigate("/"), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Kids Background Image */}
      <motion.div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: '400px',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '400px 400px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.2 }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden relative z-10 border border-white/50 backdrop-blur-sm"
      >
        <div className="bg-primary p-8 text-center relative overflow-hidden">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
            className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-primary-light rounded-full opacity-20" 
          />
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.6, type: "spring" }}
            className="absolute bottom-0 left-0 -mb-16 -ml-16 w-32 h-32 bg-primary-dark rounded-full opacity-20" 
          />
          <motion.div 
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
            className="mx-auto w-28 h-28 flex items-center justify-center relative z-10 mb-6 drop-shadow-2xl bg-white/10 rounded-full p-2"
          >
            <img src="/logo-paud-dunia-paud-1.png" alt="Logo PAUD" className="w-full h-full object-contain" />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-2xl font-bold text-white mb-2 relative z-10 tracking-tight"
          >
            PAUD Tunas Teratai
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-primary-light relative z-10 px-4"
          >
            Sistem Administrasi Cerdas & Profesional
          </motion.p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, mb: 0 }}
                  animate={{ opacity: 1, height: 'auto', mb: 16 }}
                  exit={{ opacity: 0, height: 0, mb: 0 }}
                  className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            
            {!import.meta.env.VITE_SUPABASE_URL && (
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.8 }}
                 className="p-4 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-sm mb-4"
               >
                 Gunakan email: <strong>adminpaud@gmail.com</strong> dan sandi: <strong>654321</strong> untuk login ke demo aplikasi.
               </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-slate-700">Email Administrator</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukan gmail.."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
                required
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="space-y-2"
            >
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Masuk ke Dashboard"}
            </motion.button>
          </form>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 text-center text-xs text-slate-500 font-medium"
          >
            &copy; 2026 {settings.schoolName}.
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-primary flex flex-col items-center justify-center overflow-hidden"
          >
            <motion.div 
              className="absolute inset-0 z-0 opacity-20"
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: '400px',
              }}
              animate={{
                backgroundPosition: ['0px 0px', '400px 400px'],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="relative z-10 w-44 h-44 mb-6 flex items-center justify-center"
            >
              <img src="/logo-paud-dunia-paud-1.png" alt="Logo PAUD" className="w-full h-full object-contain" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative z-10 text-3xl font-bold text-white text-center"
            >
              Selamat Datang!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative z-10 text-primary-light text-xl mt-2 text-center"
            >
              Menyiapkan Dashboard...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
