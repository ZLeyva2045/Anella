// src/components/products/detail/ProductImages.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface ProductImagesProps {
  images: string[];
  productName: string;
}

export function ProductImages({ images, productName }: ProductImagesProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        <Link className="hover:text-primary" href="/">Inicio</Link>
        <ChevronRight className="h-4 w-4" />
        <Link className="hover:text-primary" href="/products">Regalos</Link>
         <ChevronRight className="h-4 w-4" />
        <span className="text-primary font-medium line-clamp-1">{productName}</span>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="rounded-2xl overflow-hidden border shadow-sm">
          <Image
            src={selectedImage}
            alt={`Vista principal de ${productName}`}
            width={600}
            height={600}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            priority
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
            {images.map((img, index) => (
                <button 
                    key={index} 
                    className={cn(
                        "rounded-lg overflow-hidden border-2 transition-all",
                        selectedImage === img ? 'border-primary shadow-md' : 'border-transparent hover:border-primary/50'
                    )}
                    onClick={() => setSelectedImage(img)}
                >
                    <Image
                    src={img}
                    alt={`Vista previa ${index + 1} de ${productName}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover aspect-square"
                    />
                </button>
            ))}
        </div>
      </div>
    </div>
  );
}
