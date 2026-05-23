"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash, Save, RefreshCw, Layers, Sliders, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import type { Question, Option, Dimension } from "@/lib/types";

const DIMENSIONS: Array<{ key: Dimension; label: string }> = [
  { key: "decision_style", label: "Decision Style" },
  { key: "energy",         label: "Energy & People" },
  { key: "structure",      label: "Structure" },
  { key: "risk",           label: "Risk Tolerance" },
  { key: "social",         label: "Social Mode" },
  { key: "drive",          label: "Drive" },
];

const QUESTION_TYPES = [
  { value: "single_choice", label: "Single Choice" },
  { value: "multi_choice",  label: "Multi Choice" },
  { value: "short_text",    label: "Short Text" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"context" | "roots" | "routes">("context");
  
  // Local active states for questions
  const [contextQuestions, setContextQuestions] = useState<Question[]>([]);
  const [rootsQuestions, setRootsQuestions] = useState<Question[]>([]);
  const [routesQuestions, setRoutesQuestions] = useState<Question[]>([]);
  const [routesEngagement, setRoutesEngagement] = useState<Question | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/questions");
      const data = await res.json();
      setContextQuestions(data.context || []);
      setRootsQuestions(data.roots || []);
      setRoutesQuestions(data.routes || []);
      setRoutesEngagement(data.routes_engagement || null);

      // Default active item
      const defArray = data[activeTab] || [];
      if (defArray.length > 0) {
        setActiveId(defArray[0].id);
      }
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to retrieve local question banks.");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Get active list of questions based on selected tab
  const getActiveList = () => {
    if (activeTab === "context") return contextQuestions;
    if (activeTab === "roots") return rootsQuestions;
    // Combine Routes with BCA Engagement question
    const list = [...routesQuestions];
    if (routesEngagement) list.push(routesEngagement);
    return list;
  };

  const updateActiveList = (updater: (list: Question[]) => Question[]) => {
    if (activeTab === "context") {
      setContextQuestions(updater(contextQuestions));
    } else if (activeTab === "roots") {
      setRootsQuestions(updater(rootsQuestions));
    } else {
      // Routes logic splits the engagement check from the main routes array
      const combined = [...routesQuestions];
      if (routesEngagement) combined.push(routesEngagement);
      const updatedCombined = updater(combined);
      
      const newRoutes = updatedCombined.filter((q) => q.id !== "rb_engagement");
      const newEngage = updatedCombined.find((q) => q.id === "rb_engagement") || null;
      
      setRoutesQuestions(newRoutes);
      if (newEngage) setRoutesEngagement(newEngage);
    }
  };

  const activeList = getActiveList();
  const activeQuestion = activeList.find((q) => q.id === activeId);

  // Set active question when switching tabs
  const handleTabChange = (tab: "context" | "roots" | "routes") => {
    setActiveTab(tab);
    let list: Question[] = [];
    if (tab === "context") list = contextQuestions;
    else if (tab === "roots") list = rootsQuestions;
    else {
      list = [...routesQuestions];
      if (routesEngagement) list.push(routesEngagement);
    }
    if (list.length > 0) {
      setActiveId(list[0].id);
    } else {
      setActiveId(null);
    }
  };

  const handleFieldChange = (key: keyof Question, value: any) => {
    if (!activeId) return;
    updateActiveList((list) =>
      list.map((q) => (q.id === activeId ? { ...q, [key]: value } : q))
    );
  };

  const handleOptionChange = (optIndex: number, key: keyof Option, value: any) => {
    if (!activeQuestion?.options) return;
    const newOptions = [...activeQuestion.options];
    newOptions[optIndex] = { ...newOptions[optIndex], [key]: value };
    handleFieldChange("options", newOptions);
  };

  const handleScoreChange = (optIndex: number, dimKey: Dimension, val: number) => {
    if (!activeQuestion?.options) return;
    const option = activeQuestion.options[optIndex];
    const newScores = { ...(option.scores || {}), [dimKey]: val };
    
    // Remove if 0 to keep the typescript code clean
    if (val === 0) delete newScores[dimKey];
    
    handleOptionChange(optIndex, "scores", newScores);
  };

  const addOption = () => {
    if (!activeQuestion) return;
    const currentOpts = activeQuestion.options || [];
    const charCode = 97 + currentOpts.length; // a, b, c, d
    const newId = String.fromCharCode(charCode);
    const newOpt: Option = {
      id: newId,
      label: "New Option Text",
      scores: activeTab !== "context" ? {} : undefined,
      tag: activeTab === "context" ? `${activeQuestion.id}:${newId}` : undefined,
    };
    handleFieldChange("options", [...currentOpts, newOpt]);
  };

  const removeOption = (optIndex: number) => {
    if (!activeQuestion?.options) return;
    const newOptions = activeQuestion.options.filter((_, i) => i !== optIndex);
    handleFieldChange("options", newOptions);
  };

  const addNewQuestion = () => {
    const isContext = activeTab === "context";
    const prefix = isContext ? "ctx_" : activeTab === "roots" ? "rt_" : "rb_";
    const uniqueId = `${prefix}${Date.now().toString().slice(-4)}`;
    
    const newQ: Question = {
      id: uniqueId,
      section: activeTab,
      kind: isContext ? "context" : "anchor",
      type: "single_choice",
      category: isContext ? "New Category" : "Psychometrics",
      prompt: "State your scenario question prompt here.",
      dimension: isContext ? undefined : "drive",
      options: [
        { id: "a", label: "Option A label", scores: isContext ? undefined : { drive: 1 } },
        { id: "b", label: "Option B label", scores: isContext ? undefined : { drive: -1 } },
      ],
    };

    updateActiveList((list) => [...list, newQ]);
    setActiveId(uniqueId);
  };

  const deleteQuestion = (qId: string) => {
    if (qId === "rb_engagement") {
      showAlert("error", "The field engagement check is non-deletable.");
      return;
    }
    if (confirm("Permanently delete this question? This change only saves to disk when you hit 'Save Changes'.")) {
      updateActiveList((list) => list.filter((q) => q.id !== qId));
      // Re-focus active question
      const filtered = activeList.filter((q) => q.id !== qId);
      if (filtered.length > 0) {
        setActiveId(filtered[0].id);
      } else {
        setActiveId(null);
      }
    }
  };

  const saveToDisk = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: contextQuestions,
          roots: rootsQuestions,
          routes: routesQuestions,
          routes_engagement: routesEngagement,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showAlert("success", "Codebase rewritten! Next.js is hot-reloading changes automatically.");
      } else {
        showAlert("error", data.error || "Persistence failed.");
      }
    } catch (err) {
      console.error(err);
      showAlert("error", "Could not sync code to local system.");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-[#f7e8ee]">
        <div className="mono-eyebrow text-ink-300 animate-pulse">BOOTING CODEBASE GRAPH…</div>
      </main>
    );
  }

  return (
    <main
      className="min-h-dvh overflow-hidden relative pb-16"
      style={{
        background: `
          radial-gradient(circle at 12% 20%, rgba(244, 184, 212, 0.2), transparent 30%),
          radial-gradient(circle at 85% 15%, rgba(196, 181, 253, 0.16), transparent 28%),
          radial-gradient(circle at 75% 85%, rgba(186, 230, 253, 0.12), transparent 30%),
          linear-gradient(135deg, #f8eef2 0%, #f1edf6 45%, #eef3f9 100%)
        `,
      }}
    >
      {/* Alert boundary */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-xl backdrop-blur-md ${
              alert.type === "success" 
                ? "bg-green-500/10 border border-green-500/30 text-green-700" 
                : "bg-red-500/10 border border-red-500/30 text-red-700"
            }`}
          >
            {alert.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
            <span className="font-mono text-[13px] font-semibold tracking-wide">{alert.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-30 bg-white/20 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo className="size-8 text-ink" />
            <div>
              <div className="font-mono text-[13px] font-semibold tracking-wide uppercase leading-none">
                Roots <span className="text-ink-300">/</span> Routes
              </div>
              <div className="mono-eyebrow text-electric mt-1.5">ADMIN PORTAL · CODE SYNC ACTIVE</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={fetchQuestions}>
              <RefreshCw className="h-3.5 w-3.5" />
              Revert
            </Button>
            <Button
              variant="solid"
              onClick={saveToDisk}
              disabled={syncing}
              className="bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] text-white flex items-center gap-2 border border-white/10 hover:shadow-lg"
            >
              <Save className="h-3.5 w-3.5" />
              {syncing ? "Writing TS Files…" : "Save Changes to Disk"}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 mt-10 grid lg:grid-cols-[340px,1fr] gap-8 items-start relative z-10">
        {/* Navigation panel */}
        <div className="space-y-6">
          <div className="panel p-2 flex gap-1 bg-white/30 backdrop-blur-md">
            {(["context", "roots", "routes"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex-1 py-3 rounded-xl font-mono text-[11px] tracking-widest uppercase transition-all ${
                  activeTab === tab 
                    ? "bg-ink text-white font-bold shadow-sm" 
                    : "text-ink-400 hover:bg-white/40"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="panel p-5 bg-white/40 backdrop-blur-md max-h-[64vh] flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-4 shrink-0">
              <span className="mono-eyebrow text-ink-300">Questions ({activeList.length})</span>
              <button
                onClick={addNewQuestion}
                className="size-7 rounded-lg bg-electric-tint text-electric flex items-center justify-center hover:bg-electric hover:text-white transition-all"
                title="Add New Question"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1 scrollbar-thin flex-1">
              {activeList.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setActiveId(q.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    activeId === q.id 
                      ? "bg-white border-ink shadow-sm" 
                      : "bg-white/20 border-line hover:bg-white/50"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-electric uppercase tracking-wider">{q.category}</span>
                      <span className="text-[10px] text-ink-300 font-mono">({q.id})</span>
                    </div>
                    <p className="text-[13px] text-ink font-medium truncate mt-1.5">{q.prompt}</p>
                  </div>
                  {q.id !== "rb_engagement" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteQuestion(q.id);
                      }}
                      className="text-ink-300 hover:text-red-500 transition-colors self-center"
                      title="Delete Question"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question editor screen */}
        <div className="panel p-8 md:p-10 bg-white/60 backdrop-blur-xl">
          {activeQuestion ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-line pb-4 gap-4 flex-wrap">
                <div>
                  <span className="mono-eyebrow text-ink-300">QUESTION ID</span>
                  <div className="font-mono text-[16px] font-bold text-ink mt-1 flex items-center gap-2">
                    {activeQuestion.id}
                    <span className="px-2.5 py-0.5 rounded-full bg-electric-tint text-electric text-[9px] uppercase tracking-widest font-bold">
                      {activeQuestion.kind}
                    </span>
                  </div>
                </div>
                
                {activeQuestion.id !== "rb_engagement" && (
                  <div className="flex gap-4">
                    <div>
                      <span className="mono-eyebrow text-ink-300">TYPE</span>
                      <select
                        value={activeQuestion.type}
                        onChange={(e) => handleFieldChange("type", e.target.value)}
                        className="block mt-1 font-mono text-[12px] uppercase px-3 py-1.5 rounded-lg border border-line bg-white/50 focus:outline-none focus:border-electric cursor-pointer"
                      >
                        {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>

                    {activeTab !== "context" && (
                      <div>
                        <span className="mono-eyebrow text-ink-300">DIMENSION</span>
                        <select
                          value={activeQuestion.dimension || ""}
                          onChange={(e) => handleFieldChange("dimension", e.target.value || undefined)}
                          className="block mt-1 font-mono text-[12px] uppercase px-3 py-1.5 rounded-lg border border-line bg-white/50 focus:outline-none focus:border-electric cursor-pointer"
                        >
                          <option value="">— NONE —</option>
                          {DIMENSIONS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form entries */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block">
                    <span className="mono-eyebrow text-ink-700">Category Tag (Eyebrow text)</span>
                    <input
                      type="text"
                      value={activeQuestion.category}
                      onChange={(e) => handleFieldChange("category", e.target.value)}
                      placeholder="e.g. Decision style"
                      className="w-full mt-1.5 rounded-xl border border-line bg-white/40 px-4 py-2.5 text-[14px] text-ink focus:outline-none focus:border-electric transition-all"
                    />
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block">
                    <span className="mono-eyebrow text-ink-700">Prompt Text</span>
                    <textarea
                      value={activeQuestion.prompt}
                      onChange={(e) => handleFieldChange("prompt", e.target.value)}
                      placeholder="The question description..."
                      rows={3}
                      className="w-full mt-1.5 rounded-xl border border-line bg-white/40 px-4 py-2.5 text-[14px] text-ink focus:outline-none focus:border-electric transition-all resize-none"
                    />
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block">
                    <span className="mono-eyebrow text-ink-700">Hint (Optional Helper text)</span>
                    <input
                      type="text"
                      value={activeQuestion.hint || ""}
                      onChange={(e) => handleFieldChange("hint", e.target.value || undefined)}
                      placeholder="Additional instructions..."
                      className="w-full mt-1.5 rounded-xl border border-line bg-white/40 px-4 py-2.5 text-[14px] text-ink focus:outline-none focus:border-electric transition-all"
                    />
                  </label>
                </div>
              </div>

              {/* Option List section */}
              {activeQuestion.type !== "short_text" && (
                <div className="border-t border-line pt-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="mono-eyebrow text-ink-700">Options ({activeQuestion.options?.length || 0})</span>
                    <button
                      onClick={addOption}
                      className="px-3 py-1.5 rounded-xl bg-electric-tint text-electric font-mono text-[10px] uppercase font-bold tracking-wider hover:bg-electric hover:text-white transition-all flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Option
                    </button>
                  </div>

                  <div className="space-y-4">
                    {activeQuestion.options?.map((option, optIdx) => (
                      <div key={option.id} className="p-4 rounded-xl border border-line bg-white/30 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[12px] font-bold text-ink uppercase bg-line/80 px-2.5 py-1 rounded-lg">
                              {option.id.toUpperCase()}
                            </span>
                            {activeTab === "context" && (
                              <input
                                type="text"
                                value={option.tag || ""}
                                onChange={(e) => handleOptionChange(optIdx, "tag", e.target.value)}
                                placeholder="tag:value"
                                className="font-mono text-[11px] px-2.5 py-1 rounded-lg border border-line bg-white/50 focus:outline-none focus:border-electric w-32"
                              />
                            )}
                          </div>
                          <button
                            onClick={() => removeOption(optIdx)}
                            className="text-ink-300 hover:text-red-500 transition-colors"
                            title="Remove Option"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={option.label}
                          onChange={(e) => handleOptionChange(optIdx, "label", e.target.value)}
                          placeholder="Option description label..."
                          className="w-full rounded-xl border border-line bg-white/70 px-4 py-2.5 text-[14px] text-ink focus:outline-none focus:border-electric transition-all"
                        />

                        {/* Dimension weights config (Roots / Routes) */}
                        {activeTab !== "context" && activeQuestion.id !== "rb_engagement" && (
                          <div className="border-t border-line/40 pt-3 mt-3">
                            <div className="mono-eyebrow text-ink-300 text-[9px] mb-2 flex items-center gap-1">
                              <Sliders className="h-3 w-3" />
                              DIMENSION WEIGHT VECTORS (-2 to +2)
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {DIMENSIONS.map((d) => {
                                const val = option.scores?.[d.key] ?? 0;
                                return (
                                  <div key={d.key} className="flex items-center justify-between gap-2 bg-white/40 p-2 rounded-lg border border-line/50">
                                    <span className="text-[11px] text-ink-500 font-mono font-medium truncate w-20" title={d.label}>
                                      {d.label}
                                    </span>
                                    <input
                                      type="number"
                                      min={-2}
                                      max={2}
                                      step={0.5}
                                      value={val}
                                      onChange={(e) => handleScoreChange(optIdx, d.key, parseFloat(e.target.value) || 0)}
                                      className="w-12 text-center text-[12px] font-mono font-bold bg-white border border-line rounded px-1 py-0.5 focus:outline-none focus:border-electric"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <Layers className="h-12 w-12 text-ink-300 mx-auto mb-4 animate-bounce" />
              <p className="mono-eyebrow text-ink-300">NO QUESTION ACTIVE · CREATE OR SELECT ONE</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
