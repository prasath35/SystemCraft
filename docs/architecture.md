# 🏛️ System Architecture Specification

This document details the multi-tier system design, data flows, caching strategies, and security protocols governing **ArchitectAI**.

---

## 1. Physical Component Architecture

ArchitectAI operates as a dual-runtime enterprise-grade deployment:
1. **Client Tier**: A React 19 Single Page Application styled with Tailwind CSS, utilizing Framer Motion for interactive layout transitions.
2. **Server Tier (APIs)**: An Express-Vite Node service implementing asynchronous routing, rate limiting, and lazy SDK bindings for the Google Gemini LLM API.
3. **Storage Tier (Relational + Memory)**:
   - **PostgreSQL**: Relational database storing user metadata, credentials, and scenario evaluations.
   - **Redis Cache**: Low-latency key-value cache layer protecting the PostgreSQL database from read spikes and managing distributed token bucket rate limits.

```
       +-------------------------------------------------+
       |               Client (React SPA)                |
       +-------------------------------------------------+
                               |
                        HTTPS (REST API)
                               |
                               v
                  +--------------------------+
                  |  Load Balancer (Anycast) |
                  +--------------------------+
                               |
                               v
                  +--------------------------+
                  |     API Gateway (Kong)   |
                  +--------------------------+
                               |
                               v
              +----------------------------------+
              |      Express Fullstack Server    |
              +----------------------------------+
                 /                            \
                /                              \
         (Fast Reads)                    (Persistent Data)
              /                                  \
             v                                    v
     +---------------+                     +--------------+
     |  Redis Cache  |                     | PostgreSQL DB|
     +---------------+                     +--------------+
```

---

## 2. Key Transactional Workflows

### 2.1. AI Interview Evaluation Workflow
1. Candidate writes text proposals inside the **Practice Sandbox Terminal**.
2. Request is rate-limited on the Express API gateway to prevent spam.
3. Express server invokes the **Gemini 3.5 Flash Model** using the `@google/genai` client, utilizing a structured prompt detailing candidate requirements, baseline storage, and candidate designs.
4. Gemini returns structured JSON matching the evaluation schema.
5. Review is persisted into the PostgreSQL evaluations table and returned to the client.

```
Candidate      Sandbox UI       Express API        Gemini API       PostgreSQL
   |               |                |                   |                |
   |--[Write]----->|                |                   |                |
   |--[Evaluate]-->|                |                   |                |
   |               |---[POST]------>|                   |                |
   |               |                |--[Audit Prompt]-->|                |
   |               |                |<--[JSON Review]---|                |
   |               |                |                                    |
   |               |                |---[Write Row]--------------------->|
   |               |<--[Review JSON]|                                    |
   |<--[Display]---|                |                                    |
```

### 2.2. Visual Diagram Auditing
1. Node-Edge topology coordinates are captured on the custom interactive SVG canvas.
2. Clicking "Run Copilot Audit" transfers the layout coordinates directly to `/api/diagram/analyze`.
3. The server runs deterministic check filters (Load Balancer existence, Redis Cache coupling, RabbitMQ/Kafka decouplers) and calculates a baseline score.
4. The remaining layout context is summarized and reviewed via the **Gemini 3.5 Flash Model** to identify hidden race conditions, partition bottlenecks, and suggest regional replication paths.
5. Merged audit results are visualized on the sidebar panel.

---

## 3. Distributed Caching & Scaling Policies

### 3.1. Caching Strategies
- **Cache-Aside Pattern**: Data requests for Scenario Definitions first query Redis. If a cache miss occurs, the backend queries PostgreSQL, writes the result to Redis with a 2-hour TTL (Time-To-Live), and returns.
- **Eviction Protocol**: Volatile Least-Recently-Used (LRU) policy ensures high-memory pressure drops expired keys first.

### 3.2. Rate Limiting (Token Bucket)
- Rate limiting is managed in Redis using atomic Lua scripts to execute safe decrement operations on IP-allocated token buckets.
- API limits:
  - Diagram audits: Maximum 15 requests per minute per IP.
  - LLM chats: Maximum 20 requests per minute per IP.
  - Scenario generations: Maximum 8 requests per minute per IP.
