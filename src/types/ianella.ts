
// src/types/ianella.ts
import { z } from 'genkit';
import type { Product } from './firestore';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
  products: z.array(z.any()).optional(), // Can hold product suggestions
});
export type ChatMessage = z.infer<typeof ChatMessageSchema> & {
    products?: Product[];
};

export const ChatWithAnellaInputSchema = z.object({
  history: z.array(ChatMessageSchema),
  message: z.string(),
});
export type ChatWithAnellaInput = z.infer<typeof ChatWithAnellaInputSchema>;
