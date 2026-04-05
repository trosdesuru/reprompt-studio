"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  y?: number;
}

export function FadeIn({ children, duration = 0.5, delay = 0, y = 10 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
}
