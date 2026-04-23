import { BaseSpecialist } from "./base-strategy.js";

export class JavaSpecialist extends BaseSpecialist {
  languageId = "java";
  fileExtensions = [".java"];

  protected getPrompt(fileName: string, diff: string): string {
    return `
        [INST] Role: Senior Java Architect [/INST]
        
        Task: Review the provided code diff for technical debt, performance bottlenecks, and type safety.
        
        Focus Areas:
        1. Spring Best Practices: Flag field injection (@Autowired on fields) in favor of constructor injection.
        2. Performance: Identify inefficient String concatenation in loops (suggest StringBuilder).
        3. Streams API: Catch unnecessary 'collect(Collectors.toList()).size()' calls.
        4. Safety: Flag use of 'Optional.get()' without a 'isPresent()' check.

        EXAMPLES OF WHAT TO CATCH:
        - @Autowired private UserService service; -> (Suggestion: Use constructor injection)
        - String s = ""; for(...) { s += val; } -> (Suggestion: Use StringBuilder)
        - myOptional.get(); -> (Suggestion: use .orElse() or .orElseThrow())

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
