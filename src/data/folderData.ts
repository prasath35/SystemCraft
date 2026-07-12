import { FolderNode } from "../types";

export const folderStructure: FolderNode = {
  name: "architect-ai",
  type: "folder",
  explanation: "The root directory of the ArchitectAI monorepo. Standardized as an enterprise monorepo using modern build tools (Gradle for Java, npm/Vite for Node, and Terraform for cloud orchestration). Allows sharing of contracts and schemas.",
  children: [
    {
      name: "backend",
      type: "folder",
      explanation: "Contains the complete enterprise-grade, Spring Boot v3.x backend application built using Domain-Driven Design (DDD) principles, PostgreSQL, Redis caching, and Flyway database migrations.",
      children: [
        {
          name: "src/main/java/com/architectai",
          type: "folder",
          explanation: "Root package for all Java backend source code, segmented into standard subpackages reflecting modern architectural practices.",
          children: [
            {
              name: "config",
              type: "folder",
              explanation: "Centralized Spring configuration classes. Defines beans for Redis CacheManager, PostgreSQL connections, OAuth2 security filters, and the Gemini AI client integration hooks."
            },
            {
              name: "core",
              type: "folder",
              explanation: "Contains core domain entities, abstract value objects, and standard exception handlers that represent the fundamental domain model, separate from active transport protocols."
            },
            {
              name: "dto",
              type: "folder",
              explanation: "Data Transfer Objects (DTOs) for incoming requests and outgoing API responses. Ensures the internal database entities are never exposed directly to the REST API layers."
            },
            {
              name: "repository",
              type: "folder",
              explanation: "Spring Data JPA repositories providing clean database interfaces. Incorporates optimized Custom Query methods, indexing tags, and full-text search mappings on PostgreSQL JSONB."
            },
            {
              name: "service",
              type: "folder",
              explanation: "The business logic transactional boundary. Implements services like AIInterviewService (orchestrating prompt layouts and Gemini SDK calls) and ScenarioService (evaluating designs)."
            },
            {
              name: "controller",
              type: "folder",
              explanation: "REST Controllers defining endpoints for auth, scenarios, and practice sessions. Leverages Spring Security annotations to guard endpoints and perform rate-limiting."
            }
          ]
        },
        {
          name: "src/main/resources",
          type: "folder",
          explanation: "Contains static configuration files, external templates, and database seed scripts.",
          children: [
            {
              name: "db/migration",
              type: "folder",
              explanation: "Flyway schema migration scripts. Files are named strictly in sequential version order (V1__init.sql, V2__jsonb_indexes.sql) to maintain immutable schema versions."
            },
            {
              name: "application.yml",
              type: "folder",
              explanation: "Main configuration file for dev, staging, and production. Holds db pools, Redis configs, OAuth redirect URIs, and credentials mapped to environment variables."
            }
          ]
        }
      ]
    },
    {
      name: "frontend",
      type: "folder",
      explanation: "A high-performance Single Page Application (SPA) built using React 19, TypeScript 5.x, Vite, and styled with utility-first Tailwind CSS. Structured for maximum readability and lazy-loading of core modules.",
      children: [
        {
          name: "src",
          type: "folder",
          explanation: "The primary React source code directory.",
          children: [
            {
              name: "components",
              type: "folder",
              explanation: "Reusable, modular UI components. Features components like DiagramViewer, PracticeSandbox, TreeView, and Navbar. Kept entirely stateless or localized to promote composition."
            },
            {
              name: "data",
              type: "folder",
              explanation: "Centralized static data models and schemas (e.g. SRS requirements, database schema details, and pre-seeded interview scenarios) to decouple UI rendering from logic."
            },
            {
              name: "lib",
              type: "folder",
              explanation: "External library clients and wrappers, such as custom API wrapper methods and Tailwind color merging utilities."
            },
            {
              name: "types.ts",
              type: "file",
              explanation: "Global TypeScript types and schemas matching backend DTO models, ensuring complete type safety across the boundaries."
            },
            {
              name: "App.tsx",
              type: "file",
              explanation: "The shell of the user interface. Manages navigation, state for selected workspaces, dark slate branding settings, and layout templates."
            }
          ]
        }
      ]
    },
    {
      name: "documentation",
      type: "folder",
      explanation: "Comprehensive software architecture and requirement specifications written in highly readable Markdown, ensuring the team is fully aligned on technical and product goals.",
      children: [
        {
          name: "srs_ieee_spec.md",
          type: "file",
          explanation: "The official IEEE 830-1998 Software Requirements Specification. Exhaustively covers personas, functional, non-functional rules, and risks."
        },
        {
          name: "architecture_decision_records",
          type: "folder",
          explanation: "Architecture Decision Records (ADRs) tracking key technological selections (e.g. Choosing Spring Boot over Go, UUIDv7 strategy, JSONB vs. Column-based relational models) and their long-term trade-offs."
        }
      ]
    },
    {
      name: "infrastructure",
      type: "folder",
      explanation: "Contains infrastructure-as-code files and container configurations to ensure single-click deployment and identical runtimes in dev, staging, and production.",
      children: [
        {
          name: "terraform",
          type: "folder",
          explanation: "Terraform configurations to provision GCP resources, including Cloud Run containers, Cloud SQL (PostgreSQL), Cloud Armor (WAF), Cloud KMS, and Secret Manager.",
          children: [
            {
              name: "main.tf",
              type: "file",
              explanation: "Primary Terraform manifest orchestrating resource provisioning."
            },
            {
              name: "variables.tf",
              type: "file",
              explanation: "Input variable declarations for sizing, locations, and environment names."
            }
          ]
        },
        {
          name: "docker",
          type: "folder",
          explanation: "Contains Multi-stage, optimized Dockerfiles for both backend Spring Boot and frontend Vite builds to minimize container size and image load times."
        },
        {
          name: "nginx",
          type: "folder",
          explanation: "Nginx reverse-proxy configuration. Implements compression, CORS filters, HTTP/2 enforcement, and path routing to backend services."
        }
      ]
    }
  ]
};
