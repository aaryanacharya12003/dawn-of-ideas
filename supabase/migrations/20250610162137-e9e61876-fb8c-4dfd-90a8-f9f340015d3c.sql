
-- Drop existing tables if they exist (in correct order to handle foreign keys)
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.pgs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create the profiles table first (since it's referenced by other tables)
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'manager'::text CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'accountant'::text, 'viewer'::text])),
  assigned_pgs jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create the users table
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'manager'::text CHECK (role = ANY (ARRAY['admin'::text, 'manager'::text, 'accountant'::text, 'viewer'::text])),
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'suspended'::text])),
  "lastLogin" text DEFAULT 'Never'::text,
  "assignedPGs" jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create the pgs table
CREATE TABLE public.pgs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  address text,
  pg_type text DEFAULT 'male'::text CHECK (pg_type = ANY (ARRAY['male'::text, 'female'::text, 'unisex'::text])),
  manager_id uuid,
  monthly_rent numeric DEFAULT 0,
  total_rooms integer DEFAULT 0,
  occupied_rooms integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  amenities jsonb DEFAULT '[]'::jsonb,
  images jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pgs_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id)
);

-- Create the rooms table
CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pg_id uuid NOT NULL,
  room_number text NOT NULL,
  room_type text NOT NULL,
  capacity integer NOT NULL DEFAULT 1,
  rent numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'available'::text CHECK (status = ANY (ARRAY['available'::text, 'occupied'::text, 'maintenance'::text, 'vacant'::text, 'partial'::text, 'full'::text])),
  occupant_name text,
  occupant_contact text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT rooms_pg_id_fkey FOREIGN KEY (pg_id) REFERENCES public.pgs(id) ON DELETE CASCADE,
  CONSTRAINT rooms_unique_number_per_pg UNIQUE (pg_id, room_number)
);

-- Create the students table
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text,
  address text,
  aadhaar_number text,
  occupation text,
  total_fees numeric NOT NULL DEFAULT 0,
  deposit numeric NOT NULL DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  room_id uuid,
  pg_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT students_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE SET NULL,
  CONSTRAINT students_pg_id_fkey FOREIGN KEY (pg_id) REFERENCES public.pgs(id) ON DELETE SET NULL
);

-- Create the payments table
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL,
  amount numeric NOT NULL,
  date date NOT NULL,
  mode text NOT NULL DEFAULT 'Cash'::text CHECK (mode = ANY (ARRAY['Cash'::text, 'UPI'::text, 'Bank Transfer'::text])),
  approval_status text NOT NULL DEFAULT 'pending'::text CHECK (approval_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  note text,
  approved_by uuid,
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE,
  CONSTRAINT payments_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Admins can insert users" ON public.users FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update users" ON public.users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete users" ON public.users FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for profiles table
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for PGs table
CREATE POLICY "Users can view PGs" ON public.pgs FOR SELECT USING (true);
CREATE POLICY "Admins and managers can insert PGs" ON public.pgs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Admins and managers can update PGs" ON public.pgs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Admins can delete PGs" ON public.pgs FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for rooms table
CREATE POLICY "Users can view rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Admins and managers can insert rooms" ON public.rooms FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Admins and managers can update rooms" ON public.rooms FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Admins can delete rooms" ON public.rooms FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for students table
CREATE POLICY "Users can view students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Admins and managers can insert students" ON public.students FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Admins and managers can update students" ON public.students FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Admins can delete students" ON public.students FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for payments table
CREATE POLICY "Users can view payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Admins and managers can insert payments" ON public.payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY "Admins and accountants can update payments" ON public.payments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'accountant'))
);
CREATE POLICY "Admins can delete payments" ON public.payments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'name', new.email),
    COALESCE(new.raw_user_meta_data ->> 'role', 'manager')
  );
  RETURN new;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_pgs_manager_id ON public.pgs(manager_id);
CREATE INDEX idx_rooms_pg_id ON public.rooms(pg_id);
CREATE INDEX idx_students_room_id ON public.students(room_id);
CREATE INDEX idx_students_pg_id ON public.students(pg_id);
CREATE INDEX idx_payments_student_id ON public.payments(student_id);
CREATE INDEX idx_payments_approved_by ON public.payments(approved_by);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- Insert the admin user into the users table
INSERT INTO public.users (
  id,
  name,
  email,
  role,
  status,
  "lastLogin",
  "assignedPGs",
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Admin User',
  'nextarbrains@gmail.com',
  'admin',
  'active',
  'Never',
  '[]'::jsonb,
  now(),
  now()
);
