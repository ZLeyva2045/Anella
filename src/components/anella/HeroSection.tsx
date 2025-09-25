// src/components/anella/HeroSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getHeroImage } from '@/services/settingsService';
import { Skeleton } from '../ui/skeleton';

export function HeroSection() {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroImage = async () => {
      const url = await getHeroImage();
      setHeroImageUrl(url);
      setLoading(false);
    };
    fetchHeroImage();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="min-h-[520px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
     <div className="@container">
        <div className="p-4">
            <div className="flex min-h-[520px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-3xl items-center justify-center p-4 relative overflow-hidden" style={{backgroundImage: `url("${heroImageUrl || 'https://placehold.co/1200x520.png'}")`}} data-ai-hint="gift giving celebration">
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="z-10 flex flex-col gap-4 text-center items-center">
                    <h1 className="text-white text-5xl font-black leading-tight tracking-[-0.033em] drop-shadow-lg">El regalo perfecto</h1>
                    <h2 className="text-white text-lg font-normal leading-normal max-w-lg mx-auto">Explora nuestra colección de regalos cuidadosamente seleccionados para cada ocasión.</h2>
                    <Button asChild className="z-10 brand-btn flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-8 text-base font-bold leading-normal tracking-[0.015em] shadow-lg hover:shadow-xl transition-shadow mt-4">
                        <Link href="/products">
                            <span className="truncate text-white">Ver colección</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
