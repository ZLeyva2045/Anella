
// src/app/admin/products/page.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Edit,
  Loader2,
  TrendingUp,
  FilePenLine
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';
import type { Product } from '@/types/firestore';
import {
  collection,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ProductForm } from '@/components/admin/ProductForm';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { deleteProducts } from '@/services/productService';


export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  // State for bulk selection
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const selectedRowCount = useMemo(() => Object.values(selectedRows).filter(Boolean).length, [selectedRows]);
  
  const { toast } = useToast();

  useEffect(() => {
    const productsCollection = collection(db, 'products');
    const unsubscribe = onSnapshot(productsCollection, (snapshot) => {
      const productsData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Product)
      );
      setProducts(productsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const handleSelectAll = (checked: boolean) => {
    const newSelectedRows: Record<string, boolean> = {};
    if (checked) {
      products.forEach(p => newSelectedRows[p.id] = true);
    }
    setSelectedRows(newSelectedRows);
  };
  
  const handleSelectRow = (productId: string, checked: boolean) => {
    setSelectedRows(prev => ({ ...prev, [productId]: checked }));
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
  };
  
  const getProductName = (productId: string | null) => {
      if (!productId) return '';
      return products.find(p => p.id === productId)?.name || '';
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      await deleteProducts([productToDelete]);
      toast({
        title: 'Producto eliminado',
        description: `El producto ha sido eliminado del inventario.`,
      });
    } catch (error) {
      console.error('Error deleting product: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el producto.',
      });
    } finally {
      setProductToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    const idsToDelete = Object.keys(selectedRows).filter(id => selectedRows[id]);
    if (idsToDelete.length === 0) return;

    try {
      await deleteProducts(idsToDelete);
      toast({
        title: 'Productos eliminados',
        description: `${idsToDelete.length} productos han sido eliminados.`,
      });
      setSelectedRows({});
    } catch (error) {
        console.error('Error bulk deleting products: ', error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron eliminar los productos.' });
    } finally {
        setIsBulkDeleteConfirmOpen(false);
    }
  }
  
  const calculateMargin = (price: number, costPrice?: number) => {
    if (!costPrice || price <= costPrice) return { percentage: 0, color: 'text-destructive' };
    const margin = ((price - costPrice) / price) * 100;
    const color = margin < 20 ? 'text-destructive' : margin < 40 ? 'text-amber-500' : 'text-green-500';
    return { percentage: margin, color };
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inventario de Productos</h1>
            <p className="text-muted-foreground">
              Gestiona los componentes individuales para crear regalos.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleAddProduct}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Producto
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            {selectedRowCount > 0 && (
              <>
                <span className="text-sm text-muted-foreground">{selectedRowCount} seleccionado(s)</span>
                <Button variant="outline" size="sm" onClick={() => setIsBulkDeleteConfirmOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                </Button>
                <Button variant="outline" size="sm">
                    <FilePenLine className="mr-2 h-4 w-4" />
                    Completar Información
                </Button>
              </>
            )}
        </div>


        <Card>
          <CardHeader>
            <CardTitle>Todos los Productos</CardTitle>
            <CardDescription>
              Listado de productos base en el inventario.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                     <TableHead padding="checkbox">
                        <Checkbox
                            checked={selectedRowCount === products.length && products.length > 0}
                            // @ts-ignore - The type definition doesn't account for the 'indeterminate' string value
                            indeterminate={selectedRowCount > 0 && selectedRowCount < products.length ? "true" : undefined}
                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                            aria-label="Seleccionar todo"
                        />
                    </TableHead>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      <span className="sr-only">Imagen</span>
                    </TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="hidden md:table-cell">Precio</TableHead>
                    <TableHead className="hidden lg:table-cell">Margen</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const margin = calculateMargin(product.price, product.costPrice);
                    return (
                        <TableRow key={product.id} data-state={selectedRows[product.id] && "selected"}>
                          <TableCell padding="checkbox">
                            <Checkbox
                                checked={!!selectedRows[product.id]}
                                onCheckedChange={(checked) => handleSelectRow(product.id, !!checked)}
                                aria-label={`Seleccionar ${product.name}`}
                            />
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Image
                              alt={product.name}
                              className="aspect-square rounded-md object-cover"
                              height="64"
                              src={product.images[0] || 'https://placehold.co/64x64.png'}
                              width="64"
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium">{product.category || 'N/A'}</span>
                                {product.subcategory && <span className="text-xs text-muted-foreground">{product.subcategory}</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.stock > 10 ? "secondary" : "outline"}
                             className={cn(product.stock <= 5 && 'bg-destructive/20 border-destructive/50 text-destructive-foreground')}>
                              {product.stock} en stock
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            S/{product.price.toFixed(2)}
                          </TableCell>
                           <TableCell className={cn("hidden lg:table-cell", margin.color)}>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                <span>{margin.percentage.toFixed(1)}%</span>
                              </div>
                           </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  aria-haspopup="true"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(product.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <ProductForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        product={selectedProduct}
      />

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente
              el producto &quot;{getProductName(productToDelete)}&quot; del inventario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente {selectedRowCount} productos. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>
              Sí, eliminar {selectedRowCount} productos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
