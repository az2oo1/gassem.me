const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const certManager = `
function CertificateManager() {
  const [certs, setCerts] = React.useState<any[]>([]);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [title, setTitle] = React.useState("");
  const [issuer, setIssuer] = React.useState("");
  const [issue_date, setIssueDate] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);

  const fetchCerts = () => {
    wafFetch("/api/certificates")
      .then((r) => r.json())
      .then(setCerts)
      .catch(console.error);
  };
  React.useEffect(() => { fetchCerts(); }, []);

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setTitle(c.title);
    setIssuer(c.issuer);
    setIssueDate(c.issue_date || "");
    setUrl(c.url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setIssuer("");
    setIssueDate("");
    setUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const token = localStorage.getItem("adminToken");
      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId ? \`/api/admin/certificates/\${editingId}\` : "/api/admin/certificates";

      const res = await wafFetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${token}\`,
        },
        body: JSON.stringify({ title, issuer, issue_date, url }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus({ type: "success", msg: editingId ? "Certificate updated." : "Certificate added." });
      cancelEdit();
      fetchCerts();
    } catch {
      setStatus({ type: "error", msg: "Operation failed." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await wafFetch(\`/api/admin/certificates/\${id}\`, {
        method: "DELETE",
        headers: { Authorization: \`Bearer \${token}\` },
      });
      if (res.ok) fetchCerts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-serif text-charcoal mb-6">
        {editingId ? "Edit Certificate" : "Add Certificate"}
      </h2>
      {status && <Alert type={status.type} message={status.msg} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal mb-1">Title *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="e.g. AWS Certified" />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal mb-1">Issuer *</label>
            <input required value={issuer} onChange={(e) => setIssuer(e.target.value)} className="input-field" placeholder="e.g. Amazon" />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal mb-1">Date</label>
            <input type="text" value={issue_date} onChange={(e) => setIssueDate(e.target.value)} className="input-field" placeholder="e.g. 2023-05-15" />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal mb-1">URL</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="input-field" placeholder="https://..." />
          </div>
        </div>
        <div className="flex space-x-2 mt-4">
          {editingId && (
            <button type="button" onClick={cancelEdit} className="w-full py-3 px-4 bg-soft-sepia/50 text-charcoal flex-1 text-xs uppercase font-semibold">Cancel</button>
          )}
          <SubmitButton loading={loading} label={editingId ? "Update" : "Add"} />
        </div>
      </form>

      <div className="mt-12 space-y-4">
        <h3 className="font-serif text-lg text-charcoal">Existing Certificates</h3>
        <div className="space-y-2">
          {certs.map((c) => (
            <div key={c.id} className="flex justify-between items-center p-3 border border-soft-sepia rounded-sm">
              <div>
                <div className="font-bold text-sm">{c.title}</div>
                <div className="text-xs text-muted">{c.issuer} &middot; {c.issue_date}</div>
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={() => handleEdit(c)} className="text-xs text-accent">Edit</button>
                <button type="button" onClick={() => handleDelete(c.id)} className="text-xs text-red-500">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
`;

code = code.replace(
  /function SkillManager\(\) \{/,
  match => certManager + "\n" + match
);

code = code.replace(
  /"gallery" \| "links" \| "skills" \| "projects" \| "settings" \| "articles"/,
  '"gallery" | "links" | "skills" | "certificates" | "projects" | "settings" | "articles"'
);

code = code.replace(
  /<TabButton\n\s*label="Skills"\n\s*active=\{activeTab === "skills"\}\n\s*onClick=\{\(\) => setActiveTab\("skills"\)\}\n\s*\/>/,
  `<TabButton
              label="Skills"
              active={activeTab === "skills"}
              onClick={() => setActiveTab("skills")}
            />
            <TabButton
              label="Certificates"
              active={activeTab === "certificates"}
              onClick={() => setActiveTab("certificates")}
            />`
);

code = code.replace(
  /\{activeTab === "skills" && <SkillManager \/>\}/,
  `{activeTab === "skills" && <SkillManager />}\n        {activeTab === "certificates" && <CertificateManager />}`
);

fs.writeFileSync('src/pages/Admin.tsx', code);
console.log("Success admin UI");
