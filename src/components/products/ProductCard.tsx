// src/components/products/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star } from 'lucide-react';
import type { Product } from '@/types/firestore';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // In a real app, you would also update localStorage or a backend service
    setIsFavorite(!isFavorite);
  };

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <Card className="w-full h-full flex flex-col overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="p-0 relative">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={300}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={product.name}
          />
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute top-2 right-2 h-8 w-8 rounded-full bg-white/70 backdrop-blur-sm transition-colors",
              isFavorite ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            )}
            onClick={toggleFavorite}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </Button>
          {product.isNew && <Badge className="absolute top-2 left-2">Nuevo</Badge>}
        </CardHeader>
        <CardContent className="p-4 space-y-2 flex-grow">
          <CardTitle className="text-lg leading-tight truncate">{product.name}</CardTitle>
          <p className="text-sm text-muted-foreground h-10 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between pt-1">
            <p className="text-xl font-bold text-primary">S/{product.price.toFixed(2)}</p>
            {product.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button className="w-full">
            Personalizar
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}