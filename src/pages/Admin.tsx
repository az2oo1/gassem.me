import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  X,
  LogOut,
  Plus,
  Link as LinkIcon,
  Code2,
  Briefcase,
  PenTool,
  Bold,
  Italic,
  Underline,
  Link2,
  Strikethrough,
  AlignLeft,
  AlignRight,
  List,
  Eye,
  Edit3,
  Columns,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IconCombobox } from "../components/IconCombobox";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1920;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name || "image.jpg", {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.8,
        );
      };
      img.onerror = (err) => resolve(file);
    };
    reader.onerror = (err) => resolve(file);
  });
};

const Font = Quill.import("formats/font") as any;
Font.whitelist = ["serif", "arabic", "arabic-sans", "arabic-display"];
Quill.register(Font, true);

const wafFetch = async (url: string | URL | Request, options?: RequestInit) => {
  if (options?.body && typeof options.body === "string" && options.headers) {
    const headers = options.headers as Record<string, string>;
    if (
      headers["Content-Type"] === "application/json" ||
      headers["content-type"] === "application/json"
    ) {
      const bytes = new TextEncoder().encode(options.body);
      const hexParts = new Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) {
        hexParts[i] = bytes[i].toString(16).padStart(2, "0");
      }
      const hex = hexParts.join("");

      const formData = new FormData();
      formData.append("payloadHex", hex);

      const newHeaders = { ...headers };
      delete newHeaders["Content-Type"];
      delete newHeaders["content-type"];

      options.headers = newHeaders;
      options.body = formData;
    }
  }
  return window.fetch(url, options);
};

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "gallery" | "links" | "skills" | "projects" | "settings" | "articles"
  >("gallery");

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
          <h1 className="text-3xl font-serif font-bold text-charcoal">
            Admin Dashboard
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-muted mt-1">
            Manage content securely
          </p>
        </div>
        <button
          onClick={logout}
          className="text-[10px] flex items-center uppercase tracking-widest text-muted hover:text-charcoal transition-colors"
        >
          <LogOut className="w-3 h-3 mr-1" /> Logout
        </button>
      </div>

      <div className="flex space-x-2 border-b border-soft-sepia/50 overflow-x-auto pb-px scrollbar-hide">
        <TabButton
          active={activeTab === "gallery"}
          onClick={() => setActiveTab("gallery")}
          icon={<Upload className="w-4 h-4" />}
          label="Gallery Poster"
        />
        <TabButton
          active={activeTab === "articles"}
          onClick={() => setActiveTab("articles")}
          icon={<PenTool className="w-4 h-4" />}
          label="Writings"
        />
        <TabButton
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          icon={<Code2 className="w-4 h-4" />}
          label="Settings"
        />
        <TabButton
          active={activeTab === "links"}
          onClick={() => setActiveTab("links")}
          icon={<LinkIcon className="w-4 h-4" />}
          label="Links"
        />
        <TabButton
          active={activeTab === "skills"}
          onClick={() => setActiveTab("skills")}
          icon={<Code2 className="w-4 h-4" />}
          label="Skills"
        />
        <TabButton
          active={activeTab === "projects"}
          onClick={() => setActiveTab("projects")}
          icon={<Briefcase className="w-4 h-4" />}
          label="Projects"
        />
      </div>

      <div className="bg-transparent rounded-sm p-6 md:p-8 shadow-sm border border-soft-sepia">
        {activeTab === "gallery" && <GalleryPoster />}
        {activeTab === "articles" && <ArticleManager />}
        {activeTab === "settings" && <SettingsManager />}
        {activeTab === "links" && <LinkManager />}
        {activeTab === "skills" && <SkillManager />}
        {activeTab === "projects" && <ProjectManager />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-3 text-[10px] uppercase tracking-widest font-semibold transition-colors border-b-2 whitespace-nowrap ${
        active
          ? "border-accent text-accent"
          : "border-transparent text-muted hover:text-charcoal hover:border-soft-sepia"
      }`}
    >
      {icon} <span>{label}</span>
    </button>
  );
}

function GalleryPoster() {
  const [photos, setPhotos] = useState<
    {
      id: number;
      title: string;
      filename: string;
      description: string;
      location: string;
    }[]
  >([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = () => {
    wafFetch("/api/photos")
      .then((r) => r.json())
      .then(setPhotos)
      .catch(console.error);
  };
  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setTitle(p.title || "");
    setDescription(p.description || "");
    setLocation(p.location || "");
    setFile(null);
    setPreview(`/uploads/${p.filename}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setLocation("");
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !file) return;
    if (!title) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem("adminToken");
      let response;

      if (editingId) {
        response = await wafFetch(`/api/admin/photos/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, description, location }),
        });
      } else {
        const formData = new FormData();
        if (file) formData.append("image", file);
        formData.append("title", title);
        if (description) formData.append("description", description);
        if (location) formData.append("location", location);

        response = await wafFetch("/api/admin/photos", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      if (!response.ok)
        throw new Error(editingId ? "Update failed" : "Upload failed");
      setSuccess(true);
      cancelEdit();
      fetchPhotos();
    } catch (err) {
      setError(
        editingId
          ? "Failed to update the photo info."
          : "Failed to upload the photo. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await wafFetch(`/api/admin/photos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchPhotos();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-serif text-charcoal mb-6">
        {editingId ? "Edit Plate Info" : "Upload a new plate"}
      </h2>
      {success && (
        <Alert
          type="success"
          message={
            editingId
              ? "Plate updated successfully."
              : "Plate uploaded successfully."
          }
        />
      )}
      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
            {editingId ? "Photo (Cannot be changed here)" : "Photo Image *"}
          </label>
          {!preview ? (
            <label className="flex flex-col items-center justify-center w-full h-48 border border-dashed border-soft-sepia rounded-sm hover:bg-warm-white transition-colors cursor-pointer bg-warm-white bg-opacity-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-6 h-6 text-accent mb-3" />
                <p className="mb-2 text-xs text-charcoal-light flex flex-col items-center">
                  <span className="font-semibold text-charcoal">
                    Click to upload
                  </span>
                  <span className="mt-1 text-[10px] uppercase">
                    SVG, PNG, JPG or WEBP
                  </span>
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="relative w-full rounded-sm overflow-hidden border border-soft-sepia max-w-sm mx-auto">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-auto object-cover"
              />
              {!editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-charcoal/80 backdrop-blur rounded-sm text-warm-white hover:bg-charcoal shadow-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="e.g. Midnight in Riyadh"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field"
              placeholder="e.g. KAFD, Saudi Arabia"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
            Story / Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field resize-none"
            placeholder="Tell the story behind this plate..."
          />
        </div>
        <div className="flex space-x-2">
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="w-full py-3 px-4 bg-soft-sepia/50 text-charcoal rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-soft-sepia transition-colors"
            >
              Cancel
            </button>
          )}
          <SubmitButton
            loading={loading}
            label={editingId ? "Update Plate" : "Upload Plate"}
          />
        </div>
      </form>

      <div className="mt-12 space-y-4">
        <h3 className="font-serif text-lg text-charcoal">Existing Plates</h3>
        <div className="grid grid-cols-1 gap-2">
          {photos.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center p-3 border border-soft-sepia rounded-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={`/uploads/${p.filename}`}
                  alt={p.title}
                  className="w-12 h-12 object-cover rounded-sm border border-soft-sepia"
                />
                <div className="font-bold text-sm">{p.title}</div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => handleEdit(p)}
                  className="text-xs text-accent hover:text-charcoal"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LinkManager() {
  const [links, setLinks] = useState<
    { id: number; name: string; url: string; icon: string }[]
  >([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const fetchLinks = () => {
    wafFetch("/api/links")
      .then((r) => r.json())
      .then(setLinks)
      .catch(console.error);
  };
  useEffect(() => {
    fetchLinks();
  }, []);

  const handleEdit = (l: any) => {
    setEditingId(l.id);
    setName(l.name);
    setUrl(l.url);
    setIcon(l.icon || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setUrl("");
    setIcon("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const token = localStorage.getItem("adminToken");
      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId
        ? `/api/admin/links/${editingId}`
        : "/api/admin/links";

      const res = await wafFetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, url, icon }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus({
        type: "success",
        msg: editingId
          ? "Link updated successfully."
          : "Link added successfully.",
      });
      cancelEdit();
      fetchLinks();
    } catch {
      setStatus({
        type: "error",
        msg: editingId ? "Failed to update link." : "Failed to add link.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await wafFetch(`/api/admin/links/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchLinks();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-serif text-charcoal mb-6">
        {editingId ? "Edit Social Link" : "Add Social Link"}
      </h2>
      {status && <Alert type={status.type} message={status.msg} />}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Platform Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="e.g. GitHub"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Icon Name
            </label>
            <IconCombobox
              value={icon}
              onChange={setIcon}
              placeholder="Search format icons..."
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              URL *
            </label>
            <input
              required
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-field"
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="flex space-x-2">
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="w-full py-3 px-4 bg-soft-sepia/50 text-charcoal rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-soft-sepia transition-colors"
            >
              Cancel
            </button>
          )}
          <SubmitButton
            loading={loading}
            label={editingId ? "Update Link" : "Add Link"}
          />
        </div>
      </form>

      <div className="mt-12 space-y-4">
        <h3 className="font-serif text-lg text-charcoal">Existing Links</h3>
        <div className="grid grid-cols-1 gap-2">
          {links.map((l) => (
            <div
              key={l.id}
              className="flex justify-between items-center p-3 border border-soft-sepia rounded-sm"
            >
              <div>
                <div className="font-bold text-sm">{l.name}</div>
                <div className="text-xs text-muted truncate max-w-[200px]">
                  {l.url}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => handleEdit(l)}
                  className="text-xs text-accent hover:text-charcoal"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(l.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillManager() {
  const [skills, setSkills] = useState<
    { id: number; name: string; level: string; icon: string }[]
  >([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Intermediate");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const fetchSkills = () => {
    wafFetch("/api/skills")
      .then((r) => r.json())
      .then(setSkills)
      .catch(console.error);
  };
  useEffect(() => {
    fetchSkills();
  }, []);

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setName(s.name);
    setLevel(s.level);
    setIcon(s.icon || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setLevel("Intermediate");
    setIcon("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const token = localStorage.getItem("adminToken");
      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId
        ? `/api/admin/skills/${editingId}`
        : "/api/admin/skills";

      const res = await wafFetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, level, icon }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus({
        type: "success",
        msg: editingId
          ? "Skill updated successfully."
          : "Skill added successfully.",
      });
      cancelEdit();
      fetchSkills();
    } catch {
      setStatus({
        type: "error",
        msg: editingId ? "Failed to update skill." : "Failed to add skill.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await wafFetch(`/api/admin/skills/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchSkills();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-serif text-charcoal mb-6">
        {editingId ? "Edit Skill" : "Add Skill"}
      </h2>
      {status && <Alert type={status.type} message={status.msg} />}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Skill Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="e.g. React"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Icon Name (Optional)
            </label>
            <IconCombobox
              value={icon}
              onChange={setIcon}
              placeholder="Search icon..."
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Proficiency Level *
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="input-field"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-2">
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="w-full py-3 px-4 bg-soft-sepia/50 text-charcoal rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-soft-sepia transition-colors"
            >
              Cancel
            </button>
          )}
          <SubmitButton
            loading={loading}
            label={editingId ? "Update Skill" : "Add Skill"}
          />
        </div>
      </form>

      <div className="mt-12 space-y-4">
        <h3 className="font-serif text-lg text-charcoal">Existing Skills</h3>
        <div className="grid grid-cols-1 gap-2">
          {skills.map((s) => (
            <div
              key={s.id}
              className="flex justify-between items-center p-3 border border-soft-sepia rounded-sm"
            >
              <div>
                <div className="font-bold text-sm">{s.name}</div>
                <div className="text-xs text-muted">{s.level}</div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => handleEdit(s)}
                  className="text-xs text-accent hover:text-charcoal"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectManager() {
  const [projects, setProjects] = useState<
    {
      id: number;
      title: string;
      description: string;
      tech_stack: string;
      icon: string;
      githubUrl: string;
      liveUrl: string;
    }[]
  >([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [currentTech, setCurrentTech] = useState("");
  const [icon, setIcon] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const fetchProjects = () => {
    wafFetch("/api/projects")
      .then((r) => r.json())
      .then(setProjects)
      .catch(console.error);
  };
  useEffect(() => {
    fetchProjects();
  }, []);

  const addTech = () => {
    if (currentTech.trim() && !techStack.includes(currentTech.trim())) {
      setTechStack([...techStack, currentTech.trim()]);
    }
    setCurrentTech("");
  };

  const removeTech = (tagToRemove: string) => {
    setTechStack(techStack.filter((t) => t !== tagToRemove));
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setTitle(p.title);
    setDescription(p.description);
    try {
      setTechStack(JSON.parse(p.tech_stack || "[]"));
    } catch {
      setTechStack([]);
    }
    setIcon(p.icon || "");
    setGithubUrl(p.githubUrl || "");
    setLiveUrl(p.liveUrl || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setTechStack([]);
    setCurrentTech("");
    setGithubUrl("");
    setLiveUrl("");
    setIcon("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const tech_stack_json = JSON.stringify(techStack.filter(Boolean));
      const token = localStorage.getItem("adminToken");

      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId
        ? `/api/admin/projects/${editingId}`
        : "/api/admin/projects";

      const res = await wafFetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          tech_stack: tech_stack_json,
          githubUrl: githubUrl || null,
          liveUrl: liveUrl || null,
          icon: icon || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus({
        type: "success",
        msg: editingId
          ? "Project updated successfully."
          : "Project added successfully.",
      });
      cancelEdit();
      fetchProjects();
    } catch {
      setStatus({
        type: "error",
        msg: editingId ? "Failed to update project." : "Failed to add project.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await wafFetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-serif text-charcoal mb-6">
        {editingId ? "Edit Project" : "Add Project"}
      </h2>
      {status && <Alert type={status.type} message={status.msg} />}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Title *
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="e.g. wa-bot"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Description *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none"
              placeholder="App description..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Tech Stack Tags
            </label>
            <div className="flex gap-2">
              <input
                value={currentTech}
                onChange={(e) => setCurrentTech(e.target.value)}
                onKeyDown={(e) => {
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
                {techStack.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 bg-soft-sepia/30 text-charcoal rounded-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTech(tag)}
                      className="text-muted hover:text-charcoal transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Icon (Optional)
            </label>
            <IconCombobox
              value={icon}
              onChange={setIcon}
              placeholder="Search icon..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              GitHub URL
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="input-field"
              placeholder="https://github.com/..."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Live URL
            </label>
            <input
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              className="input-field"
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="flex space-x-2">
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="w-full py-3 px-4 bg-soft-sepia/50 text-charcoal rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-soft-sepia transition-colors"
            >
              Cancel
            </button>
          )}
          <SubmitButton
            loading={loading}
            label={editingId ? "Update Project" : "Add Project"}
          />
        </div>
      </form>

      <div className="mt-12 space-y-4">
        <h3 className="font-serif text-lg text-charcoal">Existing Projects</h3>
        <div className="grid grid-cols-1 gap-2">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center p-3 border border-soft-sepia rounded-sm"
            >
              <div>
                <div className="font-bold text-sm">{p.title}</div>
                <div className="text-xs text-muted max-w-[300px] truncate">
                  {p.description}
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => handleEdit(p)}
                  className="text-xs text-accent hover:text-charcoal"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 px-4 bg-[#2C2C2C] text-[#F9F7F2] dark:bg-[#F9F7F2] dark:text-[#1A1918] rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <span>
          <Plus className="w-4 h-4 inline mr-1" /> {label}
        </span>
      )}
    </button>
  );
}

function Alert({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  return (
    <div
      className={`mb-6 p-4 rounded-sm text-sm border ${type === "success" ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]" : "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"}`}
    >
      {message}
    </div>
  );
}

function SettingsManager() {
  const [bio, setBio] = useState("");
  const [bioAr, setBioAr] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [heroImage1, setHeroImage1] = useState("");
  const [heroImage2, setHeroImage2] = useState("");
  const [heroImage3, setHeroImage3] = useState("");
  const [heroImage1File, setHeroImage1File] = useState<File | null>(null);
  const [heroImage2File, setHeroImage2File] = useState<File | null>(null);
  const [heroImage3File, setHeroImage3File] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [topSkills, setTopSkills] = useState<{ name: string; icon: string }[]>(
    [],
  );
  const [currentTopSkillName, setCurrentTopSkillName] = useState("");
  const [currentTopSkillIcon, setCurrentTopSkillIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwStatus, setPwStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    wafFetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.bio) setBio(data.bio);
        if (data.bioAr) setBioAr(data.bioAr);
        if (data.resumeUrl) setResumeUrl(data.resumeUrl);
        if (data.heroImage1) setHeroImage1(data.heroImage1);
        if (data.heroImage2) setHeroImage2(data.heroImage2);
        if (data.heroImage3) setHeroImage3(data.heroImage3);
        if (data.topSkills) {
          try {
            const parsed = JSON.parse(data.topSkills);
            if (Array.isArray(parsed)) {
              // Migrate string arrays to object arrays
              setTopSkills(
                parsed.map((p) =>
                  typeof p === "string" ? { name: p, icon: "" } : p,
                ),
              );
            }
          } catch {
            setTopSkills([]);
          }
        }
      });
  }, []);

  const addTopSkill = () => {
    if (
      currentTopSkillName.trim() &&
      !topSkills.find((t) => t.name === currentTopSkillName.trim())
    ) {
      setTopSkills([
        ...topSkills,
        { name: currentTopSkillName.trim(), icon: currentTopSkillIcon },
      ]);
    }
    setCurrentTopSkillName("");
    setCurrentTopSkillIcon("");
  };

  const removeTopSkill = (nameToRemove: string) => {
    setTopSkills(topSkills.filter((t) => t.name !== nameToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();
      formData.append("bio", bio);
      formData.append("bioAr", bioAr);
      formData.append("resumeUrl", resumeUrl);
      if (resumeFile) formData.append("resumeFile", resumeFile);
      formData.append("topSkills", JSON.stringify(topSkills));
      if (heroImage1File) formData.append("heroImage1", heroImage1File);
      else formData.append("heroImage1", heroImage1);
      if (heroImage2File) formData.append("heroImage2", heroImage2File);
      else formData.append("heroImage2", heroImage2);
      if (heroImage3File) formData.append("heroImage3", heroImage3File);
      else formData.append("heroImage3", heroImage3);

      const res = await wafFetch("/api/admin/settings", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed");
      setStatus({ type: "success", msg: "Settings saved successfully." });
    } catch {
      setStatus({ type: "error", msg: "Failed to save settings." });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    setPwStatus(null);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await wafFetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      setPwStatus({ type: "success", msg: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPwStatus({
        type: "error",
        msg: err.message || "Failed to change password.",
      });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-serif text-charcoal mb-4">
        Front Page Settings
      </h2>
      {status && <Alert type={status.type} message={status.msg} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
            Bio text (English)
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input-field resize-none"
            placeholder="Full-stack developer blending technical precision..."
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
            Bio text (Arabic)
          </label>
          <textarea
            rows={3}
            value={bioAr}
            onChange={(e) => setBioAr(e.target.value)}
            className="input-field resize-none rtl:text-right"
            placeholder="مطور واجهات متكامل يدمج الدقة التقنية..."
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
            Resume PDF Name/Path/File
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0])
                  setResumeFile(e.target.files[0]);
              }}
              className="input-field text-xs file:mr-4 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-xs file:bg-charcoal file:text-warm-white hover:file:bg-accent flex-shrink-0 w-full"
            />
          </div>
          {(resumeUrl || resumeFile) && (
            <div className="text-[10px] truncate">
              {resumeFile ? resumeFile.name : resumeUrl}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Hero Image 1
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0])
                  setHeroImage1File(e.target.files[0]);
              }}
              className="input-field text-xs file:mr-4 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-xs file:bg-charcoal file:text-warm-white hover:file:bg-accent"
            />
            {(heroImage1 || heroImage1File) && (
              <div className="text-[10px] truncate">
                {heroImage1File ? heroImage1File.name : heroImage1}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Hero Image 2
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0])
                  setHeroImage2File(e.target.files[0]);
              }}
              className="input-field text-xs file:mr-4 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-xs file:bg-charcoal file:text-warm-white hover:file:bg-accent"
            />
            {(heroImage2 || heroImage2File) && (
              <div className="text-[10px] truncate">
                {heroImage2File ? heroImage2File.name : heroImage2}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Hero Image 3
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0])
                  setHeroImage3File(e.target.files[0]);
              }}
              className="input-field text-xs file:mr-4 file:py-1 file:px-2 file:rounded-sm file:border-0 file:text-xs file:bg-charcoal file:text-warm-white hover:file:bg-accent"
            />
            {(heroImage3 || heroImage3File) && (
              <div className="text-[10px] truncate">
                {heroImage3File ? heroImage3File.name : heroImage3}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
            Top Skills Tags
          </label>

          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={currentTopSkillName}
              onChange={(e) => setCurrentTopSkillName(e.target.value)}
              className="input-field"
              placeholder="Skill name (e.g. React)"
            />
            <div className="flex gap-2 relative">
              <div className="flex-1">
                <IconCombobox
                  value={currentTopSkillIcon}
                  onChange={setCurrentTopSkillIcon}
                  placeholder="Search icon (optional)..."
                />
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
              {topSkills.map((tag) => (
                <span
                  key={tag.name}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-1 bg-soft-sepia/30 text-charcoal rounded-sm"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => removeTopSkill(tag.name)}
                    className="text-muted hover:text-charcoal transition-colors ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <SubmitButton loading={loading} label="Save Settings" />
      </form>

      <h3 className="text-lg font-serif text-charcoal mt-12 mb-4 border-t border-soft-sepia pt-8">
        Change Password
      </h3>
      {pwStatus && <Alert type={pwStatus.type} message={pwStatus.msg} />}
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <SubmitButton loading={pwLoading} label="Change Password" />
      </form>
    </div>
  );
}

function ArticleManager() {
  const [articles, setArticles] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quillRef = useRef<ReactQuill>(null);

  const filesUploadHandler = React.useCallback((range: any, files: File[]) => {
    files.forEach(async (file) => {
      try {
        const compressedFile = await compressImage(file);
        const formData = new FormData();
        formData.append("image", compressedFile);

        const token = localStorage.getItem("adminToken");
        const res = await wafFetch("/api/admin/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Upload failed: ${res.status} ${res.statusText} - ${errorText}`,
          );
        }

        const data = await res.json();
        const quill = quillRef.current?.getEditor();
        if (quill && data.success && data.url) {
          const currentRange = quill.getSelection(true) || range;
          const index = currentRange ? currentRange.index : quill.getLength();
          quill.insertEmbed(index, "image", data.url);
          quill.setSelection(index + 1, 0);
        }
      } catch (err) {
        console.error("Image upload failed", err);
        alert(
          `Failed to upload image. Please try again. ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    });
  }, []);

  const imageHandler = React.useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      if (input !== null && input.files !== null) {
        const file = input.files[0];
        try {
          const compressedFile = await compressImage(file);
          const formData = new FormData();
          formData.append("image", compressedFile);

          const token = localStorage.getItem("adminToken");
          const res = await wafFetch("/api/admin/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(
              `Upload failed: ${res.status} ${res.statusText} - ${errorText}`,
            );
          }

          const data = await res.json();

          const quill = quillRef.current?.getEditor();
          if (quill && data.success && data.url) {
            const range = quill.getSelection(true);
            const index = range ? range.index : quill.getLength();
            quill.insertEmbed(index, "image", data.url);
            quill.setSelection(index + 1, 0);
          }
        } catch (err) {
          console.error("Image upload failed", err);
          alert(
            `Failed to upload image. Please try again. ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    };
  }, []);

  const modules = React.useMemo(
    () => ({
      toolbar: {
        container: [
          [
            {
              font: ["", "serif", "arabic", "arabic-sans", "arabic-display"],
            },
            { header: [1, 2, 3, false] },
          ],
          ["bold", "italic", "underline", "strike"],
          ["blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ script: "sub" }, { script: "super" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ direction: "rtl" }, { align: [] }],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
      uploader: {
        handler: filesUploadHandler,
      },
    }),
    [imageHandler, filesUploadHandler],
  );

  const fetchArticles = () =>
    wafFetch("/api/articles")
      .then((r) => r.json())
      .then(setArticles)
      .catch(console.error);
  useEffect(() => {
    fetchArticles();
  }, []);

  const handleEdit = async (a: any) => {
    setEditingId(a.id);
    setTitle(a.title);
    setExcerpt(a.excerpt || "");
    setContent("Loading content...");
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/articles/${a.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const fullArt = await res.json();
        setContent(fullArt.content || "");
      } else {
        setContent("");
      }
    } catch (e) {
      console.error(e);
      setContent("");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setExcerpt("");
    setContent("");
  };

  const processHtmlImages = async (html: string): Promise<string> => {
    const container = document.createElement("div");
    container.innerHTML = html;
    const images = Array.from(container.querySelectorAll("img"));
    for (const img of images) {
      if (img.src.startsWith("data:image/")) {
        const res = await fetch(img.src);
        const blob = await res.blob();
        let file = new File([blob], `pasted-${Date.now()}.jpg`, {
          type: blob.type,
        });
        file = await compressImage(file);

        const formData = new FormData();
        formData.append("image", file);

        const token = localStorage.getItem("adminToken");
        const uploadRes = await wafFetch("/api/admin/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadErrText = await uploadRes.text().catch(() => "");
          throw new Error(
            `Image upload failed: ${uploadRes.status} ${uploadErrText}`,
          );
        }
        const data = await uploadRes.json();
        if (data.success && data.url) {
          img.src = data.url;
        } else {
          throw new Error(`Upload succeeded but no URL returned.`);
        }
      }
    }
    return container.innerHTML;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const processedContent = await processHtmlImages(content);
      const token = localStorage.getItem("adminToken");
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/admin/articles/${editingId}`
        : "/api/admin/articles";

      const res = await wafFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, excerpt, content: processedContent }),
      });
      if (!res.ok) {
        let errData;
        let errText = await res.text().catch(() => "");
        try {
          if (errText) errData = JSON.parse(errText);
        } catch {
          // ignore parsing error
        }
        throw new Error(errData?.error || errText || "Saving failed");
      }

      setSuccess(true);
      cancelEdit();
      fetchArticles();
    } catch (err: any) {
      setError(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await wafFetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchArticles();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-serif text-charcoal mb-6">
          {editingId ? "Edit Article" : "Write a New Article"}
        </h2>

        {error && (
          <div className="p-3 mb-6 bg-red-50 text-red-700 text-sm border border-red-100 rounded-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 mb-6 bg-green-50 text-green-700 text-sm border border-green-100 rounded-sm">
            Article saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              dir="auto"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Excerpt
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="input-field resize-none"
              dir="auto"
              placeholder="Short description for the list page..."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-semibold text-charcoal">
              Content *
            </label>
            <div className="bg-warm-white rounded-sm [&_.ql-container]:min-h-[400px] [&_.ql-editor]:text-base [&_.ql-editor]:text-charcoal-light">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
              />
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <SubmitButton
              loading={loading}
              label={editingId ? "Save Changes" : "Publish Article"}
            />
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-6 py-2 border border-soft-sepia text-charcoal text-[10px] uppercase tracking-widest font-semibold hover:bg-soft-sepia/20 transition-colors rounded-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="pt-8 border-t border-soft-sepia/50">
        <h3 className="text-lg font-serif text-charcoal mb-4">
          Published Articles
        </h3>
        {articles.length === 0 ? (
          <p className="text-sm text-charcoal-light">
            No articles written yet.
          </p>
        ) : (
          <div className="space-y-3">
            {articles.map((a: any) => (
              <div
                key={a.id}
                className="flex justify-between items-center p-4 border border-soft-sepia/50 rounded-sm hover:border-soft-sepia transition-colors bg-warm-white"
              >
                <div>
                  <h4 className="font-medium text-charcoal">{a.title}</h4>
                  <p className="text-xs text-charcoal-light mt-1 max-w-sm truncate">
                    {a.excerpt}
                  </p>
                </div>
                <div className="flex space-x-3 items-center">
                  <button
                    onClick={() => handleEdit(a)}
                    className="text-[10px] uppercase tracking-widest text-accent hover:text-charcoal transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
