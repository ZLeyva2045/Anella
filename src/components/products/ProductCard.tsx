// src/components/products/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star } from 'lucide-react';
import type { Gift } from '@/types/firestore';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ProductCardProps {
  gift: Gift;
}

export function ProductCard({ gift }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // In a real app, you would also update localStorage or a backend service
    setIsFavorite(!isFavorite);
  };

  return (
    <Link href={`/products/${gift.id}`} className="group relative flex flex-col">
        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
            <Image
                alt={gift.name}
                className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                src={gift.images[0] || 'https://placehold.co/400x400.png'}
                width={400}
                height={400}
                data-ai-hint={gift.name}
            />
             <Button
                size="icon"
                variant="ghost"
                className={cn(
                "absolute top-2 right-2 h-8 w-8 rounded-full bg-white/70 backdrop-blur-sm transition-colors hover:scale-110 active:scale-100",
                isFavorite ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                )}
                onClick={toggleFavorite}
                aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
                <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
            </Button>
            {gift.isNew && <Badge className="absolute top-2 left-2">Nuevo</Badge>}
        </div>
        <div className="mt-4">
            <h3 className="text-base font-semibold text-foreground">{gift.name}</h3>
            <p className="mt-1 text-lg font-bold text-primary">S/{gift.price.toFixed(2)}</p>
        </div>
    </Link>
  );
}
