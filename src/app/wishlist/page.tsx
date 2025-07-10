// src/app/wishlist/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/anella/Header';
import { Footer } from '@/components/anella/Footer';
import { ProductGrid } from '@/components/products/ProductGrid';
import { mockProducts } from '@/lib/mock-data';
import type { Product } from '@/types/firestore';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function WishlistPage() {
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // En una aplicación real, obtendríamos los IDs de los favoritos de la base de datos o localStorage
    // Por ahora, simularemos que algunos productos son favoritos.
    const favoriteIds = ['1', '4', '7']; // IDs de ejemplo
    const favs = mockProducts.filter(p => favoriteIds.includes(p.id));
    setFavoriteProducts(favs);
    setLoading(false);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight">Tu Lista de Deseos</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Los productos que has guardado para más tarde.
            </p>
        </div>

        {favoriteProducts.length > 0 ? (
          <ProductGrid products={favoriteProducts} loading={loading} />
        ) : (
          <div className="text-center py-20">
            <Heart className="mx-auto h-24 w-24 text-muted-foreground" />
            <h2 className="mt-6 text-2xl font-bold">Tu lista de deseos está vacía</h2>
            <p className="mt-2 text-muted-foreground">
              Haz clic en el corazón de los productos que te gustan para guardarlos aquí.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Explorar productos</Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
