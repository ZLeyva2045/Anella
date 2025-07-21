// src/components/admin/ProductForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import type { Product, Category, Subcategory } from '@/types/firestore';
import { productTypes } from '@/types/firestore';
import { saveProduct, addCategory, addSubcategory, uploadImage } from '@/services/productService';
import { Loader2, Calendar as CalendarIcon, ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '../ui/calendar';

const baseProductSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  costPrice: z.coerce.number().min(0, 'El costo no puede ser negativo.').optional(),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo.'),
  category: z.string().min(1, 'Debes seleccionar una categoría.'),
  categoryId: z.string().min(1, 'ID de categoría no válido.'),
  subcategory: z.string().optional(),
  subcategoryId: z.string().optional(),
  productType: z.enum(productTypes, { required_error: 'Debes seleccionar un tipo de producto.' }),
  images: z.array(z.string()).optional(),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo.').optional(),
  supplier: z.string().optional(),
  expirationDate: z.date().optional(),
  isBreakfast: z.boolean().default(false),
});

const productSchema = baseProductSchema.superRefine((data, ctx) => {
    if (data.productType === 'Servicios') return;
    if (data.productType === 'Consumibles' && data.isBreakfast) return;
    
    if (data.stock === undefined || data.stock === null || isNaN(data.stock)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'El stock es obligatorio para este tipo de producto.',
            path: ['stock'],
        });
    }
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
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '', description: '', costPrice: 0, price: 0, 
      category: '', categoryId: '', subcategory: '', subcategoryId: '',
      productType: 'Bienes', images: [], stock: 0, supplier: '',
      expirationDate: undefined, isBreakfast: false
    },
  });

  const productType = useWatch({ control: form.control, name: 'productType' });
  const isBreakfast = useWatch({ control: form.control, name: 'isBreakfast' });
  const selectedCategoryId = useWatch({ control: form.control, name: 'categoryId' });

  // Fetch categories
  useEffect(() => {
    const unsubCategories = onSnapshot(collection(db, 'categories'), snapshot => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });
    return () => unsubCategories();
  }, []);

  // Fetch subcategories when a category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      const subcategoriesRef = collection(db, 'categories', selectedCategoryId, 'subcategories');
      const unsubSubcategories = onSnapshot(subcategoriesRef, snapshot => {
        setSubcategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subcategory)));
      });
      return () => unsubSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId]);

  // Reset form when dialog opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        form.reset({
          ...product,
          images: product.images || [],
          expirationDate: product.expirationDate ? (product.expirationDate as any).toDate() : undefined,
        });
      } else {
        form.reset({
          name: '', description: '', costPrice: 0, price: 0, 
          category: '', categoryId: '', subcategory: '', subcategoryId: '',
          productType: 'Bienes', images: [], stock: 0, supplier: '',
          expirationDate: undefined, isBreakfast: false
        });
      }
      setImageFile(null);
    }
  }, [product, form, isOpen]);


  const handleCreateCategory = async (categoryName: string) => {
    if (!categoryName.trim()) return;
    const existing = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase().trim());
    if (existing) {
      form.setValue('category', existing.name);
      form.setValue('categoryId', existing.id, { shouldValidate: true });
      return;
    };
    
    setLoading(true);
    try {
      const newCategoryId = await addCategory({ name: categoryName.trim() });
      form.setValue('category', categoryName.trim());
      form.setValue('categoryId', newCategoryId, { shouldValidate: true });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear la categoría.' });
    } finally {
        setLoading(false);
    }
  };
  
  const handleCreateSubcategory = async (subcategoryName: string) => {
    if (!subcategoryName.trim() || !selectedCategoryId) return;
    const existing = subcategories.find(s => s.name.toLowerCase() === subcategoryName.toLowerCase().trim());
    if (existing) {
       form.setValue('subcategory', existing.name);
       form.setValue('subcategoryId', existing.id, { shouldValidate: true });
       return;
    };
    
    setLoading(true);
    try {
      const newSubcategoryId = await addSubcategory(selectedCategoryId, { name: subcategoryName.trim() });
      form.setValue('subcategory', subcategoryName.trim());
      form.setValue('subcategoryId', newSubcategoryId, { shouldValidate: true });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear la subcategoría.' });
    } finally {
        setLoading(false);
    }
  }


  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    try {
      let imageUrls = data.images || [];
      
      if (!imageFile && (!product || !product.images || product.images.length === 0)) {
        toast({ variant: "destructive", title: "Error", description: "Debes añadir al menos una imagen." });
        setLoading(false);
        return;
      }
      
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile, 'products');
        imageUrls = [uploadedUrl];
      }

      const finalData = { ...data, images: imageUrls };
      if (finalData.isBreakfast) {
        finalData.expirationDate = undefined;
      }
      
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
        title: 'Error al guardar',
        description: 'No se pudo guardar el producto. Revisa la consola para más detalles.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Producto' : 'Añadir Nuevo Producto'}</DialogTitle>
          <DialogDescription>Completa la información del producto. Haz clic en guardar cuando termines.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Nombre del Producto</FormLabel><FormControl><Input placeholder="Ej: Lámpara de Luna" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea placeholder="Describe el producto..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="productType" render={({ field }) => ( <FormItem><FormLabel>Tipo de Producto</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger></FormControl><SelectContent>{productTypes.map(type => ( <SelectItem key={type} value={type}>{type}</SelectItem> ))}</SelectContent></Select><FormMessage /></FormItem>)} />
            
            {productType === 'Consumibles' && (
              <div className="space-y-4 rounded-md border p-4">
                 <FormField control={form.control} name="expirationDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Fecha de Vencimiento</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")} disabled={isBreakfast}>{field.value ? (format(field.value, "PPP", { locale: es })) : (<span>Selecciona una fecha</span>)}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date() || !!isBreakfast} initialFocus locale={es} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="isBreakfast" render={({ field }) => ( <FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Desayuno o similar (omite fecha)</FormLabel></div></FormItem>)} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="costPrice" render={({ field }) => ( <FormItem><FormLabel>Precio de Costo (S/)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="price" render={({ field }) => ( <FormItem><FormLabel>Precio de Venta (S/)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Categoría</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                        {field.value ? categories.find(c => c.name === field.value)?.name : "Selecciona o crea una categoría"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command onKeyDown={(e) => {
                                   if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                                     e.preventDefault();
                                     handleCreateCategory((e.target as HTMLInputElement).value);
                                   }
                                }}>
                                    <CommandInput placeholder="Buscar categoría..." />
                                    <CommandList>
                                        <CommandEmpty>No se encontró. Presiona Enter para crear.</CommandEmpty>
                                        <CommandGroup>
                                            {categories.map(cat => (
                                                <CommandItem
                                                    value={cat.name}
                                                    key={cat.id}
                                                    onSelect={() => {
                                                        form.setValue("category", cat.name);
                                                        form.setValue("categoryId", cat.id, { shouldValidate: true });
                                                        form.setValue("subcategory", "");
                                                        form.setValue("subcategoryId", "");
                                                    }}
                                                >
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
                )}/>
                 <FormField control={form.control} name="subcategory" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Subcategoría (Opcional)</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant="outline" role="combobox" disabled={!selectedCategoryId} className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                        {field.value ? subcategories.find(s => s.name === field.value)?.name : "Selecciona o crea una subcategoría"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command onKeyDown={(e) => {
                                   if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                                     e.preventDefault();
                                     handleCreateSubcategory((e.target as HTMLInputElement).value);
                                   }
                                }}>
                                    <CommandInput placeholder="Buscar subcategoría..." />
                                    <CommandList>
                                        <CommandEmpty>No se encontró. Presiona Enter para crear.</CommandEmpty>
                                        <CommandGroup>
                                            {subcategories.map(sub => (
                                                <CommandItem
                                                    value={sub.name}
                                                    key={sub.id}
                                                    onSelect={() => {
                                                        form.setValue("subcategory", sub.name);
                                                        form.setValue("subcategoryId", sub.id, { shouldValidate: true });
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", sub.name === field.value ? "opacity-100" : "opacity-0")} />
                                                    {sub.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {productType !== 'Servicios' && (
                <FormField control={form.control} name="stock" render={({ field }) => ( <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl><FormMessage /></FormItem>)} />
              )}
               <FormField control={form.control} name="supplier" render={({ field }) => ( <FormItem><FormLabel>Proveedor (Opcional)</FormLabel><FormControl><Input placeholder="Nombre del proveedor" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            
            <FormItem>
              <FormLabel>Imagen Principal</FormLabel>
              <FormControl><Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}/></FormControl>
              <FormMessage>{form.formState.errors.images?.message}</FormMessage>
            </FormItem>

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
