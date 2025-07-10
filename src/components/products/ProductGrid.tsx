// src/components/products/ProductGrid.tsx
import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/firestore';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
}

const ITEMS_PER_PAGE = 9;

export function ProductGrid({ products, loading }: ProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
  };

  const hasMoreProducts = visibleCount < products.length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
           <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
           </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16">
        <h3 className="text-2xl font-semibold">No se encontraron productos</h3>
        <p className="text-muted-foreground mt-2">Intenta ajustar tus filtros o búsqueda.</p>
      </div>
    )
  }

  return (
    <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, visibleCount).map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
        {hasMoreProducts && (
            <div className="mt-8 text-center">
                <Button onClick={handleLoadMore} size="lg">
                    Cargar más productos
                </Button>
            </div>
        )}
    </div>
  );
}
