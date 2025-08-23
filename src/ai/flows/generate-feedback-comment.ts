// src/ai/flows/generate-feedback-comment.ts
'use server';
/**
 * @fileOverview A flow for generating HR feedback comments based on employee evaluations.
 *
 * - generateFeedbackComment - A function to generate the comment.
 * - GenerateFeedbackCommentInput - The input type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFeedbackCommentInputSchema = z.object({
  employeeName: z.string().describe('The name of the employee.'),
  scores: z.record(z.string(), z.number()).describe('A record of scores for different criteria.'),
  totalScore: z.number().describe('The total score of the evaluation.'),
  evaluatorComments: z.string().optional().describe('General comments from the evaluator.'),
  feedbackType: z.enum(['recognition', 'improvement']).describe('The type of feedback to generate.'),
});
export type GenerateFeedbackCommentInput = z.infer<typeof GenerateFeedbackCommentInputSchema>;

const GenerateFeedbackCommentOutputSchema = z.object({
    comment: z.string().describe('The generated feedback comment.'),
});
export type GenerateFeedbackCommentOutput = z.infer<typeof GenerateFeedbackCommentOutputSchema>;

export async function generateFeedbackComment(input: GenerateFeedbackCommentInput): Promise<GenerateFeedbackCommentOutput> {
  return generateFeedbackCommentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFeedbackCommentPrompt',
  input: { schema: GenerateFeedbackCommentInputSchema },
  output: { schema: GenerateFeedbackCommentOutputSchema },
  prompt: `
    You are an expert HR manager for "Anella Boutique". Your task is to generate a concise and constructive feedback comment for an employee based on their monthly performance evaluation. The comment should be 1-2 paragraphs long.

    **Employee Name:** {{{employeeName}}}
    **Total Score:** {{{totalScore}}} / 20
    **Evaluator Comments:** {{{evaluatorComments}}}
    **Feedback Type to Generate:** {{{feedbackType}}}

    **Evaluation Criteria & Scores:**
    {{#each scores}}
    - {{@key}}: {{this}}
    {{/each}}

    **Instructions:**

    *   **If feedbackType is 'recognition':**
        *   **Tone:** Positive, encouraging, and specific.
        *   **Content:**
            *   Start by congratulating {{{employeeName}}}.
            *   Identify the **2 highest-scoring criteria**.
            *   Write a comment that specifically praises their performance in these areas, explaining why it's valuable for the team and Anella Boutique.
            *   Keep it professional and motivating.

    *   **If feedbackType is 'improvement':**
        *   **Tone:** Constructive, supportive, and forward-looking. Do not sound punitive.
        *   **Content:**
            *   Start by acknowledging the employee's efforts.
            *   Identify the **2 lowest-scoring criteria**.
            *   Write a comment that frames these areas as opportunities for growth.
            *   Suggest concrete but brief actions or focus points for improvement without being overly prescriptive.
            *   End on a supportive and encouraging note.
  `,
});

const generateFeedbackCommentFlow = ai.defineFlow(
  {
    name: 'generateFeedbackCommentFlow',
    inputSchema: GenerateFeedbackCommentInputSchema,
    outputSchema: GenerateFeedbackCommentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
