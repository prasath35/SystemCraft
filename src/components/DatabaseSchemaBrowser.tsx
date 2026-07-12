import React, { useState } from "react";
import { Database, Copy, Check, Terminal, FileText, Share2, HelpCircle } from "lucide-react";
import { tableSchemas, databaseStrategies, flywayMigrationOrder, relationalSchemas, mermaidErDiagram, plantUmlErDiagram } from "../data/databaseData";

export default function DatabaseSchemaBrowser() {
  const [activeTab, setActiveTab] = useState<"tables" | "strategies" | "migrations" | "er">("tables");
  const [selectedTable, setSelectedTable] = useState<string>("users");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const currentTable = tableSchemas.find((t) => t.name === selectedTable) || tableSchemas[0];

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Tab bar header */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 p-2 gap-1.5 overflow-x-auto">
        {[
          { id: "tables", label: "PostgreSQL Tables & Columns", icon: Database },
          { id: "strategies", label: "Relational Strategies", icon: Share2 },
          { id: "migrations", label: "Flyway Migration Hub", icon: Terminal },
          { id: "er", label: "ER Diagram Visualizer", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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
        {/* PostgreSQL Tables & Columns tab */}
        {activeTab === "tables" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Database className="text-indigo-600 w-5 h-5" /> PostgreSQL 16 Schema Specification
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Rigid relational schemas enforcing strict ACID properties alongside optimized database index mappings.
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start">
                {tableSchemas.map((table) => (
                  <button
                    key={table.name}
                    onClick={() => setSelectedTable(table.name)}
                    className={`px-3 py-1.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                      selectedTable === table.name ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {table.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              {/* Columns list (Col span 7) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-50/40 border border-slate-200 rounded-xl overflow-hidden p-5 shadow-3xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 font-mono">{currentTable.name}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{currentTable.description}</p>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2.5 py-0.5 rounded-full font-mono uppercase">
                      Active
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-3xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-mono text-[10px] border-b border-slate-200">
                          <th className="p-3 font-bold">Column</th>
                          <th className="p-3 font-bold">Type</th>
                          <th className="p-3 font-bold">Attributes</th>
                          <th className="p-3 font-bold">Functional Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {currentTable.columns.map((col) => (
                          <tr key={col.name} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-mono font-bold text-indigo-600">{col.name}</td>
                            <td className="p-3 font-mono text-slate-700 text-[11px]">{col.type}</td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {col.isPrimary && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold">
                                    PK
                                  </span>
                                )}
                                {col.isForeign && (
                                  <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-bold" title={`References ${col.references}`}>
                                    FK
                                  </span>
                                )}
                                {!col.nullable && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 text-[9px] font-semibold">
                                    NOT NULL
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-slate-600 leading-normal text-[11px]">{col.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Index details block */}
                <div className="bg-slate-50/40 border border-slate-200 rounded-xl p-5 space-y-3 shadow-3xs">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Indices and Query Optimizations</h4>
                  <div className="space-y-3">
                    {currentTable.indexes.map((idx) => (
                      <div key={idx.name} className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 justify-between shadow-3xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono text-[10px] font-bold">
                              {idx.type}
                            </span>
                            <span className="font-mono text-xs text-slate-900 font-bold">{idx.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Columns: {idx.columns.join(", ")}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600 md:max-w-xs self-center leading-relaxed">
                          {idx.purpose}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Copy SQL DDL block (Col span 5) */}
              <div className="lg:col-span-5 flex flex-col bg-slate-900 border border-slate-950 rounded-xl overflow-hidden h-[460px] shadow-md">
                <div className="bg-slate-800 px-4 py-2.5 border-b border-slate-950 flex items-center justify-between text-xs text-white">
                  <span className="font-mono text-slate-300">SQL DDL Creation Schema</span>
                  <button
                    onClick={() => handleCopy(currentTable.ddl, currentTable.name)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] text-slate-300 bg-slate-700/80 hover:bg-slate-700 hover:text-white border border-slate-600/30 rounded transition-all font-mono font-bold cursor-pointer"
                  >
                    {copiedText === currentTable.name ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy DDL
                      </>
                    )}
                  </button>
                </div>
                <pre className="flex-1 p-4 overflow-auto font-mono text-[11px] text-slate-300 bg-slate-950 leading-normal select-text">
                  {currentTable.ddl}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Database Strategies tab */}
        {activeTab === "strategies" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Share2 className="text-indigo-600 w-5 h-5" /> Persistent Database Strategies
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                In-depth architectural justifications explaining UUIDv7 sequencing, semi-structured JSONB columns, and GIN optimizations.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(databaseStrategies).map(([key, strat]) => (
                <div key={key} className="bg-slate-50/60 rounded-xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between hover:border-indigo-300 hover:bg-white hover:shadow-xs transition-all duration-200">
                  <div className="space-y-2">
                    <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg w-9 h-9 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{strat.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1.5">{strat.content}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                    Category: {key === "uuid" ? "Identification" : key === "jsonb" ? "Document Storage" : "Query Indexing"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flyway Migrations Tab */}
        {activeTab === "migrations" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Terminal className="text-indigo-600 w-5 h-5" /> Flyway Database Migration Pipeline
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Immutable, sequential SQL schema migrations ordered strictly by version history.
              </p>
            </div>
            <div className="space-y-4">
              {flywayMigrationOrder.map((mig) => (
                <div key={mig.version} className="bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:bg-white transition-all shadow-xs duration-250">
                  <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200 font-mono text-[10px] font-bold">
                        {mig.version}
                      </span>
                      <h3 className="font-bold text-slate-900 text-xs mt-1">{mig.name}</h3>
                    </div>
                    <button
                      onClick={() => handleCopy(mig.sql, mig.version)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[10px] text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded shadow-3xs transition-all font-mono font-bold cursor-pointer"
                    >
                      {copiedText === mig.version ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Coerced!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy SQL
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-5 grid md:grid-cols-12 gap-4">
                    <div className="md:col-span-4 space-y-2 text-xs text-slate-600 leading-relaxed pr-4">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Migration Intent</span>
                      <p>{mig.description}</p>
                    </div>
                    <div className="md:col-span-8 bg-slate-950 p-3.5 rounded-xl border border-slate-900 max-h-48 overflow-y-auto">
                      <pre className="font-mono text-[10px] text-teal-300 leading-normal select-text">
                        {mig.sql}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Entity-Relationship diagram */}
        {activeTab === "er" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="text-indigo-600 w-5 h-5" /> Entity-Relationship Topology
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  ER model in both Mermaid and PlantUML formatting demonstrating relational constraints.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(mermaidErDiagram, "mermaid_er")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded shadow-3xs transition-all font-mono font-bold cursor-pointer"
                >
                  {copiedText === "mermaid_er" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copy Mermaid ER
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Mermaid ER
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleCopy(plantUmlErDiagram, "plantuml_er")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded shadow-3xs transition-all font-mono font-bold cursor-pointer"
                >
                  {copiedText === "plantuml_er" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copy PlantUML ER
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy PlantUML ER
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              {/* ER Explanation & Relationships mapping (Col span 7) */}
              <div className="lg:col-span-7 bg-slate-50/40 border border-slate-200 rounded-xl p-5 space-y-4 shadow-3xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Functional Relational Mappings</h3>
                <div className="space-y-3">
                  {relationalSchemas.map((rel, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs hover:border-indigo-100 hover:bg-slate-50/40 transition-all duration-200">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-600 border-b border-slate-150 pb-1.5 mb-2">
                        <span>{rel.fromTable}</span>
                        <span className="text-slate-400 font-sans font-medium">&rarr; {rel.type} &rarr;</span>
                        <span>{rel.toTable}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rel.description}</p>
                    </div>
                  ))}
                </div>

                {/* Styled static diagram block */}
                <div className="border border-slate-200 rounded-xl bg-white p-4 shadow-3xs mt-4 space-y-2">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider font-mono">Structural Relationship Topology Map</span>
                  <div className="grid grid-cols-5 gap-2 items-center text-center font-mono text-[10px] py-4">
                    <div className="col-span-1 bg-slate-100 p-2 rounded-lg text-slate-700 border border-slate-200 font-bold">
                      <strong>users</strong>
                    </div>
                    <div className="col-span-1 text-slate-400 text-xs">
                      1 &larr;&mdash;&mdash;
                    </div>
                    <div className="col-span-1 bg-indigo-600 p-2.5 rounded-lg border border-indigo-700 text-white shadow-md shadow-indigo-500/10 font-bold">
                      <strong>evaluation_history</strong>
                    </div>
                    <div className="col-span-1 text-slate-400 text-xs">
                      &mdash;&mdash;&rarr; *
                    </div>
                    <div className="col-span-1 bg-slate-100 p-2 rounded-lg text-slate-700 border border-slate-200 font-bold">
                      <strong>practice_scenarios</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* PlantUML source code viewer (Col span 5) */}
              <div className="lg:col-span-5 flex flex-col bg-slate-900 border border-slate-950 rounded-xl overflow-hidden h-[440px] shadow-md">
                <div className="bg-slate-800 px-4 py-2.5 border-b border-slate-950 flex items-center justify-between text-xs text-white">
                  <span className="font-mono text-slate-300">PlantUML ER Source Code</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono">PUML</span>
                </div>
                <pre className="flex-1 p-4 overflow-auto font-mono text-[10px] text-slate-300 bg-slate-950 leading-normal selection:bg-emerald-500/20">
                  {plantUmlErDiagram}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
