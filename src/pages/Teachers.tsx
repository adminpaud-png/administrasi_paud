import React, { useState, useMemo } from "react";
import { Plus, Search, MoreVertical, Edit2, Trash2, Download, Filter, Phone, UploadCloud, QrCode } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { motion } from "framer-motion";
import { Dialog } from "../components/ui/dialog";
import { ExcelImportModal } from "../components/ExcelImportModal";
import { QRCodeModal } from "../components/QRCodeModal";
import { useSettingsStore } from "../lib/store";

export function Teachers() {
  const settings = useSettingsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add'|'edit'>('add');
  const [formData, setFormData] = useState<any>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<{isOpen: boolean, title: string, value: string, subtitle: string}>({isOpen: false, title: '', value: '', subtitle: ''});

  const teachers = useMemo(() => {
    return settings.teachers.map(t => 
      t.position === "Kepala Sekolah" 
        ? { ...t, name: settings.principalName, nip: settings.principalNip || t.nip }
        : t
    );
  }, [settings.teachers, settings.principalName, settings.principalNip]);

  const positionHierarchy: Record<string, number> = {
    "Kepala Sekolah": 1,
    "Wakil Kepala Sekolah": 2,
    "Wali Kelas A": 3,
    "Wali Kelas B": 4,
    "Guru Ekstrakurikuler": 5,
  };

  const sortedTeachers = useMemo(() => {
    return [...teachers]
      .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.nip?.includes(searchTerm))
      .filter(t => positionFilter ? t.position === positionFilter : true)
      .sort((a, b) => {
        const weightA = positionHierarchy[a.position] || 99;
        const weightB = positionHierarchy[b.position] || 99;
        if (weightA !== weightB) return weightA - weightB;
        return a.name.localeCompare(b.name);
      });
  }, [searchTerm, positionFilter, teachers]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({ nip: "", name: "", gender: "Perempuan", position: "Wali Kelas A", phone: "", status: "Aktif", photo: "", address: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher: any) => {
    setModalMode('edit');
    setFormData({ ...teacher });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      settings.deleteTeacher(deleteId);
      setDeleteId(null);
      setSelectedIds(selectedIds.filter(id => id !== deleteId));
    }
  };

  const confirmBulkDelete = () => {
    settings.bulkDeleteTeachers(selectedIds);
    setSelectedIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === sortedTeachers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedTeachers.map(t => t.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
      settings.addTeacher(formData);
    } else {
      settings.updateTeacher(formData.id, formData);
    }
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ["NIK", "Nama", "Jenis Kelamin", "Jabatan", "No HP", "Status"];
    const csvContent = [
      headers.join(","),
      ...sortedTeachers.map(t => [t.nip, `"${t.name}"`, t.gender, t.position, t.phone, t.status].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "data_guru.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniquePositions = useMemo(() => Array.from(new Set(teachers.map(t => t.position))), [teachers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Data Guru</h1>
          <p className="text-slate-500">Kelola informasi tenaga pendidik {settings.schoolName}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button onClick={() => setIsImportOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors shadow-sm">
            <UploadCloud className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button 
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light font-medium transition-colors shadow-md shadow-primary/20 flex"
          >
            <Plus className="w-5 h-5" />
            Tambah Guru
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50">
            <input 
              type="checkbox" 
              checked={selectedIds.length === sortedTeachers.length && sortedTeachers.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span>Pilih Semua</span>
          </label>
          {selectedIds.length > 0 && (
            <button 
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-medium transition-colors border border-red-200 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus ({selectedIds.length})</span>
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau NIK..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center w-full sm:w-auto relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Filter className="w-4 h-4 text-slate-400" />
            </div>
            <select 
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium w-full sm:w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm"
            >
              <option value="">Semua Jabatan</option>
              {uniquePositions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedTeachers.map((teacher, idx) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            key={teacher.id}
          >
            <Card className={`overflow-hidden hover:shadow-lg transition-all group relative border-slate-200 h-full flex flex-col ${selectedIds.includes(teacher.id) ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
              <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity aria-checked:opacity-100" aria-checked={selectedIds.includes(teacher.id)}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(teacher.id)}
                  onChange={() => toggleSelect(teacher.id)}
                  className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary shadow-sm"
                />
              </div>
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => setQrModalData({isOpen: true, title: 'QR Data Guru', value: teacher.nip || '-', subtitle: teacher.name})} className="p-2 bg-white/90 backdrop-blur-sm text-slate-600 rounded-full shadow-sm hover:bg-slate-50 transition-colors" title="Lihat QR Code">
                  <QrCode className="w-4 h-4" />
                </button>
                <button onClick={() => handleOpenEdit(teacher)} className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full shadow-sm hover:bg-blue-50 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(teacher.id)} className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-full shadow-sm hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 flex flex-col items-center relative">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 bg-white shrink-0">
                  {teacher.photo ? (
                    <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-light/10 text-primary font-bold text-2xl">
                      {teacher.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg text-slate-800 text-center leading-tight mb-1">{teacher.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{teacher.nip}</p>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                  {teacher.position}
                </span>
              </div>
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-sm mt-auto">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {teacher.phone}
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    teacher.status === 'Aktif' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      teacher.status === 'Aktif' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}></span>
                    {teacher.status}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {sortedTeachers.length === 0 && (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
          Belum ada data guru.
        </div>
      )}

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Tambah Guru' : 'Edit Guru'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">NIK</label>
            <input required type="text" value={formData.nip || ''} onChange={e => setFormData({...formData, nip: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
              <select required value={formData.gender || ''} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="" disabled>Pilih salah satu</option>
                <option value="Perempuan">Perempuan</option>
                <option value="Laki-laki">Laki-laki</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select required value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="" disabled>Pilih salah satu</option>
                <option value="Aktif">Aktif</option>
                <option value="Cuti">Cuti</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jabatan / Posisi</label>
              <select required value={formData.position || ''} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="" disabled>Pilih salah satu</option>
                <option value="Guru">Guru</option>
                <option value="Kepala Sekolah">Kepala Sekolah</option>
                <option value="Wakil Kepala Sekolah">Wakil Kepala Sekolah</option>
                <option value="Wali Kelas A">Wali Kelas A</option>
                <option value="Wali Kelas B">Wali Kelas B</option>
                <option value="Guru Ekstrakurikuler">Guru Ekstrakurikuler</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">No. HP</label>
              <input required type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
            <textarea value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Masukkan alamat lengkap pendidik..." className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm min-h-[60px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Foto Profil (Opsional)</label>
            <div className="flex items-center gap-4">
              {formData.photo && (
                <img src={formData.photo} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
              )}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">Batal</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors">Simpan</button>
          </div>
        </form>
      </Dialog>

      
      <div className="flex items-center justify-between text-sm text-slate-500 pt-4">
        <div>Menampilkan 1 hingga 4 dari 4 entri</div>
        <div className="flex gap-1">
          <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 shadow-sm">Sebelumnnya</button>
          <button className="px-3 py-1 bg-primary text-white rounded-lg shadow-sm">1</button>
          <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 shadow-sm">Selanjutnya</button>
        </div>
      </div>

      <Dialog isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Konfirmasi Hapus">
        <div className="space-y-4">
          <p className="text-slate-600">Yakin ingin menghapus data ini? Aksi ini tidak dapat dibatalkan.</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={() => setDeleteId(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">Batal</button>
            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Hapus</button>
          </div>
        </div>
      </Dialog>

      <Dialog isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} title="Konfirmasi Hapus Beberapa Data">
        <div className="space-y-4">
          <p className="text-slate-600">Terpilih <span className="font-bold text-slate-900">{selectedIds.length}</span> data. Yakin ingin menghapus semua data yang dipilih? Aksi ini tidak dapat dibatalkan.</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={() => setIsBulkDeleteModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">Batal</button>
            <button onClick={confirmBulkDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Hapus Semua</button>
          </div>
        </div>
      </Dialog>

      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Import Data Guru"
        expectedColumns={["nip", "name", "gender", "position", "phone", "status", "address"]}
        notes={[
          "Kolom harus dinamai persis seperti di atas (huruf kecil).",
          "gender: 'Laki-laki' atau 'Perempuan'",
          "status: 'Aktif', 'Cuti', atau 'Non-Aktif'",
        ]}
        onImport={(data) => {
          settings.bulkAddTeachers(data.map(item => ({
            nip: item.nip || "-",
            name: item.name || "Tanpa Nama",
            gender: item.gender || "Perempuan",
            position: item.position || "Guru",
            phone: item.phone || "-",
            status: item.status || "Aktif",
            address: item.address || "-",
            photo: "",
          })));
        }}
      />

      <QRCodeModal 
        isOpen={qrModalData.isOpen} 
        onClose={() => setQrModalData(prev => ({...prev, isOpen: false}))} 
        title={qrModalData.title}
        value={qrModalData.value}
        subtitle={qrModalData.subtitle}
      />
    </div>
  );
}
