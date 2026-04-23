# AI Compliance Agent

A privacy-first, self-hosted GitHub App that performs automated code reviews using local LLMs (Llama 3). This agent acts on specialist files defined to catch technical debt, performance bottlenecks, and security risks across React, TypeScript, Database (Postgres/MongoDB), C#, and Java.

Pull locally, and feel free to add your own constraints/ languages you want the agent to consider.

## Key Features

- **Privacy-Centric:** No code ever leaves your infrastructure. All analysis is performed locally via Ollama.
- **Multi-Specialist Architecture:** Uses the Strategy Pattern to route files to domain-specific AI experts (React vs. Database).
- **Bundled Reviews:** Minimizes notification noise by grouping suggestions into a single GitHub Review event.
- **Context-Aware:** Uses full file content and diff anchors for precision for code comments.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **AI Orchestration:** LangChain + Ollama (Llama 3 / 3.2)
- **GitHub Integration:** Octokit + Webhooks
- **Validation:** Zod (Type-safe LLM outputs)
- **Tunneling:** Ngrok (for local development)

---

## Getting Started (Setup)

If you want to run this agent on your own repositories, follow these steps:

### Prerequisites

- **Ollama:** Install [Ollama](https://ollama.com/) and run `ollama run llama`.
- **Ngrok:** Install [Ngrok](https://ngrok.com/) to expose your local server to GitHub.

### GitHub App Setup

1. Go to your **GitHub Settings > Developer Settings > GitHub Apps > New GitHub App**.
2. **Webhook URL:** Use your Ngrok URL (e.g., `https://your-ngrok-url.app/api/webhook`).
3. **Permissions:**
   - **Pull Requests:** Read & Write
   - **Contents:** Read (to fetch full file context)
   - **Metadata:** Read
4. **Events:** Subscribe to **Pull Request** events.
5. **Private Key:** Generate a private key and save it to your project root.

### Environment Configuration

Create a `.env` file in the project root with the following secrets:
\`\`\`env
APP_ID=your_github_app_id
WEBHOOK_SECRET=your_webhook_secret
PRIVATE_KEY_PATH=path/to/your/private-key.pem
OLLAMA_BASE_URL=http://localhost:11434
PORT=3000
\`\`\`

### Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

---

## Architecture Detail

The agent uses a **Strategy Design Pattern**. The `ReviewOrchestrator` detects changed file extensions and dispatches them to specialized classes:

- **ReactSpecialist:** Focuses on Hooks, re-renders, and Type safety.
- **DatabaseSpecialist:** Focuses on SQL injection and query optimization.
- **CSharp/JavaSpecialist:** Focuses on async patterns and language-specific best practices.
