// src/components/settings/ResetStoreDialog.tsx
'use client';

import React, { useState } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';
import { resetStoreData } from '@/services/resetService';

interface ResetStoreDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CONFIRMATION_TEXT_1 = "RESTAURAR";
const CONFIRMATION_TEXT_2 = "ANNULLARE";

export function ResetStoreDialog({ isOpen, setIsOpen }: ResetStoreDialogProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [confirmation1, setConfirmation1] = useState("");
  const [confirmation2, setConfirmation2] = useState("");
  const { toast } = useToast();

  const handleClose = () => {
    setIsOpen(false);
    // Reset state on close after a small delay to allow animation
    setTimeout(() => {
        setStep(1);
        setConfirmation1("");
        setConfirmation2("");
        setLoading(false);
    }, 300);
  };
  
  const handleReset = async () => {
      setLoading(true);
      try {
          await resetStoreData();
          toast({
              title: "Restauración Completa",
              description: "Todos los datos de la tienda han sido eliminados.",
          });
          // After reset, the current user's data is gone, so logging out is a good idea.
          // This would typically be handled by redirecting to a sign-out page.
          window.location.href = '/login';
      } catch (error: any) {
           toast({
              variant: 'destructive',
              title: "Error en la Restauración",
              description: error.message || "No se pudo completar el proceso de borrado.",
          });
          setLoading(false);
      }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <DialogDescription>
              Esta acción eliminará permanentemente <strong>TODOS</strong> los datos: pedidos, productos, inventario, regalos, clientes, empleados y configuraciones. <strong>Esta acción no se puede deshacer.</strong>
            </DialogDescription>
            <p className="text-sm font-medium mt-4">
              Para confirmar, escribe <strong>{CONFIRMATION_TEXT_1}</strong> en el campo de abajo.
            </p>
            <Input
              value={confirmation1}
              onChange={(e) => setConfirmation1(e.target.value)}
              placeholder={CONFIRMATION_TEXT_1}
              className="mt-2"
            />
             <DialogFooter className="pt-4">
                <Button variant="outline" onClick={handleClose}>Cancelar</Button>
                <Button 
                    variant="destructive"
                    onClick={() => setStep(2)}
                    disabled={confirmation1 !== CONFIRMATION_TEXT_1}
                >
                    Siguiente Paso
                </Button>
            </DialogFooter>
          </>
        );
      case 2:
        return (
            <>
                <DialogDescription>
                    Esta es tu segunda advertencia. Estás a punto de borrar <strong>TODA</strong> la información de la base de datos de la tienda.
                </DialogDescription>
                <p className="text-sm font-medium mt-4">
                    Para continuar, escribe <strong>{CONFIRMATION_TEXT_2}</strong> a continuación.
                </p>
                <Input
                    value={confirmation2}
                    onChange={(e) => setConfirmation2(e.target.value)}
                    placeholder={CONFIRMATION_TEXT_2}
                    className="mt-2"
                />
                 <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => setStep(1)}>Volver</Button>
                    <Button 
                        variant="destructive"
                        onClick={() => setStep(3)}
                        disabled={confirmation2 !== CONFIRMATION_TEXT_2}
                    >
                        Confirmación Final
                    </Button>
                </DialogFooter>
            </>
        );
       case 3:
        return (
             <>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Confirmación Final</AlertTitle>
                    <AlertDescription>
                       Hacer clic en el siguiente botón borrará toda la tienda de forma permanente. Las cuentas de usuario de Firebase Auth deberán eliminarse manualmente. No habrá vuelta atrás.
                    </AlertDescription>
                </Alert>
                 <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => setStep(2)} disabled={loading}>
                        Volver
                    </Button>
                    <Button 
                        variant="destructive"
                        onClick={handleReset}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Entiendo, Eliminar Todo Permanentemente
                    </Button>
                </DialogFooter>
            </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={!loading ? handleClose : undefined}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle />
            Acción Irreversible: Borrado Total
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {renderStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
