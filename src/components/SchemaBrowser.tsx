import React, { useState } from "react";
import { Database, Table, Info, BookOpen, Layers, Terminal, Copy, Check } from "lucide-react";

export default function SchemaBrowser({ isLightMode }: { isLightMode: boolean }) {
  const [activeTab, setActiveTab] = useState<"ddl" | "indexes" | "flyway" | "sizing">("ddl");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const ddlScript = `-- PostgreSQL DDL Initialization Script
-- Optimized for high-throughput scaling & analytical metrics

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    target_company VARCHAR(100),
    experience_years INTEGER,
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scenario_id UUID NOT NULL,
    score INTEGER NOT NULL,
    verdict VARCHAR(50) NOT NULL,
    summary TEXT NOT NULL,
    user_solution TEXT NOT NULL,
    recommended_architecture TEXT,
    dimensions JSONB NOT NULL,
    strengths JSONB NOT NULL,
    gaps JSONB NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Establish GIN Index on JSONB for dynamic sub-field querying
CREATE INDEX idx_evaluations_json_dimensions ON evaluations USING gin (dimensions);
CREATE INDEX idx_evaluations_user_score ON evaluations(user_id, score DESC);`;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`rounded-2xl border p-6 space-y-6 font-sans animate-fade-in select-text ${
      isLightMode ? "bg-white border-slate-200 shadow-sm text-slate-800" : "bg-slate-900/60 border-slate-850 text-slate-100"
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="text-sm font-extrabold uppercase tracking-wide">
              PostgreSQL Schema & Tuning Browser
            </h3>
          </div>
          <p className="text-[10px] text-slate-500">
            Durable enterprise database schemas, relational sizing charts, and GIN/B-tree index selections.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-1">
          {[
            { id: "ddl", label: "SQL DDL Script" },
            { id: "indexes", label: "Indexing Tuning" },
            { id: "flyway", label: "Flyway Migration Logs" },
            { id: "sizing", label: "Sizing Estimates" }
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

      {/* Render selected content */}
      {activeTab === "ddl" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-purple-950/5 px-4 py-3 rounded-lg border border-slate-850">
            <div className="flex items-center gap-2 text-xs text-slate-450">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Standard PostgreSQL 15+ compatible DDL triggers.</span>
            </div>
            <button
              onClick={() => handleCopy("ddl", ddlScript)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950 border border-slate-850 text-[10px] font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              {copiedId === "ddl" ? (
                <><Check className="w-3 h-3 text-emerald-400" /> Copied</>
              ) : (
                "Copy DDL"
              )}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-850 font-mono text-[10.5px] leading-relaxed text-slate-300 overflow-x-auto max-h-[50vh] select-text">
            {ddlScript}
          </pre>
        </div>
      )}

      {activeTab === "indexes" && (
        <div className="space-y-4 text-xs text-slate-450 leading-relaxed">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-widest block">
                1. B-Tree Composite Indexing
              </span>
              <p className="text-[11px] text-slate-400">
                Created on <code className="text-purple-400 px-1 py-0.5 rounded bg-slate-900">evaluations(user_id, score DESC)</code>.
              </p>
              <p className="text-[10px] text-slate-500 leading-normal">
                Avoids filesorts when displaying the Candidate Leaderboard dashboard, optimizing query execution plans from O(N) linear scans down to O(log N) tree lookups.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
              <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono tracking-widest block">
                2. GIN Index (Generalized Inverted Index)
              </span>
              <p className="text-[11px] text-slate-400">
                Created on <code className="text-purple-400 px-1 py-0.5 rounded bg-slate-900">evaluations USING gin (dimensions)</code>.
              </p>
              <p className="text-[10px] text-slate-500 leading-normal">
                Maps sub-keys inside the dynamic JSONB object. Allows milliseconds latency lookups on complex nested properties (e.g., query ratings where "Security" = "Pass").
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "flyway" && (
        <div className="space-y-4">
          <div className="p-3 bg-purple-950/5 border border-slate-850 rounded-lg text-xs text-slate-400">
            Flyway tracks schema alterations on the <code className="px-1.5 py-0.2 rounded bg-slate-950 text-purple-400 font-mono text-[10px]">flyway_schema_history</code> log table.
          </div>

          {/* Table list */}
          <div className="border border-slate-850 rounded-xl overflow-hidden font-mono text-[10.5px]">
            <div className="grid grid-cols-5 bg-slate-950 px-4 py-2.5 font-bold text-slate-400 border-b border-slate-850">
              <div>Version</div>
              <div className="col-span-2">Description</div>
              <div>Type</div>
              <div>Status</div>
            </div>
            {[
              { version: "1.0.0", desc: "V1__init_schema.sql", type: "SQL", status: "SUCCESS" },
              { version: "1.1.0", desc: "V2__add_target_company_metrics.sql", type: "SQL", status: "SUCCESS" },
              { version: "1.2.0", desc: "V3__add_diagram_metadata_jsonb.sql", type: "SQL", status: "SUCCESS" }
            ].map((log, i) => (
              <div key={i} className="grid grid-cols-5 px-4 py-3 border-b border-slate-850/40 text-slate-300 items-center">
                <div className="text-slate-450">{log.version}</div>
                <div className="col-span-2 text-indigo-400 truncate">{log.desc}</div>
                <div>{log.type}</div>
                <div>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "sizing" && (
        <div className="space-y-4 text-xs text-slate-450 leading-relaxed">
          <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl space-y-3.5">
            <span className="text-[10px] uppercase font-bold text-purple-400 font-mono tracking-widest block">
              📊 10M Design Records Sizing Budget Calculator
            </span>
            <div className="grid sm:grid-cols-3 gap-4 font-mono text-[11px] text-slate-300">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-900">
                <span className="text-slate-500 block text-[9px]">Row size estimate</span>
                <span className="font-bold text-slate-200">~ 2.5 KB</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-900">
                <span className="text-slate-500 block text-[9px]">Total Data Payload</span>
                <span className="font-bold text-purple-400">~ 25 GB</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-900">
                <span className="text-slate-500 block text-[9px]">Indices buffer</span>
                <span className="font-bold text-indigo-400">~ 4.5 GB (18%)</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal font-mono">
              Calculation: 10,000,000 rows * 2.5 KB per row = 25,000,000 KB = 25 GB total DB size. Solid SSD setups require ~32 GB active storage to ensure indexing fits comfortably inside RAM, preserving &lt;5ms database lookup execution pools.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
