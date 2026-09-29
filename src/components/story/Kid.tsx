"use client";

import { motion, useMotionTemplate, useTransform, type MotionValue } from "motion/react";

const INK = "#2b1310";

/**
 * The kid at the centre of the scroll story. Four expressions crossfade on
 * the same scroll progress that drives the phone, and the screen's glow on
 * his face changes colour with whichever app he is in.
 */
export function Kid({ progress, glow }: { progress: MotionValue<number>; glow: MotionValue<string> }) {
  const curious = useTransform(progress, [0, 0.14, 0.17], [1, 1, 0]);
  const confused = useTransform(progress, [0.14, 0.17, 0.5, 0.53], [0, 1, 1, 0]);
  const stressed = useTransform(progress, [0.5, 0.53, 0.82, 0.85], [0, 1, 1, 0]);
  const relieved = useTransform(progress, [0.82, 0.86], [0, 1]);
  const sweat = useTransform(progress, [0.6, 0.66, 0.82, 0.85], [0, 1, 1, 0]);
  const halo = useMotionTemplate`radial-gradient(circle at 50% 62%, ${glow} 0%, transparent 62%)`;

  return (
    <div className="relative mx-auto aspect-[240/260] w-full max-w-[260px]">
      <motion.div aria-hidden className="absolute -inset-10 blur-2xl" style={{ background: halo }} />
      <svg viewBox="0 0 240 260" className="relative h-full w-full" role="img" aria-label="A student lit by a phone screen">
        {/* hoodie */}
        <path d="M18 260 C 28 204, 78 186, 120 186 C 162 186, 212 204, 222 260 Z" fill="#1f434b" />
        <path d="M92 190 C 100 214, 140 214, 148 190" fill="none" stroke="#163239" strokeWidth="6" />
        <path d="M108 204 L 104 236 M132 204 L 136 236" stroke="#dcb574" strokeWidth="2.5" strokeLinecap="round" />
        {/* neck + head */}
        <rect x="104" y="160" width="32" height="32" rx="8" fill="#9c6445" />
        <ellipse cx="68" cy="126" rx="9" ry="13" fill="#b77b55" />
        <ellipse cx="172" cy="126" rx="9" ry="13" fill="#b77b55" />
        <ellipse cx="120" cy="120" rx="52" ry="60" fill="#c48a5f" />
        {/* screen light from below */}
        <ellipse cx="120" cy="150" rx="40" ry="26" fill="#f3e4c4" opacity="0.1" />
        {/* hair */}
        <path
          d="M64 116 C 58 62, 98 44, 126 48 C 162 52, 184 76, 176 118 C 168 94, 150 84, 128 88 C 108 92, 86 86, 64 116 Z"
          fill={INK}
        />

        <motion.g style={{ opacity: curious }} stroke={INK} strokeLinecap="round" fill="none">
          <path d="M88 104 Q100 98 112 103" strokeWidth="4" />
          <path d="M128 103 Q140 98 152 104" strokeWidth="4" />
          <circle cx="100" cy="122" r="5" fill={INK} stroke="none" />
          <circle cx="140" cy="122" r="5" fill={INK} stroke="none" />
          <path d="M108 150 Q120 157 132 150" strokeWidth="3" />
        </motion.g>

        <motion.g style={{ opacity: confused }} stroke={INK} strokeLinecap="round" fill="none">
          <path d="M88 107 Q100 105 112 107" strokeWidth="4" />
          <path d="M128 98 Q140 90 152 99" strokeWidth="4" />
          <circle cx="100" cy="123" r="4.5" fill={INK} stroke="none" />
          <circle cx="140" cy="122" r="6" fill={INK} stroke="none" />
          <path d="M106 154 Q113 149 120 154 Q127 159 134 153" strokeWidth="3" />
        </motion.g>

        <motion.g style={{ opacity: stressed }} stroke={INK} strokeLinecap="round" fill="none">
          <path d="M88 100 L112 108" strokeWidth="4" />
          <path d="M128 108 L152 100" strokeWidth="4" />
          <circle cx="100" cy="123" r="4" fill={INK} stroke="none" />
          <circle cx="140" cy="123" r="4" fill={INK} stroke="none" />
          <path d="M92 133 Q100 137 108 133 M132 133 Q140 137 148 133" stroke="#7a4a35" strokeWidth="2" />
          <path d="M106 159 Q120 148 134 159" strokeWidth="3" />
        </motion.g>
        <motion.path
          style={{ opacity: sweat }}
          d="M166 88 C 160 98, 158 104, 164 108 C 170 110, 174 104, 170 96 Z"
          fill="#7fcfc4"
        />

        <motion.g style={{ opacity: relieved }} stroke={INK} strokeLinecap="round" fill="none">
          <path d="M88 99 Q100 93 112 99" strokeWidth="4" />
          <path d="M128 99 Q140 93 152 99" strokeWidth="4" />
          <path d="M92 124 Q100 116 108 124" strokeWidth="3.5" />
          <path d="M132 124 Q140 116 148 124" strokeWidth="3.5" />
          <path d="M104 147 Q120 168 136 147 Z" fill="#6b1d17" strokeWidth="2.5" />
          <circle cx="90" cy="140" r="7" fill="#b3221c" opacity="0.25" stroke="none" />
          <circle cx="150" cy="140" r="7" fill="#b3221c" opacity="0.25" stroke="none" />
        </motion.g>
      </svg>
    </div>
  );
}
