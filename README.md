# 🏛️ ArchitectAI

> **AI-Powered System Design Workspace & Interview Practice Platform**  
> *A production-quality full-stack SaaS portfolio project demonstrating advanced System Design, Java Spring Boot engineering, React UI/UX, and Generative AI Integrations.*

---

## 🌟 Executive Overview

**ArchitectAI** is a comprehensive, interactive system design practice platform and FAANG-grade interview simulator. It empowers software engineers to design complex, high-throughput network topologies, write textual architectural proposals, and receive real-time, highly granular grading reviews from an AI-powered Staff Architect Copilot.

The repository is built to showcase master-level software engineering craft—unifying modern UI/UX layout patterns, resilient server pipelines, cloud containerization, database migrations, and advanced testing methodologies.

---

## 🛠️ System Capabilities

### 1. 🎨 Drag-and-Drop SVG Topology Workspace
- Instantiate, organize, and customize modular infrastructure components (API Gateways, CDN caches, Kafka partitions, PostgreSQL clusters, and Microservices).
- Establish node-to-node connectors and save layout snapshots.
- Trigger the **AI Design Auditor** to parse node-edge JSON data structures and mathematically evaluate the topology's scale resilience, identifying single-points-of-failure or coupling anti-patterns.

### 2. 💻 Interactive Coding & AI Grading Terminal
- Choose from standard FAANG scenarios (e.g., YouTube Transcoder, Distributed Rate Limiter) or trigger the **AI Scenario Generator** to dynamically formulate unique, scale-heavy problems.
- Draft textual architectures inside a sandboxed mockup IDE.
- Submit solutions to receive itemized reviews based on **Scalability, Storage Strategies, Latency buffers, and Interface designs**, displaying visual score charts, strengths, and critical gaps.

### 3. ☕ Enterprise Java Spring Boot Code Explorer
- Review a highly realistic, production-ready backend service.
- Explore robust structures including JWT secure filters, JPA model relationships, and transactional exceptions.
- Features a full unit and integration test suite demonstrating **JUnit 5, Mockito MockBeans, DataJpa slicing, and Testcontainers**.

---

## 🏛️ System Architecture

ArchitectAI leverages a resilient, multi-tier layout:
- **Frontend SPA**: React 19 and Tailwind CSS, utilizing Framer Motion for responsive UI transitions and SVG canvas interactions.
- **Backend API Gateway**: Node.js Express server integrating rate limiters, error-handling retry blocks, and lazy SDK bindings for the Google Gemini API.
- **Durable Storage**: Coordinated via local Docker postgres volumes and Redis memory caches.

*For complete technical details, refer to the [System Architecture Specification](./docs/architecture.md).*

---

## 📂 Repository Guide

The project's directory structure is mapped below. Consult the [Repository Folder Explanation](./docs/folder-explanation.md) for individual file definitions.

```
├── .github/workflows/      # GitHub Actions automation pipeline (ci-cd.yml)
├── docker/                 # Service-split packaging recipes
│   ├── backend-java.Dockerfile
│   └── frontend-react.Dockerfile
├── docs/                   # Full-scope system design manuals
│   ├── architecture.md     # In-depth system design, pipelines, caching
│   ├── api.md              # REST API definitions & JSON contracts
│   ├── deployment.md       # GCP Cloud Run, AWS multi-AZ ECS configurations
│   ├── environment-setup.md# Step-by-step developer start instructions
│   └── resume.md           # Professional resumes and LinkedIn portfolios kit
├── src/                    # Client application React source code
│   ├── components/         # Interactive canvas and interview view controllers
│   ├── data/               # Reference codebases and scenario schemas
│   └── App.tsx             # Main client router and layout wrapper
├── Dockerfile              # Unified production container recipe
├── docker-compose.yml      # Multi-tier local docker orchestrations
├── metadata.json           # Applet permissions descriptor
└── server.ts               # Express API and development server
```

---

## 🚀 Getting Started

To launch ArchitectAI locally or deploy it to cloud container services, consult our specialized handbooks:

- **[Local Developer Quickstart](./docs/environment-setup.md)**: Guides you through installing dependencies and booting up local environments with Vite.
- **[Docker Deployment Manual](./docs/deployment.md)**: Covers running local container networks using Docker Compose and deploying single or multi-tier instances on AWS or GCP.
- **[REST API Specification](./docs/api.md)**: Documents request/response JSON contracts for custom integrations.

---

## 💼 Portfolios & Career Showcase

This repository is optimized to serve as an outstanding career showcase for Senior/Staff Software Engineer interviews. 

We have compiled pre-written, highly persuasive descriptions of this project for your **ATS Resumes, LinkedIn updates, GitHub descriptions, and portfolios**.

👉 **[Access the Resume Portfolio Kit Here](./docs/resume.md)**
