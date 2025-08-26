// src/app/wishlist/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/anella/Header';
import { Footer } from '@/components/anella/Footer';
import { ProductGrid } from '@/components/products/ProductGrid';
import type { Gift } from '@/types/firestore';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';


export default function WishlistPage() {
  const [favoriteProducts, setFavoriteProducts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // En una aplicación real, obtendríamos los IDs de los favoritos de la base de datos o localStorage
    // Por ahora, simularemos que los primeros 3 productos son favoritos.
    const unsub = onSnapshot(collection(db, 'gifts'), (snapshot) => {
        const allGifts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gift));
        const favs = allGifts.slice(0, 3); // Simulamos favoritos
        setFavoriteProducts(favs);
        setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight">Tu Lista de Deseos</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Los regalos que has guardado para más tarde.
            </p>
        </div>

        {loading ? (
           <ProductGrid gifts={[]} loading={true} />
        ) : favoriteProducts.length > 0 ? (
          <ProductGrid gifts={favoriteProducts} loading={false} />
        ) : (
          <div className="text-center py-20">
            <Heart className="mx-auto h-24 w-24 text-muted-foreground" />
            <h2 className="mt-6 text-2xl font-bold">Tu lista de deseos está vacía</h2>
            <p className="mt-2 text-muted-foreground">
              Haz clic en el corazón de los regalos que te gustan para guardarlos aquí.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Explorar regalos</Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
