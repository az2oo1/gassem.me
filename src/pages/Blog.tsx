import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PenTool, Calendar, ArrowRight } from "lucide-react";
import { Article } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "motion/react";

export default function Blog() {
  const { t, language } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-12 animate-fade-in w-full">
      <div className="border-b border-soft-sepia pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 relative">
        <motion.img 
          initial={{ opacity: 0, scale: 0.8, rotate: language === "ar" ? -12 : 12 }}
          animate={{ opacity: 0.6, scale: 1, rotate: language === "ar" ? -12 : 12 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          src="/mailstamp.png" 
          alt="" 
          className="absolute -top-4 right-8 md:right-24 w-20 md:w-28 pointer-events-none rtl:right-auto rtl:left-8 md:rtl:left-24"
        />
        <div className="relative z-10">
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-3 flex items-center gap-3">
            <img src="/typewriter.png" alt="Writings" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
            {t("blog.title")}
          </h2>
          <p className="text-charcoal-light text-sm rtl:text-base max-w-lg leading-relaxed">
            {t("blog.desc")}
          </p>
        </div>
        <div className="text-[10px] uppercase tracking-widest font-mono text-muted flex items-center gap-2 pt-2 md:pt-0">
          <PenTool className="w-4 h-4" strokeWidth={1.5} /> {articles.length}{" "}
          {t("blog.count")}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-pulse flex space-x-2">
            <div className="w-2 h-2 bg-accent/50 rounded-full"></div>
            <div className="w-2 h-2 bg-accent/50 rounded-full animation-delay-150"></div>
            <div className="w-2 h-2 bg-accent/50 rounded-full animation-delay-300"></div>
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 mb-2">
              {t("blog.notice")}
            </div>
            <h3 className="font-serif text-2xl text-charcoal mb-4">
              {t("blog.emptyTitle")}
            </h3>
            <p className="text-charcoal-light text-sm">{t("blog.emptyDesc")}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/blog/${article.id}`}
              className="group block p-6 border border-soft-sepia rounded-sm bg-warm-white hover:bg-soft-sepia/20 hover:border-accent/40 hover:shadow-sm transition-all duration-300"
            >
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-muted mb-3">
                <Calendar className="w-3 h-3" />
                {new Date(article.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <h3 className="font-serif rtl:font-arabic text-xl text-charcoal mb-2 group-hover:text-accent transition-colors" dir="auto">
                {article.title}
              </h3>
              <p className="text-sm rtl:text-base text-charcoal-light line-clamp-3 mb-6" dir="auto">
                {article.excerpt}
              </p>
              <div className="text-[10px] sm:text-xs rtl:text-sm rtl:sm:text-base font-semibold uppercase tracking-widest flex items-center text-accent">
                {t("blog.read")}{" "}
                <ArrowRight className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
