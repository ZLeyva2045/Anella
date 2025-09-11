// src/app/products/[id]/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Header } from '@/components/anella/Header';
import { Footer } from '@/components/anella/Footer';
import { GiftDetail, getGiftDetails, CustomizationOption } from '@/lib/mock-data';
import { ProductImages } from '@/components/products/detail/ProductImages';
import { ProductInfo } from '@/components/products/detail/ProductInfo';
import { CustomizationOptions } from '@/components/products/detail/CustomizationOptions';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ProductCard } from '@/components/products/ProductCard';

export interface SelectedCustomization {
  [key: string]: {
    label: string;
    value: string;
    price: number;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const [gift, setGift] = useState<GiftDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization>({});

  const id = params?.id as string;

  useEffect(() => {
    if (id) {
        const fetchGift = async () => {
            setLoading(true);
            const fetchedGift = await getGiftDetails(id);
            if (fetchedGift) {
                setGift(fetchedGift);
            }
            setLoading(false);
        };
        fetchGift();
    } else {
        setLoading(false);
    }
  }, [id]);

  const customizationCost = useMemo(() => {
    return Object.values(selectedCustomizations).reduce((acc, curr) => acc + curr.price, 0);
  }, [selectedCustomizations]);

  const totalPrice = useMemo(() => {
    if (!gift) return 0;
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

  if (loading) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    <div>
                        <Skeleton className="w-full aspect-square rounded-lg" />
                        <div className="flex gap-2 mt-2">
                           <Skeleton className="w-20 h-20 rounded-lg" />
                           <Skeleton className="w-20 h-20 rounded-lg" />
                           <Skeleton className="w-20 h-20 rounded-lg" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-12 w-full mt-4" />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
  }

  if (!gift) {
    return notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="px-40 flex flex-1 justify-center py-12">
        <div className="layout-content-container flex flex-col max-w-6xl w-full flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <ProductImages images={gift.images} productName={gift.name} />
            <div className="flex flex-col pt-16">
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
            <h3 className="text-3xl font-bold tracking-tight text-primary">Opiniones de Clientes</h3>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4 p-6 rounded-2xl neumorphic-shadow">
                <div className="flex items-center gap-4">
                  <Image src="https://i.pravatar.cc/150?img=1" alt="Sophia Bennett" width={48} height={48} className="rounded-full size-12" />
                  <div>
                    <p className="text-primary text-lg font-semibold">Sophia Bennett</p>
                    <p className="text-secondary text-sm">15 de mayo de 2024</p>
                  </div>
                </div>
                <div className="flex gap-1 text-[var(--primary-color)]">
                    <Star className="fill-current" />
                    <Star className="fill-current" />
                    <Star className="fill-current" />
                    <Star className="fill-current" />
                    <Star className="fill-current" />
                </div>
                <p className="text-primary text-base">¡Jarrón absolutamente hermoso! La artesanía es impecable y se ve aún mejor en persona. Es el centro de mesa perfecto para mi comedor.</p>
              </div>
              <div className="flex flex-col gap-4 p-6 rounded-2xl neumorphic-shadow">
                <div className="flex items-center gap-4">
                  <Image src="https://i.pravatar.cc/150?img=2" alt="Ethan Carter" width={48} height={48} className="rounded-full size-12" />
                  <div>
                    <p className="text-primary text-lg font-semibold">Ethan Carter</p>
                    <p className="text-secondary text-sm">22 de abril de 2024</p>
                  </div>
                </div>
                <div className="flex gap-1 text-[var(--primary-color)]">
                    <Star className="fill-current" />
                    <Star className="fill-current" />
                    <Star className="fill-current" />
                    <Star className="fill-current" />
                    <Star className="text-gray-300" />
                </div>
                <p className="text-primary text-base">Jarrón hermoso, aunque un poco más pequeño de lo esperado. Aun así, es una pieza encantadora y le da un toque único a mi sala.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-24">
            <h3 className="text-3xl font-bold tracking-tight text-primary">También te puede interesar</h3>
            {/* Related products would be dynamically rendered here */}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
