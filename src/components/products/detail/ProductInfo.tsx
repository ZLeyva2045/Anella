// src/components/products/detail/ProductInfo.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { ProductDetail } from '@/lib/mock-data';
import { Heart, Share2, ShoppingCart, Star } from 'lucide-react';

interface ProductInfoProps {
  product: ProductDetail;
}

export function ProductInfo({ product }: ProductInfoProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
        <div className="flex items-center gap-4 mt-2">
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground ml-1">(25 reseñas)</span>
            </div>
          )}
          <Badge variant={product.isNew ? "default" : "secondary"}>
            {product.isNew ? 'Nuevo' : 'Popular'}
          </Badge>
        </div>
      </div>
      <p className="text-3xl font-bold text-primary">S/{product.price.toFixed(2)}</p>
      <p className="text-muted-foreground pb-4">{product.description}</p>
      
      <Separator />

      <div className="py-4">
        <div className="flex items-center justify-between">
            <span className="font-medium">Cantidad</span>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8">-</Button>
                <span className="w-10 text-center font-bold text-lg">1</span>
                <Button variant="outline" size="icon" className="h-8 w-8">+</Button>
            </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        <Button size="lg" className="w-full text-lg py-6">
            <ShoppingCart className="mr-2"/>
            Añadir al Carrito
        </Button>
         <Button size="lg" variant="outline" className="w-full">
            <Heart className="mr-2"/>
            Añadir a Favoritos
        </Button>
      </div>

       <div className="text-center pt-4">
        <Button variant="link">
            <Share2 className="mr-2"/>
            Compartir
        </Button>
       </div>

    </div>
  );
}