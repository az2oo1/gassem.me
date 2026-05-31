// @ts-nocheck
import React from "react";
import { Skill } from "../types";
import { 
  FaReact, FaVuejs, FaAngular, FaHtml5, FaCss3Alt,
  FaNodeJs, FaPython, FaJava, FaPhp, FaLaravel,
  FaDocker, FaAws, FaGitAlt, FaFigma, FaAndroid, FaApple,
  FaDatabase, FaServer, FaCloud, FaCode, FaTerminal, FaMobileAlt
} from "react-icons/fa";
import * as FaIcons from "react-icons/fa";
import { 
  SiTypescript, SiJavascript, SiTailwindcss, SiExpress,
  SiFirebase, SiGooglecloud, SiMysql,
  SiPostgresql, SiMongodb, SiRedis, SiKubernetes, SiGo, SiRust, SiFlutter
} from "react-icons/si";
import * as SiIcons from "react-icons/si";
import { Box, Cpu } from "lucide-react";
import * as LucideIcons from "lucide-react";

const getSkillIcon = (skill: Skill) => {
  if (skill.icon) {
    if (skill.icon in FaIcons) {
      const Icon = (FaIcons as any)[skill.icon]; return <Icon className="w-6 h-6 text-accent" />;
    }
    if (skill.icon in SiIcons) {
      const Icon = (SiIcons as any)[skill.icon]; return <Icon className="w-6 h-6 text-accent" />;
    }
    if (skill.icon in LucideIcons) {
      const Icon = (LucideIcons as any)[skill.icon]; return <Icon className="w-6 h-6 text-accent" />;
    }
  }

  const n = skill.name.toLowerCase();
  
  // Specific brands
  if (n.includes("react")) return <FaReact className="w-6 h-6 text-accent" />;
  if (n.includes("vue")) return <FaVuejs className="w-6 h-6 text-accent" />;
  if (n.includes("angular")) return <FaAngular className="w-6 h-6 text-accent" />;
  if (n.includes("html")) return <FaHtml5 className="w-6 h-6 text-accent" />;
  if (n.includes("css")) return <FaCss3Alt className="w-6 h-6 text-accent" />;
  if (n.includes("tailwind")) return <SiTailwindcss className="w-6 h-6 text-accent" />;
  
  if (n.includes("node")) return <FaNodeJs className="w-6 h-6 text-accent" />;
  if (n.includes("express")) return <SiExpress className="w-6 h-6 text-accent" />;
  if (n.includes("php")) return <FaPhp className="w-6 h-6 text-accent" />;
  if (n.includes("laravel")) return <FaLaravel className="w-6 h-6 text-accent" />;
  
  if (n.includes("python")) return <FaPython className="w-6 h-6 text-accent" />;
  if (n.includes("typescript")) return <SiTypescript className="w-5 h-5 text-accent" />;
  if (n.includes("javascript")) return <SiJavascript className="w-5 h-5 text-accent" />;
  if (n.includes("java")) return <FaJava className="w-6 h-6 text-accent" />;
  if (n.includes("go")) return <SiGo className="w-6 h-6 text-accent" />;
  if (n.includes("rust")) return <SiRust className="w-6 h-6 text-accent" />;
  
  if (n.includes("docker")) return <FaDocker className="w-6 h-6 text-accent" />;
  if (n.includes("kubernetes")) return <SiKubernetes className="w-6 h-6 text-accent" />;
  if (n.includes("aws") || n.includes("amazon")) return <FaAws className="w-6 h-6 text-accent" />;
  if (n.includes("gcp") || n.includes("google cloud")) return <SiGooglecloud className="w-6 h-6 text-accent" />;
  if (n.includes("azure")) return <FaCloud className="w-6 h-6 text-accent" />;
  if (n.includes("firebase")) return <SiFirebase className="w-6 h-6 text-accent" />;
  
  if (n.includes("mysql") || n.includes("sql")) return <SiMysql className="w-6 h-6 text-accent" />;
  if (n.includes("postgres")) return <SiPostgresql className="w-6 h-6 text-accent" />;
  if (n.includes("mongo")) return <SiMongodb className="w-6 h-6 text-accent" />;
  if (n.includes("redis")) return <SiRedis className="w-6 h-6 text-accent" />;
  
  if (n.includes("git")) return <FaGitAlt className="w-6 h-6 text-accent" />;
  if (n.includes("figma")) return <FaFigma className="w-6 h-6 text-accent" />;
  if (n.includes("android")) return <FaAndroid className="w-6 h-6 text-accent" />;
  if (n.includes("ios") || n.includes("swift")) return <FaApple className="w-6 h-6 text-accent" />;
  if (n.includes("flutter")) return <SiFlutter className="w-6 h-6 text-accent" />;

  // Generics
  if (n.includes("frontend") || n.includes("ui")) return <FaCode className="w-6 h-6 text-accent" />;
  if (n.includes("backend") || n.includes("api")) return <FaServer className="w-6 h-6 text-accent" />;
  if (n.includes("database")) return <FaDatabase className="w-6 h-6 text-accent" />;
  if (n.includes("cloud")) return <FaCloud className="w-6 h-6 text-accent" />;
  if (n.includes("linux") || n.includes("bash") || n.includes("shell") || n.includes("terminal")) return <FaTerminal className="w-6 h-6 text-accent" />;
  if (n.includes("mobile")) return <FaMobileAlt className="w-6 h-6 text-accent" />;
  if (n.includes("machine learning") || n.includes("ai") || n.includes("data") || n.includes("algorithm")) return <Cpu className="w-6 h-6 text-accent" strokeWidth={1.5} />;
  
  return <Box className="w-6 h-6 text-accent" strokeWidth={1.5} />;
};

const SkillCard: React.FC<{ skill: Skill }> = ({ skill }) => {
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "advanced": return "bg-skill-advanced w-full";
      case "intermediate": return "bg-skill-intermediate w-2/3";
      case "beginner": return "bg-skill-beginner w-1/3";
      default: return "bg-accent opacity-50 w-1/2";
    }
  };

  return (
    <div className="bg-warm-white p-5 border border-soft-sepia rounded-sm shadow-sm flex flex-col justify-between transition-transform hover:shadow-md hover:border-accent/30 group">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-soft-sepia/30 rounded-sm group-hover:bg-accent/10 transition-colors">
          {getSkillIcon(skill)}
        </div>
        <h3 className="font-serif text-lg text-charcoal group-hover:text-accent transition-colors break-words line-clamp-2 leading-tight">{skill.name}</h3>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] uppercase tracking-[0.1em] text-muted font-mono">{skill.level}</span>
        </div>
        <div className="h-1 w-full bg-soft-sepia/30 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${getLevelColor(skill.level)}`} />
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
