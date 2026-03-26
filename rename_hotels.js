const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.resolve(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('src').filter(f => f.match(/\.(ts|tsx)$/));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  // Exact field / variable renames
  content = content.replace(/\bhotelId\b/g, 'prestadoraId');
  content = content.replace(/\bhotel\b/g, 'prestadora');
  content = content.replace(/\bhotels\b/g, 'prestadoras');
  
  // Types / Constants (avoiding HotelIcon which maps to lucide-react)
  content = content.replace(/\bHotel\b(?!\s*as\s*HotelIcon)(?!Icon)/g, 'Prestadora');
  content = content.replace(/\bHotels\b/g, 'Prestadoras');
  
  // Spanish plurals
  content = content.replace(/\bhoteles\b/gi, 'prestadoras');
  
  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Updated ${f}`);
  }
});
console.log('Finished renaming references in TS/TSX files.');
