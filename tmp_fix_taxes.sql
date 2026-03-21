-- Add code and remove inNationality from ChargeAndTax
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ChargeAndTax' AND column_name='code') THEN
        ALTER TABLE public."ChargeAndTax" ADD COLUMN "code" TEXT;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ChargeAndTax' AND column_name='inNationality') THEN
        ALTER TABLE public."ChargeAndTax" DROP COLUMN "inNationality";
    END IF;
END $$;
