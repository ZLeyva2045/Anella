// src/components/admin/ProductBulkEditForm.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Product, Category, Subcategory } from '@/types/firestore';
import { updateProductsInBatch } from '@/services/productService';
import { Loader2 } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const bulkEditSchema = z.object({
  costPrice: z.coerce.number().optional(),
  supplier: z.string().optional(),
  subcategoryId: z.string().optional(),
});

type BulkEditFormValues = z.infer<typeof bulkEditSchema>;

interface ProductBulkEditFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  products: Product[];
  onSuccess: () => void;
}

export function ProductBulkEditForm({ isOpen, setIsOpen, products, onSuccess }: ProductBulkEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [commonCategoryId, setCommonCategoryId] = useState<string | null>(null);
  const [commonMissingFields, setCommonMissingFields] = useState<string[]>([]);
  
  const { toast } = useToast();

  const form = useForm<BulkEditFormValues>({
    resolver: zodResolver(bulkEditSchema),
    defaultValues: {
        costPrice: undefined,
        supplier: undefined,
        subcategoryId: undefined,
    },
  });

  useEffect(() => {
    if (!isOpen || products.length === 0) return;

    // Determinar categoría común y campos faltantes
    const firstProduct = products[0];
    const categoryId = firstProduct.categoryId;
    const isCategoryCommon = products.every(p => p.categoryId === categoryId);
    
    if (isCategoryCommon && categoryId) {
      setCommonCategoryId(categoryId);
    } else {
      setCommonCategoryId(null);
    }

    const missingFields: string[] = [];
    if (products.every(p => !p.costPrice)) missingFields.push('costPrice');
    if (products.every(p => !p.supplier)) missingFields.push('supplier');
    if (isCategoryCommon && products.every(p => !p.subcategoryId)) missingFields.push('subcategory');
    setCommonMissingFields(missingFields);

    form.reset();

  }, [isOpen, products, form]);

  useEffect(() => {
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });

    if (commonCategoryId) {
      const subcategoriesRef = collection(db, 'categories', commonCategoryId, 'subcategories');
      const unsubSubcategories = onSnapshot(subcategoriesRef, (snapshot) => {
        setSubcategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subcategory)));
      });
      return () => {
        unsubCategories();
        unsubSubcategories();
      };
    }

    return () => unsubCategories();
  }, [commonCategoryId]);

  const onSubmit = async (data: BulkEditFormValues) => {
    setLoading(true);
    try {
      const updateData: Partial<Product> = {};
      if (data.costPrice !== undefined) updateData.costPrice = data.costPrice;
      if (data.supplier) updateData.supplier = data.supplier;
      if (data.subcategoryId) {
        const subcat = subcategories.find(s => s.id === data.subcategoryId);
        if (subcat) {
          updateData.subcategoryId = subcat.id;
          updateData.subcategory = subcat.name;
        }
      }

      if (Object.keys(updateData).length === 0) {
        toast({ variant: 'destructive', title: 'Nada que actualizar', description: 'Por favor, completa al menos un campo.' });
        setLoading(false);
        return;
      }
      
      const productIds = products.map(p => p.id);
      await updateProductsInBatch(productIds, updateData);

      toast({
        title: '¡Productos actualizados!',
        description: `${productIds.length} productos han sido actualizados correctamente.`,
      });
      onSuccess();
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating products in batch:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron actualizar los productos.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Completar Información en Lote</DialogTitle>
          <DialogDescription>
            Rellena los campos para {products.length} productos seleccionados. Solo se muestran los campos vacíos en común.
          </DialogDescription>
        </DialogHeader>
        {commonMissingFields.length > 0 ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {commonMissingFields.includes('costPrice') && (
                <FormField
                  control={form.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio de Costo (S/)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {commonMissingFields.includes('supplier') && (
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Proveedor</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del proveedor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {commonMissingFields.includes('subcategory') && commonCategoryId && (
                <FormField
                  control={form.control}
                  name="subcategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategoría</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una subcategoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subcategories.map(sub => (
                            <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No se encontraron campos vacíos en común para los productos seleccionados.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
