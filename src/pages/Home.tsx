// @ts-nocheck
import React, { useEffect, useState } from "react";
import { LinkItem, Skill } from "../types";
import SkillCard from "../components/SkillCard";
import { Github, Linkedin, Twitter, Mail, Link as LinkIcon, Terminal } from "lucide-react";
import * as LucideIcons from "lucide-react";
import * as FaIcons from "react-icons/fa";
import * as SiIcons from "react-icons/si";

import { motion } from "motion/react";

const getTechIcon = (name: string) => {
  if (!name) return <Terminal className="w-4 h-4" />;
  const n = name.toLowerCase();
  if (n.includes("react")) return <FaIcons.FaReact className="w-4 h-4" />;
  if (n.includes("vue")) return <FaIcons.FaVuejs className="w-4 h-4" />;
  if (n.includes("angular")) return <FaIcons.FaAngular className="w-4 h-4" />;
  if (n.includes("html")) return <FaIcons.FaHtml5 className="w-4 h-4" />;
  if (n.includes("css")) return <FaIcons.FaCss3Alt className="w-4 h-4" />;
  if (n.includes("tailwind")) return <SiIcons.SiTailwindcss className="w-4 h-4" />;
  if (n.includes("node")) return <FaIcons.FaNodeJs className="w-4 h-4" />;
  if (n.includes("express")) return <SiIcons.SiExpress className="w-4 h-4" />;
  if (n.includes("php")) return <FaIcons.FaPhp className="w-4 h-4" />;
  if (n.includes("laravel")) return <FaIcons.FaLaravel className="w-4 h-4" />;
  if (n.includes("python")) return <FaIcons.FaPython className="w-4 h-4" />;
  if (n.includes("typescript")) return <SiIcons.SiTypescript className="w-4 h-4" />;
  if (n.includes("javascript")) return <SiIcons.SiJavascript className="w-4 h-4" />;
  if (n.includes("java")) return <FaIcons.FaJava className="w-4 h-4" />;
  if (n.includes("go")) return <SiIcons.SiGo className="w-4 h-4" />;
  if (n.includes("rust")) return <SiIcons.SiRust className="w-4 h-4" />;
  if (n.includes("docker")) return <FaIcons.FaDocker className="w-4 h-4" />;
  if (n.includes("kubernetes")) return <SiIcons.SiKubernetes className="w-4 h-4" />;
  if (n.includes("aws") || n.includes("amazon")) return <FaIcons.FaAws className="w-4 h-4" />;
  if (n.includes("gcp") || n.includes("google cloud")) return <SiIcons.SiGooglecloud className="w-4 h-4" />;
  if (n.includes("firebase")) return <SiIcons.SiFirebase className="w-4 h-4" />;
  if (n.includes("mysql") || n.includes("sql")) return <SiIcons.SiMysql className="w-4 h-4" />;
  if (n.includes("postgres")) return <SiIcons.SiPostgresql className="w-4 h-4" />;
  if (n.includes("mongo")) return <SiIcons.SiMongodb className="w-4 h-4" />;
  if (n.includes("redis")) return <SiIcons.SiRedis className="w-4 h-4" />;
  if (n.includes("git")) return <FaIcons.FaGitAlt className="w-4 h-4" />;
  if (n.includes("figma")) return <FaIcons.FaFigma className="w-4 h-4" />;
  if (n.includes("android")) return <FaIcons.FaAndroid className="w-4 h-4" />;
  if (n.includes("ios") || n.includes("swift")) return <FaIcons.FaApple className="w-4 h-4" />;
  if (n.includes("flutter")) return <SiIcons.SiFlutter className="w-4 h-4" />;
  return <Terminal className="w-4 h-4" />;
};

function HeroImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setIsLoaded(true)}
      className={`${className} transition-all duration-700 ease-out ${
        isLoaded ? "blur-0" : "blur-md grayscale"
      }`}
      referrerPolicy="no-referrer"
    />
  );
}

export default function Home() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [bio, setBio] = useState("Full-stack developer blending technical precision with a passion for visual storytelling through photography.");
  const [resumeUrl, setResumeUrl] = useState("/resume.pdf");
  const [heroImage1, setHeroImage1] = useState("");
  const [heroImage2, setHeroImage2] = useState("");
  const [heroImage3, setHeroImage3] = useState("");
  const [topSkills, setTopSkills] = useState<{name: string; icon?: string}[]>([]);
  
  useEffect(() => {
    fetch("/api/links").then(res => res.json()).then(setLinks);
    fetch("/api/skills").then(res => res.json()).then(setSkills);
    fetch("/api/settings").then(res => res.json()).then(data => {
      if (data.bio) setBio(data.bio);
      if (data.resumeUrl) setResumeUrl(data.resumeUrl);
      if (data.heroImage1) setHeroImage1(data.heroImage1);
      if (data.heroImage2) setHeroImage2(data.heroImage2);
      if (data.heroImage3) setHeroImage3(data.heroImage3);
      if (data.topSkills) {
        try {
          const parsed = JSON.parse(data.topSkills);
          if (Array.isArray(parsed)) {
            setTopSkills(parsed.map(item => {
              if (typeof item === 'string') return { name: item };
              return item;
            }));
          }
        } catch {
          setTopSkills(data.topSkills.split(",").map((s: string) => ({ name: s.trim() })).filter((s: any) => s.name));
        }
      }
    });
  }, []);

  const getIcon = (iconName: string | null) => {
    if (!iconName) return <LinkIcon className="w-5 h-5" />;
    
    if (iconName in FaIcons) {
      const Icon = (FaIcons as any)[iconName]; return <Icon className="w-5 h-5" />;
    }
    if (iconName in SiIcons) {
      const Icon = (SiIcons as any)[iconName]; return <Icon className="w-5 h-5" />;
    }
    if (iconName in LucideIcons) {
      const Icon = (LucideIcons as any)[iconName]; return <Icon className="w-5 h-5" />;
    }

    switch (iconName?.toLowerCase()) {
      case "github": return <Github className="w-5 h-5" />;
      case "linkedin": return <Linkedin className="w-5 h-5" />;
      case "twitter": return <Twitter className="w-5 h-5" />;
      case "mail": return <Mail className="w-5 h-5" />;
      default: return <LinkIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col gap-12 animate-fade-in h-full pb-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-b border-soft-sepia pb-12">
        <section className="md:col-span-6 bg-transparent p-6 md:p-10 pl-0 flex flex-col justify-between">
          <div>
            <div className="mb-8 border-l-2 border-accent pl-6">
              <h1 className="font-serif text-4xl lg:text-5xl leading-tight text-charcoal mb-4">
                Abdulaziz Algassem
              </h1>
              <span className="block text-2xl text-charcoal-light font-arabic opacity-70 text-left w-full" dir="rtl" lang="ar">
                عبد العزيز القاسم
              </span>
            </div>
            
            <p className="text-charcoal-light leading-relaxed mb-10 text-base max-w-xl pl-6">
              {bio}
            </p>
            
            <div className="flex items-center gap-6 mb-8 pl-6">
              <a href={resumeUrl} target="_blank" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C2C2C] text-[#F9F7F2] dark:bg-[#F9F7F2] dark:text-[#1A1918] rounded-sm text-xs uppercase tracking-widest font-semibold hover:bg-opacity-90 transition-colors shadow-sm">
                View Resume
              </a>
              
              <div className="flex gap-4">
                {links.map(link => (
                  <a 
                    key={link.id} 
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full border border-soft-sepia/50 text-charcoal hover:text-warm-white hover:bg-accent hover:border-accent transition-all duration-300"
                  >
                    {getIcon(link.icon)}
                  </a>
                ))}
              </div>
            </div>
            {topSkills.length > 0 && (
              <div className="pl-6 mt-12 flex items-center mb-8 relative">
                <div className="relative w-48 h-48 flex items-center justify-center group mx-auto md:mx-6 shrink-0">
                  <div className="w-16 h-16 rounded-full bg-soft-sepia/20 flex items-center justify-center border border-soft-sepia/50 shadow-sm z-10 transition-transform duration-500 group-hover:scale-110">
                    <Terminal className="w-5 h-5 text-charcoal-light/50" />
                  </div>
                  
                  <motion.div 
                    className="absolute inset-0 z-20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  >
                    {topSkills.map((tag, i) => {
                      const angle = (i / topSkills.length) * 360;
                      return (
                        <div 
                          key={tag.name}
                          className="absolute left-1/2 top-1/2 -ml-5 -mt-5 flex items-center justify-center w-10 h-10 bg-warm-white border border-soft-sepia rounded-full shadow-sm text-charcoal-light group/icon hover:text-charcoal hover:border-accent hover:shadow-md transition-all duration-300 cursor-default"
                          style={{
                            transform: `rotate(${angle}deg) translateY(-5.5rem)`,
                          }}
                          title={tag.name}
                        >
                          <motion.div 
                            className="flex items-center justify-center w-full h-full group-hover/icon:scale-125 transition-transform"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                          >
                            <div style={{ transform: `rotate(-${angle}deg)` }} className="flex items-center justify-center w-5 h-5">
                              {tag.icon ? getIcon(tag.icon) : getTechIcon(tag.name)}
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                  </motion.div>
                </div>
                
                <div className="flex-1 ml-4 hidden md:block">
                   <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4 opacity-40">Core Expertise</h3>
                   <div className="flex flex-wrap gap-2">
                     {topSkills.map((tag, idx) => (
                       <span key={`${tag.name}-${idx}`} className="text-xs px-2.5 py-1.5 bg-soft-sepia/20 text-charcoal-light font-medium rounded-sm border border-soft-sepia/20 hover:bg-soft-sepia/40 transition-colors cursor-default">
                         {tag.name}
                       </span>
                     ))}
                   </div>
                </div>
              </div>
            )}
          </div>
        </section>

         <section className="md:col-span-6 bg-transparent p-6 md:p-12 flex items-center justify-center relative min-h-[350px]">
           <div className="flex flex-col -space-y-16 items-center w-full max-w-md pt-8 pb-12">
             {heroImage1 ? (
               <HeroImage src={heroImage1} alt="Hero 1" className="w-[280px] h-[186px] md:w-[320px] md:h-[213px] object-cover rounded-sm rotate-[-4deg] shadow-md border-[6px] border-warm-white z-30 transform-gpu bg-soft-sepia/20" />
             ) : (
               <div className="w-[280px] h-[186px] md:w-[320px] md:h-[213px] bg-charcoal rounded-sm rotate-[-4deg] shadow-md border-[6px] border-warm-white z-30 flex items-center justify-center font-serif text-2xl text-warm-white/20 transform-gpu">Photo 1</div>
             )}
             {heroImage2 ? (
               <HeroImage src={heroImage2} alt="Hero 2" className="w-[280px] h-[186px] md:w-[320px] md:h-[213px] object-cover rounded-sm rotate-[5deg] shadow-md border-[6px] border-warm-white z-20 ml-20 transform-gpu bg-soft-sepia/20" />
             ) : null}
             {heroImage3 ? (
               <HeroImage src={heroImage3} alt="Hero 3" className="w-[280px] h-[186px] md:w-[320px] md:h-[213px] object-cover rounded-sm rotate-[-3deg] shadow-md border-[6px] border-warm-white z-10 mr-16 transform-gpu bg-soft-sepia/20" />
             ) : null}
           </div>
        </section>
      </div>

      {skills.length > 0 && (
        <section className="bg-transparent mt-4 mb-12">
          <div className="border-b border-soft-sepia pb-6 mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl text-charcoal mb-2">Skills & Experience</h2>
              <p className="text-charcoal-light text-sm max-w-lg leading-relaxed">
                Core technical capabilities and proficiencies.
              </p>
            </div>
          </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {skills.map(skill => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
           </div>
        </section>
      )}
    </div>
  );
}
