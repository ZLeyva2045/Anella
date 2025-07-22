// src/app/admin/expenses/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { Expense } from '@/types/firestore';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Loader2, Save, PlusCircle, CalendarIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveExpense } from '@/services/expenseService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const expenseCategories = [
  'Alquiler',
  'Servicios Públicos', // (luz, agua, internet)
  'Salarios',
  'Marketing y Publicidad',
  'Transporte y Delivery',
  'Material de Oficina',
  'Mantenimiento',
  'Impuestos',
  'Otros',
];

const expenseSchema = z.object({
  description: z.string().min(3, 'La descripción es obligatoria.'),
  amount: z.coerce.number().min(0.01, 'El monto debe ser mayor a cero.'),
  category: z.string().min(1, 'Debe seleccionar una categoría.'),
  date: z.date({ required_error: 'La fecha es obligatoria.' }),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      amount: 0,
      category: '',
      date: new Date(),
    },
  });

  useEffect(() => {
    const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveExpense = async (data: ExpenseFormValues) => {
    setLoading(true);
    try {
      const expenseData = {
        ...data,
        date: Timestamp.fromDate(data.date),
      };
      await saveExpense(undefined, expenseData);
      toast({ title: 'Gasto Guardado', description: 'El gasto ha sido registrado correctamente.' });
      form.reset();
    } catch (error: any) {
      console.error("Error saving expense:", error);
      toast({ variant: 'destructive', title: 'Error al guardar', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Gastos Operativos</h1>
        <p className="text-muted-foreground">
          Registra todos los gastos de tu negocio para un control financiero completo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrar Nuevo Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveExpense)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría del Gasto</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto (S/)</FormLabel>
                      <FormControl><Input type="number" step="0.01" placeholder="Ej: 150.50" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl><Textarea placeholder="Ej: Pago de servicio de internet del mes de Julio" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col md:flex-row items-end gap-4">
                 <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col w-full md:w-auto">
                        <FormLabel>Fecha del Gasto</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn("w-full md:w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                >
                                {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={date => date > new Date()}
                                initialFocus
                                locale={es}
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar Gasto
                  </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Historial de Gastos</CardTitle>
          <CardDescription>Listado de todos los gastos operativos registrados.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && expenses.length === 0 ? (
             <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No hay gastos registrados aún.</TableCell>
                  </TableRow>
                )}
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{format(expense.date.toDate(), "P", { locale: es })}</TableCell>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">S/{expense.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" disabled>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
