-- Database Schema for Administrasi PAUD Tunas Teratai

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Table: teachers (Data Guru)
create table if not exists public.teachers (
    id uuid default uuid_generate_v4() primary key,
    nip text unique,
    full_name text not null,
    gender text check (gender in ('Laki-laki', 'Perempuan')),
    birth_date date,
    address text,
    phone_number text,
    position text,
    education text,
    photo_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Table: employees (Data Karyawan)
create table if not exists public.employees (
    id uuid default uuid_generate_v4() primary key,
    employee_id text unique,
    full_name text not null,
    position text,
    phone_number text,
    address text,
    photo_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Table: students (Data Murid)
create table if not exists public.students (
    id uuid default uuid_generate_v4() primary key,
    nis text unique,
    full_name text not null,
    gender text check (gender in ('Laki-laki', 'Perempuan')),
    birth_place text,
    birth_date date,
    religion text,
    address text,
    class_name text,
    academic_year text,
    photo_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Table: parents (Data Wali Murid)
create table if not exists public.parents (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade,
    full_name text not null,
    relationship text,
    phone_number text,
    address text,
    job text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Table: inventory (Data Inventaris)
create table if not exists public.inventory (
    id uuid default uuid_generate_v4() primary key,
    item_code text unique,
    item_name text not null,
    category text,
    quantity integer default 0,
    condition text check (condition in ('Baik', 'Kurang Baik', 'Rusak Berat')),
    location text,
    entry_date date,
    photo_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set Row Level Security (RLS) - Example for Admin access only
-- Note: Replace authenticated role logic as per your specific auth setup.
alter table public.teachers enable row level security;
alter table public.employees enable row level security;
alter table public.students enable row level security;
alter table public.parents enable row level security;
alter table public.inventory enable row level security;

-- Basic policy: Allow authenticated users to do everything (For simplicity in this template)
create policy "Allow authenticated all on teachers" on public.teachers for all to authenticated using (true);
create policy "Allow authenticated all on employees" on public.employees for all to authenticated using (true);
create policy "Allow authenticated all on students" on public.students for all to authenticated using (true);
create policy "Allow authenticated all on parents" on public.parents for all to authenticated using (true);
create policy "Allow authenticated all on inventory" on public.inventory for all to authenticated using (true);

-- Create a storage bucket for uploads
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true);
create policy "Allow authenticated uploads" on storage.objects for all to authenticated using (bucket_id = 'uploads');
