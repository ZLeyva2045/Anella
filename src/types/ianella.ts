// src/types/ianella.ts
import { z } from 'genkit';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatWithAnellaInputSchema = z.object({
  history: z.array(ChatMessageSchema),
  message: z.string(),
});
export type ChatWithAnellaInput = z.infer<typeof ChatWithAnellaInputSchema>;
