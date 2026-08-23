"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Sun, Moon } from "lucide-react"
import { signOutAction } from "@/actions/auth"
import { cn } from "@/lib/utils"

interface NavLink {
  label: string
  href: string
}

interface HeaderProps {
  role: "student" | "volunteer" | "admin"
  userName?: string
  userImage?: string
}

const navLinks: Record<string, NavLink[]> = {
  student: [
    { label: "Dashboard", href: "/student" },
    { label: "Events", href: "/student/events" },
    { label: "Registrations", href: "/student/registrations" },
  ],
  volunteer: [
    { label: "Dashboard", href: "/volunteer" },
    { label: "Events", href: "/volunteer/events" },
    { label: "Scanner", href: "/volunteer/attendance" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin" },
    { label: "Events", href: "/admin/events" },
    { label: "Users", href: "/admin/users" },
    { label: "Reports", href: "/admin/reports" },
  ],
}

export default function Header({ role, userName, userImage }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark")
      setDark(true)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle("dark")
    localStorage.setItem("theme", isDark ? "dark" : "light")
    setDark(isDark)
  }

  async function handleSignOut() {
    await signOutAction()
    router.push("/login")
  }

  const links = navLinks[role]

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "glass border-b border-[hsl(var(--border))]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href={`/${role}`} className="flex items-center gap-2.5 shrink-0">
            <Image
              src={dark ? "/logo-dark.svg" : "/logo-light.svg"}
              alt="Matrix"
              width={28}
              height={28}
              className="object-contain"
            />
            <div>
              <p className="font-bold text-sm text-[hsl(var(--text-primary))] leading-none tracking-tight">MATRIX</p>
              <p className="text-[9px] font-medium text-[hsl(var(--accent))] uppercase tracking-widest leading-none mt-0.5">AIML · Karunya</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === link.href
                    ? "bg-[hsl(var(--accent-subtle))] text-[hsl(var(--accent))]"
                    : "text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface))]"
                )}
              >
                {link.label}
              </Link>
            ))}

            {role === "admin" && (
              <Link href="/admin/events/new">
                <button className="ml-2 px-4 py-2 bg-[hsl(var(--accent))] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all">
                  + New Event
                </button>
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface))] transition-all"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Avatar + sign out — desktop */}
            <div className="hidden md:flex items-center gap-2">
              {userImage ? (
                <img src={userImage} alt={userName} className="w-8 h-8 rounded-full object-cover border border-[hsl(var(--border))]" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--accent-subtle))] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold">
                  {userName?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-sm font-medium text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface))] rounded-lg transition-all"
              >
                Sign out
              </button>
            </div>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface))] transition-all"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 glass border-b border-[hsl(var(--border))] px-4 py-4"
          >
            <nav className="flex flex-col gap-1 mb-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    pathname === link.href
                      ? "bg-[hsl(var(--accent-subtle))] text-[hsl(var(--accent))]"
                      : "text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--surface))] hover:text-[hsl(var(--text-primary))]"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {role === "admin" && (
                <Link
                  href="/admin/events/new"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-semibold bg-[hsl(var(--accent))] text-white mt-1"
                >
                  + New Event
                </Link>
              )}
            </nav>

            <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))]">
              <div className="flex items-center gap-2">
                {userImage ? (
                  <img src={userImage} alt={userName} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--accent-subtle))] flex items-center justify-center text-[hsl(var(--accent))] text-xs font-bold">
                    {userName?.[0]?.toUpperCase() ?? "U"}
                  </div>
                )}
                <span className="text-sm font-medium text-[hsl(var(--text-primary))]">{userName}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--destructive))] transition-colors"
              >
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16" />
    </>
  )
}