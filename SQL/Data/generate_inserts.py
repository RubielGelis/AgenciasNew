import os
import subprocess
import csv
import io

db_server = r"RUBIEL-PC\SQLEXPRESS"
db_name = "Agencias"
db_user = "sa"
db_pass = "111985"

def run_sql(query):
    # Usamos sqlcmd para ejecutar la consulta y devolver el resultado en formato CSV (separador ~)
    cmd = [
        "sqlcmd", "-S", db_server, "-d", db_name, "-U", db_user, "-P", db_pass, "-C",
        "-s", "~", "-W", "-h", "-1", "-Q", f"SET NOCOUNT ON; {query}"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="latin-1")
    if result.returncode != 0:
        raise Exception(f"SQL Error: {result.stderr}")
    return result.stdout.strip()

try:
    print("Extrayendo Paises...")
    paises_query = "SELECT cd_codigo, REPLACE(ds_nombre, '''', ''), CodigoDANE, cd_region, cd_prefijo, cd_moneda FROM Paises"
    paises_csv = run_sql(paises_query)
    
    print("Extrayendo Ciudades...")
    ciudades_query = "SELECT c.cd_codigo, REPLACE(c.ds_nombre, '''', ''), p.cd_codigo, c.cd_departamento, c.cd_Iata FROM Ciudades c JOIN Paises p ON c.id_paises = p.id"
    ciudades_csv = run_sql(ciudades_query)
    
    print("Extrayendo Aeropuertos...")
    aero_query = "SELECT a.cd_codigo, REPLACE(a.ds_nombre, '''', ''), c.cd_codigo FROM Aeropuertos a JOIN Ciudades c ON a.id_ciudades = c.id"
    aero_csv = run_sql(aero_query)
    
    print("Generando sentencias SQL...")
    inserts = []
    
    inserts.append("\n-- DATOS EXTRAIDOS DE SQL SERVER\n")
    
    # PAISES
    inserts.append("-- 15. Paises (Completos)")
    reader = csv.reader(io.StringIO(paises_csv), delimiter="~")
    for row in reader:
        if len(row) < 6: continue
        code, name, dane, region, prefix, currency = [r.strip() for r in row[:6]]
        if not code: continue
        
        name_clean = name.replace("'", "''")
        currency_sql = f"(SELECT id FROM public.\"Currency\" WHERE code = '{currency}')" if currency else "NULL"
        
        sql = f"INSERT INTO public.\"Countries\" (code, name, dane, region, prefix, \"curencyId\") VALUES ('{code}', '{name_clean}', '{dane}', '{region}', '{prefix}', {currency_sql}) ON CONFLICT (code) DO NOTHING;"
        inserts.append(sql)
        
    # CIUDADES
    inserts.append("\n-- 16. Ciudades (Completas)")
    reader = csv.reader(io.StringIO(ciudades_csv), delimiter="~")
    for row in reader:
        if len(row) < 5: continue
        code, name, pais_code, dep, iata = [r.strip() for r in row[:5]]
        if not code: continue
        
        name_clean = name.replace("'", "''")
        
        sql = f"INSERT INTO public.\"Cities\" (code, name, \"countriesId\", statecode, iata) VALUES ('{code}', '{name_clean}', (SELECT id FROM public.\"Countries\" WHERE code = '{pais_code}'), '{dep}', '{iata}') ON CONFLICT (code) DO NOTHING;"
        inserts.append(sql)
        
    # AEROPUERTOS
    inserts.append("\n-- 17. Aeropuertos (Completos)")
    reader = csv.reader(io.StringIO(aero_csv), delimiter="~")
    for row in reader:
        if len(row) < 3: continue
        code, name, ciudad_code = [r.strip() for r in row[:3]]
        if not code: continue
        
        name_clean = name.replace("'", "''")
        
        sql = f"INSERT INTO public.\"Airports\" (code, name, \"citiesId\") VALUES ('{code}', '{name_clean}', (SELECT id FROM public.\"Cities\" WHERE code = '{ciudad_code}')) ON CONFLICT (code) DO NOTHING;"
        inserts.append(sql)

    output_file = r"c:\Proyectos\AgenciasNew\SQL\Data\Inicial.sql"
    with open(output_file, "a", encoding="utf-8") as f:
        f.write("\n".join(inserts))
        
    print("Migración completada. Datos añadidos a Inicial.sql")

except Exception as e:
    print(f"Error: {e}")
