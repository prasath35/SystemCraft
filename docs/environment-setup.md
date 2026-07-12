# 💻 Developer Environment Setup

Follow these steps to establish a fully functional local development environment for **ArchitectAI**.

---

## 1. System Requirements

Ensure the following runtimes are installed on your workstation:
- **Node.js**: `v20.0.0` or higher (recommended: LTS)
- **NPM**: `v10.0.0` or higher
- **Java JDK** (Optional, for running Java Spring Boot components): `v17`
- **Docker & Docker Compose**: (For testing databases, caches, and isolated packaging pipelines)

---

## 2. Step-by-Step Workspace Initialization

### Step 2.1: Clone the Repository
```bash
git clone https://github.com/prasathmerz/architectai.git
cd architectai
```

### Step 2.2: Setup Environment Variables
Duplicate the example configurations file and set your credentials:
```bash
cp .env.example .env
```
Open `.env` in your editor and provide your **Gemini API Key** (this is server-side only; never commit the active key to git):
```env
GEMINI_API_KEY="your_actual_google_gemini_api_key_obtained_from_ai_studio"
```

### Step 2.3: Install Dependencies
Run npm install to populate your `node_modules` directory:
```bash
npm install
```

---

## 3. Development Commands

### Start the Development Server:
```bash
npm run dev
```
This boots up the Express API server on **port 3000** and integrates Vite's development middleware.
- APIs will serve at: `http://localhost:3000/api/*`
- Front-end SPA will reload automatically at: `http://localhost:3000`

### Execute Quality Checks (Linter):
Verify TypeScript structures, missing imports, or compilation syntax errors:
```bash
npm run lint
```

### Compile Production Build Artifacts:
Build React static production assets into `/dist` and compile the TypeScript Express server into a self-contained CommonJS (`dist/server.cjs`) file using esbuild:
```bash
npm run build
```

---

## 4. Troubleshooting

### "Vite Command Not Found" or "Module not found"
Ensure all packages were compiled cleanly:
```bash
rm -rf node_modules
npm cache clean --force
npm install
```

### "GEMINI_API_KEY environment variable is required"
The Express server requires an active token. Make sure you set the value inside your `.env` file at the root. If deploying on a platform like Render or AWS, add it as a native environment variable.
