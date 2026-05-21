"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Radar chart ───────────────────────────────────────────────────────────

export interface RadarAxis {
  key: string;
  label: string;
  /** 0..100 (clamped). */
  value: number;
}

interface RadarProps {
  axes: RadarAxis[];
  size?: number;
  /** Show the inner ring labels (25, 50, 75). */
  rings?: boolean;
  className?: string;
}

/**
 * Polygon-style radar / spider chart. Pure SVG, no chart library, themeable
 * via currentColor + brand pink. Used scarcely — the Dimensions page and the
 * Aptitudes page only.
 */
export function RadarChart({ axes, size = 320, rings = true, className }: RadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const n = axes.length;
  const ringValues = [25, 50, 75, 100];

  const angleFor = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const point = (i: number, v: number) => {
    const a = angleFor(i);
    const r = (Math.max(0, Math.min(100, v)) / 100) * radius;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  };

  const polygonPoints = axes
    .map((axis, i) => {
      const p = point(i, axis.value);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={cn("max-w-full h-auto", className)}>
      {/* Concentric rings */}
      {ringValues.map((rv, idx) => {
        const r = (rv / 100) * radius;
        return (
          <polygon
            key={rv}
            points={axes
              .map((_, i) => {
                const a = angleFor(i);
                return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
              })
              .join(" ")}
            fill="none"
            stroke="rgba(229,231,235,0.9)"
            strokeWidth={idx === ringValues.length - 1 ? 1.2 : 0.7}
            strokeDasharray={idx === ringValues.length - 1 ? "0" : "2 3"}
          />
        );
      })}

      {/* Axes spokes */}
      {axes.map((_, i) => {
        const p = point(i, 100);
        return (
          <line
            key={`spoke-${i}`}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="rgba(229,231,235,0.7)"
            strokeWidth={0.8}
          />
        );
      })}

      {/* Filled polygon */}
      <motion.polygon
        points={polygonPoints}
        fill="rgba(243,166,217,0.18)"
        stroke="#F3A6D9"
        strokeWidth={2}
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />

      {/* Vertex dots */}
      {axes.map((axis, i) => {
        const p = point(i, axis.value);
        return (
          <circle
            key={`dot-${axis.key}`}
            cx={p.x}
            cy={p.y}
            r={3.5}
            fill="#F3A6D9"
            stroke="white"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Axis labels */}
      {axes.map((axis, i) => {
        const labelRadius = radius + 22;
        const a = angleFor(i);
        const lx = cx + Math.cos(a) * labelRadius;
        const ly = cy + Math.sin(a) * labelRadius;
        const anchor =
          Math.abs(Math.cos(a)) < 0.2
            ? "middle"
            : Math.cos(a) > 0
            ? "start"
            : "end";
        return (
          <g key={`label-${axis.key}`}>
            <text
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontFamily="JetBrains Mono, ui-monospace, monospace"
              fontSize={9}
              letterSpacing={1}
              fill="#6B6F78"
            >
              {axis.label.toUpperCase()}
            </text>
            <text
              x={lx}
              y={ly + 11}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontFamily="JetBrains Mono, ui-monospace, monospace"
              fontSize={10}
              fontWeight={600}
              fill="#0A0E1A"
            >
              {Math.round(axis.value)}
            </text>
          </g>
        );
      })}

      {/* Ring percentage marks (top axis only) */}
      {rings &&
        ringValues.map((rv) => (
          <text
            key={`ring-${rv}`}
            x={cx + 4}
            y={cy - (rv / 100) * radius - 2}
            fontFamily="JetBrains Mono, ui-monospace, monospace"
            fontSize={7}
            fill="#9CA0A8"
          >
            {rv}
          </text>
        ))}
    </svg>
  );
}

// ── Engagement dial ───────────────────────────────────────────────────────

interface DialProps {
  /** 0..3 — engagement scoring tiers from the report. */
  score: number;
  level: string;
  size?: number;
}

/**
 * Single-arc gauge for the Engagement section. Circle is 270° from 7-o'clock
 * around to 5-o'clock. The filled portion = score / 3. Number in center.
 */
export function EngagementDial({ score, level, size = 200 }: DialProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const startAngle = 135; // bottom-left
  const sweep = 270; // 3/4 of a circle
  const fraction = Math.max(0, Math.min(1, score / 3));
  const fillAngle = sweep * fraction;

  const polar = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r };
  };

  const arcPath = (fromDeg: number, toDeg: number) => {
    const start = polar(fromDeg);
    const end = polar(toDeg);
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
  };

  const isWarning = score <= 1;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="max-w-full h-auto">
      {/* Background track */}
      <path
        d={arcPath(startAngle, startAngle + sweep)}
        fill="none"
        stroke="rgba(229,231,235,0.9)"
        strokeWidth={10}
        strokeLinecap="round"
      />
      {/* Filled arc */}
      <motion.path
        d={arcPath(startAngle, startAngle + Math.max(0.01, fillAngle))}
        fill="none"
        stroke={isWarning ? "#E76F51" : "#F3A6D9"}
        strokeWidth={10}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ pathLength: fraction }}
      />
      {/* Tick marks for each tier (0,1,2,3) */}
      {[0, 1, 2, 3].map((t) => {
        const a = startAngle + (sweep * t) / 3;
        const inner = polar(a);
        const innerR = r - 14;
        const outerR = r - 2;
        const radA = (a * Math.PI) / 180;
        const x1 = cx + Math.cos(radA) * innerR;
        const y1 = cy + Math.sin(radA) * innerR;
        const x2 = cx + Math.cos(radA) * outerR;
        const y2 = cy + Math.sin(radA) * outerR;
        void inner;
        return (
          <line
            key={t}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={t <= score ? (isWarning ? "#E76F51" : "#F3A6D9") : "#D1D5DB"}
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}
      {/* Center label */}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize={42}
        fontWeight={800}
        fill="#0A0E1A"
        letterSpacing={-1}
      >
        {score}
      </text>
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        fontFamily="JetBrains Mono, ui-monospace, monospace"
        fontSize={9}
        letterSpacing={1.5}
        fill="#6B6F78"
      >
        / 3
      </text>
      <text
        x={cx}
        y={cy + r + 22}
        textAnchor="middle"
        fontFamily="JetBrains Mono, ui-monospace, monospace"
        fontSize={10}
        letterSpacing={1.5}
        fontWeight={700}
        fill={isWarning ? "#E76F51" : "#F3A6D9"}
      >
        {level.toUpperCase()}
      </text>
    </svg>
  );
}
