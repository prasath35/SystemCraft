import React, { useState, useEffect } from "react";
import { 
  Sparkles, Trophy, Calendar, Flame, Activity, Zap, Layers, Cpu, Code, ArrowUpRight, 
  CheckCircle2, FolderGit, Github, RefreshCw, CloudUpload, CloudDownload, ExternalLink, 
  Lock, Eye, EyeOff, Settings, AlertTriangle, FileJson
} from "lucide-react";

interface DashboardViewProps {
  user: any;
  onNavigateSection: (section: string) => void;
  isLightMode: boolean;
}

export default function DashboardView({ user, onNavigateSection, isLightMode }: DashboardViewProps) {
  // GitHub Configuration and Connection States
  const [githubConfig, setGithubConfig] = useState(() => {
    const saved = localStorage.getItem("architectai_github_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      token: "",
      owner: "",
      repo: "",
      branch: "main",
      filePath: "diagrams/system-architecture.json",
    };
  });

  const [isEditingConfig, setIsEditingConfig] = useState(!githubConfig.token);
  const [showToken, setShowToken] = useState(false);
  const [commitMessage, setCommitMessage] = useState("docs: update system design architecture diagram via ArchitectAI");
  
  // Sync (Push) States
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState("");
  const [commitSha, setCommitSha] = useState("");
  const [htmlUrl, setHtmlUrl] = useState("");

  // Fetch / List (Pull) States
  const [repoFiles, setRepoFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [selectedFetchPath, setSelectedFetchPath] = useState("");
  const [fetchStatus, setFetchStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [fetchMessage, setFetchMessage] = useState("");

  // Load list of files automatically if configured
  useEffect(() => {
    if (githubConfig.token && githubConfig.owner && githubConfig.repo) {
      handleFetchRepoFiles();
    }
  }, []);

  const handleSaveConfig = () => {
    localStorage.setItem("architectai_github_config", JSON.stringify(githubConfig));
    setIsEditingConfig(false);
    handleFetchRepoFiles();
  };

  const handleFetchRepoFiles = async () => {
    if (!githubConfig.token || !githubConfig.owner || !githubConfig.repo) return;
    setIsLoadingFiles(true);
    try {
      const response = await fetch("/api/github/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: githubConfig.token,
          owner: githubConfig.owner,
          repo: githubConfig.repo,
          branch: githubConfig.branch,
          dirPath: githubConfig.filePath.substring(0, githubConfig.filePath.lastIndexOf("/")) || ""
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setRepoFiles(data.files || []);
      } else {
        console.warn("Could not retrieve repository files list:", data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSyncActiveDiagram = async () => {
    setSyncStatus("loading");
    setSyncMessage("");
    setCommitSha("");
    setHtmlUrl("");

    // 1. Get active diagram from localStorage or default
    let activeDiagramContent = localStorage.getItem("architectai_canvas_diagram");
    if (!activeDiagramContent) {
      // Create a default diagram to sync if none exists
      const defaultDiagram = {
        nodes: [
          { id: "n-client", type: "Client App", category: "compute", label: "Client Apps (iOS/Web)", x: 40, y: 150, color: "border-purple-500 text-purple-400 bg-purple-500/5", shape: "circle" },
          { id: "n-lb", type: "Load Balancer", category: "network", label: "Anycast Load Balancer", x: 190, y: 150, color: "border-cyan-500 text-cyan-400 bg-cyan-500/5", shape: "cloud" },
          { id: "n-gateway", type: "API Gateway", category: "network", label: "Kong API Gateway", x: 340, y: 150, color: "border-sky-500 text-sky-400 bg-sky-500/5", shape: "cloud" },
          { id: "n-service", type: "Microservice", category: "compute", label: "Core Service (Java/K8s)", x: 490, y: 150, color: "border-indigo-500 text-indigo-400 bg-indigo-500/5", shape: "rectangle" },
          { id: "n-db", type: "PostgreSQL DB", category: "storage", label: "PostgreSQL Master Cluster", x: 640, y: 150, color: "border-emerald-500 text-emerald-400 bg-emerald-500/5", shape: "cylinder" }
        ],
        edges: [
          { id: "e-1", source: "n-client", target: "n-lb", label: "HTTPS / TLS" },
          { id: "e-2", source: "n-lb", target: "n-gateway", label: "Internal Routing" },
          { id: "e-3", source: "n-gateway", target: "n-service", label: "gRPC" },
          { id: "e-4", source: "n-service", target: "n-db", label: "JPA Session" }
        ]
      };
      activeDiagramContent = JSON.stringify(defaultDiagram);
      localStorage.setItem("architectai_canvas_diagram", activeDiagramContent);
    }

    try {
      const response = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: githubConfig.token,
          owner: githubConfig.owner,
          repo: githubConfig.repo,
          branch: githubConfig.branch,
          filePath: githubConfig.filePath,
          commitMessage,
          content: activeDiagramContent,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSyncStatus("success");
        setSyncMessage(data.message);
        setCommitSha(data.commitSha);
        setHtmlUrl(data.htmlUrl);
        // Refresh the list of files
        handleFetchRepoFiles();
      } else {
        setSyncStatus("error");
        setSyncMessage(data.error || "Failed to synchronize design files.");
      }
    } catch (err: any) {
      setSyncStatus("error");
      setSyncMessage(err.message || "Network error. Failed to connect with integration services.");
    }
  };

  const handleFetchFileContent = async (targetPath: string) => {
    setFetchStatus("loading");
    setFetchMessage("");

    try {
      const response = await fetch("/api/github/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: githubConfig.token,
          owner: githubConfig.owner,
          repo: githubConfig.repo,
          branch: githubConfig.branch,
          filePath: targetPath || githubConfig.filePath,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setFetchStatus("success");
        setFetchMessage(`Successfully loaded system design schema!`);
        
        // Write file into workspace local storage
        localStorage.setItem("architectai_canvas_diagram", JSON.stringify(data.content));
        
        // Auto-navigate to Figma System Canvas view
        setTimeout(() => {
          onNavigateSection("canvas");
        }, 1200);
      } else {
        setFetchStatus("error");
        setFetchMessage(data.error || "Failed to retrieve selected schema file.");
      }
    } catch (err: any) {
      setFetchStatus("error");
      setFetchMessage(err.message || "Network error while downloading diagram.");
    }
  };

  // Mock aggregated stats
  const stats = [
    { label: "Design Health Score", value: "81.5%", icon: Activity, change: "+2.4% this week", color: "text-purple-500 border-purple-500/10" },
    { label: "Completed Designs", value: "8 Active", icon: Layers, change: "+2 new yesterday", color: "text-indigo-500 border-indigo-500/10" },
    { label: "Evaluation Score", value: "82 / 100", icon: Trophy, change: "Google Staff standard", color: "text-blue-500 border-blue-500/10" },
    { label: "Day Streak", value: "5 Days", icon: Flame, change: "Daily consistency active", color: "text-amber-500 border-amber-500/10" }
  ];

  // SVG Line Chart coordinates for Score Over Time
  const points = "20,90 100,75 180,60 260,35 340,30"; // Score sequence: 68 -> 72 -> 78 -> 84 -> 86
  const dots = [
    { x: 20, y: 90, label: "Day 1: 68", score: 68 },
    { x: 100, y: 75, label: "Day 2: 72", score: 72 },
    { x: 180, y: 60, label: "Day 3: 78", score: 78 },
    { x: 260, y: 35, label: "Day 4: 82", score: 82 },
    { x: 340, y: 22, label: "Day 5: 88", score: 88 }
  ];

  const recentReviews = [
    { title: "Design YouTube", verdict: "Pass", score: 82, date: "July 11, 2026", duration: "45 min" },
    { title: "Distributed Rate Limiter", verdict: "Strong Pass", score: 90, date: "July 10, 2026", duration: "30 min" },
    { title: "Design Twitter Newsfeed", verdict: "Pass", score: 78, date: "July 08, 2026", duration: "40 min" }
  ];

  return (
    <div className="space-y-8 font-sans animate-fade-in select-text">
      {/* Welcome Banner */}
      <div className={`p-8 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative ${
        isLightMode 
          ? "bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100 text-slate-850 shadow-sm" 
          : "bg-gradient-to-r from-slate-900 via-[#12132a] to-slate-950 border-slate-850 text-slate-100"
      }`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase bg-purple-500/10 text-purple-400">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Active Session
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
            Welcome Back, <span className="text-purple-400">{user?.name || "Architect Candidate"}</span>!
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            You are evaluated under the <span className="font-bold text-slate-300">{user?.targetCompany || "Google"} Principal Architect</span> rubric. Your active scoring benchmarks place you in the <span className="text-emerald-400 font-bold font-mono">Top 8.5%</span> of design candidates.
          </p>
        </div>

        <button
          onClick={() => onNavigateSection("canvas")}
          className="px-5 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/15 cursor-pointer transition-all hover:scale-[1.02]"
        >
          Launch Interactive Diagram Workspace
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl border p-5 space-y-2 transition-all ${
                isLightMode 
                  ? "bg-white border-slate-200 shadow-2xs" 
                  : "bg-slate-900/60 border-slate-850 hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                  {st.label}
                </span>
                <Icon className={`w-4 h-4 text-purple-400`} />
              </div>
              <div className="text-xl md:text-2xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
                {st.value}
              </div>
              <div className="text-[10px] text-slate-500 font-medium font-mono">{st.change}</div>
            </div>
          );
        })}
      </div>

      {/* GitHub Version Control & Synchronization Panel */}
      <div className={`rounded-2xl border p-6 space-y-6 ${
        isLightMode ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900/40 border-slate-850/60"
      }`}>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-850/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/15">
              <Github className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-200 flex items-center gap-2">
                GitHub Design Repository Sync
                <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-mono font-bold uppercase tracking-wider">
                  VCS Active
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Sync, commit, and retrieve system design JSON blueprints directly to/from your connected repository.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditingConfig && (
              <button
                onClick={() => setIsEditingConfig(true)}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
                  isLightMode
                    ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    : "bg-slate-950/40 hover:bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Settings className="w-3 h-3" /> Reconfigure Connection
              </button>
            )}
            <button
              onClick={handleFetchRepoFiles}
              disabled={isLoadingFiles || !githubConfig.token}
              className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center justify-center cursor-pointer transition-all disabled:opacity-50 ${
                isLightMode
                  ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  : "bg-slate-950/40 hover:bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
              }`}
              title="Refresh Repository Files"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? "animate-spin text-purple-400" : ""}`} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Connection configuration details */}
          <div className="lg:col-span-4 space-y-4">
            {isEditingConfig ? (
              <div className="space-y-3.5">
                <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wide font-mono flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" /> Connection Settings
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">GitHub Personal Access Token (PAT)</label>
                    <div className="relative">
                      <input
                        type={showToken ? "text" : "password"}
                        value={githubConfig.token}
                        onChange={(e) => setGithubConfig({ ...githubConfig, token: e.target.value })}
                        placeholder="ghp_XXXXXXXXXXXXXXXXXXXX"
                        className="w-full bg-slate-950/50 border border-slate-850 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 transition-colors placeholder-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[8px] text-slate-500 mt-1">Requires a developer PAT with 'repo' scopes.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Repo Owner</label>
                      <input
                        type="text"
                        value={githubConfig.owner}
                        onChange={(e) => setGithubConfig({ ...githubConfig, owner: e.target.value })}
                        placeholder="e.g. octocat"
                        className="w-full bg-slate-950/50 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors placeholder-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Repo Name</label>
                      <input
                        type="text"
                        value={githubConfig.repo}
                        onChange={(e) => setGithubConfig({ ...githubConfig, repo: e.target.value })}
                        placeholder="e.g. system-designs"
                        className="w-full bg-slate-950/50 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors placeholder-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Branch</label>
                      <input
                        type="text"
                        value={githubConfig.branch}
                        onChange={(e) => setGithubConfig({ ...githubConfig, branch: e.target.value })}
                        placeholder="main"
                        className="w-full bg-slate-950/50 border border-slate-850 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">File Target Path</label>
                      <input
                        type="text"
                        value={githubConfig.filePath}
                        onChange={(e) => setGithubConfig({ ...githubConfig, filePath: e.target.value })}
                        placeholder="diagrams/active.json"
                        className="w-full bg-slate-950/50 border border-slate-850 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveConfig}
                    disabled={!githubConfig.token || !githubConfig.owner || !githubConfig.repo}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-[11px] font-bold transition-all shadow-md shadow-purple-500/10 cursor-pointer disabled:opacity-50"
                  >
                    Save & Initialize Connection
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connected to GitHub
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">REST API Mode</span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-[10px] font-bold">REPOSITORY</span>
                      <span className="text-slate-200 text-right truncate max-w-[180px]">{githubConfig.owner}/{githubConfig.repo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-[10px] font-bold">ACTIVE BRANCH</span>
                      <span className="text-purple-400 font-bold">{githubConfig.branch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 text-[10px] font-bold">SYNC FILE</span>
                      <span className="text-slate-300 text-right truncate max-w-[180px]">{githubConfig.filePath}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-850 bg-slate-950/20 text-[10px] text-slate-400 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-slate-300 block">Workspace Persistence</span>
                    <p className="leading-relaxed">
                      Saving diagrams to GitHub will create a commit in your repository. Loading a JSON blueprint from GitHub will overwrite your current workspace active diagram instantly.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sync (Push) Operations Panel */}
          <div className="lg:col-span-4 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-800/20 lg:pl-6 pt-4 lg:pt-0">
            <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wide font-mono flex items-center gap-1.5">
              <CloudUpload className="w-4 h-4" /> Push Diagram to GitHub
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Commit Message</label>
                <textarea
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950/50 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors placeholder-slate-700 resize-none"
                  placeholder="e.g. docs: update design architecture diagram"
                />
              </div>

              <button
                onClick={handleSyncActiveDiagram}
                disabled={syncStatus === "loading" || !githubConfig.token}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-purple-500/15 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {syncStatus === "loading" ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Committing changes...
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-3.5 h-3.5" />
                    Commit & Push Active Diagram
                  </>
                )}
              </button>

              {syncStatus !== "idle" && (
                <div className={`p-3.5 rounded-lg border text-xs leading-relaxed space-y-2 ${
                  syncStatus === "success" 
                    ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" 
                    : syncStatus === "error" 
                      ? "bg-rose-500/5 border-rose-500/10 text-rose-400" 
                      : "bg-purple-500/5 border-purple-500/10 text-purple-400"
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {syncStatus === "success" ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                    {syncStatus === "success" ? "Sync Completed" : "Sync Failed"}
                  </div>
                  <p className="text-[10px] text-slate-400">{syncMessage}</p>
                  {syncStatus === "success" && commitSha && (
                    <div className="pt-2 border-t border-slate-800/40 flex flex-col gap-1 text-[9px] font-mono">
                      <div className="flex justify-between text-slate-500">
                        <span>COMMIT SHA</span>
                        <span className="text-slate-300">{commitSha.substring(0, 8)}</span>
                      </div>
                      {htmlUrl && (
                        <a
                          href={htmlUrl}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="text-purple-400 font-bold flex items-center gap-1 hover:underline mt-1 inline-flex items-center gap-1"
                        >
                          View file on GitHub <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Fetch (Pull) Operations Panel */}
          <div className="lg:col-span-4 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-800/20 lg:pl-6 pt-4 lg:pt-0">
            <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wide font-mono flex items-center gap-1.5">
              <CloudDownload className="w-4 h-4" /> Fetch Diagrams from Repo
            </div>

            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                Detected JSON Diagrams
              </span>

              {isLoadingFiles ? (
                <div className="py-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
                  <span className="text-[10px] font-mono">Scanning repository folders...</span>
                </div>
              ) : !githubConfig.token ? (
                <div className="py-6 text-center border border-dashed border-slate-850 rounded-xl text-[10px] text-slate-500">
                  Configure repository PAT and owner above to list files.
                </div>
              ) : repoFiles.length === 0 ? (
                <div className="py-6 text-center border border-dashed border-slate-850 rounded-xl text-[10px] text-slate-500 space-y-1">
                  <div>No JSON files found in path:</div>
                  <div className="font-mono text-slate-400 break-all px-2 text-[9px]">
                    {githubConfig.filePath.substring(0, githubConfig.filePath.lastIndexOf("/")) || "/"}
                  </div>
                </div>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 border border-slate-850 rounded-xl p-2 bg-slate-950/20">
                  {repoFiles.map((file, idx) => {
                    const isSelected = selectedFetchPath === file.path;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedFetchPath(file.path)}
                        className={`w-full p-2 rounded-lg border text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-purple-600/10 border-purple-500/40 text-purple-300 font-bold"
                            : "bg-slate-900/30 border-slate-850 hover:bg-slate-900/60 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <FileJson className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-purple-400" : "text-slate-500"}`} />
                          <span className="truncate">{file.name}</span>
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 shrink-0 font-bold">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedFetchPath && (
                <button
                  onClick={() => handleFetchFileContent(selectedFetchPath)}
                  disabled={fetchStatus === "loading"}
                  className="w-full py-2 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-purple-500/20 hover:border-purple-500 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {fetchStatus === "loading" ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <CloudDownload className="w-3.5 h-3.5" />
                      Pull & Load Selected Design
                    </>
                  )}
                </button>
              )}

              {fetchStatus !== "idle" && (
                <div className={`p-3 rounded-lg border text-[10px] leading-relaxed flex items-start gap-1.5 ${
                  fetchStatus === "success"
                    ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/5 border-rose-500/10 text-rose-400"
                }`}>
                  {fetchStatus === "success" ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />}
                  <p>{fetchMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Layout - Chart & Activity */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* SVG Responsive Charts (Col span 7) */}
        <div className={`lg:col-span-7 rounded-2xl border p-6 flex flex-col justify-between ${
          isLightMode ? "bg-white border-slate-200 shadow-xs" : "bg-slate-900/60 border-slate-850"
        }`}>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
              Interactive Score Analytics Trends
            </h3>
            <p className="text-[10px] text-slate-500">
              Time-series score growth across 5 practice milestones evaluating system boundaries.
            </p>
          </div>

          {/* Inline SVG Chart */}
          <div className="h-44 w-full mt-4 flex items-end relative">
            <svg viewBox="0 0 360 110" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="360" y2="20" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1="0" y1="50" x2="360" y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
              <line x1="0" y1="80" x2="360" y2="80" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />

              {/* Chart Line */}
              <polyline
                fill="none"
                stroke="url(#purpleGradient)"
                strokeWidth="2.5"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Area Under Line */}
              <path
                d={`M 20,110 L 20,90 L 100,75 L 180,60 L 260,35 L 340,22 L 340,110 Z`}
                fill="url(#areaGradient)"
              />

              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Chart Points */}
              {dots.map((dot, index) => (
                <g key={index} className="group cursor-pointer">
                  <circle
                    cx={dot.x}
                    cy={dot.y}
                    r="4"
                    fill={isLightMode ? "#4f46e5" : "#a855f7"}
                    stroke={isLightMode ? "#ffffff" : "#0f172a"}
                    strokeWidth="1.5"
                    className="hover:r-6 transition-all duration-150"
                  />
                  <text
                    x={dot.x}
                    y={dot.y - 8}
                    fill="#94a3b8"
                    fontSize="8"
                    textAnchor="middle"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {dot.score}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="pt-4 border-t border-slate-800/40 flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span>Milestone 1</span>
            <span>Milestone 2</span>
            <span>Milestone 3</span>
            <span>Milestone 4</span>
            <span>Milestone 5 (Latest)</span>
          </div>
        </div>

        {/* Recent Evaluations List (Col span 5) */}
        <div className={`lg:col-span-5 rounded-2xl border p-6 flex flex-col justify-between ${
          isLightMode ? "bg-white border-slate-200 shadow-xs" : "bg-slate-900/60 border-slate-850"
        }`}>
          <div className="space-y-1 pb-3 border-b border-slate-800/40">
            <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
              Recent Architectural Graded Reviews
            </h3>
            <p className="text-[10px] text-slate-500">
              Evaluations generated from active mock interview sandboxes.
            </p>
          </div>

          <div className="flex-1 space-y-3 my-4">
            {recentReviews.map((rev, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all hover:bg-slate-850/20 ${
                  isLightMode 
                    ? "bg-slate-50/50 border-slate-150 hover:bg-slate-50" 
                    : "bg-slate-950/40 border-slate-850"
                }`}
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-200">{rev.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                    <span>{rev.date}</span>
                    <span>&bull;</span>
                    <span>{rev.duration}</span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold border uppercase ${
                    rev.verdict.includes("Pass") 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {rev.verdict}
                  </span>
                  <div className="text-[10px] font-mono text-slate-500 font-bold">
                    Score: <span className="text-purple-400">{rev.score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateSection("sandbox")}
            className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
              isLightMode 
                ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-750" 
                : "bg-slate-950/60 hover:bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
            }`}
          >
            Practice New Scenario &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
