// src/app/products/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { Header } from '@/components/anella/Header';
import { Footer } from '@/components/anella/Footer';
import { ProductDetail, mockProductDetails } from '@/lib/mock-data';
import { ProductImages } from '@/components/products/detail/ProductImages';
import { ProductInfo } from '@/components/products/detail/ProductInfo';
import { CustomizationOptions } from '@/components/products/detail/CustomizationOptions';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Access params.id only inside the effect
    const fetchedProduct = mockProductDetails.find(p => p.id === params.id);
    
    // Set a timeout to simulate network latency
    const timer = setTimeout(() => {
        if (fetchedProduct) {
            setProduct(fetchedProduct);
        }
        setLoading(false);
    }, 500); // 0.5 second delay

    return () => clearTimeout(timer);
  }, [params]); // Depend on the entire params object

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
            <ProductInfo product={product} />
            {product.isPersonalizable && <CustomizationOptions options={product.customizationOptions} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
