import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  dir: "ltr" | "rtl";
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  "nav.home": { en: "Home", ar: "الرئيسية" },
  "nav.projects": { en: "Projects", ar: "المشاريع" },
  "nav.gallery": { en: "Gallery", ar: "المعرض" },
  "nav.blog": { en: "Blog", ar: "المدونة" },
  "nav.menu": { en: "Menu", ar: "القائمة" },
  "nav.adminLogin": { en: "Admin Login", ar: "تسجيل دخول المشرف" },
  "footer.crafted": { en: "Crafted in Saudi Arabia", ar: "صُنع في السعودية" },
  "footer.portfolio": { en: "Portfolio & Lens", ar: "معرض الأعمال والعدسة" },
  "home.bio": { en: "Full-stack developer blending technical precision with a passion for visual storytelling through photography.", ar: "مطور واجهات متكامل يدمج الدقة التقنية مع الشغف بسرد القصص المرئية من خلال التصوير الفوتوغرافي." },
  "home.viewResume": { en: "View Resume", ar: "عرض السيرة الذاتية" },
  "home.coreExpertise": { en: "Core Expertise", ar: "الخبرات الأساسية" },
  "home.skillsTitle": { en: "Skills & Experience", ar: "المهـارات والخبـرات" },
  "home.skillsDesc": { en: "Core technical capabilities and proficiencies.", ar: "القدرات التقنية الأساسية والكفاءات." },
  "projects.title": { en: "Projects", ar: "المشـاريـــع" },
  "projects.desc": { en: "A selection of recent development work, software engineering projects, and technical experiments.", ar: "مجموعة من أعمال التطوير الأخيرة، مشاريع هندسة البرمجيات، والتجارب التقنية." },
  "projects.count": { en: "Repositories", ar: "مستودعات" },
  "projects.empty": { en: "No projects to display yet.", ar: "لا توجد مشاريع لعرضها بعد." },
  "projects.unspecified": { en: "Unspecified stack", ar: "لم يتم تحديد التقنيات" },
  "gallery.title": { en: "Gallery", ar: "المـعـرض" },
  "gallery.desc": { en: "A curated selection of photography.", ar: "مجموعة مختارة بعناية من الصور." },
  "gallery.count": { en: "Plates", ar: "لوحة" },
  "gallery.error": { en: "Could not load the gallery.", ar: "تعذر تحميل المعرض." },
  "gallery.empty": { en: "No plates have been registered yet.", ar: "لم يتم تسجيل أي لوحات حتى الان." },
  "gallery.upload": { en: "Upload the first plate", ar: "ارفع أول لوحة" },
  "blog.title": { en: "Writings", ar: "المقـالات" },
  "blog.desc": { en: "Thoughts, stories, and ideas on design, development, and the creative process.", ar: "أفكار، قصص، ومقالات حول التصميم والتطوير والإبداع." },
  "blog.count": { en: "Essays", ar: "مقالة" },
  "blog.notice": { en: "Notice", ar: "ملاحظة" },
  "blog.emptyTitle": { en: "No content yet", ar: "لا يوجد محتوى بعد" },
  "blog.emptyDesc": { en: "Check back soon for new articles and essays.", ar: "عد قريباً لقراءة مقالات جديدة." },
  "blog.read": { en: "Read Article", ar: "اقرأ المقال" },
  "blog.notFound": { en: "Article Not Found", ar: "المقال غير موجود" },
  "blog.notFoundDesc": { en: "The article you're looking for doesn't exist.", ar: "المقال الذي تبحث عنه غير موجود." },
  "blog.back": { en: "Back to Writings", ar: "العودة إلى المقالات" },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem("language");
    return (stored as Language) || "en";
  });

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "ar" : "en";
    setLanguage(nextLang);
    localStorage.setItem("language", nextLang);
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  const t = (key: string) => {
    const defaultText = key;
    return translations[key]?.[language] || defaultText;
  };

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    document.documentElement.className = document.documentElement.className.replace(/\bfont-arabic\b/g, '').trim();
    if (language === "ar") {
      document.documentElement.classList.add("font-arabic");
    }
  }, [language, dir]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, dir, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
