// src/components/products/detail/ProductImages.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProductImagesProps {
  images: string[];
  productName: string;
}

export function ProductImages({ images, productName }: ProductImagesProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col gap-4 sticky top-24">
      <Card className="overflow-hidden">
        <Image
          src={selectedImage}
          alt={`Vista principal de ${productName}`}
          width={600}
          height={600}
          className="w-full h-auto aspect-square object-cover transition-all duration-300"
          priority
        />
      </Card>
      <div className="grid grid-cols-5 gap-2">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(img)}
            className={cn(
              "rounded-lg overflow-hidden border-2 transition-all",
              selectedImage === img ? 'border-primary' : 'border-transparent hover:border-primary/50'
            )}
          >
            <Image
              src={img}
              alt={`Vista previa ${index + 1} de ${productName}`}
              width={100}
              height={100}
              className="w-full h-auto aspect-square object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}