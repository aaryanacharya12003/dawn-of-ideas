
-- Enable RLS on pgs table
ALTER TABLE public.pgs ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all PGs
CREATE POLICY "Allow authenticated users to read all pgs" ON public.pgs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for authenticated users to insert PGs
CREATE POLICY "Allow authenticated users to insert pgs" ON public.pgs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for authenticated users to update PGs
CREATE POLICY "Allow authenticated users to update pgs" ON public.pgs
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for authenticated users to delete PGs
CREATE POLICY "Allow authenticated users to delete pgs" ON public.pgs
    FOR DELETE USING (auth.role() = 'authenticated');

-- Also enable RLS on other tables if not already enabled
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Add policies for rooms
CREATE POLICY "Allow authenticated users to read all rooms" ON public.rooms
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert rooms" ON public.rooms
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update rooms" ON public.rooms
    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete rooms" ON public.rooms
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add policies for students
CREATE POLICY "Allow authenticated users to read all students" ON public.students
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert students" ON public.students
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update students" ON public.students
    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete students" ON public.students
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add policies for users
CREATE POLICY "Allow authenticated users to read all users" ON public.users
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert users" ON public.users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update users" ON public.users
    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete users" ON public.users
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add policies for payments
CREATE POLICY "Allow authenticated users to read all payments" ON public.payments
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert payments" ON public.payments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update payments" ON public.payments
    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to delete payments" ON public.payments
    FOR DELETE USING (auth.role() = 'authenticated');
