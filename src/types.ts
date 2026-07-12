/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// SRS types
export interface UserPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  background: string;
  needs: string[];
  painPoints: string[];
}

export interface UserStory {
  id: string;
  persona: string;
  title: string;
  narrative: string;
  acceptanceCriteria: string[];
}

export interface FunctionalRequirement {
  id: string;
  title: string;
  description: string;
  category: "Auth" | "Workspace" | "AI Engine" | "Collaboration" | "Analytics";
  priority: "High" | "Medium" | "Low";
}

export interface NonFunctionalRequirement {
  id: string;
  title: string;
  category: "Scalability" | "Availability" | "Security" | "Performance" | "Maintainability";
  metric: string;
  target: string;
}

export interface BusinessRule {
  id: string;
  title: string;
  description: string;
  impact: string;
}

export interface RiskMitigation {
  id: string;
  risk: string;
  likelihood: "High" | "Medium" | "Low";
  impact: "High" | "Medium" | "Low";
  mitigation: string;
}

// Production folder structure types
export interface FolderNode {
  name: string;
  type: "folder" | "file";
  explanation: string;
  children?: FolderNode[];
}

// High-Level Architecture types
export interface ComponentDetail {
  id: string;
  name: string;
  type: "Service" | "Database" | "Cache" | "Queue" | "Gateway" | "UI";
  technology: string;
  responsibility: string;
  pros: string[];
  cons: string[];
}

export interface SequenceStep {
  from: string;
  to: string;
  action: string;
  description: string;
}

export interface DesignDecision {
  id: string;
  topic: string;
  chosen: string;
  alternatives: string[];
  tradeOffs: string;
  decisionFactors: string[];
}

// PostgreSQL Database Schema types
export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary: boolean;
  isForeign?: boolean;
  references?: string;
  description: string;
}

export interface IndexSchema {
  name: string;
  type: string;
  columns: string[];
  purpose: string;
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  indexes: IndexSchema[];
  description: string;
  ddl: string;
}

export interface FlywayMigration {
  version: string;
  name: string;
  description: string;
  sql: string;
}

// ER Diagram types
export interface RelationshipSchema {
  fromTable: string;
  toTable: string;
  type: "one-to-many" | "one-to-one" | "many-to-many";
  description: string;
}

// System Design Practice Simulator types
export interface PracticeScenario {
  id: string;
  title: string;
  tagline: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estimatedTime: string;
  qps: string;
  storage: string;
  prompt: string;
  starterTips: string[];
}

export interface DimensionFeedback {
  name: string;
  rating: "Excellent" | "Good" | "Needs Improvement" | "Critical";
  feedback: string;
}

export interface EvaluationResult {
  score: number;
  verdict: "Strong Pass" | "Pass" | "Weak Pass" | "Fail";
  summary: string;
  dimensions: DimensionFeedback[];
  strengths: string[];
  gaps: string[];
  recommendedArchitecture: string;
}
