const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const getCertsRoute = `
// GET Certificates
app.get("/api/certificates", (req, res) => {
  try {
    const certs = portfolioDb.prepare("SELECT * FROM certificates").all();
    res.json(certs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
});
`;

code = code.replace(
  /\/\/ GET Projects\napp\.get\("\/api\/projects", \(req, res\) => \{\n  try \{\n    const projects = portfolioDb\.prepare\("SELECT \* FROM projects"\)\.all\(\);\n    res\.json\(projects\);\n  \} catch \(error\) \{\n    res\.status\(500\)\.json\(\(\{ error: "Failed to fetch projects" \}\)\);\n  \}\n\}\);/,
  match => match + "\n" + getCertsRoute
);

const adminCertsRoutes = `
// Admin Add Certificate
app.post("/api/admin/certificates", verifyAdmin, (req, res) => {
  const { title, issuer, issue_date, url } = req.body;
  try {
    portfolioDb.prepare(
      "INSERT INTO certificates (title, issuer, issue_date, url) VALUES (?, ?, ?, ?)"
    ).run(title, issuer, issue_date || null, url || null);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to add certificate" });
  }
});

// Admin Edit / Delete Certificates
app.put("/api/admin/certificates/:id", verifyAdmin, (req, res) => {
  const { title, issuer, issue_date, url } = req.body;
  try {
    portfolioDb.prepare(
      "UPDATE certificates SET title = ?, issuer = ?, issue_date = ?, url = ? WHERE id = ?"
    ).run(title, issuer, issue_date || null, url || null, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update certificate" });
  }
});

app.delete("/api/admin/certificates/:id", verifyAdmin, (req, res) => {
  try {
    portfolioDb.prepare("DELETE FROM certificates WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete certificate" });
  }
});
`;

code = code.replace(
  /\/\/ Admin Add Project[\s\S]*?app\.post\("\/api\/admin\/projects"[\s\S]*?\}\);/,
  match => match + "\n" + adminCertsRoutes
);

fs.writeFileSync('server.ts', code);
console.log("Success modifying server.ts");
