"use client";

import { useEffect, useState } from "react";
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

  if (!hydrated) {
    return <main className="min-h-dvh" />;
  }

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) return;

    if (existingProfile) reset();

    setProfile({
      name: name.trim(),
      email: email.trim(),
      discipline,
      course,
      photo,
    });

    router.push("/assessment");
  };

  return (
    <main
      className="min-h-dvh overflow-hidden relative"
      style={{
        background: `
          radial-gradient(circle at 12% 38%, rgba(244, 184, 212, 0.30), transparent 30%),
          radial-gradient(circle at 82% 20%, rgba(196, 181, 253, 0.22), transparent 28%),
          radial-gradient(circle at 70% 78%, rgba(186, 230, 253, 0.18), transparent 30%),
          linear-gradient(
            135deg,
            #f7e8ee 0%,
            #efe7f4 42%,
            #edf2f9 100%
          )
        `,
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[8%] left-[-4%] h-[420px] w-[420px] rounded-full bg-pink-300/18 blur-[120px]" />

        <div className="absolute top-[12%] right-[-6%] h-[380px] w-[380px] rounded-full bg-violet-300/16 blur-[120px]" />

        <div className="absolute bottom-[-8%] right-[18%] h-[340px] w-[340px] rounded-full bg-blue-200/14 blur-[110px]" />

        <div className="absolute top-[38%] left-[42%] h-[180px] w-[180px] rounded-full bg-fuchsia-200/10 blur-[90px]" />
      </div>

      <Header />

      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 relative z-10">
        <div className="grid md:grid-cols-[1fr,minmax(420px,520px)] gap-12 lg:gap-16 items-start">
          <Hero />

          <Form
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            photo={photo}
            setPhoto={setPhoto}
            discipline={discipline}
            setDiscipline={(d) => {
              setDiscipline(d);
              setCourse(undefined);
            }}
            course={course}
            setCourse={setCourse}
            onSubmit={handleStart}
            existing={!!existingProfile}
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
    <header className="border-b border-white/20 bg-white/20 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="size-8 text-ink" />

          <div className="font-mono text-[13px] font-semibold tracking-wide uppercase">
            Roots <span className="text-ink-300">/</span> Routes
          </div>
        </div>

        <div className="mono-eyebrow text-ink-400">
          SECURE STEPS · v0.1
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="active-dot" />

        <span className="mono-eyebrow text-ink-700">
          PERSONALITY · CAREER FIT · ENGAGEMENT
        </span>
      </div>

      <h1 className="display-xl text-[64px] md:text-[88px] text-ink mb-2">
        ROOTS<span className="text-ink-300">/</span>ROUTES
      </h1>

      <h2 className="display-md text-[20px] md:text-[22px] text-ink-500 mb-8">
        A scientifically rigorous self-assessment that students actually finish.
      </h2>

      <p className="text-[16px] text-ink-500 leading-relaxed max-w-lg mb-8">
        Twenty-five short scenarios. Adaptive follow-ups. An honest engagement
        check. At the end you walk away with a 20+ stat profile and a
        downloadable report — not a horoscope.
      </p>

      <div className="flex items-center gap-4 flex-wrap">
        <Stat label="DURATION" value="~22 MIN" />
        <Stat label="QUESTIONS" value="25 · 27" />
        <Stat label="OUTPUT" value="PDF REPORT" />
      </div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="mono-eyebrow text-ink-300">{label}</span>

      <span className="font-mono text-[14px] font-semibold tracking-wider text-ink mt-1">
        {value}
      </span>
    </div>
  );
}

function Form(props: {
  name: string;
  setName: (s: string) => void;
  email: string;
  setEmail: (s: string) => void;
  photo: string | undefined;
  setPhoto: (p: string | undefined) => void;
  discipline: Discipline;
  setDiscipline: (d: Discipline) => void;
  course: string | undefined;
  setCourse: (c: string | undefined) => void;
  onSubmit: (e: React.FormEvent) => void;
  existing: boolean;
}) {
  const courses = coursesByDiscipline(props.discipline);

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      onSubmit={props.onSubmit}
      className="panel p-7 md:p-8 relative"
    >
      <div className="mono-eyebrow text-ink-700 mb-6">
        SIGN-UP · 30 SEC
      </div>

      <div className="space-y-5">
        <Field label="NAME" required>
          <input
            type="text"
            value={props.name}
            onChange={(e) => props.setName(e.target.value)}
            placeholder="Riya Mehta"
            className="form-input"
          />
        </Field>

        <Field label="EMAIL">
          <input
            type="email"
            value={props.email}
            onChange={(e) => props.setEmail(e.target.value)}
            placeholder="riya@example.com"
            className="form-input"
          />
        </Field>

        <PhotoUpload
          value={props.photo}
          onChange={props.setPhoto}
        />

        <Field label="INTEREST AREA">
          <select
            value={props.discipline}
            onChange={(e) =>
              props.setDiscipline(
                e.target.value as Discipline
              )
            }
            className="form-input form-select"
          >
            {DISCIPLINES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={`SPECIFIC COURSE · OPTIONAL · ${courses.length} OPTIONS`}
        >
          <select
            value={props.course ?? ""}
            onChange={(e) =>
              props.setCourse(
                e.target.value || undefined
              )
            }
            className="form-input form-select"
          >
            <option value="">
              — I'm not sure yet, recommend for me —
            </option>

            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Button
        type="submit"
        variant="solid"
        className="w-full mt-7 py-4"
        disabled={
          !props.name.trim() ||
          !props.email.trim()
        }
      >
        Begin Assessment

        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </motion.form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mono-eyebrow text-ink-700 mb-2">
        {label}

        {required && (
          <span className="text-electric"> *</span>
        )}
      </div>

      {children}
    </label>
  );
}

function FeatureRow() {
  const items = [
    {
      eyebrow: "01",
      title: "No boring sliders",
      body: "Scenario-driven questions that feel real and human.",
    },
    {
      eyebrow: "02",
      title: "Adaptive intelligence",
      body: "Questions evolve depending on your previous answers.",
    },
    {
      eyebrow: "03",
      title: "Engagement detection",
      body: "We measure genuine interest instead of surface-level hype.",
    },
    {
      eyebrow: "04",
      title: "Detailed personality map",
      body: "Discover strengths, blind spots and work styles deeply.",
    },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-4 mt-24">
      {items.map((it) => (
        <div
          key={it.title}
          className="panel p-6 relative"
        >
          <div className="mono-eyebrow text-electric">
            {it.eyebrow}
          </div>

          <h3 className="display-md text-[20px] text-ink mt-4 mb-2">
            {it.title}
          </h3>

          <p className="text-[14px] text-ink-500 leading-relaxed">
            {it.body}
          </p>
        </div>
      ))}
    </div>
  );
}

function PageFooter() {
  return (
    <footer className="border-t border-white/20 bg-white/10 backdrop-blur-xl mt-16">
      <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="mono-eyebrow text-ink-300">
          © SECURE STEPS · INTERNAL PREVIEW
        </div>

        <div className="mono-eyebrow text-ink-300 flex items-center gap-2">
          <Clock className="h-3 w-3" />
          v0.1
        </div>
      </div>
    </footer>
  );
}