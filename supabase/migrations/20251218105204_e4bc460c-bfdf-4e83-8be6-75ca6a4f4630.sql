-- Add worksite/company info column to mas_submissions
ALTER TABLE public.mas_submissions 
ADD COLUMN worksite_info text;