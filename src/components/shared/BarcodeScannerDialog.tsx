// src/components/shared/BarcodeScannerDialog.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, type Html5QrcodeResult } from 'html5-qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface BarcodeScannerDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onScanSuccess: (decodedText: string) => void;
}

const SCANNER_REGION_ID = "barcode-scanner-region";

export function BarcodeScannerDialog({ isOpen, setIsOpen, onScanSuccess }: BarcodeScannerDialogProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const scannerElement = document.getElementById(SCANNER_REGION_ID);
        if (!scannerElement) {
          console.error(`Element with id ${SCANNER_REGION_ID} not found.`);
          return;
        }
        scannerElement.innerHTML = '';

        const html5QrcodeScanner = new Html5QrcodeScanner(
          SCANNER_REGION_ID,
          {
            qrbox: { width: 250, height: 100 },
            fps: 10,
            rememberLastUsedCamera: true,
          },
          false // verbose
        );
        scannerRef.current = html5QrcodeScanner;

        const handleSuccess = (decodedText: string, decodedResult: Html5QrcodeResult) => {
          onScanSuccess(decodedText);
          setIsOpen(false);
        };

        const handleError = (errorMessage: string) => {
          // console.warn(errorMessage);
        };

        html5QrcodeScanner.render(handleSuccess, handleError);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onScanSuccess, setIsOpen]);

  useEffect(() => {
    // Cleanup function for when the component unmounts or dialog is closed
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner.", error);
        });
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escanear Código de Barras</DialogTitle>
          <DialogDescription>
            Apunta la cámara al código de barras del producto.
          </DialogDescription>
        </DialogHeader>
        <div id={SCANNER_REGION_ID} className="w-full"></div>
      </DialogContent>
    </Dialog>
  );
}
