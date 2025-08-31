
// src/ai/flows/gift-recommendation.ts
'use server';

/**
 * @fileOverview Una herramienta de IA para recomendar regalos buscando en el catálogo de productos.
 *
 * - recommendGiftTool - Una herramienta que busca productos basados en la intención del usuario.
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

export const recommendGiftTool = ai.defineTool(
    {
        name: 'recommendGiftTool',
        description: 'Usa esta herramienta cuando el usuario pida explícitamente una recomendación o idea de regalo. Extrae los intereses, la ocasión y el presupuesto del mensaje del usuario.',
        inputSchema: RecommendGiftInputSchema,
        outputSchema: z.any(), // We will return a product array or a message
    },
    async (input) => {
        try {
            console.log('Recommending gift with input:', input);
            // In a real production environment, you might want to use a more secure way to call internal APIs
            const searchApiUrl = process.env.NODE_ENV === 'production' 
                ? `${process.env.PUBLIC_SITE_URL}/api/products/search`
                : 'http://localhost:9002/api/products/search';
            
            const res = await fetch(searchApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    recipient: input.recipientInterests, // Map interests to recipient for wider search
                    occasion: input.occasion,
                    budget: input.budget,
                    interests: (input.recipientInterests || '').split(' '),
                }),
            });

            if (!res.ok) {
                const errorBody = await res.text();
                throw new Error(`API search failed with status ${res.status}: ${errorBody}`);
            }

            const body = await res.json();
            
            if (!body.ok) {
                throw new Error(body.error || 'La búsqueda de productos no tuvo éxito.');
            }

            if (body.products && body.products.length > 0) {
                return {
                    products: body.products,
                    message: "¡Encontré estas opciones en nuestro catálogo que podrían gustarte!",
                };
            } else {
                 return {
                    products: [],
                    message: "No encontré un regalo perfecto en el catálogo con esos detalles, pero ¡podemos crear uno personalizado para ti! ¿Te gustaría que te ayude con eso?",
                 };
            }
        } catch (error: any) {
            console.error("Error in recommendGiftTool:", error);
            // Return a friendly error message to the user
            return {
                products: [],
                message: "¡Uy! Tuve un problema al buscar en nuestro catálogo. ¿Podrías intentar describiendo tu idea de otra manera?",
            };
        }
    }
);
