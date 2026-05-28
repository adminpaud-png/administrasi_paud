import React, { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Download, Phone, Briefcase, GraduationCap, UploadCloud } from "lucide-react";
import { Card } from "../components/ui/card";
import { motion } from "framer-motion";
import { Dialog } from "../components/ui/dialog";
import { ExcelImportModal } from "../components/ExcelImportModal";
import { useSettingsStore } from "../lib/store";

export function Parents() {
  const settings = useSettingsStore();
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add'|'edit'>('add');
  const [formData, setFormData] = useState<any>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const sortedParents = useMemo(() => {
    return [...settings.parents]
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.student?.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(p => ({
        ...p,
        relation: p.relation === "Ayah Kantung" ? "Ayah Kandung" : p.relation,
        studentClass: p.studentClass || "Kelas A"
      }));
  }, [searchTerm, settings.parents]);

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
    const headers = ["Nama Wali", "Nama Murid", "Kelas Murid", "Relasi", "Pekerjaan", "No HP"];
    const csvContent = [
      headers.join(","),
      ...sortedParents.map(p => [`"${p.name}"`, `"${p.student}"`, `"${p.studentClass || '-'}"`, p.relation, `"${p.job}"`, p.phone].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "data_wali_murid.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({ name: "", student: "", studentClass: "", relationType: "", customRelation: "", relation: "", phone: "", job: "", photo: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setModalMode('edit');
    const relationOptions = ['Ayah Kandung', 'Ibu Kandung', 'Kakek/Nenek'];
    const isCustom = !relationOptions.includes(p.relation) && p.relation !== '';
    setFormData({ 
      ...p,
      relationType: isCustom ? 'Lainnya' : (p.relation || ''),
      customRelation: isCustom ? p.relation : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      settings.deleteParent(deleteId);
      setDeleteId(null);
      setSelectedIds(selectedIds.filter(id => id !== deleteId));
    }
  };

  const confirmBulkDelete = () => {
    settings.bulkDeleteParents(selectedIds);
    setSelectedIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === sortedParents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedParents.map(p => p.id));
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
    
    const dataToSubmit = { ...formData };
    if (dataToSubmit.relationType === 'Lainnya') {
      dataToSubmit.relation = dataToSubmit.customRelation;
    } else if (dataToSubmit.relationType) {
      dataToSubmit.relation = dataToSubmit.relationType;
    }
    delete dataToSubmit.relationType;
    delete dataToSubmit.customRelation;

    if (modalMode === 'add') {
      settings.addParent(dataToSubmit);
    } else {
      settings.updateParent(dataToSubmit.id, dataToSubmit);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Data Wali Murid</h1>
          <p className="text-slate-500">Informasi wali murid dan kontak relasi.</p>
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
            className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition-colors shadow-md shadow-purple-600/20 flex"
          >
            <Plus className="w-5 h-5" />
            Tambah Wali
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50">
            <input 
              type="checkbox" 
              checked={selectedIds.length === sortedParents.length && sortedParents.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-600"
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
              placeholder="Cari nama wali atau murid..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedParents.map((item, idx) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            key={item.id}
          >
            <Card className={`overflow-hidden hover:shadow-lg transition-all group relative border-slate-200 h-full flex flex-col ${selectedIds.includes(item.id) ? 'ring-2 ring-purple-500 bg-purple-500/5' : ''}`}>
              <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity aria-checked:opacity-100" aria-checked={selectedIds.includes(item.id)}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-600 shadow-sm"
                />
              </div>
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={() => handleOpenEdit(item)} className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full shadow-sm hover:bg-blue-50 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-full shadow-sm hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 flex flex-col items-center relative">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-purple-500/10 to-transparent -z-10" />
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 bg-white shrink-0">
                   {item.photo ? (
                    <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-700 font-bold text-2xl">
                      {item.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg text-slate-800 text-center leading-tight mb-1">{item.name}</h3>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-100 mb-4 inline-block">
                  {item.relation}
                </span>

                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="p-1.5 bg-white rounded-md shadow-sm text-blue-500">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="text-xs text-slate-400 block -mb-0.5">Wali dari</span>
                      <span className="font-medium text-slate-700 block">{item.student}</span>
                      <span className="text-xs text-slate-500">{item.studentClass || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="p-1.5 bg-white rounded-md shadow-sm text-amber-500">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{item.job}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-sm mt-auto">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {item.phone}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {sortedParents.length === 0 && (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
          Belum ada data wali murid.
        </div>
      )}

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Tambah Wali Murid' : 'Edit Wali Murid'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Wali</label>
            <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Murid</label>
              <input required type="text" value={formData.student || ''} onChange={e => setFormData({...formData, student: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kelas Murid</label>
              <select required value={formData.studentClass || ''} onChange={e => setFormData({...formData, studentClass: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="" disabled>Pilih salah satu</option>
                <option value="Kelas A">Kelas A</option>
                <option value="Kelas B">Kelas B</option>
                <option value="Kelas C">Kelas C</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Relasi</label>
              <select required value={formData.relationType || ''} onChange={e => setFormData({...formData, relationType: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="" disabled>Pilih salah satu</option>
                <option value="Ayah Kandung">Ayah Kandung</option>
                <option value="Ibu Kandung">Ibu Kandung</option>
                <option value="Kakek/Nenek">Kakek / Nenek</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              {formData.relationType === 'Lainnya' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sebagai Apa?</label>
                  <input type="text" value={formData.customRelation || ''} onChange={e => setFormData({...formData, customRelation: e.target.value})} placeholder="Contoh: Paman, Bibi, Wali" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pekerjaan</label>
              <input required type="text" value={formData.job || ''} onChange={e => setFormData({...formData, job: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">No. HP</label>
            <input required type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Foto Profil (Opsional)</label>
            <div className="flex items-center gap-4">
              {formData.photo && (
                <img src={formData.photo} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
              )}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">Batal</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">Simpan</button>
          </div>
        </form>
      </Dialog>

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
        title="Import Data Wali Murid"
        expectedColumns={["name", "student", "studentClass", "relation", "job", "phone"]}
        notes={[
          "Kolom harus dinamai persis seperti di atas (huruf kecil).",
          "relation: 'Ayah Kandung', 'Ibu Kandung', atau lainnya",
        ]}
        onImport={(data) => {
          settings.bulkAddParents(data.map(item => ({
            name: item.name || "Tanpa Nama",
            student: item.student || "-",
            studentClass: item.studentClass || "Kelas A",
            relation: item.relation || "Lainnya",
            job: item.job || "-",
            phone: item.phone || "-",
            photo: "",
          })));
        }}
      />
    </div>
  );
}
