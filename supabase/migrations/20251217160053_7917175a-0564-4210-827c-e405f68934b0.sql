-- Table pour les soumissions MAS
CREATE TABLE public.mas_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  technician_name TEXT NOT NULL,
  siemens_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OK'
);

-- Enable RLS
ALTER TABLE public.mas_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (technicians submit without auth)
CREATE POLICY "Anyone can insert submissions"
  ON public.mas_submissions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can read submissions (for admin view)
CREATE POLICY "Anyone can read submissions"
  ON public.mas_submissions
  FOR SELECT
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.mas_submissions;