const bcrypt = require('bcryptjs');
const pass = '111985';
const hash = bcrypt.hashSync(pass, 10);
console.log('PASS:', pass);
console.log('HASH:', hash);
console.log('CHECK:', bcrypt.compareSync(pass, hash));
