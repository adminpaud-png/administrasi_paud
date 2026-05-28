import React, { useState } from "react";
import { useSettingsStore } from "../lib/store";
import { Save, Building, UserCircle } from "lucide-react";
import { Card } from "../components/ui/card";
import { motion } from "framer-motion";

export function Settings() {
  const settings = useSettingsStore();
  const [formData, setFormData] = useState({
    schoolName: settings.schoolName,
    principalName: settings.principalName,
    principalNip: settings.principalNip,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    city: settings.city,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate save delay
    setTimeout(() => {
      settings.setSettings(formData);
      setIsSaving(false);
      alert("Pengaturan berhasil disimpan!");
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Pengaturan Sistem</h1>
        <p className="text-slate-500 mt-1">Kelola data profil sekolah dan identitas kepala sekolah.</p>
      </div>

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
              <label className="text-sm font-semibold text-slate-700">NIP</label>
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
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Nomor Telepon</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Sekolah</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
              />
            </div>
          </div>
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
