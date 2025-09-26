// src/components/admin/ProductImportDialog.tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, FileCheck2, AlertCircle } from 'lucide-react';
import { importProducts } from '@/services/productService';
import type { Product } from '@/types/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';

type ProductImportData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

interface ProductImportDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess: () => void;
}

const requiredHeaders = ['name', 'description', 'price', 'stock', 'category', 'productType'];

export function ProductImportDialog({ isOpen, setIsOpen, onSuccess }: ProductImportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ProductImportData[]>([]);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setLoading(true);
      try {
        const data = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        // Validate headers
        const headers = Object.keys(jsonData[0] || {});
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            toast({
                variant: 'destructive',
                title: 'Cabeceras Faltantes',
                description: `El archivo debe contener las siguientes columnas: ${missingHeaders.join(', ')}`,
            });
            setParsedData([]);
            return;
        }

        const formattedData: ProductImportData[] = jsonData.map(row => ({
          name: row.name || '',
          description: row.description || '',
          price: parseFloat(row.price) || 0,
          costPrice: parseFloat(row.costPrice) || undefined,
          category: row.category || 'General',
          subcategory: row.subcategory || undefined,
          images: row.images ? (row.images as string).split(',') : [],
          stock: parseInt(row.stock, 10) || 0,
          supplier: row.supplier || '',
          productType: row.productType || 'Bienes',
          // Default empty fields
          categoryId: '',
          subcategoryId: '',
          barcode: '',
        }));
        setParsedData(formattedData);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error al leer el archivo', description: 'Asegúrate de que sea un archivo .xlsx o .csv válido.' });
        setParsedData([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast({ variant: 'destructive', title: 'No hay datos para importar' });
      return;
    }
    setLoading(true);
    try {
      await importProducts(parsedData);
      toast({
        title: '¡Importación exitosa!',
        description: `${parsedData.length} productos han sido importados correctamente.`,
      });
      onSuccess();
      setIsOpen(false);
      setParsedData([]);
      setFile(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error en la importación', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Importar Productos desde Archivo</DialogTitle>
          <DialogDescription>Sube un archivo .xlsx o .csv para añadir productos en lote.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-secondary/50 border-l-4 border-accent rounded-r-lg">
            <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-accent-foreground" />
                <h4 className="font-semibold text-accent-foreground">Instrucciones</h4>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Asegúrate de que tu archivo tenga las siguientes columnas obligatorias: <strong>{requiredHeaders.join(', ')}</strong>.
              Otras columnas como `subcategory`, `costPrice`, `images`, `supplier` son opcionales. Las imágenes deben ser URLs separadas por comas.
            </p>
          </div>
          <Input type="file" accept=".xlsx, .csv" onChange={handleFileChange} disabled={loading} />

          {parsedData.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Previsualización de Datos ({parsedData.length} productos)</h3>
              <ScrollArea className="h-64 border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Categoría</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 20).map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>S/{product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{product.category}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleImport} disabled={loading || parsedData.length === 0}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCheck2 className="mr-2 h-4 w-4" />}
            Confirmar e Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
