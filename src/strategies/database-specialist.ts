import { BaseSpecialist } from "./base-strategy.js";

export class DatabaseSpecialist extends BaseSpecialist {
  languageId = "sql";
  // Added .prisma and .ts since database logic often lives there
  fileExtensions = [".sql", ".prisma", ".mongodb", ".ts", ".js"];

  protected getPrompt(fileName: string, diff: string): string {
    return `
        [INST] Role: Senior Database Architect [/INST]
        
        Task: Review the provided code diff for SQL performance, security (injection), and schema best practices.
        
        Focus Areas:
        1. Performance: Identify missing indexes for 'WHERE' clauses or 'find()' filters.
        2. Security: Flag raw SQL string interpolation (SQL Injection risks).
        3. Efficiency: Catch 'SELECT *' usage or N+1 query patterns in ORM logic.
        4. Schema: Flag missing timestamps or 'NOT NULL' constraints on critical fields.

        EXAMPLES OF WHAT TO CATCH:
        - await db.query(\`SELECT * FROM users WHERE id = \${id}\`) -> (Suggestion: use parameterized queries)
        - db.collection('orders').find({ customerEmail: email }) -> (Suggestion: Ensure 'customerEmail' has an index)
        - SELECT * FROM large_table -> (Suggestion: Select only needed columns)

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
