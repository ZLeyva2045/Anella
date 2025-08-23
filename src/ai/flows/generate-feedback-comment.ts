// src/ai/flows/generate-feedback-comment.ts
'use server';
/**
 * @fileOverview Un flujo para generar comentarios de retroalimentación de RR.HH. basados en evaluaciones de empleados.
 *
 * - generateFeedbackComment - Una función para generar el comentario.
 * - GenerateFeedbackCommentInput - El tipo de entrada para la función.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFeedbackCommentInputSchema = z.object({
  employeeName: z.string().describe('El nombre del empleado.'),
  scores: z.record(z.string(), z.number()).describe('Un registro de puntajes para diferentes criterios.'),
  totalScore: z.number().describe('El puntaje total de la evaluación.'),
  evaluatorComments: z.string().optional().describe('Comentarios generales del evaluador.'),
  feedbackType: z.enum(['recognition', 'improvement']).describe('El tipo de retroalimentación a generar.'),
});
export type GenerateFeedbackCommentInput = z.infer<typeof GenerateFeedbackCommentInputSchema>;

const GenerateFeedbackCommentOutputSchema = z.object({
    comment: z.string().describe('El comentario de retroalimentación generado.'),
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
    Eres un experto gerente de RR.HH. para "Anella Boutique". Tu tarea es generar un comentario de retroalimentación conciso y constructivo para un empleado basado en su evaluación de desempeño mensual. El comentario debe tener una longitud de 1 a 2 párrafos.

    **Nombre del Empleado:** {{{employeeName}}}
    **Puntaje Total:** {{{totalScore}}} / 20
    **Comentarios del Evaluador:** {{{evaluatorComments}}}
    **Tipo de Feedback a Generar:** {{{feedbackType}}}

    **Criterios y Puntajes de Evaluación:**
    {{#each scores}}
    - {{@key}}: {{this}}
    {{/each}}

    **Instrucciones:**

    *   **Si feedbackType es 'recognition':**
        *   **Tono:** Positivo, alentador y específico.
        *   **Contenido:**
            *   Comienza felicitando a {{{employeeName}}}.
            *   Identifica los **2 criterios con el puntaje más alto**.
            *   Escribe un comentario que elogie específicamente su desempeño en estas áreas, explicando por qué es valioso para el equipo y Anella Boutique.
            *   Mantenlo profesional y motivador.

    *   **Si feedbackType es 'improvement':**
        *   **Tono:** Constructivo, de apoyo y orientado al futuro. No debe sonar punitivo.
        *   **Contenido:**
            *   Comienza reconociendo los esfuerzos del empleado.
            *   Identifica los **2 criterios con el puntaje más bajo**.
            *   Escribe un comentario que enmarque estas áreas como oportunidades de crecimiento.
            *   Sugiere acciones o puntos de enfoque concretos pero breves para la mejora, sin ser demasiado prescriptivo.
            *   Termina con una nota de apoyo y aliento.
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
