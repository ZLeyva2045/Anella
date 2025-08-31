
// src/components/anella/IAnellaChat.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { chatWithAnella } from '@/ai/flows/ianella-assistant';
import type { ChatMessage } from '@/types/ianella';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { parseIntent } from '@/lib/intent';
import ProductSuggestion from './ProductSuggestion';

interface IAnellaChatProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function IAnellaChat({ isOpen, setIsOpen }: IAnellaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const intent = parseIntent(text);

      if (intent.recipient) {
         const res = await fetch('/api/products/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipient: intent.recipient,
              budget: intent.budget,
              interests: intent.interests,
              occasion: intent.occasion,
            }),
        });

        const json = await res.json();

        if (json.ok && json.products?.length) {
            const productsMessage: ChatMessage = {
                role: 'model',
                content: "¡Claro! Basado en lo que me dijiste, aquí tienes algunas ideas de nuestro catálogo:",
                products: json.products,
            };
            setMessages(prev => [...prev, productsMessage]);
        } else {
            const noResultMessage: ChatMessage = {
                role: 'model',
                content: "No encontré algo exacto en el catálogo, ¿te gustaría que te ofrezca un regalo personalizado? Puedo ayudarte a diseñarlo desde cero.",
            };
            setMessages(prev => [...prev, noResultMessage]);
        }
      } else {
        // If no specific gift intent, use the general conversational AI
        const response = await chatWithAnella({
            history: messages,
            message: text,
        });
        const modelMessage: ChatMessage = { role: 'model', content: response };
        setMessages(prev => [...prev, modelMessage]);
      }
    } catch (error) {
        const errorMessage: ChatMessage = { role: 'model', content: '¡Uy! Algo salió mal. Por favor, inténtalo de nuevo más tarde.' };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);
  
  useEffect(() => {
    if(isOpen && messages.length === 0) {
        setMessages([{ role: 'model', content: '¡Hola! Soy IAnella, tu asistente de regalos. ¿En qué puedo ayudarte hoy? 😊' }]);
    }
  }, [isOpen, messages]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md md:max-w-lg flex flex-col h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="text-primary" />
            Asistente IAnella
          </DialogTitle>
          <DialogDescription>
            Tu experta personal en encontrar "El regalo perfecto".
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6" ref={scrollAreaRef}>
          <div className="space-y-4 pr-4">
            {messages.map((msg, index) => (
              <div key={index} className={cn('flex items-start gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'model' && <Bot className="w-6 h-6 text-primary flex-shrink-0" />}
                <div className={cn('p-3 rounded-lg max-w-sm prose prose-sm', msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {msg.products && msg.products.length > 0 && (
                        <div className="space-y-2 mt-2 not-prose">
                            {msg.products.map(p => <ProductSuggestion key={p.id} p={p} />)}
                        </div>
                    )}
                </div>
                 {msg.role === 'user' && <User className="w-6 h-6 text-muted-foreground flex-shrink-0" />}
              </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                    <Bot className="w-6 h-6 text-primary flex-shrink-0" />
                     <div className="p-3 rounded-lg bg-secondary flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin"/>
                        <span>Buscando ideas...</span>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Regalo para mi novio por aniversario..."
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend(input)}
            disabled={isLoading}
          />
          <Button onClick={() => handleSend(input)} disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
