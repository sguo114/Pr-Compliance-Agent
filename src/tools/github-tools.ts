import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import fs from "fs";

export class GitHubTool {
  private octokit: Octokit;

  constructor(installationId: number) {
    // Authenticate as the specific installation (your test repo)
    this.octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: process.env.APP_ID,
        privateKey: fs.readFileSync(process.env.PRIVATE_KEY_PATH!, "utf8"),
        installationId: installationId,
      },
    });
  }

  async getDiff(owner: string, repo: string, pullNumber: number) {
    const { data } = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
      mediaType: { format: "diff" },
    });
    return data as unknown as string;
  }

  async getFileContent(owner: string, repo: string, path: string, ref: string) {
    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      path,
      ref, // The commit SHA
    });

    // GitHub returns content in Base64
    if ("content" in data) {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return "";
  }

  async postComment(
    owner: string,
    repo: string,
    pullNumber: number,
    line: number,
    path: string,
    body: string,
    commitId: string,
  ) {
    return await this.octokit.pulls.createReviewComment({
      owner,
      repo,
      pull_number: pullNumber,
      body,
      line,
      path,
      side: "RIGHT",
      commit_id: commitId,
    });
  }

  async postReview(owner: string, repo: string, pullNumber: number, commitId: string, comments: any[]) {
    // Map our internal objects to the format GitHub expects for a bundled review
    const githubComments = comments.map((c) => ({
      path: c.file,
      line: c.line,
      body: c.body,
      side: "RIGHT" as const,
    }));

    return await this.octokit.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      commit_id: commitId,
      event: "COMMENT", // Use "COMMENT", "APPROVE", or "REQUEST_CHANGES"
      body: "🚀 **AI Compliance Review Summary:** I've found a few areas for improvement in this PR.",
      comments: githubComments,
    });
  }

  async getPRFiles(owner: string, repo: string, pullNumber: number) {
    const { data } = await this.octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
    });
    return data.map((file) => ({
      filename: file.filename,
      patch: file.patch || "", // The actual 'diff' for this specific file
    }));
  }
}
