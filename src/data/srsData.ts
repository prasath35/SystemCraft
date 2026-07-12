import { UserPersona, UserStory, FunctionalRequirement, NonFunctionalRequirement, BusinessRule, RiskMitigation } from "../types";

export const personas: UserPersona[] = [
  {
    id: "PER-01",
    name: "Alex Rivera",
    role: "Senior Full-Stack Engineer @ FinTech Startup",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120",
    background: "Alex is preparing for Staff Software Engineer interviews at Google and Stripe. They have 7+ years of experience but have mostly worked on monolithic web applications and lack experience in designing highly distributed, large-scale systems handling millions of concurrent requests.",
    needs: [
      "Realistic interview practice environments with immediate architectural feedback.",
      "A systematic way to breakdown high-level system requirements (QPS, storage, CDN location).",
      "Interactive diagramming combined with standard design templates (e.g., CAP Theorem, databases)."
    ],
    painPoints: [
      "Ad-hoc system design advice from blogs is often inconsistent or overly simplistic.",
      "Mock interviews are expensive, hard to schedule, and lack consistent, detailed rubric scoring.",
      "Struggles with concrete 'scale calculations' during high-pressure sessions."
    ]
  },
  {
    id: "PER-02",
    name: "Devi Naidoo",
    role: "Product Architect @ Retail Enterprise",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
    background: "Devi leads a team of 15 engineers refactoring a legacy, on-premise inventory system into a distributed cloud-native microservices architecture. She needs a tool to quickly outline, document, and validate architectural decisions with her stakeholders.",
    needs: [
      "An interactive workspace to trace functional requirements to technical components.",
      "Clear, standard diagrams that show backend layered execution and AI integration pipelines.",
      "A template for database design including primary keys, indexes, and migrations."
    ],
    painPoints: [
      "Traditional UML tools are too heavyweight and require manual alignment.",
      "No direct tracing between business rules/functional specifications and database tables.",
      "Explaining trade-offs (like MongoDB vs PostgreSQL for transactions) takes too much alignment time."
    ]
  }
];

export const userStories: UserStory[] = [
  {
    id: "US-01",
    persona: "Alex Rivera",
    title: "AI Feedback on System Solutions",
    narrative: "As a candidate preparing for a Google Staff Interview, I want to submit a complete text-based system architecture proposal for 'Design YouTube' and get evaluated instantly by an AI 'Staff Interviewer' so that I can learn about single points of failure and sizing bottlenecks before my real interview.",
    acceptanceCriteria: [
      "The user can type or paste their multi-paragraph system solution.",
      "The evaluation is returned in under 10 seconds via an AI agent proxying the latest Gemini API.",
      "The feedback includes a concrete score (0-100), a rubric breakdown (Scale, DB, Latency, Components), and list of architectural strengths and gaps.",
      "The system must provide a highly realistic 'recommended architecture' as a reference."
    ]
  },
  {
    id: "US-02",
    persona: "Devi Naidoo",
    title: "Browse Complete System Templates & PostgreSQL DDL",
    narrative: "As a product architect, I want to explore standard production-ready folder structures and complete PostgreSQL schemas (including indexes and Flyway migration setups) so that I can copy-paste validated patterns into my real-world enterprise codebase.",
    acceptanceCriteria: [
      "The user can browse a production folder tree with explanations for every single subdirectory.",
      "The database schema browser lists exact column types, primary/foreign key constraints, and index purposes.",
      "A copy-to-clipboard button exists for SQL DDL and Flyway files.",
      "Mermaid ER diagrams are displayed alongside tables to visualize relationships clearly."
    ]
  }
];

export const functionalRequirements: FunctionalRequirement[] = [
  {
    id: "FR-01",
    title: "Workspace Scenario Practice",
    description: "The platform must offer a curated selection of core system design scenarios (e.g., YouTube, Twitter, Rate Limiter, Message Queue) with distinct QPS, latency, and storage estimations.",
    category: "Workspace",
    priority: "High"
  },
  {
    id: "FR-02",
    title: "Server-Side AI Architecture Evaluation",
    description: "The system must capture user solutions and securely proxy requests to the Gemini 3.5 Flash model on the backend using system instructions to evaluate scale, database design, fault tolerance, and modularity.",
    category: "AI Engine",
    priority: "High"
  },
  {
    id: "FR-03",
    title: "Interactive Production File Explorer",
    description: "Provide a rich, interactive folder tree representing a production architecture (Frontend, Backend, Infrastructure, Docs) where clicking any node displays its deep responsibility and trade-offs.",
    category: "Workspace",
    priority: "Medium"
  },
  {
    id: "FR-04",
    title: "SQL Schema & Migration Repository",
    description: "Display an enterprise-grade database model with specific schema files (Drizzle and standard SQL DDL), complete indexes, UUID/JSONB decisions, and Flyway migration execution order.",
    category: "Workspace",
    priority: "Medium"
  },
  {
    id: "FR-05",
    title: "Mermaid & PlantUML Rendering Pipeline",
    description: "The UI must offer beautiful, high-contrast, visual interactive rendering of High-Level Architecture, Backend Layers, Deployment Diagrams, and ER relationships.",
    category: "Collaboration",
    priority: "High"
  }
];

export const nonFunctionalRequirements: NonFunctionalRequirement[] = [
  {
    id: "NFR-01",
    title: "Query Latency (P95)",
    category: "Performance",
    metric: "Response time for browsing static system design templates & diagrams.",
    target: "< 150ms globally."
  },
  {
    id: "NFR-02",
    title: "AI Response Generation Time",
    category: "Performance",
    metric: "Evaluation latency from submitting a system solution to receiving structured review feedback.",
    target: "< 5.0 seconds (utilizing Gemini 3.5 Flash server-side with structured JSON output)."
  },
  {
    id: "NFR-03",
    title: "System Availability",
    category: "Availability",
    metric: "Target uptime for the ArchitectAI workspace portal.",
    target: "99.9% Uptime (Scale-to-zero Cloud Run active, multi-zone replication)."
  },
  {
    id: "NFR-04",
    title: "Database Security & Partitioning",
    category: "Security",
    metric: "Data isolation at rest and encryption in transit.",
    target: "AES-256 for storage, TLS 1.3 enforced, row-level security (RLS) enabled on PostgreSQL."
  },
  {
    id: "NFR-05",
    title: "Clean Modular Separation",
    category: "Maintainability",
    metric: "Strict separation of concerns in codebase for easy onboarding.",
    target: "Domain-Driven Design (DDD) layout: clean presentation (React), proxy routes (Express), configuration (infrastructure)."
  }
];

export const businessRules: BusinessRule[] = [
  {
    id: "BR-01",
    title: "Sizing Calculations Pre-requisite",
    description: "All system architecture proposals submitted for AI review MUST identify QPS, bandwidth estimates, and memory sizes. Solutions omitting these calculations are penalized in the scaling rubric score.",
    impact: "Drives candidates to practice precise hardware provisioning instead of hand-waving."
  },
  {
    id: "BR-02",
    title: "Strict Server-Side Key Masking",
    description: "Under no circumstances should the client browser hold any third-party credentials or API keys. All calls to the LLM (Gemini) must be brokered by the server with logging and rate limiting.",
    impact: "Ensures SaaS security compliance and shields keys from client inspection."
  },
  {
    id: "BR-03",
    title: "Immutable Migration Integrity",
    description: "Once a Flyway migration file is registered (V1__init.sql), its content cannot be altered. Changes require a new sequential migration (V2__index_optimization.sql) to prevent cluster state drift.",
    impact: "Enforces production database alignment across development and staging pipelines."
  }
];

export const risks: RiskMitigation[] = [
  {
    id: "RSK-01",
    risk: "AI Hallucination in Architectural Rubrics",
    likelihood: "Medium",
    impact: "High",
    mitigation: "Strict System Instruction outlining valid system design concepts, mandatory JSON validation schema, and predefined standard solutions to ground the LLM's evaluation."
  },
  {
    id: "RSK-02",
    risk: "High API Costs & Prompt Injection",
    likelihood: "Low",
    impact: "Medium",
    mitigation: "We use 'gemini-3.5-flash' which has exceptionally low per-token pricing, combine it with a server-side rate-limiter, and sanitize user input before passing it to the prompt template."
  },
  {
    id: "RSK-03",
    risk: "Database Schema drift across developer setups",
    likelihood: "High",
    impact: "Medium",
    mitigation: "Enforce Flyway sequence in the CI/CD pipeline and execute automatic validation before deployment to ensure schema parity with production."
  }
];

export const requirementTraceabilityMatrix = [
  { reqId: "FR-01", description: "Workspace Scenario Practice", source: "US-01", targetComponent: "PracticeSandbox.tsx", dbTable: "practice_scenarios" },
  { reqId: "FR-02", description: "Server-Side AI Architecture Evaluation", source: "US-01", targetComponent: "server.ts, aiClient", dbTable: "evaluation_history" },
  { reqId: "FR-03", description: "Interactive Production File Explorer", source: "US-02", targetComponent: "FolderStructureExplorer.tsx", dbTable: "N/A" },
  { reqId: "FR-04", description: "SQL Schema & Migration Repository", source: "US-02", targetComponent: "DatabaseSchemaBrowser.tsx", dbTable: "All tables" },
  { reqId: "FR-05", description: "Mermaid Rendering Pipeline", source: "US-01, US-02", targetComponent: "ArchitectureDiagrams.tsx, DiagramViewer.tsx", dbTable: "N/A" }
];
