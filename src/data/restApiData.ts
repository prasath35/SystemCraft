export interface ApiEndpoint {
  id: string;
  category: "Auth" | "Dashboard" | "Problems" | "Interviews" | "Diagrams" | "AI" | "Analytics" | "History";
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  summary: string;
  description: string;
  dtoIn?: string;
  dtoOut: string;
  validationRules: string[];
  possibleErrors: { code: number; message: string; reason: string }[];
  requiresAuth: boolean;
  rolesRequired?: string[];
  pagination?: {
    supported: boolean;
    defaultSize: number;
    maxSize: number;
    parameters: string[];
  };
  exampleRequest: string;
  exampleResponse: string;
}

export const restApiEndpoints: ApiEndpoint[] = [
  {
    id: "api-auth-login",
    category: "Auth",
    method: "POST",
    path: "/api/v1/auth/login",
    summary: "User Login",
    description: "Authenticates users using their credentials and issues a secure JWT token along with user metadata.",
    dtoIn: "UserLoginRequestDTO",
    dtoOut: "AuthTokenResponseDTO",
    validationRules: [
      "email must be a valid RFC 5322 format, non-empty, and max 100 characters.",
      "password must be non-empty, min 8 and max 64 characters."
    ],
    possibleErrors: [
      { code: 401, message: "INVALID_CREDENTIALS", reason: "The provided email or password does not match any registered account." },
      { code: 429, message: "RATE_LIMIT_EXCEEDED", reason: "Too many login failures. Account locked temporarily for 15 minutes." }
    ],
    requiresAuth: false,
    exampleRequest: `{
  "email": "candidate@architectai.dev",
  "password": "SecurePassword123!"
}`,
    exampleResponse: `{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkNhbmRpZGF0ZSIsImVtYWlsIjoiY2FuZGlkYXRlQGFyY2hpdGVjdGFpLmRldiIsImV4cCI6MTgwMTU2NzYwMH0.signature",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": "usr-8f3a921",
    "name": "Candidate One",
    "email": "candidate@architectai.dev",
    "role": "ROLE_USER",
    "targetCompany": "Google",
    "experienceYears": 5
  }
}`
  },
  {
    id: "api-auth-register",
    category: "Auth",
    method: "POST",
    path: "/api/v1/auth/register",
    summary: "User Registration",
    description: "Creates a new user account inside the platform, initializing default workspaces.",
    dtoIn: "UserRegisterRequestDTO",
    dtoOut: "AuthTokenResponseDTO",
    validationRules: [
      "name must be non-empty, between 2 and 50 characters.",
      "email must be a unique, valid email format.",
      "password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character."
    ],
    possibleErrors: [
      { code: 400, message: "EMAIL_ALREADY_EXISTS", reason: "A user with the specified email address is already registered." },
      { code: 400, message: "WEAK_PASSWORD", reason: "Password does not meet the specified entropy criteria." }
    ],
    requiresAuth: false,
    exampleRequest: `{
  "name": "Candidate One",
  "email": "candidate@architectai.dev",
  "password": "SecurePassword123!",
  "targetCompany": "Google",
  "experienceYears": 5
}`,
    exampleResponse: `{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkNhbmRpZGF0ZSIsImVtYWlsIjoiY2FuZGlkYXRlQGFyY2hpdGVjdGFpLmRldiIsImV4cCI6MTgwMTU2NzYwMH0.signature",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": "usr-8f3a921",
    "name": "Candidate One",
    "email": "candidate@architectai.dev",
    "role": "ROLE_USER",
    "targetCompany": "Google",
    "experienceYears": 5
  }
}`
  },
  {
    id: "api-dashboard-summary",
    category: "Dashboard",
    method: "GET",
    path: "/api/v1/dashboard/summary",
    summary: "Retrieve Workspace Stats",
    description: "Returns aggregated high-level statistics for the logged-in user, such as total practice hours, average score, and system design health trends.",
    dtoOut: "DashboardSummaryResponseDTO",
    validationRules: [],
    possibleErrors: [
      { code: 401, message: "UNAUTHORIZED", reason: "No valid JWT bearer token provided in authorization headers." }
    ],
    requiresAuth: true,
    exampleRequest: `GET /api/v1/dashboard/summary HTTP/1.1
Authorization: Bearer <token>`,
    exampleResponse: `{
  "totalInterviewsPracticed": 14,
  "averageScore": 78.5,
  "completedDiagrams": 6,
  "activeStreak": 5,
  "latestEvaluationScore": 82,
  "overallHealthScore": 81.2,
  "lastPracticeDate": "2026-07-11T14:32:00Z",
  "recentActivities": [
    { "id": "act-1", "type": "INTERVIEW", "title": "YouTube Video Transcoding Pipeline", "score": 82, "timestamp": "2026-07-11T14:32:00Z" },
    { "id": "act-2", "type": "DIAGRAM", "title": "Distributed Rate Limiter Redis Cluster", "score": 90, "timestamp": "2026-07-10T11:15:00Z" }
  ]
}`
  },
  {
    id: "api-problems-list",
    category: "Problems",
    method: "GET",
    path: "/api/v1/problems",
    summary: "List Design Scenarios",
    description: "Fetches a paginated, filterable list of active system design interview scenarios with baseline requirements and metrics.",
    dtoOut: "PaginatedProblemsResponseDTO",
    validationRules: [
      "page query param must be >= 0 (default 0).",
      "size query param must be <= 100 (default 10).",
      "difficulty filter must be one of: Easy, Medium, Hard (optional)."
    ],
    possibleErrors: [],
    requiresAuth: true,
    pagination: {
      supported: true,
      defaultSize: 10,
      maxSize: 100,
      parameters: ["page", "size", "difficulty", "search"]
    },
    exampleRequest: `GET /api/v1/problems?page=0&size=2&difficulty=Hard HTTP/1.1
Authorization: Bearer <token>`,
    exampleResponse: `{
  "content": [
    {
      "id": "07204f08-e70d-4e54-b221-bb03938aab01",
      "title": "Design YouTube",
      "tagline": "Distributed video sharing platform handling massive transcoding and delivery.",
      "difficulty": "Hard",
      "estimatedTime": "45 Mins",
      "qps": "10K Upload QPS, 50M Playback QPS",
      "storage": "500 TB / day video, 1 PB metadata"
    }
  ],
  "pageNumber": 0,
  "pageSize": 2,
  "totalElements": 4,
  "totalPages": 2,
  "last": false
}`
  },
  {
    id: "api-interviews-evaluate",
    category: "Interviews",
    method: "POST",
    path: "/api/v1/interviews/evaluate",
    summary: "Evaluate Architectural Proposal",
    description: "Evaluates a detailed architectural text proposal or a diagram specification against a staff rubric using Gemini AI, providing actionable feedback, weaknesses, strengths, and recommended architecture.",
    dtoIn: "InterviewEvaluationRequestDTO",
    dtoOut: "EvaluationResponseDTO",
    validationRules: [
      "scenarioId must be a valid registered scenario UUID.",
      "userSolution must be non-empty and between 100 and 10000 characters."
    ],
    possibleErrors: [
      { code: 400, message: "INVALID_PROMPT", reason: "The proposal is too short, unintelligible, or contains disallowed words." },
      { code: 422, message: "AI_PROCESSING_FAILED", reason: "An unexpected error occurred during model analysis and feedback formatting." }
    ],
    requiresAuth: true,
    exampleRequest: `{
  "scenarioId": "07204f08-e70d-4e54-b221-bb03938aab01",
  "userSolution": "Here is my architecture proposal for YouTube: We use DNS load balancing and an API Gateway to handle incoming uploads. Uploads are saved directly to an S3-compatible Blob storage..."
}`,
    exampleResponse: `{
  "id": "eval-9b34a1",
  "scenarioId": "07204f08-e70d-4e54-b221-bb03938aab01",
  "score": 82,
  "verdict": "Pass",
  "summary": "Excellent decoupling of the video upload and transcoding workflows using Kafka. Your metadata sharding scheme is realistic, but your Edge caching could be refined.",
  "dimensions": [
    { "name": "Scalability & Estimation", "rating": "Excellent", "feedback": "Accurately calculates network bandwidth demands for 10K upload streams." },
    { "name": "Storage Strategy", "rating": "Good", "feedback": "Decoupled catalog data is sharded effectively; however, cold storage tiers should be specified." }
  ],
  "strengths": [
    "Appropriate use of chunked multipart upload protocols",
    "Kafka is correctly positioned to queue transcoding jobs synchronously"
  ],
  "gaps": [
    "No fallback defined for Edge CDN point of failure",
    "Database write replication lag could cause catalog inconsistencies"
  ],
  "recommendedArchitecture": "We recommend implementing GKE-hosted ffmpeg worker pods reading from Google Cloud Pub/Sub, with Cloud Storage bucket triggers and Cloud CDN serving transcode segments."
}`
  },
  {
    id: "api-diagrams-save",
    category: "Diagrams",
    method: "POST",
    path: "/api/v1/diagrams",
    summary: "Save Workspace Diagram",
    description: "Saves the JSON layout of the system design workspace diagram, storing node configurations, edge links, and version history metadata.",
    dtoIn: "SaveDiagramRequestDTO",
    dtoOut: "DiagramResponseDTO",
    validationRules: [
      "title must be non-empty, max 100 characters.",
      "nodes and edges lists must be valid JSON arrays representing structural flow."
    ],
    possibleErrors: [
      { code: 400, message: "INVALID_CANVAS_DATA", reason: "Schema mapping contains isolated cycles or unsupported connections." }
    ],
    requiresAuth: true,
    exampleRequest: `{
  "title": "YouTube Live Multi-Region Ingestion",
  "scenarioId": "07204f08-e70d-4e54-b221-bb03938aab01",
  "nodes": [
    { "id": "node-1", "type": "gateway", "label": "API Gateway", "x": 100, "y": 200 },
    { "id": "node-2", "type": "queue", "label": "Kafka Queue", "x": 300, "y": 200 }
  ],
  "edges": [
    { "id": "edge-1", "source": "node-1", "target": "node-2", "label": "Ingest Events" }
  ]
}`,
    exampleResponse: `{
  "id": "diag-028a71b",
  "title": "YouTube Live Multi-Region Ingestion",
  "scenarioId": "07204f08-e70d-4e54-b221-bb03938aab01",
  "version": 1,
  "nodes": [...],
  "edges": [...],
  "updatedAt": "2026-07-12T02:22:00Z"
}`
  },
  {
    id: "api-ai-copilot",
    category: "AI",
    method: "POST",
    path: "/api/v1/ai/copilot",
    summary: "Interactive AI Copilot Analysis",
    description: "Provides on-the-fly architectural evaluation, missing components detection, scalability analysis, and conversational AI responses based on the state of the active workspace canvas.",
    dtoIn: "AiCopilotRequestDTO",
    dtoOut: "AiCopilotResponseDTO",
    validationRules: [
      "message must be non-empty.",
      "canvasState represents active nodes and connections in the workspace (optional)."
    ],
    possibleErrors: [],
    requiresAuth: true,
    exampleRequest: `{
  "message": "Explain how I can scale my metadata sharding",
  "canvasState": {
    "nodes": [
      { "id": "n1", "type": "database", "label": "PostgreSQL Main DB" }
    ],
    "edges": []
  }
}`,
    exampleResponse: `{
  "reply": "To scale your PostgreSQL Main DB for 100K write QPS, you should implement sharding based on a high-cardinality shard key (e.g. user_id). This allows you to split the database into multiple physical database servers. I recommend using Citus or a Consistent Hashing ring of standard PostgreSQL servers.",
  "healthScore": 74,
  "missingComponents": [
    { "component": "Read Replicas", "impact": "High", "description": "High read QPS demands dedicated read replica scaling." }
  ],
  "suggestions": {
    "scalability": "Implement Redis cache to bypass heavy DB queries for celebrity profiles.",
    "security": "Add an API Gateway with rate limiting (Token Bucket) in front of auth servers.",
    "performance": "Set up CDN cache headers for video thumbnails in cloud storage."
  }
}`
  },
  {
    id: "api-analytics-history",
    category: "Analytics",
    method: "GET",
    path: "/api/v1/analytics/history",
    summary: "Historical Score Trends",
    description: "Returns aggregated, time-series historical data points for the candidate's scores across all dimensions (Database, Scaling, Security, Performance).",
    dtoOut: "AnalyticsTrendsResponseDTO",
    validationRules: [],
    possibleErrors: [],
    requiresAuth: true,
    exampleRequest: `GET /api/v1/analytics/history HTTP/1.1
Authorization: Bearer <token>`,
    exampleResponse: `{
  "timeline": [
    { "date": "2026-07-08", "overall": 68, "scaling": 70, "database": 65, "security": 72, "performance": 65 },
    { "date": "2026-07-09", "overall": 72, "scaling": 75, "database": 68, "security": 75, "performance": 70 },
    { "date": "2026-07-10", "overall": 78, "scaling": 80, "database": 74, "security": 80, "performance": 78 },
    { "date": "2026-07-11", "overall": 82, "scaling": 85, "database": 80, "security": 82, "performance": 81 }
  ],
  "averageScores": {
    "scaling": 77.5,
    "database": 71.75,
    "security": 77.25,
    "performance": 73.5
  },
  "percentileRank": "Top 8.5%"
}`
  }
];
