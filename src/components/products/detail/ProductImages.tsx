// src/components/products/detail/ProductImages.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ProductImagesProps {
  images: string[];
  productName: string;
}

export function ProductImages({ images, productName }: ProductImagesProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 p-4 text-sm">
        <Link className="text-secondary hover:text-primary" href="/">Inicio</Link>
        <span className="text-secondary">/</span>
        <Link className="text-primary font-medium" href="/products">Producto</Link>
      </div>
      <div className="grid grid-cols-2 grid-rows-2 gap-4 aspect-square">
        <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden neumorphic-shadow">
          <Image
            src={selectedImage}
            alt={`Vista principal de ${productName}`}
            width={600}
            height={600}
            className="w-full h-full object-cover transition-all duration-300"
            priority
          />
        </div>
        {images.slice(1, 3).map((img, index) => (
          <div key={index} className="rounded-2xl overflow-hidden neumorphic-shadow cursor-pointer" onClick={() => setSelectedImage(img)}>
            <Image
              src={img}
              alt={`Vista previa ${index + 2} de ${productName}`}
              width={300}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
