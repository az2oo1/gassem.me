import React, { useState, useEffect } from "react";
import { Upload, X, LogOut, Plus, Link as LinkIcon, Code2, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IconCombobox } from "../components/IconCombobox";

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"gallery"|"links"|"skills"|"projects"|"settings">("gallery");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in mb-12">
      <div className="flex justify-between items-end border-b border-soft-sepia pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-charcoal">Admin Dashboard</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted mt-1">Manage content securely</p>
        </div>
        <button onClick={logout} className="text-[10px] flex items-center uppercase tracking-widest text-muted hover:text-charcoal transition-colors">
          <LogOut className="w-3 h-3 mr-1" /> Logout
        </button>
      </div>
      
      <div className="flex space-x-2 border-b border-soft-sepia/50 overflow-x-auto pb-px">
        <TabButton active={activeTab === "gallery"} onClick={() => setActiveTab("gallery")} icon={<Upload className="w-4 h-4"/>} label="Gallery Poster" />
        <TabButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")} icon={<Code2 className="w-4 h-4"/>} label="Settings" />
        <TabButton active={activeTab === "links"} onClick={() => setActiveTab("links")} icon={<LinkIcon className="w-4 h-4"/>} label="Links" />
        <TabButton active={activeTab === "skills"} onClick={() => setActiveTab("skills")} icon={<Code2 className="w-4 h-4"/>} label="Skills" />
        <TabButton active={activeTab === "projects"} onClick={() => setActiveTab("projects")} icon={<Briefcase className="w-4 h-4"/>} label="Projects" />
      </div>

      <div className="bg-transparent rounded-sm p-6 md:p-8 shadow-sm border border-soft-sepia">
        {activeTab === "gallery" && <GalleryPoster />}
        {activeTab === "settings" && <SettingsManager />}
        {activeTab === "links" && <LinkManager />}
        {activeTab === "skills" && <SkillManager />}
        {activeTab === "projects" && <ProjectManager />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-3 text-[10px] uppercase tracking-widest font-semibold transition-colors border-b-2 whitespace-nowrap ${
        active ? "border-accent text-accent" : "border-transparent text-muted hover:text-charcoal hover:border-soft-sepia"
      }`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}

function GalleryPoster() {
  const [photos, setPhotos] = useState<{id: number, title: string, filename: string}[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = () => {
    fetch("/api/photos").then(r => r.json()).then(setPhotos).catch(console.error);
  };
  useEffect(() => { fetchPhotos(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;
    setLoading(true); setError(null); setSuccess(false);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);
    if (description) formData.append("description", description);
    if (location) formData.append("location", location);

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/photos", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      setSuccess(true); setFile(null); setPreview(null); setTitle(""); setDescription(""); setLocation("");
      fetchPhotos();
    } catch (err) {
      setError("Failed to upload the photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/photos/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) fetchPhotos();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-serif text-charcoal mb-6">Upload a new plate</h2>
      {success && <Alert type="success" message="Plate uploaded successfully." />}
      {error && <Alert type="error" message={error} />}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Photo Image *</label>
          {!preview ? (
            <label className="flex flex-col items-center justify-center w-full h-48 border border-dashed border-soft-sepia rounded-sm hover:bg-warm-white transition-colors cursor-pointer bg-warm-white bg-opacity-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-6 h-6 text-accent mb-3" />
                <p className="mb-2 text-xs text-charcoal-light flex flex-col items-center">
                  <span className="font-semibold text-charcoal">Click to upload</span> 
                  <span className="mt-1 text-[10px] uppercase">SVG, PNG, JPG or WEBP</span>
                </p>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="relative w-full rounded-sm overflow-hidden border border-soft-sepia max-w-sm mx-auto">
              <img src={preview} alt="Preview" className="w-full h-auto object-cover" />
              <button 
                type="button" 
                onClick={() => {setFile(null); setPreview(null)}}
                className="absolute top-2 right-2 p-2 bg-charcoal/80 backdrop-blur rounded-sm text-warm-white hover:bg-charcoal shadow-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Title *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="e.g. Midnight in Riyadh" />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-field" placeholder="e.g. KAFD, Saudi Arabia" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Story / Description</label>
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="input-field resize-none" placeholder="Tell the story behind this plate..." />
        </div>
        <SubmitButton loading={loading} label="Upload Plate" />
      </form>

      <div className="mt-12 space-y-4">
        <h3 className="font-serif text-lg text-charcoal">Existing Plates</h3>
        <div className="grid grid-cols-1 gap-2">
          {photos.map(p => (
            <div key={p.id} className="flex justify-between items-center p-3 border border-soft-sepia rounded-sm">
              <div className="flex items-center gap-4">
                <img src={`/uploads/${p.filename}`} alt={p.title} className="w-12 h-12 object-cover rounded-sm border border-soft-sepia" />
                <div className="font-bold text-sm">{p.title}</div>
              </div>
              <button type="button" onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LinkManager() {
  const [links, setLinks] = useState<{id: number, name: string, url: string, icon: string}[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: "success"|"error", msg: string} | null>(null);

  const fetchLinks = () => {
    fetch("/api/links").then(r => r.json()).then(setLinks).catch(console.error);
  };
  useEffect(() => { fetchLinks(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setStatus(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/links", {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name, url, icon })
      });
      if (!res.ok) throw new Error("Failed");
      setStatus({ type: "success", msg: "Link added successfully." });
      setName(""); setUrl(""); setIcon("");
      fetchLinks();
    } catch {
      setStatus({ type: "error", msg: "Failed to add link." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/links/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) fetchLinks();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-serif text-charcoal mb-6">Add Social Link</h2>
      {status && <Alert type={status.type} message={status.msg} />}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
             <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Platform Name *</label>
             <input required value={name} onChange={e=>setName(e.target.value)} className="input-field" placeholder="e.g. GitHub" />
           </div>
           <div className="space-y-2">
             <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Icon Name</label>
             <IconCombobox value={icon} onChange={setIcon} placeholder="Search format icons..." />
           </div>
           <div className="space-y-2 md:col-span-2">
             <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">URL *</label>
             <input required type="url" value={url} onChange={e=>setUrl(e.target.value)} className="input-field" placeholder="https://..." />
           </div>
        </div>
        <SubmitButton loading={loading} label="Add Link" />
      </form>

      <div className="mt-12 space-y-4">
        <h3 className="font-serif text-lg text-charcoal">Existing Links</h3>
        <div className="grid grid-cols-1 gap-2">
          {links.map(l => (
            <div key={l.id} className="flex justify-between items-center p-3 border border-soft-sepia rounded-sm">
              <div>
                <div className="font-bold text-sm">{l.name}</div>
                <div className="text-xs text-muted truncate max-w-[200px]">{l.url}</div>
              </div>
              <button type="button" onClick={() => handleDelete(l.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillManager() {
  const [skills, setSkills] = useState<{id: number, name: string, level: string, icon: string}[]>([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Intermediate");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: "success"|"error", msg: string} | null>(null);

  const fetchSkills = () => {
    fetch("/api/skills").then(r => r.json()).then(setSkills).catch(console.error);
  };
  useEffect(() => { fetchSkills(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setStatus(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/skills", {
        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name, level, icon })
      });
      if (!res.ok) throw new Error("Failed");
      setStatus({ type: "success", msg: "Skill added successfully." });
      setName(""); setLevel("Intermediate"); setIcon("");
      fetchSkills();
    } catch {
      setStatus({ type: "error", msg: "Failed to add skill." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/skills/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) fetchSkills();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-serif text-charcoal mb-6">Add Skill</h2>
      {status && <Alert type={status.type} message={status.msg} />}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
             <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Skill Name *</label>
             <input required value={name} onChange={e=>setName(e.target.value)} className="input-field" placeholder="e.g. React" />
           </div>
           <div className="space-y-2">
             <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Icon Name (Optional)</label>
             <IconCombobox value={icon} onChange={setIcon} placeholder="Search icon..." />
           </div>
           <div className="space-y-2 md:col-span-2">
             <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Proficiency Level *</label>
             <select value={level} onChange={e=>setLevel(e.target.value)} className="input-field">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
             </select>
           </div>
        </div>
        <SubmitButton loading={loading} label="Add Skill" />
      </form>

      <div className="mt-12 space-y-4">
        <h3 className="font-serif text-lg text-charcoal">Existing Skills</h3>
        <div className="grid grid-cols-1 gap-2">
          {skills.map(s => (
            <div key={s.id} className="flex justify-between items-center p-3 border border-soft-sepia rounded-sm">
              <div>
                <div className="font-bold text-sm">{s.name}</div>
                <div className="text-xs text-muted">{s.level}</div>
              </div>
              <button type="button" onClick={() => handleDelete(s.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectManager() {
  const [projects, setProjects] = useState<{id: number, title: string, description: string, tech_stack: string, icon: string, githubUrl: string, liveUrl: string}[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [currentTech, setCurrentTech] = useState("");
  const [icon, setIcon] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: "success"|"error", msg: string} | null>(null);

  const fetchProjects = () => {
    fetch("/api/projects").then(r => r.json()).then(setProjects).catch(console.error);
  };
  useEffect(() => { fetchProjects(); }, []);

  const addTech = () => {
    if (currentTech.trim() && !techStack.includes(currentTech.trim())) {
      setTechStack([...techStack, currentTech.trim()]);
    }
    setCurrentTech("");
  };

  const removeTech = (tagToRemove: string) => {
    setTechStack(techStack.filter(t => t !== tagToRemove));
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setTitle(p.title);
    setDescription(p.description);
    try { setTechStack(JSON.parse(p.tech_stack || "[]")); } catch { setTechStack([]); }
    setIcon(p.icon || "");
    setGithubUrl(p.githubUrl || "");
    setLiveUrl(p.liveUrl || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle(""); setDescription(""); setTechStack([]); setCurrentTech(""); setGithubUrl(""); setLiveUrl(""); setIcon("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setStatus(null);
    try {
      const tech_stack_json = JSON.stringify(techStack.filter(Boolean));
      const token = localStorage.getItem("adminToken");
      
      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId ? `/api/admin/projects/${editingId}` : "/api/admin/projects";
      
      const res = await fetch(endpoint, {
        method, headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ title, description, tech_stack: tech_stack_json, githubUrl: githubUrl||null, liveUrl: liveUrl||null, icon: icon||null })
      });
      if (!res.ok) throw new Error("Failed");
      setStatus({ type: "success", msg: editingId ? "Project updated successfully." : "Project added successfully." });
      cancelEdit();
      fetchProjects();
    } catch {
      setStatus({ type: "error", msg: editingId ? "Failed to update project." : "Failed to add project." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (res.ok) fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-serif text-charcoal mb-6">{editingId ? "Edit Project" : "Add Project"}</h2>
      {status && <Alert type={status.type} message={status.msg} />}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2 md:col-span-2">
             <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Title *</label>
             <input required value={title} onChange={e=>setTitle(e.target.value)} className="input-field" placeholder="e.g. wa-bot" />
           </div>
           <div className="space-y-2 md:col-span-2">
             <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Description *</label>
             <textarea required rows={2} value={description} onChange={e=>setDescription(e.target.value)} className="input-field resize-none" placeholder="App description..." />
           </div>
           
           <div className="space-y-2 md:col-span-2">
             <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Tech Stack Tags</label>
             <div className="flex gap-2">
                <input 
                  value={currentTech} 
                  onChange={e=>setCurrentTech(e.target.value)} 
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTech();
                    }
                  }}
                  className="input-field flex-grow" 
                  placeholder="e.g. Node.js" 
                />
                <button 
                  type="button" 
                  onClick={addTech}
                  className="px-4 bg-soft-sepia/50 text-charcoal rounded-sm hover:bg-soft-sepia transition-colors flex items-center justify-center font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
             </div>
             {techStack.length > 0 && (
               <div className="flex flex-wrap gap-2 mt-3">
                 {techStack.map(tag => (
                   <span key={tag} className="flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 bg-soft-sepia/30 text-charcoal rounded-sm">
                     {tag}
                     <button type="button" onClick={() => removeTech(tag)} className="text-muted hover:text-charcoal transition-colors">
                       <X className="w-3 h-3" />
                     </button>
                   </span>
                 ))}
               </div>
             )}
           </div>

           <div className="space-y-2 md:col-span-2">
             <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Icon (Optional)</label>
             <IconCombobox value={icon} onChange={setIcon} placeholder="Search icon..." />
           </div>

           <div className="space-y-2">
             <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">GitHub URL</label>
             <input type="url" value={githubUrl} onChange={e=>setGithubUrl(e.target.value)} className="input-field" placeholder="https://github.com/..." />
           </div>
           <div className="space-y-2">
             <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Live URL</label>
             <input type="url" value={liveUrl} onChange={e=>setLiveUrl(e.target.value)} className="input-field" placeholder="https://..." />
           </div>
        </div>
        <div className="flex space-x-2">
          {editingId && <button type="button" onClick={cancelEdit} className="w-full py-3 px-4 bg-soft-sepia/50 text-charcoal rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-soft-sepia transition-colors">Cancel</button>}
          <SubmitButton loading={loading} label={editingId ? "Update Project" : "Add Project"} />
        </div>
      </form>

      <div className="mt-12 space-y-4">
        <h3 className="font-serif text-lg text-charcoal">Existing Projects</h3>
        <div className="grid grid-cols-1 gap-2">
          {projects.map(p => (
            <div key={p.id} className="flex justify-between items-center p-3 border border-soft-sepia rounded-sm">
              <div>
                <div className="font-bold text-sm">{p.title}</div>
                <div className="text-xs text-muted max-w-[300px] truncate">{p.description}</div>
              </div>
              <div className="flex space-x-3">
                <button type="button" onClick={() => handleEdit(p)} className="text-xs text-accent hover:text-charcoal">Edit</button>
                <button type="button" onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean, label: string }) {
  return (
    <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-[#2C2C2C] text-[#F9F7F2] dark:bg-[#F9F7F2] dark:text-[#1A1918] rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span> : <span><Plus className="w-4 h-4 inline mr-1"/> {label}</span>}
    </button>
  );
}

function Alert({ type, message }: { type: "success"|"error", message: string }) {
  return (
    <div className={`mb-6 p-4 rounded-sm text-sm border ${type === 'success' ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]' : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'}`}>
      {message}
    </div>
  );
}

function SettingsManager() {
  const [bio, setBio] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [heroImage1, setHeroImage1] = useState("");
  const [heroImage2, setHeroImage2] = useState("");
  const [heroImage3, setHeroImage3] = useState("");
  const [heroImage1File, setHeroImage1File] = useState<File|null>(null);
  const [heroImage2File, setHeroImage2File] = useState<File|null>(null);
  const [heroImage3File, setHeroImage3File] = useState<File|null>(null);
  const [topSkills, setTopSkills] = useState<{name: string, icon: string}[]>([]);
  const [currentTopSkillName, setCurrentTopSkillName] = useState("");
  const [currentTopSkillIcon, setCurrentTopSkillIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: "success"|"error", msg: string} | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data.bio) setBio(data.bio);
        if (data.resumeUrl) setResumeUrl(data.resumeUrl);
        if (data.heroImage1) setHeroImage1(data.heroImage1);
        if (data.heroImage2) setHeroImage2(data.heroImage2);
        if (data.heroImage3) setHeroImage3(data.heroImage3);
        if (data.topSkills) {
            try {
                const parsed = JSON.parse(data.topSkills);
                if (Array.isArray(parsed)) {
                    // Migrate string arrays to object arrays
                    setTopSkills(parsed.map(p => typeof p === 'string' ? { name: p, icon: "" } : p));
                }
            } catch {
                setTopSkills([]);
            }
        }
      });
  }, []);

  const addTopSkill = () => {
    if (currentTopSkillName.trim() && !topSkills.find(t => t.name === currentTopSkillName.trim())) {
      setTopSkills([...topSkills, { name: currentTopSkillName.trim(), icon: currentTopSkillIcon }]);
    }
    setCurrentTopSkillName("");
    setCurrentTopSkillIcon("");
  };

  const removeTopSkill = (nameToRemove: string) => {
    setTopSkills(topSkills.filter(t => t.name !== nameToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setStatus(null);
    try {
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();
      formData.append("bio", bio);
      formData.append("resumeUrl", resumeUrl);
      formData.append("topSkills", JSON.stringify(topSkills));
      if (heroImage1File) formData.append("heroImage1", heroImage1File);
      else formData.append("heroImage1", heroImage1);
      if (heroImage2File) formData.append("heroImage2", heroImage2File);
      else formData.append("heroImage2", heroImage2);
      if (heroImage3File) formData.append("heroImage3", heroImage3File);
      else formData.append("heroImage3", heroImage3);

      const res = await fetch("/api/admin/settings", {
        method: "POST", headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error("Failed");
      setStatus({ type: "success", msg: "Settings saved successfully." });
    } catch {
      setStatus({ type: "error", msg: "Failed to save settings." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-serif text-charcoal mb-4">Front Page Settings</h2>
      {status && <Alert type={status.type} message={status.msg} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Bio text</label>
          <textarea rows={3} value={bio} onChange={e=>setBio(e.target.value)} className="input-field resize-none" placeholder="Full-stack developer blending technical precision..." />
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Resume PDF Name/Path</label>
          <input type="text" value={resumeUrl} onChange={e=>setResumeUrl(e.target.value)} className="input-field" placeholder="/resume.pdf" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Hero Image 1</label>
            <input type="file" accept="image/*" onChange={e => { if (e.target.files && e.target.files[0]) setHeroImage1File(e.target.files[0]) }} className="input-field text-xs file:mr-4 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-xs file:bg-charcoal file:text-warm-white hover:file:bg-accent" />
            {(heroImage1 || heroImage1File) && <div className="text-[10px] truncate">{heroImage1File ? heroImage1File.name : heroImage1}</div>}
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Hero Image 2</label>
            <input type="file" accept="image/*" onChange={e => { if (e.target.files && e.target.files[0]) setHeroImage2File(e.target.files[0]) }} className="input-field text-xs file:mr-4 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-xs file:bg-charcoal file:text-warm-white hover:file:bg-accent" />
            {(heroImage2 || heroImage2File) && <div className="text-[10px] truncate">{heroImage2File ? heroImage2File.name : heroImage2}</div>}
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Hero Image 3</label>
            <input type="file" accept="image/*" onChange={e => { if (e.target.files && e.target.files[0]) setHeroImage3File(e.target.files[0]) }} className="input-field text-xs file:mr-4 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-xs file:bg-charcoal file:text-warm-white hover:file:bg-accent" />
            {(heroImage3 || heroImage3File) && <div className="text-[10px] truncate">{heroImage3File ? heroImage3File.name : heroImage3}</div>}
          </div>
        </div>
        
        <div className="space-y-4 md:col-span-2">
           <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">Top Skills Tags</label>
           
           <div className="flex flex-col gap-2">
              <input 
                type="text" 
                value={currentTopSkillName} 
                onChange={e=>setCurrentTopSkillName(e.target.value)} 
                className="input-field" 
                placeholder="Skill name (e.g. React)" 
              />
              <div className="flex gap-2 relative">
                <div className="flex-1">
                  <IconCombobox value={currentTopSkillIcon} onChange={setCurrentTopSkillIcon} placeholder="Search icon (optional)..." />
                </div>
                <button 
                  type="button" 
                  onClick={addTopSkill}
                  className="px-4 bg-soft-sepia/50 text-charcoal rounded-sm hover:bg-soft-sepia transition-colors flex items-center justify-center font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
           </div>
           
           {topSkills.length > 0 && (
             <div className="flex flex-wrap gap-2 mt-3">
               {topSkills.map(tag => (
                 <span key={tag.name} className="flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 bg-soft-sepia/30 text-charcoal rounded-sm">
                   {tag.name}
                   <button type="button" onClick={() => removeTopSkill(tag.name)} className="text-muted hover:text-charcoal transition-colors ml-1">
                     <X className="w-3 h-3" />
                   </button>
                 </span>
               ))}
             </div>
           )}
        </div>

        <SubmitButton loading={loading} label="Save Settings" />
      </form>
    </div>
  );
}
