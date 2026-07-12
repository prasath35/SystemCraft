import React, { useState } from "react";
import { Folder, File, ChevronRight, ChevronDown, FolderOpen, Info, HardDrive } from "lucide-react";
import { FolderNode } from "../types";
import { folderStructure } from "../data/folderData";

interface TreeItemProps {
  key?: React.Key;
  node: FolderNode;
  selectedNode: FolderNode | null;
  onSelect: (node: FolderNode) => void;
  level: number;
}

function TreeItem({ node, selectedNode, onSelect, level }: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-open top levels
  const isSelected = selectedNode?.name === node.name;
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
    onSelect(node);
  };

  return (
    <div className="select-none text-xs">
      <div
        onClick={handleToggle}
        style={{ paddingLeft: `${level * 14 + 8}px` }}
        className={`flex items-center gap-2 py-1.5 px-3 rounded-md cursor-pointer group transition-all ${
          isSelected
            ? "bg-indigo-50 text-indigo-700 font-bold border-l-2 border-indigo-600 shadow-3xs"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <div className="w-4 h-4 flex items-center justify-center">
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )
          ) : null}
        </div>

        <div className="flex items-center gap-1.5">
          {node.type === "folder" ? (
            isOpen ? (
              <FolderOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-indigo-600 shrink-0" />
            )
          ) : (
            <File className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <span className="font-mono">{node.name}</span>
        </div>
      </div>

      {hasChildren && isOpen && (
        <div className="mt-0.5">
          {node.children!.map((child, idx) => (
            <TreeItem
              key={idx}
              node={child}
              selectedNode={selectedNode}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FolderStructureExplorer() {
  const [selectedNode, setSelectedNode] = useState<FolderNode | null>(folderStructure);

  return (
    <div className="grid md:grid-cols-12 gap-6 h-full text-slate-800">
      {/* File Explorer Tree view (Col span 5) */}
      <div className="md:col-span-5 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-xs text-slate-900">Production Repository Structure</span>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded font-mono font-bold">
            Monorepo
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-white">
          <TreeItem
            node={folderStructure}
            selectedNode={selectedNode}
            onSelect={setSelectedNode}
            level={0}
          />
        </div>
      </div>

      {/* Explanations & architectural values panel (Col span 7) */}
      <div className="md:col-span-7 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <Info className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-xs text-slate-900">Architectural Specifications & Trade-offs</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {selectedNode ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                <div className="p-2 rounded-lg bg-indigo-50">
                  {selectedNode.type === "folder" ? (
                    <FolderOpen className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <File className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-mono font-bold text-base text-slate-900">{selectedNode.name}</h3>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                    Type: {selectedNode.type}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Functional Intent</span>
                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-200 shadow-3xs">
                  {selectedNode.explanation}
                </p>
              </div>

              <div className="space-y-4 pt-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Design Patterns & Best Practices</span>
                
                {selectedNode.name.includes("backend") && (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-3xs">
                      <h4 className="font-semibold text-indigo-600">Spring Boot Ecosystem</h4>
                      <p className="text-slate-650 mt-1 text-[11px] leading-relaxed">
                        Enforces separation of concern using Spring Beans, transactions managed transparently with @Transactional, and security filters configured out-of-the-box.
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-3xs">
                      <h4 className="font-semibold text-indigo-600">Layered Clean Architecture</h4>
                      <p className="text-slate-650 mt-1 text-[11px] leading-relaxed">
                        Data flows from API layer through logic (Service) down to DB mappings (JPA Repository), preventing leakage of persistence details into client domains.
                      </p>
                    </div>
                  </div>
                )}

                {selectedNode.name.includes("frontend") && (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-3xs">
                      <h4 className="font-semibold text-indigo-600">SPA bundling via Vite</h4>
                      <p className="text-slate-650 mt-1 text-[11px] leading-relaxed">
                        Bundling relies on modern ES modules for ultra-fast compilation. Assets are automatically cached, compiled, and compressed during release cycles.
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-3xs">
                      <h4 className="font-semibold text-indigo-600">Component Composability</h4>
                      <p className="text-slate-650 mt-1 text-[11px] leading-relaxed">
                        Reusable layout primitives and state containers decouple rendering views from hardcoded data, optimizing performance and unit testing speed.
                      </p>
                    </div>
                  </div>
                )}

                {selectedNode.name.includes("infrastructure") && (
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-3xs">
                      <h4 className="font-semibold text-indigo-600">Terraform (IaC) Provisioning</h4>
                      <p className="text-slate-650 mt-1 text-[11px] leading-relaxed">
                        Infrastructure defined as declarative files. Prevents human configuration errors and guarantees repeatable cluster setups across multi-regions.
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-3xs">
                      <h4 className="font-semibold text-indigo-600">Container Isolation</h4>
                      <p className="text-slate-650 mt-1 text-[11px] leading-relaxed">
                        Backend services are wrapped in optimized multi-stage Docker images, which isolates system dependencies and speeds cold boot in serverless runners.
                      </p>
                    </div>
                  </div>
                )}

                {!selectedNode.name.includes("backend") && !selectedNode.name.includes("frontend") && !selectedNode.name.includes("infrastructure") && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    <h4 className="font-semibold text-indigo-600">Modular Workspace Standards</h4>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      Every directory is designed to promote developer productivity and system velocity. Clear ownership guidelines isolate client concerns from backend databases, simplifying onboarding.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-450">
              <FolderOpen className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs">Select a directory or file in the repository tree to inspect its detailed system architecture roles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
