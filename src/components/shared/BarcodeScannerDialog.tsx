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
    if (!isOpen) {
      return;
    }

    // Ensure the container is ready
    const scannerContainer = document.getElementById(SCANNER_REGION_ID);
    if (!scannerContainer) {
      console.error(`Element with id ${SCANNER_REGION_ID} not found.`);
      return;
    }

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
      // Stop the scanner immediately on success to prevent multiple calls
      if (html5QrcodeScanner.getState() === 2) { // 2 is SCANNING state
          html5QrcodeScanner.clear().catch(error => {
            console.error("Failed to clear scanner after success", error);
          });
      }
      onScanSuccess(decodedText);
      setIsOpen(false);
    };

    const handleError = (errorMessage: string) => {
      // This can be noisy, so we often leave it empty or log selectively.
    };

    html5QrcodeScanner.render(handleSuccess, handleError);

    // Cleanup function when the dialog is closed or component unmounts
    return () => {
      if (html5QrcodeScanner && html5QrcodeScanner.getState() === 2) {
          html5QrcodeScanner.clear().catch(error => {
            console.error("Failed to clear html5QrcodeScanner on cleanup.", error);
          });
      }
    };
  }, [isOpen, onScanSuccess, setIsOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escanear Código QR</DialogTitle>
          <DialogDescription>
            Apunta la cámara al código QR de tu carnet.
          </DialogDescription>
        </DialogHeader>
        <div id={SCANNER_REGION_ID} className="w-full"></div>
      </DialogContent>
    </Dialog>
  );
}