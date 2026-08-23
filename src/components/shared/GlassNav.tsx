"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sun, Moon, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FluidGlass } from "@/components/shared/FluidGlass";

interface NavLink {
  label: string;
  href: string;
}

interface GlassNavProps {
  links?: NavLink[];
  rightSlot?: React.ReactNode;
}

export default function GlassNav({ links, rightSlot }: GlassNavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setDark(isDark);
  }

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMenuOpen(false);
  };

  const linkClass = (href: string) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
      pathname === href
        ? "bg-[#0d9488] text-white shadow-sm"
        : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-black/5 dark:hover:bg-white/10"
    }`;

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
      <motion.div
        initial={{ y: -32, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl pointer-events-auto"
      >
        {/* ── Main pill ── */}
        <FluidGlass className="px-4 py-2">
        <div className="flex items-center gap-2 min-w-0">

          {/* Logo + "MATRIX" word */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 group hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo-dark.svg"
              alt="Matrix logo"
              width={36}
              height={14}
              className="object-contain dark:brightness-0 dark:invert"
            />
            <span className="text-[hsl(var(--text-primary))] font-black text-xs tracking-widest uppercase leading-none">
              Matrix
            </span>
          </Link>

          {/* Desktop nav links — centred, hidden on mobile */}
          {links && links.length > 0 && (
            <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={linkClass(link.href)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-1 ml-auto shrink-0">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-black/5 dark:hover:bg-white/10 transition-all"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* rightSlot (Sign In / Sign Out) */}
            {rightSlot && (
              <div className="shrink-0 flex items-center">{rightSlot}</div>
            )}

            {/* Hamburger — mobile only */}
            {links && links.length > 0 && (
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="md:hidden p-1.5 rounded-full text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                {menuOpen ? (
                  <X className="w-3.5 h-3.5" />
                ) : (
                  <Menu className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </FluidGlass>

      {/* ── Mobile dropdown — outside FluidGlass to avoid overflow-hidden clipping ── */}
      <AnimatePresence>
        {menuOpen && links && links.length > 0 && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, scaleY: 0.85, y: -8 }}
            animate={{ opacity: 1, scaleY: 1, y: 0 }}
            exit={{ opacity: 0, scaleY: 0.85, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top" }}
            className="md:hidden mt-2 rounded-2xl border border-black/10 dark:border-[#73FFFF]/15 bg-white/95 dark:bg-[#073b3e]/90 backdrop-blur-xl shadow-lg overflow-hidden"
          >
            <nav className="flex flex-col p-2 gap-0.5">
              {links.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.18, ease: "easeOut" }}
                >
                  <Link
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      pathname === link.href
                        ? "bg-[#0d9488] text-white"
                        : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
}
