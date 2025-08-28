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

interface IAnellaChatProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function IAnellaChat({ isOpen, setIsOpen }: IAnellaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const response = await chatWithAnella({
            history: messages,
            message: input,
        });

        const modelMessage: ChatMessage = { role: 'model', content: response };
        setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
        const errorMessage: ChatMessage = { role: 'model', content: '¡Uy! Algo salió mal. Por favor, inténtalo de nuevo más tarde.' };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-scroll to the bottom when new messages arrive
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
                </div>
                 {msg.role === 'user' && <User className="w-6 h-6 text-muted-foreground flex-shrink-0" />}
              </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                    <Bot className="w-6 h-6 text-primary flex-shrink-0" />
                     <div className="p-3 rounded-lg bg-secondary flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin"/>
                        <span>Pensando...</span>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pide una recomendación..."
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
