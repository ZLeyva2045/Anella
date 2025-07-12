// src/app/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/anella/Header';
import { Footer } from '@/components/anella/Footer';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { Toolbar } from '@/components/products/Toolbar';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Product, Category, Theme } from '@/types/firestore';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number]>([500]);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    setLoading(true);
    // Solo mostramos productos que están marcados para la web
    const productsQuery = query(collection(db, 'products'), where('showInWebsite', '!=', false));
    const unsubProducts = onSnapshot(productsQuery, snapshot => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      setLoading(false);
    });
    const unsubCategories = onSnapshot(collection(db, 'categories'), snapshot => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
    });
    const unsubThemes = onSnapshot(collection(db, 'themes'), snapshot => {
      const thms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Theme));
      setThemes(thms);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubThemes();
    };
  }, []);


  useEffect(() => {
    let tempProducts = [...products];

    // Search filter
    if (searchQuery) {
      tempProducts = tempProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Category filter
    if (selectedCategories.length > 0) {
      tempProducts = tempProducts.filter(p => selectedCategories.includes(p.category));
    }
    
    // Theme filter
    if (selectedThemes.length > 0) {
        tempProducts = tempProducts.filter(p => p.themes && p.themes.some(theme => selectedThemes.includes(theme)));
    }

    // Price filter
    tempProducts = tempProducts.filter(p => p.price <= priceRange[0]);
    
    // Rating filter
    if (rating > 0) {
        tempProducts = tempProducts.filter(p => p.rating && p.rating >= rating);
    }

    // Sorting
    switch (sortOption) {
      case 'price-asc':
        tempProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        tempProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        // Firestore Timestamps need to be converted to Dates for sorting
        tempProducts.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.toDate().getTime() || 0;
            const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.toDate().getTime() || 0;
            return dateB - dateA;
        });
        break;
      case 'rating':
         tempProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    setFilteredProducts(tempProducts);
  }, [searchQuery, sortOption, products, selectedCategories, selectedThemes, priceRange, rating]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
             <ProductFilters
                categories={categories}
                themes={themes}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                selectedThemes={selectedThemes}
                setSelectedThemes={setSelectedThemes}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                rating={rating}
                setRating={setRating}
            />
          </aside>
          <div className="lg:col-span-3">
            <Toolbar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortOption={sortOption}
              setSortOption={setSortOption}
              productCount={filteredProducts.length}
            />
            <ProductGrid products={filteredProducts} loading={loading} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
