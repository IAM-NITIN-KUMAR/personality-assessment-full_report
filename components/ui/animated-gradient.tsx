// components/ui/animated-gradient.tsx
"use client";

import { motion } from "framer-motion";

const ORBS = [
  { x: 0.15, y: 0.40, r: 0.32, color: [244, 184, 212], alpha: 0.55, rx: 0.18, ry: 0.14, duration: 35, clockwise: true },
  { x: 0.80, y: 0.22, r: 0.28, color: [196, 181, 253], alpha: 0.48, rx: 0.14, ry: 0.18, duration: 42, clockwise: false },
  { x: 0.65, y: 0.75, r: 0.25, color: [186, 230, 253], alpha: 0.40, rx: 0.16, ry: 0.12, duration: 38, clockwise: true },
  { x: 0.45, y: 0.50, r: 0.18, color: [221, 190, 253], alpha: 0.35, rx: 0.10, ry: 0.13, duration: 30, clockwise: false },
  { x: 0.30, y: 0.70, r: 0.22, color: [253, 206, 228], alpha: 0.42, rx: 0.13, ry: 0.16, duration: 48, clockwise: true },
  { x: 0.88, y: 0.62, r: 0.20, color: [167, 207, 249], alpha: 0.38, rx: 0.11, ry: 0.14, duration: 33, clockwise: false },
];

export function AnimatedGradient() {
  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      style={{
        background: "linear-gradient(135deg, #f7e8ee 0%, #efe7f4 42%, #edf2f9 100%)"
      }}
    >
      <style>{`
        .orb-blur-bg {
          filter: blur(80px);
        }
        @media (min-width: 1024px) {
          .orb-blur-bg {
            filter: blur(140px);
          }
        }
      `}</style>

      {ORBS.map((o, idx) => {
        const rx = o.rx * 100;
        const ry = o.ry * 100;
        const xValues = o.clockwise
          ? ["0vw", `${rx}vw`, "0vw", `-${rx}vw`, "0vw"]
          : ["0vw", `-${rx}vw`, "0vw", `${rx}vw`, "0vw"];
        const yValues = [
          `-${ry}vh`,
          "0vh",
          `${ry}vh`,
          "0vh",
          `-${ry}vh`
        ];

        return (
          <motion.div
            key={idx}
            className="absolute rounded-full orb-blur-bg will-change-transform"
            animate={{
              x: xValues,
              y: yValues,
              scale: [1, 1.06, 1, 0.94, 1]
            }}
            transition={{
              duration: o.duration,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundColor: `rgb(${o.color.join(",")})`,
              width: `${o.r * 2 * 100}vmin`,
              height: `${o.r * 2 * 100}vmin`,
              left: `${o.x * 100}%`,
              top: `${o.y * 100}%`,
              opacity: o.alpha,
              transformOrigin: "center",
            }}
          />
        );
      })}
    </div>
  );
}