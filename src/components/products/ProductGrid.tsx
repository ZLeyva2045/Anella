// src/components/products/ProductGrid.tsx
import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { Gift } from '@/types/firestore';

interface ProductGridProps {
  gifts: Gift[];
  loading: boolean;
}

const ITEMS_PER_PAGE = 8;

export function ProductGrid({ gifts, loading }: ProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
  };

  const hasMoreGifts = visibleCount < gifts.length;

  if (loading) {
    return (
      <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {Array.from({ length: 8 }).map((_, index) => (
           <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[250px] w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
           </div>
        ))}
      </div>
    );
  }

  if (gifts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16">
        <h3 className="text-2xl font-semibold">No se encontraron regalos</h3>
        <p className="text-muted-foreground mt-2">Intenta ajustar tus filtros o búsqueda.</p>
      </div>
    )
  }

  return (
    <div>
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {gifts.slice(0, visibleCount).map(gift => (
                <ProductCard key={gift.id} gift={gift} />
            ))}
        </div>
        {hasMoreGifts && (
            <div className="mt-12 text-center">
                <Button onClick={handleLoadMore} size="lg">
                    Cargar más regalos
                </Button>
            </div>
        )}
    </div>
  );
}
