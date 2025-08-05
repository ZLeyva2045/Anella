'use client';

import React, { useEffect } from 'react';
import { Html5QrcodeScanner, type Html5QrcodeResult } from 'html5-qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface QrCodeScannerDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onScanSuccess: (decodedText: string) => void;
}

const SCANNER_REGION_ID = "qr-code-scanner-region";

export function QrCodeScannerDialog({ isOpen, setIsOpen, onScanSuccess }: QrCodeScannerDialogProps) {

  useEffect(() => {
    if (!isOpen) return;

    let html5QrcodeScanner: Html5QrcodeScanner | null = null;

    const initializeScanner = () => {
      const scannerContainer = document.getElementById(SCANNER_REGION_ID);
      if (!scannerContainer || scannerContainer.children.length > 0) {
        return;
      }

      html5QrcodeScanner = new Html5QrcodeScanner(
        SCANNER_REGION_ID,
        {
          qrbox: { width: 250, height: 250 },
          fps: 10,
          rememberLastUsedCamera: true,
        },
        false
      );

      const handleSuccess = (decodedText: string, decodedResult: Html5QrcodeResult) => {
        html5QrcodeScanner?.clear().catch((err) =>
          console.error("Error clearing scanner after success", err)
        );
        onScanSuccess(decodedText);
        setIsOpen(false); // opcional: cerrar al escanear
      };

      html5QrcodeScanner.render(handleSuccess, () => { /* ignore errors */ });
    };

    // Esperamos hasta que el DOM esté listo
    const timeout = setTimeout(() => {
      requestAnimationFrame(initializeScanner);
    }, 100); // delay corto

    // Cleanup al desmontar o cerrar
    return () => {
      clearTimeout(timeout);
      html5QrcodeScanner?.clear().catch(() => {});
    };
  }, [isOpen, onScanSuccess, setIsOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escanear Código QR de tu Carnet</DialogTitle>
          <DialogDescription>
            Apunta la cámara al código QR que deseas escanear.
          </DialogDescription>
        </DialogHeader>
        <div id={SCANNER_REGION_ID} className="w-full" />
      </DialogContent>
    </Dialog>
  );
}
