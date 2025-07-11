// src/components/admin/ProductForm.tsx
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { Product, Category, Theme } from '@/types/firestore';
import { saveProduct, addCategory, addTheme, uploadImage } from '@/services/productService';
import { Loader2, ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from '@/lib/utils';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo.'),
  category: z.string().min(1, 'Debes seleccionar una categoría.'),
  themes: z.array(z.string()).optional(),
  images: z.array(z.string().url('Debe ser una URL válida.')).min(1, 'Debes añadir al menos una imagen.'),
  isPersonalizable: z.boolean().default(false),
  isNew: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  product?: Product | null;
}

export function ProductForm({ isOpen, setIsOpen, product }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubCategories = onSnapshot(collection(db, 'categories'), snapshot => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
    });
    const unsubThemes = onSnapshot(collection(db, 'themes'), snapshot => {
      const thms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Theme));
      setThemes(thms);
    });

    return () => {
      unsubCategories();
      unsubThemes();
    };
  }, []);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      themes: [],
      images: ['https://placehold.co/400x300.png'],
      isPersonalizable: false,
      isNew: true,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        themes: product.themes || [],
        images: product.images.length > 0 ? product.images : ['https://placehold.co/400x300.png'],
        isPersonalizable: product.isPersonalizable,
        isNew: product.isNew,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        category: '',
        themes: [],
        images: ['https://placehold.co/400x300.png'],
        isPersonalizable: false,
        isNew: true,
      });
    }
    setSelectedImageFile(null);
  }, [product, form, isOpen]);

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);

    try {
      let imageUrls = data.images;

      if (selectedImageFile) {
        const productIdForPath = product?.id || `new_${Date.now()}`;
        const uploadedImageUrl = await uploadImage(selectedImageFile, `products/${productIdForPath}`);
        imageUrls = [uploadedImageUrl];
      }
      
      const finalData = { 
        ...data,
        images: imageUrls,
      };

      await saveProduct(product?.id, finalData);

      toast({
        title: `Producto ${product ? 'actualizado' : 'creado'}`,
        description: `El producto "${data.name}" se ha guardado correctamente.`,
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving product: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar el producto.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (categoryName: string) => {
    const existing = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (existing) return;
    await addCategory({ name: categoryName });
    form.setValue('category', categoryName);
  }

  const handleCreateTheme = async (themeName: string) => {
    const existing = themes.find(t => t.name.toLowerCase() === themeName.toLowerCase());
    const currentThemes = form.getValues('themes') || [];
    if (existing || currentThemes.includes(themeName)) return;

    await addTheme({ name: themeName });
    form.setValue('themes', [...currentThemes, themeName]);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Producto' : 'Añadir Nuevo Producto'}</DialogTitle>
          <DialogDescription>Completa la información del producto. Haz clic en guardar cuando termines.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl><Input placeholder="Ej: Lámpara de Luna" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl><Textarea placeholder="Describe el producto..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio (S/)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Categoría</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                            {field.value ? categories.find(c => c.name === field.value)?.name : "Selecciona una categoría"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.target as HTMLInputElement).value && !categories.some(c => c.name.toLowerCase() === (e.target as HTMLInputElement).value.toLowerCase())) {
                            e.preventDefault();
                            handleCreateCategory((e.target as HTMLInputElement).value);
                            (document.activeElement as HTMLElement)?.blur();
                          }
                        }}>
                          <CommandInput placeholder="Buscar o crear categoría..." />
                          <CommandList>
                            <CommandEmpty>No se encontró. Presiona Enter para crear.</CommandEmpty>
                            <CommandGroup>
                              {categories.map(cat => (
                                <CommandItem key={cat.id} value={cat.name} onSelect={() => form.setValue("category", cat.name)}>
                                  <Check className={cn("mr-2 h-4 w-4", cat.name === field.value ? "opacity-100" : "opacity-0")} />
                                  {cat.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="themes"
              render={({ field }) => (
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
              )}
            />
            
            <FormItem>
              <FormLabel>Imagen Principal</FormLabel>
              <FormControl>
                <Input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedImageFile(file);
                    }
                  }} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            <div className="flex items-center space-x-4">
              <FormField control={form.control} name="isPersonalizable" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Es Personalizable</FormLabel></div></FormItem>)} />
              <FormField control={form.control} name="isNew" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Marcar como Nuevo</FormLabel></div></FormItem>)} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {product ? 'Guardar Cambios' : 'Crear Producto'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
