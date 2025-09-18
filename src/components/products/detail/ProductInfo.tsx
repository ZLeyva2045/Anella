// src/components/products/detail/ProductInfo.tsx
'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import type { GiftDetail } from '@/lib/mock-data';
import type { SelectedCustomization } from './ProductDetailClient';
import type { Gift } from '@/types/firestore';
import { ShoppingCart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ProductInfoProps {
  product: GiftDetail | (Omit<GiftDetail, 'createdAt' | 'updatedAt'> & { createdAt: Date, updatedAt: Date });
  totalPrice: number;
  customizationCost: number;
  selectedCustomizations: SelectedCustomization;
}

export function ProductInfo({ product, totalPrice, customizationCost, selectedCustomizations }: ProductInfoProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    const cartProduct = {
      ...(product as unknown as Gift),
      price: totalPrice,
      customizations: selectedCustomizations,
    };
    addToCart(cartProduct, 1);
    toast({
      title: "¡Añadido al carrito!",
      description: `${product.name} se ha añadido a tu carrito.`,
    });
  };

  return (
    <>
      <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">{product.name}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{product.description}</p>
      
      <div className="mt-6">
        <p className="text-4xl font-bold text-primary">S/{totalPrice.toFixed(2)}</p>
        {customizationCost > 0 && (
            <p className="text-sm text-muted-foreground">
                Precio base: S/{product.price.toFixed(2)} + S/{customizationCost.toFixed(2)} en personalización
            </p>
        )}
      </div>

      <Separator className="my-8" />
      
      <div className="mt-4">
        <Button
            onClick={handleAddToCart}
            size="lg"
            className="w-full text-lg py-7"
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Añadir al carrito
        </Button>
      </div>

       <div className="mt-6 text-sm text-muted-foreground">
            <p><span className="font-semibold">Categoría:</span> {product.category || 'General'}</p>
            {product.themes && product.themes.length > 0 && <p><span className="font-semibold">Temáticas:</span> {product.themes.join(', ')}</p>}
       </div>
    </>
  );
}
