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
    print("Extrayendo Monedas desde Paises...")
    query = "SELECT cd_codigo, cd_moneda, REPLACE(ds_moneda, '''', '') FROM Paises WHERE cd_moneda IS NOT NULL AND RTRIM(LTRIM(cd_moneda)) <> ''"
    csv_data = run_sql(query)
    
    currencies = {} # dict of currency_code -> currency_name
    country_currency = {} # dict of country_code -> currency_code

    reader = csv.reader(io.StringIO(csv_data), delimiter="~")
    for row in reader:
        if len(row) < 3: continue
        country_code, currency_code, currency_name = [r.strip() for r in row[:3]]
        
        if not currency_code or currency_code == "NULL": continue
        if currency_name == "NULL": currency_name = currency_code
        
        currencies[currency_code] = currency_name
        country_currency[country_code] = currency_code

    print("Generando sentencias SQL...")
    inserts = []
    
    # MONEDAS
    inserts.append("\n-- 18. Monedas Adicionales (desde Paises)")
    for code, name in currencies.items():
        name_clean = name.replace("'", "''")
        # 1.0 para exchange rate como solicitó el usuario
        sql = f"INSERT INTO public.\"Currency\" (code, name, \"exchangeRate\") VALUES ('{code}', '{name_clean}', 1.0) ON CONFLICT (code) DO NOTHING;"
        inserts.append(sql)

    # ACTUALIZAR PAISES YA INSERTADOS PARA ASIGNARLES LA MONEDA
    inserts.append("\n-- 19. Actualizar enlace Moneda-Pais")
    for country, currency in country_currency.items():
        sql = f"UPDATE public.\"Countries\" SET \"curencyId\" = (SELECT id FROM public.\"Currency\" WHERE code = '{currency}') WHERE code = '{country}';"
        inserts.append(sql)

    output_file = r"c:\Proyectos\AgenciasNew\SQL\Data\Inicial.sql"
    with open(output_file, "a", encoding="utf-8") as f:
        f.write("\n".join(inserts))
        
    print("Monedas extraídas y sentencias añadidas a Inicial.sql")

except Exception as e:
    print(f"Error: {e}")
