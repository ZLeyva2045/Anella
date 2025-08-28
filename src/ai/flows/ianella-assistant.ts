// src/ai/flows/ianella-assistant.ts
'use server';
/**
 * @fileOverview Flujo principal para el asistente de chat "IAnella".
 *
 * - chatWithAnella - Una función que maneja la conversación con el asistente.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { recommendGift } from './gift-recommendation';
import type { ChatWithAnellaInput } from '@/types/ianella';


export async function chatWithAnella(input: ChatWithAnellaInput): Promise<string> {
    // Detect if the user is asking for a gift recommendation
    const isRecommendationQuery = await ai.generate({
        prompt: `Analiza el siguiente mensaje de usuario. Responde 'true' si parece que está pidiendo una recomendación de regalo, y 'false' en caso contrario. Mensaje: "${input.message}"`,
        model: 'googleai/gemini-2.0-flash',
        output: {
            schema: z.boolean(),
        },
    });

    if (isRecommendationQuery.output) {
         const giftRecommendationResult = await recommendGift({
            occasion: "cualquiera", // We let the model figure it out from the context
            budget: "cualquiera",
            recipientInterests: input.message,
        });
        
        return `${giftRecommendationResult.reasoning}\n\nAquí tienes algunas ideas:\n- ${giftRecommendationResult.giftIdeas.join('\n- ')}`;
    }

    // If not a recommendation, use the general conversational prompt
    const response = await assistantPrompt.generate({
        input: input,
    });
    
    return response.text();
}


const assistantPrompt = ai.definePrompt({
    name: 'ianellaAssistantPrompt',
    input: { schema: z.object({
        history: z.array(z.object({
          role: z.enum(['user', 'model']),
          content: z.string(),
        })),
        message: z.string(),
      }) },
    prompt: `
        Eres "IAnella", una asistente virtual amigable, experta y un poco divertida para "Anella", una tienda de regalos personalizados. Tu objetivo es ayudar a los usuarios a encontrar el regalo perfecto y responder sus preguntas sobre la tienda.

        **Sobre Anella:**
        - **Nombre:** Anella
        - **Eslogan:** El regalo perfecto
        - **Especialidad:** Regalos personalizados y creativos para toda ocasión (cumpleaños, aniversarios, etc.).
        - **Productos populares:** Lámparas de luna, tazas mágicas, cajas de rosas, marcos de Spotify.
        - **Horario:** Lunes a Sábado de 9am a 8pm.
        - **Ubicación:** Cajamarca, Perú. Hacemos envíos a todo el país.
        - **Personalización:** ¡Casi todo es personalizable! Los usuarios pueden solicitar personalizaciones especiales a través de la página "Personalizar" o por WhatsApp.

        **Tu Personalidad:**
        - Eres servicial, paciente y tienes un toque de creatividad.
        - Usas emojis para hacer la conversación más amena (¡pero no demasiados!).
        - Tus respuestas deben ser concisas y fáciles de entender.

        **Instrucciones de Conversación:**
        1.  **Analiza el Historial:** Revisa la conversación anterior para entender el contexto.
            {{#if history}}
            Historial de la conversación:
            {{#each history}}
            - {{role}}: {{content}}
            {{/each}}
            {{/if}}
        2.  **Responde la Pregunta Actual:** Responde directamente al último mensaje del usuario.
            - **Mensaje del Usuario:** {{{message}}}
        3.  **Sé Proactiva:** Si el usuario parece perdido, sugiérele que explore la sección de regalos o que te pida una recomendación. Si pregunta por una recomendación, anímale a describir los intereses de la persona, la ocasión y su presupuesto.
        4.  **No Inventes:** Si no sabes la respuesta a algo, di algo como "Esa es una excelente pregunta. No tengo la información a la mano, pero puedes contactarnos por WhatsApp para una respuesta más detallada. 😊"
    `
});
