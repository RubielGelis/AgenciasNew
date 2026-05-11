import os

file_path = r"c:\Proyectos\AgenciasNew\SQL\Data\Inicial.sql"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Split the file by markers to reorder
    # The markers are:
    # "-- 12. Paises Iniciales" or "-- DATOS EXTRAIDOS DE SQL SERVER"
    # "-- 18. Monedas Adicionales (desde Paises)"
    # "-- 19. Actualizar enlace Moneda-Pais"
    
    parts = content.split("-- DATOS EXTRAIDOS DE SQL SERVER")
    
    if len(parts) == 2:
        top_part = parts[0]
        bottom_part = parts[1]
        
        # Split bottom_part by the new sections
        bottom_parts = bottom_part.split("\n-- 18. Monedas Adicionales (desde Paises)")
        
        if len(bottom_parts) == 2:
            geo_part = bottom_parts[0]
            curr_and_updates = bottom_parts[1]
            
            curr_parts = curr_and_updates.split("\n-- 19. Actualizar enlace Moneda-Pais")
            curr_part = curr_parts[0]
            # We just discard curr_parts[1] which contains the updates
            
            # Now rebuild the content
            # Top part
            # -- DATOS EXTRAIDOS DE SQL SERVER
            # -- 18. Monedas Adicionales (desde Paises) (renumbered maybe, or just keep as is)
            # geo_part (which contains Paises, Ciudades, Aeropuertos)
            
            new_content = top_part + "-- DATOS EXTRAIDOS DE SQL SERVER\n\n-- 15. Monedas Adicionales (desde Paises)" + curr_part + geo_part
            
            # Need to fix the numbering maybe, but it's fine.
            # Let's fix the numbering slightly if we can:
            new_content = new_content.replace("-- 15. Paises (Completos)", "-- 16. Paises (Completos)")
            new_content = new_content.replace("-- 16. Ciudades (Completas)", "-- 17. Ciudades (Completas)")
            new_content = new_content.replace("-- 17. Aeropuertos (Completos)", "-- 18. Aeropuertos (Completos)")
            
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_content)
                
            print("Archivo reorganizado exitosamente.")
        else:
            print("No se encontró la sección 18.")
    else:
        print("No se encontró la división de DATOS EXTRAIDOS.")
        
except Exception as e:
    print(f"Error: {e}")
