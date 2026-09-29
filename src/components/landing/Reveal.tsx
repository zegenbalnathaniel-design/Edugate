"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const TAGS = { div: motion.div, li: motion.li, section: motion.section };

/**
 * Scroll-triggered reveal: a one-shot blur + rise as the block enters view,
 * in the style of 21st.dev's AnimatedGroup "blur-slide" preset. Under
 * reduced motion it is a plain opacity fade (§95).
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: keyof typeof TAGS;
}) {
  const reduced = useReducedMotion();
  const Tag = TAGS[as];

  return (
    <Tag
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.8, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Tag>
  );
}
