"use client"

import { useEffect, useState } from "react"
import GradientWaves from "@/components/GradientWaves"

export default function GrainientBackground() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains("dark"))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full bg-[#f8fbfb] dark:bg-[#000000] transition-colors duration-500">
      <GradientWaves
        horizonColor={dark ? "#000000" : "#eef7f7"}
        waveColor={dark ? "#004d52" : "#1d787e"}
        crestColor={dark ? "#76f7f7" : "#043d42"}
        speed={0.4}
        amplitude={2.5}
        waveScale={0.6}
        waveRatio={0.9}
        swell={35}
        turbulence={20}
        tilt={1.11}
        zoom={1}
        height={5.5}
        fogDepth={15}
        detail="medium"
        brightness={1}
        opacity={dark ? 0.95 : 0.95}
        grain
        grainIntensity={0.05}
        mouseInteraction
        parallaxStrength={0.5}
      />
    </div>
  )
}
