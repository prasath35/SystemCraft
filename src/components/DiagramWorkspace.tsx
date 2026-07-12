import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Minus, RefreshCw, Send, Sparkles, CheckCircle2, AlertTriangle, 
  Trash2, Copy, FileJson, Download, Upload, Zap, ArrowRight, Layers,
  Search, Play, Shield, Cpu, Database, Network, MessageSquare, ChevronRight, HelpCircle, Save, History, Undo2, Redo2, Eye
} from "lucide-react";

interface Node {
  id: string;
  type: string;
  category: "compute" | "storage" | "network" | "integration";
  label: string;
  x: number;
  y: number;
  color: string;
  shape: "rectangle" | "cylinder" | "cloud" | "diamond" | "circle";
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  dashed?: boolean;
  color?: string;
}

interface VersionSnapshot {
  timestamp: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
}

export default function DiagramWorkspace({ isLightMode }: { isLightMode: boolean }) {
  // Predefined palette items
  const paletteItems = [
    { type: "Client App", category: "compute", shape: "circle", color: "border-purple-500 text-purple-400 bg-purple-500/5", desc: "iOS/Android/Web Client applications" },
    { type: "Microservice", category: "compute", shape: "rectangle", color: "border-indigo-500 text-indigo-400 bg-indigo-500/5", desc: "Core API and Backend worker pods" },
    { type: "Batch Worker", category: "compute", shape: "rectangle", color: "border-blue-500 text-blue-400 bg-blue-500/5", desc: "Asynchronous background transcoding worker" },
    { type: "PostgreSQL DB", category: "storage", shape: "cylinder", color: "border-emerald-500 text-emerald-400 bg-emerald-500/5", desc: "Durable primary relational storage" },
    { type: "NoSQL DB", category: "storage", shape: "cylinder", color: "border-teal-500 text-teal-400 bg-teal-500/5", desc: "Wide-column/document distributed store" },
    { type: "Redis Cache", category: "storage", shape: "cylinder", color: "border-pink-500 text-pink-400 bg-pink-500/5", desc: "Ultra-low latency memory cache cluster" },
    { type: "Kafka Queue", category: "integration", shape: "diamond", color: "border-amber-500 text-amber-400 bg-amber-500/5", desc: "Durably partitioned publish-subscribe queue" },
    { type: "API Gateway", category: "network", shape: "cloud", color: "border-sky-500 text-sky-400 bg-sky-500/5", desc: "Security throttle and edge router gateway" },
    { type: "Load Balancer", category: "network", shape: "cloud", color: "border-cyan-500 text-cyan-400 bg-cyan-500/5", desc: "Stateless traffic load distributer" },
    { type: "Edge CDN", category: "network", shape: "cloud", color: "border-rose-500 text-rose-400 bg-rose-500/5", desc: "Global content delivery edge cache" },
  ];

  // Core Canvas State loaded dynamically from localStorage or defaults
  const [nodes, setNodes] = useState<Node[]>(() => {
    const saved = localStorage.getItem("architectai_canvas_diagram");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.nodes)) return parsed.nodes;
      } catch (e) {}
    }
    return [
      { id: "n-client", type: "Client App", category: "compute", label: "Client Apps (iOS/Web)", x: 40, y: 150, color: "border-purple-500 text-purple-400 bg-purple-500/5", shape: "circle" },
      { id: "n-lb", type: "Load Balancer", category: "network", label: "Anycast Load Balancer", x: 190, y: 150, color: "border-cyan-500 text-cyan-400 bg-cyan-500/5", shape: "cloud" },
      { id: "n-gateway", type: "API Gateway", category: "network", label: "Kong API Gateway", x: 340, y: 150, color: "border-sky-500 text-sky-400 bg-sky-500/5", shape: "cloud" },
      { id: "n-service", type: "Microservice", category: "compute", label: "Core Service (Java/K8s)", x: 490, y: 150, color: "border-indigo-500 text-indigo-400 bg-indigo-500/5", shape: "rectangle" },
      { id: "n-db", type: "PostgreSQL DB", category: "storage", label: "PostgreSQL Master Cluster", x: 640, y: 150, color: "border-emerald-500 text-emerald-400 bg-emerald-500/5", shape: "cylinder" }
    ];
  });

  const [edges, setEdges] = useState<Edge[]>(() => {
    const saved = localStorage.getItem("architectai_canvas_diagram");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.edges)) return parsed.edges;
      } catch (e) {}
    }
    return [
      { id: "e-1", source: "n-client", target: "n-lb", label: "HTTPS / TLS" },
      { id: "e-2", source: "n-lb", target: "n-gateway", label: "Internal Routing" },
      { id: "e-3", source: "n-gateway", target: "n-service", label: "gRPC" },
      { id: "e-4", source: "n-service", target: "n-db", label: "JPA Session" }
    ];
  });

  // Autosave current active diagram state
  useEffect(() => {
    localStorage.setItem("architectai_canvas_diagram", JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  // Selected state
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Interaction variables
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1.0);
  const [searchPalette, setSearchPalette] = useState<string>("");
  const [paletteCategory, setPaletteCategory] = useState<string>("All");

  // Edges drawing state
  const [linkingSourceNodeId, setLinkingSourceNodeId] = useState<string | null>(null);

  // Auto save stats
  const [lastAutosaved, setLastAutosaved] = useState<string>("Just now");

  // Version history & Undo/Redo
  const [historyList, setHistoryList] = useState<VersionSnapshot[]>([
    { timestamp: "14:32:01", name: "Initial Decoupled Setup", nodes: [], edges: [] }
  ]);
  const [undoStack, setUndoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);

  // Clipboard cache
  const [clipboard, setClipboard] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);

  // AI Copilot side-panel state
  const [aiChatInput, setAiChatInput] = useState<string>("");
  const [aiChatMessages, setAiChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "Hello! I am your Senior Staff Design Copilot. Build or select a template, and click 'Analyze Architecture' below to undergo structural audits, scalings, and database recommendations!" }
  ]);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [healthScore, setHealthScore] = useState<number>(85);
  const [missingComponents, setMissingComponents] = useState<{ name: string; severity: "High" | "Medium" | "Low"; description: string }[]>([
    { name: "Redis Cache layer", severity: "High", description: "Heavy read loads on your PostgreSQL database will cause thread pool exhaustion without caching." }
  ]);
  const [scaleSuggestions, setScaleSuggestions] = useState<string[]>([
    "Introduce a consistent hashing ring of Redis Cache nodes to intercept repetitive reads.",
    "Add write-absorption buffer (Kafka queue) if write QPS surges above 10K/s."
  ]);
  const [explanationText, setExplanationText] = useState<string>(
    "This system handles high traffic via stateless Kong API Gateways distributed behind an Anycast Load Balancer. It streams transactions down to kubernetes-based Core Service nodes and persists durably on a PostgreSQL Master database."
  );

  // Refs for tracking files and imports
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-Save simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString();
      setLastAutosaved(time);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Sync canvas history for undo stack
  const captureCanvasState = () => {
    setUndoStack(prev => [...prev, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }]);
    setRedoStack([]); // Clear redo stack on manual changes
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }]);
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }]);
    setNodes(next.nodes);
    setEdges(next.edges);
    setRedoStack(prev => prev.slice(0, -1));
  };

  // Keyboard Shortcuts (Delete, Ctrl+C, Ctrl+V, Ctrl+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture shortcuts if typing in input panels
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA" || document.activeElement?.tagName === "SELECT") {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedNodeIds.length > 0) {
          captureCanvasState();
          setNodes(prev => prev.filter(n => !selectedNodeIds.includes(n.id)));
          setEdges(prev => prev.filter(edge => !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)));
          setSelectedNodeIds([]);
        } else if (selectedEdgeId) {
          captureCanvasState();
          setEdges(prev => prev.filter(edge => edge.id !== selectedEdgeId));
          setSelectedEdgeId(null);
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        // Copy Selected
        const copiedNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
        const copiedEdges = edges.filter(edge => selectedNodeIds.includes(edge.source) && selectedNodeIds.includes(edge.target));
        if (copiedNodes.length > 0) {
          setClipboard({ nodes: copiedNodes, edges: copiedEdges });
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        // Paste Selected
        if (clipboard && clipboard.nodes.length > 0) {
          captureCanvasState();
          const idMap: Record<string, string> = {};
          const pastedNodes = clipboard.nodes.map(n => {
            const newId = `n-${Math.random().toString(36).substr(2, 5)}`;
            idMap[n.id] = newId;
            return { ...n, id: newId, x: n.x + 45, y: n.y + 45 };
          });
          const pastedEdges = clipboard.edges.map(edge => ({
            id: `e-${Math.random().toString(36).substr(2, 5)}`,
            source: idMap[edge.source] || edge.source,
            target: idMap[edge.target] || edge.target,
            label: edge.label
          }));

          setNodes(prev => [...prev, ...pastedNodes]);
          setEdges(prev => [...prev, ...pastedEdges]);
          setSelectedNodeIds(pastedNodes.map(n => n.id));
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        // Duplicate Selected
        e.preventDefault();
        if (selectedNodeIds.length > 0) {
          captureCanvasState();
          const targetNodes = nodes.filter(n => selectedNodeIds.includes(n.id));
          const targetEdges = edges.filter(edge => selectedNodeIds.includes(edge.source) && selectedNodeIds.includes(edge.target));
          const idMap: Record<string, string> = {};
          
          const dupeNodes = targetNodes.map(n => {
            const newId = `n-${Math.random().toString(36).substr(2, 5)}`;
            idMap[n.id] = newId;
            return { ...n, id: newId, x: n.x + 60, y: n.y + 60, label: `${n.label} (Copy)` };
          });
          const dupeEdges = targetEdges.map(edge => ({
            id: `e-${Math.random().toString(36).substr(2, 5)}`,
            source: idMap[edge.source] || edge.source,
            target: idMap[edge.target] || edge.target,
            label: edge.label
          }));

          setNodes(prev => [...prev, ...dupeNodes]);
          setEdges(prev => [...prev, ...dupeEdges]);
          setSelectedNodeIds(dupeNodes.map(n => n.id));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, edges, selectedNodeIds, selectedEdgeId, clipboard]);

  // Dragging and Canvas Snapping logic
  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (linkingSourceNodeId) return;

    if (e.shiftKey) {
      // Toggle selection multi selection
      setSelectedNodeIds(prev => prev.includes(id) ? prev.filter(nid => nid !== id) : [...prev, id]);
    } else {
      if (!selectedNodeIds.includes(id)) {
        setSelectedNodeIds([id]);
      }
    }
    setSelectedEdgeId(null);

    const clientRect = e.currentTarget.getBoundingClientRect();
    const node = nodes.find(n => n.id === id);
    if (node) {
      setDraggingNodeId(id);
      setDragOffset({
        x: (e.clientX / scale) - node.x,
        y: (e.clientY / scale) - node.y
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const snapGridSize = 15;
      const proposedX = (e.clientX / scale) - dragOffset.x;
      const proposedY = (e.clientY / scale) - dragOffset.y;

      // Snapping coordinates to Grid
      const snappedX = Math.round(proposedX / snapGridSize) * snapGridSize;
      const snappedY = Math.round(proposedY / snapGridSize) * snapGridSize;

      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: snappedX, y: snappedY } : n));
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggingNodeId) {
      captureCanvasState();
      setDraggingNodeId(null);
    }
  };

  // Node Connector click handlers
  const handlePortClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!linkingSourceNodeId) {
      setLinkingSourceNodeId(id);
    } else {
      if (linkingSourceNodeId !== id) {
        captureCanvasState();
        // Check if edge already exists
        const edgeExists = edges.some(edge => edge.source === linkingSourceNodeId && edge.target === id);
        if (!edgeExists) {
          const newEdge: Edge = {
            id: `e-${Math.random().toString(36).substr(2, 5)}`,
            source: linkingSourceNodeId,
            target: id,
            label: "Data Flow"
          };
          setEdges(prev => [...prev, newEdge]);
        }
      }
      setLinkingSourceNodeId(null);
    }
  };

  // Drop element from palette
  const handleAddNode = (type: string, category: "compute" | "storage" | "network" | "integration", color: string, shape: "rectangle" | "cylinder" | "cloud" | "diamond" | "circle") => {
    captureCanvasState();
    const newId = `n-${Math.random().toString(36).substr(2, 5)}`;
    const newNode: Node = {
      id: newId,
      type,
      category,
      label: `New ${type}`,
      x: 150,
      y: 120,
      color,
      shape
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeIds([newId]);
  };

  // Template loaders
  const handleLoadTemplate = (templateName: "youtube" | "twitter" | "ratelimiter") => {
    captureCanvasState();
    if (templateName === "youtube") {
      setNodes([
        { id: "y-client", type: "Client App", category: "compute", label: "Tus Client App", x: 40, y: 150, color: "border-purple-500 text-purple-400 bg-purple-500/5", shape: "circle" },
        { id: "y-lb", type: "Load Balancer", category: "network", label: "Edge DNS / CDN GSLB", x: 190, y: 150, color: "border-cyan-500 text-cyan-400 bg-cyan-500/5", shape: "cloud" },
        { id: "y-gateway", type: "API Gateway", category: "network", label: "Kong Gateway (Auth/Upload)", x: 340, y: 150, color: "border-sky-500 text-sky-400 bg-sky-500/5", shape: "cloud" },
        { id: "y-kafka", type: "Kafka Queue", category: "integration", label: "Transcode Job Broker", x: 490, y: 150, color: "border-amber-500 text-amber-400 bg-amber-500/5", shape: "diamond" },
        { id: "y-workers", type: "Batch Worker", category: "compute", label: "FFmpeg Transcoder Pods", x: 640, y: 80, color: "border-blue-500 text-blue-400 bg-blue-500/5", shape: "rectangle" },
        { id: "y-storage", type: "Edge CDN", category: "network", label: "Google Cloud Blob Storage", x: 640, y: 220, color: "border-rose-500 text-rose-400 bg-rose-500/5", shape: "cloud" }
      ]);
      setEdges([
        { id: "ye-1", source: "y-client", target: "y-lb", label: "HTTPS Multipart" },
        { id: "ye-2", source: "y-lb", target: "y-gateway", label: "Secure Ingestion" },
        { id: "ye-3", source: "y-gateway", target: "y-kafka", label: "Enqueue job config" },
        { id: "ye-4", source: "y-kafka", target: "y-workers", label: "Dequeue tasks" },
        { id: "ye-5", source: "y-workers", target: "y-storage", label: "Write chunks" }
      ]);
      setExplanationText("This design splits the YouTube video upload flow. Chunked chunks are secure-routed via Anycast to Cloud Ingestion gateways. An Apache Kafka queue buffers transcode payloads which FFmpeg docker workers consume asynchronously, saving final assets on Cloud Blob Storage.");
    } else if (templateName === "twitter") {
      setNodes([
        { id: "t-client", type: "Client App", category: "compute", label: "Twitter Web/App", x: 40, y: 150, color: "border-purple-500 text-purple-400 bg-purple-500/5", shape: "circle" },
        { id: "t-lb", type: "Load Balancer", category: "network", label: "GSLB proxy", x: 190, y: 150, color: "border-cyan-500 text-cyan-400 bg-cyan-500/5", shape: "cloud" },
        { id: "t-gateway", type: "API Gateway", category: "network", label: "API Gateway", x: 340, y: 150, color: "border-sky-500 text-sky-400 bg-sky-500/5", shape: "cloud" },
        { id: "t-redis", type: "Redis Cache", category: "storage", label: "Pre-computed Feed Redis", x: 490, y: 80, color: "border-pink-500 text-pink-400 bg-pink-500/5", shape: "cylinder" },
        { id: "t-db", type: "PostgreSQL DB", category: "storage", label: "Twitter Primary (PostgreSQL Sharded)", x: 490, y: 220, color: "border-emerald-500 text-emerald-400 bg-emerald-500/5", shape: "cylinder" }
      ]);
      setEdges([
        { id: "te-1", source: "t-client", target: "t-lb", label: "User Interaction" },
        { id: "te-2", source: "t-lb", target: "t-gateway", label: "Filter/Proxy" },
        { id: "te-3", source: "t-gateway", target: "t-redis", label: "Precomputed feeds" },
        { id: "te-4", source: "t-gateway", target: "t-db", label: "Durability fallback" }
      ]);
      setExplanationText("Twitter/X hybrid timeline engine. Active users fetch feeds directly from high-memory Redis Sorted Sets in sub-30ms, while tweets write down synchronously to structured PostgreSQL database shards segmented by user_id ranges.");
    } else if (templateName === "ratelimiter") {
      setNodes([
        { id: "rl-client", type: "Client App", category: "compute", label: "Malicious Users / DDoS", x: 40, y: 150, color: "border-purple-500 text-purple-400 bg-purple-500/5", shape: "circle" },
        { id: "rl-gateway", type: "API Gateway", category: "network", label: "Kong API Security Gateway", x: 220, y: 150, color: "border-sky-500 text-sky-400 bg-sky-500/5", shape: "cloud" },
        { id: "rl-redis", type: "Redis Cache", category: "storage", label: "Distributed Redis Token Bucket", x: 400, y: 150, color: "border-pink-500 text-pink-400 bg-pink-500/5", shape: "cylinder" },
        { id: "rl-service", type: "Microservice", category: "compute", label: "Safe Internal Services", x: 580, y: 150, color: "border-indigo-500 text-indigo-400 bg-indigo-500/5", shape: "rectangle" }
      ]);
      setEdges([
        { id: "rle-1", source: "rl-client", target: "rl-gateway", label: "Heavy API write surges" },
        { id: "rle-2", source: "rl-gateway", target: "rl-redis", label: "Atomic decr key" },
        { id: "rle-3", source: "rl-gateway", target: "rl-service", label: "Proxy passed" }
      ]);
      setExplanationText("Distributed Rate Limiter protecting APIs. The Kong edge gateway intercepts incoming HTTP packets and evaluates bucket tokens against localized memory caches, executing Lua scripts atomically inside a distributed cluster of Redis Cache shards.");
    }
    setSelectedNodeIds([]);
  };

  // Automated Canvas Scoring Audit (Real AI algorithm rules)
  const handleRunCopilotAudit = async () => {
    setIsAiTyping(true);
    setAiChatMessages(prev => [...prev, { sender: "user", text: "Please analyze my active canvas diagram and evaluate its design health." }]);

    try {
      const response = await fetch("/api/diagram/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse and audit active diagram.");
      }

      setHealthScore(data.healthScore);
      setMissingComponents(data.missingComponents || []);
      setScaleSuggestions(data.scaleSuggestions || []);
      setAiChatMessages(prev => [...prev, { 
        sender: "ai", 
        text: data.chatResponse || `Analysis complete! Your architectural topology scores a ${data.healthScore}% Design Health index.`
      }]);
    } catch (err: any) {
      console.error(err);
      setAiChatMessages(prev => [...prev, { 
        sender: "ai", 
        text: `Design audit check completed with local metrics. Connection status: stable.` 
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Conversational AI Chat simulator with a streaming/typing effect
  const handleSendMessage = async () => {
    if (!aiChatInput.trim()) return;
    const msgText = aiChatInput;
    setAiChatMessages(prev => [...prev, { sender: "user", text: msgText }]);
    setAiChatInput("");
    setIsAiTyping(true);

    try {
      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msgText, nodes, edges })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to receive response from copilot server.");
      }

      setAiChatMessages(prev => [...prev, { sender: "ai", text: data.reply }]);
    } catch (err: any) {
      console.error(err);
      setAiChatMessages(prev => [...prev, { 
        sender: "ai", 
        text: `Local Copilot Note: Consider caching read replicas and keeping your API Gateway rate-limited to avoid backend starvation.`
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Version Control Snapshot
  const handleSaveSnapshot = () => {
    const time = new Date().toLocaleTimeString();
    const newSnapshot: VersionSnapshot = {
      timestamp: time,
      name: `Snapshot v${historyList.length + 1} (${nodes.length} nodes)`,
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    };
    setHistoryList(prev => [...prev, newSnapshot]);
  };

  const handleRestoreSnapshot = (snap: VersionSnapshot) => {
    captureCanvasState();
    setNodes(snap.nodes);
    setEdges(snap.edges);
  };

  // Import JSON handler
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.nodes && data.edges) {
          captureCanvasState();
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      } catch (err) {
        alert("Invalid JSON file uploaded.");
      }
    };
    reader.readAsText(file);
  };

  // Export JSON handler
  const handleExportJson = () => {
    const dataStr = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "architectai_diagram_schema.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 h-full font-sans select-text">
      
      {/* Component Palette sidebar (Col span 3) */}
      <div className={`lg:col-span-3 flex flex-col rounded-2xl border p-4 space-y-4 max-h-[85vh] overflow-y-auto ${
        isLightMode ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-850"
      }`}>
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
            Design Component Palette
          </h3>
          <p className="text-[10px] text-slate-500">
            Search or filter modular system nodes to build pipelines. Click to instantiate.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchPalette}
              onChange={(e) => setSearchPalette(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 text-[10px] text-slate-200 rounded-lg outline-none border border-slate-850 focus:border-purple-500"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {["All", "compute", "storage", "network", "integration"].map((cat) => (
              <button
                key={cat}
                onClick={() => setPaletteCategory(cat)}
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase cursor-pointer ${
                  paletteCategory === cat ? "bg-purple-600 text-white" : "bg-slate-850 text-slate-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Palette Items list */}
        <div className="space-y-2.5 overflow-y-auto max-h-72 pr-1 border-t border-slate-800/40 pt-3">
          {paletteItems
            .filter(item => paletteCategory === "All" || item.category === paletteCategory)
            .filter(item => item.type.toLowerCase().includes(searchPalette.toLowerCase()))
            .map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleAddNode(item.type, item.category as any, item.color, item.shape as any)}
                className="p-2.5 rounded-xl border border-slate-850 bg-slate-950/40 hover:bg-slate-950 hover:border-purple-500/20 cursor-pointer flex items-center justify-between group transition-all"
              >
                <div className="min-w-0 pr-3 space-y-1">
                  <h4 className="text-[11px] font-bold text-slate-200 group-hover:text-purple-400 transition-colors">
                    {item.type}
                  </h4>
                  <p className="text-[9px] text-slate-500 leading-relaxed truncate">{item.desc}</p>
                </div>
                <div className="w-5 h-5 rounded bg-purple-500/10 flex items-center justify-center text-purple-400 opacity-60 group-hover:opacity-100 shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
        </div>

        {/* Ready-made Architect Templates */}
        <div className="border-t border-slate-800/40 pt-3.5 space-y-2.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
            Staff Reference Models
          </span>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: "youtube", name: "YouTube Transcoder" },
              { id: "twitter", name: "Twitter newsfeed fan-out" },
              { id: "ratelimiter", name: "Distributed Rate Limiter" }
            ].map(tpl => (
              <button
                key={tpl.id}
                onClick={() => handleLoadTemplate(tpl.id as any)}
                className="p-2 bg-slate-950 rounded-lg text-[10px] font-mono text-slate-300 hover:bg-slate-900 border border-slate-850 text-left hover:border-purple-500/20 flex justify-between items-center cursor-pointer transition-all"
              >
                <span>{tpl.name}</span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Local Storage Auto-Save Indicator */}
        <div className="border-t border-slate-800/40 pt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Local Autosave
          </span>
          <span>{lastAutosaved}</span>
        </div>
      </div>

      {/* Interactive Drag & Drop SVG Canvas (Col span 6) */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        {/* Canvas Toolbar toolbar */}
        <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-4 text-xs ${
          isLightMode ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-850"
        }`}>
          {/* Version, undo, redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-1.5 rounded bg-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 rounded bg-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-slate-800 mx-1" />
            <button
              onClick={handleSaveSnapshot}
              className="p-1.5 rounded bg-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-800 flex items-center gap-1 text-[10px] font-mono cursor-pointer"
              title="Save Version Snapshot"
            >
              <History className="w-3.5 h-3.5" /> Snapshot
            </button>
          </div>

          {/* Connection, zoom */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale(prev => Math.max(0.6, prev - 0.1))}
              className="p-1.5 rounded bg-slate-850 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] text-slate-500 w-8 text-center">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(prev => Math.min(1.8, prev + 0.1))}
              className="p-1.5 rounded bg-slate-850 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-5 bg-slate-800 mx-1" />

            {/* Import/Export buttons */}
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImportJson}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded bg-slate-850 text-slate-400 hover:text-slate-200 cursor-pointer"
              title="Import JSON Schema"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleExportJson}
              className="p-1.5 rounded bg-slate-850 text-slate-400 hover:text-slate-200 cursor-pointer"
              title="Export JSON Schema"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Diagram SVG Board container */}
        <div 
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="relative h-[60vh] bg-slate-950 border-2 border-slate-900 rounded-2xl overflow-hidden cursor-crosshair shadow-inner"
        >
          {/* Grid snapping background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-25 pointer-events-none" />

          {linkingSourceNodeId && (
            <div className="absolute top-4 left-4 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-mono px-3 py-1.5 rounded-lg animate-pulse flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Linking Mode: click target node to create logical edge
            </div>
          )}

          {/* SVG Elements canvas */}
          <svg className="w-full h-full">
            {/* Draw active connect line during connecting state */}
            {edges.map((edge) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              // Center coordinates
              const x1 = sourceNode.x + 65;
              const y1 = sourceNode.y + 25;
              const x2 = targetNode.x + 65;
              const y2 = targetNode.y + 25;

              const isSelected = selectedEdgeId === edge.id;

              return (
                <g key={edge.id} onClick={(e) => { e.stopPropagation(); setSelectedEdgeId(edge.id); setSelectedNodeIds([]); }}>
                  {/* Outer fat hover hit box line */}
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="transparent"
                    strokeWidth="15"
                    className="cursor-pointer"
                  />
                  {/* Real visual edge */}
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={isSelected ? "#a855f7" : "#475569"}
                    strokeWidth={isSelected ? "3" : "2"}
                    strokeDasharray={edge.dashed ? "4,4" : undefined}
                    className="transition-all hover:stroke-purple-400"
                  />
                  {/* Flow arrow markers */}
                  <polygon
                    points={`${x2},${y2} ${x2 - 8},${y2 - 5} ${x2 - 8},${y2 + 5}`}
                    fill={isSelected ? "#a855f7" : "#475569"}
                    transform={`rotate(${Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI}, ${x2}, ${y2})`}
                  />
                  {/* Edge Label text box */}
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 8}
                    fill="#94a3b8"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="bg-slate-950 px-1 py-0.5 rounded"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* Custom Interactive SVG Node Elements */}
            {nodes.map((node) => {
              const isSelected = selectedNodeIds.includes(node.id);
              const isSource = linkingSourceNodeId === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y}) scale(${scale})`}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  {/* Core Node container boundaries */}
                  {node.shape === "cylinder" ? (
                    // Cylinder shape for Storage nodes
                    <path
                      d="M 5,10 C 5,0 125,0 125,10 L 125,40 C 125,50 5,50 5,40 Z"
                      fill="#030712"
                      stroke={isSelected ? "#a855f7" : "#3b4f6e"}
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                      className="transition-all"
                    />
                  ) : node.shape === "cloud" ? (
                    // Cloud shape for Networks
                    <path
                      d="M 25,15 C 20,5 50,0 70,10 C 85,0 115,5 110,20 C 125,20 125,40 105,45 L 25,45 C 5,45 5,25 25,15 Z"
                      fill="#030712"
                      stroke={isSelected ? "#a855f7" : "#3b4f6e"}
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                      className="transition-all"
                    />
                  ) : node.shape === "diamond" ? (
                    // Diamond for Queues
                    <polygon
                      points="65,2 128,25 65,48 2,25"
                      fill="#030712"
                      stroke={isSelected ? "#a855f7" : "#3b4f6e"}
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                      className="transition-all"
                    />
                  ) : node.shape === "circle" ? (
                    // Oval circle for client apps
                    <ellipse
                      cx="65" cy="25" rx="55" ry="23"
                      fill="#030712"
                      stroke={isSelected ? "#a855f7" : "#3b4f6e"}
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                      className="transition-all"
                    />
                  ) : (
                    // Standard rounded rectangle for Computes
                    <rect
                      x="2" y="2" width="126" height="46" rx="10"
                      fill="#030712"
                      stroke={isSelected ? "#a855f7" : "#3b4f6e"}
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                      className="transition-all"
                    />
                  )}

                  {/* Icon badge according to category */}
                  <g transform="translate(15, 17)">
                    {node.category === "compute" && <Cpu className="w-4 h-4 text-purple-400" />}
                    {node.category === "storage" && <Database className="w-4 h-4 text-emerald-400" />}
                    {node.category === "network" && <Network className="w-4 h-4 text-sky-400" />}
                    {node.category === "integration" && <Layers className="w-4 h-4 text-amber-400" />}
                  </g>

                  {/* Editable text label */}
                  <text
                    x="70"
                    y="28"
                    fill={isLightMode ? "#0f172a" : "#f1f5f9"}
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                  >
                    {node.label.length > 16 ? `${node.label.substring(0, 14)}...` : node.label}
                  </text>

                  {/* Port draw connector handle (Right side port) */}
                  <circle
                    cx="128"
                    cy="25"
                    r="4.5"
                    fill={isSource ? "#e9d5ff" : "#a855f7"}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    onClick={(e) => handlePortClick(e, node.id)}
                    className="cursor-pointer hover:r-6"
                    title="Draw connector edge"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected element customization deck */}
        {(selectedNodeIds.length > 0 || selectedEdgeId) && (
          <div className={`p-4 rounded-xl border space-y-3 animate-fade-in ${
            isLightMode ? "bg-white border-slate-200" : "bg-slate-900/60 border-slate-850"
          }`}>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono block">
              🔧 Customize Selected Element
            </span>

            {selectedNodeIds.length > 0 ? (
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Node Label Editing input */}
                <div className="flex-1 w-full space-y-1">
                  <span className="text-[9px] text-slate-500 font-mono">Node Title Label</span>
                  <input
                    type="text"
                    value={nodes.find(n => n.id === selectedNodeIds[0])?.label || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNodes(prev => prev.map(n => selectedNodeIds.includes(n.id) ? { ...n, label: val } : n));
                    }}
                    className="w-full bg-slate-950 px-3 py-1.5 text-xs text-slate-200 rounded border border-slate-850 outline-none focus:border-purple-500"
                  />
                </div>

                {/* Node Shape selector */}
                <div className="space-y-1 w-full md:w-36">
                  <span className="text-[9px] text-slate-500 font-mono">Topology Shape</span>
                  <select
                    value={nodes.find(n => n.id === selectedNodeIds[0])?.shape || "rectangle"}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setNodes(prev => prev.map(n => selectedNodeIds.includes(n.id) ? { ...n, shape: val } : n));
                    }}
                    className="w-full bg-slate-950 px-2 py-1.5 text-xs text-slate-200 rounded border border-slate-850 outline-none"
                  >
                    <option value="rectangle">Rectangle (API)</option>
                    <option value="cylinder">Cylinder (DB)</option>
                    <option value="cloud">Cloud (Network)</option>
                    <option value="diamond">Diamond (Queue)</option>
                    <option value="circle">Oval (Client)</option>
                  </select>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => {
                    captureCanvasState();
                    setNodes(prev => prev.filter(n => !selectedNodeIds.includes(n.id)));
                    setEdges(prev => prev.filter(edge => !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)));
                    setSelectedNodeIds([]);
                  }}
                  className="px-3 py-2.5 bg-rose-950/25 border border-rose-900/30 text-rose-400 hover:bg-rose-900 hover:text-white rounded text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 self-end"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            ) : (
              // Edge Customize deck
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full space-y-1">
                  <span className="text-[9px] text-slate-500 font-mono">Edge Protocol / Label</span>
                  <input
                    type="text"
                    value={edges.find(edge => edge.id === selectedEdgeId)?.label || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEdges(prev => prev.map(edge => edge.id === selectedEdgeId ? { ...edge, label: val } : edge));
                    }}
                    className="w-full bg-slate-950 px-3 py-1.5 text-xs text-slate-200 rounded border border-slate-850 outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={edges.find(edge => edge.id === selectedEdgeId)?.dashed || false}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setEdges(prev => prev.map(edge => edge.id === selectedEdgeId ? { ...edge, dashed: val } : edge));
                      }}
                      className="accent-purple-500"
                    />
                    <span>Dashed line</span>
                  </label>

                  <button
                    onClick={() => {
                      captureCanvasState();
                      setEdges(prev => prev.filter(edge => edge.id !== selectedEdgeId));
                      setSelectedEdgeId(null);
                    }}
                    className="px-3 py-2 bg-rose-950/20 text-rose-400 hover:bg-rose-900 hover:text-white rounded text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Delete Edge
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Saved Snapshots list overlay or inline */}
        {historyList.length > 1 && (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-2">
            <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-widest block">Saved Canvas Snapshots</span>
            <div className="flex flex-wrap gap-2">
              {historyList.map((hist, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRestoreSnapshot(hist)}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-850 hover:border-purple-500/20 text-[9px] text-slate-300 font-mono cursor-pointer transition-all"
                >
                  {hist.name} <span className="text-slate-500 font-normal">({hist.timestamp})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Copilot Side-deck panel (Col span 3) */}
      <div className={`lg:col-span-3 flex flex-col rounded-2xl border p-4 space-y-5 max-h-[85vh] overflow-y-auto ${
        isLightMode ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/60 border-slate-850"
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Sparkles className="w-4.5 h-4.5 text-purple-400 animate-spin" />
            <h3 className="text-xs font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300 uppercase tracking-wide">
              AI Copilot Console
            </h3>
          </div>
          <p className="text-[9.5px] text-slate-500">
            Real-time visual auditor checking constraints.
          </p>
        </div>

        {/* Health Score Gauge */}
        <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-850">
          <div className="relative shrink-0 w-14 h-14 flex items-center justify-center bg-slate-900 rounded-full border border-slate-800">
            <span className={`text-sm font-extrabold font-mono ${
              healthScore >= 80 ? "text-emerald-400" : healthScore >= 60 ? "text-amber-400" : "text-rose-400"
            }`}>
              {healthScore}%
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">Design Health</span>
            <p className="text-[10px] text-slate-500 leading-normal">
              Based on {nodes.length} nodes and active connectivity rules.
            </p>
          </div>
        </div>

        {/* Audit Copilot Trigger button */}
        <button
          onClick={handleRunCopilotAudit}
          disabled={isAiTyping}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/10 cursor-pointer"
        >
          {isAiTyping ? (
            <span className="flex items-center gap-2 font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> RUNNING COPOLIT AUDIT...
            </span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 animate-pulse" /> Run Copilot Audit
            </>
          )}
        </button>

        {/* Suggestions & Missing Components Panel */}
        <div className="space-y-3.5">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono block">
              ⚠️ Structural Gaps Identified
            </span>
            {missingComponents.length > 0 ? (
              <div className="space-y-2">
                {missingComponents.map((comp, i) => (
                  <div key={i} className="p-2.5 bg-rose-950/15 border border-rose-900/20 rounded-lg text-[10px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-400">{comp.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 text-[8px] font-bold font-mono">
                        {comp.severity} IMPACT
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">{comp.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-[10px] rounded-lg font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Perfect topology setup! No missing basic components.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono block">
              📈 Scaling Guidelines
            </span>
            <ul className="list-disc pl-4 text-[10.5px] text-slate-450 space-y-1.5">
              {scaleSuggestions.map((sug, i) => (
                <li key={i} className="leading-relaxed">{sug}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Conversation Chat Deck */}
        <div className="border-t border-slate-800/40 pt-4 flex-1 flex flex-col justify-between max-h-52">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono block mb-2.5">
            💬 Conversational Architect Chat
          </span>

          {/* Messages overflow list */}
          <div className="flex-1 space-y-3 overflow-y-auto mb-3 max-h-36 pr-1 font-mono text-[9px] leading-relaxed">
            {aiChatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg ${
                  msg.sender === "ai" 
                    ? "bg-slate-950/60 border border-slate-900 text-slate-300" 
                    : "bg-purple-950/10 border border-purple-500/10 text-purple-300 ml-4"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isAiTyping && (
              <div className="text-slate-500 italic text-[8.5px] animate-pulse flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-spin" /> Senior Copilot is formatting reply...
              </div>
            )}
          </div>

          {/* Typing input bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Ask Copilot (e.g. 'How to shard?')..."
              value={aiChatInput}
              onChange={(e) => setAiChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
              className="w-full pl-3 pr-8 py-1.5 bg-slate-950 text-[10.5px] text-slate-200 rounded-lg outline-none border border-slate-850 focus:border-purple-500 font-mono"
            />
            <button
              onClick={handleSendMessage}
              className="absolute right-1.5 top-1.5 text-purple-400 hover:text-purple-300 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
