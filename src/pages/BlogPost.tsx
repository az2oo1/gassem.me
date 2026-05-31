import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Article } from "../types";
import { ArrowLeft, Calendar } from "lucide-react";
import Markdown from "react-markdown";

export default function BlogPost() {
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
        <h2 className="font-serif text-3xl mb-4 text-charcoal">Article Not Found</h2>
        <p className="text-charcoal-light mb-8">{error || "The article you're looking for doesn't exist."}</p>
        <Link to="/blog" className="inline-flex items-center text-[10px] uppercase font-semibold tracking-widest text-accent hover:text-charcoal transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Writings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl animate-fade-in mx-auto">
      <Link to="/blog" className="inline-flex items-center text-[10px] uppercase font-semibold tracking-widest text-muted hover:text-charcoal transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Writings
      </Link>
      
      <div className="mb-10">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-muted mb-4">
          <Calendar className="w-3 h-3" />
          {new Date(article.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-charcoal mb-6 leading-tight">{article.title}</h1>
      </div>

      <div className="prose prose-sm sm:prose-base prose-neutral max-w-none font-serif text-charcoal-light leading-relaxed mb-16">
        <Markdown>{article.content}</Markdown>
      </div>
    </div>
  );
}
