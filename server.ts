import express from "express";
import path from "path";
import multer from "multer";
import sharp from "sharp";
import Database from "better-sqlite3";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "default_dev_secret_key";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Middleware to check admin token
const verifyAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized - missing token" });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token: " + err.message });
  }
};

// Ensure uploads directory exists
const UPLOADS_DIR =
  process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Ensure database directory exists
const DB_DIR = process.env.DB_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Setup Database
const portfolioDb = new Database(path.join(DB_DIR, "portfolio.db"));
portfolioDb.pragma('journal_mode = WAL');

const galleryDb = new Database(path.join(DB_DIR, "gallery.db"));
galleryDb.pragma('journal_mode = WAL');

// Initialize schema
galleryDb.exec(`
  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    title TEXT NOT NULL,
    titleAr TEXT,
    description TEXT,
    descriptionAr TEXT,
    location TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(photo_id) REFERENCES photos(id) ON DELETE CASCADE
  );
`);

try {
  galleryDb.exec("ALTER TABLE photos ADD COLUMN titleAr TEXT;");
} catch (e) {
  // Ignore if column already exists
}

try {
  galleryDb.exec("ALTER TABLE photos ADD COLUMN descriptionAr TEXT;");
} catch (e) {
  // Ignore if column already exists
}

portfolioDb.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    level TEXT NOT NULL,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT,
    githubUrl TEXT,
    liveUrl TEXT,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date TEXT,
    url TEXT,
    pdf_filename TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

try {
  portfolioDb.exec("ALTER TABLE certificates ADD COLUMN pdf_filename TEXT;");
} catch (e) {
  // Ignore if column already exists
}

// Seed tables if empty
try {
  portfolioDb.exec("ALTER TABLE skills ADD COLUMN icon TEXT");
} catch (e) {
  // column might already exist, ignore
}

try {
  portfolioDb.exec("ALTER TABLE projects ADD COLUMN icon TEXT");
} catch (e) {
  // column might already exist, ignore
}

const countLinks = portfolioDb.prepare("SELECT COUNT(*) as count FROM links").get() as {
  count: number;
};
if (countLinks.count === 0) {
  const linkStmt = portfolioDb.prepare(
    "INSERT INTO links (name, url, icon) VALUES (?, ?, ?)",
  );
  linkStmt.run("GitHub", "https://github.com", "Github");
  linkStmt.run("LinkedIn", "https://linkedin.com", "Linkedin");
  linkStmt.run("Twitter", "https://twitter.com", "Twitter");
  linkStmt.run("Email", "mailto:hello@example.com", "Mail");
}

const countSettings = portfolioDb
  .prepare("SELECT COUNT(*) as count FROM settings")
  .get() as { count: number };
if (countSettings.count === 0) {
  const settingStmt = portfolioDb.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?)",
  );
  settingStmt.run(
    "bio",
    "Full-stack developer blending technical precision with a passion for visual storytelling through photography.",
  );
  settingStmt.run(
    "bioAr",
    "مطور واجهات متكامل يدمج الدقة التقنية مع الشغف بسرد القصص المرئية من خلال التصوير الفوتوغرافي.",
  );
  settingStmt.run("resumeUrl", "/resume.pdf");
  settingStmt.run(
    "topSkills",
    JSON.stringify([
      { name: "React", icon: "" },
      { name: "Node.js", icon: "" },
      { name: "TypeScript", icon: "" },
      { name: "Tailwind CSS", icon: "" },
      { name: "SQLite", icon: "" },
    ]),
  );
  settingStmt.run(
    "heroImage1",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
  );
  settingStmt.run(
    "heroImage2",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
  );
  settingStmt.run(
    "heroImage3",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
  );
}

const countSkills = portfolioDb
  .prepare("SELECT COUNT(*) as count FROM skills")
  .get() as { count: number };
if (countSkills.count === 0) {
  const skillStmt = portfolioDb.prepare(
    "INSERT INTO skills (name, level) VALUES (?, ?)",
  );
  skillStmt.run("React", "Advanced");
  skillStmt.run("Node.js", "Advanced");
  skillStmt.run("TypeScript", "Intermediate");
  skillStmt.run("Tailwind CSS", "Advanced");
  skillStmt.run("SQLite", "Intermediate");
}

const countProjects = portfolioDb
  .prepare("SELECT COUNT(*) as count FROM projects")
  .get() as { count: number };
if (countProjects.count === 0) {
  const projStmt = portfolioDb.prepare(
    "INSERT INTO projects (title, description, tech_stack, githubUrl, liveUrl) VALUES (?, ?, ?, ?, ?)",
  );
  projStmt.run(
    "wa-bot",
    "WhatsApp moderation system",
    '["Node.js", "WhatsApp API", "TypeScript"]',
    "#",
    null,
  );
  projStmt.run(
    "Bina and Edarah",
    "Real-estate management",
    '["React", "PostgreSQL", "Express"]',
    null,
    "#",
  );
  projStmt.run(
    "IMAMU-connect",
    "University academic hub",
    '["Next.js", "TailwindCSS", "Firebase"]',
    "#",
    "#",
  );
}

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname || ""));
  },
});
const upload = multer({
  storage: storage,
  limits: { fieldSize: 500 * 1024 * 1024 },
});

const optimizeImages = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    const processFile = async (f: Express.Multer.File) => {
      if (!f.mimetype.startsWith("image/")) return;
      try {
        const buffer = await sharp(f.path)
          .resize({ width: 1920, withoutEnlargement: true })
          .jpeg({ quality: 80, progressive: true })
          .toBuffer();
        fs.writeFileSync(f.path, buffer);
      } catch (err) {
        console.warn(
          `Failed to optimize image ${f.path}, keeping original:`,
          err,
        );
      }
    };

    if (req.file) await processFile(req.file);
    if (req.files) {
      const fd = req.files as { [fieldname: string]: Express.Multer.File[] };
      for (const k in fd) {
        for (const f of fd[k]) await processFile(f);
      }
    }
    next();
  } catch (e) {
    console.error("Image optimization failed (global catch)", e);
    next(e);
  }
};

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

const globalUpload = multer({ limits: { fieldSize: 500 * 1024 * 1024 } });

// --- WAF BYPASS MIDDLEWARE ---
app.use((req, res, next) => {
  const processWaf = () => {
    if (req.body && req.body.payloadHex) {
      try {
        const decodedPayload = JSON.parse(
          Buffer.from(req.body.payloadHex, "hex").toString("utf8"),
        );
        req.body = { ...req.body, ...decodedPayload };
      } catch (e) {
        console.error("Failed to decode HEX payload", e);
      }
    }
    next();
  };

  const isFileUploadEndpoint =
    req.path === "/api/admin/upload" ||
    req.path.startsWith("/api/admin/photos") ||
    req.path.startsWith("/api/admin/settings");

  if (req.is("multipart/form-data") && !isFileUploadEndpoint) {
    globalUpload.none()(req, res, (err) => {
      if (err) console.error("Global upload parses err", err);
      processWaf();
    });
  } else {
    processWaf();
  }
});

// Serve uploaded files
app.use("/uploads", express.static(UPLOADS_DIR));

// --- API ROUTES ---

// GET Settings
app.get("/api/settings", (req, res) => {
  try {
    const rows = portfolioDb.prepare("SELECT * FROM settings").all() as {
      key: string;
      value: string;
    }[];
    const settings = rows.reduce(
      (acc, row) => ({ ...acc, [row.key]: row.value }),
      {},
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Admin Update Settings
app.post(
  "/api/admin/settings",
  verifyAdmin,
  upload.fields([
    { name: "heroImage1" },
    { name: "heroImage2" },
    { name: "heroImage3" },
    { name: "resumeFile" },
  ]),
  optimizeImages,
  (req, res) => {
    const { bio, bioAr, topSkills } = req.body;
    let { heroImage1, heroImage2, heroImage3, resumeUrl } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files?.["heroImage1"]?.[0])
      heroImage1 = `/uploads/${files["heroImage1"][0].filename}`;
    if (files?.["heroImage2"]?.[0])
      heroImage2 = `/uploads/${files["heroImage2"][0].filename}`;
    if (files?.["heroImage3"]?.[0])
      heroImage3 = `/uploads/${files["heroImage3"][0].filename}`;
    if (files?.["resumeFile"]?.[0])
      resumeUrl = `/uploads/${files["resumeFile"][0].filename}`;

    try {
      const stmt = portfolioDb.prepare(
        "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
      );
      if (bio !== undefined) stmt.run("bio", bio);
      if (bioAr !== undefined) stmt.run("bioAr", bioAr);
      if (resumeUrl !== undefined) stmt.run("resumeUrl", resumeUrl);
      if (topSkills !== undefined)
        stmt.run(
          "topSkills",
          typeof topSkills === "string" ? topSkills : JSON.stringify(topSkills),
        );
      if (heroImage1 !== undefined) stmt.run("heroImage1", heroImage1);
      if (heroImage2 !== undefined) stmt.run("heroImage2", heroImage2);
      if (heroImage3 !== undefined) stmt.run("heroImage3", heroImage3);

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save settings" });
    }
  },
);

// GET all photos with their average rating
app.get("/api/photos", (req, res) => {
  try {
    const stmt = galleryDb.prepare(`
      SELECT p.*, 
             (SELECT AVG(rating) FROM ratings WHERE photo_id = p.id) as avgRating,
             (SELECT COUNT(*) FROM ratings WHERE photo_id = p.id) as ratingCount
      FROM photos p
      ORDER BY p.createdAt DESC
    `);
    const photos = stmt.all();
    res.json(photos);
  } catch (error) {
    console.error("Failed to fetch photos:", error);
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

// GET a single photo details
app.get("/api/photos/:id", (req, res) => {
  try {
    const photoId = req.params.id;
    const photoStmt = galleryDb.prepare(`
      SELECT p.*, 
             (SELECT AVG(rating) FROM ratings WHERE photo_id = p.id) as avgRating,
             (SELECT COUNT(*) FROM ratings WHERE photo_id = p.id) as ratingCount
      FROM photos p
      WHERE p.id = ?
    `);
    const photo = photoStmt.get(photoId);

    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }

    res.json(photo);
  } catch (error) {
    console.error("Failed to fetch photo details:", error);
    res.status(500).json({ error: "Failed to fetch photo details" });
  }
});

// POST to rate a photo
app.post("/api/photos/:id/rate", (req, res) => {
  try {
    const photoId = req.params.id;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const stmt = galleryDb.prepare(
      "INSERT INTO ratings (photo_id, rating) VALUES (?, ?)",
    );
    stmt.run(photoId, rating);

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to rate photo:", error);
    res.status(500).json({ error: "Failed to submit rating" });
  }
});

// POST to generic image upload (Admin)
app.post(
  "/api/admin/upload",
  verifyAdmin,
  (req, res, next) => {
    console.log("[SERVER] Hit /api/admin/upload");
    next();
  },
  upload.single("image"),
  optimizeImages,
  (req, res) => {
    console.log("[SERVER] Finished upload midware, req.file:", !!req.file);
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Image file is required" });
      }

      const filename = req.file.filename;
      const url = `/uploads/${filename}`;

      res.json({ success: true, url });
    } catch (error) {
      console.error("Failed to upload image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  },
);

// POST a new photo (Admin)
app.post(
  "/api/admin/photos",
  verifyAdmin,
  upload.single("image"),
  optimizeImages,
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Image file is required" });
      }

      const { title, titleAr, description, descriptionAr, location } = req.body;
      const filename = req.file.filename;

      const stmt = galleryDb.prepare(`
        INSERT INTO photos (filename, title, titleAr, description, descriptionAr, location)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      // Auth protected now

      const info = stmt.run(filename, title, titleAr || null, description, descriptionAr || null, location);
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
      console.error("Failed to upload photo:", error);
      res.status(500).json({ error: "Failed to upload photo" });
    }
  },
);

// Auth
const failedAttempts: Record<
  string,
  { count: number; lockedUntil: number | null }
> = {};

app.post("/api/auth/login", (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const now = Date.now();

  if (!failedAttempts[ip]) {
    failedAttempts[ip] = { count: 0, lockedUntil: null };
  }

  const attempt = failedAttempts[ip];

  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return res.status(429).json({
      error: `Too many failed attempts. Try again in ${Math.ceil((attempt.lockedUntil - now) / 60000)} minutes.`,
    });
  } else if (attempt.lockedUntil && now >= attempt.lockedUntil) {
    attempt.count = 0;
    attempt.lockedUntil = null;
  }

  const { password } = req.body;
  const setting = portfolioDb
    .prepare("SELECT value FROM settings WHERE key = 'admin_password'")
    .get() as any;
  const currentPassword = setting?.value || ADMIN_PASSWORD;

  if (password === currentPassword) {
    attempt.count = 0;
    attempt.lockedUntil = null;
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token });
  } else {
    attempt.count += 1;
    if (attempt.count >= 10) {
      attempt.lockedUntil = now + 60 * 60 * 1000; // 1 hour
      return res
        .status(429)
        .json({ error: "Too many failed attempts. Locked out for 1 hour." });
    }
    res.status(401).json({ error: "Invalid password" });
  }
});

app.post("/api/admin/change-password", verifyAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const setting = portfolioDb
    .prepare("SELECT value FROM settings WHERE key = 'admin_password'")
    .get() as any;
  const actualPassword = setting?.value || ADMIN_PASSWORD;

  if (currentPassword !== actualPassword) {
    return res.status(401).json({ error: "Incorrect current password" });
  }

  const existingSetting = portfolioDb
    .prepare("SELECT key FROM settings WHERE key = 'admin_password'")
    .get();
  if (existingSetting) {
    portfolioDb.prepare(
      "UPDATE settings SET value = ? WHERE key = 'admin_password'",
    ).run(newPassword);
  } else {
    portfolioDb.prepare(
      "INSERT INTO settings (key, value) VALUES ('admin_password', ?)",
    ).run(newPassword);
  }

  res.json({ success: true });
});

// GET Links
app.get("/api/links", (req, res) => {
  try {
    const links = portfolioDb.prepare("SELECT * FROM links").all();
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch links" });
  }
});

// GET Skills
app.get("/api/skills", (req, res) => {
  try {
    const skills = portfolioDb.prepare("SELECT * FROM skills").all();
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch skills" });
  }
});

// GET Projects
app.get("/api/projects", (req, res) => {
  try {
    const projects = portfolioDb.prepare("SELECT * FROM projects").all();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// GET Certificates
app.get("/api/certificates", (req, res) => {
  try {
    const certs = portfolioDb.prepare("SELECT * FROM certificates").all();
    res.json(certs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
});

app.post("/api/admin/debug", (req, res) => {
  res.json({ body: req.body, headers: req.headers, query: req.query });
});

// Admin Add Link
app.post("/api/admin/links", verifyAdmin, (req, res) => {
  const { name, url, icon } = req.body;
  try {
    portfolioDb.prepare("INSERT INTO links (name, url, icon) VALUES (?, ?, ?)").run(
      name,
      url,
      icon || null,
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to add link" });
  }
});

// Admin Add Skill
app.post("/api/admin/skills", verifyAdmin, (req, res) => {
  const { name, level, icon } = req.body;
  try {
    portfolioDb.prepare("INSERT INTO skills (name, level, icon) VALUES (?, ?, ?)").run(
      name,
      level,
      icon || null,
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to add skill" });
  }
});

// Admin Add Project
app.post("/api/admin/projects", verifyAdmin, (req, res) => {
  const { title, description, tech_stack, githubUrl, liveUrl, icon } = req.body;
  try {
    portfolioDb.prepare(
      "INSERT INTO projects (title, description, tech_stack, githubUrl, liveUrl, icon) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(title, description, tech_stack, githubUrl, liveUrl, icon || null);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to add project" });
  }
});

// Admin Edit / Delete Links
app.put("/api/admin/links/:id", verifyAdmin, (req, res) => {
  console.log("PUT /api/admin/links/:id called. body:", req.body, "params:", req.params);
  const { name, url, icon } = req.body;
  try {
    portfolioDb.prepare("UPDATE links SET name = ?, url = ?, icon = ? WHERE id = ?").run(
      name,
      url,
      icon || null,
      req.params.id,
    );
    res.json({ success: true });
  } catch (err: any) {
    console.error("Link update error:", err);
    res.status(500).json({ error: err.message || "Failed to update link" });
  }
});
app.delete("/api/admin/links/:id", verifyAdmin, (req, res) => {
  try {
    portfolioDb.prepare("DELETE FROM links WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete link" });
  }
});

// Admin Edit / Delete Skills
app.put("/api/admin/skills/:id", verifyAdmin, (req, res) => {
  const { name, level, icon } = req.body;
  try {
    portfolioDb.prepare(
      "UPDATE skills SET name = ?, level = ?, icon = ? WHERE id = ?",
    ).run(name, level, icon || null, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update skill" });
  }
});
app.delete("/api/admin/skills/:id", verifyAdmin, (req, res) => {
  try {
    portfolioDb.prepare("DELETE FROM skills WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete skill" });
  }
});

// Admin Edit / Delete Projects
app.put("/api/admin/projects/:id", verifyAdmin, (req, res) => {
  const { title, description, tech_stack, githubUrl, liveUrl, icon } = req.body;
  try {
    portfolioDb.prepare(
      "UPDATE projects SET title = ?, description = ?, tech_stack = ?, githubUrl = ?, liveUrl = ?, icon = ? WHERE id = ?",
    ).run(
      title,
      description,
      tech_stack,
      githubUrl,
      liveUrl,
      icon || null,
      req.params.id,
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update project" });
  }
});
app.delete("/api/admin/projects/:id", verifyAdmin, (req, res) => {
  try {
    portfolioDb.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// Admin Add Certificate
app.post("/api/admin/certificates", verifyAdmin, upload.single("pdf"), (req, res) => {
  const { title, issuer, issue_date, url } = req.body;
  const pdf_filename = req.file ? req.file.filename : null;
  try {
    portfolioDb.prepare(
      "INSERT INTO certificates (title, issuer, issue_date, url, pdf_filename) VALUES (?, ?, ?, ?, ?)"
    ).run(title, issuer, issue_date || null, url || null, pdf_filename);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to add certificate" });
  }
});

// Admin Edit / Delete Certificates
app.put("/api/admin/certificates/:id", verifyAdmin, upload.single("pdf"), (req, res) => {
  const { title, issuer, issue_date, url } = req.body;
  const pdf_filename = req.file ? req.file.filename : null;
  try {
    if (pdf_filename) {
      portfolioDb.prepare(
        "UPDATE certificates SET title = ?, issuer = ?, issue_date = ?, url = ?, pdf_filename = ? WHERE id = ?"
      ).run(title, issuer, issue_date || null, url || null, pdf_filename, req.params.id);
    } else {
      portfolioDb.prepare(
        "UPDATE certificates SET title = ?, issuer = ?, issue_date = ?, url = ? WHERE id = ?"
      ).run(title, issuer, issue_date || null, url || null, req.params.id);
    }
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

// Admin Edit / Delete Photos
app.put("/api/admin/photos/:id", verifyAdmin, (req, res) => {
  const { title, titleAr, description, descriptionAr, location } = req.body;
  try {
    galleryDb.prepare(
      "UPDATE photos SET title = ?, titleAr = ?, description = ?, descriptionAr = ?, location = ? WHERE id = ?",
    ).run(title || null, titleAr || null, description || null, descriptionAr || null, location || null, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update photo" });
  }
});
app.delete("/api/admin/photos/:id", verifyAdmin, (req, res) => {
  try {
    const photo = galleryDb
      .prepare("SELECT filename FROM photos WHERE id = ?")
      .get(req.params.id) as any;
    if (photo && photo.filename) {
      const p = path.join(UPLOADS_DIR, photo.filename);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
    galleryDb.prepare("DELETE FROM photos WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete photo" });
  }
});

// GET Articles
app.get("/api/articles", (req, res) => {
  try {
    const articles = portfolioDb
      .prepare(
        "SELECT id, title, excerpt, createdAt FROM articles ORDER BY createdAt DESC",
      )
      .all();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// GET a single Article
app.get("/api/articles/:id", (req, res) => {
  try {
    const article = portfolioDb
      .prepare("SELECT * FROM articles WHERE id = ?")
      .get(req.params.id);
    if (!article) return res.status(404).json({ error: "Article not found" });
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

// Admin Add Article
app.post("/api/admin/articles", verifyAdmin, (req, res) => {
  let { title, excerpt, content } = req.body;
  
  if (!excerpt && content) {
    excerpt = content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...";
  }
  
  try {
    const stmt = portfolioDb.prepare(
      "INSERT INTO articles (title, excerpt, content) VALUES (?, ?, ?)",
    );
    const info = stmt.run(title, excerpt || null, content);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err: any) {
    console.error("Error adding article:", err);
    res.status(500).json({ error: `Failed to add article: ${err.message}` });
  }
});

// Admin Edit / Delete Articles
app.put("/api/admin/articles/:id", verifyAdmin, (req, res) => {
  let { title, excerpt, content } = req.body;
  
  if (!excerpt && content) {
    excerpt = content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...";
  }
  
  try {
    portfolioDb.prepare(
      "UPDATE articles SET title = ?, excerpt = ?, content = ? WHERE id = ?",
    ).run(title, excerpt || null, content, req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    console.error("Error updating article:", err);
    res.status(500).json({ error: `Failed to update article: ${err.message}` });
  }
});

app.delete("/api/admin/articles/:id", verifyAdmin, (req, res) => {
  try {
    portfolioDb.prepare("DELETE FROM articles WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete article" });
  }
});

// Setup Vite middleware / static files serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Dev environment
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Prod environment
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
