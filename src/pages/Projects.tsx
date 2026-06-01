// @ts-nocheck
import { useEffect, useState } from "react";
import { ExternalLink, Github, Folder, Code2, Terminal } from "lucide-react";
import * as LucideIcons from "lucide-react";
import * as FaIcons from "react-icons/fa";
import * as SiIcons from "react-icons/si";
import { Project } from "../types";
import { useLanguage } from "../contexts/LanguageContext";

const getProjectIcon = (iconName?: string | null) => {
  if (!iconName) return <Folder className="w-5 h-5" strokeWidth={1.5} />;
  if (iconName in FaIcons) {
    const Icon = (FaIcons as any)[iconName];
    return <Icon className="w-6 h-6" />;
  }
  if (iconName in SiIcons) {
    const Icon = (SiIcons as any)[iconName];
    return <Icon className="w-6 h-6" />;
  }
  if (iconName in LucideIcons) {
    const Icon = (LucideIcons as any)[iconName];
    return <Icon className="w-5 h-5" strokeWidth={1.5} />;
  }
  return <Folder className="w-5 h-5" strokeWidth={1.5} />;
};

const getTechIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("react")) return <FaIcons.FaReact className="w-4 h-4" />;
  if (n.includes("vue")) return <FaIcons.FaVuejs className="w-4 h-4" />;
  if (n.includes("angular")) return <FaIcons.FaAngular className="w-4 h-4" />;
  if (n.includes("html")) return <FaIcons.FaHtml5 className="w-4 h-4" />;
  if (n.includes("css")) return <FaIcons.FaCss3Alt className="w-4 h-4" />;
  if (n.includes("tailwind"))
    return <SiIcons.SiTailwindcss className="w-4 h-4" />;
  if (n.includes("node")) return <FaIcons.FaNodeJs className="w-4 h-4" />;
  if (n.includes("express")) return <SiIcons.SiExpress className="w-4 h-4" />;
  if (n.includes("php")) return <FaIcons.FaPhp className="w-4 h-4" />;
  if (n.includes("laravel")) return <FaIcons.FaLaravel className="w-4 h-4" />;
  if (n.includes("python")) return <FaIcons.FaPython className="w-4 h-4" />;
  if (n.includes("typescript"))
    return <SiIcons.SiTypescript className="w-4 h-4" />;
  if (n.includes("javascript"))
    return <SiIcons.SiJavascript className="w-4 h-4" />;
  if (n.includes("java")) return <FaIcons.FaJava className="w-4 h-4" />;
  if (n.includes("go")) return <SiIcons.SiGo className="w-4 h-4" />;
  if (n.includes("rust")) return <SiIcons.SiRust className="w-4 h-4" />;
  if (n.includes("docker")) return <FaIcons.FaDocker className="w-4 h-4" />;
  if (n.includes("kubernetes"))
    return <SiIcons.SiKubernetes className="w-4 h-4" />;
  if (n.includes("aws") || n.includes("amazon"))
    return <FaIcons.FaAws className="w-4 h-4" />;
  if (n.includes("gcp") || n.includes("google cloud"))
    return <SiIcons.SiGooglecloud className="w-4 h-4" />;
  if (n.includes("firebase")) return <SiIcons.SiFirebase className="w-4 h-4" />;
  if (n.includes("mysql") || n.includes("sql"))
    return <SiIcons.SiMysql className="w-4 h-4" />;
  if (n.includes("postgres"))
    return <SiIcons.SiPostgresql className="w-4 h-4" />;
  if (n.includes("mongo")) return <SiIcons.SiMongodb className="w-4 h-4" />;
  if (n.includes("redis")) return <SiIcons.SiRedis className="w-4 h-4" />;
  if (n.includes("git")) return <FaIcons.FaGitAlt className="w-4 h-4" />;
  if (n.includes("figma")) return <FaIcons.FaFigma className="w-4 h-4" />;
  if (n.includes("android")) return <FaIcons.FaAndroid className="w-4 h-4" />;
  if (n.includes("ios") || n.includes("swift"))
    return <FaIcons.FaApple className="w-4 h-4" />;
  if (n.includes("flutter")) return <SiIcons.SiFlutter className="w-4 h-4" />;
  return <Terminal className="w-4 h-4" />;
};

export default function Projects() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-soft-sepia border-t-accent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="space-y-12 animate-fade-in w-full">
      <div className="border-b border-soft-sepia pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-3 flex items-center gap-3">
            <img src="/projects.png" alt="Projects" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
            {t("projects.title")}
          </h2>
          <p className="text-charcoal-light text-sm rtl:text-base max-w-lg leading-relaxed">
            {t("projects.desc")}
          </p>
        </div>
        <div className="text-[10px] uppercase tracking-widest font-mono text-muted flex items-center gap-2">
          <Code2 className="w-4 h-4" strokeWidth={1.5} /> {projects.length}{" "}
          {t("projects.count")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => {
          let tags: string[] = [];
          if (project.tech_stack) {
            try {
              tags = JSON.parse(project.tech_stack);
            } catch (e) {}
          }
          return (
            <div
              key={project.id}
              className="flex flex-col p-4 md:p-5 bg-warm-white border border-soft-sepia rounded-sm hover:shadow-md hover:border-accent/40 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2.5 bg-soft-sepia/20 rounded-sm text-accent group-hover:bg-accent group-hover:text-warm-white transition-colors shrink-0">
                  {getProjectIcon(project.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-serif text-charcoal group-hover:text-accent transition-colors leading-snug">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0 ml-2 mt-0.5">
                      {project.githubUrl && project.githubUrl !== "#" && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted hover:text-charcoal transition-colors"
                          aria-label="Source Code"
                        >
                          <Github className="w-4 h-4" strokeWidth={1.5} />
                        </a>
                      )}
                      {project.liveUrl && project.liveUrl !== "#" && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted hover:text-accent transition-colors"
                          aria-label="Live Site"
                        >
                          <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-charcoal-light text-xs rtl:text-sm leading-relaxed mt-1.5 font-light">
                    {project.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-soft-sepia/50 w-full">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <span
                      key={tag}
                      className="group/tag flex items-center gap-2 overflow-hidden px-2 py-1.5 bg-soft-sepia/20 text-charcoal-light rounded-sm font-medium hover:bg-soft-sepia/40 transition-all duration-300 max-w-[2rem] hover:max-w-[12rem] cursor-default box-border"
                    >
                      <span className="shrink-0 flex items-center justify-center w-4 h-4">
                        {getTechIcon(tag)}
                      </span>
                      <span className="text-[10px] whitespace-nowrap opacity-0 group-hover/tag:opacity-100 transition-opacity duration-300">
                        {tag}
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-muted/50 italic">
                    {t("projects.unspecified")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="py-20 text-center flex flex-col items-center justify-center text-charcoal-light border border-dashed border-soft-sepia rounded-sm">
          <Folder
            className="w-10 h-10 mb-4 text-muted opacity-50"
            strokeWidth={1}
          />
          <p className="text-sm">{t("projects.empty")}</p>
        </div>
      )}
    </div>
  );
}
