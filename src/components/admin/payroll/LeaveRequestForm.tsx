// src/components/admin/payroll/LeaveRequestForm.tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { add, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createLeaveRequest } from '@/services/leaveService';
import { uploadImage } from '@/services/productService';
import { Loader2, Send, CalendarIcon, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

const leaveRequestSchema = z.object({
  leaveDate: z.date({ required_error: 'La fecha es obligatoria.' }),
  shift: z.enum(['full-day', 'morning', 'afternoon'], { required_error: 'Debes seleccionar un turno.' }),
  justification: z.string().min(10, 'La justificación es muy corta.'),
  attachment: z.instanceof(File).optional(),
}).refine(data => {
    // Validate that the leave date is at least 48 hours in the future
    const now = new Date();
    const minRequestDate = add(now, { hours: 48 });
    return data.leaveDate > minRequestDate;
}, {
    message: 'La solicitud debe hacerse con al menos 48 horas de antelación.',
    path: ['leaveDate'],
});

type LeaveRequestFormValues = z.infer<typeof leaveRequestSchema>;

export function LeaveRequestForm() {
  const [loading, setLoading] = useState(false);
  const { firestoreUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: { justification: '' },
  });

  const onSubmit = async (data: LeaveRequestFormValues) => {
    if (!firestoreUser) return;
    setLoading(true);
    try {
      let attachmentUrl: string | undefined = undefined;
      if (data.attachment) {
        attachmentUrl = await uploadImage(data.attachment, 'leave_attachments');
      }

      await createLeaveRequest({
        employeeId: firestoreUser.id,
        employeeName: firestoreUser.name,
        leaveDate: data.leaveDate,
        shift: data.shift,
        justification: data.justification,
        attachmentUrl,
      });
      toast({ title: 'Solicitud Enviada', description: 'Tu solicitud de permiso ha sido enviada para revisión.' });
      form.reset({ justification: '' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error al enviar', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Solicitar Permiso o Justificar Ausencia</CardTitle>
        <CardDescription>Completa el formulario para solicitar un permiso. Recuerda hacerlo con anticipación.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="leaveDate" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha del Permiso</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}</Button></FormControl></PopoverTrigger>
                    <PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus locale={es} /></PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="shift" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Turno</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona el turno" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="full-day">Día Completo</SelectItem>
                      <SelectItem value="morning">Mañana</SelectItem>
                      <SelectItem value="afternoon">Tarde</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField name="justification" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo o Justificación</FormLabel>
                <FormControl><Textarea placeholder="Ej: Cita médica, trámite personal importante, etc." {...field} rows={4} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="attachment" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Paperclip />Adjuntar Documento (Opcional)</FormLabel>
                <FormControl><Input type="file" accept="image/*,application/pdf" onChange={(e) => field.onChange(e.target.files?.[0])} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
                Enviar Solicitud
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
