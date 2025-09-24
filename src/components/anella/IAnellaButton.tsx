// src/components/anella/IAnellaButton.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Bot, Sparkles, X } from 'lucide-react';
import { IAnellaChat } from './IAnellaChat';
import { AnimatePresence, motion } from 'framer-motion';

export function IAnellaButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(false);
    }, 3000); // La burbuja desaparecerá después de 3 segundos

    return () => clearTimeout(timer);
  }, []);
  
  const handleButtonClick = () => {
    setIsChatOpen(true);
    setShowBubble(false); // Ocultar la burbuja si se abre el chat
  }

  return (
    <>
      {isChatOpen && <IAnellaChat isOpen={isChatOpen} setIsOpen={setIsChatOpen} />}
      <div className="fixed bottom-6 left-6 z-50 flex items-end gap-2">
         <AnimatePresence>
            {showBubble && !isChatOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="bg-background p-3 rounded-lg rounded-bl-none shadow-lg border text-sm font-medium"
                >
                    ¿En qué puedo ayudarte?
                </motion.div>
            )}
        </AnimatePresence>
        <Button
            onClick={handleButtonClick}
            className="w-16 h-16 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:scale-110 active:animate-button-press bg-gradient-to-br from-primary to-fuchsia-500 hover:from-fuchsia-500 hover:to-purple-600"
            aria-label="Abrir asistente IAnella"
        >
            <div className="relative w-full h-full flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Sparkles className="absolute h-full w-full text-white/30 animate-spin-slow" />
                    <Bot className="w-8 h-8 relative text-white" />
                </motion.div>
            </div>
        </Button>
      </div>
    </>
  );
}
