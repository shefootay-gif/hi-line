const fs = require('fs');
const files = ['src/pages/Shop.tsx', 'src/pages/ProductDetail.tsx', 'src/pages/Home.tsx'];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/<img(.*?)src=/g, (match, p1) => {
    if(p1.includes('loading=')) return match;
    return '<img loading="lazy"' + p1 + 'src=';
  });
  fs.writeFileSync(f, c);
});
