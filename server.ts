import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Octokit } from "@octokit/rest";
import { 
  parseAndAuditDiagram, 
  generateNewScenario, 
  isRateLimited, 
  executeWithRetry 
} from "./server/aiService.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// GitHub Version Control & Synchronization Routes
app.post("/api/github/sync", async (req, res) => {
  const { token, owner, repo, branch, filePath, content, commitMessage } = req.body;

  if (!token || !owner || !repo || !filePath || !content) {
    return res.status(400).json({ error: "Missing required parameters (token, owner, repo, filePath, content)." });
  }

  try {
    const octokit = new Octokit({ auth: token });
    const targetBranch = branch || "main";

    // 1. Check if file already exists on this branch to retrieve the SHA
    let sha: string | undefined = undefined;
    try {
      const response = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: targetBranch,
      });

      if (!Array.isArray(response.data) && response.data.type === "file") {
        sha = response.data.sha;
      }
    } catch (err: any) {
      if (err.status !== 404) {
        throw err;
      }
    }

    // 2. Commit and sync file contents
    const syncResult = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: commitMessage || `ArchitectAI: Sync system design diagram (${new Date().toLocaleDateString()})`,
      content: Buffer.from(content).toString("base64"),
      branch: targetBranch,
      sha,
    });

    return res.json({
      success: true,
      message: "Workspace design diagram synchronized successfully to GitHub!",
      commitSha: syncResult.data.commit.sha,
      filePath,
      htmlUrl: syncResult.data.content?.html_url || `https://github.com/${owner}/${repo}/blob/${targetBranch}/${filePath}`,
    });
  } catch (error: any) {
    console.error("GitHub Sync error:", error);
    return res.status(error.status || 500).json({
      error: error.message || "Failed to sync diagram with GitHub repository.",
      details: error.response?.data?.message || "Verify your repository permissions and access token scopes (repo write permission)."
    });
  }
});

app.post("/api/github/fetch", async (req, res) => {
  const { token, owner, repo, branch, filePath } = req.body;

  if (!token || !owner || !repo || !filePath) {
    return res.status(400).json({ error: "Missing required parameters (token, owner, repo, filePath)." });
  }

  try {
    const octokit = new Octokit({ auth: token });
    const targetBranch = branch || "main";

    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: targetBranch,
    });

    if (Array.isArray(response.data) || response.data.type !== "file") {
      return res.status(400).json({ error: "Target path is not a file." });
    }

    const decodedContent = Buffer.from(response.data.content, "base64").toString("utf-8");
    
    // Validate if it is a valid JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(decodedContent);
    } catch (e) {
      return res.status(400).json({ 
        error: "Malformed File Content", 
        details: "The selected file content on GitHub is not a valid JSON system design diagram." 
      });
    }

    return res.json({
      success: true,
      filePath,
      content: parsedContent,
    });
  } catch (error: any) {
    console.error("GitHub Fetch error:", error);
    return res.status(error.status || 500).json({
      error: error.message || "Failed to fetch diagram file from GitHub.",
      details: error.response?.data?.message || "Ensure the path is correct and your token has reading permissions."
    });
  }
});

app.post("/api/github/list", async (req, res) => {
  const { token, owner, repo, branch, dirPath } = req.body;

  if (!token || !owner || !repo) {
    return res.status(400).json({ error: "Missing required parameters (token, owner, repo)." });
  }

  try {
    const octokit = new Octokit({ auth: token });
    const targetBranch = branch || "main";
    const pathToCheck = dirPath || "";

    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: pathToCheck,
      ref: targetBranch,
    });

    if (!Array.isArray(response.data)) {
      return res.json({ files: [] });
    }

    // Filter files to only show .json files (system diagrams)
    const files = response.data
      .filter(item => item.type === "file" && item.name.endsWith(".json"))
      .map(item => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
        size: item.size,
        downloadUrl: item.download_url,
      }));

    return res.json({ success: true, files });
  } catch (error: any) {
    console.error("GitHub List error:", error);
    return res.status(error.status || 500).json({
      error: error.message || "Failed to list directory contents from GitHub.",
      details: error.response?.data?.message || "Ensure repository exists and branch is correct."
    });
  }
});

// AI Diagram Topography Audit Route
app.post("/api/diagram/analyze", async (req, res) => {
  const clientIp = req.ip || "global";
  if (isRateLimited(clientIp, 15, 60000)) {
    return res.status(429).json({ 
      error: "Rate Limit Exceeded", 
      details: "You are making too many design audit requests. Please wait 60 seconds." 
    });
  }

  try {
    const { nodes, edges } = req.body;
    if (!nodes) {
      return res.status(400).json({ error: "Nodes array is required." });
    }
    const auditResult = await parseAndAuditDiagram(nodes, edges || []);
    return res.json(auditResult);
  } catch (error: any) {
    console.error("Diagram analysis API error:", error);
    return res.status(500).json({ 
      error: error.message || "An error occurred during diagram auditing.",
      details: "Database sync check failed."
    });
  }
});

// AI Scenario generator route (Practice Sandbox dynamic problems)
app.post("/api/practice/generate-scenario", async (req, res) => {
  const clientIp = req.ip || "global";
  if (isRateLimited(clientIp, 8, 60000)) {
    return res.status(429).json({ 
      error: "Rate Limit Exceeded", 
      details: "You are generating system design problems too quickly. Please wait 60 seconds." 
    });
  }

  try {
    const { difficulty } = req.body;
    const scenario = await generateNewScenario(difficulty || "Medium");
    return res.json(scenario);
  } catch (error: any) {
    console.error("Generate scenario API error:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to dynamically formulate a system design scenario." 
    });
  }
});

// AI Interview feedback evaluation route
app.post("/api/practice/evaluate", async (req, res) => {
  try {
    const { scenarioTitle, scenarioPrompt, userSolution } = req.body;

    if (!scenarioTitle || !userSolution) {
      return res.status(400).json({ error: "scenarioTitle and userSolution are required." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a Principal Software Architect at Google conducting a System Design Interview. 
Analyze the candidate's proposed solution for the system design scenario "${scenarioTitle}".
Evaluate their architecture across the following dimensions:
1. Scalability & Scale estimation (e.g., handling high QPS, storage requirements)
2. Database Selection & Storage Strategy (SQL vs. NoSQL, caching, replication)
3. Latency, Availability & Fault Tolerance (CDN, load balancing, replication, single points of failure)
4. Component Design & APIs (clear microservices, communication patterns like REST, gRPC, Pub/Sub)

Provide your review in a structured JSON format matching this schema:
{
  "score": number (0-100),
  "verdict": "Strong Pass" | "Pass" | "Weak Pass" | "Fail",
  "summary": "High-level summary of the architectural feedback",
  "dimensions": [
    {
      "name": "Dimension name (e.g., Database Selection)",
      "rating": "Excellent" | "Good" | "Needs Improvement" | "Critical",
      "feedback": "Specific feedback text"
    }
  ],
  "strengths": ["list", "of", "architectural", "strengths"],
  "gaps": ["list", "of", "critical", "gaps", "or", "bottlenecks", "identified"],
  "recommendedArchitecture": "A comprehensive paragraph outlining the ideal high-fidelity architecture for this problem with standard Google Cloud or general modern technologies"
}

Be constructive, insightful, and highly realistic. Use terms like "Read replicas", "Write-through cache", "Gossip protocol", "Sharding", "Consistent hashing", "Saga pattern", and "CAP Theorem" where appropriate. Keep your response in valid JSON.`;

    const prompt = `Scenario Prompt: ${scenarioPrompt}\n\nCandidate's Solution:\n${userSolution}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            verdict: { type: Type.STRING },
            summary: { type: Type.STRING },
            dimensions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  rating: { type: Type.STRING },
                  feedback: { type: Type.STRING },
                },
                required: ["name", "rating", "feedback"],
              },
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            gaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedArchitecture: { type: Type.STRING },
          },
          required: ["score", "verdict", "summary", "dimensions", "strengths", "gaps", "recommendedArchitecture"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from Gemini.");
    }

    const evaluation = JSON.parse(text);
    return res.json(evaluation);

  } catch (error: any) {
    console.error("Gemini evaluation error:", error);
    return res.status(500).json({ 
      error: error.message || "An error occurred during evaluation.",
      details: "Please check your GEMINI_API_KEY and connection."
    });
  }
});

// AI Copilot conversational chat route
app.post("/api/copilot/chat", async (req, res) => {
  const clientIp = req.ip || "global";
  if (isRateLimited(clientIp, 20, 60000)) {
    return res.status(429).json({ 
      error: "Rate Limit Exceeded", 
      details: "You are chatting too quickly. Please wait a few seconds." 
    });
  }

  try {
    const { message, nodes, edges } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a helpful, extremely knowledgeable Senior Staff Software Architect at Google acting as an AI Copilot.
The candidate is looking at a system design canvas. 
Here is their current visual architecture state:
- Nodes: ${JSON.stringify(nodes || [])}
- Edges: ${JSON.stringify(edges || [])}

Answer their message or design question directly and helpfully.
Use strict FAANG+ architectural vocabulary (e.g. partition keys, read replicas, write-through cache, CAP theorem, consistent hashing, backpressure, rate-limiting, gRPC, decoupled workers, event streams, index types, flyway migrations).
Be concise (max 3 sentences), deeply technical, and speak as a supportive Principal engineer. Do not mention system-internal files, code paths, or JSON formats in your text reply unless asked.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || "I am processing your diagram details. Could you expand more on your scaling requirements?";
    return res.json({ reply });

  } catch (error: any) {
    console.error("Copilot chat error:", error);
    return res.status(500).json({ 
      error: error.message || "Could not complete chat query.",
      details: "Check API keys and model availability."
    });
  }
});

// Configure Vite or Static Assets based on environment
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ArchitectAI] Server running on http://localhost:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Failed to start server:", err);
});
