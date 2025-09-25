// src/components/marketing/SocialPostForm.tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { SocialPost } from '@/types/firestore';
import { Loader2 } from 'lucide-react';
import { saveSocialPost } from '@/services/socialPostService';

const postSchema = z.object({
  platform: z.enum(['Instagram', 'TikTok', 'Facebook'], { required_error: 'Debes seleccionar una plataforma.' }),
  embedCode: z.string().min(20, 'El código de inserción parece demasiado corto.'),
  caption: z.string().min(3, 'La descripción es necesaria para identificar el post.'),
  order: z.coerce.number().int().min(0, 'El orden debe ser un número positivo.'),
});

type PostFormValues = z.infer<typeof postSchema>;

interface SocialPostFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  post?: SocialPost | null;
}

export function SocialPostForm({ isOpen, setIsOpen, post }: SocialPostFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      platform: 'Instagram',
      embedCode: '',
      caption: '',
      order: 0,
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      if (post) {
        form.reset(post);
      } else {
        form.reset({ platform: 'Instagram', embedCode: '', caption: '', order: 0 });
      }
    }
  }, [post, form, isOpen]);

  const onSubmit = async (data: PostFormValues) => {
    setLoading(true);
    try {
        await saveSocialPost(post?.id, data);
        toast({
            title: `Publicación ${post ? 'actualizada' : 'creada'}`,
            description: `La publicación de ${data.platform} ha sido guardada.`
        });
        setIsOpen(false);
    } catch (error: any) {
         toast({
            variant: 'destructive',
            title: 'Error al guardar',
            description: error.message || 'No se pudo guardar la publicación.'
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{post ? 'Editar Publicación' : 'Añadir Publicación'}</DialogTitle>
          <DialogDescription>Pega el código de inserción y completa los detalles.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="platform" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Plataforma</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
             <FormField name="caption" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción Corta (para admin)</FormLabel>
                <FormControl><Input placeholder="Ej: Video proceso taza mágica" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField name="embedCode" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Código de Inserción (Embed Code)</FormLabel>
                <FormControl><Textarea placeholder='Pega aquí el código HTML completo...' {...field} rows={6} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField name="order" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Orden de Visualización</FormLabel>
                <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {post ? 'Guardar Cambios' : 'Crear Publicación'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
