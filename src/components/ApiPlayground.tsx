import React, { useState } from "react";
import { restApiEndpoints, ApiEndpoint } from "../data/restApiData";
import { Terminal, Send, Eye, Shield, Key, Sparkles, RefreshCw, Layers, Server } from "lucide-react";

interface ApiPlaygroundProps {
  isLightMode: boolean;
}

export default function ApiPlayground({ isLightMode }: ApiPlaygroundProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeEndpointId, setActiveEndpointId] = useState<string>(restApiEndpoints[0].id);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simulationResponse, setSimulationResponse] = useState<string | null>(null);

  const categories = ["All", "Auth", "Dashboard", "Problems", "Interviews", "Diagrams", "AI", "Analytics"];

  const filteredEndpoints = selectedCategory === "All"
    ? restApiEndpoints
    : restApiEndpoints.filter(ep => ep.category === selectedCategory);

  const activeEndpoint = restApiEndpoints.find(ep => ep.id === activeEndpointId) || restApiEndpoints[0];

  const handleSimulateApi = () => {
    setIsSimulating(true);
    setSimulationResponse(null);
    setSimulationLogs([
      `⚡ [HTTP] Initiating ${activeEndpoint.method} request to ${activeEndpoint.path}...`,
      `🔑 [AUTH] Checking credentials (Bearer JWT verification)...`,
    ]);

    let step = 0;
    const logs = [
      `🔐 [AUTH] JWT signature verified. User assigned: 'ROLE_USER'.`,
      `🧬 [VALIDATION] Checking request fields against strict constraints...`,
      `✓ [VALIDATION] Validated input parameters successfully.`,
      `📡 [DB] Connecting to read-replica Pool...`,
      `⚙️ [DB] Executing dynamic queries (Latency: 14ms)`,
      `✓ [HTTP] 200 OK. Returning response segment.`
    ];

    const interval = setInterval(() => {
      if (step < logs.length) {
        setSimulationLogs(prev => [...prev, logs[step]]);
        step++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setSimulationResponse(activeEndpoint.exampleResponse);
      }
    }, 400);
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case "GET": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "POST": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "PUT": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "DELETE": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 font-sans animate-fade-in select-text">
      {/* Category Filter and Endpoint List (Col span 5) */}
      <div className={`lg:col-span-5 flex flex-col rounded-2xl border p-5 space-y-4 ${
        isLightMode ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-850"
      }`}>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
            System REST API Catalog
          </h3>
          <p className="text-[10px] text-slate-500">
            Interactive specifications for our cloud microservices. Select an API to inspect.
          </p>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-1 border-b border-slate-800/40 pb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                const first = restApiEndpoints.find(ep => cat === "All" || ep.category === cat);
                if (first) setActiveEndpointId(first.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wide cursor-pointer transition-all ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800/40 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Endpoint List */}
        <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-1">
          {filteredEndpoints.map((ep) => (
            <div
              key={ep.id}
              onClick={() => {
                setActiveEndpointId(ep.id);
                setSimulationResponse(null);
                setSimulationLogs([]);
              }}
              className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer group transition-all duration-150 ${
                activeEndpointId === ep.id
                  ? "bg-purple-950/10 border-purple-500/40"
                  : isLightMode 
                    ? "bg-slate-50 border-slate-150 hover:bg-slate-100" 
                    : "bg-slate-950/40 border-slate-850 hover:border-slate-800"
              }`}
            >
              <div className="space-y-1 min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono border uppercase ${getMethodBadgeClass(ep.method)}`}>
                    {ep.method}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-200 transition-colors truncate">
                    {ep.path}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200 truncate">{ep.summary}</h4>
              </div>

              <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase shrink-0 ${
                ep.requiresAuth 
                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                  : "bg-slate-500/10 text-slate-500 border border-slate-800"
              }`}>
                {ep.requiresAuth ? "JWT" : "PUBLIC"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Endpoint Details and Sandbox Terminal (Col span 7) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* API Spec Document */}
        <div className={`rounded-2xl border p-6 space-y-5 ${
          isLightMode ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-850"
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className={`px-2 py-0.5 rounded border text-xs font-mono font-extrabold uppercase ${getMethodBadgeClass(activeEndpoint.method)}`}>
                  {activeEndpoint.method}
                </span>
                <span className="text-sm font-mono font-bold text-slate-200">{activeEndpoint.path}</span>
              </div>
              <h3 className="text-base font-bold text-purple-400">{activeEndpoint.summary}</h3>
            </div>

            <div className="flex items-center gap-2">
              {activeEndpoint.requiresAuth && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-purple-500/5 text-purple-400 border border-purple-500/15 text-[9px] font-mono uppercase font-bold">
                  <Shield className="w-3.5 h-3.5" /> Requires JWT Authentication
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Functional Description</span>
            <p className="text-xs text-slate-400 leading-relaxed">{activeEndpoint.description}</p>
          </div>

          {/* DTO specifications */}
          <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800/40 font-mono text-[10px]">
            <div>
              <span className="text-slate-500 block">Input DTO</span>
              <span className="text-slate-300 font-bold block">{activeEndpoint.dtoIn || "None (URL / Path Params)"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Output Response DTO</span>
              <span className="text-indigo-400 font-bold block">{activeEndpoint.dtoOut}</span>
            </div>
          </div>

          {/* Validation Rules */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Data Input Validation Schema</span>
            <ul className="space-y-1.5 text-xs text-slate-400 list-disc pl-4">
              {activeEndpoint.validationRules.length > 0 ? (
                activeEndpoint.validationRules.map((val, idx) => (
                  <li key={idx} className="leading-relaxed">{val}</li>
                ))
              ) : (
                <li className="leading-relaxed italic text-slate-500">No structured body parameters required.</li>
              )}
            </ul>
          </div>

          {/* Request / Response Collapsible JSON Views */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Payload Blueprint</span>
              <pre className="p-3.5 rounded-xl border border-slate-850 bg-slate-950 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-52 leading-relaxed select-all">
                {activeEndpoint.exampleRequest}
              </pre>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Standard Response Code</span>
              <pre className="p-3.5 rounded-xl border border-slate-850 bg-slate-950 font-mono text-[10px] text-indigo-300 overflow-x-auto max-h-52 leading-relaxed select-all">
                {activeEndpoint.exampleResponse}
              </pre>
            </div>
          </div>
        </div>

        {/* Live Simulator Console */}
        <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-xl flex flex-col h-72">
          {/* Terminal Console Header */}
          <div className="bg-slate-900 px-5 py-3 border-b border-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-400 font-bold">API Interactive Sandbox</span>
            </div>

            <button
              onClick={handleSimulateApi}
              disabled={isSimulating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wide transition-all cursor-pointer ${
                isSimulating
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/15"
              }`}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" /> In Flight
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" /> Test API Call
                </>
              )}
            </button>
          </div>

          {/* Simulated stdout and response */}
          <div className="flex-1 p-4 font-mono text-[10px] space-y-3 overflow-y-auto leading-relaxed select-text">
            {simulationLogs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-1">
                <span>No active requests sent.</span>
                <span>Click "Test API Call" to dispatch a mock sandbox packet.</span>
              </div>
            )}

            {simulationLogs.map((log, idx) => (
              <div key={idx} className="text-slate-400 animate-fade-in">{log}</div>
            ))}

            {simulationResponse && (
              <div className="pt-3 border-t border-slate-900 space-y-2 animate-fade-in">
                <span className="text-emerald-400 font-bold">📂 [RESPONSE BODY] HTTP 200 OK</span>
                <pre className="p-3 bg-slate-900 rounded border border-slate-850 text-indigo-300 text-[9px] overflow-x-auto leading-relaxed">
                  {simulationResponse}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
