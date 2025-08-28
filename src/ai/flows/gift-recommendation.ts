// src/ai/flows/gift-recommendation.ts
'use server';

/**
 * @fileOverview Un agente de IA para recomendar regalos.
 *
 * - recommendGiftTool - Una herramienta que maneja el proceso de recomendación de regalos.
 * - RecommendGiftInput - El tipo de entrada para la función recommendGift.
 * - RecommendGiftOutput - El tipo de retorno para la función recommendGift.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendGiftInputSchema = z.object({
  recipientInterests: z
    .string()
    .describe("Los intereses y pasatiempos del destinatario. Puede ser inferido del chat."),
  occasion: z.string().describe('La ocasión para el regalo. Puede ser inferido del chat.'),
  budget: z.string().describe('El presupuesto para el regalo. Puede ser inferido del chat.'),
});
export type RecommendGiftInput = z.infer<typeof RecommendGiftInputSchema>;

const RecommendGiftOutputSchema = z.object({
  giftIdeas: z.array(z.string()).describe('Una lista de 3 a 5 ideas de regalos personalizadas y creativas.'),
  reasoning: z.string().describe('Una explicación corta y amigable del porqué de las recomendaciones.'),
});
export type RecommendGiftOutput = z.infer<typeof RecommendGiftOutputSchema>;


const recommendGiftPrompt = ai.definePrompt({
  name: 'recommendGiftPrompt',
  input: {schema: RecommendGiftInputSchema},
  output: {schema: RecommendGiftOutputSchema},
  prompt: `Eres un experto en recomendaciones de regalos personalizados para la tienda "Anella".

  Basándote en los intereses del destinatario, la ocasión y el presupuesto, proporciona una lista de 3 a 5 ideas de regalos personalizadas y creativas.

  Intereses del Destinatario: {{{recipientInterests}}}
  Ocasión: {{{occasion}}}
  Presupuesto: {{{budget}}}

  Sé creativo y específico con las ideas.
  `,
});


export const recommendGiftTool = ai.defineTool(
    {
        name: 'recommendGiftTool',
        description: 'Usa esta herramienta cuando el usuario pida explícitamente una recomendación o idea de regalo. Extrae los intereses, la ocasión y el presupuesto del mensaje del usuario.',
        inputSchema: RecommendGiftInputSchema,
        outputSchema: RecommendGiftOutputSchema,
    },
    async (input) => {
        console.log('Recommending gift with input:', input);
        const { output } = await recommendGiftPrompt(input);
        return output!;
    }
);
