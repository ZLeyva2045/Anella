// src/app/admin/compras/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types/firestore';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Loader2, Save, Trash2, PlusCircle, CalendarIcon, ChevronsUpDown, Check, ScanBarcode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductForm } from '@/components/admin/ProductForm';
import { savePurchaseLote } from '@/services/purchaseService';
import type { LoteItem } from '@/types/firestore';
import { BarcodeScannerDialog } from '@/components/shared/BarcodeScannerDialog';


const loteItemSchema = z.object({
  productId: z.string().min(1, 'Debe seleccionar un producto.'),
  productName: z.string(),
  quantity: z.coerce.number().min(1, 'La cantidad debe ser al menos 1.'),
  costPerUnit: z.coerce.number().min(0, 'El costo no puede ser negativo.'),
  expirationDate: z.date().optional().nullable(),
  noExpiration: z.boolean().default(false),
  barcode: z.string().optional(),
});

type LoteItemFormValues = z.infer<typeof loteItemSchema>;

export default function IngresarLotePage() {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [temporalLote, setTemporalLote] = useState<LoteItemFormValues[]>([]);
  const { toast } = useToast();

  const itemForm = useForm<LoteItemFormValues>({
    resolver: zodResolver(loteItemSchema),
    defaultValues: {
      productId: '',
      productName: '',
      quantity: 1,
      costPerUnit: 0,
      expirationDate: new Date(),
      noExpiration: false,
      barcode: '',
    },
  });

  const noExpirationWatcher = useWatch({
    control: itemForm.control,
    name: 'noExpiration',
  });

  // --- Logic for Physical Barcode Scanner ---
  const [barcodeBuffer, setBarcodeBuffer] = useState('');
  const [lastKeystroke, setLastKeystroke] = useState(0);

  const handleScanSuccess = useCallback((decodedText: string) => {
    const foundProduct = inventory.find(p => p.barcode === decodedText || p.id === decodedText || p.supplier === decodedText || p.name === decodedText);
    if (foundProduct) {
        itemForm.setValue('productId', foundProduct.id);
        itemForm.setValue('productName', foundProduct.name);
        itemForm.setValue('barcode', decodedText);
        toast({ title: 'Producto Encontrado', description: `Se ha seleccionado "${foundProduct.name}".`});
    } else {
        itemForm.setValue('barcode', decodedText);
        toast({ variant: 'destructive', title: 'Producto no encontrado', description: 'El código escaneado no coincide con ningún producto. Puedes añadirlo manualmente.'});
    }
    setIsScannerOpen(false);
  }, [inventory, itemForm, toast]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
          return;
      }

      const currentTime = new Date().getTime();

      setLastKeystroke(prevTime => {
          if (currentTime - prevTime > 100) {
              setBarcodeBuffer('');
          }
          return currentTime;
      });

      if (event.key === 'Enter') {
        setBarcodeBuffer(prevBuffer => {
          if (prevBuffer.length > 5) {
            handleScanSuccess(prevBuffer);
          }
          return '';
        });
      } else if (event.key.length === 1) {
        setBarcodeBuffer(prev => prev + event.key);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [barcodeBuffer, handleScanSuccess]);
  // --- End of Physical Scanner Logic ---

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching inventory: ", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);


  const handleAddProductToLote = (data: LoteItemFormValues) => {
    const finalData = {
      ...data,
      expirationDate: data.noExpiration ? null : data.expirationDate,
    };
    setTemporalLote(prev => [...prev, finalData]);
    itemForm.reset({
      productId: '',
      productName: '',
      quantity: 1,
      costPerUnit: 0,
      expirationDate: new Date(),
      noExpiration: false,
      barcode: '',
    });
  };

  const handleRemoveFromLote = (index: number) => {
    setTemporalLote(prev => prev.filter((_, i) => i !== index));
  }

  const handleSaveLote = async () => {
    if (temporalLote.length === 0) {
      toast({ variant: 'destructive', title: 'Lote vacío', description: 'Añade al menos un producto al lote.' });
      return;
    }
    setLoading(true);
    try {
        const loteItemsToSave: LoteItem[] = temporalLote.map(item => ({
            productoId: item.productId,
            cantidadInicial: item.quantity,
            cantidadActual: item.quantity,
            costoUnitarioCompra: item.costPerUnit,
            fechaCompra: new Date(),
            fechaVencimiento: item.expirationDate || null,
            codigoBarrasLote: item.barcode || '',
            estadoLote: 'activo',
        }));

        await savePurchaseLote(loteItemsToSave);

        setTemporalLote([]);
        toast({ title: 'Lote Guardado', description: 'El lote ha sido registrado y el stock actualizado correctamente.' });

    } catch (error: any) {
        console.error("Error saving lote:", error);
        toast({
            variant: 'destructive',
            title: 'Error al guardar',
            description: error.message || 'No se pudo registrar el lote en el inventario.',
        });
    } finally {
        setLoading(false);
    }
  };

  const totalLoteCost = useMemo(() => {
    return temporalLote.reduce((acc, item) => acc + (item.costPerUnit * item.quantity), 0);
  }, [temporalLote]);

  return (
    <>
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Registrar Compra</h1>
        <p className="text-muted-foreground">
          Añade los productos comprados para crear un nuevo lote de inventario.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
             <CardTitle>Añadir Producto al Lote</CardTitle>
             <Button variant="outline" size="sm" onClick={() => setIsProductFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Nuevo Producto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit(handleAddProductToLote)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={itemForm.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Producto</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" role="combobox" className={cn("justify-between", !field.value && "text-muted-foreground")}>
                              {field.value ? inventory.find(p => p.id === field.value)?.name : "Selecciona un producto"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar producto..." />
                            <CommandList>
                               <CommandEmpty>No se encontraron productos.</CommandEmpty>
                                <CommandGroup>
                                {inventory.map(p => (
                                    <CommandItem
                                    key={p.id}
                                    value={p.name}
                                    onSelect={() => {
                                        itemForm.setValue("productId", p.id);
                                        itemForm.setValue("productName", p.name);
                                    }}
                                    >
                                    <Check className={cn("mr-2 h-4 w-4", p.id === field.value ? "opacity-100" : "opacity-0")} />
                                    {p.name}
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
                 <FormField
                    control={itemForm.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de Barras (Opcional)</FormLabel>
                        <div className="flex gap-2">
                            <FormControl><Input placeholder="Escanear o escribir código" {...field} /></FormControl>
                             <Button type="button" variant="outline" size="icon" onClick={() => setIsScannerOpen(true)}>
                                <ScanBarcode />
                            </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={itemForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl><Input type="number" min="1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={itemForm.control}
                  name="costPerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo por Unidad (S/)</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={itemForm.control}
                    name="expirationDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Vencimiento</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                disabled={noExpirationWatcher}
                                >
                                {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={date => date < new Date() || noExpirationWatcher}
                                initialFocus
                                locale={es}
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                  control={itemForm.control}
                  name="noExpiration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-end space-x-2 pb-2">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>Sin Vencimiento</FormLabel>
                        </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir al Lote
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
          <CardHeader>
              <CardTitle>Contenido del Lote Actual</CardTitle>
              <CardDescription>Estos productos se guardarán juntos. El stock se actualizará al guardar.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>Cantidad</TableHead>
                          <TableHead>Costo/U</TableHead>
                          <TableHead>Vencimiento</TableHead>
                          <TableHead>Acciones</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {temporalLote.length === 0 && (
                          <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground">El lote está vacío</TableCell>
                          </TableRow>
                      )}
                      {temporalLote.map((item, index) => (
                          <TableRow key={index}>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>S/{item.costPerUnit.toFixed(2)}</TableCell>
                              <TableCell>{item.noExpiration ? 'N/A' : item.expirationDate ? format(item.expirationDate, "P", { locale: es }) : 'N/A'}</TableCell>
                              <TableCell>
                                  <Button variant="ghost" size="icon" onClick={() => handleRemoveFromLote(index)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
               {temporalLote.length > 0 && (
                 <div className="text-right font-bold text-lg mt-4 pr-4">
                    Costo Total del Lote: S/{totalLoteCost.toFixed(2)}
                 </div>
               )}
          </CardContent>
      </Card>

      <div className="flex justify-end">
          <Button size="lg" onClick={handleSaveLote} disabled={loading || temporalLote.length === 0}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar Lote en Inventario
          </Button>
      </div>
    </div>

    <ProductForm
        isOpen={isProductFormOpen}
        setIsOpen={setIsProductFormOpen}
        product={null}
    />
    <BarcodeScannerDialog 
        isOpen={isScannerOpen}
        setIsOpen={setIsScannerOpen}
        onScanSuccess={(decodedText) => handleScanSuccess(decodedText)}
    />
    </>
  );
}
