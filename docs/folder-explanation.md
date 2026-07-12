# 📂 Repository Folder Structure & Explanation

This document provides a directory map of the **ArchitectAI** workspace, describing the architectural roles of key files.

---

## 1. Directory Tree Map

```
/
├── .github/                # Automation CI/CD configurations
│   └── workflows/          # GitHub Actions pipelines (ci-cd.yml)
├── docker/                 # Container packaging configurations
│   ├── backend-java.Dockerfile
│   └── frontend-react.Dockerfile
├── docs/                   # Production system design documentation
│   ├── architecture.md     # System design, data pipelines, caching schemas
│   ├── api.md              # REST API definitions and JSON schemas
│   ├── deployment.md       # Render, AWS, and Cloud Run manuals
│   ├── environment-setup.md# Quickstart guide for developers
│   └── resume.md           # Professional portfolio elevator pitch
├── src/                    # Client SPA application files
│   ├── components/         # Modular interactive UI views
│   │   ├── BackendExplorer.tsx # Interactive Spring Boot file tree viewer
│   │   ├── Dashboard.tsx       # System Analytics visual boards
│   │   ├── DiagramWorkspace.tsx# Drag-and-drop system topology canvas
│   │   ├── InterviewLibrary.tsx# Practice problem scenarios catalogue
│   │   └── PracticeSandbox.tsx # Coding terminal with AI review
│   ├── data/               # Local static database scenarios and listings
│   │   ├── scenariosData.ts
│   │   └── springBootData.ts   # JPA Entities, DTOs, Controllers, JUnit Tests
│   ├── App.tsx             # Central route switcher and layout wrapper
│   ├── index.css           # Global Tailwind CSS directives
│   ├── main.tsx            # React 19 bootstrap entry point
│   └── types.ts            # Global TypeScript types (PracticeScenario, etc.)
├── Dockerfile              # Root unified production container recipe
├── docker-compose.yml      # Local dev environment orchestration
├── metadata.json           # Application permissions and capabilities descriptor
├── package.json            # Node.js dependencies configuration
├── server.ts               # Express Server & Vite dev middleware controller
├── tsconfig.json           # TypeScript compilation limits configuration
└── vite.config.ts          # Vite asset bundling plugins configuration
```

---

## 2. Key File Descriptions

- **`server.ts`**: The central backbone API controller. In development, it spins up Vite in middleware mode. In production, it serves static files out of `/dist`. It handles rate limiting, hosts `/api/copilot/chat` conversations, parses layout topologies on `/api/diagram/analyze`, and coordinates sandbox grading on `/api/practice/evaluate`.
- **`src/components/DiagramWorkspace.tsx`**: An advanced drag-and-drop SVG drafting workspace. It allows candidate engineers to instantiate, customize, link, and export system design nodes. It binds directly to the server audit API to grade layout validity dynamically.
- **`src/components/PracticeSandbox.tsx`**: A mock terminal IDE where candidates draft textual architectures. It feeds data into the AI evaluator service to trigger mock loading timelines and visualize grading score sheets, itemized strengths, and gaps.
- **`src/components/BackendExplorer.tsx`**: An interactive file-tree browser designed to demonstrate Java Spring Boot codebase proficiency, organizing real JPA configurations and JUnit/Mockito mock classes into cleanly separated tabs.
