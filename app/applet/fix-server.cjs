const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf-8');

const regex = /\/\/ --- WAF BYPASS MIDDLEWARE ---[\s\S]*?next\(\);\n\}\);/;

const newMiddleware = `const globalUpload = multer();

// --- WAF BYPASS MIDDLEWARE ---
app.use((req, res, next) => {
  const processWaf = () => {
    if (req.body && req.body.payloadHex) {
      try {
        const decodedPayload = JSON.parse(Buffer.from(req.body.payloadHex, 'hex').toString('utf8'));
        req.body = { ...req.body, ...decodedPayload };
      } catch(e) {
        console.error("Failed to decode HEX payload", e);
      }
    }
    next();
  };

  if (req.is('multipart/form-data') && req.path !== '/api/admin/upload') {
    globalUpload.none()(req, res, (err) => {
      if (err) console.error("Global upload parses err", err);
      processWaf();
    });
  } else {
    processWaf();
  }
});`;

server = server.replace(regex, newMiddleware);
fs.writeFileSync('server.ts', server);
console.log('Server middleware updated');
