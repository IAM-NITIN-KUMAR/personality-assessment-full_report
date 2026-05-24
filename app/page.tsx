"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { useAssessment } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { PhotoUpload } from "@/components/ui/photo-upload";
import {
  DISCIPLINES,
  coursesByDiscipline,
  type Discipline,
} from "@/lib/course-catalog";
import { CONTEXT_QUESTIONS } from "@/lib/question-bank/context";
import { ROOTS_ANCHORS } from "@/lib/question-bank/roots";
import { ROUTES_BCA } from "@/lib/question-bank/routes-bca";
import { supabase } from "@/lib/supabase";

const ANCHORS_COUNT = CONTEXT_QUESTIONS.length + ROOTS_ANCHORS.length + ROUTES_BCA.length + 1;

const ORBS = [
  { x: 0.15, y: 0.40, r: 0.32, color: [244, 184, 212] as const, alpha: 0.82, speed: 0.00075, phase: 0, rx: 0.32, ry: 0.28 },
  { x: 0.80, y: 0.22, r: 0.28, color: [196, 181, 253] as const, alpha: 0.75, speed: 0.00075, phase: 1.1, rx: 0.28, ry: 0.32 },
  { x: 0.65, y: 0.75, r: 0.25, color: [186, 230, 253] as const, alpha: 0.68, speed: 0.00075, phase: 2.3, rx: 0.30, ry: 0.24 },
  { x: 0.45, y: 0.50, r: 0.18, color: [221, 190, 253] as const, alpha: 0.62, speed: 0.00075, phase: 3.7, rx: 0.22, ry: 0.26 },
  { x: 0.30, y: 0.70, r: 0.22, color: [253, 206, 228] as const, alpha: 0.70, speed: 0.00075, phase: 0.7, rx: 0.26, ry: 0.30 },
  { x: 0.88, y: 0.62, r: 0.20, color: [167, 207, 249] as const, alpha: 0.64, speed: 0.00075, phase: 5.1, rx: 0.24, ry: 0.28 },
];

function AnimatedGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    let ctx = canvas.getContext("2d")!;
    let raf: number;

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
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      if (!W || !H) { raf = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#f7e8ee");
      bg.addColorStop(0.42, "#efe7f4");
      bg.addColorStop(1, "#edf2f9");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      const t = performance.now();
      const { x: mx, y: my } = mouseRef.current;
      ORBS.forEach((o) => {
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
      mouseRef.current = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
    };
    const onLeave = () => { mouseRef.current = { x: -999, y: -999 }; };
    parent.addEventListener("mousemove", onMove);
    parent.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      parent.removeEventListener("mousemove", onMove);
      parent.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" />;
}

export default function LandingPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const setProfile = useAssessment((s) => s.setProfile);
  const reset = useAssessment((s) => s.reset);
  const existingProfile = useAssessment((s) => s.profile);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [discipline, setDiscipline] = useState<Discipline>("tech_cs");
  const [course, setCourse] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  if (!hydrated) return <main className="min-h-dvh" />;

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    if (existingProfile) reset();

    setSubmitting(true);

    const { error } = await supabase.from("students").insert({
      name: name.trim(),
      email: email.trim(),
      discipline,
      course_id: course ?? null,
      photo_url: photo ?? null,
    });

    if (error) console.error("Supabase insert error:", error);

    setProfile({ name: name.trim(), email: email.trim(), discipline, course, photo });
    setSubmitting(false);
    router.push("/assessment");
  };

  return (
    <main className="min-h-dvh overflow-hidden relative bg-[#f7e8ee]">
      <AnimatedGradient />
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 relative z-10">
        <div className="grid md:grid-cols-[1fr,minmax(420px,520px)] gap-12 lg:gap-16 items-start">
          <Hero />
          <Form
            name={name} setName={setName}
            email={email} setEmail={setEmail}
            photo={photo} setPhoto={setPhoto}
            discipline={discipline}
            setDiscipline={(d) => { setDiscipline(d); setCourse(undefined); }}
            course={course} setCourse={setCourse}
            onSubmit={handleStart}
            existing={!!existingProfile}
            submitting={submitting}
          />
        </div>
        <FeatureRow />
      </div>
      <PageFooter />
    </main>
  );
}

function Header() {
  return (
    <header className="border-b border-white/20 bg-white/20 backdrop-blur-xl relative z-10">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="size-8 text-ink" />
          <div className="font-mono text-[13px] font-semibold tracking-wide uppercase">
            Roots <span className="text-ink-300">/</span> Routes
          </div>
        </div>
        <div className="mono-eyebrow text-ink-400">SECURE STEPS · v0.1</div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="flex items-center gap-2 mb-6">
        <span className="active-dot" />
        <span className="mono-eyebrow text-ink-700">PERSONALITY · CAREER FIT · ENGAGEMENT</span>
      </div>
      <h1 className="display-xl text-[64px] md:text-[88px] text-ink mb-2">
        ROOTS<span className="text-ink-300">/</span>ROUTES
      </h1>
      <h2 className="display-md text-[20px] md:text-[22px] text-ink-500 mb-8">
        A scientifically rigorous self-assessment that students actually finish.
      </h2>
      <p className="text-[16px] text-ink-500 leading-relaxed max-w-lg mb-8">
        Answer {ANCHORS_COUNT} reflective questions that adapt to your choices in real-time.
        Uncover an unfiltered, data-backed blueprint of your professional DNA—no generic advice, just future-ready direction.
      </p>
      <div className="flex items-center gap-4 flex-wrap">
        <Stat label="DURATION" value={`~${Math.ceil(ANCHORS_COUNT * 0.8)} MIN`} />
        <Stat label="QUESTIONS" value={`${ANCHORS_COUNT}`} />
        <Stat label="OUTPUT" value="PDF REPORT" />
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="mono-eyebrow text-ink-300">{label}</span>
      <span className="font-mono text-[14px] font-semibold tracking-wider text-ink mt-1">{value}</span>
    </div>
  );
}

function Form(props: {
  name: string; setName: (s: string) => void;
  email: string; setEmail: (s: string) => void;
  photo: string | undefined; setPhoto: (p: string | undefined) => void;
  discipline: Discipline; setDiscipline: (d: Discipline) => void;
  course: string | undefined; setCourse: (c: string | undefined) => void;
  onSubmit: (e: React.FormEvent) => void;
  existing: boolean;
  submitting: boolean;
}) {
  const courses = coursesByDiscipline(props.discipline);
  const inputStyle = { background: "rgba(255,255,255,0.7)", border: "1px solid rgba(200,190,220,0.4)", boxShadow: "inset 0 1px 3px rgba(180,140,200,0.08)" };
  const focusStyle = { background: "rgba(255,255,255,0.95)", border: "1px solid rgba(180,140,220,0.6)", boxShadow: "0 0 0 3px rgba(196,181,253,0.2), inset 0 1px 3px rgba(180,140,200,0.08)" };
  const blurStyle = inputStyle;

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
      onSubmit={props.onSubmit}
      className="relative rounded-[28px] p-7 md:p-8"
      style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(255,255,255,0.75)", boxShadow: "0 8px 32px -4px rgba(180,140,200,0.18), 0 2px 8px -2px rgba(180,140,200,0.12), inset 0 1px 0 rgba(255,255,255,0.9)" }}
    >
      <div className="absolute inset-0 rounded-[28px] pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.0) 60%)" }} />
      <div className="relative">
        <div className="flex items-center gap-2 mb-6">
          <span className="active-dot" />
          <span className="mono-eyebrow text-ink-700">SIGN-UP · 30 SEC</span>
        </div>
        <div className="space-y-4">
          <Field label="NAME" required>
            <input type="text" value={props.name} onChange={(e) => props.setName(e.target.value)} placeholder="Riya Mehta"
              className="w-full rounded-xl px-4 py-3 text-[15px] text-ink placeholder:text-ink-300 outline-none transition-all"
              style={inputStyle} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />
          </Field>
          <Field label="EMAIL">
            <input type="email" value={props.email} onChange={(e) => props.setEmail(e.target.value)} placeholder="riya@example.com"
              className="w-full rounded-xl px-4 py-3 text-[15px] text-ink placeholder:text-ink-300 outline-none transition-all"
              style={inputStyle} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />
          </Field>
          <PhotoUpload value={props.photo} onChange={props.setPhoto} />
          <Field label="INTEREST AREA">
            <select value={props.discipline} onChange={(e) => props.setDiscipline(e.target.value as Discipline)}
              className="w-full rounded-xl px-4 py-3 text-[15px] text-ink outline-none transition-all appearance-none cursor-pointer"
              style={inputStyle} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}>
              {DISCIPLINES.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </Field>
          <Field label={`SPECIFIC COURSE · OPTIONAL · ${courses.length} OPTIONS`}>
            <select value={props.course ?? ""} onChange={(e) => props.setCourse(e.target.value || undefined)}
              className="w-full rounded-xl px-4 py-3 text-[15px] text-ink outline-none transition-all appearance-none cursor-pointer"
              style={inputStyle} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}>
              <option value="">— I'm not sure yet, recommend for me —</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </Field>
        </div>
        <button
          type="submit"
          disabled={!props.name.trim() || !props.email.trim() || props.submitting}
          className="w-full mt-6 py-4 rounded-2xl text-white font-mono text-[13px] tracking-[0.12em] uppercase font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)", boxShadow: "0 4px 16px -4px rgba(10,14,26,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" }}
          onMouseEnter={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.boxShadow = "0 8px 24px -4px rgba(10,14,26,0.5), inset 0 1px 0 rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px -4px rgba(10,14,26,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {props.submitting ? "Starting…" : "Begin Assessment"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mono-eyebrow text-ink-700 mb-2">{label}{required && <span className="text-electric"> *</span>}</div>
      {children}
    </label>
  );
}

function FeatureRow() {
  const items = [
    { eyebrow: "01", title: "No boring sliders", body: "Reflective questions that feel real and human." },
    { eyebrow: "02", title: "10 Reflective Questions", body: "Our engine custom-tailors subsequent questions in real-time based on your responses." },
    { eyebrow: "03", title: "Engagement detection", body: "We measure genuine interest instead of surface-level hype." },
    { eyebrow: "04", title: "Crystalline Blueprints", body: "Walk away with a precise map of your cognitive signatures, hidden blind spots, and ultimate career fit." },
  ];
  return (
    <div className="grid md:grid-cols-4 gap-4 mt-24">
      {items.map((it) => (
        <div key={it.title} className="panel p-6 relative">
          <div className="mono-eyebrow text-electric">{it.eyebrow}</div>
          <h3 className="display-md text-[20px] text-ink mt-4 mb-2">{it.title}</h3>
          <p className="text-[14px] text-ink-500 leading-relaxed">{it.body}</p>
        </div>
      ))}
    </div>
  );
}

function PageFooter() {
  return (
    <footer className="border-t border-white/20 bg-white/10 backdrop-blur-xl mt-16 relative z-10">
      <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="mono-eyebrow text-ink-300">© SECURE STEPS · INTERNAL PREVIEW</div>
        <div className="mono-eyebrow text-ink-300 flex items-center gap-2">
          <Clock className="h-3 w-3" />
          v0.1
        </div>
      </div>
    </footer>
  );
}