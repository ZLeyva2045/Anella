// src/components/products/ProductCard.tsx
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import type { Gift } from '@/types/firestore';
import { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
  gift: Gift;
}

export function ProductCard({ gift }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Logic to add to cart
    console.log(`Added ${gift.name} to cart`);
  }

  return (
    <div className="group flex flex-col gap-4 bg-[var(--background-surface)] rounded-2xl p-4 shadow-[8px_8px_20px_#EBDCCD,-8px_-8px_20px_#FFF] hover:-translate-y-2 transition-all duration-300">
        <div className="relative">
            <Link href={`/products/${gift.id}`}>
                <Image
                    alt={gift.name}
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl"
                    src={gift.images[0] || 'https://placehold.co/400x400.png'}
                    width={400}
                    height={400}
                />
            </Link>
            <button 
                onClick={toggleFavorite}
                className="absolute top-2 right-2 bg-[var(--warm-white)]/50 backdrop-blur-sm text-[var(--brand-pink)] rounded-full h-8 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : 'fill-none'}`} />
            </button>
        </div>
        <div className="flex flex-col gap-2">
            <p className="text-[var(--main-text)] text-base font-semibold leading-normal">{gift.name}</p>
            <p className="text-[var(--secondary-text)] text-sm font-normal leading-normal">S/{gift.price.toFixed(2)}</p>
            <div className="flex justify-center mt-2">
                <Button 
                    onClick={handleAddToCart}
                    className="bg-[var(--brand-pink)] hover:bg-[var(--brand-pink-hover)] text-[var(--warm-white)] font-bold py-2 px-4 rounded-lg shadow-[4px_4px_10px_#EBDCCD] transition-all duration-300"
                >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Agregar al carrito
                </Button>
            </div>
        </div>
    </div>
  );
}
