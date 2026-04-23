import { BaseSpecialist } from "./base-strategy.js";

export class ReactSpecialist extends BaseSpecialist {
  languageId = "typescriptreact";
  fileExtensions = [".tsx", ".jsx", ".ts", ".js"];

  protected getPrompt(fileName: string, diff: string): string {
    return `
        [INST] Role: Senior React & TypeScript Architect [/INST]
        
        Task: Review the provided code diff for technical debt, performance bottlenecks, and type safety.
        
        Focus Areas:
        1. Performance: Identify unnecessary re-renders or expensive logic outside of useMemo/useCallback.
        2. Type Safety: Flag the use of 'any'. Suggest specific interfaces.
        3. Logic: Identify console logs, commented-out code, or inefficient loops.
        4. React Hooks: Check for missing dependency arrays in useEffect/useCallback.

        EXAMPLES OF WHAT TO CATCH:
        - Using Math.random() as a key. (Suggestion: use a stable ID)
        - useEffect with no dependency array. (Suggestion: add [data])
        - Props typed as 'any'. (Suggestion: Create an interface)

        CRITICAL RULE: The "anchor" MUST be a unique, literal string of code from the diff lines starting with '+'.
        NEVER use line numbers. NEVER use single characters like "{" or "}".

        Example:
        Good Anchor: "export const BadComponent = ({ data }: any) => {"

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
