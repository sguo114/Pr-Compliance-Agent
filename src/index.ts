import express from "express";
import dotenv from "dotenv";
import { Webhooks, createNodeMiddleware } from "@octokit/webhooks";
import fs from "fs";
import { GitHubTool } from "./tools/github-tools.js";
import { ReviewOrchestrator } from "./agents/review-orchestrator.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Webhooks with your Secret
const webhooks = new Webhooks({
  secret: process.env.WEBHOOK_SECRET!,
});

// Add this temporarily to see what's actually arriving
webhooks.onAny(({ id, name, payload }) => {
  console.log(`🔔 Event Received: ${name}`);
});

// Define what happens when a Pull Request event arrives
webhooks.on("pull_request.opened", async ({ payload }) => {
  const installationId = payload.installation!.id;
  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const pullNumber = payload.pull_request.number;
  const commitId = payload.pull_request.head.sha;

  console.log(`🚀 PR #${pullNumber} detected in ${repo}. Starting Senior Review...`);

  const github = new GitHubTool(installationId);
  const orchestrator = new ReviewOrchestrator();

  try {
    // Fetch changed files
    const files = await github.getPRFiles(owner, repo, pullNumber);

    // Run reviews (Orchestrator handles parallelism and full content fetching)
    const allComments = await orchestrator.planReview(owner, repo, commitId, files, github);

    if (allComments.length > 0) {
      console.log(`📦 Bundling ${allComments.length} comments into a single review...`);
      await github.postReview(owner, repo, pullNumber, commitId, allComments);
      console.log(`✅ Review posted successfully to PR #${pullNumber}!`);
    } else {
      console.log("✅ No issues found. PR is clean!");
    }
  } catch (error) {
    console.error("❌ Orchestration failed:", error);
  }
});

// GitHub Webhook Middleware
// This automatically handles the path /api/webhook and verifies the signature
app.use(createNodeMiddleware(webhooks, { path: "/api/webhook" }));

app.listen(port, () => {
  console.log(`✅ PR Compliance Agent listening at http://localhost:${port}`);
  console.log(`🔗 Webhook Path: http://localhost:${port}/api/webhook`);
});
