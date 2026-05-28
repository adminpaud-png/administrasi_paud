import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialTeachers, initialStudents, initialParents, initialEmployees, initialInventory } from './mockData';

interface SchoolSettings {
  schoolName: string;
  principalName: string;
  principalNip: string;
  address: string;
  phone: string;
  email: string;
  city: string;
  setSettings: (settings: Partial<SchoolSettings>) => void;
  // Data lists
  teachers: typeof initialTeachers;
  students: typeof initialStudents;
  parents: typeof initialParents;
  employees: typeof initialEmployees;
  inventory: typeof initialInventory;
  // Actions to add (minimal)
  addTeacher: (t: any) => void;
  updateTeacher: (id: number, t: any) => void;
  deleteTeacher: (id: number) => void;
  addStudent: (s: any) => void;
  updateStudent: (id: number, s: any) => void;
  deleteStudent: (id: number) => void;
  addParent: (p: any) => void;
  updateParent: (id: number, p: any) => void;
  deleteParent: (id: number) => void;
  addEmployee: (e: any) => void;
  updateEmployee: (id: number, e: any) => void;
  deleteEmployee: (id: number) => void;
  addInventory: (i: any) => void;
  updateInventory: (id: number, i: any) => void;
  deleteInventory: (id: number) => void;
  bulkAddTeachers: (items: any[]) => void;
  bulkAddStudents: (items: any[]) => void;
  bulkAddParents: (items: any[]) => void;
  bulkAddEmployees: (items: any[]) => void;
  bulkAddInventory: (items: any[]) => void;
  bulkDeleteTeachers: (ids: number[]) => void;
  bulkDeleteStudents: (ids: number[]) => void;
  bulkDeleteParents: (ids: number[]) => void;
  bulkDeleteEmployees: (ids: number[]) => void;
  bulkDeleteInventory: (ids: number[]) => void;
}

export const useSettingsStore = create<SchoolSettings>()(
  persist(
    (set) => ({
      schoolName: "PAUD TUNAS TERATAI",
      principalName: "DRA. Murdajani",
      principalNip: "198503242010012001",
      address: "Jl. Teratai Putih II Ujung RT.08/RW.04, Kel. Malaka Sari, Kec. Duren Sawit, Kota Adm. Jakarta Timur, Prov. D.K.I. Jakarta 13460",
      phone: "(021) 555-0123",
      email: "adminpaud@gmail.com",
      city: "Jakarta Timur",
      setSettings: (newSettings) => set((state) => {
        const newState: any = { ...state, ...newSettings };
        
        // Auto-sync Principal to Teachers
        if ('principalName' in newSettings || 'principalNip' in newSettings) {
          const principalName = newSettings.principalName !== undefined ? newSettings.principalName : state.principalName;
          const principalNip = newSettings.principalNip !== undefined ? newSettings.principalNip : state.principalNip;
          
          const existingIdx = state.teachers.findIndex(t => t.position === "Kepala Sekolah");
          
          if (existingIdx >= 0) {
            newState.teachers = [...state.teachers];
            if (principalName || principalNip) {
              newState.teachers[existingIdx] = { 
                ...newState.teachers[existingIdx], 
                name: principalName, 
                nip: principalNip 
              };
            }
          } else if (principalName) {
            // Add automatically if not exists
            newState.teachers = [...state.teachers, {
               id: Date.now(),
               name: principalName,
               nip: principalNip,
               position: "Kepala Sekolah",
               gender: "Perempuan",
               phone: "-",
               status: "Aktif",
               address: "-",
               photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150"
            }];
          }
        }
        
        return newState;
      }),
      
      teachers: initialTeachers,
      students: initialStudents,
      parents: initialParents,
      employees: initialEmployees,
      inventory: initialInventory,
      
      addTeacher: (t) => set(state => {
        const newState: any = { teachers: [...state.teachers, { ...t, id: Date.now() }] };
        if (t.position === "Kepala Sekolah") {
          newState.principalName = t.name;
          newState.principalNip = t.nip;
        }
        return newState;
      }),
      
      updateTeacher: (id, t) => set(state => {
        const newState: any = { teachers: state.teachers.map(x => x.id === id ? { ...x, ...t } : x) };
        if (t.position === "Kepala Sekolah") {
          newState.principalName = t.name;
          newState.principalNip = t.nip;
        }
        return newState;
      }),
      
      deleteTeacher: (id) => set(state => {
        const teacher = state.teachers.find(x => x.id === id);
        if (teacher && teacher.position === "Kepala Sekolah") {
          return { 
            teachers: state.teachers.filter(x => x.id !== id),
            principalName: "",
            principalNip: ""
          };
        }
        return { teachers: state.teachers.filter(x => x.id !== id) };
      }),
      
      addStudent: (s) => set(state => ({ students: [...state.students, { ...s, id: Date.now() }] })),
      updateStudent: (id, s) => set(state => ({ students: state.students.map(x => x.id === id ? { ...x, ...s } : x) })),
      deleteStudent: (id) => set(state => ({ students: state.students.filter(x => x.id !== id) })),
      
      addParent: (p) => set(state => ({ parents: [...state.parents, { ...p, id: Date.now() }] })),
      updateParent: (id, p) => set(state => ({ parents: state.parents.map(x => x.id === id ? { ...x, ...p } : x) })),
      deleteParent: (id) => set(state => ({ parents: state.parents.filter(x => x.id !== id) })),
      
      addEmployee: (e) => set(state => ({ employees: [...state.employees, { ...e, id: Date.now() }] })),
      updateEmployee: (id, e) => set(state => ({ employees: state.employees.map(x => x.id === id ? { ...x, ...e } : x) })),
      deleteEmployee: (id) => set(state => ({ employees: state.employees.filter(x => x.id !== id) })),
      
      addInventory: (i) => set(state => ({ inventory: [...state.inventory, { ...i, id: Date.now() }] })),
      updateInventory: (id, i) => set(state => ({ inventory: state.inventory.map(x => x.id === id ? { ...x, ...i } : x) })),
      deleteInventory: (id) => set(state => ({ inventory: state.inventory.filter(x => x.id !== id) })),
      
      bulkAddTeachers: (items) => set(state => ({ teachers: [...state.teachers, ...items.map((t, idx) => ({ ...t, id: Date.now() + idx }))] })),
      bulkAddStudents: (items) => set(state => ({ students: [...state.students, ...items.map((s, idx) => ({ ...s, id: Date.now() + idx }))] })),
      bulkAddParents: (items) => set(state => ({ parents: [...state.parents, ...items.map((p, idx) => ({ ...p, id: Date.now() + idx }))] })),
      bulkAddEmployees: (items) => set(state => ({ employees: [...state.employees, ...items.map((e, idx) => ({ ...e, id: Date.now() + idx }))] })),
      bulkAddInventory: (items) => set(state => ({ inventory: [...state.inventory, ...items.map((i, idx) => ({ ...i, id: Date.now() + idx }))] })),
      
      bulkDeleteTeachers: (ids) => set(state => ({ 
        teachers: state.teachers.filter(x => !ids.includes(x.id)),
        principalName: state.teachers.find(x => x.position === "Kepala Sekolah" && !ids.includes(x.id)) ? state.principalName : "",
        principalNip: state.teachers.find(x => x.position === "Kepala Sekolah" && !ids.includes(x.id)) ? state.principalNip : "",
      })),
      bulkDeleteStudents: (ids) => set(state => ({ students: state.students.filter(x => !ids.includes(x.id)) })),
      bulkDeleteParents: (ids) => set(state => ({ parents: state.parents.filter(x => !ids.includes(x.id)) })),
      bulkDeleteEmployees: (ids) => set(state => ({ employees: state.employees.filter(x => !ids.includes(x.id)) })),
      bulkDeleteInventory: (ids) => set(state => ({ inventory: state.inventory.filter(x => !ids.includes(x.id)) })),
    }),
    {
      name: 'school-settings-storage',
    }
  )
);
