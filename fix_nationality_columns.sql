
ALTER TABLE public."QuotationProduct" ADD COLUMN IF NOT EXISTS "inNationality" INT DEFAULT 1;
ALTER TABLE public."ComboProduct" ADD COLUMN IF NOT EXISTS "inNationality" INT DEFAULT 1;
ALTER TABLE public."ChargeAndTax" ADD COLUMN IF NOT EXISTS "inNationality" INT DEFAULT 1;
