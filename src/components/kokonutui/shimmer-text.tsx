"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Text_01Props {
  text?: string;
  children?: React.ReactNode;
  className?: string;
  duration?: number;
}

export default function ShimmerText({
  text = "Text Shimmer",
  children,
  className,
  duration = 8,
}: Text_01Props) {
  return (
    <motion.span
      animate={{
        backgroundPosition: ["200% center", "-200% center"],
      }}
      className={cn(
        "inline-block bg-[length:200%_100%] bg-gradient-to-r from-neutral-950 via-neutral-400 to-neutral-950 bg-clip-text text-transparent dark:from-white dark:via-neutral-400 dark:to-white",
        className
      )}
      transition={{
        duration: duration,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
      }}
    >
      {children || text}
    </motion.span>
  );
}

