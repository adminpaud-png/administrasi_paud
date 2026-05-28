import { useState, useRef, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Printer, Download, Filter, Search } from "lucide-react";
import { Card } from "../components/ui/card";
import { motion } from "framer-motion";
import { useSettingsStore } from "../lib/store";

// --- Mock Data ---

const reportTypes = [
  { id: "guru", label: "Laporan Data Guru" },
  { id: "karyawan", label: "Laporan Data Karyawan" },
  { id: "murid", label: "Laporan Data Murid" },
  { id: "wali", label: "Laporan Data Wali Murid" },
  { id: "inventaris", label: "Laporan Data Inventaris" },
];

export function Reports() {
  const settings = useSettingsStore();
  const [activeReport, setActiveReport] = useState("guru");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterQuery, setFilterQuery] = useState(""); // Simplified generic filter
  const [isExporting, setIsExporting] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Laporan-${activeReport}`,
    pageStyle: `
      @page { size: A4; margin: 15mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
    onPrintError: (error) => console.error('Print error:', error)
  });

  const handleExportPDF = async () => {
    if (!componentRef.current) {
      alert("Sedang menyiapkan data, silakan coba lagi.");
      return;
    }
    
    setIsExporting(true);
    const btnText = document.getElementById('export-btn-text');
    if (btnText) btnText.innerText = "Memproses (Jangan ditutup)...";
    
    try {
      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const canvas = await html2canvas(componentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false, // Turn off logging to prevent console spam
        // Ignore images that could hang the process
        ignoreElements: (element) => {
          return element.tagName === 'IMG';
        }
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const canvasRatio = canvas.height / canvas.width;
      const printHeight = pdfWidth * canvasRatio;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, printHeight);
      pdf.save(`laporan-data-${activeReport}.pdf`);
    } catch (e) {
      console.error("Gagal mengekspor PDF", e);
      alert("Gagal Mengekspor: " + e);
    } finally {
      setIsExporting(false);
      if (btnText) btnText.innerText = "Export PDF";
    }
  };

  const currentDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  // Filtered Data
  const getFilteredData = () => {
    const q = searchTerm.toLowerCase();
    const filter = filterQuery.toLowerCase();
    
    // Inject dynamic principal
    const dynamicTeachers = settings.teachers.map(t => 
      t.position === "Kepala Sekolah" 
        ? { ...t, name: settings.principalName, nip: settings.principalNip }
        : t
    ).sort((a, b) => {
      if (a.position === "Kepala Sekolah" && b.position !== "Kepala Sekolah") return -1;
      if (a.position !== "Kepala Sekolah" && b.position === "Kepala Sekolah") return 1;
      return 0;
    });

    switch (activeReport) {
      case "guru": return dynamicTeachers.filter(t => t.name.toLowerCase().includes(q) || t.nip.includes(q));
      case "karyawan": return settings.employees.filter(e => e.name.toLowerCase().includes(q) || e.emp_id.includes(q));
      case "murid": return settings.students.filter(s => (s.name.toLowerCase().includes(q) || (s.nis && s.nis.includes(q))) && (filter ? s.class.toLowerCase().includes(filter) : true));
      case "wali": return settings.parents.filter(p => p.name.toLowerCase().includes(q) || (p.student && p.student.toLowerCase().includes(q)));
      case "inventaris": return settings.inventory.filter(i => (i.name.toLowerCase().includes(q) || (i.category && i.category.toLowerCase().includes(q))) && (filter ? i.category.toLowerCase().includes(filter) : true));
      default: return [];
    }
  };

  const data = getFilteredData();

  const renderTableHeaders = () => {
    switch (activeReport) {
      case "guru": return ["No", "NIP", "Nama Guru", "Jabatan", "Nomor HP", "Alamat"];
      case "karyawan": return ["No", "ID", "Nama Karyawan", "Jabatan", "Nomor HP"];
      case "murid": return ["No", "NIS", "Nama Murid", "Jenis Kelamin", "Kelas", "Tahun Ajaran"];
      case "wali": return ["No", "Nama Wali", "Nama Murid", "Nomor HP", "Pekerjaan"];
      case "inventaris": return ["No", "Kode Barang", "Nama Barang", "Kategori", "Jumlah", "Kondisi"];
      default: return [];
    }
  };

  const renderTableRows = () => {
    return data.map((item: any, index) => {
      const tdClass = "py-3 px-4 border border-[#2D3E99]/20";
      switch (activeReport) {
        case "guru": return (
          <tr key={item.id} className="hover:bg-slate-50 text-sm">
            <td className={`${tdClass} text-center`}>{index + 1}</td>
            <td className={tdClass}>{item.nip}</td>
            <td className={`${tdClass} font-semibold text-slate-800`}>{item.name}</td>
            <td className={tdClass}>{item.position}</td>
            <td className={tdClass}>{item.phone}</td>
            <td className={tdClass}>{item.address || "-"}</td>
          </tr>
        );
        case "karyawan": return (
          <tr key={item.id} className="hover:bg-slate-50 text-sm">
            <td className={`${tdClass} text-center`}>{index + 1}</td>
            <td className={tdClass}>{item.emp_id}</td>
            <td className={`${tdClass} font-semibold text-slate-800`}>{item.name}</td>
            <td className={tdClass}>{item.position}</td>
            <td className={tdClass}>{item.phone}</td>
          </tr>
        );
        case "murid": return (
          <tr key={item.id} className="hover:bg-slate-50 text-sm">
            <td className={`${tdClass} text-center`}>{index + 1}</td>
            <td className={tdClass}>{item.nis}</td>
            <td className={`${tdClass} font-semibold text-slate-800`}>{item.name}</td>
            <td className={tdClass}>{item.gender}</td>
            <td className={tdClass}>{item.class}</td>
            <td className={tdClass}>{item.year}</td>
          </tr>
        );
        case "wali": return (
          <tr key={item.id} className="hover:bg-slate-50 text-sm">
            <td className={`${tdClass} text-center`}>{index + 1}</td>
            <td className={`${tdClass} font-semibold text-slate-800`}>{item.name}</td>
            <td className={tdClass}>{item.student}</td>
            <td className={tdClass}>{item.phone}</td>
            <td className={tdClass}>{item.job}</td>
          </tr>
        );
        case "inventaris": return (
          <tr key={item.id} className="hover:bg-slate-50 text-sm">
            <td className={`${tdClass} text-center`}>{index + 1}</td>
            <td className={tdClass}>{item.code}</td>
            <td className={`${tdClass} font-semibold text-slate-800`}>{item.name}</td>
            <td className={tdClass}>{item.category}</td>
            <td className={`${tdClass} text-center`}>{item.qty}</td>
            <td className={tdClass}>{item.condition}</td>
          </tr>
        );
        default: return null;
      }
    });
  };

  const activeReportTitle = reportTypes.find(r => r.id === activeReport)?.label?.toUpperCase() || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Laporan</h1>
          <p className="text-slate-500">Cetak dan unduh laporan resmi {settings.schoolName}.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-colors shadow-sm disabled:opacity-70"
          >
            <Download className="w-4 h-4" />
            <span id="export-btn-text" className="hidden sm:inline">{isExporting ? 'Mengekspor...' : 'Export PDF'}</span>
          </button>
          <button 
            onClick={() => handlePrint()}
            className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-light font-medium transition-colors shadow-md shadow-primary/20 flex"
          >
            <Printer className="w-5 h-5" />
            Print Laporan
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Controls Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-4 print:hidden">
          <Card className="p-4 border-slate-200/60 shadow-sm rounded-2xl">
            <h3 className="font-semibold text-slate-800 mb-3">Jenis Laporan</h3>
            <div className="space-y-2">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveReport(type.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeReport === type.id 
                      ? "bg-primary-light/10 text-primary-dark font-medium" 
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <hr className="my-4 border-slate-100" />
            
            <h3 className="font-semibold text-slate-800 mb-3">Filter & Cari</h3>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
                />
              </div>
              {activeReport === "murid" && (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none appearance-none"
                  >
                    <option value="">Semua Kelas</option>
                    <option value="Kelas A">Kelas A</option>
                    <option value="Kelas B">Kelas B</option>
                  </select>
                </div>
              )}
              {activeReport === "inventaris" && (
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none appearance-none"
                  >
                    <option value="">Semua Kategori</option>
                    <option value="Peralatan Kelas">Peralatan Kelas</option>
                    <option value="Alat Peraga">Alat Peraga</option>
                    <option value="Elektronik">Elektronik</option>
                  </select>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Print Preview Canvas */}
        <div className="flex-1 overflow-x-auto pb-8">
          <div className="min-w-[800px] w-full max-w-[900px] mx-auto bg-white rounded-lg shadow-sm border border-slate-200 relative">
            
            {/* The printable area */}
            <div 
              ref={componentRef} 
              className="w-full bg-white p-10 md:p-14 text-slate-800"
              style={{ minHeight: "297mm" }} // Standard A4 approximate height
            >
              {/* Report Header */}
              <div className="flex items-center border-b-[4px] border-[#2D3E99] pb-6 mb-8 relative">
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#F4D84A] translate-y-[2px]" />
                <div className="w-24 h-24 shrink-0 flex items-center justify-center p-1">
                  <img src="/logo-paud-dunia-paud-1.png" alt="Logo PAUD" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 text-center px-4">
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{settings.schoolName}</h2>
                  <p className="text-sm text-slate-600 mt-2 font-medium">{settings.address}</p>
                  <p className="text-sm text-slate-600">Telp: {settings.phone} • Email: {settings.email}</p>
                </div>
                <div className="w-24 shrink-0"></div> {/* Spacer for centering */}
              </div>

              {/* Report Title */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-800 underline underline-offset-4 decoration-2">{activeReportTitle}</h3>
              </div>

              {/* Data Table */}
              <div className="w-full mb-8">
                <table className="w-full border-collapse border border-[#2D3E99]/20">
                  <thead>
                    <tr className="bg-[#2D3E99]/5">
                      {renderTableHeaders().map((header, i) => (
                        <th key={header} className={`py-3 px-4 border border-[#2D3E99]/20 font-bold text-[#2D3E99] text-sm ${i === 0 ? 'w-12 text-center' : 'text-left'}`}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 ? renderTableRows() : (
                      <tr>
                        <td colSpan={renderTableHeaders().length} className="py-8 text-center text-slate-500 border border-[#2D3E99]/20">
                          Tidak ada data untuk ditampilkan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Report Footer / Signature */}
              <div className="flex justify-end mt-16 pr-8">
                <div className="text-center">
                  <p className="text-slate-800 mb-20 text-sm">{settings.city}, {currentDate}</p>
                  <p className="font-bold text-slate-800 underline underline-offset-2">{settings.principalName}</p>
                  <p className="text-slate-600 text-sm mt-1">Kepala Sekolah</p>
                  {settings.principalNip && <p className="text-slate-600 text-sm">NIP. {settings.principalNip}</p>}
                </div>
              </div>
              
              {/* Visual footer styling for school docs */}
              <div className="mt-16 border-t border-slate-200 pt-4 text-xs text-slate-400 text-left">
                Dicetak dari Sistem Administrasi {settings.schoolName} secara otomatis. ({currentDate})
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
