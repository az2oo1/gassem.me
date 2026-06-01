const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf-8');

server = server.replace(
  /let\s+\{\s*title,\s*excerpt,\s*content,\s*isBase64,\s*payloadBase64\s*\}\s*=\s*req\.body;[\s\n]*if\s*\(isBase64\s*&&\s*payloadBase64\)\s*\{[\s\n]*try\s*\{[\s\n]*const\s*decodedPayload\s*=\s*JSON\.parse\([\s\n]*Buffer\.from\(payloadBase64,\s*"base64"\)\.toString\("utf-8"\),*[\s\n]*\);[\s\n]*title\s*=\s*decodedPayload\.title;[\s\n]*excerpt\s*=\s*decodedPayload\.excerpt;[\s\n]*content\s*=\s*decodedPayload\.content;[\s\n]*\}\s*catch\s*\(e\)\s*\{\}[\s\n]*\}\s*else\s*if\s*\(isBase64\)\s*\{[\s\n]*if\s*\(title\)\s*title\s*=\s*Buffer\.from\(title,\s*"base64"\)\.toString\("utf-8"\);[\s\n]*if\s*\(excerpt\)\s*excerpt\s*=\s*Buffer\.from\(excerpt,\s*"base64"\)\.toString\("utf-8"\);[\s\n]*if\s*\(content\)\s*content\s*=\s*Buffer\.from\(content,\s*"base64"\)\.toString\("utf-8"\);[\s\n]*\}/g,
  'let { title, excerpt, content } = req.body;'
);

const middleware = `
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

// --- WAF BYPASS MIDDLEWARE ---
app.use((req, res, next) => {
  if (req.body && req.body.payloadHex) {
    try {
      const decodedPayload = JSON.parse(Buffer.from(req.body.payloadHex, 'hex').toString('utf8'));
      req.body = { ...req.body, ...decodedPayload };
    } catch(e) {
      console.error("Failed to decode HEX payload", e);
    }
  }
  next();
});
`;

server = server.replace(
  /app\.use\(express\.json\(\{ limit: "500mb" \}\)\);\s*app\.use\(express\.urlencoded\(\{ extended: true, limit: "500mb" \}\)\);/,
  middleware
);

fs.writeFileSync('server.ts', server);

console.log('Server updated');
