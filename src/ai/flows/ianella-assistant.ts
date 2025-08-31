'use server';
/**
 * @fileOverview Flujo principal para el asistente de chat "IAnella".
 *
 * - chatWithAnella - Una función que maneja la conversación con el asistente.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { recommendGiftTool } from './gift-recommendation';
import type { ChatWithAnellaInput, ChatMessage } from '@/types/ianella';

export async function chatWithAnella(input: ChatWithAnellaInput): Promise<string> {
    console.log('chatWithAnella called at', new Date().toISOString());
    console.log('raw input:', JSON.stringify(input));

    try {
        if (!input) {
            console.error('chatWithAnella: no input provided');
            return '__IANELLA_ERROR__: No input provided';
        }

        const { history, message } = input as any;

        if (!message || typeof message !== 'string') {
            console.error('chatWithAnella: invalid message', { message });
            return '__IANELLA_ERROR__: Mensaje inválido o vacío';
        }

        // Ejecuta el prompt con la sintaxis correcta
        const response = await assistantPrompt({
            history: Array.isArray(history) ? history : [],
            prompt: message,
        });

        // response.text puede ser función o propiedad, manejamos ambos casos:
        let text: string;
        if (response == null) {
            throw new Error('assistantPrompt.generate returned null/undefined');
        } else if (typeof response.text === 'function') {
            text = await response.text();
        } else if (typeof response.text === 'string') {
            text = response.text;
        } else {
            // Fallback: convierte el objeto respuesta a string para debug
            text = String(response);
        }

        console.log('assistant response length:', text?.length ?? 0);
        return text;
    } catch (err: any) {
        // Loguea stack para diagnostico
        console.error('chatWithAnella error:', err?.stack ?? err);
        // Devuelve un string con prefijo identificable para que el cliente lo muestre en dev
        return `__IANELLA_SERVER_ERROR__: ${err?.message ?? String(err)}`;
    }
}

const assistantPrompt = ai.definePrompt({
    name: 'ianellaAssistantPrompt',
    inputSchema: z.object({
        // Usamos z.any() para evitar fallas si z.custom no está disponible en runtime.
        // Cambia a un esquema más estricto si quieres validar roles/contenidos:
        history: z.array(z.any()),
        prompt: z.string(),
      }),
    tools: [recommendGiftTool],
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
            - **Mensaje del Usuario:** {{{prompt}}}
        3.  **Usa Herramientas si es Necesario:** Si el usuario pide una recomendación de regalo, utiliza la herramienta \`recommendGiftTool\` para obtener sugerencias. No inventes regalos, usa la herramienta. Cuando obtengas la respuesta, preséntala de forma amigable.
        4.  **Sé Proactiva:** Si el usuario parece perdido, sugiérele que explore la sección de regalos o que te pida una recomendación.
        5.  **No Inventes:** Si no sabes la respuesta a algo, di algo como "Esa es una excelente pregunta. No tengo la información a la mano, pero puedes contactarnos por WhatsApp para una respuesta más detallada. 😊"
    `
});
