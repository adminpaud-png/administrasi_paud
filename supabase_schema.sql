-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. School Settings Table
CREATE TABLE school_settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_name text NOT NULL DEFAULT 'PAUD TUNAS TERATAI',
  principal_name text NOT NULL DEFAULT 'DRA. Murdajani',
  principal_nip text DEFAULT '198503242010012001',
  address text DEFAULT 'Jl. Teratai Putih II Ujung RT.08/RW.04, Kel. Malaka Sari, Kec. Duren Sawit, Kota Adm. Jakarta Timur, Prov. D.K.I. Jakarta 13460',
  phone text DEFAULT '(021) 555-0123',
  email text DEFAULT 'adminpaud@gmail.com',
  city text DEFAULT 'Jakarta Timur',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default settings row
INSERT INTO school_settings (id) VALUES (uuid_generate_v4());

-- 2. Teachers Table (Guru)
CREATE TABLE teachers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  nip text,
  name text NOT NULL,
  gender text,
  position text,
  phone text,
  status text DEFAULT 'Aktif',
  address text,
  photo_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Employees Table (Karyawan)
CREATE TABLE employees (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  emp_id text,
  name text NOT NULL,
  position text,
  phone text,
  status text DEFAULT 'Aktif',
  photo_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Students Table (Murid)
CREATE TABLE students (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  nis text,
  name text NOT NULL,
  gender text,
  class_name text,
  parent_name text,
  academic_year text,
  status text DEFAULT 'Aktif',
  photo_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Parents Table (Wali Murid)
CREATE TABLE parents (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  student_name text,
  phone text,
  job text,
  relation text,
  photo_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Inventory Table (Inventaris)
CREATE TABLE inventory (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_code text,
  name text NOT NULL,
  category text,
  location text,
  qty integer DEFAULT 1,
  condition text,
  purchase_date date,
  photo_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Setup Row Level Security (RLS)
-- By default, allowing all for demonstration. You may want to restrict this later based on auth.uid()

ALTER TABLE school_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for school_settings" ON school_settings FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for teachers" ON teachers FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for employees" ON employees FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for students" ON students FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for parents" ON parents FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);
