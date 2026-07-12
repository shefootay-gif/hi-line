const fs = require('fs');
const file = 'db/schema.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/serial\("([^"]+)"\)/g, 'bigint("$1", { mode: "number", unsigned: true }).autoincrement()');
fs.writeFileSync(file, content);
console.log('Fixed schema.ts');
