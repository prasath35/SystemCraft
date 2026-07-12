import { ComponentDetail, DesignDecision, SequenceStep } from "../types";

export const componentDetails: ComponentDetail[] = [
  {
    id: "COMP-01",
    name: "SPA Frontend (React + Vite)",
    type: "UI",
    technology: "React 19, Tailwind CSS, Motion",
    responsibility: "Serves as the interactive client workspace. Renders the IEEE SRS, Folder trees, PostgreSQL schemas, and the Interactive AI Interview practicing terminal. Handles state management and makes REST/OAuth calls.",
    pros: ["Extremely fast build/refresh with Vite", "Highly interactive and fluid UI using Tailwind and Framer Motion", "Decoupled from backend, allowing static hosting on CDNs"],
    cons: ["Slower initial load than Server-Side Rendered (SSR) frameworks", "Requires client-side state synchronization with DB state"]
  },
  {
    id: "COMP-02",
    name: "API Gateway & Nginx Proxy",
    type: "Gateway",
    technology: "Nginx & Cloud Armor",
    responsibility: "Acts as the single entry point. Handles path-based routing (/api to backend, / to static SPA), implements SSL termination, handles Gzip compression, and applies strict CORS filtering.",
    pros: ["Highly performant reverse-proxy with minimal resource footprint", "Enforces rate limiting and shields backend from DDoS attempts", "Unified entry point simplifies network security policies"],
    cons: ["Single point of failure if not placed behind a load balancer", "Increases network hop latency slightly (typically <1ms)"]
  },
  {
    id: "COMP-03",
    name: "Spring Boot Microservice Core",
    type: "Service",
    technology: "Spring Boot 3.3, Java 21, Spring Security",
    responsibility: "The transactional brain of ArchitectAI. Manages business rules, processes scenario requests, authenticates users via OAuth2, integrates with Gemini AI on the server, and handles persistence.",
    pros: ["Enterprise grade type safety, multi-threading, and DI (Dependency Injection)", "Spring Security provides robust, industry-standard authentication filters", "Highly mature ORM (Hibernate) and transactional management"],
    cons: ["Larger memory footprint and longer startup times (solved using Spring Native/GraalVM)", "Steeper learning curve compared to lightweight Node/Go services"]
  },
  {
    id: "COMP-04",
    name: "Distributed Cache (Redis)",
    type: "Cache",
    technology: "Redis Cluster, Spring Data Redis",
    responsibility: "Caches database query results (scenarios, templates, system diagrams) and user sessions. Implements server-side sliding-window rate limiting to prevent Gemini API quota abuse.",
    pros: ["Sub-millisecond read/write speeds", "Supports complex data structures (Hashes, Sorted Sets) for rate-limiting", "Reduces Cloud SQL read pressure by up to 85%"],
    cons: ["In-memory data is volatile; requires careful eviction policy design", "Adds infrastructure maintenance cost and cluster monitoring overhead"]
  },
  {
    id: "COMP-05",
    name: "Relational DB (PostgreSQL)",
    type: "Database",
    technology: "GCP Cloud SQL (PostgreSQL 16), Connection Pool (HikariCP)",
    responsibility: "Durable system of record. Stores user accounts, scenario lists, and history of system design evaluations. Uses JSONB for unstructured diagnostic responses and GIS indices.",
    pros: ["ACID compliance guarantees total transaction security", "Powerful JSONB features allow semi-structured document storage with indexes", "Row-level security (RLS) protects tenant isolated logs"],
    cons: ["Scaling writes requires vertical scaling or complex multi-master partitioning", "Requires strict schema management (Migrations)"]
  }
];

export const designDecisions: DesignDecision[] = [
  {
    id: "DEC-01",
    topic: "Backend Language & Framework Selection",
    chosen: "Java 21 + Spring Boot 3.3",
    alternatives: ["Go (Golang)", "Node.js (Express)", "Python (FastAPI)"],
    tradeOffs: "While Go and Node.js offer faster cold starts and lower memory footprints, Spring Boot provides an incredibly robust, declarative framework ideal for complex enterprise SaaS applications. Spring Security integrates natively with OAuth2 JWT verification, and JPA Hibernate minimizes SQL boilerplate for transactional integrity. To offset startup latency, we compile the app to a native binary using GraalVM.",
    decisionFactors: ["Security integrations", "Enterprise maintainability", "Robust library ecosystem for AI tooling"]
  },
  {
    id: "DEC-02",
    topic: "Database Engine",
    chosen: "PostgreSQL with UUIDv7 Primary Keys",
    alternatives: ["MongoDB (NoSQL)", "MySQL (Relational)"],
    tradeOffs: "System design profiles and user histories require rigid transaction consistency (ACID) which rules out pure Document databases like MongoDB. MySQL is excellent, but PostgreSQL offers superior JSONB column processing (GIN indexes), which allows storing dynamic, unstructured AI evaluation outputs alongside highly relational user schemas.",
    decisionFactors: ["ACID compliance", "JSONB document querying", "Open-source licensing and GCP support"]
  },
  {
    id: "DEC-03",
    topic: "Authentication Architecture",
    chosen: "OAuth2 with Authorization Code Flow + PKCE",
    alternatives: ["Standard Session Cookies", "Basic JWT + Local Password Hash"],
    tradeOffs: "Local password hashing places high security liabilities on our team. Outsourcing authentication to Google/GitHub Identity providers via OAuth2 JWT keeps credentials off our servers. Enforcing PKCE (Proof Key for Code Exchange) protects our public React client from intercept attacks, bypassing the need to store client secrets in the client bundle.",
    decisionFactors: ["Zero credential liability", "Mitigation of intercept vectors", "Single Sign-On (SSO) experience"]
  }
];

export const authFlowSteps: SequenceStep[] = [
  { from: "React Client", to: "IdP (Google/GitHub)", action: "Redirect with Code Challenge", description: "Client generates a cryptographically random verifier and a challenge, redirects the user to the ID Provider for authentication." },
  { from: "IdP (Google/GitHub)", to: "React Client", action: "Authorization Code callback", description: "On successful login, the provider redirects back to ArchitectAI with an ephemeral Authorization Code." },
  { from: "React Client", to: "Spring Boot Server", action: "Exchange Code + Verifier", description: "Client sends the temporary Authorization Code and the original raw PKCE verifier to our secure Spring backend." },
  { from: "Spring Boot Server", to: "IdP Token Endpoint", action: "Verify Code & Request Token", description: "Backend forwards the code and verifier to the IdP. The IdP verifies that the verifier matches the client's challenge, and returns JWT tokens." },
  { from: "Spring Boot Server", to: "React Client", action: "Issue JWT Session Token", description: "Spring Boot signs an internal application session JWT and returns it to the React Client inside an HttpOnly, Secure, SameSite=Strict cookie." }
];

export const aiFlowSteps: SequenceStep[] = [
  { from: "React Client", to: "Spring Boot API", action: "Submit Solution (Scenario + Text)", description: "The user completes their system design solution and submits it via a POST request to '/api/practice/evaluate'." },
  { from: "Spring Boot API", to: "Redis Rate Limiter", action: "Check Token Bucket Rate", description: "The server queries Redis to check the user's current request count to protect against prompt abuse and DDoS vectors." },
  { from: "Spring Boot API", to: "Gemini 3.5 Flash SDK", action: "Forward Payload + System Prompt", description: "The server extracts the solution, packages it inside a structured system template detailing the rubric criteria, and fires it to the Gemini SDK on the server." },
  { from: "Gemini 3.5 Flash", to: "Spring Boot API", action: "Return Structured JSON Output", description: "Gemini evaluates the architecture, scores it out of 100, lists strengths/gaps, and returns a raw structured JSON string." },
  { from: "Spring Boot API", to: "PostgreSQL DB", action: "Save Historical Evaluation Log", description: "The server saves the scenario ID, score, rubric details, and feedback JSON in the 'evaluation_history' table for progress tracking." },
  { from: "Spring Boot API", to: "React Client", action: "Stream JSON feedback", description: "The server returns the structured evaluation object to the frontend, which triggers animations to render the grade, rubrics, and references." }
];

// Complete production-quality Mermaid diagrams in markup format
export const mermaidDiagrams = {
  systemComponent: `
graph TD
    %% User and CDN Boundaries
    User([SDE Candidate]) -->|HTTPS / WSS| CDN[Edge CDN / Nginx Proxy]
    
    subgraph Frontend Workspace (SPA React)
        CDN -->|Serves Assets| SPA[React Client SPA]
    end

    subgraph API Security & Routing
        CDN -->|Routes API Requests| Gateway[Cloud Armor / Nginx Gateway]
    end

    subgraph Core Spring Boot Application (DDD Service)
        Gateway -->|Verify JWT| SecurityFilter[Spring Security JWT Filter]
        SecurityFilter -->|Controller Routing| Controllers[REST Controllers]
        
        subgraph Domain Services
            Controllers -->|Practicing / Evaluate| EvaluationService[AI Evaluation Service]
            Controllers -->|Auth Details| AuthService[Auth Service]
            Controllers -->|Fetch Templates| ScenarioService[Scenario Service]
        end

        subgraph Infrastructure Connectors
            EvaluationService -->|Secure server call| GeminiClient[Gemini GenAI SDK Client]
            EvaluationService -->|Write/Read Logs| Repo[Spring Data JPA Repositories]
            Controllers -->|Check Limits / Session| RedisClient[(Spring Data Redis Client)]
        end
    end

    %% External & Database Systems
    GeminiClient -->|HTTPS TLS 1.3| GoogleAI[Gemini 3.5 Flash Engine]
    RedisClient -->|TCP| RedisCache[(Redis Cache & Rate Limiting Cluster)]
    Repo -->|Hikari Connection Pool| CloudSQL[(GCP Cloud SQL - PostgreSQL 16)]

    %% Styling
    classDef ui fill:#0284c7,stroke:#0369a1,stroke-width:2px,color:#fff;
    classDef gateway fill:#475569,stroke:#334155,stroke-width:2px,color:#fff;
    classDef backend fill:#15803d,stroke:#166534,stroke-width:2px,color:#fff;
    classDef external fill:#7c3aed,stroke:#6d28d9,stroke-width:2px,color:#fff;
    classDef db fill:#b45309,stroke:#92400e,stroke-width:2px,color:#fff;

    class SPA ui;
    class CDN,Gateway gateway;
    class SecurityFilter,Controllers,EvaluationService,AuthService,ScenarioService,GeminiClient,Repo,RedisClient backend;
    class GoogleAI external;
    class RedisCache,CloudSQL db;
  `,

  layeredArchitecture: `
graph TD
    subgraph UI/UX Client Layer
        React[React Workspace Components] -->|HTTP REST & JSON| DTO[Data Transfer Objects]
    end

    subgraph Spring Boot Layered Model
        subgraph Web/Controller Layer
            Controller[REST Controllers] -->|Deserializes to| DTO
            Controller -->|Validates & delegates| Security[Spring Security Annotations]
        end

        subgraph Business Logic / Service Layer
            Controller -->|Triggers transactions| Services[Transactional Services]
            Services -->|Executes domain rules| DomainEntities[Domain Domain Core Entities]
        end

        subgraph Data Access Layer (JPA)
            Services -->|Queries JPA| JPA[Spring Data Repositories]
            JPA -->|Maps to entity schemas| Hibernate[Hibernate ORM Engine]
        end
    end

    subgraph Persistent Storage Layer
        Hibernate -->|SQL Queries| CloudSQL[(PostgreSQL Database)]
        Services -->|Session & Rate Limits| Redis[(Redis Cluster)]
    end

    %% Styling
    classDef layer1 fill:#0f172a,stroke:#334155,stroke-width:2px,color:#fff;
    classDef layer2 fill:#1e293b,stroke:#475569,stroke-width:2px,color:#fff;
    classDef layer3 fill:#334155,stroke:#64748b,stroke-width:2px,color:#fff;
    classDef dbLayer fill:#0284c7,stroke:#0369a1,stroke-width:2px,color:#fff;

    class React,DTO layer1;
    class Controller,Security,Services,DomainEntities layer2;
    class JPA,Hibernate layer3;
    class CloudSQL,Redis dbLayer;
  `,

  deploymentDiagram: `
graph TD
    subgraph User Browser Environment
        Browser([SDE Candidate Browser]) -->|DNS / TLS 1.3| LB[Google Cloud HTTPS Load Balancer]
    end

    subgraph Google Cloud Platform VPC
        subgraph Edge / Delivery Layer
            LB -->|Static Asset Routing| GCS[Cloud Storage Bucket - SPA SPA]
            LB -->|API Routing| WAF[Cloud Armor Web Application Firewall]
        end

        subgraph Container Orchestration Layer (GKE Cluster)
            WAF -->|Traffic Ingress| Gateway[Nginx Ingress Controller]
            
            subgraph Private Core Subnet
                Gateway -->|Load Balancing| Pod1[Spring Boot App Pod 1]
                Gateway -->|Load Balancing| Pod2[Spring Boot App Pod 2]
            end
        end

        subgraph Secure Managed Database Subnet
            Pod1 & Pod2 -->|Hikari Pool Private IP| CloudSQL[(Cloud SQL PostgreSQL - Multi-AZ replica)]
            Pod1 & Pod2 -->|TCP Secure SSL| Memorystore[(GCP Memorystore Redis Cluster)]
            Pod1 & Pod2 -->|Secure KMS decryption| SecretManager[GCP Secret Manager]
        end
    end

    subgraph SaaS Boundary
        Pod1 & Pod2 -->|Google Cloud NAT egress| Gemini[Gemini Server-side API endpoint]
    end

    %% Styling
    classDef browser fill:#0f172a,stroke:#334155,stroke-width:2px,color:#fff;
    classDef edge fill:#475569,stroke:#334155,stroke-width:2px,color:#fff;
    classDef container fill:#16a34a,stroke:#15803d,stroke-width:2px,color:#fff;
    classDef db fill:#d97706,stroke:#b45309,stroke-width:2px,color:#fff;

    class Browser,LB browser;
    class GCS,WAF edge;
    class Gateway,Pod1,Pod2 container;
    class CloudSQL,Memorystore,SecretManager db;
  `
};
