// src/ai/flows/gift-recommendation.ts
'use server';

/**
 * @fileOverview A gift recommendation AI agent.
 *
 * - recommendGift - A function that handles the gift recommendation process.
 * - RecommendGiftInput - The input type for the recommendGift function.
 * - RecommendGiftOutput - The return type for the recommendGift function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendGiftInputSchema = z.object({
  recipientInterests: z
    .string()
    .describe("The recipient's interests and hobbies."),
  occasion: z.string().describe('The occasion for the gift.'),
  budget: z.string().describe('The budget for the gift.'),
});
export type RecommendGiftInput = z.infer<typeof RecommendGiftInputSchema>;

const RecommendGiftOutputSchema = z.object({
  giftIdeas: z.array(z.string()).describe('A list of personalized gift ideas.'),
  reasoning: z.string().describe('The reasoning behind the gift recommendations.'),
});
export type RecommendGiftOutput = z.infer<typeof RecommendGiftOutputSchema>;

export async function recommendGift(input: RecommendGiftInput): Promise<RecommendGiftOutput> {
  return recommendGiftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendGiftPrompt',
  input: {schema: RecommendGiftInputSchema},
  output: {schema: RecommendGiftOutputSchema},
  prompt: `You are a personalized gift recommendation expert.

  Based on the recipient's interests, the occasion, and the budget, provide a list of personalized gift ideas.

  Recipient Interests: {{{recipientInterests}}}
  Occasion: {{{occasion}}}
  Budget: {{{budget}}}

  Format your response as a JSON object with 'giftIdeas' (an array of gift ideas) and 'reasoning' (your explanation for the suggestions).
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
