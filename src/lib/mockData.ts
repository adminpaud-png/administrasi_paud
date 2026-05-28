export const initialTeachers = [
  { id: 1, nip: "198503242010012001", name: "Kepala Sekolah", gender: "Perempuan", position: "Kepala Sekolah", phone: "081234567890", status: "Aktif", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150", address: "Jl. Melati No. 12" },
  { id: 2, nip: "199008172015042002", name: "Budi Santoso, S.Pd", gender: "Laki-laki", position: "Wali Kelas A", phone: "082345678901", status: "Aktif", photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150", address: "Jl. Anggrek No. 4" },
  { id: 3, nip: "198811052014022003", name: "Dewi Lestari, S.Pd.AUD", gender: "Perempuan", position: "Wali Kelas B", phone: "083456789012", status: "Aktif", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150", address: "Jl. Kamboja No. 9" },
  { id: 4, nip: "199201152018012004", name: "Ahmad Fauzi, S.Kom", gender: "Laki-laki", position: "Guru Ekstrakurikuler", phone: "084567890123", status: "Cuti", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150", address: "Jl. Mawar No. 1" },
];

export const initialEmployees = [
  { id: 1, emp_id: "KAR-001", name: "Agus Supriyono", position: "Petugas Kebersihan", phone: "081211112222", status: "Aktif" },
  { id: 2, emp_id: "KAR-002", name: "Rina Kusuma", position: "Staf Tata Usaha", phone: "081233334444", status: "Aktif" },
];

export const initialStudents = [
  { id: 1, nisn: "24001", name: "Anisa Rahma", gender: "Perempuan", class: "Kelas A (Bintang)", parent: "Budi Santoso", year: "2023/2024", status: "Aktif", photo: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: 2, nisn: "24002", name: "Kevin Pratama", gender: "Laki-laki", class: "Kelas B (Bulan)", parent: "Linda Wijaya", year: "2023/2024", status: "Aktif", photo: "https://images.unsplash.com/photo-1519340241574-2c61ce34604e?auto=format&fit=crop&q=80&w=150&h=150" },
  { id: 3, nisn: "24003", name: "Siti Nurhaliza", gender: "Perempuan", class: "Kelas A (Bintang)", parent: "Ahmad Dahlan", year: "2023/2024", status: "Aktif", photo: "https://images.unsplash.com/photo-1503454537195-1dc534baf3f4?auto=format&fit=crop&q=80&w=150&h=150" },
];

export const initialParents = [
  { id: 1, name: "Budi Santoso", student: "Anisa Rahma", studentClass: "Kelas A", phone: "081299998888", job: "PNS", relation: "Ayah Kandung" },
  { id: 2, name: "Linda Wijaya", student: "Kevin Pratama", studentClass: "Kelas B", phone: "081277776666", job: "Wirausaha", relation: "Ibu Kandung" },
];

export const initialInventory = [
  { id: 1, code: "INV-001", name: "Papan Tulis Whiteboard", category: "Peralatan Kelas", qty: 2, condition: "Baik", purchaseDate: "12/03/2023" },
  { id: 2, code: "INV-002", name: "Mainan Balok Susun", category: "Alat Peraga", qty: 5, condition: "Baik", purchaseDate: "05/01/2024" },
  { id: 3, code: "INV-003", name: "Kipas Angin Dinding", category: "Elektronik", qty: 1, condition: "Rusak", purchaseDate: "20/11/2023" },
];
