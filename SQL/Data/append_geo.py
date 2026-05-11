import os

file_path = r"c:\Proyectos\AgenciasNew\SQL\Data\Inicial.sql"

append_sql = """
-- 12. Paises Iniciales
INSERT INTO public."Countries" (code, name, dane, region, prefix, "curencyId")
VALUES
    ('CO', 'Colombia', '170', 'AMERICA', '57', (SELECT id FROM public."Currency" WHERE code = 'COP')),
    ('US', 'Estados Unidos', '840', 'AMERICA', '1', (SELECT id FROM public."Currency" WHERE code = 'USD')),
    ('ES', 'España', '724', 'EUROPA', '34', (SELECT id FROM public."Currency" WHERE code = 'EUR'))
ON CONFLICT (code) DO NOTHING;

-- 13. Ciudades Iniciales
INSERT INTO public."Cities" (code, name, "countriesId", statecode, iata)
VALUES
    ('BOG', 'Bogotá', (SELECT id FROM public."Countries" WHERE code = 'CO'), 'CUN', 'BOG'),
    ('MDE', 'Medellín', (SELECT id FROM public."Countries" WHERE code = 'CO'), 'ANT', 'MDE'),
    ('MIA', 'Miami', (SELECT id FROM public."Countries" WHERE code = 'US'), 'FL', 'MIA'),
    ('MAD', 'Madrid', (SELECT id FROM public."Countries" WHERE code = 'ES'), 'MAD', 'MAD')
ON CONFLICT (code) DO NOTHING;

-- 14. Aeropuertos Iniciales
INSERT INTO public."Airports" (code, name, "citiesId")
VALUES
    ('BOG', 'Aeropuerto Internacional El Dorado', (SELECT id FROM public."Cities" WHERE code = 'BOG')),
    ('MDE', 'Aeropuerto Internacional Jose Maria Cordova', (SELECT id FROM public."Cities" WHERE code = 'MDE')),
    ('MIA', 'Miami International Airport', (SELECT id FROM public."Cities" WHERE code = 'MIA')),
    ('MAD', 'Adolfo Suarez Madrid-Barajas', (SELECT id FROM public."Cities" WHERE code = 'MAD'))
ON CONFLICT (code) DO NOTHING;
"""

try:
    with open(file_path, "a", encoding="utf-8") as f:
        f.write(append_sql)
    print("Datos geográficos agregados a Inicial.sql exitosamente.")
except Exception as e:
    print(f"Error: {e}")
