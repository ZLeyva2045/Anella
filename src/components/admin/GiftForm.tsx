// src/components/admin/GiftForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { Gift, Theme, Product, GiftProduct } from '@/types/firestore';
import { saveGift } from '@/services/giftService';
import { Loader2, ChevronsUpDown, Check, Trash2, PlusCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from '@/lib/utils';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { addTheme } from '@/services/productService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const giftProductSchema = z.object({
  productId: z.string().min(1),
  name: z.string(),
  quantity: z.coerce.number().min(1),
});

const giftSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo.'),
  themes: z.array(z.string()).min(1, 'Debes seleccionar al menos una temática.'),
  images: z.array(z.string().url('Debe ser una URL válida.')).min(1, 'Debes añadir al menos una imagen.'),
  isNew: z.boolean().default(true),
  showInWebsite: z.boolean().default(true),
  products: z.array(giftProductSchema).min(1, 'El regalo debe tener al menos un producto.'),
});

type GiftFormValues = z.infer<typeof giftSchema>;

interface GiftFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  gift?: Gift | null;
}

export function GiftForm({ isOpen, setIsOpen, gift }: GiftFormProps) {
  const [loading, setLoading] = useState(false);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [inventory, setInventory] = useState<Product[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const unsubThemes = onSnapshot(collection(db, 'themes'), snapshot => setThemes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Theme))));
    const unsubInventory = onSnapshot(collection(db, 'products'), snapshot => setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product))));
    
    return () => {
      unsubThemes();
      unsubInventory();
    };
  }, []);

  const form = useForm<GiftFormValues>({
    resolver: zodResolver(giftSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      themes: [],
      images: [''],
      isNew: true,
      showInWebsite: true,
      products: [],
    },
  });
  
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "products",
  });

  useEffect(() => {
    if (gift) {
      form.reset({
        ...gift,
        showInWebsite: gift.showInWebsite ?? true,
      });
    } else {
      form.reset({
        name: '', description: '', price: 0, 
        themes: [], images: [''], isNew: true, showInWebsite: true, products: [],
      });
    }
  }, [gift, form, isOpen]);
  
  const handleCreateTheme = async (themeName: string) => {
    const existing = themes.find(t => t.name.toLowerCase() === themeName.toLowerCase());
    const currentThemes = form.getValues('themes') || [];
    if (existing || currentThemes.includes(themeName)) return;

    await addTheme({ name: themeName });
    form.setValue('themes', [...currentThemes, themeName]);
  }

  const onSubmit = async (data: GiftFormValues) => {
    setLoading(true);
    try {
      await saveGift(gift?.id, data);
      toast({
        title: `Regalo ${gift ? 'actualizado' : 'creado'}`,
        description: `El regalo "${data.name}" se ha guardado correctamente.`,
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving gift: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar el regalo.',
      });
    } finally {
      setLoading(false);
    }
  };

  const addProductToGift = () => {
    if (inventory.length > 0) {
      append({ productId: inventory[0].id, name: inventory[0].name, quantity: 1 });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{gift ? 'Editar Regalo' : 'Crear Nuevo Regalo'}</DialogTitle>
          <DialogDescription>Completa la información del regalo.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Nombre del Regalo</FormLabel><FormControl><Input placeholder="Cesta de Cumpleaños" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea placeholder="Describe el regalo..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField name="price" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Precio (S/)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
               <FormField control={form.control} name="themes" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Temáticas</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value?.length && "text-muted-foreground")}>
                          {field.value?.length ? `${field.value.length} seleccionada(s)` : "Selecciona temáticas"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                       <Command onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                             e.preventDefault();
                            handleCreateTheme((e.target as HTMLInputElement).value);
                          }
                       }}>
                        <CommandInput placeholder="Buscar o crear temática..." />
                        <CommandList>
                          <CommandEmpty>No se encontró. Presiona Enter para crear.</CommandEmpty>
                          <CommandGroup>
                            {themes.map(theme => (
                              <CommandItem
                                key={theme.id}
                                value={theme.name}
                                onSelect={() => {
                                  const selected = field.value || [];
                                  const newSelection = selected.includes(theme.name) ? selected.filter(t => t !== theme.name) : [...selected, theme.name];
                                  form.setValue("themes", newSelection);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", (field.value || []).includes(theme.name) ? "opacity-100" : "opacity-0")} />
                                {theme.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            
            <FormField name="images.0" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>URL de la Imagen Principal</FormLabel><FormControl><Input placeholder="https://ejemplo.com/imagen.png" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="space-y-2">
                <h3 className="text-sm font-medium">Productos en este Regalo</h3>
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 p-2 border rounded-md">
                        <Select
                            value={field.productId}
                            onValueChange={(productId) => {
                                const product = inventory.find(p => p.id === productId);
                                update(index, { productId: productId, name: product?.name || '', quantity: field.quantity });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un producto" />
                            </SelectTrigger>
                            <SelectContent>
                                {inventory.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Input
                            type="number"
                            min={1}
                            className="w-20"
                            {...form.register(`products.${index}.quantity`)}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addProductToGift}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir Producto
                </Button>
                <FormMessage>{form.formState.errors.products?.message || form.formState.errors.products?.root?.message}</FormMessage>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <FormField control={form.control} name="isNew" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Marcar como Nuevo</FormLabel></div></FormItem>)} />
              <FormField control={form.control} name="showInWebsite" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Mostrar en Web</FormLabel></div></FormItem>)} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {gift ? 'Guardar Cambios' : 'Crear Regalo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
