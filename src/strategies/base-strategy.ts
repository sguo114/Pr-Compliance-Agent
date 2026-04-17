import { z } from "zod";

// This schema defines what a "Golden Comment" must look like
export const ReviewCommentSchema = z.object({
  file: z.string(),
  line: z.number(),
  body: z.string().min(10, "Comments must be descriptive"),
  type: z.enum(["bug", "security", "efficiency"]),
  suggestion: z.string().optional(), // For the "Self-Healing" PR feature
});

export type ReviewComment = z.infer<typeof ReviewCommentSchema>;

export abstract class BaseSpecialist {
  abstract languageId: string; // e.g., "csharp" or "typescriptreact"
  abstract fileExtensions: string[]; // e.g., [".cs"] or [".tsx", ".jsx"]

  // The core method every specialist must implement
  abstract analyze(fileName: string, fileContent: string, diff: string): Promise<ReviewComment[]>;
}
