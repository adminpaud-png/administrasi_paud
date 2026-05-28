import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { cn } from "../lib/utils";
import { useSettingsStore } from "../lib/store";
import bgImage from "../assets/images/paud_kids_background_1779772623548.png";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  Package,
  FileText,
  Settings,
  LogOut,
  Menu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const sidebarLinks = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Data Guru", href: "/teachers", icon: Users },
  { name: "Data Karyawan", href: "/employees", icon: Briefcase },
  { name: "Data Murid", href: "/students", icon: GraduationCap },
  { name: "Wali Murid", href: "/parents", icon: HeartHandshake },
  { name: "Inventaris", href: "/inventory", icon: Package },
  { name: "Laporan", href: "/reports", icon: FileText },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth();
  const settings = useSettingsStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      signOut();
    }, 2500);
  };

  // Split title if long, else just display it
  const titleParts = settings.schoolName.split(" ");
  const firstPart = titleParts.slice(0, 2).join(" ");
  const restPart = titleParts.slice(2).join(" ");

  return (
    <div className="flex h-screen overflow-hidden bg-background-soft">
      {/* Sign Out Animation Overlay */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center overflow-hidden"
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
              Sampai Jumpa!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative z-10 text-primary-light text-xl mt-2 text-center"
            >
              Keluar dari Dashboard...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={cn(
          "sidebar fixed inset-y-0 left-0 z-50 w-72 bg-primary dark:bg-primary-dark shadow-2xl flex flex-col transition-transform duration-300 md:translate-x-0 md:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-center h-20 bg-primary-dark/40 px-6 gap-3 shrink-0">
          <div className="w-12 h-12 flex items-center justify-center shrink-0 drop-shadow-md">
            <img src="/logo-paud-dunia-paud-1.png" alt="Logo PAUD" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight tracking-tight">
              {firstPart}
              {restPart && <><br/>{restPart}</>}
            </h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  isActive
                    ? "bg-secondary text-primary shadow-md"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-secondary-light")} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-white/80 hover:bg-red-500/20 hover:text-white rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5 text-red-300" />
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-surface shadow-sm border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 md:hidden text-slate-600"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden md:flex items-center">
            <h2 className="text-xl font-semibold text-slate-800 tracking-tight">
              {sidebarLinks.find((l) => l.href === location.pathname)?.name || "Sistem Administrasi"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{user?.email?.split('@')[0] || "Administrator"}</p>
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-white font-bold shadow-inner">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 overflow-y-auto bg-background-soft p-4 md:p-8 relative">
          {/* Animated Kids Background Image for entire dashboard area */}
          <motion.div 
            className="absolute inset-0 z-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: '400px',
            }}
            animate={{
              backgroundPosition: ['0px 0px', '400px 400px'],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          
          <div className="mx-auto max-w-7xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
