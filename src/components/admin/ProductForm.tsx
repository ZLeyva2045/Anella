// src/components/admin/ProductForm.tsx
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
import type { Product } from '@/types/firestore';
import { saveProduct } from '@/services/productService';
import { Loader2, Trash2 } from 'lucide-react';
import { mockCategories, mockThemes } from '@/lib/mock-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronsUpDown, Check } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from '@/lib/utils';

const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres.'),
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
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      themes: [],
      images: ['https://placehold.co/400x300.png'], // Placeholder for now
      isPersonalizable: false,
      isNew: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'images',
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
  }, [product, form, isOpen]);

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    // NOTE: Image upload logic would go here. For now, we use placeholders.
    // We'll replace the file names with uploaded URLs from Firebase Storage in a future step.
    const productDataWithPlaceholders = {
      ...data,
      images: ['https://placehold.co/400x300.png'] // Using placeholder until upload is implemented
    };

    try {
      await saveProduct(product?.id, productDataWithPlaceholders);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Producto' : 'Añadir Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            Completa la información del producto. Haz clic en guardar cuando
            termines.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Lámpara de Luna" {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Textarea
                      placeholder="Describe el producto..."
                      {...field}
                    />
                  </FormControl>
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
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value?.length && "text-muted-foreground"
                          )}
                        >
                          {field.value?.length 
                            ? `${field.value.length} seleccionada(s)`
                            : "Selecciona temáticas"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar temática..." />
                         <CommandList>
                            <CommandEmpty>No se encontró la temática.</CommandEmpty>
                            <CommandGroup>
                            {mockThemes.map((theme) => (
                                <CommandItem
                                key={theme.id}
                                onSelect={() => {
                                    const selected = field.value || [];
                                    const newSelection = selected.includes(theme.id)
                                    ? selected.filter((id) => id !== theme.id)
                                    : [...selected, theme.id];
                                    form.setValue("themes", newSelection);
                                }}
                                >
                                <Check
                                    className={cn(
                                    "mr-2 h-4 w-4",
                                    (field.value || []).includes(theme.id)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                />
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
              <FormLabel>Imágenes</FormLabel>
              {/* This is a temporary UI for local file selection.
                  It does not yet handle uploading to Firebase Storage. */}
              <FormControl>
                  <Input type="file" multiple onChange={(e) => {
                      // This part would need to handle file objects and upload them.
                      // For now, it doesn't set any value in the form state.
                      console.log(e.target.files);
                  }} />
              </FormControl>
              <FormMessage />
            </FormItem>

            <div className="flex items-center space-x-4">
                <FormField
                control={form.control}
                name="isPersonalizable"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>Es Personalizable</FormLabel>
                    </div>
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="isNew"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>Marcar como Nuevo</FormLabel>
                    </div>
                    </FormItem>
                )}
                />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
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
