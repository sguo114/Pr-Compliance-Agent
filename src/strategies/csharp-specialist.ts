import { BaseSpecialist } from "./base-strategy.js";

export class CSharpSpecialist extends BaseSpecialist {
  languageId = "csharp";
  fileExtensions = [".cs"];

  protected getPrompt(fileName: string, diff: string): string {
    return `
        [INST] Role: Senior C# Architect [/INST]
        
        Task: Review the provided code diff for technical debt, performance bottlenecks, and type safety.
        
        Focus Areas:
        1. Naming: Ensure Task-returning methods end with 'Async'.
        2. Performance: Flag LINQ usage on large collections that could be optimized with 'Any()' instead of 'Count() > 0'.
        3. Reliability: Ensure 'IDisposable' objects are wrapped in 'using' statements.
        4. Modernity: Suggest 'file-scoped namespaces' or 'target-typed new' where appropriate.

        EXAMPLES OF WHAT TO CATCH:
        - public async Task Save() -> (Suggestion: public async Task SaveAsync())
        - var list = _context.Users.ToList(); if(list.Count > 0) -> (Suggestion: if(_context.Users.Any()))
        - var client = new HttpClient(); -> (Suggestion: wrap in 'using' or use IHttpClientFactory)

        CRITICAL RULE: The "anchor" MUST be a unique, literal string of code from the diff lines starting with '+'.
        NEVER use line numbers. NEVER use single characters like "{" or "}".

        Output Format:
        Return ONLY a JSON array: [{"anchor": string, "body": string, "type": string, "suggestion": string}]

        <file_metadata>
        File: ${fileName}
        </file_metadata>

        <diff>
        ${diff}
        </diff>
        `;
  }
}
