const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Proyectos\\JOBFacturacionAuto\\JOBFacturacionAuto\\SQL\\SP';
const destDir = 'C:\\Proyectos\\AgenciasNew\\SQL\\SP';

const filesToMigrate = [
  {
    src: 'spza_CargosImpAsignadosIntegradoJOB_ConsultarConceptoFac.sql',
    dest: 'spCargosImpAsignadosIntegradoConsultarConceptoFac.sql',
    replacements: [
      { from: /spza_CargosImpAsignadosIntegradoJOB_ConsultarConceptoFac/g, to: 'spCargosImpAsignadosIntegradoConsultarConceptoFac' }
    ]
  },
  {
    src: 'spza_ConfiguracionVariablesJOB_ObtenerValores.sql',
    dest: 'spConfiguracionVariablesObtenerValores.sql',
    replacements: [
      { from: /spza_ConfiguracionVariablesJOB_ObtenerValores/g, to: 'spConfiguracionVariablesObtenerValores' }
    ]
  },
  {
    src: 'spza_GenerarConceptosAutoJOB_Consultar.sql',
    dest: 'spGenerarConceptosAutoConsultar.sql',
    replacements: [
      { from: /spza_GenerarConceptosAutoJOB_Consultar/g, to: 'spGenerarConceptosAutoConsultar' },
      { from: /spza_CargosImpAsignadosIntegradoJOB_ConsultarConceptoFac/g, to: 'spCargosImpAsignadosIntegradoConsultarConceptoFac' },
      { from: /spza_ConfiguracionVariablesJOB_ObtenerValores/g, to: 'spConfiguracionVariablesObtenerValores' }
    ]
  }
];

try {
  filesToMigrate.forEach(f => {
    const srcPath = path.join(srcDir, f.src);
    const destPath = path.join(destDir, f.dest);
    
    console.log(`Processing: ${f.src} -> ${f.dest}`);
    
    // Read raw buffer to check for encoding (could be UTF-16BE or UTF-16LE or UTF-8)
    const buf = fs.readFileSync(srcPath);
    let str = '';
    
    if (buf[0] === 0xfe && buf[1] === 0xff) {
      // UTF-16BE
      const leBuf = Buffer.alloc(buf.length);
      for (let i = 0; i < buf.length; i += 2) {
        if (i + 1 < buf.length) {
          leBuf[i] = buf[i + 1];
          leBuf[i + 1] = buf[i];
        }
      }
      str = leBuf.toString('utf16le');
    } else if (buf[0] === 0xff && buf[1] === 0xfe) {
      // UTF-16LE
      str = buf.toString('utf16le');
    } else {
      str = buf.toString('utf-8');
    }
    
    // Apply replacements
    f.replacements.forEach(r => {
      str = str.replace(r.from, r.to);
    });
    
    // Save to destination in UTF-8
    fs.writeFileSync(destPath, str, 'utf-8');
    console.log(`Saved successfully to ${destPath}`);
  });
} catch (e) {
  console.error('Migration Error:', e.message);
}
