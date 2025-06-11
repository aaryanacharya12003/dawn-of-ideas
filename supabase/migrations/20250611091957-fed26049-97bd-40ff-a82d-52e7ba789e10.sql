
-- Enable RLS on the pgs table (if not already enabled)
ALTER TABLE public.pgs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to select all PGs
CREATE POLICY "Authenticated users can view PGs" 
  ON public.pgs 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Create policy to allow authenticated users to insert PGs
CREATE POLICY "Authenticated users can create PGs" 
  ON public.pgs 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Create policy to allow authenticated users to update PGs
CREATE POLICY "Authenticated users can update PGs" 
  ON public.pgs 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Create policy to allow authenticated users to delete PGs
CREATE POLICY "Authenticated users can delete PGs" 
  ON public.pgs 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Also enable RLS and create policies for the rooms table since PG creation also creates rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view rooms" 
  ON public.rooms 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can create rooms" 
  ON public.rooms 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update rooms" 
  ON public.rooms 
  FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can delete rooms" 
  ON public.rooms 
  FOR DELETE 
  TO authenticated 
  USING (true);
