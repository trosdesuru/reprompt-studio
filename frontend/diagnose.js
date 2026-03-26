const fs = require('fs');
const path = require('path');

console.log("--- 🕵️ INVESTIGACIÓN DE DEPENDENCIAS ---");
console.log(`Directorio actual: ${process.cwd()}`);
console.log(`Versión de Node: ${process.version}`);
console.log(`Plataforma: ${process.platform}`);

const pathsToCheck = [
  'node_modules/next/package.json',
  'node_modules/next/dist/compiled/cookie/index.js',
  'node_modules/next/dist/server/api-utils/get-cookie-parser.js'
];

pathsToCheck.forEach(p => {
  const fullPath = path.join(__dirname, p);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ EXISTE: ${p}`);
  } else {
    console.log(`❌ NO ENCONTRADO: ${p}`);
    // Si no existe el directorio padre, listamos qué hay cerca
    const parent = path.dirname(fullPath);
    if (fs.existsSync(parent)) {
      console.log(`   📂 Contenido de ${path.dirname(p)}:`, fs.readdirSync(parent));
    }
  }
});
console.log("---------------------------------------");