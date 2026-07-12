import { TableSchema, FlywayMigration, RelationshipSchema } from "../types";

export const tableSchemas: TableSchema[] = [
  {
    name: "users",
    description: "Stores primary candidate profiles. Outsource credentials to third-party identity providers, tracking only standard telemetry and system roles.",
    columns: [
      { name: "id", type: "UUID (v7)", nullable: false, isPrimary: true, description: "Chronologically sortable high-performance unique identifier." },
      { name: "email", type: "VARCHAR(255)", nullable: false, isPrimary: false, description: "Primary contact email, index-guarded and verified unique." },
      { name: "display_name", type: "VARCHAR(128)", nullable: true, isPrimary: false, description: "Human-readable profile name." },
      { name: "role", type: "VARCHAR(64)", nullable: false, isPrimary: false, description: "Standard security role (e.g. ROLE_CANDIDATE, ROLE_ADMIN)." },
      { name: "created_at", type: "TIMESTAMP WITH TIME ZONE", nullable: false, isPrimary: false, description: "UTC timestamp when the user profile was instantiated." },
      { name: "updated_at", type: "TIMESTAMP WITH TIME ZONE", nullable: false, isPrimary: false, description: "UTC timestamp of last telemetry updates." }
    ],
    indexes: [
      { name: "uq_users_email", type: "UNIQUE INDEX", columns: ["email"], purpose: "Enforces unique logins and speeds up session lookup filters." }
    ],
    ddl: `CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(128),
    role VARCHAR(64) NOT NULL DEFAULT 'ROLE_CANDIDATE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_users_email UNIQUE(email)
);`
  },
  {
    name: "practice_scenarios",
    description: "Curated list of standard system design problems presented on the ArchitectAI dashboard workspace. Stores scaling constraints and initial prompt guidelines.",
    columns: [
      { name: "id", type: "UUID (v7)", nullable: false, isPrimary: true, description: "Primary key identifier." },
      { name: "title", type: "VARCHAR(128)", nullable: false, isPrimary: false, description: "Scenario title (e.g., 'Design YouTube')." },
      { name: "tagline", type: "VARCHAR(256)", nullable: false, isPrimary: false, description: "Brief visual summary." },
      { name: "difficulty", type: "VARCHAR(32)", nullable: false, isPrimary: false, description: "Scenario complexity indicator (Easy, Medium, Hard)." },
      { name: "estimated_time", type: "VARCHAR(64)", nullable: false, isPrimary: false, description: "Recommended solution time." },
      { name: "qps_estimation", type: "VARCHAR(64)", nullable: false, isPrimary: false, description: "QPS baseline constraints (e.g., '100K Write QPS')." },
      { name: "storage_estimation", type: "VARCHAR(64)", nullable: false, isPrimary: false, description: "Storage baseline calculations." },
      { name: "prompt", type: "TEXT", nullable: false, isPrimary: false, description: "Full descriptive text outlining requirements." }
    ],
    indexes: [
      { name: "idx_scenarios_difficulty", type: "B-TREE INDEX", columns: ["difficulty"], purpose: "Speeds up scenario dashboard category filtering." }
    ],
    ddl: `CREATE TABLE practice_scenarios (
    id UUID PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    tagline VARCHAR(256) NOT NULL,
    difficulty VARCHAR(32) NOT NULL,
    estimated_time VARCHAR(64) NOT NULL,
    qps_estimation VARCHAR(64) NOT NULL,
    storage_estimation VARCHAR(64) NOT NULL,
    prompt TEXT NOT NULL
);`
  },
  {
    name: "evaluation_history",
    description: "Stores user submissions and detailed, structured AI rubric logs returned by the Gemini core analyzer. Leveraging JSONB for highly structured dimensional feedback.",
    columns: [
      { name: "id", type: "UUID (v7)", nullable: false, isPrimary: true, description: "Unique tracking identifier." },
      { name: "user_id", type: "UUID", nullable: false, isPrimary: false, isForeign: true, references: "users.id", description: "FK mapping to the active candidate." },
      { name: "scenario_id", type: "UUID", nullable: false, isPrimary: false, isForeign: true, references: "practice_scenarios.id", description: "FK mapping to the system design scenario." },
      { name: "user_solution", type: "TEXT", nullable: false, isPrimary: false, description: "The full solution narrative written by the candidate." },
      { name: "score", type: "INTEGER", nullable: false, isPrimary: false, description: "Aggregated score computed by the AI agent (0-100)." },
      { name: "verdict", type: "VARCHAR(64)", nullable: false, isPrimary: false, description: "Performance result: Strong Pass, Pass, Weak Pass, Fail." },
      { name: "feedback_payload", type: "JSONB", nullable: false, isPrimary: false, description: "Unstructured JSON array of dimensional rubrics, strengths, and recommended architectures." },
      { name: "created_at", type: "TIMESTAMP WITH TIME ZONE", nullable: false, isPrimary: false, description: "UTC timestamp of the practice session." }
    ],
    indexes: [
      { name: "idx_eval_user_scenario", type: "B-TREE INDEX", columns: ["user_id", "scenario_id"], purpose: "Optimizes dashboard portfolio query response times." },
      { name: "idx_eval_score", type: "B-TREE INDEX", columns: ["score"], purpose: "Enables fast leaderboard rendering and high-performance queries." },
      { name: "idx_eval_jsonb_gin", type: "GIN INDEX", columns: ["feedback_payload"], purpose: "Speeds up deep full-text queries within the raw evaluation response documents." }
    ],
    ddl: `CREATE TABLE evaluation_history (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    scenario_id UUID NOT NULL,
    user_solution TEXT NOT NULL,
    score INTEGER NOT NULL,
    verdict VARCHAR(64) NOT NULL,
    feedback_payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_eval_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_eval_scenario FOREIGN KEY(scenario_id) REFERENCES practice_scenarios(id) ON DELETE CASCADE
);`
  }
];

export const databaseStrategies = {
  uuid: {
    title: "UUIDv7 ID Generation Strategy",
    content: "Traditional auto-incrementing integer IDs (e.g., 1, 2, 3) leak system volumes and create sync collisions in distributed databases. Standard UUIDv4 values are randomized, which fractures clustered index trees and results in disk I/O thrashing. In ArchitectAI, we mandate UUIDv7. UUIDv7 combines a 48-bit millisecond timestamp prefix with random padding, ensuring chronological order at generation time. This guarantees O(log N) insert speeds while providing global uniqueness without coordination."
  },
  jsonb: {
    title: "JSONB Semi-Structured Strategy",
    content: "The feedback payload returned by our server-side Gemini system contains dynamic, variable-length fields (such as lists of strengths, variable-length arrays of core architectural recommendations, and changing dimensional ratings). Flat normalization of this dynamic rubric would require dozens of relational tables and expensive runtime JOINs. We store the complete evaluation structure inside a single PostgreSQL JSONB column. We then attach a Generalized Inverted Index (GIN) on the column, allowing sub-millisecond querying of individual fields (such as pulling up all evaluations that contain a specific gap recommendation)."
  },
  index: {
    title: "Indexing & Query Optimization Strategy",
    content: "Every index we define is aligned with an exact high-traffic SaaS query pattern. We apply a UNIQUE B-Tree on email lookup for instant logins. We construct a multi-column Composite Index on user_id + scenario_id on the evaluation history table to ensure that when a user accesses their dashboard portfolio, PostgreSQL finds their records in a single seek, bypassing full table scans."
  }
};

export const flywayMigrationOrder: FlywayMigration[] = [
  {
    version: "V1__init_schemas.sql",
    name: "Initial Core Tables",
    description: "Creates primary tables: users, practice_scenarios, and evaluation_history, establishing primary and foreign key constraints.",
    sql: `-- Setup UUID extension support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(128),
    role VARCHAR(64) NOT NULL DEFAULT 'ROLE_CANDIDATE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_users_email UNIQUE(email)
);

-- Create Practice Scenarios table
CREATE TABLE practice_scenarios (
    id UUID PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    tagline VARCHAR(256) NOT NULL,
    difficulty VARCHAR(32) NOT NULL,
    estimated_time VARCHAR(64) NOT NULL,
    qps_estimation VARCHAR(64) NOT NULL,
    storage_estimation VARCHAR(64) NOT NULL,
    prompt TEXT NOT NULL
);`
  },
  {
    version: "V2__create_evaluation_history.sql",
    name: "Evaluation History and GIN indexing",
    description: "Instantiates the core evaluation_history table, configures relational foreign key links, and deploys JSONB GIN indices to speed up deep document queries.",
    sql: `-- Create Evaluation History Table with JSONB
CREATE TABLE evaluation_history (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    scenario_id UUID NOT NULL,
    user_solution TEXT NOT NULL,
    score INTEGER NOT NULL,
    verdict VARCHAR(64) NOT NULL,
    feedback_payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_eval_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_eval_scenario FOREIGN KEY(scenario_id) REFERENCES practice_scenarios(id) ON DELETE CASCADE
);

-- Deploy Indexes to optimize queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_scenarios_difficulty ON practice_scenarios(difficulty);
CREATE INDEX idx_eval_user_scenario ON evaluation_history(user_id, scenario_id);
CREATE INDEX idx_eval_score ON evaluation_history(score);

-- Deploy GIN index on the feedback_payload JSONB column for deep text searches
CREATE INDEX idx_eval_feedback_gin ON evaluation_history USING GIN (feedback_payload);`
  },
  {
    version: "V3__seed_initial_scenarios.sql",
    name: "Seed Data Scenarios",
    description: "Pre-populates the workspace with high-caliber system design interview scenarios, grounding candidates in realistic sizing metrics.",
    sql: `-- Seed practice_scenarios
INSERT INTO practice_scenarios (id, title, tagline, difficulty, estimated_time, qps_estimation, storage_estimation, prompt) VALUES
('07204f08-e70d-4e54-b221-bb03938aab01', 'Design YouTube', 'Distributed video sharing engine processing massive concurrent playback and uploads', 'Hard', '45 Mins', '10K Upload QPS, 50M Playback QPS', '500 TB / day video storage, 1 PB metadata DB', 'Design a scalable video uploading and streaming service like YouTube. The platform must support video upload, transcoding into multiple formats/bitrates, smooth streaming globally with adaptive bitrate, and scalable video metadata storage.'),
('07204f08-e70d-4e54-b221-bb03938aab02', 'Design Twitter/X', 'High-throughput microblogging system handling massive feed fan-outs and celeb write spikes', 'Medium', '45 Mins', '100K Write QPS, 10M Read QPS', '12 TB / day text storage, 500 TB media storage', 'Design a microblogging service like Twitter/X. Focus on real-time newsfeed generation (Push/Pull trade-offs for celebrities), user timelines, posting tweets, search indexing, and media upload scaling with global replication.'),
('07204f08-e70d-4e54-b221-bb03938aab03', 'Design a Rate Limiter', 'Low-latency security gateway guarding downstream servers from abuse', 'Easy', '30 Mins', '500K QPS input, <2ms budget', 'Minimal memory footprints (Redis-based)', 'Design a high-performance distributed rate limiter that can be deployed at the API Gateway layer to protect downstream web servers. It must support multiple rate limiting algorithms, handle distributed cache consistency, and operate with sub-2ms latency.');`
  }
];

export const relationalSchemas: RelationshipSchema[] = [
  { fromTable: "users", toTable: "evaluation_history", type: "one-to-many", description: "One candidate can submit multiple practice solutions and build a detailed progress history. A session entry cannot exist without a valid user. Cascades on delete." },
  { fromTable: "practice_scenarios", toTable: "evaluation_history", type: "one-to-many", description: "A system design scenario can be solved by multiple users or multiple times by the same user. Restricts deletion if history exists." }
];

export const mermaidErDiagram = `
erDiagram
    USERS {
        uuid id PK
        varchar email UK "uq_users_email"
        varchar display_name
        varchar role
        timestamp created_at
        timestamp updated_at
    }

    PRACTICE_SCENARIOS {
        uuid id PK
        varchar title
        varchar tagline
        varchar difficulty
        varchar estimated_time
        varchar qps_estimation
        varchar storage_estimation
        text prompt
    }

    EVALUATION_HISTORY {
        uuid id PK
        uuid user_id FK "fk_eval_user"
        uuid scenario_id FK "fk_eval_scenario"
        text user_solution
        int score
        varchar verdict
        jsonb feedback_payload "idx_eval_feedback_gin"
        timestamp created_at
    }

    USERS ||--o{ EVALUATION_HISTORY : "submits and tracks"
    PRACTICE_SCENARIOS ||--o{ EVALUATION_HISTORY : "evaluated in"
`;

export const plantUmlErDiagram = `@startuml
' Configure styling for clear, beautiful presentation
skinparam linetype ortho
skinparam monochrome false
skinparam class {
    BackgroundColor #0f172a
    BorderColor #475569
    FontName JetBrains Mono
    FontColor #f8fafc
}

entity "users" as users {
    * id : UUID <<PK>>
    --
    * email : VARCHAR(255) <<UNIQUE>>
    display_name : VARCHAR(128)
    * role : VARCHAR(64)
    * created_at : TIMESTAMP WITH TIME ZONE
    * updated_at : TIMESTAMP WITH TIME ZONE
}

entity "practice_scenarios" as practice_scenarios {
    * id : UUID <<PK>>
    --
    * title : VARCHAR(128)
    * tagline : VARCHAR(256)
    * difficulty : VARCHAR(32)
    * estimated_time : VARCHAR(64)
    * qps_estimation : VARCHAR(64)
    * storage_estimation : VARCHAR(64)
    * prompt : TEXT
}

entity "evaluation_history" as evaluation_history {
    * id : UUID <<PK>>
    --
    * user_id : UUID <<FK>>
    * scenario_id : UUID <<FK>>
    * user_solution : TEXT
    * score : INTEGER
    * verdict : VARCHAR(64)
    * feedback_payload : JSONB
    * created_at : TIMESTAMP WITH TIME ZONE
}

users "1" -- "0..*" evaluation_history : "submits >"
practice_scenarios "1" -- "0..*" evaluation_history : "referenced in >"

@enduml`;
