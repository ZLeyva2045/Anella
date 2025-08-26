// src/components/admin/ThemeForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import type { Theme } from '@/types/firestore';
import { Loader2 } from 'lucide-react';
import { uploadImage, addTheme, updateTheme } from '@/services/themeService';

const themeSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  logoUrl: z.string().optional(),
  backgroundUrl: z.string().optional(),
});

type ThemeFormValues = z.infer<typeof themeSchema>;

interface ThemeFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  theme?: Theme | null;
}

export function ThemeForm({ isOpen, setIsOpen, theme }: ThemeFormProps) {
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<ThemeFormValues>({
    resolver: zodResolver(themeSchema),
    defaultValues: { name: '', logoUrl: '', backgroundUrl: '' },
  });

  useEffect(() => {
    if (isOpen) {
      if (theme) {
        form.reset({
          name: theme.name || '',
          logoUrl: theme.logoUrl || '',
          backgroundUrl: theme.backgroundUrl || '',
        });
      } else {
        form.reset({ name: '', logoUrl: '', backgroundUrl: '' });
      }
      setLogoFile(null);
      setBackgroundFile(null);
    }
  }, [theme, form, isOpen]);

  const onSubmit = async (data: ThemeFormValues) => {
    setLoading(true);
    try {
      let logoUrl = data.logoUrl || '';
      let backgroundUrl = data.backgroundUrl || '';

      if (logoFile) {
        logoUrl = await uploadImage(logoFile, 'themes/logos');
      }
      if (backgroundFile) {
        backgroundUrl = await uploadImage(backgroundFile, 'themes/backgrounds');
      }
      
      if (!logoUrl) {
          toast({ variant: 'destructive', title: 'Error', description: 'El logo es obligatorio.' });
          setLoading(false);
          return;
      }
       if (!backgroundUrl) {
          toast({ variant: 'destructive', title: 'Error', description: 'La imagen de fondo es obligatoria.' });
          setLoading(false);
          return;
      }

      const themeData = { ...data, logoUrl, backgroundUrl };

      if (theme) {
        await updateTheme(theme.id, themeData);
        toast({ title: 'Temática actualizada', description: `La temática "${data.name}" se ha guardado.` });
      } else {
        await addTheme(themeData);
        toast({ title: 'Temática creada', description: `La temática "${data.name}" se ha creado.` });
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving theme: ', error);
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: 'No se pudo guardar la temática.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{theme ? 'Editar Temática' : 'Nueva Temática'}</DialogTitle>
          <DialogDescription>Completa los detalles de la temática.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Nombre de la Temática</FormLabel><FormControl><Input placeholder="Ej: Superhéroes" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <FormItem>
              <FormLabel>Logo de la Temática</FormLabel>
              <FormControl>
                 <Input
                  type="file"
                  accept="image/png, image/svg+xml, image/webp"
                  onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

             <FormItem>
              <FormLabel>Imagen de Fondo</FormLabel>
              <FormControl>
                 <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBackgroundFile(e.target.files ? e.target.files[0] : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {theme ? 'Guardar Cambios' : 'Crear Temática'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
