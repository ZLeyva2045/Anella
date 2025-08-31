
// src/components/anella/ProductSuggestion.tsx
import Image from 'next/image';
import { Button } from '../ui/button';
import Link from 'next/link';

interface ProductSuggestionProps {
  p: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

export default function ProductSuggestion({ p }: ProductSuggestionProps) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-lg p-2 shadow-sm border">
      <Image 
        src={p.images[0] || 'https://placehold.co/100x100.png'} 
        alt={p.name}
        width={64}
        height={64}
        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <Link href={`/products/${p.id}`} target="_blank" rel="noreferrer" className="font-semibold text-sm leading-tight hover:underline line-clamp-2">
            {p.name}
        </Link>
        <div className="text-sm font-bold text-primary mt-1">S/ {p.price.toFixed(2)}</div>
      </div>
       <div className="flex flex-col gap-1">
          <Button asChild size="sm" className="h-7 px-2 text-xs">
            <Link href={`/products/${p.id}`} target="_blank">Ver</Link>
          </Button>
      </div>
    </div>
  );
}
