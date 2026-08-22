"use client"

import { useEffect, useRef } from "react"

interface TechItem {
  id: string
  name: string
  bg: string
  icon: React.ReactNode
}

const TECH_ITEMS: TechItem[] = [
  {
    id: "python",
    name: "Python",
    bg: "bg-[#FFDE59]",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M11.9 2C8.2 2 8.4 3.6 8.4 3.6L8.4 5.2H12.1V5.7H5.3C5.3 5.7 2 5.3 2 9.5C2 13.7 4.9 13.5 4.9 13.5H6.5V11.9C6.5 10 8.1 10 8.1 10H11.8C13.5 10 13.7 8.5 13.7 8.5V3.8C13.7 3.8 14.1 2 11.9 2ZM10.2 3.5C10.6 3.5 11 3.9 11 4.3C11 4.7 10.6 5.1 10.2 5.1C9.8 5.1 9.4 4.7 9.4 4.3C9.4 3.9 9.8 3.5 10.2 3.5Z"
          fill="#00666B"
          stroke="#000"
          strokeWidth="1"
        />
        <path
          d="M12.1 22C15.8 22 15.6 20.4 15.6 20.4V18.8H11.9V18.3H18.7C18.7 18.3 22 18.7 22 14.5C22 10.3 19.1 10.5 19.1 10.5H17.5V12.1C17.5 14 15.9 14 15.9 14H12.2C10.5 14 10.3 15.5 10.3 15.5V20.2C10.3 20.2 9.9 22 12.1 22ZM13.8 20.5C13.4 20.5 13 20.1 13 19.7C13 19.3 13.4 18.9 13.8 18.9C14.2 18.9 14.6 19.3 14.6 19.7C14.6 20.1 14.2 20.5 13.8 20.5Z"
          fill="#051B1D"
          stroke="#000"
          strokeWidth="1"
        />
      </svg>
    ),
  },
  {
    id: "js",
    name: "JS",
    bg: "bg-[#FFE600]",
    icon: (
      <span className="font-black text-[13px] tracking-tighter text-[#051B1D]">
        JS
      </span>
    ),
  },
  {
    id: "react",
    name: "React",
    bg: "bg-[#73FFFF]",
    icon: (
      <svg className="w-6 h-6 animate-spin" style={{ animationDuration: "12s" }} viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#051B1D" strokeWidth="2" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" stroke="#051B1D" strokeWidth="2" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" stroke="#051B1D" strokeWidth="2" />
        <circle cx="12" cy="12" r="2.5" fill="#00666B" stroke="#000" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: "html",
    name: "HTML",
    bg: "bg-[#FF6B4A]",
    icon: (
      <span className="font-black text-[11px] text-white tracking-tighter flex items-center">
        &lt;/&gt;
      </span>
    ),
  },
  {
    id: "css",
    name: "CSS",
    bg: "bg-[#38BDF8]",
    icon: (
      <span className="font-black text-[12px] text-[#051B1D] tracking-tighter">
        &#123; # &#125;
      </span>
    ),
  },
  {
    id: "cplusplus",
    name: "C++",
    bg: "bg-[#C084FC]",
    icon: (
      <span className="font-black text-[12px] text-[#051B1D] tracking-tight">
        C++
      </span>
    ),
  },
  {
    id: "c",
    name: "C",
    bg: "bg-[#93C5FD]",
    icon: (
      <span className="font-black text-[14px] text-[#051B1D]">
        [C]
      </span>
    ),
  },
  {
    id: "linux",
    name: "Linux",
    bg: "bg-white",
    icon: (
      <span className="text-base" role="img" aria-label="Linux">
        🐧
      </span>
    ),
  },
  {
    id: "git",
    name: "Git",
    bg: "bg-[#FF8400]",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <circle cx="6" cy="6" r="3" fill="#051B1D" stroke="#000" strokeWidth="1.5" />
        <circle cx="18" cy="10" r="3" fill="#051B1D" stroke="#000" strokeWidth="1.5" />
        <circle cx="6" cy="18" r="3" fill="#051B1D" stroke="#000" strokeWidth="1.5" />
        <path d="M6 9V15" stroke="#051B1D" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M6 9C6 13 18 10 18 10" stroke="#051B1D" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "sql",
    name: "SQL",
    bg: "bg-[#34D399]",
    icon: (
      <div className="flex flex-col items-center justify-center gap-[2px]">
        <div className="w-5 h-1.5 rounded-full border border-black bg-[#051B1D]" />
        <div className="w-5 h-1.5 rounded-full border border-black bg-[#00666B]" />
        <div className="w-5 h-1.5 rounded-full border border-black bg-[#73FFFF]" />
      </div>
    ),
  },
]

export default function TechOrbit() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const icons = containerRef.current?.querySelectorAll<HTMLDivElement>(".orbit-icon")
    if (!icons) return

    const n = icons.length
    const R = 130
    const orbits = Array.from({ length: n }, (_, i) => ({
      tilt: (i * 137.5 * Math.PI) / 180,
      phi: Math.acos(-1 + (2 * i) / n),
      speed: 0.18 + (i % 3) * 0.04,
    }))

    let t = 0
    let frame: number

    const tick = () => {
      t += 0.006
      orbits.forEach((o, i) => {
        const angle = t * o.speed + o.tilt
        const x = R * Math.sin(o.phi) * Math.cos(angle)
        const y = R * Math.cos(o.phi)
        const z = R * Math.sin(o.phi) * Math.sin(angle)
        const scale = (z + R * 1.4) / (R * 2.4)
        icons[i].style.transform = `translate3d(${x}px,${y}px,${z}px) scale(${0.75 + scale * 0.45})`
        icons[i].style.opacity = String(0.45 + scale * 0.55)
        icons[i].style.zIndex = String(Math.round(z + 200))
      })
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      style={{ perspective: "900px" }}
      className="relative w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] flex items-center justify-center select-none pointer-events-none"
      ref={containerRef}
    >
      {/* Center Core Badge */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-[#051B1D] border-2 border-black flex flex-col items-center justify-center shadow-[4px_4px_0px_#000] z-10">
        <span className="text-[11px] font-black text-[#73FFFF] uppercase tracking-widest leading-tight">AIML</span>
        <span className="text-[8px] font-bold text-white/70 uppercase tracking-wider">CORE</span>
      </div>

      {/* Orbiting Cartoon Brutalist Icons */}
      {TECH_ITEMS.map((item) => (
        <div
          key={item.id}
          className={`orbit-icon absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex flex-col items-center justify-center rounded-xl border-2 border-black ${item.bg} shadow-[3px_3px_0px_#000] hover:scale-110 transition-transform`}
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
          title={item.name}
        >
          {item.icon}
        </div>
      ))}
    </div>
  )
}
