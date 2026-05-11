import os
import subprocess
import csv
import io

db_server = r"RUBIEL-PC\SQLEXPRESS"
db_name = "Agencias"
db_user = "sa"
db_pass = "111985"

def run_sql(query):
    cmd = [
        "sqlcmd", "-S", db_server, "-d", db_name, "-U", db_user, "-P", db_pass, "-C",
        "-s", "~", "-W", "-h", "-1", "-Q", f"SET NOCOUNT ON; {query}"
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="latin-1")
    if result.returncode != 0:
        raise Exception(f"SQL Error: {result.stderr}\nOutput: {result.stdout}")
    return result.stdout.strip()

try:
    print("Extrayendo Ciudades...")
    ciudades_query = "SELECT c.cd_Iata, REPLACE(c.ds_nombre, '''', ''), p.cd_codigo, c.cd_departamento, c.cd_Iata FROM Ciudades c JOIN Paises p ON c.id_paises = p.id WHERE c.cd_Iata IS NOT NULL AND RTRIM(LTRIM(c.cd_Iata)) <> ''"
    ciudades_csv = run_sql(ciudades_query)
    
    print("Extrayendo Aeropuertos...")
    aero_query = "SELECT a.cd_codigo, REPLACE(a.ds_nombre, '''', ''), c.cd_Iata FROM Aeropuertos a JOIN Ciudades c ON a.id_ciudades = c.id WHERE a.cd_codigo IS NOT NULL AND RTRIM(LTRIM(a.cd_codigo)) <> '' AND c.cd_Iata IS NOT NULL AND RTRIM(LTRIM(c.cd_Iata)) <> ''"
    aero_csv = run_sql(aero_query)
    
    print("Generando sentencias SQL...")
    inserts = []
    
    # CIUDADES
    inserts.append("\n-- 16. Ciudades (Completas)")
    reader = csv.reader(io.StringIO(ciudades_csv), delimiter="~")
    for row in reader:
        if len(row) < 5: continue
        code, name, pais_code, dep, iata = [r.strip() for r in row[:5]]
        if not code or code == "NULL": continue
        if pais_code == "NULL": pais_code = ""
        if dep == "NULL": dep = ""
        
        name_clean = name.replace("'", "''")
        
        sql = f"INSERT INTO public.\"Cities\" (code, name, \"countriesId\", statecode, iata) VALUES ('{code}', '{name_clean}', (SELECT id FROM public.\"Countries\" WHERE code = '{pais_code}'), '{dep}', '{code}') ON CONFLICT (code) DO NOTHING;"
        inserts.append(sql)
        
    # AEROPUERTOS
    inserts.append("\n-- 17. Aeropuertos (Completos)")
    reader = csv.reader(io.StringIO(aero_csv), delimiter="~")
    for row in reader:
        if len(row) < 3: continue
        code, name, ciudad_code = [r.strip() for r in row[:3]]
        if not code or code == "NULL": continue
        
        name_clean = name.replace("'", "''")
        
        sql = f"INSERT INTO public.\"Airports\" (code, name, \"citiesId\") VALUES ('{code}', '{name_clean}', (SELECT id FROM public.\"Cities\" WHERE code = '{ciudad_code}')) ON CONFLICT (code) DO NOTHING;"
        inserts.append(sql)

    output_file = r"c:\Proyectos\AgenciasNew\SQL\Data\Inicial.sql"
    with open(output_file, "a", encoding="utf-8") as f:
        f.write("\n".join(inserts))
        
    print("Ciudades y Aeropuertos añadidos a Inicial.sql")

except Exception as e:
    print(f"Error: {e}")
