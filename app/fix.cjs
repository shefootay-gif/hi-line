const fs = require('fs');
const iconv = require('iconv-lite');
let content = fs.readFileSync('db/seed.ts', 'utf8');
content = content.replace(/"([^"]*)"/g, (match, p1) => {
  if (/[ظط§ءŒ…]+/.test(p1)) {
    try {
      const decoded = iconv.decode(iconv.encode(p1, 'win1256'), 'utf8');
      return '"' + decoded + '"';
    } catch(e) {
      return match;
    }
  }
  return match;
});
fs.writeFileSync('db/seed.ts', content);
