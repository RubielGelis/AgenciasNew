-- Add htmlTemplate column to Branch and Implant tables
ALTER TABLE public."Branch" ADD COLUMN IF NOT EXISTS "htmlTemplate" TEXT;
ALTER TABLE public."Implant" ADD COLUMN IF NOT EXISTS "htmlTemplate" TEXT;
