// src/components/anella/GiftRecommendation.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Gift } from 'lucide-react';
import { chatWithAnella } from '@/ai/flows/ianella-assistant';
import type { ChatMessage } from '@/types/ianella';


const recommendGiftSchema = z.object({
  recipientInterests: z.string().min(10, { message: 'Por favor, describe sus intereses con un poco más de detalle.' }),
  occasion: z.string().min(1, { message: 'Por favor, selecciona una ocasión.' }),
  budget: z.string().min(1, { message: 'Por favor, selecciona un presupuesto.' }),
});

type RecommendGiftFormValues = z.infer<typeof recommendGiftSchema>;

export function GiftRecommendation() {
  const [recommendation, setRecommendation] = useState<ChatMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RecommendGiftFormValues>({
    resolver: zodResolver(recommendGiftSchema),
    defaultValues: {
      recipientInterests: '',
      occasion: '',
      budget: '',
    },
  });

 async function onSubmit(values: RecommendGiftFormValues) {
    setIsLoading(true);
    setError(null);
    setRecommendation(null);
    try {
      // Format the input into a single prompt for the chatbot
      const prompt = `Busco un regalo para ${values.occasion}. Es para alguien a quien le gusta ${values.recipientInterests}. Mi presupuesto es ${values.budget}.`;
      
      const response = await chatWithAnella({
        history: [], // Start a new conversation for each recommendation
        message: prompt,
      });

      // We'll just display the text for now.
      // A more advanced version would parse the response for products.
      setRecommendation({ role: 'model', content: response });

    } catch (e) {
      console.error(e);
      setError('Lo sentimos, no pudimos generar recomendaciones en este momento. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <section className="bg-[hsl(var(--surface-beige))] rounded-3xl my-12 p-10">
        <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl font-bold leading-tight tracking-[-0.015em]">¿Necesitas una idea para un regalo?</h2>
                <p className="text-[hsl(var(--secondary-text))] text-base font-normal leading-normal mt-4 max-w-lg mx-auto lg:mx-0">Deja que nuestro asistente de IA te ayude a encontrar el regalo personalizado perfecto.</p>
            </div>
            <div className="flex-1 w-full">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="occasion"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="block text-sm font-medium text-[hsl(var(--secondary-text))] mb-2">Ocasión</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger className="w-full h-12 px-4 rounded-xl border border-[hsl(var(--border-beige))] focus:ring-2 focus:ring-[hsl(var(--brand-pink))] focus:border-[hsl(var(--brand-pink))] transition bg-[hsl(var(--warm-white))]"><SelectValue placeholder="Elige una ocasión" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Cumpleaños">Cumpleaños</SelectItem>
                                        <SelectItem value="Aniversario">Aniversario</SelectItem>
                                        <SelectItem value="Boda">Boda</SelectItem>
                                        <SelectItem value="Agradecimiento">Agradecimiento</SelectItem>
                                        <SelectItem value="Solo porque sí">Solo porque sí</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="budget"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel className="block text-sm font-medium text-[hsl(var(--secondary-text))] mb-2">Tu Presupuesto</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger className="w-full h-12 px-4 rounded-xl border border-[hsl(var(--border-beige))] focus:ring-2 focus:ring-[hsl(var(--brand-pink))] focus:border-[hsl(var(--brand-pink))] transition bg-[hsl(var(--warm-white))]"><SelectValue placeholder="Elige un presupuesto" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="menos de 50 soles">Menos de S/50</SelectItem>
                                        <SelectItem value="50-100 soles">S/50 - S/100</SelectItem>
                                        <SelectItem value="100-200 soles">S/100 - S/200</SelectItem>
                                        <SelectItem value="más de 200 soles">Más de S/200</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="recipientInterests"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="block text-sm font-medium text-[hsl(var(--secondary-text))] mb-2">Sobre el Destinatario</FormLabel>
                            <FormControl>
                                <Textarea
                                className="w-full p-4 rounded-xl border border-[hsl(var(--border-beige))] focus:ring-2 focus:ring-[hsl(var(--brand-pink))] focus:border-[hsl(var(--brand-pink))] transition bg-[hsl(var(--warm-white))]"
                                placeholder="Ej: Le encanta el chocolate, los gatos y el color azul..."
                                rows={3}
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <Button type="submit" disabled={isLoading} className="brand-btn w-full flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 text-base font-bold leading-normal tracking-[0.015em]">
                         {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Gift className="mr-2 h-5 w-5" />}
                        Obtener Recomendaciones
                    </Button>
                </form>
                </Form>
                {recommendation && (
                    <div className="mt-6 pt-4 border-t border-dashed border-[hsl(var(--border-beige))]">
                        <p className="text-sm italic text-center">{recommendation.content}</p>
                    </div>
                )}
                 {error && <p className="mt-6 text-center text-destructive">{error}</p>}
            </div>
        </div>
    </section>
  );
}
