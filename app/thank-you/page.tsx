"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAssessment } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const REDIRECT_SECONDS = 12;

export default function ThankYouPage() {
  const router = useRouter();
  const profile = useAssessment((s) => s.profile);
  const reset = useAssessment((s) => s.reset);

  const [hydrated, setHydrated] = useState(false);
  const [name, setName] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => setHydrated(true), []);

  // Capture the student's name once, then wipe the session so a new one can start.
  useEffect(() => {
    if (!hydrated) return;
    if (profile?.name) setName(profile.name);
    reset();
    // We intentionally only run this once on mount-after-hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Auto-redirect countdown.
  useEffect(() => {
    if (!hydrated) return;
    if (secondsLeft <= 0) {
      router.replace("/");
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(t);
  }, [hydrated, secondsLeft, router]);

  if (!hydrated) return <main className="min-h-dvh" />;

  const firstName = name ? name.split(" ")[0] : "";

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-3">
          <Logo className="size-8 text-ink" />
          <div className="font-mono text-[13px] font-semibold tracking-wide uppercase">
            Roots <span className="text-ink-300">/</span> Routes
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl text-center"
        >
          <div className="inline-flex items-center gap-2 mb-7">
            <span className="active-dot" />
            <span className="mono-eyebrow text-electric">SESSION COMPLETE</span>
          </div>

          <h1 className="display-xl text-[56px] md:text-[80px] text-ink leading-[0.95] mb-6">
            Thanks{firstName ? `, ${firstName}` : ""}.
          </h1>

          <p className="text-[17px] text-ink-500 leading-relaxed mb-2 max-w-md mx-auto">
            Your answers are in.
          </p>
          <p className="text-[17px] text-ink-500 leading-relaxed mb-12 max-w-md mx-auto">
            Your Secure Steps counsellor will reach out within 48 hours with your
            alumni match and the start of your college shortlist conversation.
          </p>

          <div className="flex flex-col items-center gap-4">
            <Button
              variant="solid"
              onClick={() => router.replace("/")}
              className="px-7 py-3.5"
            >
              Back to home
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <span className="mono-eyebrow text-ink-300">
              REDIRECTING IN {secondsLeft}s
            </span>
          </div>
        </motion.div>
      </div>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="mono-eyebrow text-ink-300">
            © SECURE STEPS · ROOTS / ROUTES
          </div>
          <div className="mono-eyebrow text-ink-300">v0.1</div>
        </div>
      </footer>
    </main>
  );
}
