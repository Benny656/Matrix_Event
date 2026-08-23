"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"

import GlassNav from "@/components/shared/GlassNav"
import ShimmerText from "@/components/kokonutui/shimmer-text"
import { Dock, DockIcon } from "@/components/magicui/dock"
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

const GLYPHS = "!<>-_\\/[]{}—=+*^?#_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const FULL_TITLE = "Machine Learning Association for Technical Research and Excellence"

function ScrambleText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text)

  useEffect(() => {
    let frame = 0
    let interval: NodeJS.Timeout
    let loopTimeout: NodeJS.Timeout

    const startScramble = () => {
      frame = 0
      clearInterval(interval)
      interval = setInterval(() => {
        let output = ""
        let complete = 0

        for (let i = 0; i < text.length; i++) {
          if (text[i] === " ") {
            output += " "
            complete++
            continue
          }

          const startFrame = i * 1.2
          const endFrame = startFrame + 10

          if (frame >= endFrame) {
            output += text[i]
            complete++
          } else if (frame >= startFrame) {
            output += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          } else {
            output += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          }
        }

        setDisplayText(output)
        frame++

        if (complete === text.length) {
          clearInterval(interval)
          setDisplayText(text)
          loopTimeout = setTimeout(startScramble, 4000)
        }
      }, 30)
    }

    startScramble()

    return () => {
      clearInterval(interval)
      clearTimeout(loopTimeout)
    }
  }, [text])

  return <span>{displayText}</span>
}

function CountUp({ end = 400, duration = 1.8 }: { end?: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    let frameId: number

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * end))

      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      } else {
        setCount(end)
      }
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [end, duration])

  return <span>{count}</span>
}

const STEPS = [
  {
    number: "01",
    title: "Login",
    desc: "Sign in with your Karunya college email via Google.",
    emoji: "🔑",
    rotate: "-rotate-2",
    color: "bg-[#73FFFF]",
  },
  {
    number: "02",
    title: "Register",
    desc: "Browse events made for you and claim your spot.",
    emoji: "📋",
    rotate: "rotate-1",
    color: "bg-white",
  },
  {
    number: "03",
    title: "Attend",
    desc: "Show up, get scanned in by a volunteer at the door.",
    emoji: "📷",
    rotate: "-rotate-1",
    color: "bg-[#39A8AD]",
  },
  {
    number: "04",
    title: "Track",
    desc: "Check your own attendance and registrations anytime.",
    emoji: "✅",
    rotate: "rotate-2",
    color: "bg-[#00666B]",
  },
]

const HOW_STEPS = [
  {
    number: "01",
    title: "Login",
    desc: "Sign in with your Karunya college email via Google. No passwords, no friction — just your institutional account.",
    detail: "Works on any device. Your profile is created automatically on first sign in.",
    emoji: "🔑",
  },
  {
    number: "02",
    title: "Register",
    desc: "Browse events filtered specifically for your year, program, and department. Claim your spot in one tap.",
    detail: "If an event is full you join the waitlist automatically and get promoted when a slot opens.",
    emoji: "📋",
  },
  {
    number: "03",
    title: "Attend",
    desc: "Show up to the event. A volunteer scans your student ID barcode at the door to mark you present.",
    detail: "No app needed at the door — your physical ID card is your ticket.",
    emoji: "📷",
  },
  {
    number: "04",
    title: "Track",
    desc: "Check your attendance and registration history anytime from your dashboard.",
    detail: "See which sessions you attended and access your WhatsApp community link post-registration.",
    emoji: "✅",
  },
]

function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const section = sectionRef.current
    if (!section) return

    const steps = gsap.utils.toArray<HTMLElement>(".how-step")
    const tabs = gsap.utils.toArray<HTMLElement>(".how-tab")
    const line = section.querySelector<HTMLElement>(".progress-line")

    // Set initial state — all steps hidden except first
    steps.forEach((step, i) => {
      gsap.set(step, {
        opacity: i === 0 ? 1 : 0,
        y: i === 0 ? 0 : 20,
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
      })
    })

    tabs.forEach((tab, i) => {
      gsap.set(tab, { opacity: i === 0 ? 1 : 0.35, scale: i === 0 ? 1.03 : 1 })
    })

    if (line) gsap.set(line, { scaleY: 0, transformOrigin: "top center" })

    // Create the timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=1100",
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
      },
    })

    // Progress line grows as we scroll
    tl.to(line, { scaleY: 1, ease: "none" }, 0)

    // Step transitions — each step gets equal scroll travel
    steps.forEach((step, i) => {
      if (i === 0) return // first step is already visible

      const prev = steps[i - 1]
      const prevTab = tabs[i - 1]
      const currTab = tabs[i]

      const start = i * 0.25
      const transitionDuration = 0.08

      // Fade out previous step
      tl.to(prev, { opacity: 0, y: -20, duration: transitionDuration, ease: "power2.in" }, start)
      tl.to(prevTab, { opacity: 0.35, scale: 1, duration: transitionDuration }, start)

      // Fade in current step
      tl.fromTo(
        step,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: transitionDuration, ease: "power2.out" },
        start + transitionDuration * 0.5
      )
      tl.to(currTab, { opacity: 1, scale: 1.03, duration: transitionDuration }, start + transitionDuration * 0.5)
    })

    // Hold last step visible until end
    tl.to({}, { duration: 0.25 })

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative z-10 bg-transparent min-h-screen flex flex-col justify-center px-4 sm:px-8 py-12 sm:py-16"
    >
      <div className="max-w-3xl mx-auto w-full">

        {/* Section Header */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <div className="inline-block rotate-1 bg-[#051B1D] text-[#73FFFF] font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_#39A8AD] mb-3">
            The Dummy&apos;s Guide
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[hsl(var(--text-primary))] leading-tight">
            How this{" "}
            <span className="text-[#00666B] dark:text-[#73FFFF]">works.</span>
          </h2>
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
          {HOW_STEPS.map((step) => (
            <div
              key={step.number}
              className="how-tab flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/60 backdrop-blur-sm"
            >
              <span className="text-xs sm:text-sm font-mono font-bold text-[#00666B] dark:text-[#73FFFF]">
                {step.number}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[hsl(var(--text-primary))] hidden sm:inline">
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Steps + Progress Line */}
        <div className="flex gap-4 sm:gap-8 items-stretch">

          {/* Left: vertical progress line */}
          <div className="relative w-px bg-[hsl(var(--border))] shrink-0 rounded-full" style={{ minHeight: "220px" }}>
            <div
              className="progress-line absolute top-0 left-0 w-full bg-[#00666B] rounded-full"
              style={{ height: "100%" }}
            />
          </div>

          {/* Right: step cards */}
          <div className="relative flex-1" style={{ minHeight: "220px" }}>
            {HOW_STEPS.map((step) => (
              <div key={step.number} className="how-step">
                <div className="relative overflow-hidden glass rounded-3xl p-6 sm:p-10 border border-[hsl(var(--border))] shadow-2xl bg-[hsl(var(--surface))]/90 backdrop-blur-xl">
                  <span className="pointer-events-none select-none absolute -right-4 -bottom-6 sm:-right-2 sm:-bottom-8 text-8xl sm:text-9xl font-black font-mono text-[hsl(var(--text-primary))]/5">
                    {step.number}
                  </span>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#00666B]/15 dark:bg-[#73FFFF]/10 border border-[#00666B]/30 flex items-center justify-center text-3xl sm:text-4xl shrink-0">
                        {step.emoji}
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-[#00666B] dark:text-[#73FFFF] uppercase tracking-widest px-3 py-0.5 rounded-full bg-[#00666B]/10 border border-[#00666B]/20 block mb-1">
                          Step {step.number}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black text-[hsl(var(--text-primary))]">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-base sm:text-xl text-[hsl(var(--text-primary))] font-medium leading-relaxed mb-3 max-w-2xl">
                      {step.desc}
                    </p>
                    <p className="text-xs sm:text-sm text-[hsl(var(--text-secondary))] leading-relaxed max-w-xl">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

const LinkedInIcon = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const InstagramIcon = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

const EmailIcon = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
)

const SOCIAL_DOCK = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/matrix-karunya",
    icon: LinkedInIcon,
    label: "@matrix-karunya",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/matrixkarunya",
    icon: InstagramIcon,
    label: "@matrixkarunya",
  },
  {
    name: "Email",
    href: "mailto:matrixkarunya@gmail.com",
    icon: EmailIcon,
    label: "matrixkarunya@gmail.com",
  },
]

export default function LandingPage() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains("dark"))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  // Initialize Lenis smooth scrolling
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    })

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove((time) => lenis.raf(time * 1000))
    }
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden relative">

      {/* NAV */}
      <GlassNav
        links={[
          { label: "How it works", href: "#how-it-works" },
          { label: "Connect", href: "#connect" },
        ]}
        rightSlot={
          <Link href="/login">
            <InteractiveHoverButton className="text-xs py-1.5 px-4 sm:px-5 h-8 bg-transparent border-none">
              Sign In
            </InteractiveHoverButton>
          </Link>
        }
      />

      {/* HERO */}
      <section className="relative z-10 px-4 sm:px-8 pt-24 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 max-w-6xl mx-auto bg-transparent">
        <div className="max-w-3xl">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-1 sm:gap-2 mb-4"
          >
            <span className="text-lg sm:text-2xl md:text-3xl font-bold text-[hsl(var(--text-secondary))] tracking-tight">
              The event platform for
            </span>
            <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[1.05] tracking-tight">
              <ShimmerText text="AIML at Karunya." duration={8} />
            </span>
          </motion.h1>

          {/* M.A.T.R.I.X Scramble Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
            className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 mb-6"
          >
            <span className="text-base sm:text-xl md:text-2xl font-black text-[hsl(var(--accent-light))] uppercase tracking-widest shrink-0 font-mono">
              M.A.T.R.I.X —
            </span>
            <span className="text-base sm:text-xl md:text-2xl font-black text-[hsl(var(--text-primary))] uppercase tracking-wide font-mono">
              <ScrambleText text={FULL_TITLE} />
            </span>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
            className="text-[hsl(var(--text-secondary))] text-sm sm:text-base font-medium max-w-md mb-8 leading-relaxed"
          >
            Register for workshops, track attendance, and stay current with department events — built for the next generation of builders.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
          >
            <Link href="/login" className="inline-block">
              <InteractiveHoverButton className="w-full sm:w-auto text-sm py-3.5 px-7 shadow-sm">
                Access Event Portal
              </InteractiveHoverButton>
            </Link>
            <Link href="/login" className="inline-block">
              <InteractiveHoverButton className="w-full sm:w-auto text-sm py-3.5 px-7 shadow-sm bg-[hsl(var(--surface))]">
                Sign in with College Email
              </InteractiveHoverButton>
            </Link>
          </motion.div>

          {/* Students Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            transition={{ duration: 0.6, delay: 0.7, type: "spring", stiffness: 180 }}
            className="mt-8 inline-flex items-center bg-[#73FFFF] border-2 border-black rounded-2xl px-6 py-3.5 shadow-[5px_5px_0px_#000]"
          >
            <span className="font-black text-xl sm:text-2xl text-[#051B1D] uppercase tracking-wide">
              <CountUp end={400} />+ Students
            </span>
          </motion.div>
        </div>
      </section>

      {/* DIVIDER 1 */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative z-10 origin-left w-full h-px bg-[hsl(var(--border))]"
      />

      {/* HOW IT WORKS — scroll-driven timeline */}
      <HowItWorksSection />

      {/* DIVIDER 2 */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative z-10 origin-left w-full h-px bg-[hsl(var(--border))]"
      />

      {/* SOCIAL LINKS */}
      <section id="connect" className="relative z-10 bg-transparent px-4 sm:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl mx-auto flex flex-col items-center text-center"
        >
          <div className="inline-block -rotate-1 bg-[#00666B] text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] mb-6">
            Find Us Online
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-[hsl(var(--text-primary))] leading-tight mb-4">
            Connect with<br />
            <span className="text-[hsl(var(--accent))]">Matrix AIML.</span>
          </h2>

          <p className="text-sm text-[hsl(var(--text-secondary))] mb-12 max-w-sm leading-relaxed">
            Stay updated with events, announcements, and department news across our official channels.
          </p>

          <TooltipProvider>
            <Dock
              direction="middle"
              className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] shadow-lg backdrop-blur-sm px-6 py-3"
            >
              {SOCIAL_DOCK.map((item, i) => (
                <DockIcon key={item.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.name}
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--accent-subtle))] text-[hsl(var(--text-primary))] hover:text-[hsl(var(--accent))] transition-all duration-200"
                      >
                        <item.icon className="w-5 h-5" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="flex flex-col items-center gap-0.5">
                      <p className="font-semibold text-xs">{item.name}</p>
                      <p className="text-xs text-[hsl(var(--text-tertiary))]">{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </DockIcon>
              ))}
            </Dock>
          </TooltipProvider>

          {/* Platform labels below dock */}
          <div className="flex gap-8 sm:gap-16 mt-6">
            {SOCIAL_DOCK.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 group"
              >
                <span className="text-xs font-semibold text-[hsl(var(--text-secondary))] group-hover:text-[hsl(var(--accent))] transition-colors">
                  {item.name}
                </span>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))] group-hover:text-[hsl(var(--text-secondary))] transition-colors hidden sm:block">
                  {item.label}
                </span>
              </a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* DIVIDER 3 */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative z-10 origin-left w-full h-px bg-[hsl(var(--border))]"
      />

      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 px-4 sm:px-8 py-6 bg-[#051B1D]"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo-dark.svg" alt="Matrix" width={24} height={24} className="object-contain" />
            <p className="text-[#73FFFF] font-black text-xs uppercase tracking-widest">
              Matrix · AIML · Karunya © {new Date().getFullYear()}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/70 font-medium">
            <span>Developed by</span>
            <a
              href="https://benny656.github.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#73FFFF] font-black hover:underline"
            >
              Benny Manuel
            </a>
            <a
              href="https://www.linkedin.com/in/benman656"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-[#73FFFF] hover:opacity-80 transition-opacity flex items-center"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </motion.footer>
    </main>
  )
}
