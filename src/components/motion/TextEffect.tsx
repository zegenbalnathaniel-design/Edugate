"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";

const TAGS = {
  p: motion.p,
  span: motion.span,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
};

/**
 * Per-word (or per-character) blur-in, after motion-primitives' TextEffect
 * as published on 21st.dev. Written in-repo because 21st.dev is not
 * reachable from the build environment; same `motion` primitives underneath.
 * Screen readers get the whole string once via aria-label.
 */
export function TextEffect({
  children,
  as = "p",
  per = "word",
  delay = 0,
  className = "",
  trigger = "mount",
}: {
  children: string;
  as?: keyof typeof TAGS;
  per?: "word" | "char";
  delay?: number;
  className?: string;
  trigger?: "mount" | "inView";
}) {
  const reduced = useReducedMotion();
  const Tag = TAGS[as];
  const segments = per === "char" ? Array.from(children) : children.split(/(\s+)/);

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: per === "char" ? 0.018 : 0.07, delayChildren: delay },
    },
  };
  const item: Variants = reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 14, filter: "blur(10px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
      };

  const play =
    trigger === "inView"
      ? { whileInView: "visible", viewport: { once: true, margin: "0px 0px -10% 0px" } }
      : { animate: "visible" };

  return (
    <Tag className={className} initial="hidden" variants={container} aria-label={children} {...play}>
      {segments.map((seg, i) =>
        /^\s+$/.test(seg) ? (
          seg
        ) : (
          <motion.span key={i} variants={item} aria-hidden className="inline-block whitespace-pre">
            {seg}
          </motion.span>
        ),
      )}
    </Tag>
  );
}
