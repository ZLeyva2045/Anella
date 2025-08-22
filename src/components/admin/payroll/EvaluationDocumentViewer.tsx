// src/components/admin/payroll/EvaluationDocumentViewer.tsx
'use client';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface EvaluationDocumentViewerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  content: string;
}

export function EvaluationDocumentViewer({ isOpen, setIsOpen, title, content }: EvaluationDocumentViewerProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setHasCopied(true);
    toast({ title: 'Copiado', description: 'El contenido del documento se ha copiado al portapapeles.' });
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-6">
           <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
           </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={copyToClipboard}>
             {hasCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            Copiar Texto
          </Button>
          <Button type="button" onClick={() => setIsOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
