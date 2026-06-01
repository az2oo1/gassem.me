import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Article } from "../types";
import { ArrowLeft, Calendar } from "lucide-react";
import "react-quill-new/dist/quill.snow.css";
import { useLanguage } from "../contexts/LanguageContext";

export default function BlogPost() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Article not found");
        return res.json();
      })
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex space-x-2">
          <div className="w-2 h-2 bg-accent/50 rounded-full"></div>
          <div className="w-2 h-2 bg-accent/50 rounded-full animation-delay-150"></div>
          <div className="w-2 h-2 bg-accent/50 rounded-full animation-delay-300"></div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h2 className="font-serif text-3xl mb-4 text-charcoal">
          {t("blog.notFound")}
        </h2>
        <p className="text-charcoal-light mb-8">
          {error === "Article not found"
            ? t("blog.notFoundDesc")
            : error || t("blog.notFoundDesc")}
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center text-[10px] uppercase font-semibold tracking-widest text-accent hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 rtl:rotate-180" />{" "}
          {t("blog.back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl animate-fade-in mx-auto">
      <Link
        to="/blog"
        className="inline-flex items-center text-[10px] uppercase font-semibold tracking-widest text-muted hover:text-charcoal transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 rtl:rotate-180" />{" "}
        {t("blog.back")}
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-muted mb-4 justify-end rtl:justify-start" dir="auto">
          {new Date(article.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          <Calendar className="w-3 h-3 ml-2 rtl:mr-2 rtl:ml-0" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif rtl:font-arabic text-charcoal mb-6 leading-tight text-right rtl:text-right" dir="auto">
          {article.title}
        </h1>
      </div>

      <div
        className="prose prose-sm sm:prose-base prose-neutral max-w-none font-sans rtl:font-arabic text-charcoal-light leading-relaxed mb-16 ql-editor px-0"
        dangerouslySetInnerHTML={{ __html: article.content }}
        dir="auto"
      />
    </div>
  );
}
