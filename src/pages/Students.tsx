import React, { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Download, Filter, GraduationCap, Users, UploadCloud, QrCode } from "lucide-react";
import { Card } from "../components/ui/card";
import { motion } from "framer-motion";
import { Dialog } from "../components/ui/dialog";
import { ExcelImportModal } from "../components/ExcelImportModal";
import { QRCodeModal } from "../components/QRCodeModal";
import { useSettingsStore } from "../lib/store";

export function Students() {
  const settings = useSettingsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add'|'edit'>('add');
  const [formData, setFormData] = useState<any>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<{isOpen: boolean, title: string, value: string, subtitle: string}>({isOpen: false, title: '', value: '', subtitle: ''});

  const sortedStudents = useMemo(() => {
    return [...settings.students]
      .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.nisn || s.nis || "").includes(searchTerm))
      .filter(s => classFilter ? s.class === classFilter : true)
      .sort((a, b) => {
        const classCompare = a.class.localeCompare(b.class);
        if (classCompare !== 0) return classCompare;
        return a.name.localeCompare(b.name);
      });
  }, [searchTerm, classFilter, settings.students]);

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

  const handleExportCSV = () => {
    const headers = ["NISN", "Nama", "Jenis Kelamin", "Kelas", "Nama Wali", "Tahun Ajaran", "Status"];
    const csvContent = [
      headers.join(","),
      ...sortedStudents.map(s => [s.nisn || s.nis, `"${s.name}"`, s.gender, s.class, `"${s.parent}"`, s.year, s.status].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "data_murid.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueClasses = useMemo(() => Array.from(new Set(settings.students.map(s => s.class))), [settings.students]);

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({ nisn: "", name: "", gender: "Perempuan", class: "Kelas A", parent: "", year: "2023/2024", status: "Aktif", photo: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: any) => {
    setModalMode('edit');
    setFormData({ ...student });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      settings.deleteStudent(deleteId);
      setDeleteId(null);
      setSelectedIds(selectedIds.filter(id => id !== deleteId));
    }
  };

  const confirmBulkDelete = () => {
    settings.bulkDeleteStudents(selectedIds);
    setSelectedIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === sortedStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedStudents.map(s => s.id));
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
      settings.addStudent(formData);
    } else {
      settings.updateStudent(formData.id, formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Data Murid</h1>
          <p className="text-slate-500">Kelola informasi peserta didik {settings.schoolName}.</p>
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
            className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-secondary-dark text-white rounded-xl hover:bg-yellow-600 font-medium transition-colors shadow-md shadow-secondary-dark/20 flex"
          >
            <Plus className="w-5 h-5" />
            Tambah Murid
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50">
            <input 
              type="checkbox" 
              checked={selectedIds.length === sortedStudents.length && sortedStudents.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-slate-300 text-secondary focus:ring-secondary"
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
              placeholder="Cari nama atau NISN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none text-sm transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <div className="relative w-full sm:w-auto">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Filter className="w-4 h-4 text-slate-400" />
                </div>
                <select 
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium w-full sm:w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary shadow-sm"
                >
                  <option value="">Semua Kelas</option>
                  {uniqueClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedStudents.map((item, idx) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            key={item.id}
          >
            <Card className={`overflow-hidden hover:shadow-lg transition-all group relative border-slate-200 h-full flex flex-col ${selectedIds.includes(item.id) ? 'ring-2 ring-secondary bg-secondary/5' : ''}`}>
              <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity aria-checked:opacity-100" aria-checked={selectedIds.includes(item.id)}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="w-5 h-5 rounded border-slate-300 text-secondary focus:ring-secondary shadow-sm"
                />
              </div>
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => setQrModalData({isOpen: true, title: 'QR Data Murid', value: item.nisn || item.nis || '-', subtitle: item.name})} className="p-2 bg-white/90 backdrop-blur-sm text-slate-600 rounded-full shadow-sm hover:bg-slate-50 transition-colors" title="Lihat QR Code">
                  <QrCode className="w-4 h-4" />
                </button>
                <button onClick={() => handleOpenEdit(item)} className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full shadow-sm hover:bg-blue-50 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-full shadow-sm hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 flex flex-col items-center relative">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-secondary/20 to-transparent -z-10" />
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 bg-white shrink-0">
                   {item.photo ? (
                    <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary-light/30 text-secondary-dark font-bold text-2xl">
                      {item.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg text-slate-800 text-center leading-tight mb-1">{item.name}</h3>
                <p className="text-sm font-mono text-slate-500 mb-4 tracking-wide">{item.nisn || item.nis}</p>
                
                <div className="w-full space-y-3 mt-2">
                  <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="p-1.5 bg-white rounded-md shadow-sm text-secondary-dark">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{item.class}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="p-1.5 bg-white rounded-md shadow-sm text-purple-600">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="font-medium truncate">{item.parent}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {sortedStudents.length === 0 && (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
          Belum ada data murid.
        </div>
      )}

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Tambah Murid' : 'Edit Murid'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">NISN</label>
            <input required type="text" value={formData.nisn || formData.nis || ''} onChange={e => setFormData({...formData, nisn: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-dark" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-dark" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
              <select required value={formData.gender || ''} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-dark">
                <option value="" disabled>Pilih salah satu</option>
                <option value="Perempuan">Perempuan</option>
                <option value="Laki-laki">Laki-laki</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select required value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-dark">
                <option value="" disabled>Pilih salah satu</option>
                <option value="Aktif">Aktif</option>
                <option value="Lulus">Lulus</option>
                <option value="Pindah">Pindah</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kelas</label>
              <select required value={formData.class || ''} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-dark">
                <option value="" disabled>Pilih salah satu</option>
                <option value="Kelas A">Kelas A</option>
                <option value="Kelas B">Kelas B</option>
                <option value="Kelas C">Kelas C</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Wali</label>
              <input required type="text" value={formData.parent || ''} onChange={e => setFormData({...formData, parent: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-dark" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Ajaran</label>
            <input required type="text" value={formData.year || ''} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-dark" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Foto Profil (Opsional)</label>
            <div className="flex items-center gap-4">
              {formData.photo && (
                <img src={formData.photo} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
              )}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-dark text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">Batal</button>
            <button type="submit" className="px-4 py-2 bg-secondary-dark text-white rounded-lg hover:bg-yellow-600 transition-colors">Simpan</button>
          </div>
        </form>
      </Dialog>
      
      <div className="flex items-center justify-between text-sm text-slate-500 pt-4">
        <div>Menampilkan 1 hingga 3 dari 3 entri</div>
        <div className="flex gap-1">
          <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 shadow-sm" disabled>Sebelumnnya</button>
          <button className="px-3 py-1 bg-primary text-white rounded-lg shadow-sm">1</button>
          <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 shadow-sm" disabled>Selanjutnya</button>
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
        title="Import Data Murid"
        expectedColumns={["nisn", "name", "gender", "class", "parent", "year", "status"]}
        notes={[
          "Kolom harus dinamai persis seperti di atas (huruf kecil).",
          "gender: 'Laki-laki' atau 'Perempuan'",
          "class: 'Kelas A', 'Kelas B', 'Kelas C'",
          "status: 'Aktif', 'Lulus', atau 'Pindah'",
        ]}
        onImport={(data) => {
          settings.bulkAddStudents(data.map(item => ({
            nisn: item.nisn || item.nis || "-",
            name: item.name || "Tanpa Nama",
            gender: item.gender || "Perempuan",
            class: item.class || "Kelas A",
            parent: item.parent || "-",
            year: item.year || "-",
            status: item.status || "Aktif",
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
