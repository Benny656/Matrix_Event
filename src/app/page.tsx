"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import Lenis from "lenis"
import TechOrbit from "@/components/shared/TechOrbit"

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

const SOCIALS = [
  {
    name: "LinkedIn",
    tag: "@matrix-karunya",
    href: "https://www.linkedin.com/company/matrix-karunya",
    emoji: "💼",
    rotate: "-rotate-3",
    color: "bg-[#73FFFF]",
  },
  {
    name: "Instagram",
    tag: "@matrixkarunya",
    href: "https://www.instagram.com/matrixkarunya",
    emoji: "📸",
    rotate: "rotate-2",
    color: "bg-white",
  },
  {
    name: "Email",
    tag: "matrixkarunya@gmail.com",
    href: "mailto:matrixkarunya@gmail.com",
    emoji: "✉️",
    rotate: "-rotate-1",
    color: "bg-[#39A8AD]",
  },
]

export default function LandingPage() {
  // Initialize Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#F5F7F8] overflow-x-hidden">

      {/* NAV */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="sticky top-0 z-50 bg-[#F5F7F8]/90 backdrop-blur-sm border-b-2 border-black px-4 sm:px-8 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Matrix" width={32} height={32} className="object-contain" />
          <div>
            <p className="font-black text-[#051B1D] text-sm uppercase tracking-widest leading-none">MATRIX</p>
            <p className="text-[9px] font-bold text-[#00666B] uppercase tracking-widest leading-none">AIML · Karunya</p>
          </div>
        </div>
        <Link href="/login">
          <button className="bg-[#00666B] text-white font-black text-xs uppercase tracking-widest px-4 py-2 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
            Sign In
          </button>
        </Link>
      </motion.nav>

      {/* HERO */}
      <section className="px-4 sm:px-8 pt-12 sm:pt-16 pb-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7">
            
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 bg-[#051B1D] text-[#73FFFF] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0px_#000]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#73FFFF] animate-pulse" />
                Department of AI &amp; Machine Learning
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl md:text-7xl font-black text-[#051B1D] leading-tight mb-4"
            >
              The event platform<br />
              for AIML at<br />
              <span className="text-[#00666B]">Karunya.</span>
            </motion.h1>

            {/* M.A.T.R.I.X Scramble Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
              className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 mb-8"
            >
              <span className="text-base sm:text-xl md:text-2xl font-black text-[#39A8AD] uppercase tracking-widest shrink-0 font-mono">
                M.A.T.R.I.X —
              </span>
              <span className="text-base sm:text-xl md:text-2xl font-black text-[#051B1D] uppercase tracking-wide font-mono">
                <ScrambleText text={FULL_TITLE} />
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
              className="text-[#051B1D]/75 text-sm sm:text-base font-medium max-w-md mb-10 leading-relaxed"
            >
              Register for workshops, track attendance, and stay current with department events — built for the next generation of builders.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link href="/login">
                <button className="bg-[#00666B] text-white font-black text-sm uppercase tracking-widest px-8 py-4 border-2 border-black rounded-2xl shadow-[5px_5px_0px_#000] hover:shadow-none hover:translate-x-[5px] hover:translate-y-[5px] transition-all">
                  Access Event Portal →
                </button>
              </Link>
              <Link href="/login">
                <button className="bg-white text-[#051B1D] font-black text-sm uppercase tracking-widest px-8 py-4 border-2 border-black rounded-2xl shadow-[5px_5px_0px_#000] hover:shadow-none hover:translate-x-[5px] hover:translate-y-[5px] transition-all">
                  Sign in with College Email
                </button>
              </Link>
            </motion.div>

            {/* Students Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ duration: 0.6, delay: 0.7, type: "spring", stiffness: 180 }}
              className="mt-12 inline-flex items-center bg-[#73FFFF] border-2 border-black rounded-2xl px-6 py-3.5 shadow-[5px_5px_0px_#000]"
            >
              <span className="font-black text-xl sm:text-2xl text-[#051B1D] uppercase tracking-wide">
                <CountUp end={400} />+ Students
              </span>
            </motion.div>
          </div>

          {/* Tech Orbit with gentle entrance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
            className="lg:col-span-5 flex justify-center items-center lg:items-start lg:pt-6 py-6 lg:py-0"
          >
            <TechOrbit />
          </motion.div>
        </div>
      </section>

      {/* DIVIDER 1 */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="origin-left w-full h-1 bg-black"
      />

      {/* DUMMY'S GUIDE */}
      <section className="px-4 sm:px-8 py-20 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="inline-block rotate-1 bg-[#051B1D] text-[#73FFFF] font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_#39A8AD] mb-4">
            The Dummy's Guide
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#051B1D] leading-tight">
            How this app<br />
            <span className="text-[#00666B]">works.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.04, rotate: 0, y: -4 }}
              className={`
                ${step.color} ${step.rotate}
                border-2 border-black rounded-2xl p-6
                shadow-[5px_5px_0px_#000]
                hover:shadow-none
                transition-all duration-200 cursor-default
                ${step.number === "04" ? "text-white" : "text-[#051B1D]"}
              `}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl font-black opacity-20">{step.number}</span>
                <span className="text-3xl">{step.emoji}</span>
              </div>
              <h3 className="text-2xl font-black mb-2">{step.title}</h3>
              <p className={`text-sm font-medium leading-relaxed ${step.number === "04" ? "text-white/80" : "text-[#051B1D]/75"}`}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DIVIDER 2 */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="origin-left w-full h-1 bg-black"
      />

      {/* SOCIAL LINKS */}
      <section className="px-4 sm:px-8 py-20 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="inline-block -rotate-1 bg-[#00666B] text-white font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] mb-4">
            Find Us Online
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#051B1D] leading-tight">
            Connect with<br />
            <span className="text-[#00666B]">Matrix AIML.</span>
          </h2>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {SOCIALS.map((social, idx) => (
            <motion.a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: idx * 0.15, type: "spring", stiffness: 180 }}
              whileHover={{ scale: 1.08, rotate: 0, y: -8 }}
              className={`
                ${social.color} ${social.rotate}
                border-2 border-black rounded-2xl p-6
                shadow-[5px_5px_0px_#000]
                hover:shadow-none
                transition-all duration-200
                flex-1 w-full
              `}
            >
              <span className="text-4xl block mb-4">{social.emoji}</span>
              <h3 className="text-xl font-black text-[#051B1D] mb-1">{social.name}</h3>
              <p className="text-xs font-bold text-[#051B1D]/70">{social.tag}</p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* DIVIDER 3 */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="origin-left w-full h-1 bg-black"
      />

      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="px-4 sm:px-8 py-8 bg-[#051B1D]"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Matrix" width={24} height={24} className="object-contain invert" />
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
