const bcrypt = require('bcryptjs');
const hash = '$2b$10$EZtfgaRfxSCXi7skcvH07GJi5Zws5KZKUD/goAINKQpjSmuv';
const pass = '111985';
console.log('Testing Password:', pass);
console.log('Against Hash:', hash);
console.log('Result:', bcrypt.compareSync(pass, hash));
