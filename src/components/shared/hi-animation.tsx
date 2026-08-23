"use client";

import { Lottie } from "lottie-react";
import hiAnimation from "../../../public/animations/hi.json";

export default function HiAnimation({ className }: { className?: string }) {
  return (
    <Lottie
      src={hiAnimation}
      autoplay
      loop
      className={className || "w-full h-full object-contain"}
    />
  );
}
