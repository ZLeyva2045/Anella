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
import { useToast } from '@/hooks/use-toast';
import type { Product, Category } from '@/types/firestore';
import { productTypes } from '@/types/firestore';
import { saveProduct, addCategory } from '@/services/productService';
import { Loader2, ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  costPrice: z.coerce.number().min(0, 'El costo no puede ser negativo.').optional(),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo.'),
  category: z.string().min(1, 'Debes seleccionar una categoría.'),
  productType: z.enum(productTypes, { required_error: 'Debes seleccionar un tipo de producto.' }),
  images: z.array(z.string().url('Debe ser una URL válida.')).min(1, 'Debes añadir al menos una imagen.'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo.'),
  supplier: z.string().optional(),
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
  const { toast } = useToast();

  useEffect(() => {
    const unsubCategories = onSnapshot(collection(db, 'categories'), snapshot => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
    });
    
    return () => {
      unsubCategories();
    };
  }, []);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      costPrice: 0,
      price: 0,
      category: '',
      productType: 'Bienes',
      images: [''],
      stock: 0,
      supplier: '',
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        ...product,
        images: product.images.length > 0 ? product.images : [''],
      });
    } else {
      form.reset({
        name: '',
        description: '',
        costPrice: 0,
        price: 0,
        category: '',
        productType: 'Bienes',
        images: [''],
        stock: 0,
        supplier: '',
      });
    }
  }, [product, form, isOpen]);

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);

    try {
      // Omit `isPersonalizable` as it's no longer in the form for individual products
      const { ...productData } = data;
      await saveProduct(product?.id, productData as any);
      
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
        description: 'No se pudo guardar el producto. Revisa la consola para más detalles.',
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
             <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Tipo de Producto</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {productTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de Costo (S/)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de Venta (S/)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
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
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proveedor (Opcional)</FormLabel>
                    <FormControl><Input placeholder="Nombre del proveedor" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="images.0"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la Imagen Principal</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/imagen.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
