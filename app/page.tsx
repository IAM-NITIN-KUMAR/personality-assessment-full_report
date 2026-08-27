"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { useAssessment } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import {
  DISCIPLINES,
  coursesByDiscipline,
  type Discipline,
} from "@/lib/course-catalog";
import { AnimatedGradient } from "@/components/ui/animated-gradient";

const ANCHORS_COUNT = 29;


export default function LandingPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const setProfile = useAssessment((s) => s.setProfile);
  const reset = useAssessment((s) => s.reset);
  const existingProfile = useAssessment((s) => s.profile);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [educationLevel, setEducationLevel] = useState<"10th_12th" | "college">("college");
  const [discipline, setDiscipline] = useState<Discipline>("tech_cs");
  const [course, setCourse] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  if (!hydrated) return <main className="min-h-dvh" />;

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !accessCode.trim()) return;
    if (existingProfile) reset();

    setSubmitting(true);
    setCodeError(null);

    const res = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: accessCode, name, email, phone, discipline,
        course: course ?? null, educationLevel: educationLevel ?? "college",
      }),
    }).catch(() => null);

    if (!res || !res.ok) {
      const reason = res ? (await res.json().catch(() => ({}))).error : "network";
      setCodeError(
        reason === "invalid_code" ? "That code isn't recognized — check for typos."
        : reason === "code_used" ? "This code has already been used."
        : reason === "code_revoked" ? "This code was cancelled. Contact Secure Steps."
        : "Something went wrong — please try again.",
      );
      setSubmitting(false);
      return;
    }

    const { studentId } = await res.json();
    setProfile({
      name: name.trim(), email: email.trim(), phone: phone.trim(),
      educationLevel, discipline, course, studentId,
    });
    setSubmitting(false);
    router.push("/assessment");
  };

  return (
    <main className="min-h-dvh overflow-x-hidden relative bg-[#f7e8ee]">
      <AnimatedGradient />
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-[1fr,minmax(420px,520px)] gap-12 lg:gap-16 items-start">
          <Hero />
          <Form
            name={name} setName={setName}
            email={email} setEmail={setEmail}
            phone={phone} setPhone={setPhone}
            educationLevel={educationLevel}
            setEducationLevel={(lvl) => {
              setEducationLevel(lvl);
              if (lvl === "10th_12th") {
                setDiscipline("science");
              } else {
                setDiscipline("tech_cs");
              }
              setCourse(undefined);
            }}
            discipline={discipline}
            setDiscipline={(d) => { setDiscipline(d); setCourse(undefined); }}
            course={course} setCourse={setCourse}
            accessCode={accessCode} setAccessCode={setAccessCode} codeError={codeError}
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
      <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-3 text-center">
        <div className="flex items-center gap-3">
          <Logo className="size-8 text-ink" />
          <div className="font-mono text-[13px] font-semibold tracking-wide uppercase">
            Roots <span className="text-ink-300">/</span> Routes
          </div>
        </div>
        <div className="mono-eyebrow text-ink-400">A smarter way to know you</div>
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
      <h1 className="display-xl text-[42px] sm:text-[64px] md:text-[88px] text-ink mb-2">
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
  phone: string; setPhone: (s: string) => void;
  educationLevel: "10th_12th" | "college"; setEducationLevel: (lvl: "10th_12th" | "college") => void;
  discipline: Discipline; setDiscipline: (d: Discipline) => void;
  course: string | undefined; setCourse: (c: string | undefined) => void;
  accessCode: string; setAccessCode: (s: string) => void; codeError: string | null;
  onSubmit: (e: React.FormEvent) => void;
  existing: boolean;
  submitting: boolean;
}) {
  const courses = coursesByDiscipline(props.discipline);
  const bachelorsCourses = props.educationLevel === "10th_12th"
    ? props.discipline === "science"
      ? [
          ...coursesByDiscipline("science").filter((c) => c.level !== "masters"),
          ...coursesByDiscipline("tech_cs").filter((c) => c.level !== "masters"),
          ...coursesByDiscipline("tech_engg").filter((c) => c.level !== "masters"),
        ]
      : props.discipline === "commerce"
      ? [
          ...coursesByDiscipline("commerce").filter((c) => c.level !== "masters"),
          ...coursesByDiscipline("business").filter((c) => c.level !== "masters"),
          ...coursesByDiscipline("economics").filter((c) => c.level !== "masters"),
        ]
      : []
    : courses.filter((c) => c.level !== "masters");
  const mastersCourses = courses.filter((c) => c.level === "masters");
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
          <Field label="PHONE NUMBER" required>
            <input type="tel" value={props.phone} onChange={(e) => props.setPhone(e.target.value)} placeholder="+91 99999 99999"
              className="w-full rounded-xl px-4 py-3 text-[15px] text-ink placeholder:text-ink-300 outline-none transition-all"
              style={inputStyle} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />
          </Field>
          <Field label="SECURITY CODE" required>
            <input type="text" value={props.accessCode}
              onChange={(e) => props.setAccessCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX" autoCapitalize="characters" autoComplete="off"
              className="w-full rounded-xl px-4 py-3 text-[15px] font-mono tracking-[0.15em] text-ink placeholder:text-ink-300 outline-none transition-all"
              style={inputStyle} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />
            {props.codeError && (
              <p className="mt-2 text-[13px] text-red-600">{props.codeError}</p>
            )}
          </Field>
          <Field label="CURRENT EDUCATION LEVEL">
            <select value={props.educationLevel} onChange={(e) => props.setEducationLevel(e.target.value as "10th_12th" | "college")}
              className="w-full rounded-xl px-4 py-3 text-[15px] text-ink outline-none transition-all appearance-none cursor-pointer"
              style={inputStyle} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}>
              <option value="college">College / University</option>
              <option value="10th_12th">10th / 12th Grade</option>
            </select>
          </Field>
          <Field label="CURRENTLY ENROLLED STREAM">
            <select value={props.discipline} onChange={(e) => props.setDiscipline(e.target.value as Discipline)}
              className="w-full rounded-xl px-4 py-3 text-[15px] text-ink outline-none transition-all appearance-none cursor-pointer"
              style={inputStyle} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}>
              {props.educationLevel === "10th_12th" ? (
                <>
                  <option value="science">Science</option>
                  <option value="commerce">Commerce</option>
                </>
              ) : (
                DISCIPLINES.filter((d) => d.id !== "schooling").map((d) => <option key={d.id} value={d.id}>{d.label}</option>)
              )}
            </select>
          </Field>
          <Field
            label={
              props.educationLevel === "10th_12th"
                ? `DESIRED COURSE IN MIND · OPTIONAL · ${bachelorsCourses.length} OPTIONS`
                : props.discipline === "schooling"
                ? "DESIRED COURSE · NOT APPLICABLE"
                : `DESIRED COURSE · OPTIONAL · ${courses.length} OPTIONS`
            }
          >
            <select 
              disabled={props.discipline === "schooling"}
              value={props.course ?? ""} 
              onChange={(e) => props.setCourse(e.target.value || undefined)}
              className="w-full rounded-xl px-4 py-3 text-[15px] text-ink outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={inputStyle} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}>
              <option value="">
                {props.discipline === "schooling" ? "— Not applicable for Schooling —" : "— I'm not sure yet, recommend for me —"}
              </option>
              {props.discipline !== "schooling" && bachelorsCourses.length > 0 && (
                <optgroup label="Bachelors Programs">
                  {bachelorsCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </optgroup>
              )}
              {props.discipline !== "schooling" && props.educationLevel !== "10th_12th" && mastersCourses.length > 0 && (
                <optgroup label="Masters Programs">
                  {mastersCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </optgroup>
              )}
            </select>
          </Field>
        </div>
        <button
          type="submit"
          disabled={!props.name.trim() || !props.email.trim() || !props.phone.trim() || !props.accessCode.trim() || props.submitting}
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-16 md:mt-24">
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