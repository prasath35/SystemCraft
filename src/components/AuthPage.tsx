import React, { useState } from "react";
import { Lock, Mail, User as UserIcon, Sparkles, AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";

interface AuthPageProps {
  initialMode: "login" | "register";
  onAuthSuccess: (userData: any) => void;
  isLightMode: boolean;
}

export default function AuthPage({ initialMode, onAuthSuccess, isLightMode }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [targetCompany, setTargetCompany] = useState("Google");
  const [experience, setExperience] = useState("5");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const validate = () => {
    const errors: Record<string, string> = {};
    if (mode === "register" && !name.trim()) {
      errors.name = "Name is required";
    }
    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Valid email is required";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      if (mode === "login") {
        if (email.toLowerCase() === "admin@architectai.dev" && password !== "Password123!") {
          setGeneralError("Invalid password for admin user.");
          return;
        }
        // Simulated user
        onAuthSuccess({
          id: "usr-09281a",
          name: name || "Candidate One",
          email,
          role: "ROLE_USER",
          targetCompany,
          experienceYears: parseInt(experience)
        });
      } else {
        // Register simulation
        onAuthSuccess({
          id: "usr-09281b",
          name,
          email,
          role: "ROLE_USER",
          targetCompany,
          experienceYears: parseInt(experience)
        });
      }
    }, 1500);
  };

  return (
    <div className="max-w-md w-full mx-auto my-12 p-1 font-sans animate-fade-in">
      <div className={`rounded-2xl border p-8 space-y-6 ${
        isLightMode 
          ? "bg-white border-slate-200 shadow-xl text-slate-800" 
          : "bg-slate-900 border-slate-850 shadow-2xl text-slate-100"
      }`}>
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-purple-600/10 items-center justify-center text-purple-400 mb-2">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {mode === "login" ? "Sign In to ArchitectAI" : "Create SDE Portfolio Account"}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === "login" 
              ? "Access your sandbox, dashboard, and AI evaluators" 
              : "Design and validate FAANG+ standard architectures"}
          </p>
        </div>

        {generalError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Your Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none border transition-all ${
                    isLightMode 
                      ? "bg-slate-50 border-slate-200 text-slate-850 focus:border-purple-400 focus:bg-white" 
                      : "bg-slate-950 border-slate-850 text-slate-100 focus:border-purple-500/50 focus:bg-slate-950"
                  } ${validationErrors.name ? "border-rose-500" : ""}`}
                />
              </div>
              {validationErrors.name && <p className="text-rose-500 text-[10px]">{validationErrors.name}</p>}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none border transition-all ${
                  isLightMode 
                    ? "bg-slate-50 border-slate-200 text-slate-850 focus:border-purple-400 focus:bg-white" 
                    : "bg-slate-950 border-slate-850 text-slate-100 focus:border-purple-500/50 focus:bg-slate-950"
                } ${validationErrors.email ? "border-rose-500" : ""}`}
              />
            </div>
            {validationErrors.email && <p className="text-rose-500 text-[10px]">{validationErrors.email}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Password</label>
              {mode === "login" && (
                <button type="button" className="text-[10px] text-purple-400 hover:underline">Forgot?</button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none border transition-all ${
                  isLightMode 
                    ? "bg-slate-50 border-slate-200 text-slate-850 focus:border-purple-400 focus:bg-white" 
                    : "bg-slate-950 border-slate-850 text-slate-100 focus:border-purple-500/50 focus:bg-slate-950"
                } ${validationErrors.password ? "border-rose-500" : ""}`}
              />
            </div>
            {validationErrors.password && <p className="text-rose-500 text-[10px]">{validationErrors.password}</p>}
          </div>

          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Company</label>
                <select
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none border transition-all ${
                    isLightMode 
                      ? "bg-slate-50 border-slate-200 text-slate-850" 
                      : "bg-slate-950 border-slate-850 text-slate-100"
                  }`}
                >
                  {["Google", "Microsoft", "Amazon", "Uber", "Stripe", "General"].map((comp) => (
                    <option key={comp} value={comp} className="bg-slate-900">{comp}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Years Exp.</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs outline-none border transition-all ${
                    isLightMode 
                      ? "bg-slate-50 border-slate-200 text-slate-850" 
                      : "bg-slate-950 border-slate-850 text-slate-100"
                  }`}
                >
                  {["1-3 Years", "3-5 Years", "5-8 Years", "8+ Years"].map((exp) => (
                    <option key={exp} value={exp[0]} className="bg-slate-900">{exp}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing Authenticator...
              </span>
            ) : mode === "login" ? (
              <>Sign In <ArrowRight className="w-4 h-4" /></>
            ) : (
              <>Register Account <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800/40"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">Or Demo login</span>
          <div className="flex-grow border-t border-slate-800/40"></div>
        </div>

        <button
          onClick={() => {
            setEmail("admin@architectai.dev");
            setPassword("Password123!");
            setName("Lead Architect");
            setTargetCompany("Google");
            setMode("login");
          }}
          className={`w-full py-2 rounded-xl text-xs font-mono font-bold tracking-wide border cursor-pointer transition-all ${
            isLightMode 
              ? "bg-slate-50 border-slate-200 text-purple-700 hover:bg-purple-50/50" 
              : "bg-slate-950 border-slate-850 text-purple-400 hover:bg-purple-950/20"
          }`}
        >
          ⚡ Instantly Load Demo Account
        </button>

        <div className="text-center text-xs">
          <span className="text-slate-400">
            {mode === "login" ? "Don't have an account yet?" : "Already registered?"}
          </span>{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setValidationErrors({});
              setGeneralError("");
            }}
            className="text-purple-400 font-bold hover:underline"
          >
            {mode === "login" ? "Create SDE Account" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
