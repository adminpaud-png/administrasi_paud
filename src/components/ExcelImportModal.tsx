import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, X, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
  title: string;
  expectedColumns: string[];
  notes: string[];
}

export function ExcelImportModal({ isOpen, onClose, onImport, title, expectedColumns, notes }: ExcelImportModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          setError("File kosong atau tidak mengandung data.");
          return;
        }

        // We can do simple validation here, e.g. check if at least some columns match
        onImport(data);
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setError(null);
        }, 1500);

      } catch (err: any) {
        setError(`Gagal membaca file: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">{title}</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  Panduan Format Excel
                </h3>
                <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1 mb-4">
                  {notes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
                <div className="text-sm">
                  <span className="font-semibold text-slate-700">Kolom yang Diharapkan: </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {expectedColumns.map((col, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 px-2 py-1 rounded text-xs text-slate-600 font-mono">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {!success ? (
                <div 
                  className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-primary hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".xlsx, .xls, .csv" 
                    onChange={handleFileUpload} 
                  />
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <p className="text-slate-700 font-medium mb-1">Klik untuk memilih file excel/csv</p>
                  <p className="text-slate-500 text-sm">Ukuran file maksimal: 10MB</p>
                </div>
              ) : (
                <div className="py-8 text-center flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                  <p className="text-slate-700 font-medium text-lg">Berhasil Mengimpor Data!</p>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={onClose} 
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Batal
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
