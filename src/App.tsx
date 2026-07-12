import React, { useState } from "react";
import { 
  Terminal, Shield, FolderGit, LayoutGrid, Database, PlayCircle, Star, Sparkles, 
  Sun, Moon, LogIn, UserPlus, LogOut, Code, Server, FileText, Layout, Play, User
} from "lucide-react";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import DashboardView from "./components/DashboardView";
import DiagramWorkspace from "./components/DiagramWorkspace";
import PracticeSandbox from "./components/PracticeSandbox";
import BackendExplorer from "./components/BackendExplorer";
import ApiPlayground from "./components/ApiPlayground";
import SchemaBrowser from "./components/SchemaBrowser";
import SrsBrowser from "./components/SrsBrowser";
import FolderStructureExplorer from "./components/FolderStructureExplorer";

export default function App() {
  // Navigation: landing, login, register, dashboard, canvas, sandbox, springboot, restapi, postgresql, srs, folders
  const [activeSection, setActiveSection] = useState<string>("landing");
  const [user, setUser] = useState<any>(null); // Null means unauthenticated (forces Landing or Auth)
  const [isLightMode, setIsLightMode] = useState<boolean>(false);

  const handleGetStarted = (mode: "login" | "register") => {
    setActiveSection(mode);
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setActiveSection("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setActiveSection("landing");
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-150 ${
      isLightMode 
        ? "bg-slate-50 text-slate-850" 
        : "bg-slate-950 text-slate-100"
    }`}>
      
      {/* Dynamic Header with Portfolios, Theme Switcher and Authentication CTAs */}
      <header className={`border-b sticky top-0 z-30 transition-colors duration-150 ${
        isLightMode 
          ? "bg-white/80 border-slate-200 text-slate-900" 
          : "bg-slate-950/80 border-slate-900 text-slate-100"
      } backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto py-3.5 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo Brand segment */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveSection(user ? "dashboard" : "landing")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/15">
              <Sparkles className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-tight font-mono">ArchitectAI</span>
                <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-mono font-bold uppercase tracking-wider">
                  v1.0 Enterprise
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                AI System Design Workspace & FAANG Mock Sandbox
              </p>
            </div>
          </div>

          {/* User profile details & action deck */}
          <div className="flex items-center gap-3 justify-between md:justify-end">
            
            {/* Target hiring standard tag */}
            <div className="hidden lg:flex items-center gap-2 pr-4 border-r border-slate-800/60 font-mono text-[10px] text-slate-400">
              <span>Hiring Standard:</span>
              <span className="font-bold text-slate-200">Google L6 / Amazon L7</span>
            </div>

            {/* Light / Dark toggle button */}
            <button
              onClick={() => setIsLightMode(!isLightMode)}
              className={`p-2 rounded-lg border cursor-pointer transition-all ${
                isLightMode 
                  ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850"
              }`}
              title="Toggle theme mode"
            >
              {isLightMode ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
            </button>

            {/* Auth status buttons */}
            {user ? (
              <div className="flex items-center gap-3.5 pl-2">
                <div className="hidden sm:flex items-center gap-2 font-mono text-[11px]">
                  <div className="w-6 h-6 rounded-full bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-300 font-bold">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-2 rounded-lg border border-rose-900/40 bg-rose-950/15 text-rose-400 hover:bg-rose-900 hover:text-white transition-all text-[11px] font-mono cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {activeSection !== "login" && activeSection !== "register" && (
                  <button
                    onClick={() => setActiveSection("login")}
                    className={`px-3.5 py-2 rounded-lg border transition-all text-xs font-bold cursor-pointer ${
                      isLightMode 
                        ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100" 
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850"
                    }`}
                  >
                    Log In
                  </button>
                )}
                {activeSection !== "register" && (
                  <button
                    onClick={() => setActiveSection("register")}
                    className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 rounded-lg text-xs font-bold shadow-md shadow-purple-500/15 cursor-pointer transition-all"
                  >
                    Register Workspace
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main layout frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6">
        
        {/* Workspace navigation bar (Shown only if logged in) */}
        {user && (
          <nav className={`lg:w-60 shrink-0 flex flex-row lg:flex-col gap-1 rounded-2xl border p-3.5 h-fit sticky lg:top-24 z-20 overflow-x-auto lg:overflow-visible ${
            isLightMode 
              ? "bg-white border-slate-200 shadow-sm" 
              : "bg-slate-900/60 border-slate-900 shadow-xl"
          }`}>
            
            <div className="hidden lg:block pb-2.5 mb-1.5 border-b border-slate-800/40">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
                Workspace Dashboard
              </span>
            </div>

            {[
              { id: "dashboard", label: "Dashboard Console", icon: Layout },
              { id: "canvas", label: "Figma System Canvas", icon: LayoutGrid, highlight: true },
              { id: "sandbox", label: "AI Written Mock", icon: PlayCircle },
              { id: "springboot", label: "Spring Boot Source", icon: Code },
              { id: "restapi", label: "REST API Sandbox", icon: Server },
              { id: "postgresql", label: "PostgreSQL DB", icon: Database },
              { id: "srs", label: "IEEE Spec (SRS)", icon: Shield },
              { id: "folders", label: "Repository Folders", icon: FolderGit }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : item.highlight
                        ? "bg-purple-950/10 text-purple-400 border border-purple-500/10 hover:border-purple-500/20 hover:bg-purple-950/20"
                        : isLightMode 
                          ? "text-slate-600 hover:text-slate-800 hover:bg-slate-100" 
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/40"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : item.highlight ? "text-purple-400" : "text-slate-500"}`} />
                  {item.label}
                </button>
              );
            })}

            <div className="hidden lg:block pt-4 mt-3 border-t border-slate-800/40 text-center space-y-1.5 font-mono">
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Real-time Cloud Node</span>
              <div className="flex items-center justify-center gap-1.5 text-[9px] text-emerald-400 font-bold bg-emerald-500/5 py-1 rounded border border-emerald-500/15">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sandbox Syncing
              </div>
            </div>
          </nav>
        )}

        {/* Display panel viewports */}
        <div className="flex-1 min-w-0">
          
          {/* Landing viewport */}
          {activeSection === "landing" && (
            <LandingPage onGetStarted={handleGetStarted} isLightMode={isLightMode} />
          )}

          {/* Login view */}
          {activeSection === "login" && (
            <AuthPage initialMode="login" onAuthSuccess={handleAuthSuccess} isLightMode={isLightMode} />
          )}

          {/* Register view */}
          {activeSection === "register" && (
            <AuthPage initialMode="register" onAuthSuccess={handleAuthSuccess} isLightMode={isLightMode} />
          )}

          {/* User authenticated sub viewports */}
          {user ? (
            <>
              {activeSection === "dashboard" && (
                <DashboardView user={user} onNavigateSection={setActiveSection} isLightMode={isLightMode} />
              )}
              {activeSection === "canvas" && (
                <DiagramWorkspace isLightMode={isLightMode} />
              )}
              {activeSection === "sandbox" && (
                <PracticeSandbox />
              )}
              {activeSection === "springboot" && (
                <BackendExplorer isLightMode={isLightMode} />
              )}
              {activeSection === "restapi" && (
                <ApiPlayground isLightMode={isLightMode} />
              )}
              {activeSection === "postgresql" && (
                <SchemaBrowser isLightMode={isLightMode} />
              )}
              {activeSection === "srs" && (
                <SrsBrowser isLightMode={isLightMode} />
              )}
              {activeSection === "folders" && (
                <FolderStructureExplorer />
              )}
            </>
          ) : (
            // If they are guest trying to read active panels, fallback block card
            activeSection !== "landing" && activeSection !== "login" && activeSection !== "register" && (
              <div className="text-center py-16 px-4 space-y-4 max-w-md mx-auto">
                <Shield className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
                <h3 className="text-lg font-bold">Secure Workspace Segment</h3>
                <p className="text-xs text-slate-400">
                  Authentication is required to launch sandbox canvas elements or query database schema metrics.
                </p>
                <button
                  onClick={() => setActiveSection("login")}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Return to Authenticator
                </button>
              </div>
            )
          )}
        </div>
      </main>

      {/* Universal footer */}
      <footer className={`border-t py-4 px-6 text-center text-[10px] text-slate-500 z-10 font-mono transition-colors duration-150 ${
        isLightMode ? "bg-white border-slate-200" : "bg-slate-950 border-slate-900"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div>
            ArchitectAI Platform &bull; Staff Portfolio Framework Standard &bull; Under Google Licensure
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-semibold">
            <span>Durable Persistence</span>
            <span>&bull;</span>
            <span>Zero Credential Leakage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

