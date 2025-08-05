// src/components/shared/QrCodeScannerDialog.tsx
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
    if (!isOpen) {
      return;
    }

    // This check prevents re-initialization if the scanner is already there.
    const scannerContainer = document.getElementById(SCANNER_REGION_ID);
    if (!scannerContainer || scannerContainer.children.length > 0) {
      return;
    }

    const html5QrcodeScanner = new Html5QrcodeScanner(
      SCANNER_REGION_ID,
      {
        qrbox: { width: 250, height: 250 },
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
    };

    const handleError = (errorMessage: string) => {
      // This can be noisy, so we often leave it empty or log selectively.
    };

    html5QrcodeScanner.render(handleSuccess, handleError);

    // Cleanup function when the dialog is closed or component unmounts
    return () => {
      const scanner = document.getElementById(SCANNER_REGION_ID);
      // Check if scanner is still active before trying to clear
      if (scanner && scanner.innerHTML !== '' && html5QrcodeScanner.getState() === 2) { 
          html5QrcodeScanner.clear().catch(error => {
            // This error can happen if the component unmounts quickly. It's safe to ignore.
            // console.error("Failed to clear html5QrcodeScanner on cleanup.", error);
          });
      }
    };
  }, [isOpen, onScanSuccess]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escanear Código QR de tu Carnet</DialogTitle>
          <DialogDescription>
            Apunta la cámara al código QR que deseas escanear.
          </DialogDescription>
        </DialogHeader>
        <div id={SCANNER_REGION_ID} className="w-full"></div>
      </DialogContent>
    </Dialog>
  );
}
