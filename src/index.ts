import express from "express";
import dotenv from "dotenv";
import { Webhooks, createNodeMiddleware } from "@octokit/webhooks";
import fs from "fs";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 1. Initialize Webhooks with your Secret
const webhooks = new Webhooks({
  secret: process.env.WEBHOOK_SECRET!,
});

// 2. Define what happens when a Pull Request event arrives
webhooks.on("pull_request.opened", async ({ id, name, payload }) => {
  console.log(`🚀 PR Detected: "${payload.pull_request.title}" by ${payload.pull_request.user.login}`);

  // This is where we will eventually call the Review Orchestrator
  // For now, we just log the data to verify the connection
});

// 3. GitHub Webhook Middleware
// This automatically handles the path /api/webhook and verifies the signature
app.use(createNodeMiddleware(webhooks, { path: "/api/webhook" }));

app.listen(port, () => {
  console.log(`✅ PR Compliance Agent listening at http://localhost:${port}`);
  console.log(`🔗 Webhook Path: http://localhost:${port}/api/webhook`);
});
