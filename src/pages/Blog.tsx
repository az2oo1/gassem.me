import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ScrollText, PenTool } from "lucide-react";

export default function Blog() {
  // We don't have api for blog yet, so we mock or just show an empty/coming soon page
  return (
    <div className="space-y-12 animate-fade-in w-full">
      <div className="border-b border-soft-sepia pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-3 flex items-center gap-3">
            <ScrollText className="w-8 h-8 text-accent" strokeWidth={1.5} /> 
            Writings
          </h2>
          <p className="text-charcoal-light text-sm max-w-lg leading-relaxed">
            Thoughts, stories, and ideas on design, development, and the creative process.
          </p>
        </div>
        <div className="text-[10px] uppercase tracking-widest font-mono text-muted flex items-center gap-2">
          <PenTool className="w-4 h-4" strokeWidth={1.5} /> 0 Essays
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 mb-2">Notice</div>
          <h3 className="font-serif text-2xl text-charcoal mb-4">No content yet</h3>
          <p className="text-charcoal-light text-sm">Check back soon for new articles and essays.</p>
        </div>
      </div>
    </div>
  );
}
