// src/components/anella/HeroSection.tsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const useTypewriter = (text: string, speed = 50, startDelay = 0) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let i = 0;
    const initialTimeout = setTimeout(() => {
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(prev => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, speed);
      return () => clearInterval(typingInterval);
    }, startDelay);

    return () => clearTimeout(initialTimeout);

  }, [text, speed, startDelay]);

  return displayText;
};

const FloatingParticle = ({ icon: Icon, className, style }: { icon: React.ElementType, className?: string, style?: React.CSSProperties }) => (
    <div className={cn("absolute text-primary/40 animate-pulse", className)} style={style}>
        <Icon className="h-full w-full" />
    </div>
);


export function HeroSection() {
  const title = useTypewriter("La Mejor Tienda de Regalos de Cajamarca", 50, 500);
  const subtitle = useTypewriter("Miles de productos personalizados con fotos y frases únicas.", 30, 2500);

  return (
    <section id="hero" className="relative w-full h-[85vh] min-h-[600px] max-h-[800px] overflow-hidden flex items-center justify-center bg-soft-gradient">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://placehold.co/1920x1080.png"
          alt="Mosaico de regalos personalizados"
          layout="fill"
          objectFit="cover"
          className="opacity-10 animate-fade-in"
          data-ai-hint="gift collage"
          priority
        />
         <div className="absolute inset-0 bg-background/30"></div>
      </div>
      
      {/* Floating Particles */}
      <FloatingParticle icon={Heart} className="w-12 h-12 top-[15%] left-[10%] animate-[bounce_10s_ease-in-out_infinite]" />
      <FloatingParticle icon={Star} className="w-8 h-8 top-[20%] right-[15%] animate-[bounce_12s_ease-in-out_infinite]" />
      <FloatingParticle icon={Heart} className="w-10 h-10 bottom-[25%] right-[20%] animate-[bounce_9s_ease-in-out_infinite]" />
      <FloatingParticle icon={Star} className="w-6 h-6 bottom-[15%] left-[25%] animate-[bounce_11s_ease-in-out_infinite]" />
      <FloatingParticle icon={Heart} className="w-16 h-16 top-[50%] left-[30%] opacity-20 animate-[bounce_15s_ease-in-out_infinite]" />
      <FloatingParticle icon={Star} className="w-14 h-14 top-[60%] right-[40%] opacity-20 animate-[bounce_13s_ease-in-out_infinite]" />


      <div className="relative z-10 text-center px-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 drop-shadow-md min-h-[5rem] md:min-h-[6rem]">
            {title}
            <span className="inline-block w-1 bg-primary animate-ping ml-1"></span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 drop-shadow-sm min-h-[3rem]">
          {subtitle}
        </p>
        <Button 
            size="lg" 
            className="text-lg py-7 px-10 transition-transform duration-300 ease-out hover:scale-105 hover:rotate-[-2deg] hover:shadow-floating"
            onClick={() => document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Descubre tu regalo ideal
        </Button>
      </div>
    </section>
  );
}
