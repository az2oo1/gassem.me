const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/portfolioDb\.prepare\(\`\n\s*SELECT p\.\*,[\s\S]*?FROM photos p[\s\S]*?ORDER BY p\.createdAt DESC\n\s*\`\)/g,
'galleryDb.prepare(`\n      SELECT p.*, \n             (SELECT AVG(rating) FROM ratings WHERE photo_id = p.id) as avgRating,\n             (SELECT COUNT(*) FROM ratings WHERE photo_id = p.id) as ratingCount\n      FROM photos p\n      ORDER BY p.createdAt DESC\n    `)');

code = code.replace(/portfolioDb\.prepare\(\`\n\s*SELECT p\.\*,[\s\S]*?FROM photos p[\s\S]*?WHERE p\.id = \?\n\s*\`\)/g,
'galleryDb.prepare(`\n      SELECT p.*, \n             (SELECT AVG(rating) FROM ratings WHERE photo_id = p.id) as avgRating,\n             (SELECT COUNT(*) FROM ratings WHERE photo_id = p.id) as ratingCount\n      FROM photos p\n      WHERE p.id = ?\n    `)');

code = code.replace(/portfolioDb\.prepare\([\s\S]*?\"INSERT INTO ratings \(photo_id, rating\) VALUES \(\?, \?\)\",[\s\S]*?\)/g,
'galleryDb.prepare(\n      \"INSERT INTO ratings (photo_id, rating) VALUES (?, ?)\",\n    )');

code = code.replace(/portfolioDb\.prepare\(\`[\s\S]*?INSERT INTO photos \(filename, title, description, location\)[\s\S]*?VALUES \(\?, \?, \?, \?\)[\s\S]*?\`\)/g,
'galleryDb.prepare(`\n      INSERT INTO photos (filename, title, description, location)\n      VALUES (?, ?, ?, ?)\n    `)');

code = code.replace(/portfolioDb\.prepare\([\s\S]*?\"UPDATE photos SET title = \?, description = \?, location = \? WHERE id = \?\",[\s\S]*?\)/g,
'galleryDb.prepare(\n      \"UPDATE photos SET title = ?, description = ?, location = ? WHERE id = ?\",\n    )');

code = code.replace(/portfolioDb\.prepare\(\"SELECT filename FROM photos WHERE id = \?\"\)/g,
'galleryDb.prepare(\"SELECT filename FROM photos WHERE id = ?\")');

code = code.replace(/portfolioDb\.prepare\(\"DELETE FROM photos WHERE id = \?\"\)/g,
'galleryDb.prepare(\"DELETE FROM photos WHERE id = ?\")');

fs.writeFileSync('server.ts', code);
console.log("Success");
