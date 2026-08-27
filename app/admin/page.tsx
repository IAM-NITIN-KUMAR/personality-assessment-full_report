"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Check, Plus, Ban, RefreshCw } from "lucide-react";

interface CodeRow {
  id: string; code: string; label: string | null;
  status: "active" | "used" | "revoked";
  created_at: string; used_at: string | null; used_by_student_id: string | null;
}

const fmt = (code: string) => `${code.slice(0, 4)}-${code.slice(4)}`;
const dateFmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

const STATUS_STYLES: Record<CodeRow["status"], string> = {
  active: "bg-emerald-100 text-emerald-700",
  used: "bg-slate-200 text-slate-600",
  revoked: "bg-red-100 text-red-600",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null); // null = probing
  const [codes, setCodes] = useState<CodeRow[]>([]);
  const [loadError, setLoadError] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/codes").catch(() => null);
    if (!res || res.status === 401) { setAuthed(false); return; }
    if (!res.ok) { setAuthed(true); setLoadError(true); setCodes([]); return; }
    const body = await res.json().catch(() => null);
    setCodes(body?.codes ?? []);
    setLoadError(false);
    setAuthed(true);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (authed === null) return <main className="min-h-dvh bg-[#f7e8ee]" />;
  return (
    <main className="min-h-dvh bg-[#f7e8ee] px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="font-mono text-[13px] font-semibold tracking-wide uppercase">Secure Steps · Access Codes</h1>
          {authed && (
            <button onClick={refresh} className="p-2 rounded-lg hover:bg-white/60" title="Refresh">
              <RefreshCw className="size-4" />
            </button>
          )}
        </header>
        {authed && loadError && (
          <p className="text-[13px] text-red-600">Couldn&apos;t load codes — check the server and hit refresh.</p>
        )}
        {authed ? <Dashboard codes={codes} onChanged={refresh} /> : <Login onSuccess={refresh} />}
      </div>
    </main>
  );
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(false);
    const res = await fetch("/api/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    setBusy(false);
    if (res?.status === 204) onSuccess();
    else setError(true);
  };

  return (
    <form onSubmit={submit} className="bg-white/70 rounded-2xl p-6 space-y-4 max-w-sm">
      <div className="mono-eyebrow text-ink-700">ADMIN PASSWORD</div>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-xl border border-line px-4 py-3 text-[15px] outline-none" autoFocus />
      {error && <p className="text-[13px] text-red-600">Wrong password.</p>}
      <button type="submit" disabled={!password || busy}
        className="w-full py-3 rounded-xl bg-ink text-white font-mono text-[13px] uppercase tracking-wider disabled:opacity-40">
        {busy ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}

function Dashboard({ codes, onChanged }: { codes: CodeRow[]; onChanged: () => void }) {
  const [label, setLabel] = useState("");
  const [fresh, setFresh] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setBusy(true);
    const res = await fetch("/api/admin/codes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) return;
    const { code } = await res.json();
    setFresh(code); setLabel(""); setCopied(false);
    onChanged();
  };

  const revoke = async (id: string) => {
    await fetch("/api/admin/codes/revoke", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => null);
    onChanged();
  };

  const copy = async () => {
    if (!fresh) return;
    await navigator.clipboard.writeText(fresh).catch(() => {});
    setCopied(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/70 rounded-2xl p-6 space-y-4">
        <div className="mono-eyebrow text-ink-700">GENERATE A CODE</div>
        <div className="flex gap-3">
          <input value={label} onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (optional) — e.g. Riya, paid 26 Aug UPI"
            className="flex-1 rounded-xl border border-line px-4 py-3 text-[14px] outline-none" />
          <button onClick={generate} disabled={busy}
            className="px-5 rounded-xl bg-ink text-white font-mono text-[13px] uppercase tracking-wider flex items-center gap-2 disabled:opacity-40">
            <Plus className="size-4" /> {busy ? "…" : "Generate"}
          </button>
        </div>
        {fresh && (
          <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
            <span className="font-mono text-[26px] font-black tracking-[0.2em]">{fresh}</span>
            <button onClick={copy} className="p-2 rounded-lg hover:bg-emerald-100" title="Copy">
              {copied ? <Check className="size-5 text-emerald-600" /> : <Copy className="size-5" />}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white/70 rounded-2xl p-6 overflow-x-auto">
        <div className="mono-eyebrow text-ink-700 mb-4">ALL CODES · {codes.length}</div>
        <table className="w-full text-[13px]">
          <thead className="text-left text-ink-400 font-mono uppercase text-[11px]">
            <tr><th className="py-2 pr-4">Code</th><th className="pr-4">Label</th><th className="pr-4">Status</th><th className="pr-4">Created</th><th className="pr-4">Used</th><th /></tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id} className="border-t border-line/50">
                <td className="py-2.5 pr-4 font-mono font-bold tracking-wider">{fmt(c.code)}</td>
                <td className="pr-4 text-ink-600">{c.label ?? "—"}</td>
                <td className="pr-4">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                </td>
                <td className="pr-4 text-ink-400">{dateFmt(c.created_at)}</td>
                <td className="pr-4 text-ink-400">{dateFmt(c.used_at)}</td>
                <td>
                  {c.status === "active" && (
                    <button onClick={() => revoke(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Revoke">
                      <Ban className="size-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {codes.length === 0 && (
              <tr><td colSpan={6} className="py-6 text-center text-ink-400">No codes yet — generate the first one above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
