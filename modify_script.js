const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const db = new Database(path.join(DB_DIR, "portfolio.db"));\ndb.pragma(\'journal_mode = WAL\');',
  'const portfolioDb = new Database(path.join(DB_DIR, "portfolio.db"));\nportfolioDb.pragma(\'journal_mode = WAL\');\nconst galleryDb = new Database(path.join(DB_DIR, "gallery.db"));\ngalleryDb.pragma(\'journal_mode = WAL\');'
);

code = code.replace(
  'db.exec(`\n  CREATE TABLE IF NOT EXISTS photos',
  'galleryDb.exec(`\n  CREATE TABLE IF NOT EXISTS photos'
);

code = code.replace(
  'FOREIGN KEY(photo_id) REFERENCES photos(id) ON DELETE CASCADE\n  );\n\n  CREATE TABLE IF NOT EXISTS links',
  'FOREIGN KEY(photo_id) REFERENCES photos(id) ON DELETE CASCADE\n  );\n`);\n\nportfolioDb.exec(`\n  CREATE TABLE IF NOT EXISTS links'
);

code = code.replace(/db\.exec\(/g, 'portfolioDb.exec(');

code = code.replace(/db\.prepare\((.*"FROM photos\b.*\)|.*"INSERT INTO photos\b.*\)|.*"UPDATE photos\b.*\)|.*"DELETE FROM photos\b.*\)|.*"SELECT .*FROM ratings\b.*\)|.*"INSERT INTO ratings\b.*\))/g, 'galleryDb.prepare($1)');
code = code.replace(/db\.prepare\(/g, 'portfolioDb.prepare(');

// Actually, multiline SQL string needs a more careful replacement
// Let's replace specifically photos/ratings:
code = code.replace(/portfolioDb\.prepare\(`\n      SELECT p\.\*,\n             \(SELECT AVG\(rating\) FROM ratings WHERE photo_id = p\.id\) as avgRating,\n             \(SELECT COUNT\(\*\) FROM ratings WHERE photo_id = p\.id\) as ratingCount\n      FROM photos p\n      ORDER BY p\.createdAt DESC\n    `\)/g,
'galleryDb.prepare(`\n      SELECT p.*,\n             (SELECT AVG(rating) FROM ratings WHERE photo_id = p.id) as avgRating,\n             (SELECT COUNT(*) FROM ratings WHERE photo_id = p.id) as ratingCount\n      FROM photos p\n      ORDER BY p.createdAt DESC\n    `)');

code = code.replace(/portfolioDb\.prepare\(`\n      SELECT p\.\*,\n             \(SELECT AVG\(rating\) FROM ratings WHERE photo_id = p\.id\) as avgRating,\n             \(SELECT COUNT\(\*\) FROM ratings WHERE photo_id = p\.id\) as ratingCount\n      FROM photos p\n      WHERE p\.id = \?\n    `\)/g,
'galleryDb.prepare(`\n      SELECT p.*,\n             (SELECT AVG(rating) FROM ratings WHERE photo_id = p.id) as avgRating,\n             (SELECT COUNT(*) FROM ratings WHERE photo_id = p.id) as ratingCount\n      FROM photos p\n      WHERE p.id = ?\n    `)');

code = code.replace(/portfolioDb\.prepare\(\n\s*"INSERT INTO ratings \(photo_id, rating\) VALUES \(\?, \?\)",\n\s*\)/g,
'galleryDb.prepare(\n      "INSERT INTO ratings (photo_id, rating) VALUES (?, ?)",\n    )');

code = code.replace(/portfolioDb\.prepare\(`\n      INSERT INTO photos \(filename, title, description, location\)\n      VALUES \(\?, \?, \?, \?\)\n    `\)/g,
'galleryDb.prepare(`\n      INSERT INTO photos (filename, title, description, location)\n      VALUES (?, ?, ?, ?)\n    `)');

code = code.replace(/portfolioDb\.prepare\(\n\s*"UPDATE photos SET title = \?, description = \?, location = \? WHERE id = \?",\n\s*\)/g,
'galleryDb.prepare(\n      "UPDATE photos SET title = ?, description = ?, location = ? WHERE id = ?",\n    )');

code = code.replace(/portfolioDb\.prepare\("SELECT filename FROM photos WHERE id = \?"\)/g,
'galleryDb.prepare("SELECT filename FROM photos WHERE id = ?")');

code = code.replace(/portfolioDb\.prepare\("DELETE FROM photos WHERE id = \?"\)/g,
'galleryDb.prepare("DELETE FROM photos WHERE id = ?")');


fs.writeFileSync('server.ts', code);
console.log('done modifying');
