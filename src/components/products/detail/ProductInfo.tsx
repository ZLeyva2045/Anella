// src/components/products/detail/ProductInfo.tsx
'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import type { GiftDetail } from '@/lib/mock-data';
import type { SelectedCustomization } from './ProductDetailClient';
import type { Gift } from '@/types/firestore';

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
    addToCart(cartProduct, 1); // Assuming quantity of 1 for now
    toast({
      title: "¡Añadido al carrito!",
      description: `${product.name} se ha añadido a tu carrito.`,
    });
  };

  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight text-primary">{product.name}</h1>
      <p className="mt-4 text-lg text-secondary">{product.description}</p>
      <div className="mt-8">
        <p className="text-4xl font-bold text-primary">S/{totalPrice.toFixed(2)}</p>
      </div>
      
      {/* This section will be replaced by CustomizationOptions */}
      <div className="mt-8 flex flex-col gap-4 p-6 rounded-2xl neumorphic-shadow-inset bg-[#fcfbfa]">
        <h3 className="text-lg font-bold text-primary">Detalles del Producto</h3>
        <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 text-base">
            <p className="font-medium text-secondary">Categoría</p>
            <p className="text-primary">{product.category || 'General'}</p>
            {customizationCost > 0 && (
                 <>
                    <p className="font-medium text-secondary">Personalización</p>
                    <p className="text-primary">+ S/{customizationCost.toFixed(2)}</p>
                 </>
            )}
        </div>
      </div>

      <div className="mt-10">
        <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center rounded-xl py-4 px-8 text-lg font-bold text-white bg-[var(--brand-pink)] hover:opacity-90 transition-opacity neumorphic-shadow"
        >
          Añadir al carrito
        </button>
      </div>
    </>
  );
}
