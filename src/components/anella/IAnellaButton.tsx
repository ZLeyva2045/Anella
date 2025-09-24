// src/components/anella/IAnellaButton.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Bot, Sparkles } from 'lucide-react';
import { IAnellaChat } from './IAnellaChat';

export function IAnellaButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-16 h-16 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:scale-110 active:animate-button-press bg-gradient-to-br from-primary to-fuchsia-500 hover:from-fuchsia-500 hover:to-purple-600"
        aria-label="Abrir asistente IAnella"
      >
        <div className="relative w-full h-full flex items-center justify-center">
            <Sparkles className="absolute h-full w-full text-white/30 animate-spin-slow" />
            <Bot className="w-8 h-8 relative text-white" />
        </div>
      </Button>
      <IAnellaChat isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </>
  );
}
