const fs = require('fs');
const sql = fs.readFileSync('SQL/Actualizador.SQL', 'utf8');

const pos = 115290;
const start = Math.max(0, pos - 100);
const end = Math.min(sql.length, pos + 200);

console.log("Characters around position", pos, ":");
console.log("=========================================");
console.log(sql.slice(start, end));
console.log("=========================================");
