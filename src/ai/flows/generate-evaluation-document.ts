// src/ai/flows/generate-evaluation-document.ts
'use server';
/**
 * @fileOverview A flow for generating HR documents based on employee evaluations.
 *
 * - generateEvaluationDocument - A function to generate the document.
 * - GenerateDocumentInput - The input type for the function.
 * - GenerateDocumentOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DocumentTypeSchema = z.enum(['recognition', 'action_plan', 'memorandum']);

export type GenerateDocumentInput = z.infer<typeof GenerateDocumentInputSchema>;
const GenerateDocumentInputSchema = z.object({
  employeeName: z.string().describe('The name of the employee.'),
  period: z.string().describe('The evaluation period, e.g., "Agosto 2024".'),
  scores: z.record(z.string(), z.number()).describe('A record of scores for different criteria.'),
  totalScore: z.number().describe('The total score of the evaluation.'),
  bonus: z.number().describe('The bonus amount earned.'),
  comments: z.string().optional().describe('General comments from the evaluator.'),
  documentType: DocumentTypeSchema.describe('The type of document to generate.'),
});


export type GenerateDocumentOutput = z.infer<typeof GenerateDocumentOutputSchema>;
const GenerateDocumentOutputSchema = z.object({
  title: z.string().describe('The generated title for the document.'),
  content: z.string().describe('The generated content of the document, formatted with markdown.'),
});


export async function generateEvaluationDocument(input: GenerateDocumentInput): Promise<GenerateDocumentOutput> {
    return generateDocumentFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateDocumentPrompt',
    input: { schema: GenerateDocumentInputSchema },
    output: { schema: GenerateDocumentOutputSchema },
    prompt: `
        You are an expert HR manager for "Anella", a personalized gift shop. Your task is to generate an official document for an employee based on their monthly performance evaluation.

        **Document Type to Generate:** {{{documentType}}}
        **Employee Name:** {{{employeeName}}}
        **Evaluation Period:** {{{period}}}
        **Total Score:** {{{totalScore}}} / 20
        **Bonus Earned:** S/{{{bonus}}}
        **Evaluator Comments:** {{{comments}}}

        **Evaluation Criteria & Scores:**
        {{#each scores}}
        - {{@key}}: {{this}}
        {{/each}}

        **Instructions:**

        1.  **Analyze the Data:** Review the scores, total score, bonus, and comments to understand the employee's performance. A score of 12.5 or above is considered passing and earns a bonus. A score below 12.5 is considered an area for improvement.
        2.  **Select the Correct Tone and Format:** Based on the 'documentType', generate the document with the appropriate tone and structure.
        3.  **Use Markdown:** Format the output content using Markdown for clarity (headings, bold text, lists).

        ---

        **DOCUMENT SPECIFICATIONS:**

        *   **If documentType is 'recognition':**
            *   **Tone:** Positive, encouraging, and highly appreciative.
            *   **Title:** "Carta de Reconocimiento"
            *   **Content:**
                *   Start by congratulating the employee by name for their excellent performance during the period.
                *   Mention their high score ({{{totalScore}}}) and the bonus (S/{{{bonus}}}) they've earned as a result.
                *   **Based on the scores and evaluator comments, write a concise summary (max 80 words) highlighting their key contributions and positive attributes.** This summary will be the main body of the recognition.
                *   End with a message of encouragement, expressing appreciation for their contribution to Anella.

        *   **If documentType is 'action_plan':**
            *   **Tone:** Constructive, supportive, and forward-looking.
            *   **Title:** "Plan de Acción y Mejora"
            *   **Content:**
                *   Start by addressing the employee by name and stating the purpose of the document: to create a plan for improvement based on the evaluation for {{{period}}}.
                *   Mention the total score ({{{totalScore}}}).
                *   Identify 2-3 specific criteria with the lowest scores as key areas for improvement.
                *   For each area, suggest a concrete, actionable step for the employee to take.
                *   Incorporate any relevant evaluator comments.
                *   End on a positive and supportive note, offering help and expressing confidence in their ability to improve.

        *   **If documentType is 'memorandum':**
            *   **Tone:** Formal, direct, and official. Used for consistently low scores or serious issues.
            *   **Title:** "Memorándum de Desempeño"
            *   **Content:**
                *   Use a formal header: "MEMORÁNDUM".
                *   State the "PARA:", "DE:", "FECHA:", and "ASUNTO:".
                *   The body should formally state that the memorandum is being issued due to the performance results of the {{{period}}} evaluation, which were below the expected standard (Score: {{{totalScore}}}/20).
                *   Clearly list the 2-3 most critical areas that require immediate attention.
                *   State the expectation for significant improvement in the next evaluation period.
                *   Mention that failure to improve may result in further administrative action.
                *   End formally.
    `,
});


const generateDocumentFlow = ai.defineFlow(
  {
    name: 'generateDocumentFlow',
    inputSchema: GenerateDocumentInputSchema,
    outputSchema: GenerateDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
