import React, { useState } from "react";
import { FileText, Users, Eye, Target, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

export default function SrsBrowser({ isLightMode }: { isLightMode: boolean }) {
  const [activeTab, setActiveTab] = useState<"intro" | "personas" | "functional" | "nonfunctional">("intro");

  return (
    <div className={`rounded-2xl border p-6 space-y-6 font-sans animate-fade-in select-text ${
      isLightMode ? "bg-white border-slate-200 shadow-sm text-slate-800" : "bg-slate-900/60 border-slate-850 text-slate-100"
    }`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400 shrink-0" />
            <h3 className="text-sm font-extrabold uppercase tracking-wide">
              IEEE SRS Requirements Console
            </h3>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            IEEE-Std-830 Software Requirements Specification mapped to System Design standards.
          </p>
        </div>

        {/* Pill Nav */}
        <div className="flex flex-wrap gap-1">
          {[
            { id: "intro", label: "Introduction & Scope" },
            { id: "personas", label: "User Personas" },
            { id: "functional", label: "Functional Specs" },
            { id: "nonfunctional", label: "Non-Functional Specs" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wide transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800/40 text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "intro" && (
        <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 font-mono">
              <Target className="w-4 h-4 text-purple-400" /> 1.0 Document Scope
            </h4>
            <p>
              This document specifies the software requirements specification for **ArchitectAI** (AI-Powered System Design Workspace & Interview Practice Platform). It provides SDE and System Architect candidates with automated, scalable visual diagram builders and staff-engineer equivalent feedback modules to prepare for senior SDE interviews at Google, Amazon, Uber, and Netflix.
            </p>
          </div>

          <div className="space-y-1.5 pt-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              2.0 Core Value Proposition
            </h4>
            <p>
              Traditional system design preparation is either entirely non-interactive (reading blogs) or requires expensive peer interview setups. ArchitectAI solves this bottleneck by establishing the industry's first **Unified Sandbox** connecting interactive SVG canvas topologies with live LLM (Gemini 3.5-flash) analysis algorithms.
            </p>
          </div>
        </div>
      )}

      {activeTab === "personas" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold font-mono text-xs">
                P1
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Alex - Senior Engineer (L5 to L6 promotion)</h4>
                <span className="text-[9px] text-slate-500 font-mono">5 Years Experience &bull; Scaling Target: Uber</span>
              </div>
            </div>
            <p className="text-[10.5px] text-slate-450 leading-relaxed">
              wants to practice complex distributed rate limiters and multi-datacenter consistency models. He requires instant structural feedback on single points of failure to refine his whiteboarding presentations.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold font-mono text-xs">
                P2
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Sarah - Mid-Level SDE (L4)</h4>
                <span className="text-[9px] text-slate-500 font-mono">2.5 Years Experience &bull; Target: Google</span>
              </div>
            </div>
            <p className="text-[10.5px] text-slate-450 leading-relaxed">
              needs structured system design templates (e.g. YouTube, Twitter Newsfeed) with guided feedback. She struggles with sizing calculations, DB choices, and caching patterns.
            </p>
          </div>
        </div>
      )}

      {activeTab === "functional" && (
        <div className="space-y-4">
          <div className="p-3 bg-purple-950/5 border border-slate-850 rounded-lg text-xs text-slate-400">
            Traceability Matrix of Functional Specifications:
          </div>

          <div className="border border-slate-850 rounded-xl overflow-hidden font-mono text-[10.5px]">
            <div className="grid grid-cols-4 bg-slate-950 px-4 py-2.5 font-bold text-slate-400 border-b border-slate-850">
              <div>Req ID</div>
              <div className="col-span-2">Requirement Description</div>
              <div>Verification</div>
            </div>
            {[
              { id: "FR-101", desc: "Figma-style drag & drop canvas with grids", test: "Interactive drag" },
              { id: "FR-102", desc: "Establish directional lines/edges between nodes", test: "Dynamic ports click" },
              { id: "FR-103", desc: "Automated topology analysis & scoring engine", test: "AI Audit simulation" },
              { id: "FR-104", desc: "Interactive Spring Boot backend code browser", test: "Class Explorer tab" },
              { id: "FR-105", desc: "Live REST API sandboxing with simulated response", test: "Test Call payload" }
            ].map((req, i) => (
              <div key={i} className="grid grid-cols-4 px-4 py-3 border-b border-slate-850/40 text-slate-300 items-center">
                <div className="text-purple-400 font-bold">{req.id}</div>
                <div className="col-span-2 text-slate-400">{req.desc}</div>
                <div className="text-slate-500">{req.test}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "nonfunctional" && (
        <div className="grid sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
            <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono tracking-widest block">
              Performance Budget
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              The interactive visual canvas must support dragging 50+ nodes and connection calculations smoothly, maintaining a high frame rendering cycle.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
            <span className="text-[10px] uppercase font-bold text-purple-400 font-mono tracking-widest block">
              Reliability (Auto-Save)
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Canvas state is synced dynamically to client storage. Sudden browser tab closes or crashes should result in zero architectural design progress loss.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
            <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-widest block">
              Security & Sandbox
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              All REST API call sandboxes are stateless, and authentication tokens are verified via cryptographically signed secure JWT structures.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
