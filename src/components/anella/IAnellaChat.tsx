// src/components/anella/IAnellaChat.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { Bot, Loader2, Send, User, Sparkles } from 'lucide-react';
import { chatWithAnella } from '@/ai/flows/ianella-assistant';
import type { ChatMessage } from '@/types/ianella';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
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
  const { user } = useAuth();
  
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, 100);
  }, []);

  // Effect for fetching chat history
  useEffect(() => {
    if (!isOpen || !user) {
        // If not logged in or chat is closed, ensure initial message is there
        if(messages.length === 0) {
           setMessages([{ role: 'model', content: '¡Hola! Soy IAnella, tu asistente de regalos. ¿En qué puedo ayudarte hoy? 😊' }]);
        }
        return;
    }

    setIsLoading(true);
    const chatHistoryRef = collection(db, 'users', user.uid, 'chatHistory');
    const q = query(chatHistoryRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => doc.data() as ChatMessage);
      if (history.length === 0) {
        setMessages([{ role: 'model', content: `¡Hola, ${user.displayName}! Soy IAnella. ¿Qué regalo buscas hoy? 😊` }]);
      } else {
        setMessages(history);
      }
      setIsLoading(false);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [isOpen, user, scrollToBottom]);


  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: text, createdAt: serverTimestamp() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (user) {
        const chatHistoryRef = collection(db, 'users', user.uid, 'chatHistory');
        await addDoc(chatHistoryRef, userMessage);
    }
    
    try {
        const response = await chatWithAnella({
            history: messages, // Send current context
            message: text,
        });

        // Simple check for product results from the tool
        let modelResponse: ChatMessage;
        try {
            const parsedResponse = JSON.parse(response);
            if (parsedResponse.products) {
                 modelResponse = { 
                    role: 'model', 
                    content: parsedResponse.message, 
                    products: parsedResponse.products,
                    createdAt: serverTimestamp() 
                };
            } else {
                 modelResponse = { role: 'model', content: response, createdAt: serverTimestamp() };
            }
        } catch (e) {
            // If it's not a JSON string from the tool, it's a regular text response
            modelResponse = { role: 'model', content: response, createdAt: serverTimestamp() };
        }
        
        setMessages(prev => [...prev, modelResponse]);

        if (user) {
            const chatHistoryRef = collection(db, 'users', user.uid, 'chatHistory');
            await addDoc(chatHistoryRef, modelResponse);
        }

    } catch (error) {
        console.error("Error calling chatWithAnella:", error);
        const errorMessage: ChatMessage = { role: 'model', content: '¡Uy! Algo salió mal. Por favor, inténtalo de nuevo más tarde.', createdAt: serverTimestamp() };
        setMessages(prev => [...prev, errorMessage]);
        if (user) {
             await addDoc(collection(db, 'users', user.uid, 'chatHistory'), errorMessage);
        }
    } finally {
        setIsLoading(false);
        scrollToBottom();
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md md:max-w-lg flex flex-col h-[80vh] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary animate-pulse" />
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
                <div className={cn('p-3 rounded-lg max-w-sm prose prose-sm dark:prose-invert', msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
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
