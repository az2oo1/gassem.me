const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

// 1. Database instantiation
code = code.replace(/const db = new Database\(path\.join\(DB_DIR, ".*?"\)\);/, 
`const portfolioDb = new Database(path.join(DB_DIR, "portfolio.db"));
const galleryDb = new Database(path.join(DB_DIR, "gallery.db"));`);

code = code.replace(/db\.pragma\('journal_mode = WAL'\);/,
`portfolioDb.pragma('journal_mode = WAL');
galleryDb.pragma('journal_mode = WAL');`);

// 2. Initial schema execution
const tableRegex = /db\.exec\(`\s*CREATE TABLE IF NOT EXISTS photos \([\s\S]*?CONSTRAINT.*?CASCADE\s*\)?\n?\s*\)?\n?\s*?\s*\);/m;
// Actually, let's just string match it.

let schemaPart1 = `
  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(photo_id) REFERENCES photos(id) ON DELETE CASCADE
  );`;

code = code.replace(schemaPart1, '');
code = code.replace(/db\.exec\(`/, `galleryDb.exec(\`${schemaPart1}\`);\n\nportfolioDb.exec(\``);

// 3. Replace all remaining db. with portfolioDb., then fix galleryDb.
code = code.replace(/db\./g, 'portfolioDb.');

// 4. Fix galleryDb
code = code.replace(/portfolioDb\.prepare\("SELECT COUNT\(\*\) as count FROM photos"\)/g, 'galleryDb.prepare("SELECT COUNT(*) as count FROM photos")');
code = code.replace(/portfolioDb\.prepare\(\s*`\s*SELECT p\.\*[\s\S]*?FROM photos p[\s\S]*?`\s*\)/g, match => match.replace(/portfolioDb/, 'galleryDb'));
code = code.replace(/portfolioDb\.prepare\(\s*"INSERT INTO ratings \(photo_id, rating\) VALUES \(\?, \?\)"\s*\)/g, 'galleryDb.prepare("INSERT INTO ratings (photo_id, rating) VALUES (?, ?)")');
code = code.replace(/portfolioDb\.prepare\(\s*`[\s\S]*?INSERT INTO photos[\s\S]*?`\s*\)/g, match => match.replace(/portfolioDb/, 'galleryDb'));
code = code.replace(/portfolioDb\.prepare\(\s*"UPDATE photos SET title = \?, description = \?, location = \? WHERE id = \?"\s*\)/g, 'galleryDb.prepare("UPDATE photos SET title = ?, description = ?, location = ? WHERE id = ?")');
code = code.replace(/portfolioDb\.prepare\("DELETE FROM photos WHERE id = \?"\)/g, 'galleryDb.prepare("DELETE FROM photos WHERE id = ?")');
code = code.replace(/portfolioDb\.prepare\(\s*`\s*SELECT \*\s*FROM photos\s*`\s*\)/g, match => match.replace(/portfolioDb/, 'galleryDb'));
code = code.replace(/portfolioDb\.prepare\("SELECT \* FROM photos"\)/g, match => match.replace(/portfolioDb/, 'galleryDb'));

fs.writeFileSync('server.ts', code);
console.log("Done");
