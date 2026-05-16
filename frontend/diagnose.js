const fs = require("node:fs");
const path = require("node:path");

if (process.env.NODE_ENV === "development") {
  console.log("--- 🕵️ INVESTIGACIÓN DE DEPENDENCIAS ---");
  console.log(`Directorio actual: ${process.cwd()}`);
  console.log(`Versión de Node: ${process.version}`);
  console.log(`Plataforma: ${process.platform}`);
}

const pathsToCheck = [
  "node_modules/next/package.json",
  "node_modules/next/dist/compiled/cookie/index.js",
  "node_modules/next/dist/server/api-utils/get-cookie-parser.js",
];

pathsToCheck.forEach((p) => {
  const fullPath = path.join(__dirname, p);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ EXISTE: ${p}`);
  } else {
    console.log(`❌ NO ENCONTRADO: ${p}`);

    const parent = path.dirname(fullPath);
    if (fs.existsSync(parent)) {
      if (process.env.NODE_ENV === "development") {
        console.log(`   📂 Contenido de ${path.dirname(p)}:`, fs.readdirSync(parent));
      }
    }
  }
});
if (process.env.NODE_ENV === "development") {
  console.log("---------------------------------------");
}
