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
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;
  
    if (activeTheme?.backgroundUrl) {
      appContainer.classList.add('themed-background');
      appContainer.style.setProperty('--page-background-image', `url(${activeTheme.backgroundUrl})`);
    } else {
      appContainer.classList.remove('themed-background');
      appContainer.style.removeProperty('--page-background-image');
    }
  
    return () => {
      // Solo limpiar si se había aplicado
      if (activeTheme?.backgroundUrl && appContainer) {
        appContainer.classList.remove('themed-background');
        appContainer.style.removeProperty('--page-background-image');
      }
    };
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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-1 px-10 py-8 gap-8">
          <aside className="w-72 flex-shrink-0">
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
          <div className="flex-1">
             <Toolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              productCount={filteredGifts.length}
            />
            <ProductGrid gifts={filteredGifts} loading={loading} />
          </div>
        </main>
      <Footer />
    </div>
  );
}
