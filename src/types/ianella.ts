// src/types/ianella.ts
import { z } from 'genkit';
import type { Product } from './firestore';
import type { Timestamp } from 'firebase/firestore';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
  products: z.array(z.any()).optional(), // Can hold product suggestions
  createdAt: z.any().optional(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema> & {
    products?: Product[];
    createdAt?: Timestamp | ReturnType<typeof import('firebase/firestore').serverTimestamp>;
};

export const ChatWithAnellaInputSchema = z.object({
  history: z.array(ChatMessageSchema),
  message: z.string(),
});
export type ChatWithAnellaInput = z.infer<typeof ChatWithAnellaInputSchema>;
