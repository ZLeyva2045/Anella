// src/app/personalize/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/anella/Header';
import { Footer } from '@/components/anella/Footer';

const personalizationSchema = z.object({
  name: z.string().min(2, { message: 'Por favor, ingresa tu nombre.' }),
  email: z.string().email({ message: 'Por favor, ingresa un correo válido.' }),
  description: z.string().min(20, { message: 'Describe tu idea con al menos 20 caracteres.' }),
  image: z.any().optional(),
});

type PersonalizationFormValues = z.infer<typeof personalizationSchema>;

export default function PersonalizePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PersonalizationFormValues>({
    resolver: zodResolver(personalizationSchema),
    defaultValues: {
      name: '',
      email: '',
      description: '',
    },
  });

  async function onSubmit(values: PersonalizationFormValues) {
    setIsLoading(true);
    // Simular envío de datos
    console.log('Datos de personalización:', values);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    toast({
      title: '¡Solicitud enviada!',
      description: 'Gracias por tu interés. Nos pondremos en contacto contigo pronto para hacer realidad tu idea.',
    });
    form.reset();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
          <Card className="max-w-3xl mx-auto shadow-lg border-2 border-primary/10">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-2">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">Personaliza tu Regalo Soñado</CardTitle>
              <CardDescription>¿Tienes una idea única? ¡Cuéntanosla y la haremos realidad juntos!</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tu Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Ana García" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tu Correo Electrónico</FormLabel>
                          <FormControl>
                            <Input placeholder="tu@correo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Describe tu idea</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ej: Quisiera una lámpara con una foto de mi mascota y la frase 'Mi mejor amigo' grabada en la base..."
                            {...field}
                            rows={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagen de Referencia (Opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Enviando tu idea...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Enviar Solicitud
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
      </main>
      <Footer />
    </div>
  );
}
