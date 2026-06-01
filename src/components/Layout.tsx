import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Camera,
  Code,
  Home,
  User,
  Sun,
  Moon,
  BookOpen,
  Menu,
  X,
  Languages,
} from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";

export default function Layout() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    if (stored === "dark" || (!stored && prefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  // Close sidebar when escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  const navLinks = [
    { name: t("nav.home"), path: "/", icon: <Home className="w-4 h-4" /> },
    {
      name: t("nav.projects"),
      path: "/projects",
      icon: <Code className="w-4 h-4" />,
    },
    {
      name: t("nav.gallery"),
      path: "/gallery",
      icon: <Camera className="w-4 h-4" />,
    },
    {
      name: t("nav.blog"),
      path: "/blog",
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-warm-white text-charcoal transition-colors duration-300">
      <header className="flex justify-between items-center px-6 md:px-12 py-4 md:py-5 border-b border-soft-sepia bg-warm-white sticky top-0 z-40">
        <div className="flex items-center gap-4 rtl:gap-8">
          <Link
            to="/"
            dir="ltr"
            className="hover:opacity-80 transition-opacity inline-flex items-center"
          >
            <img src="/logo.svg" alt="gassem.me" className="h-12 md:h-14 w-auto" />
          </Link>
        </div>

        <div className="flex items-center gap-6 sm:gap-10">
          <nav className="hidden md:flex gap-6 sm:gap-10 text-xs rtl:text-lg uppercase tracking-widest rtl:tracking-normal rtl:font-arabic font-semibold items-center">
            {navLinks.map((link) => {
              const isActive =
                location.pathname === link.path ||
                (link.path !== "/" && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={clsx(
                    "relative pb-1 transition-colors group",
                    isActive
                      ? "text-accent font-semibold"
                      : "text-charcoal-light hover:text-accent font-medium hover:font-semibold",
                  )}
                >
                  {link.name}
                  <span
                    className={clsx(
                      "absolute start-0 bottom-0 h-[1.5px] bg-accent transition-all duration-300",
                      isActive ? "w-full" : "w-0 group-hover:w-full",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <button
            onClick={toggleLanguage}
            className="p-2 text-charcoal-light hover:text-charcoal transition-colors flex items-center gap-2"
            aria-label="Toggle Language"
          >
            <Languages className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-widest font-bold hidden sm:block">
              {language === "en" ? "AR" : "EN"}
            </span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 text-charcoal-light hover:text-charcoal transition-colors"
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className={clsx(
              "md:hidden p-2 text-charcoal-light hover:text-charcoal transition-colors",
              language === "ar" ? "-ml-2" : "-mr-2",
            )}
            aria-label="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Slider Overlay */}
      <div
        className={clsx(
          "fixed inset-0 bg-charcoal/20 backdrop-blur-sm z-50 transition-opacity duration-300",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Side Slider */}
      <aside
        className={clsx(
          "fixed top-0 end-0 h-full w-72 bg-warm-white border-s border-soft-sepia z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl",
          isSidebarOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
        )}
      >
        <div className="p-6 border-b border-soft-sepia flex justify-between items-center">
          <span className="font-serif italic text-xl text-charcoal">
            {t("nav.menu")}
          </span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className={clsx(
              "p-2 text-charcoal-light hover:text-charcoal transition-colors",
              language === "ar" ? "-ml-2" : "-mr-2",
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex flex-col p-6 gap-2">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path !== "/" && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.name}
                to={link.path}
                className={clsx(
                  "flex items-center gap-4 p-3 rounded-sm transition-colors text-xs rtl:text-lg uppercase tracking-widest rtl:tracking-normal rtl:font-arabic font-semibold",
                  isActive
                    ? "bg-soft-sepia/30 text-accent"
                    : "text-charcoal-light hover:bg-soft-sepia/20 hover:text-charcoal",
                )}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-6 border-t border-soft-sepia">
          <Link
            to="/admin/dashboard"
            className="text-[10px] uppercase tracking-widest font-medium text-muted hover:text-accent transition-colors block py-2"
          >
            {t("nav.adminLogin")}
          </Link>
        </div>
      </aside>

      <main className="flex-grow w-full max-w-7xl mx-auto px-6 md:px-12 py-12 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="px-6 md:px-12 py-6 bg-warm-white border-t border-soft-sepia flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
        <p className="text-[10px] tracking-widest uppercase font-medium text-muted">
          © {new Date().getFullYear()} Abdulaziz — {t("footer.crafted")}
        </p>
        <div className="flex items-center gap-3">
          <div className="h-[1px] w-8 bg-accent hidden md:block"></div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-charcoal-light">
            Portfolio 1.0
          </span>
        </div>
        <Link
          to="/admin/dashboard"
          className="hidden md:block text-[10px] uppercase tracking-widest border-b border-transparent hover:border-accent font-medium text-muted hover:text-accent transition-colors"
        >
          {t("nav.adminLogin")}
        </Link>
      </footer>
    </div>
  );
}
