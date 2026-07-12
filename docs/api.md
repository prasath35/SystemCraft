# 🔌 REST API Specification

This document defines the REST API endpoints exposed by **ArchitectAI**.

---

## 1. System Health API

### `GET /api/health`
Returns the status of the Express server, database connections, and active timestamps.

**Response (200 OK)**:
```json
{
  "status": "healthy",
  "timestamp": "2026-07-12T09:30:15.000Z"
}
```

---

## 2. AI Diagram Auditing API

### `POST /api/diagram/analyze`
Receives the active node-edge canvas layout, executes rule checks, and runs an AI-powered design health analysis using Gemini.

**Request Header**:
`Content-Type: application/json`

**Request Body**:
```json
{
  "nodes": [
    {
      "id": "node-1",
      "type": "PostgreSQL DB",
      "category": "storage",
      "label": "Primary Relational Cluster",
      "x": 200,
      "y": 150,
      "color": "border-emerald-500 bg-emerald-500/5",
      "shape": "cylinder"
    }
  ],
  "edges": []
}
```

**Response (200 OK)**:
```json
{
  "healthScore": 85,
  "missingComponents": [
    {
      "name": "Redis Cache memory tier",
      "severity": "High",
      "description": "Relational database handles all reads and writes directly without a low-latency caching buffer."
    }
  ],
  "scaleSuggestions": [
    "Add a high-throughput Redis cluster with an LRU eviction policy to cache popular entities."
  ],
  "detailedAudit": "Your architecture is off to a solid start, but relying entirely on a direct database path will create heavy bottleneck queues under rapid request volumes. Implementing a memory caching layer is critical.",
  "chatResponse": "I evaluated your topology and noticed a missing caching buffer. Resolving this will protect your primary datastore."
}
```

---

## 3. Dynamic Scenario Formulation API

### `POST /api/practice/generate-scenario`
Triggers Gemini to formulate a brand new, highly realistic system design interview scenario.

**Request Body**:
```json
{
  "difficulty": "Hard"
}
```

**Response (200 OK)**:
```json
{
  "id": "gen-ride-share",
  "title": "Real-time Ridesharing Dispatcher",
  "tagline": "Architect an ultra-low latency matchmaking engine handling 250,000 matches/min.",
  "difficulty": "Hard",
  "estimatedTime": "45 mins",
  "qps": "250,000 requests/sec writing coordinates",
  "storage": "10.4 TB geolocation vectors monthly",
  "prompt": "Construct a localized geometry indexing engine. Drivers broadcast GPS location signals every 2 seconds. Users request localized pick-ups, requiring latencies under 200ms.",
  "starterTips": [
    "Utilize Uber H3 hexagon spatial indexing for fast regional lookup.",
    "Offload driver coordinates to an in-memory Redis geospatial index.",
    "Implement Kafka partition brokers grouped by geohash keys."
  ]
}
```

---

## 4. AI Interview Evaluation API

### `POST /api/practice/evaluate`
Evaluates a candidate's textual system design solution against professional grading rubrics.

**Request Body**:
```json
{
  "scenarioTitle": "Ad-Click Tracking",
  "scenarioPrompt": "Scale to 100K clicks/sec...",
  "userSolution": "I will deploy a fleet of API Gateway nodes..."
}
```

**Response (200 OK)**:
```json
{
  "score": 82,
  "verdict": "Pass",
  "summary": "The proposed solution shows excellent microservice understanding and correctly leverages event streaming to absorb high-click volumes. However, cold-write database strategies need refinement.",
  "dimensions": [
    {
      "name": "Database Selection",
      "rating": "Needs Improvement",
      "feedback": "Using direct transactional inserts for click streams will lock tables. Pivot to partition-key Cassandras or Bigtables."
    }
  ],
  "strengths": [
    "Correct utilization of partitioned Apache Kafka buffers to prevent system backpressure."
  ],
  "gaps": [
    "No detailed outline of write consolidation or batch flushes before datastore persistent layers."
  ],
  "recommendedArchitecture": "A highly robust layout leverages an edge Load Balancer dispatching events directly to microservices. Clicking signals are immediately queued inside Apache Kafka clusters, which are read in batches by workers writing to Google Cloud Bigtable."
}
```

---

## 5. AI Copilot Chat API

### `POST /api/copilot/chat`
Enables a live conversational chat with the AI Copilot inside the diagram workspace.

**Request Body**:
```json
{
  "message": "Should I use Redis or Memcached for session tokens?",
  "nodes": [],
  "edges": []
}
```

**Response (200 OK)**:
```json
{
  "reply": "You should prefer Redis for session tokens. Redis offers built-in persistence models (AOF/RDB), active TTL support, and advanced data structures (like Hashes) which make session reads and validation extremely simple."
}
```
