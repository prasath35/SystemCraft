import React from "react";
import { Sparkles, ArrowRight, Activity, Cpu, Shield, Layers, Users, Zap, Terminal, Globe, Lock } from "lucide-react";

interface LandingPageProps {
  onGetStarted: (mode: "login" | "register") => void;
  isLightMode: boolean;
}

export default function LandingPage({ onGetStarted, isLightMode }: LandingPageProps) {
  const features = [
    {
      icon: Cpu,
      title: "Interactive System Canvas",
      description: "Drag-and-drop microservices, message queues, and global databases on a responsive grid background with automatic snapping.",
      color: "text-purple-500 bg-purple-500/10"
    },
    {
      icon: Sparkles,
      title: "Real-time AI Copilot",
      description: "Undergo constant architectural evaluation. The system scores your diagram topologies, detects single points of failure, and suggests missing layers.",
      color: "text-indigo-500 bg-indigo-500/10"
    },
    {
      icon: Terminal,
      title: "Google Staff-Engineer Evaluator",
      description: "Submit written scaling proposals and receive multi-dimensional scorecards mapped directly to FAANG hiring bars.",
      color: "text-blue-500 bg-blue-500/10"
    },
    {
      icon: Shield,
      title: "Production Code Architectures",
      description: "Sync your designs directly with production-ready Spring Boot backend structures, PostgreSQL schemas, and IEEE-standard SRS documents.",
      color: "text-emerald-500 bg-emerald-500/10"
    }
  ];

  const metrics = [
    { value: "500K+", label: "Architectures Evaluated" },
    { value: "< 2.5s", label: "Real-Time AI Response" },
    { value: "98.4%", label: "FAANG Interview Match Rate" },
    { value: "4.9/5", label: "Developer Satisfaction" }
  ];

  return (
    <div className={`min-h-[85vh] flex flex-col justify-between ${isLightMode ? "text-slate-800" : "text-slate-100"} animate-fade-in`}>
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto text-center px-4 pt-10 pb-16 space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/5 text-purple-400 text-[11px] font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 animate-spin" /> Next-Gen AI System Design Workspace
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Design <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400">Scale-Proof Systems</span>, Evaluated by Staff AI.
        </h1>

        <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The world's first unified platform combining interactive Figma-style system canvases, real-time AI architectural feedback, REST API sandboxes, and enterprise Spring Boot blueprints.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onGetStarted("register")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 cursor-pointer transition-all hover:-translate-y-0.5 duration-150"
          >
            Create Free Account <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGetStarted("login")}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
              isLightMode 
                ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-3xs" 
                : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white"
            }`}
          >
            Log In to Workspace
          </button>
        </div>

        {/* Target company alignment */}
        <div className="pt-8 border-t border-slate-800/40 max-w-3xl mx-auto space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-extrabold font-mono">
            Optimized for Senior & Staff Roles at Elite Tech
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 opacity-60">
            {["Google", "Meta", "Amazon", "Netflix", "Uber", "Stripe"].map((tech) => (
              <span key={tech} className="font-bold text-xs md:text-sm font-mono tracking-wider">
                {tech.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bento-style Feature grid */}
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl border p-6 flex flex-col justify-between space-y-4 transition-all hover:scale-[1.02] duration-200 ${
                isLightMode 
                  ? "bg-white border-slate-150 shadow-xs hover:border-purple-300" 
                  : "bg-slate-900/60 border-slate-850 hover:border-purple-500/30 hover:bg-slate-900"
              }`}
            >
              <div className="space-y-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold tracking-tight">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className={`py-12 border-y ${isLightMode ? "border-slate-100 bg-slate-50/50" : "border-slate-850 bg-slate-950/40"} mt-6`}>
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {metrics.map((met, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 font-mono">
                {met.value}
              </div>
              <div className="text-[10px] md:text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {met.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Terminal Showcase block */}
      <div className="max-w-5xl mx-auto px-4 py-16 w-full">
        <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl">
          {/* Mock terminal header */}
          <div className="bg-slate-900 px-5 py-3.5 border-b border-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[10px] font-mono text-slate-500">architectai_copilot_daemon.sh</span>
            <div className="w-8" />
          </div>

          <div className="p-6 font-mono text-xs leading-relaxed space-y-4">
            <div className="flex items-center gap-2 text-purple-400">
              <Terminal className="w-4 h-4 animate-pulse" />
              <span>$ architectai --evaluate --canvas="youtube_transcoder"</span>
            </div>
            <div className="text-slate-400 pl-4">
              [SYSTEM] Compiling architectural nodes... (14 objects, 24 edges detected)<br />
              [SYSTEM] Running deep structural evaluations against scale benchmarks...<br />
              [COPOLIT] Analysis Complete. Score: <span className="text-emerald-400 font-bold">84 / 100 (Pass)</span>
            </div>
            <div className="border-t border-slate-800/50 pt-4 space-y-2">
              <div className="text-indigo-400 font-bold">● Bottlenecks Detected:</div>
              <div className="text-slate-300 pl-4 text-[11px]">
                ⚠️ No write absorption buffer (Kafka queue) between upload endpoint and transcode worker pods. Potential worker failure under celebrity upload spikes.<br />
                ⚠️ Metadata DB is single node. Recommend PostgreSQL Partitioning based on video UUID range.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
