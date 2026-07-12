import React, { useState, type ChangeEvent } from "react";
import { springBootFiles } from "../data/springBootData";
import { FileCode, Search, Copy, Check, Info, Server, Layers } from "lucide-react";

declare module "react" {
  const React: any;
  export default React;
  export const useState: any;
  export type ChangeEvent<T = Element> = any;
}
declare module "react/jsx-runtime" {
  export function jsx(type: any, props: any, key?: string | number): any;
  export function jsxs(type: any, props: any, key?: string | number): any;
  export function jsxDEV(type: any, props: any, key?: string | number): any;
}
declare module "lucide-react" {
  export const FileCode: any;
  export const Search: any;
  export const Copy: any;
  export const Check: any;
  export const Info: any;
  export const Server: any;
  export const Layers: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

interface BackendExplorerProps {
  isLightMode: boolean;
}

export default function BackendExplorer({ isLightMode }: BackendExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFileId, setActiveFileId] = useState<string>(springBootFiles[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ["All", "Entity", "DTO", "Repository", "Service", "Controller", "Security", "Exception", "Flyway", "Test"];

  const filteredFiles = springBootFiles.filter(file => {
    const matchesCat = selectedCategory === "All" || file.category === selectedCategory;
    const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeFile = springBootFiles.find(f => f.id === activeFileId) || springBootFiles[0];

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 font-sans animate-fade-in select-text">
      {/* Sidebar File Tree (Col span 4) */}
      <div className={`lg:col-span-4 flex flex-col rounded-2xl border p-5 space-y-4 ${
        isLightMode ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-850"
      }`}>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
            Spring Boot Codebase Explorer
          </h3>
          <p className="text-[10px] text-slate-500">
            Production-grade JPA entities, DTO validations, security filters, and flyway migration models.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search class files..."
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none border transition-all ${
              isLightMode 
                ? "bg-slate-50 border-slate-200 text-slate-850 focus:border-purple-400" 
                : "bg-slate-950 border-slate-850 text-slate-100 focus:border-purple-500/30"
            }`}
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-1 border-b border-slate-800/40 pb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded-md text-[9px] font-bold font-mono uppercase tracking-wide cursor-pointer transition-all ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800/40 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* File List */}
        <div className="space-y-1 overflow-y-auto max-h-[50vh] pr-1">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`p-2.5 rounded-lg flex items-center gap-3 cursor-pointer transition-all ${
                  activeFileId === file.id
                    ? "bg-purple-950/10 text-purple-400"
                    : isLightMode
                      ? "text-slate-700 hover:bg-slate-100"
                      : "text-slate-450 hover:bg-slate-950/40 hover:text-slate-200"
                }`}
              >
                {file.category === "Flyway" ? (
                  <Layers className="w-4 h-4 shrink-0 opacity-80" />
                ) : (
                  <FileCode className="w-4 h-4 shrink-0 opacity-80" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold font-mono truncate">{file.fileName}</div>
                  <div className="text-[9px] text-slate-500 font-mono truncate">{file.path}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-slate-500 py-6">No matches found in codebase.</div>
          )}
        </div>
      </div>

      {/* Code Editor and Docs View (Col span 8) */}
      <div className={`lg:col-span-8 flex flex-col rounded-2xl border overflow-hidden ${
        isLightMode ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-850"
      }`}>
        {/* Path Bar */}
        <div className="bg-slate-950/40 px-5 py-3 border-b border-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-450">
            <Server className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-300 font-bold">{activeFile.path}</span>
          </div>

          <button
            onClick={() => handleCopyCode(activeFile.id, activeFile.code)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-800 text-[10px] text-slate-400 hover:text-slate-200 transition-all cursor-pointer font-bold font-mono uppercase"
          >
            {copiedId === activeFile.id ? (
              <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</>
            ) : (
              <><Copy className="w-3.5 h-3.5" /> Copy Code</>
            )}
          </button>
        </div>

        {/* Code Information Banner */}
        <div className="bg-purple-950/5 px-5 py-4 border-b border-slate-850 flex gap-3 text-xs text-slate-400 items-start">
          <Info className="w-4.5 h-4.5 text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-purple-400 font-mono tracking-widest block">Class Analysis</span>
            <p className="leading-relaxed text-[11px]">{activeFile.description}</p>
          </div>
        </div>

        {/* Syntax-Colored Read-Only editor */}
        <div className="flex-1 p-5 bg-slate-950 text-slate-300 font-mono text-[10.5px] leading-relaxed overflow-x-auto overflow-y-auto max-h-[60vh] select-text">
          <pre>{activeFile.code}</pre>
        </div>
      </div>
    </div>
  );
}
