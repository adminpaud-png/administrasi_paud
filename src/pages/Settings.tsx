import React, { useState } from "react";
import { useSettingsStore } from "../lib/store";
import { Save, Building, UserCircle, ShieldAlert } from "lucide-react";
import { Card } from "../components/ui/card";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

export function Settings() {
  const settings = useSettingsStore();
  const [formData, setFormData] = useState({
    schoolName: settings.schoolName,
    principalName: settings.principalName,
    principalNip: settings.principalNip,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    adminPassword: settings.adminPassword || "654321",
    city: settings.city,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    
    // Jika menggunakan data online (Supabase)
    if (import.meta.env.VITE_SUPABASE_URL) {
      try {
        const updates: { email?: string; password?: string } = {};
        
        if (formData.email !== settings.email) {
          updates.email = formData.email;
        }
        
        // Simpan password ke server online jika user merubahnya dari lokal
        if (formData.adminPassword && formData.adminPassword !== settings.adminPassword) {
          updates.password = formData.adminPassword;
        }
        
        if (Object.keys(updates).length > 0) {
          const { error } = await supabase.auth.updateUser(updates);
          if (error) {
            setErrorMsg("Gagal sinkronisasi data kredensial ke server online: " + error.message);
            setIsSaving(false);
            return;
          }
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg("Terjadi kesalahan jaringan: " + err.message);
        setIsSaving(false);
        return;
      }
    }
    
    // Simpan local
    settings.setSettings(formData);
    setIsSaving(false);
    setSuccessMsg("Pengaturan dan data berhasil disimpan!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Pengaturan Sistem</h1>
        <p className="text-slate-500 mt-1">Kelola data profil sekolah dan identitas kepala sekolah.</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl mb-4 text-sm font-medium">
          {successMsg}
        </div>
      )}
      
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl mb-4 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <UserCircle className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-800">Data Kepala Sekolah</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nama Lengkap & Gelar</label>
              <input
                type="text"
                name="principalName"
                value={formData.principalName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">NIK</label>
              <input
                type="text"
                name="principalNip"
                value={formData.principalNip}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Building className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-800">Profil Sekolah</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Nama Sekolah</label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Alamat Lengkap</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none resize-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Kota / Kabupaten</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Nomor Telepon</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-slate-800">Akun Login Admin</h2>
            </div>
            <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">Kredensial Login</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Login</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
                placeholder="adminpaud@gmail.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Password / Kata Sandi baru</label>
              <input
                type="text"
                name="adminPassword"
                value={formData.adminPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
                placeholder="Minimal 6 karakter"
                required
              />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Perubahan kredensial ini akan berlaku pada proses login berikutnya. Harap catat email dan password yang baru.
          </p>
        </Card>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-light font-medium transition-colors shadow-md shadow-primary/20 disabled:opacity-70"
          >
            <Save className="w-5 h-5" />
            {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>
    </div>
  );
}
