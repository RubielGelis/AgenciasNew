-- Script para insertar datos iniciales en TicketType
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public."TicketType" WHERE code = 'NAC') THEN
        INSERT INTO public."TicketType" (code, name, description) VALUES ('NAC', 'Nacional', 'Tiquete Nacional');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public."TicketType" WHERE code = 'INT') THEN
        INSERT INTO public."TicketType" (code, name, description) VALUES ('INT', 'Internacional', 'Tiquete Internacional');
    END IF;
END $$;
