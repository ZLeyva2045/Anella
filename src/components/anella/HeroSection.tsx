// src/components/anella/HeroSection.tsx
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  const heroImageUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuDDF6Km3T2PJxSEDAO7qxQBJLqLsl_GUnkhleGVMyMPnQK9HXSG7caWO-df-Y3fRgPt4y3qctsdeLLCj86y5cdK1s5GJrdbwP5YUl3CMQZVrFw4961e_-T8T-47zGIMXgWMD1-XWXmrumZhabSFHWzgAF-QZSSEfALRGhBsqL-g2Prgw-2_LXZVWQaDMsLAw-63x0IPU74h51ee9HU3Q0EJi8UmpNTs58_Bj8upj0lEa2KK9vpmJeDXAYSE0349Rs1whHLhRKZG6T8";

  return (
     <div className="@container">
        <div className="p-4">
            <div className="flex min-h-[520px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-3xl items-center justify-center p-4 relative overflow-hidden" style={{backgroundImage: `url("${heroImageUrl}")`}} data-ai-hint="gift giving celebration">
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="z-10 flex flex-col gap-4 text-center items-center">
                    <h1 className="text-[hsl(var(--warm-white))] text-5xl font-black leading-tight tracking-[-0.033em] drop-shadow-lg">El regalo perfecto</h1>
                    <h2 className="text-[hsl(var(--warm-white))] text-lg font-normal leading-normal max-w-lg mx-auto">Explora nuestra colección de regalos cuidadosamente seleccionados para cada ocasión.</h2>
                    <Button asChild className="z-10 brand-btn flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-8 text-base font-bold leading-normal tracking-[0.015em] shadow-lg hover:shadow-xl transition-shadow mt-4">
                        <Link href="/products">
                            <span className="truncate">Ver colección</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
