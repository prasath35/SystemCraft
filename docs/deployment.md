# 🚀 Deployment & Cloud Infrastructure Guide

This guide details steps to build, containerize, and deploy **ArchitectAI** to production cloud platforms.

---

## 1. Local Docker Sandbox Deployment

To launch the complete multi-service stack (React Frontend, Spring Boot Backend, PostgreSQL, and Redis) locally:

```bash
# Clone the repository
git clone https://github.com/prasathmerz/architectai.git
cd architectai

# Set your Gemini Secret API Key
export GEMINI_API_KEY="your_api_key_here"

# Build and start all services in the background
docker-compose up --build -d

# Verify all containers are healthy
docker-compose ps
```

Services will be mapped to the following local ports:
- **React Frontend**: `http://localhost:3000`
- **Spring Boot API**: `http://localhost:8080`
- **PostgreSQL Database**: `localhost:5432`
- **Redis Cache**: `localhost:6379`

---

## 2. Cloud Run (Google Cloud Platform) - Preferred

Google Cloud Run is the recommended platform for hosting the unified, self-contained container.

### Step-by-Step CLI Dispatch:
```bash
# Set your GCP Project ID
export PROJECT_ID="architectai-production"

# Build the image on GCP Artifact Registry
gcloud builds submit --tag gcr.io/$PROJECT_ID/architectai-app

# Deploy to Cloud Run with automatic secrets injection
gcloud run deploy architectai \
  --image gcr.io/$PROJECT_ID/architectai-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

---

## 3. Render Deployment

Render provides a zero-ops hosting path for full-stack Node.js Express projects.

### Unified Web Service Setup:
1. Connect your GitHub repository to **Render Dashboard**.
2. Select **Web Service** as the service type.
3. Configure settings:
   - **Environment**: `Docker`
   - **Dockerfile Path**: `Dockerfile`
   - **Branch**: `main`
4. Define Environment Variables:
   - `GEMINI_API_KEY`: *(Get this from Google AI Studio Secrets)*
   - `NODE_ENV`: `production`
5. Click **Deploy Web Service**.

---

## 4. Enterprise AWS Architecture (High Availability)

For production SDE portfolio talking points, ArchitectAI is designed to map to an AWS multi-AZ architecture:

```
                          [Route 53 (DNS)]
                                 |
                     [Application Load Balancer]
                                 |
               +-----------------+-----------------+
               |                                   |
       [Private Subnet AZ-A]               [Private Subnet AZ-B]
               |                                   |
         [ECS Fargate Tasks]                 [ECS Fargate Tasks]
               |                                   |
               +-----------------+-----------------+
                                 |
               +-----------------+-----------------+
               |                                   |
         [Amazon Aurora PG (Master)]       [Amazon Aurora PG (Replica)]
               |                                   |
          [Elasticache Redis]                 [Elasticache Redis]
```

- **Amazon Route 53**: Handles secure DNS queries.
- **Application Load Balancer (ALB)**: Performs SSL termination and routes traffic across multi-AZ container tasks.
- **ECS Fargate**: Serves as the serverless host for our Dockerized API layers.
- **Multi-AZ Amazon Aurora PostgreSQL**: Automates database failovers within a 30-second recovery time.
- **Amazon ElastiCache (Redis)**: Runs a cluster of shards supporting high-throughput lookups.
- **IAM Roles**: Standard task execution roles restrict access to parameters stored inside AWS Secrets Manager.
