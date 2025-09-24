// src/components/products/detail/ProductDetailClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { ProductImages } from '@/components/products/detail/ProductImages';
import { ProductInfo } from '@/components/products/detail/ProductInfo';
import { CustomizationOptions } from '@/components/products/detail/CustomizationOptions';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import type { GiftDetail, CustomizationOption } from '@/lib/mock-data';

export interface SelectedCustomization {
  [key: string]: {
    label: string;
    value: string;
    price: number;
  };
}

// Accept either the original GiftDetail or one where Timestamps have been converted to serializable strings.
interface ProductDetailClientProps {
    gift: Omit<GiftDetail, 'createdAt' | 'updatedAt'> & { createdAt: string, updatedAt: string };
}

export function ProductDetailClient({ gift }: ProductDetailClientProps) {
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization>({});

  const customizationCost = useMemo(() => {
    return Object.values(selectedCustomizations).reduce((acc, curr) => acc + curr.price, 0);
  }, [selectedCustomizations]);

  const totalPrice = useMemo(() => {
    return gift.price + customizationCost;
  }, [gift, customizationCost]);

  const handleCustomizationChange = (option: CustomizationOption, value: string) => {
    setSelectedCustomizations(prev => {
      const newCustomizations = { ...prev };
      let price = 0;

      if (option.type === 'text' || option.type === 'textarea' || option.type === 'image') {
        if (value.trim() !== '') {
          price = option.priceModifier ?? 0;
        }
      } else if (option.type === 'radio' && option.choices) {
        const choice = option.choices.find(c => c.name === value);
        price = choice?.priceModifier ?? 0;
      }

      if (value.trim() === '' && newCustomizations[option.id]) {
        delete newCustomizations[option.id];
      } else {
        newCustomizations[option.id] = { label: option.label, value, price };
      }
      
      return newCustomizations;
    });
  };

  return (
    <main className="flex flex-1 justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          <ProductImages images={gift.images} productName={gift.name} />
          <div className="flex flex-col pt-8">
            <ProductInfo 
              product={gift}
              totalPrice={totalPrice}
              customizationCost={customizationCost}
              selectedCustomizations={selectedCustomizations}
            />
            {gift.isPersonalizable && (
              <CustomizationOptions
                options={gift.customizationOptions}
                onCustomizationChange={handleCustomizationChange}
              />
            )}
          </div>
        </div>
        
        <div className="mt-24">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">Opiniones de Clientes</h3>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-card border">
              <div className="flex items-center gap-4">
                <Image src="https://i.pravatar.cc/150?img=1" alt="Sophia Bennett" width={48} height={48} className="rounded-full size-12" />
                <div>
                  <p className="text-foreground text-md font-semibold">Sophia Bennett</p>
                  <p className="text-muted-foreground text-sm">15 de mayo de 2024</p>
                </div>
              </div>
              <div className="flex gap-1 text-yellow-400">
                  <Star className="fill-current h-5 w-5" />
                  <Star className="fill-current h-5 w-5" />
                  <Star className="fill-current h-5 w-5" />
                  <Star className="fill-current h-5 w-5" />
                  <Star className="fill-current h-5 w-5" />
              </div>
              <p className="text-muted-foreground text-base">¡Jarrón absolutamente hermoso! La artesanía es impecable y se ve aún mejor en persona. Es el centro de mesa perfecto para mi comedor.</p>
            </div>
            <div className="flex flex-col gap-4 p-6 rounded-2xl bg-card border">
              <div className="flex items-center gap-4">
                <Image src="https://i.pravatar.cc/150?img=2" alt="Ethan Carter" width={48} height={48} className="rounded-full size-12" />
                <div>
                  <p className="text-foreground text-md font-semibold">Ethan Carter</p>
                  <p className="text-muted-foreground text-sm">22 de abril de 2024</p>
                </div>
              </div>
              <div className="flex gap-1 text-yellow-400">
                  <Star className="fill-current h-5 w-5" />
                  <Star className="fill-current h-5 w-5" />
                  <Star className="fill-current h-5 w-5" />
                  <Star className="fill-current h-5 w-5" />
                  <Star className="text-gray-300 h-5 w-5" />
              </div>
              <p className="text-muted-foreground text-base">Jarrón hermoso, aunque un poco más pequeño de lo esperado. Aun así, es una pieza encantadora y le da un toque único a mi sala.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-24">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">También te puede interesar</h3>
          {/* Related products would be dynamically rendered here */}
        </div>
      </div>
    </main>
  );
}
