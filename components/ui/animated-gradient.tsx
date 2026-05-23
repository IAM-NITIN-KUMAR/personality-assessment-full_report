// components/ui/animated-gradient.tsx
"use client";

import { useEffect, useRef } from "react";

export function AnimatedGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    let ctx = canvas.getContext("2d")!;
    let raf: number;

    const orbs = [
      { x: 0.15, y: 0.40, r: 0.32, color: [244, 184, 212] as const, alpha: 0.55, speed: 0.00012, phase: 0,   rx: 0.18, ry: 0.14 },
      { x: 0.80, y: 0.22, r: 0.28, color: [196, 181, 253] as const, alpha: 0.48, speed: 0.00009, phase: 1.1, rx: 0.14, ry: 0.18 },
      { x: 0.65, y: 0.75, r: 0.25, color: [186, 230, 253] as const, alpha: 0.40, speed: 0.00014, phase: 2.3, rx: 0.16, ry: 0.12 },
      { x: 0.45, y: 0.50, r: 0.18, color: [221, 190, 253] as const, alpha: 0.35, speed: 0.00017, phase: 3.7, rx: 0.10, ry: 0.13 },
      { x: 0.30, y: 0.70, r: 0.22, color: [253, 206, 228] as const, alpha: 0.42, speed: 0.00011, phase: 0.7, rx: 0.13, ry: 0.16 },
      { x: 0.88, y: 0.62, r: 0.20, color: [167, 207, 249] as const, alpha: 0.38, speed: 0.00015, phase: 5.1, rx: 0.11, ry: 0.14 },
    ];

    const resize = () => {
      const W = parent.offsetWidth;
      const H = parent.offsetHeight;
      canvas.width = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx = canvas.getContext("2d")!;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#f7e8ee");
      bg.addColorStop(0.42, "#efe7f4");
      bg.addColorStop(1, "#edf2f9");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const t = performance.now();
      const { x: mx, y: my } = mouseRef.current;

      orbs.forEach((o) => {
        const ox = (o.x + Math.cos(t * o.speed + o.phase) * o.rx) * W;
        const oy = (o.y + Math.sin(t * o.speed * 1.3 + o.phase) * o.ry) * H;
        const mdx = mx - ox / W;
        const mdy = my - oy / H;
        const dist = Math.sqrt(mdx * mdx + mdy * mdy);
        const push = dist < 0.3 ? (1 - dist / 0.3) * 0.04 : 0;
        const fx = ox - mdx * push * W;
        const fy = oy - mdy * push * H;
        const r = o.r * Math.min(W, H);
        const [rc, gc, bc] = o.color;
        const grd = ctx.createRadialGradient(fx, fy, 0, fx, fy, r);
        grd.addColorStop(0, `rgba(${rc},${gc},${bc},${o.alpha})`);
        grd.addColorStop(0.5, `rgba(${rc},${gc},${bc},${o.alpha * 0.55})`);
        grd.addColorStop(1, `rgba(${rc},${gc},${bc},0)`);
        ctx.beginPath();
        ctx.arc(fx, fy, r, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    const onLeave = () => { mouseRef.current = { x: -999, y: -999 }; };
    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
    />
  );
}