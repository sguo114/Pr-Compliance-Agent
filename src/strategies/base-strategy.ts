import { z } from "zod";
import { ChatOllama } from "@langchain/ollama";

export const ReviewCommentSchema = z.object({
  file: z.string(),
  line: z.number(),
  anchor: z.string(),
  body: z.string(),
  type: z.enum(["bug", "security", "efficiency", "performance", "best-practice"]).catch("efficiency"),
  suggestion: z.string().optional(),
});

export type ReviewComment = z.infer<typeof ReviewCommentSchema>;

export abstract class BaseSpecialist {
  abstract languageId: string;
  abstract fileExtensions: string[];

  protected model = new ChatOllama({
    baseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
    model: "llama3", // Or llama3.2 for speed
    temperature: 0,
    numCtx: 4096,
    numPredict: 1024,
  });

  // Each specialist will define its own specific rules
  protected abstract getPrompt(fileName: string, diff: string): string;

  public async analyze(fileName: string, fileContent: string, diff: string): Promise<ReviewComment[]> {
    console.log(`🧠 Llama 3 is thinking about ${fileName}...`);
    const prompt = this.getPrompt(fileName, diff);

    try {
      const response = await this.model.invoke(prompt, {
        signal: AbortSignal.timeout(90000),
      });
      const content = response.content.toString();

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      let jsonStr = jsonMatch[0];
      if (!jsonStr.endsWith("]")) jsonStr += "]";

      const rawResults = JSON.parse(jsonStr);
      const lines = fileContent.split("\n");

      return rawResults
        .map((res: any) => {
          const rawAnchor = res.anchor?.toString() || "";
          const cleanAnchor = rawAnchor
            .replace(/^[+-]\s*/, "")
            .replace(/^\d+$/, "")
            .trim();

          const foundIndex = lines.findIndex((l) => l.trim().includes(cleanAnchor));
          const isInDiff = diff.includes(cleanAnchor);

          if (foundIndex === -1 || !isInDiff || cleanAnchor.length < 5) {
            console.warn(`⚠️ Skipping anchor for ${fileName}: "${cleanAnchor}"`);
            return null;
          }

          const hydrated = {
            ...res,
            file: fileName,
            line: foundIndex + 1,
          };

          const validated = ReviewCommentSchema.parse(hydrated);
          if (validated.suggestion) {
            validated.body = `${validated.body}\n\n\`\`\`suggestion\n${validated.suggestion}\n\`\`\``;
          }
          return validated;
        })
        .filter((res: ReviewComment | null): res is ReviewComment => res !== null);
    } catch (e) {
      console.error(`❌ Analysis failed for ${fileName}:`, e);
      return [];
    }
  }
}
