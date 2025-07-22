// src/components/shared/BarcodeScannerDialog.tsx
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

interface BarcodeScannerDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onScanSuccess: (decodedText: string) => void;
}

const SCANNER_REGION_ID = "barcode-scanner-region";

export function BarcodeScannerDialog({ isOpen, setIsOpen, onScanSuccess }: BarcodeScannerDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    // We use a timeout to ensure the DOM element is rendered before initializing the scanner.
    const timer = setTimeout(() => {
      const scannerElement = document.getElementById(SCANNER_REGION_ID);
      if (!scannerElement) {
        console.error(`Element with id ${SCANNER_REGION_ID} not found.`);
        return;
      }
      // Clear any existing content
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

      const handleSuccess = (decodedText: string, decodedResult: Html5QrcodeResult) => {
        onScanSuccess(decodedText);
      };

      const handleError = (errorMessage: string) => {
        // console.warn(errorMessage);
      };

      html5QrcodeScanner.render(handleSuccess, handleError);

      return () => {
        // Cleanup function for when the component unmounts or isOpen changes
        if (html5QrcodeScanner) {
          html5QrcodeScanner.clear().catch(error => {
            console.error("Failed to clear html5QrcodeScanner.", error);
          });
        }
      };
    }, 0);

    // This is the cleanup for the timeout itself
    return () => clearTimeout(timer);
  }, [isOpen, onScanSuccess]);

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
