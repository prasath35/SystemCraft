import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy-initialized Gemini client helper
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Executes a Gemini function with an exponential backoff retry strategy.
 * Gracefully handles 429 rate limit exceptions and 503 service transients.
 */
export async function executeWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1500): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error.status === 429 || error.message?.includes("429") || error.message?.includes("Quota exceeded");
    const isTransient = error.status === 503 || error.message?.includes("503") || error.message?.includes("Overloaded");

    if ((isRateLimit || isTransient) && retries > 0) {
      console.warn(`[AI SERVICE] Transient error or rate limit met. Retrying in ${delay}ms... (Retries left: ${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return executeWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Simple in-memory rate-limiter bucket to shield the LLM from quick client requests
const clientRequestRegistry = new Map<string, number[]>();

export function isRateLimited(clientId: string, limit = 10, durationMs = 60000): boolean {
  const now = Date.now();
  const timestamps = clientRequestRegistry.get(clientId) || [];
  
  // Filter out expired timestamps
  const activeTimestamps = timestamps.filter(t => now - t < durationMs);
  
  if (activeTimestamps.length >= limit) {
    return true;
  }
  
  activeTimestamps.push(now);
  clientRequestRegistry.set(clientId, activeTimestamps);
  return false;
}

export interface Node {
  id: string;
  type: string;
  category: "compute" | "storage" | "network" | "integration";
  label: string;
  x: number;
  y: number;
  color: string;
  shape: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  dashed?: boolean;
}

export interface DiagramAuditResult {
  healthScore: number;
  missingComponents: Array<{
    name: string;
    severity: "High" | "Medium" | "Low";
    description: string;
  }>;
  scaleSuggestions: string[];
  detailedAudit: string;
  chatResponse: string;
}

/**
 * Diagram JSON Parser & Architecture Health Score Engine.
 * Formulates a prompt listing the architectural nodes & connections, checks rules, 
 * and calls Gemini 3.5 Flash for design health audits.
 */
export async function parseAndAuditDiagram(nodes: Node[], edges: Edge[]): Promise<DiagramAuditResult> {
  // 1. Core Rule-Based scoring baseline (Deterministic Architecture Engine)
  let baseScore = 100;
  const detectedMissing: Array<{ name: string; severity: "High" | "Medium" | "Low"; description: string }> = [];
  const rulesSuggestions: string[] = [];

  const hasLB = nodes.some(n => n.type.toLowerCase().includes("load balancer"));
  const hasGateway = nodes.some(n => n.type.toLowerCase().includes("gateway"));
  const hasDB = nodes.some(n => n.type.toLowerCase().includes("postgres") || n.type.toLowerCase().includes("nosql") || n.type.toLowerCase().includes("database"));
  const hasCache = nodes.some(n => n.type.toLowerCase().includes("cache") || n.type.toLowerCase().includes("redis"));
  const hasQueue = nodes.some(n => n.type.toLowerCase().includes("queue") || n.type.toLowerCase().includes("kafka") || n.type.toLowerCase().includes("pub/sub"));
  const hasWorkers = nodes.some(n => n.type.toLowerCase().includes("worker") || n.type.toLowerCase().includes("microservice") || n.type.toLowerCase().includes("batch"));

  if (nodes.length === 0) {
    return {
      healthScore: 0,
      missingComponents: [{ name: "Any active nodes", severity: "High", description: "Your canvas is currently empty. Instantiate components from the left palette to construct your architecture." }],
      scaleSuggestions: ["Instantiate clients, load balancers, and backend microservices to formulate a design."],
      detailedAudit: "Empty canvas topology cannot be audited.",
      chatResponse: "Your canvas is completely blank! Let's start by clicking components like 'Client App' and 'API Gateway' from the palette to draft your architecture."
    };
  }

  if (!hasLB && nodes.length > 3) {
    baseScore -= 15;
    detectedMissing.push({
      name: "Anycast Load Balancer",
      severity: "High",
      description: "Traffic hits your network routing gateway directly. This creates a critical single point of failure (SPOF) and leaves backend web threads highly vulnerable to un-shuffled request surges."
    });
    rulesSuggestions.push("Deploy a multi-region Layer 4/7 Load Balancer at the edge to evenly distribute HTTP/gRPC ingress.");
  }

  if (hasDB && !hasCache) {
    baseScore -= 15;
    detectedMissing.push({
      name: "Redis Cache memory tier",
      severity: "High",
      description: "relational database handles all reads and writes directly without a low-latency caching buffer. High-read key routes will suffer from I/O starvation under peak load."
    });
    rulesSuggestions.push("Add a high-throughput Redis cluster with an LRU eviction policy to cache popular entities.");
  }

  if (hasWorkers && !hasQueue) {
    baseScore -= 15;
    detectedMissing.push({
      name: "Message Queue (Kafka)",
      severity: "High",
      description: "Heavy asynchronous batch execution is coupled synchronously to your web servers. Heavy files or video transcoding requests will choke active HTTP connection pools."
    });
    rulesSuggestions.push("Introduce a partitioned Apache Kafka message broker to safely queue asynchronous work tasks.");
  }

  if (!hasGateway) {
    baseScore -= 10;
    detectedMissing.push({
      name: "API Edge Gateway (Kong)",
      severity: "Medium",
      description: "Your backend microservices are exposed directly to public DNS. There is no central point for edge-level authorization, rate limiting, or SSL termination."
    });
    rulesSuggestions.push("Insert a Kong or Apigee API Gateway behind your Load Balancer to perform unified authentication filters.");
  }

  // Ensure score stays bounded
  baseScore = Math.max(25, baseScore);

  // 2. AI feedback generation for high-fidelity reviews (Gemini 3.5 Flash - cost optimized)
  try {
    const ai = getGeminiClient();
    const systemInstruction = `You are a Principal Software Architect conducting a System Design review of a candidate's visual diagram.
Analyze the provided node-edge list representing a custom network/infrastructure architecture. 
Give realistic feedback based on high-scale standards (100K+ QPS, millions of users).

Provide your response in a strict structured JSON matching this schema:
{
  "scoreAdjustment": number (-20 to +10 based on additional subtle design strengths or severe antipatterns identified),
  "detailedAuditMarkdown": "A comprehensive 2-paragraph analysis highlighting bottle-necks, data-flow coherence, and scaling advice",
  "aiSuggestions": ["list", "of", "2-3", "concrete", "advanced", "scaling", "recommendations"],
  "gaps": [
    {
      "name": "Component name (e.g., Database Partitioning)",
      "severity": "High" | "Medium" | "Low",
      "description": "Short explanation of the flaw"
    }
  ],
  "chatSummary": "Friendly, encouraging, staff-engineer-level summary of the review (max 2 sentences)"
}`;

    const prompt = `Nodes list:\n${JSON.stringify(nodes, null, 2)}\n\nEdges list:\n${JSON.stringify(edges, null, 2)}`;

    const response = await executeWithRetry(() => ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scoreAdjustment: { type: Type.INTEGER },
            detailedAuditMarkdown: { type: Type.STRING },
            aiSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            gaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "severity", "description"]
              }
            },
            chatSummary: { type: Type.STRING }
          },
          required: ["scoreAdjustment", "detailedAuditMarkdown", "aiSuggestions", "gaps", "chatSummary"]
        }
      }
    }));

    const text = response.text;
    if (!text) throw new Error("No response generated from Gemini.");

    const parsed = JSON.parse(text);

    // Merge deterministic scoring with LLM-suggested adjustment
    const finalScore = Math.min(100, Math.max(20, baseScore + (parsed.scoreAdjustment || 0)));
    
    // Merge rule-based gaps and AI gaps
    const mergedGaps = [...detectedMissing];
    if (parsed.gaps && Array.isArray(parsed.gaps)) {
      parsed.gaps.forEach((g: any) => {
        // Prevent duplicate gaps if they cover the same topic
        if (!mergedGaps.some(mg => mg.name.toLowerCase().includes(g.name.toLowerCase()))) {
          mergedGaps.push({
            name: g.name,
            severity: g.severity as "High" | "Medium" | "Low",
            description: g.description
          });
        }
      });
    }

    // Merge suggestions
    const mergedSuggestions = [...rulesSuggestions];
    if (parsed.aiSuggestions && Array.isArray(parsed.aiSuggestions)) {
      parsed.aiSuggestions.forEach((s: string) => {
        if (!mergedSuggestions.includes(s)) mergedSuggestions.push(s);
      });
    }

    return {
      healthScore: finalScore,
      missingComponents: mergedGaps,
      scaleSuggestions: mergedSuggestions,
      detailedAudit: parsed.detailedAuditMarkdown,
      chatResponse: parsed.chatSummary
    };

  } catch (error: any) {
    console.error("[AI SERVICE] Diagram audit failed:", error);
    // Fallback gracefully to our highly functional deterministic rules engine
    return {
      healthScore: baseScore,
      missingComponents: detectedMissing,
      scaleSuggestions: rulesSuggestions.length > 0 ? rulesSuggestions : ["Review your node counts and connections to find bottlenecks."],
      detailedAudit: "Failed to load real-time AI architectural audit. Displaying rule-based microservice checks. Please ensure your GEMINI_API_KEY is configured.",
      chatResponse: `Your architecture scores a local ${baseScore}% health checklist score! Make sure to resolve missing elements listed in your panel.`
    };
  }
}

/**
 * Question Generator API.
 * Uses Gemini to invent a brand new distributed system design problem.
 */
export async function generateNewScenario(difficulty: "Easy" | "Medium" | "Hard" = "Medium"): Promise<any> {
  const ai = getGeminiClient();

  const systemInstruction = `You are a Principal Engineer drafting a brand new, highly realistic system design interview scenario for FAANG+ SDE candidates.
Create an engineering problem that does not duplicate typical scenarios (like TinyURL or Twitter). Examples of exciting problems: "Distributed Ad-Click Tracking", "Real-Time Collaborative Spreadsheet", "Location-Tracking Delivery Fleet Dispatcher", "IoT Smart Home Telemetry Ingress Engine", "Global Vaccine Distribution Ledger".

Provide the output in a strict structured JSON matching this schema:
{
  "id": "generate a unique short string ID (e.g. gen-telemetry)",
  "title": "A concise title (e.g. IoT Fleet Telemetry)",
  "tagline": "A 1-sentence executive tagline describing the business objective",
  "difficulty": "Easy" | "Medium" | "Hard",
  "estimatedTime": "Time limit (e.g. 45 mins)",
  "qps": "Rough expected reads/writes QPS scale (e.g. 50,000 writes QPS / 500 reads QPS)",
  "storage": "Rough storage requirements per day/month (e.g. 2.4 TB daily data ingest)",
  "prompt": "A detailed 3-sentence description outlining the active operations, functional requirements, and strict non-functional constraints",
  "starterTips": [
    "Tip 1 regarding calculations or memory budgets",
    "Tip 2 regarding database sharding keys or partition choices",
    "Tip 3 regarding caching eviction or offline buffers"
  ]
}`;

  const prompt = `Generate a brand new system design scenario with difficulty: "${difficulty}". Ensure the problem has distinct scale bottlenecks and storage metrics.`;

  const response = await executeWithRetry(() => ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          tagline: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          estimatedTime: { type: Type.STRING },
          qps: { type: Type.STRING },
          storage: { type: Type.STRING },
          prompt: { type: Type.STRING },
          starterTips: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["id", "title", "tagline", "difficulty", "estimatedTime", "qps", "storage", "prompt", "starterTips"]
      }
    }
  }));

  const text = response.text;
  if (!text) throw new Error("No response text returned from scenario generator.");
  return JSON.parse(text);
}
