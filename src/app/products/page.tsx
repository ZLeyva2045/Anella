
// src/app/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/anella/Header';
import { Footer } from '@/components/anella/Footer';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { Toolbar } from '@/components/products/Toolbar';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Gift, Theme } from '@/types/firestore';
import { AnimatePresence, motion } from 'framer-motion';

export default function ProductsPage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [filteredGifts, setFilteredGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number]>([500]);
  const [rating, setRating] = useState(0);

  const activeTheme = themes.find(t => t.name === selectedThemes[0]);

  useEffect(() => {
    if (activeTheme?.backgroundUrl) {
      document.body.style.setProperty('--page-background-image', `url(${activeTheme.backgroundUrl})`);
      document.body.classList.add('bg-page-themed');
    } else {
      document.body.style.removeProperty('--page-background-image');
      document.body.classList.remove('bg-page-themed');
    }
    
    // Cleanup on component unmount
    return () => {
        document.body.style.removeProperty('--page-background-image');
        document.body.classList.remove('bg-page-themed');
    }
  }, [activeTheme]);

  useEffect(() => {
    setLoading(true);
    const giftsUnsub = onSnapshot(collection(db, 'gifts'), (snapshot) => {
      const giftsData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Gift))
        .filter((gift) => gift.showInWebsite !== false); // Filtramos aquí
      setGifts(giftsData);
      setLoading(false);
    });
    
    const themesUnsub = onSnapshot(collection(db, 'themes'), (snapshot) => {
      const themesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Theme));
      setThemes(themesData);
    });

    return () => {
      giftsUnsub();
      themesUnsub();
    };
  }, []);


  useEffect(() => {
    let tempGifts = [...gifts];

    // Search filter
    if (searchQuery) {
      tempGifts = tempGifts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    // Theme filter
    if (selectedThemes.length > 0) {
        tempGifts = tempGifts.filter(p => p.themes && p.themes.some(theme => selectedThemes.includes(theme)));
    }

    // Price filter
    tempGifts = tempGifts.filter(p => p.price <= priceRange[0]);
    
    // Rating filter
    if (rating > 0) {
        tempGifts = tempGifts.filter(p => p.rating && p.rating >= rating);
    }

    // Sorting
    switch (sortOption) {
      case 'price-asc':
        tempGifts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        tempGifts.sort((a, b) => b.price - b.price);
        break;
      case 'newest':
        tempGifts.sort((a, b) => {
            const dateA = (a.createdAt as any)?.toDate()?.getTime() || 0;
            const dateB = (b.createdAt as any)?.toDate()?.getTime() || 0;
            return dateB - dateA;
        });
        break;
      case 'rating':
         tempGifts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    setFilteredGifts(tempGifts);
  }, [searchQuery, sortOption, gifts, selectedThemes, priceRange, rating]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
             <ProductFilters
                themes={themes}
                selectedThemes={selectedThemes}
                setSelectedThemes={setSelectedThemes}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                rating={rating}
                setRating={setRating}
            />
          </aside>
          <div className="lg:col-span-3">
            <AnimatePresence>
                {activeTheme && (
                    <motion.div
                        key={activeTheme.id}
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="flex justify-center mb-12"
                    >
                        <img src={activeTheme.logoUrl} alt={`${activeTheme.name} Logo`} className="max-h-28" />
                    </motion.div>
                )}
            </AnimatePresence>
            <h2 className="text-3xl font-bold text-center text-foreground tracking-tight mb-12">Todos los Regalos</h2>
            <Toolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortOption={sortOption}
              setSortOption={setSortOption}
              productCount={filteredGifts.length}
            />
            <ProductGrid gifts={filteredGifts} loading={loading} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
