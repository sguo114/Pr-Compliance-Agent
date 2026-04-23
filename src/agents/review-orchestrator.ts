import { CSharpSpecialist } from "../strategies/csharp-specialist.js";
import { ReactSpecialist } from "../strategies/react-specialist.js";
import { BaseSpecialist } from "../strategies/base-strategy.js";
import type { GitHubTool } from "../tools/github-tools.js";
import { DatabaseSpecialist } from "../strategies/database-specialist.js";
import { JavaSpecialist } from "../strategies/java-specialist.js";

export class ReviewOrchestrator {
  private specialists: BaseSpecialist[] = [
    new ReactSpecialist(),
    new DatabaseSpecialist(),
    new CSharpSpecialist(),
    new JavaSpecialist(),
  ];

  async planReview(owner: string, repo: string, commitId: string, files: any[], github: GitHubTool) {
    const allComments = [];

    for (const file of files) {
      const specialist = this.specialists.find((s) => s.fileExtensions.some((ext) => file.filename.endsWith(ext)));

      if (specialist) {
        try {
          // Fetch and Analyze ONE at a time to prevent Ollama crashes
          const fullContent = await github.getFileContent(owner, repo, file.filename, commitId);
          const issues = await specialist.analyze(file.filename, fullContent, file.patch);
          allComments.push(...issues);
        } catch (e) {
          console.error(`⚠️ Skipping ${file.filename} due to specialist error.`);
        }
      }
    }

    return allComments;
  }
  // parallel
  //   async planReview(owner: string, repo: string, commitId: string, files: any[], github: GitHubTool) {
  //     const reviewPromises = files.map(async (file) => {
  //       const specialist = this.specialists.find((s) => s.fileExtensions.some((ext) => file.filename.endsWith(ext)));

  //       if (specialist) {
  //         // Fetch the WHOLE file so the LLM has context
  //         const fullContent = await github.getFileContent(owner, repo, file.filename, commitId);
  //         return specialist.analyze(file.filename, fullContent, file.patch);
  //       }
  //       return [];
  //     });

  //     const results = await Promise.all(reviewPromises);
  //     return results.flat();
  //   }
}
