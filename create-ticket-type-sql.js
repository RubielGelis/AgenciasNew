const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:111985@localhost:5432/agencias_new?schema=public"
});

const fnListar = `
CREATE OR REPLACE FUNCTION public."fnTicketTypeListar"()
RETURNS TABLE(id integer, code text, name text, description text, "isActive" boolean)
LANGUAGE plpgsql AS $function$
BEGIN
    RETURN QUERY SELECT t.id, t.code::text, t.name::text, t.description::text, t."isActive" FROM public."TicketType" t ORDER BY t.name ASC;
END; $function$;
`;

const spCrear = `
CREATE OR REPLACE PROCEDURE public."spTicketTypeCrear"(
    p_code TEXT,
    p_name TEXT,
    p_description TEXT,
    p_isActive BOOLEAN,
    p_acting_user_id INT,
    INOUT p_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO public."TicketType" (code, name, description, "isActive")
    VALUES (p_code, p_name, p_description, COALESCE(p_isActive, true))
    RETURNING id INTO p_id;
    p_mensaje_resultado := 'SUCCESS: Tipo de Tiquete creado correctamente.';
EXCEPTION
    WHEN unique_violation THEN
        p_mensaje_resultado := 'ERROR: El código ya existe.';
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END; $$;
`;

const spActualizar = `
CREATE OR REPLACE PROCEDURE public."spTicketTypeActualizar"(
    p_id INT,
    p_code TEXT,
    p_name TEXT,
    p_description TEXT,
    p_isActive BOOLEAN,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE public."TicketType"
    SET code = COALESCE(p_code, code),
        name = COALESCE(p_name, name),
        description = p_description,
        "isActive" = COALESCE(p_isActive, "isActive")
    WHERE id = p_id;
    p_mensaje_resultado := 'SUCCESS: Tipo de Tiquete actualizado correctamente.';
EXCEPTION
    WHEN unique_violation THEN
        p_mensaje_resultado := 'ERROR: El código ya existe.';
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END; $$;
`;

const spEliminar = `
CREATE OR REPLACE PROCEDURE public."spTicketTypeEliminar"(
    p_id INT,
    p_acting_user_id INT,
    INOUT p_mensaje_resultado TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM public."TicketType" WHERE id = p_id;
    p_mensaje_resultado := 'SUCCESS: Tipo de Tiquete eliminado correctamente.';
EXCEPTION
    WHEN OTHERS THEN
        p_mensaje_resultado := 'ERROR: ' || SQLERRM;
END; $$;
`;

async function main() {
    try {
        await pool.query(fnListar);
        await pool.query(spCrear);
        await pool.query(spActualizar);
        await pool.query(spEliminar);
        
        fs.writeFileSync('c:/Proyectos/AgenciasNew/SQL/Function/fnTicketTypeListar.sql', fnListar);
        fs.writeFileSync('c:/Proyectos/AgenciasNew/SQL/Sp/spTicketTypeCrear.sql', spCrear);
        fs.writeFileSync('c:/Proyectos/AgenciasNew/SQL/Sp/spTicketTypeActualizar.sql', spActualizar);
        fs.writeFileSync('c:/Proyectos/AgenciasNew/SQL/Sp/spTicketTypeEliminar.sql', spEliminar);
        
        console.log("SQL objects created and saved.");
    } catch (e) {
        console.error("PG error:", e);
    } finally {
        await pool.end();
    }
}

main();
