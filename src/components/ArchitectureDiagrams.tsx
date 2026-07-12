import React, { useState } from "react";
import { GitCommit, Settings, Layers, Server, Activity, Copy, Check, ChevronDown, Award, RefreshCw, Database } from "lucide-react";
import { componentDetails, designDecisions, authFlowSteps, aiFlowSteps, mermaidDiagrams } from "../data/architectureData";

export default function ArchitectureDiagrams() {
  const [activeSubSection, setActiveSubSection] = useState<"diagrams" | "components" | "decisions" | "sequences">("diagrams");
  const [selectedDiagram, setSelectedDiagram] = useState<"component" | "layered" | "deployment">("component");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Subtab navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 p-2 gap-1.5 overflow-x-auto">
        {[
          { id: "diagrams", label: "Architectural Diagrams (Mermaid)", icon: Layers },
          { id: "components", label: "Component Details", icon: Server },
          { id: "decisions", label: "Design Trade-offs (ADR)", icon: Settings },
          { id: "sequences", label: "Sequence Flows (Auth & AI)", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubSection(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Architectural Diagrams view */}
        {activeSubSection === "diagrams" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="text-indigo-600 w-5 h-5" /> Highly Scalable Architecture Diagram Repository
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enterprise-grade system topologies specified in copyable Mermaid format with custom styling blocks.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start">
                <button
                  onClick={() => setSelectedDiagram("component")}
                  className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedDiagram === "component" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  System Component
                </button>
                <button
                  onClick={() => setSelectedDiagram("layered")}
                  className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedDiagram === "layered" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Layered Model
                </button>
                <button
                  onClick={() => setSelectedDiagram("deployment")}
                  className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedDiagram === "deployment" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  GCP Deployment
                </button>
              </div>
            </div>

            {/* Custom Interactive Diagram Representation */}
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Visual Preview panel */}
              <div className="lg:col-span-7 bg-slate-50/40 rounded-xl border border-slate-200 p-5 overflow-x-auto min-h-[400px] flex flex-col justify-between shadow-3xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-xs font-mono text-indigo-700 font-bold uppercase tracking-wider">
                    {selectedDiagram === "component" && "System Component & Data Pipeline Overview"}
                    {selectedDiagram === "layered" && "Domain-Driven Backend Layers (DDD Pattern)"}
                    {selectedDiagram === "deployment" && "GCP Cloud Run & Kubernetes Topology"}
                  </span>
                  <button
                    onClick={() => handleCopy(
                      selectedDiagram === "component" ? mermaidDiagrams.systemComponent :
                      selectedDiagram === "layered" ? mermaidDiagrams.layeredArchitecture :
                      mermaidDiagrams.deploymentDiagram,
                      "mermaid"
                    )}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded shadow-3xs font-mono font-bold transition-all"
                  >
                    {copiedText === "mermaid" ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" /> Coerced!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Mermaid
                      </>
                    )}
                  </button>
                </div>

                {/* Render clean styled SVG/HTML mock diagrams representing these system paths */}
                <div className="flex-1 py-8 flex flex-col justify-center items-center">
                  {selectedDiagram === "component" && (
                    <div className="w-full max-w-lg space-y-4 font-mono text-[11px]">
                      {/* Client Box */}
                      <div className="bg-indigo-600 rounded-xl border border-indigo-700 p-3.5 text-center shadow-md shadow-indigo-500/10 text-white">
                        <span className="font-bold">Candidate Browser (React SPA)</span>
                        <div className="text-[10px] text-indigo-100 mt-1">Interactions, Sandbox workspace & code inputs</div>
                      </div>
                      
                      <div className="text-center text-slate-400 font-bold">&darr; (Secure HTTPS Transport / TLS 1.3)</div>
                      
                      {/* Gateway Box */}
                      <div className="bg-slate-800 rounded-xl border border-slate-700 p-3.5 text-center text-white shadow-sm">
                        <span className="font-bold">Cloud Armor / Nginx Reverse Proxy Gateway</span>
                        <div className="text-[10px] text-slate-400 mt-1">Rate limiting, SSL termination, static SPA distribution</div>
                      </div>

                      <div className="text-center text-slate-400 font-bold">&darr; (Private VPC / Internal Load Balancing)</div>

                      {/* Spring backend Core */}
                      <div className="bg-white rounded-xl border-2 border-indigo-600/30 p-4 shadow-sm shadow-indigo-500/5">
                        <div className="text-indigo-600 font-bold text-center text-sm">Spring Boot Core Application Service</div>
                        <div className="grid grid-cols-2 gap-3 mt-2.5 text-[10px] text-slate-700">
                          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                            <strong className="text-slate-900 font-bold">OAuth Controller</strong>
                            <p className="text-slate-500 text-[9px] mt-0.5">PKCE code verification</p>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                            <strong className="text-slate-900 font-bold">AI Service Agent</strong>
                            <p className="text-slate-500 text-[9px] mt-0.5">Gemini 3.5 Flash proxy</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2 text-white">
                        <div className="bg-purple-900 rounded-xl border border-purple-800 p-3 text-center shadow-sm">
                          <span className="font-bold text-purple-200">Google Gemini AI Engine</span>
                          <p className="text-[9px] text-purple-300 mt-0.5">Generates system feedback</p>
                        </div>
                        <div className="bg-emerald-950 rounded-xl border border-emerald-900 p-3 text-center shadow-sm">
                          <span className="font-bold text-emerald-300">Cloud SQL (PostgreSQL 16)</span>
                          <p className="text-[9px] text-emerald-400 mt-0.5">Durable history tables</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedDiagram === "layered" && (
                    <div className="w-full max-w-lg space-y-3 font-mono text-[11px]">
                      {/* Controller Layer */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-3xs">
                        <div className="text-indigo-700 font-bold">1. PRESENTATION LAYER (REST Controllers)</div>
                        <p className="text-[10px] text-slate-500 mt-1">Handles JSON deserialization, CORS verification, and checks API quotas.</p>
                      </div>

                      <div className="text-center text-slate-400 font-bold">&darr; (Delegates validation & starts Spring Transaction)</div>

                      {/* Service Layer */}
                      <div className="bg-white border-2 border-indigo-600/30 rounded-xl p-3.5 shadow-sm">
                        <div className="text-indigo-600 font-bold">2. BUSINESS LOGIC LAYER (Service Beans)</div>
                        <p className="text-[10px] text-slate-600 mt-1">Orchestrates AI feedback pipeline and logs. Applies business logic rules (BR-01).</p>
                      </div>

                      <div className="text-center text-slate-400 font-bold">&darr; (Calls Spring Data Repositories)</div>

                      {/* Data Access Layer */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-3xs">
                        <div className="text-indigo-700 font-bold">3. PERSISTENCE LAYER (JPA & Hibernate)</div>
                        <p className="text-[10px] text-slate-500 mt-1">Hibernate maps logical object schemas down to relational SQL tables dynamically.</p>
                      </div>

                      <div className="text-center text-slate-400 font-bold">&darr; (Executes in Transaction pool)</div>

                      {/* DB Store */}
                      <div className="bg-emerald-950 text-emerald-300 border border-emerald-900 rounded-xl p-3 text-center shadow-xs">
                        <span className="font-bold">POSTGRESQL DATABASE</span>
                      </div>
                    </div>
                  )}

                  {selectedDiagram === "deployment" && (
                    <div className="w-full max-w-lg space-y-3 font-mono text-[11px]">
                      {/* CDN edge */}
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 text-center shadow-3xs">
                        <span className="text-indigo-700 font-bold">GCP Load Balancer + Edge CDN</span>
                        <p className="text-[9px] text-indigo-500 mt-0.5">Drives client asset routing and mitigates DDoS surges</p>
                      </div>

                      <div className="text-center text-slate-400 font-bold">&darr;</div>

                      {/* VPC Container orchestration */}
                      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                        <span className="text-indigo-600 font-bold block text-center">VPC Subnet: Cloud Run / GKE Orchestration</span>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-center">
                            <strong className="text-slate-800">Spring Pod 1</strong>
                            <p className="text-[9px] text-slate-500">Host port: 3000</p>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-center">
                            <strong className="text-slate-800">Spring Pod 2</strong>
                            <p className="text-[9px] text-slate-500">Host port: 3000</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-slate-400 font-bold">&darr;</div>

                      {/* DB subnet */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-3xs">
                        <span className="text-slate-800 font-bold block text-center">Private Database Subnet</span>
                        <div className="grid grid-cols-2 gap-3 mt-2 text-[10px] text-center">
                          <div className="bg-purple-900 text-purple-100 p-2 rounded-lg border border-purple-800">
                            <span className="font-bold block">GCP Memorystore</span>
                            <span className="text-purple-300 text-[9px]">Redis cluster</span>
                          </div>
                          <div className="bg-emerald-950 text-emerald-200 p-2 rounded-lg border border-emerald-900">
                            <span className="font-bold block">Cloud SQL DB</span>
                            <span className="text-emerald-400 text-[9px]">PostgreSQL 16 replica</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed shadow-3xs">
                  <strong>Architect's Insight:</strong> We utilize Docker containers behind path-routed proxies to completely separate user sessions from active AI operations. This decouples logic and protects keys.
                </div>
              </div>

              {/* Code/Markup Panel (Col span 5) */}
              <div className="lg:col-span-5 flex flex-col bg-slate-900 rounded-xl border border-slate-950 overflow-hidden h-[540px] shadow-md">
                <div className="bg-slate-800 px-4 py-2 border-b border-slate-950 flex items-center justify-between text-xs text-white">
                  <span className="font-mono text-slate-300">Mermaid.js Source Markup</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 text-[9px] font-mono">Source</span>
                </div>
                <pre className="flex-1 p-4 overflow-auto font-mono text-[10px] text-slate-300 bg-slate-950 leading-normal selection:bg-indigo-500/20 selection:text-white">
                  {selectedDiagram === "component" && mermaidDiagrams.systemComponent.trim()}
                  {selectedDiagram === "layered" && mermaidDiagrams.layeredArchitecture.trim()}
                  {selectedDiagram === "deployment" && mermaidDiagrams.deploymentDiagram.trim()}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Component list detailed details */}
        {activeSubSection === "components" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Server className="text-indigo-600 w-5 h-5" /> Workspace Component Breakdown
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Deep architectural profiles for every core module in our SaaS stack including technical trade-offs.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {componentDetails.map((comp) => (
                <div key={comp.id} className="bg-slate-50/60 rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-indigo-300 hover:bg-white hover:shadow-xs transition-all duration-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-mono font-bold">
                        {comp.id}
                      </span>
                      <span className="text-slate-500 text-xs font-mono font-semibold">{comp.type}</span>
                    </div>
                    <h3 className="font-bold text-slate-850 text-sm">{comp.name}</h3>
                    <p className="text-[11px] text-slate-500 font-mono italic">Tech: {comp.technology}</p>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">{comp.responsibility}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200 space-y-2.5">
                    <div>
                      <span className="text-[9px] uppercase font-extrabold text-emerald-600 tracking-wider">Advantages</span>
                      <ul className="list-disc pl-3.5 text-[10px] text-slate-600 mt-0.5 space-y-0.5">
                        {comp.pros.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-extrabold text-rose-600 tracking-wider">Limitations</span>
                      <ul className="list-disc pl-3.5 text-[10px] text-slate-600 mt-0.5 space-y-0.5">
                        {comp.cons.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Design Decisions (ADR) */}
        {activeSubSection === "decisions" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Settings className="text-indigo-600 w-5 h-5" /> Architecture Decision Records (ADRs)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Formalizing architectural trade-offs using industry-standard ADR templates suitable for Staff reviews.
              </p>
            </div>
            <div className="space-y-6">
              {designDecisions.map((decision) => (
                <div key={decision.id} className="bg-slate-50/50 rounded-xl border border-slate-200 p-5 space-y-4 hover:border-indigo-300 hover:bg-white transition-all shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 font-mono text-[10px] font-bold">
                        {decision.id}
                      </span>
                      <h3 className="font-bold text-slate-850 text-sm">{decision.topic}</h3>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-full font-mono uppercase">
                      Approved
                    </span>
                  </div>

                  <div className="grid md:grid-cols-12 gap-5 text-xs">
                    <div className="md:col-span-4 space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-3xs">
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-emerald-600 tracking-wider">Chosen Strategy</span>
                        <p className="text-xs text-slate-900 mt-1 font-bold">{decision.chosen}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Considered Alternatives</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {decision.alternatives.map((alt, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono text-[10px]">
                              {alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-8 space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Architectural Rationale & Trade-offs</span>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{decision.tradeOffs}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-indigo-600 tracking-wider">Critical Decision Factors</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {decision.decisionFactors.map((factor, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100 shadow-3xs">
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sequence Steps */}
        {activeSubSection === "sequences" && (
          <div className="space-y-8 animate-fade-in">
            {/* Sequence 1: Auth flow */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="text-indigo-600 w-4.5 h-4.5" /> 1. OAuth2 with PKCE Authentication Pipeline
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  How our SPA securely negotiates JSON Web Sessions with identity providers without storing secrets.
                </p>
              </div>

              <div className="grid md:grid-cols-5 gap-4">
                {authFlowSteps.map((step, idx) => (
                  <div key={idx} className="bg-slate-50/50 rounded-xl border border-slate-200 p-4 space-y-2 flex flex-col justify-between relative hover:border-indigo-300 hover:bg-white hover:shadow-2xs transition-all duration-200">
                    {idx < authFlowSteps.length - 1 && (
                      <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300 font-bold">
                        &rarr;
                      </div>
                    )}
                    <div className="space-y-1">
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-mono font-bold">
                        Step 0{idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs pt-1">{step.action}</h4>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {step.from} &rarr; {step.to}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pt-1.5">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sequence 2: AI flow */}
            <div className="space-y-4 border-t border-slate-200 pt-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <RefreshCw className="text-indigo-600 w-4.5 h-4.5 animate-spin-slow" /> 2. Server-Side AI Practice Evaluation Pipeline
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Secure server-side proxy route handling rate limits, Gemini context assembly, and persistent SQL logging.
                </p>
              </div>

              <div className="grid md:grid-cols-6 gap-3">
                {aiFlowSteps.map((step, idx) => (
                  <div key={idx} className="bg-slate-50/50 rounded-xl border border-slate-200 p-4 space-y-2 flex flex-col justify-between relative hover:border-indigo-300 hover:bg-white hover:shadow-2xs transition-all duration-200">
                    {idx < aiFlowSteps.length - 1 && (
                      <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300 font-bold">
                        &rarr;
                      </div>
                    )}
                    <div className="space-y-1">
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-mono font-bold">
                        Step 0{idx + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs pt-1">{step.action}</h4>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {step.from} &rarr; {step.to}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pt-1.5">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
