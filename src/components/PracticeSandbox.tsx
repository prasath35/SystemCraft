import React, { useState } from "react";
import { Terminal, RefreshCw, Send, Sparkles, CheckCircle, AlertTriangle, Play, HelpCircle, ArrowLeft, Award } from "lucide-react";
import { practiceScenarios } from "../data/scenariosData";
import { PracticeScenario, EvaluationResult } from "../types";

export default function PracticeSandbox() {
  const [scenarios, setScenarios] = useState<PracticeScenario[]>(practiceScenarios);
  const [selectedScenario, setSelectedScenario] = useState<PracticeScenario | null>(null);
  const [userSolution, setUserSolution] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingScenario, setIsGeneratingScenario] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateScenario = async (difficulty: "Easy" | "Medium" | "Hard" = "Medium") => {
    setIsGeneratingScenario(true);
    setError(null);
    try {
      const response = await fetch("/api/practice/generate-scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to formulate dynamic design problem.");
      }
      setScenarios(prev => [data, ...prev]);
      setSelectedScenario(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not connect to the scenario formulation server.");
    } finally {
      setIsGeneratingScenario(false);
    }
  };

  const loadingSequence = [
    "Spinning up sandboxed grading container...",
    "Injecting Principal Engineer system rubrics...",
    "Parsing system scale estimations & QPS parameters...",
    "Analyzing storage engine selection and cache policies...",
    "Mapping single points of failure & cross-region latency metrics...",
    "Generating structural review feedback..."
  ];

  const runLoadingSequence = () => {
    let index = 0;
    setLoadingMessage(loadingSequence[0]);
    const interval = setInterval(() => {
      index = (index + 1) % loadingSequence.length;
      setLoadingMessage(loadingSequence[index]);
    }, 2200);
    return interval;
  };

  const handleEvaluate = async () => {
    if (!selectedScenario || !userSolution.trim()) return;

    setIsLoading(true);
    setError(null);
    const intervalId = runLoadingSequence();

    try {
      const response = await fetch("/api/practice/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioTitle: selectedScenario.title,
          scenarioPrompt: selectedScenario.prompt,
          userSolution,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An error occurred during evaluation.");
      }

      setEvaluationResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not connect to the evaluation server.");
    } finally {
      clearInterval(intervalId);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEvaluationResult(null);
    setUserSolution("");
    setError(null);
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header boundary */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">AI System Design Interview Simulator</h2>
            <p className="text-[10px] text-slate-500">Practice scale estimation and architecture design, evaluated by staff engineers.</p>
          </div>
        </div>
        {selectedScenario && (
          <button
            onClick={() => {
              setSelectedScenario(null);
              handleReset();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-3xs font-semibold cursor-pointer transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Change Scenario
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Scenario Selection dashboard */}
        {!selectedScenario ? (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50 border border-slate-200/60 p-5 rounded-xl shadow-3xs">
              <div className="max-w-xl space-y-1">
                <h3 className="text-base font-bold text-slate-900">Select a System Design Scenario</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Choose a core distributed problem or dynamically trigger our custom AI Generator to formulate a completely unique, advanced architecture problem in real-time.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  disabled={isGeneratingScenario}
                  onClick={() => handleGenerateScenario("Medium")}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer shadow-sm shadow-indigo-500/10 hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isGeneratingScenario ? "animate-spin" : ""}`} />
                  {isGeneratingScenario ? "Formulating Problem..." : "AI Generate (Medium)"}
                </button>
                <button
                  disabled={isGeneratingScenario}
                  onClick={() => handleGenerateScenario("Hard")}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer hover:shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Award className={`w-3.5 h-3.5 ${isGeneratingScenario ? "animate-spin" : ""}`} />
                  AI Generate (Hard)
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc)}
                  className="bg-slate-50/60 rounded-xl border border-slate-200 p-5 space-y-4 hover:border-indigo-300 hover:bg-white cursor-pointer group hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold font-mono uppercase ${
                        sc.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        sc.difficulty === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {sc.difficulty}
                      </span>
                      <span className="text-slate-500 text-xs font-mono font-semibold">{sc.estimatedTime}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{sc.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{sc.tagline}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-[10px] font-mono text-slate-500">
                    <div>
                      <span className="text-slate-400 block font-semibold">Baseline Scale:</span>
                      <span className="text-slate-700 font-bold truncate block">{sc.qps}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Baseline Storage:</span>
                      <span className="text-slate-700 font-bold truncate block">{sc.storage}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full">
            {/* Loading Overlay */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-96 space-y-4 animate-fade-in text-center max-w-sm mx-auto">
                <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs font-mono uppercase tracking-wider">Evaluating System Design</h4>
                  <p className="text-xs text-indigo-600 font-mono italic font-bold animate-pulse">{loadingMessage}</p>
                </div>
              </div>
            )}

            {/* Error display */}
            {error && !isLoading && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 max-w-xl mx-auto text-center space-y-4 animate-fade-in my-6">
                <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-bold text-rose-950 text-sm">Evaluation Execution Failed</h3>
                  <p className="text-xs text-rose-800 leading-relaxed">{error}</p>
                </div>
                <button
                  onClick={handleEvaluate}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-rose-500/10 cursor-pointer"
                >
                  Retry Evaluation
                </button>
              </div>
            )}

            {/* Editing Sandbox Workspace */}
            {!isLoading && !evaluationResult && !error && (
              <div className="grid lg:grid-cols-12 gap-6 h-full text-xs">
                {/* Scenario details (Col span 5) */}
                <div className="lg:col-span-5 flex flex-col bg-slate-50/40 rounded-xl border border-slate-200 p-5 space-y-4 overflow-y-auto shadow-3xs">
                  <div className="border-b border-slate-200 pb-3">
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded font-mono font-bold uppercase">
                      Active Problem
                    </span>
                    <h3 className="font-bold text-lg text-slate-900 mt-2.5">{selectedScenario.title}</h3>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Functional Prompt Requirements</span>
                    <p className="text-slate-600 leading-relaxed">{selectedScenario.prompt}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-200 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 block font-semibold">Baseline Scale (QPS)</span>
                      <span className="text-indigo-600 font-bold block">{selectedScenario.qps}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Storage Budget</span>
                      <span className="text-indigo-600 font-bold block">{selectedScenario.storage}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" /> Architect Sizing Tips
                    </span>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                      {selectedScenario.starterTips.map((tip, idx) => (
                        <li key={idx} className="leading-relaxed">{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Proposal Input Terminal (Col span 7) */}
                <div className="lg:col-span-7 flex flex-col bg-slate-900 border border-slate-950 rounded-xl overflow-hidden shadow-md">
                  <div className="bg-slate-850 px-4 py-3 border-b border-slate-950 flex items-center justify-between text-white">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="font-mono text-slate-400 text-[10px] pl-2">practice_workspace.txt</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">ANSI UTF-8</span>
                  </div>

                  <textarea
                    value={userSolution}
                    onChange={(e) => setUserSolution(e.target.value)}
                    placeholder={`# Paste or Type your system architecture proposal here...

1. SCALE ESTIMATION & HARDWARE PROVISIONING
   * QPS Estimates (Writes/Reads)...
   * Bandwidth & Memory sizing...

2. COMPONENT LOGIC & SYSTEM API INTERFACES
   * API endpoints (REST / gRPC)...
   * Microservices boundaries...

3. STORAGE STRATEGY & PERSISTENCE CHOICES
   * Main database choice (SQL vs NoSQL)...
   * Replication & Cache layers (Redis, CDN)...

4. FAULT TOLERANCE & SCALE STRATEGIES
   * Mitigating Single Points of Failure...
   * Load balancers, rate limiters, multi-regions...`}
                    className="flex-1 p-5 font-mono text-[11px] text-slate-100 bg-slate-950 outline-none border-none resize-none leading-relaxed select-text placeholder-slate-650 focus:ring-1 focus:ring-indigo-500/30"
                  />

                  <div className="bg-slate-850 px-4 py-3 border-t border-slate-950 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      {userSolution.length} characters written
                    </span>
                    <button
                      onClick={handleEvaluate}
                      disabled={!userSolution.trim()}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                        userSolution.trim()
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/10 cursor-pointer"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Submit to Staff Interviewer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Evaluation Report */}
            {evaluationResult && !isLoading && !error && (
              <div className="space-y-6 animate-fade-in select-text">
                {/* Top overview card */}
                <div className="bg-slate-50/60 rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
                  <div className="space-y-2 max-w-xl text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono text-[10px] font-bold uppercase tracking-wider">
                        Evaluation Verdict
                      </span>
                      <span className={`px-2.5 py-0.5 rounded border font-mono text-[10px] font-bold uppercase tracking-wider ${
                        evaluationResult.verdict.includes("Pass") ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}>
                        {evaluationResult.verdict}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 font-sans">
                      Performance Summary for {selectedScenario.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {evaluationResult.summary}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center bg-white p-5 rounded-xl border border-slate-200 shrink-0 w-36 h-36 shadow-3xs">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Interview Score</span>
                    <span className={`text-4xl font-extrabold font-mono mt-1 ${
                      evaluationResult.score >= 80 ? "text-emerald-600" : evaluationResult.score >= 60 ? "text-amber-600" : "text-rose-600"
                    }`}>
                      {evaluationResult.score}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono mt-1">out of 100</span>
                  </div>
                </div>

                {/* Sub-rubric dimension grids */}
                <div className="grid md:grid-cols-2 gap-4">
                  {evaluationResult.dimensions.map((dim, idx) => (
                    <div key={idx} className="bg-slate-50/40 border border-slate-200 rounded-xl p-5 space-y-3 shadow-3xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <h4 className="font-bold text-slate-900 text-xs">{dim.name}</h4>
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-mono font-bold uppercase ${
                          dim.rating === "Excellent" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                          dim.rating === "Good" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                          dim.rating === "Needs Improvement" ? "bg-amber-50 text-amber-700 border-amber-100" :
                          "bg-rose-50 text-rose-700 border-rose-100"
                        }`}>
                          {dim.rating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{dim.feedback}</p>
                    </div>
                  ))}
                </div>

                {/* Strengths and Gaps lists */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-emerald-50/30 border border-emerald-200 rounded-xl p-5 space-y-3 shadow-3xs">
                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-150 pb-2.5">
                      <CheckCircle className="w-4 h-4" /> Architectural Strengths
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-750">
                      {evaluationResult.strengths.map((str, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-emerald-600 font-bold font-mono shrink-0 pt-0.5">✔</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Gaps */}
                  <div className="bg-rose-50/30 border border-rose-200 rounded-xl p-5 space-y-3 shadow-3xs">
                    <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-rose-150 pb-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" /> Identified Bottlenecks & Gaps
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-750">
                      {evaluationResult.gaps.map((gap, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-rose-600 font-bold font-mono shrink-0 pt-0.5">✘</span>
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended architecture */}
                <div className="bg-indigo-50/50 border-2 border-indigo-200 rounded-xl p-5 space-y-3 shadow-sm shadow-indigo-500/5">
                  <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-150 pb-2.5">
                    <Award className="w-4 h-4" /> Google Staff Architect Reference Model
                  </h4>
                  <p className="text-xs text-slate-800 leading-relaxed bg-white p-4 rounded-xl border border-indigo-150 font-medium">
                    {evaluationResult.recommendedArchitecture}
                  </p>
                </div>

                {/* Action hub */}
                <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-750 hover:bg-slate-50 text-xs font-bold rounded-lg cursor-pointer transition-all shadow-3xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Practice Scenario Again
                  </button>
                  <button
                    onClick={() => {
                      setSelectedScenario(null);
                      handleReset();
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-bold rounded-lg cursor-pointer transition-all shadow-sm shadow-indigo-500/10"
                  >
                    Select Another Problem
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
