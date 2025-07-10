// src/ai/flows/gift-recommendation.ts
'use server';

/**
 * @fileOverview Un agente de IA para recomendar regalos.
 *
 * - recommendGift - Una función que maneja el proceso de recomendación de regalos.
 * - RecommendGiftInput - El tipo de entrada para la función recommendGift.
 * - RecommendGiftOutput - El tipo de retorno para la función recommendGift.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendGiftInputSchema = z.object({
  recipientInterests: z
    .string()
    .describe("Los intereses y pasatiempos del destinatario."),
  occasion: z.string().describe('La ocasión para el regalo.'),
  budget: z.string().describe('El presupuesto para el regalo.'),
});
export type RecommendGiftInput = z.infer<typeof RecommendGiftInputSchema>;

const RecommendGiftOutputSchema = z.object({
  giftIdeas: z.array(z.string()).describe('Una lista de ideas de regalos personalizadas.'),
  reasoning: z.string().describe('El razonamiento detrás de las recomendaciones de regalos.'),
});
export type RecommendGiftOutput = z.infer<typeof RecommendGiftOutputSchema>;

export async function recommendGift(input: RecommendGiftInput): Promise<RecommendGiftOutput> {
  return recommendGiftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendGiftPrompt',
  input: {schema: RecommendGiftInputSchema},
  output: {schema: RecommendGiftOutputSchema},
  prompt: `Eres un experto en recomendaciones de regalos personalizados.

  Basándote en los intereses del destinatario, la ocasión y el presupuesto, proporciona una lista de ideas de regalos personalizadas.

  Intereses del Destinatario: {{{recipientInterests}}}
  Ocasión: {{{occasion}}}
  Presupuesto: {{{budget}}}

  Formatea tu respuesta como un objeto JSON con 'giftIdeas' (un array de ideas de regalos) y 'reasoning' (tu explicación para las sugerencias).
  `,
});

const recommendGiftFlow = ai.defineFlow(
  {
    name: 'recommendGiftFlow',
    inputSchema: RecommendGiftInputSchema,
    outputSchema: RecommendGiftOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
