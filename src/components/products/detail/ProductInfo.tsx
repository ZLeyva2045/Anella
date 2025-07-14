// src/components/products/detail/ProductInfo.tsx
'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { GiftDetail } from '@/lib/mock-data';
import type { SelectedCustomization } from '@/app/products/[id]/page';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { Heart, Share2, ShoppingCart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Gift } from '@/types/firestore';

interface ProductInfoProps {
  product: GiftDetail;
  totalPrice: number;
  customizationCost: number;
  selectedCustomizations: SelectedCustomization;
}

export function ProductInfo({ product, totalPrice, customizationCost, selectedCustomizations }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    // We need to cast the gift detail to a format the cart understands.
    // The cart expects a Product-like structure, so we adapt it.
    const cartProduct = {
      ...(product as unknown as Gift),
      price: totalPrice, // Use the final calculated price
      customizations: selectedCustomizations,
    };
    addToCart(cartProduct, quantity);
    toast({
      title: "¡Añadido al carrito!",
      description: `${quantity} x ${product.name} se ha añadido a tu carrito.`,
    });
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Quitado de favoritos" : "¡Añadido a favoritos!",
      description: `${product.name} se ha ${isFavorite ? 'quitado de tu' : 'añadido a tu'} lista de deseos.`,
    });
  }

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

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
      
      <div>
        <div className="flex justify-between items-baseline">
            <span className="text-muted-foreground">Precio Base</span>
            <span className="text-muted-foreground">S/{product.price.toFixed(2)}</span>
        </div>
         {customizationCost > 0 && (
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-muted-foreground">Personalización</span>
            <span className="text-muted-foreground">+ S/{customizationCost.toFixed(2)}</span>
          </div>
        )}
        <p className="text-3xl font-bold text-primary text-right mt-1">S/{totalPrice.toFixed(2)}</p>
      </div>

      <p className="text-muted-foreground pb-4">{product.description}</p>
      
      <Separator />

      <div className="py-4">
        <div className="flex items-center justify-between">
            <span className="font-medium">Cantidad</span>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={decreaseQuantity}>-</Button>
                <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={increaseQuantity}>+</Button>
            </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        <Button size="lg" className="w-full text-lg py-6" onClick={handleAddToCart}>
            <ShoppingCart className="mr-2"/>
            Añadir al Carrito
        </Button>
         <Button 
            size="lg" 
            variant="outline" 
            className="w-full"
            onClick={handleToggleFavorite}
          >
            <Heart className={cn("mr-2", isFavorite && "fill-current text-red-500")} />
            {isFavorite ? 'En tu lista de deseos' : 'Añadir a Favoritos'}
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
