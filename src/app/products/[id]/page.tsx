// src/app/products/[id]/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import { Header } from '@/components/anella/Header';
import { Footer } from '@/components/anella/Footer';
import { ProductDetail, getProductDetails, CustomizationOption } from '@/lib/mock-data';
import { ProductImages } from '@/components/products/detail/ProductImages';
import { ProductInfo } from '@/components/products/detail/ProductInfo';
import { CustomizationOptions } from '@/components/products/detail/CustomizationOptions';
import { Skeleton } from '@/components/ui/skeleton';

export interface SelectedCustomization {
  [key: string]: {
    label: string;
    value: string;
    price: number;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomizations, setSelectedCustomizations] = useState<SelectedCustomization>({});

  const id = params?.id as string;

  useEffect(() => {
    if (id) {
        const fetchProduct = async () => {
            setLoading(true);
            const fetchedProduct = await getProductDetails(id);
            if (fetchedProduct) {
                setProduct(fetchedProduct);
            }
            setLoading(false);
        };
        fetchProduct();
    } else {
        setLoading(false);
    }
  }, [id]);

  const customizationCost = useMemo(() => {
    return Object.values(selectedCustomizations).reduce((acc, curr) => acc + curr.price, 0);
  }, [selectedCustomizations]);

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return product.price + customizationCost;
  }, [product, customizationCost]);

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
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-12">
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

  if (!product) {
    return notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          <ProductImages images={product.images} productName={product.name} />
          <div className="flex flex-col">
            <ProductInfo 
              product={product}
              totalPrice={totalPrice}
              customizationCost={customizationCost}
              selectedCustomizations={selectedCustomizations}
            />
            {product.isPersonalizable && (
              <CustomizationOptions
                options={product.customizationOptions}
                onCustomizationChange={handleCustomizationChange}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
