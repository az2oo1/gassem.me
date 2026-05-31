import React, { useState, useRef, useEffect } from "react";
import * as FaIcons from "react-icons/fa";
import * as SiIcons from "react-icons/si";
import * as LucideIcons from "lucide-react";

// For Social or Skills, combine some popular ones
const POPULAR_ICONS = [
  ...Object.keys(FaIcons).filter(k => k.startsWith("Fa")),
  ...Object.keys(SiIcons).filter(k => k.startsWith("Si")),
  ...Object.keys(LucideIcons).filter(k => /^[A-Z]/.test(k)) // e.g. Github, Twitter
];

export function IconCombobox({ 
  value, 
  onChange, 
  placeholder = "Search icons..." 
}: { 
  value: string; 
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = POPULAR_ICONS.filter(k => k.toLowerCase().includes(search.toLowerCase())).slice(0, 50);

  const getDynamicIcon = (name: string) => {
    if (name in FaIcons) {
      const Icon = (FaIcons as any)[name];
      return <Icon />;
    }
    if (name in SiIcons) {
      const Icon = (SiIcons as any)[name];
      return <Icon />;
    }
    if (name in LucideIcons) {
      const Icon = (LucideIcons as any)[name];
      return <Icon />;
    }
    return null;
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <div className="absolute left-3 text-muted">
          {value ? getDynamicIcon(value) : <LucideIcons.Search className="w-4 h-4" />}
        </div>
        <input
          type="text"
          className="input-field !pl-10 cursor-text"
          placeholder={placeholder}
          value={open ? search : value}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setSearch("");
            setOpen(true);
          }}
        />
      </div>
      
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-warm-white border border-soft-sepia rounded-sm shadow-xl max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-charcoal-light text-center">No icons found.</div>
          ) : (
            <div className="grid grid-cols-5 md:grid-cols-8 gap-2 p-2">
              {filtered.map(iconName => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                  }}
                  className="flex flex-col flex-wrap items-center justify-center p-2 hover:bg-soft-sepia/30 rounded-sm transition-colors text-charcoal truncate"
                  title={iconName}
                >
                  <div className="text-xl mb-1 text-accent">
                    {getDynamicIcon(iconName)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
