"use client";

import { DIM_LABELS, DIM_PRIORITY } from "@/lib/v2/types";
import type { RadarScores } from "@/lib/v2/types";

export default function RadarChart({ scores, size = 280 }: { scores: RadarScores; size?: number }) {
  const cx = size / 2, cy = size / 2, r = size * 0.36;
  const angle = (i: number) => (Math.PI * 2 * i) / 6 - Math.PI / 2;
  const point = (i: number, value: number) => {
    const rr = (value / 10) * r;
    return `${cx + rr * Math.cos(angle(i))},${cy + rr * Math.sin(angle(i))}`;
  };
  const ring = (v: number) => DIM_PRIORITY.map((_, i) => point(i, v)).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-xs" role="img" aria-label="Path fit radar">
      {[10, 7.5, 5, 2.5].map((v) => (
        <polygon key={v} points={ring(v)} fill="none" stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {DIM_PRIORITY.map((_, i) => (
        <line key={i} x1={cx} y1={cy} x2={point(i, 10).split(",")[0]} y2={point(i, 10).split(",")[1]} stroke="#e2e8f0" strokeWidth={1} />
      ))}
      <polygon
        points={DIM_PRIORITY.map((d, i) => point(i, scores[d])).join(" ")}
        fill="rgba(16,185,129,0.25)" stroke="#10b981" strokeWidth={2}
      />
      {DIM_PRIORITY.map((d, i) => {
        const [x, y] = point(i, 12.6).split(",").map(Number);
        return (
          <text key={d} x={x} y={y} textAnchor="middle" className="fill-slate-500" fontSize={10}>
            {DIM_LABELS[d]} {scores[d]}
          </text>
        );
      })}
    </svg>
  );
}
