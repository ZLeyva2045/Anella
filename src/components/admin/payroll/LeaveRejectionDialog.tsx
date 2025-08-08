// src/components/admin/payroll/LeaveRejectionDialog.tsx
'use client';

import React from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const rejectionSchema = z.object({
  reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres.'),
});

type RejectionFormValues = z.infer<typeof rejectionSchema>;

interface LeaveRejectionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
}

export function LeaveRejectionDialog({ isOpen, setIsOpen, onConfirm }: LeaveRejectionDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<RejectionFormValues>({
    resolver: zodResolver(rejectionSchema),
    defaultValues: { reason: '' },
  });

  const handleFormSubmit = async (data: RejectionFormValues) => {
    setLoading(true);
    await onConfirm(data.reason);
    setLoading(false);
    setIsOpen(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar Solicitud de Permiso</DialogTitle>
          <DialogDescription>
            Por favor, proporciona un motivo claro para el rechazo. Este será comunicado al empleado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo del Rechazo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Falta de personal en el turno solicitado, la solicitud no cumple con la antelación mínima, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Rechazo
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
