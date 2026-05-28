import React, { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, Download, Filter, MapPin, Box, UploadCloud, QrCode } from "lucide-react";
import { Card } from "../components/ui/card";
import { motion } from "framer-motion";
import { Dialog } from "../components/ui/dialog";
import { ExcelImportModal } from "../components/ExcelImportModal";
import { QRCodeModal } from "../components/QRCodeModal";
import { useSettingsStore } from "../lib/store";

export function Inventory() {
  const settings = useSettingsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add'|'edit'>('add');
  const [formData, setFormData] = useState<any>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<{isOpen: boolean, title: string, value: string, subtitle: string}>({isOpen: false, title: '', value: '', subtitle: ''});

  const sortedInventory = useMemo(() => {
    return [...settings.inventory]
      .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.code?.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(item => conditionFilter ? item.condition === conditionFilter : true)
      .sort((a, b) => {
        const catCompare = a.category.localeCompare(b.category);
        if (catCompare !== 0) return catCompare;
        return a.name.localeCompare(b.name);
      });
  }, [searchTerm, conditionFilter, settings.inventory]);

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
    const headers = ["Kode", "Nama Barang", "Kategori", "Lokasi", "Jumlah", "Kondisi"];
    const csvContent = [
      headers.join(","),
      ...sortedInventory.map(item => [item.code, `"${item.name}"`, item.category, `"${item.location}"`, item.qty, item.condition].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "data_inventaris.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueConditions = useMemo(() => Array.from(new Set(settings.inventory.map(item => item.condition))), [settings.inventory]);

  const generateNewItemCode = () => {
    if (!settings.inventory || settings.inventory.length === 0) return "INV-001";
    
    const maxNum = settings.inventory.reduce((max, item) => {
      if (item.code) {
        const match = item.code.match(/INV-(\d+)/);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          return num > max ? num : max;
        }
      }
      return max;
    }, 0);
    
    return `INV-${String(maxNum + 1).padStart(3, '0')}`;
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({ code: generateNewItemCode(), name: "", category: "Peralatan Kelas", location: "Gudang", qty: 1, condition: "Baik", photo: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setModalMode('edit');
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      settings.deleteInventory(deleteId);
      setDeleteId(null);
      setSelectedIds(selectedIds.filter(id => id !== deleteId));
    }
  };

  const confirmBulkDelete = () => {
    settings.bulkDeleteInventory(selectedIds);
    setSelectedIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === sortedInventory.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedInventory.map(i => i.id));
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
      settings.addInventory(formData);
    } else {
      settings.updateInventory(formData.id, formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Data Inventaris</h1>
          <p className="text-slate-500">Kelola barang dan aset sekolah.</p>
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
            className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-medium transition-colors shadow-md shadow-rose-500/20 flex"
          >
            <Plus className="w-5 h-5" />
            Tambah Barang
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 bg-white px-3 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50">
            <input 
              type="checkbox" 
              checked={selectedIds.length === sortedInventory.length && sortedInventory.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
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
              placeholder="Cari barang atau kode..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-sm transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <div className="relative w-full sm:w-auto">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Filter className="w-4 h-4 text-slate-400" />
                </div>
                <select 
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium w-full sm:w-auto appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 shadow-sm"
                >
                  <option value="">Semua Kondisi</option>
                  {uniqueConditions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedInventory.map((item, idx) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            key={item.id}
          >
            <Card className={`overflow-hidden hover:shadow-lg transition-all group relative border-slate-200 h-full flex flex-col ${selectedIds.includes(item.id) ? 'ring-2 ring-rose-500 bg-rose-500/5' : ''}`}>
              <div className="h-40 w-full bg-slate-100 relative">
                <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity aria-checked:opacity-100" aria-checked={selectedIds.includes(item.id)}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="w-5 h-5 rounded border-slate-300 text-rose-500 focus:ring-rose-500 shadow-sm"
                  />
                </div>
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={() => setQrModalData({isOpen: true, title: 'QR Data Inventaris', value: item.code || '-', subtitle: item.name})} className="p-2 bg-white/90 backdrop-blur-sm text-slate-600 rounded-full shadow-sm hover:bg-slate-50 transition-colors" title="Lihat QR Code">
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleOpenEdit(item)} className="p-2 bg-white/90 backdrop-blur-sm text-blue-600 rounded-full shadow-sm hover:bg-blue-50 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-full shadow-sm hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {item.photo ? (
                  <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Box className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute bottom-3 left-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm backdrop-blur-md ${
                     item.condition === 'Baik' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
                   }`}>
                    {item.condition}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-800 leading-tight">{item.name}</h3>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-2xs font-mono rounded border border-slate-200">
                    {item.code}
                  </span>
                  <span className="text-xs text-slate-500">{item.category}</span>
                </div>

                <div className="mt-auto space-y-2">
                  <div className="flex justify-between text-sm py-2 border-t border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-400" />
                      Lokasi
                    </span>
                    <span className="font-medium text-slate-800">{item.location}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-t border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Box className="w-4 h-4 text-blue-400" />
                      Stok
                    </span>
                    <span className="font-medium text-slate-800">{item.qty} unit</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {sortedInventory.length === 0 && (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
          Belum ada data inventaris.
        </div>
      )}

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'Tambah Barang' : 'Edit Barang'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kode Barang</label>
            <input required type="text" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Barang</label>
            <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <input required type="text" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kondisi</label>
              <select required value={formData.condition || ''} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                <option value="" disabled>Pilih salah satu</option>
                <option value="Baik">Baik</option>
                <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                <option value="Rusak">Rusak</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi</label>
              <input required type="text" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
              <input required type="number" min="1" value={formData.qty || 1} onChange={e => setFormData({...formData, qty: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Foto Barang (Opsional)</label>
            <div className="flex items-center gap-4">
              {formData.photo && (
                <img src={formData.photo} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
              )}
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">Batal</button>
            <button type="submit" className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">Simpan</button>
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
        title="Import Data Inventaris"
        expectedColumns={["code", "name", "category", "location", "qty", "condition"]}
        notes={[
          "Kolom harus dinamai persis seperti di atas (huruf kecil).",
          "condition: 'Baik', 'Perlu Perbaikan', atau 'Rusak'",
        ]}
        onImport={(data) => {
          settings.bulkAddInventory(data.map(item => ({
            code: item.code || "-",
            name: item.name || "Tanpa Nama",
            category: item.category || "-",
            location: item.location || "-",
            qty: parseInt(item.qty) || 1,
            condition: item.condition || "Baik",
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
