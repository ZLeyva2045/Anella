// src/app/admin/pos/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, ArrowLeft, Trash2, PlusCircle, ClipboardCheck, XCircle } from 'lucide-react';
import Image from 'next/image';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Product, Category, Subcategory } from '@/types/firestore';
import { useToast } from '@/hooks/use-toast';
import { CompleteSaleDialog } from '@/components/shared/CompleteSaleDialog';
import { cn } from '@/lib/utils';

export interface PosCartItem extends Product {
  quantity: number;
}

type ViewState = 'categories' | 'subcategories' | 'products';

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<Subcategory[]>([]);
  
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [viewState, setViewState] = useState<ViewState>('categories');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<Subcategory | null>(null);
  
  const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData.filter(p => p.productType !== 'Servicios' && p.stock > 0));
    });
    
    const unsubCategories = onSnapshot(collection(db, 'categories'), async (snapshot) => {
        const cats = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Category)).sort((a,b) => (a.order || 99) - (b.order || 99));
        setCategories(cats);
        
        // Fetch all subcategories for search
        const subcatPromises = cats.map(cat => getDocs(collection(db, 'categories', cat.id, 'subcategories')));
        const subcatSnapshots = await Promise.all(subcatPromises);
        const allSubs = subcatSnapshots.flatMap(snap => snap.docs.map(doc => ({...doc.data(), id: doc.id, categoryId: doc.ref.parent.parent?.id} as Subcategory)));
        setAllSubcategories(allSubs);

        setLoading(false);
    });

    return () => {
        unsubProducts();
        unsubCategories();
    };
  }, []);
  
  const currentSubcategories = useMemo(() => {
      if (!activeCategory) return [];
      return allSubcategories.filter(sub => sub.categoryId === activeCategory.id).sort((a, b) => (a.order || 99) - (b.order || 99));
  }, [activeCategory, allSubcategories]);


  const searchResults = useMemo(() => {
    if (!searchQuery) return { categories: [], subcategories: [], products: [] };
    const q = searchQuery.toLowerCase();
    const foundProducts = products.filter(p => p.name.toLowerCase().includes(q));
    const foundCategories = categories.filter(c => c.name.toLowerCase().includes(q));
    const foundSubcategories = allSubcategories.filter(s => s.name.toLowerCase().includes(q));

    return { categories: foundCategories, subcategories: foundSubcategories, products: foundProducts };
  }, [searchQuery, products, categories, allSubcategories]);


  const handleSelectCategory = (category: Category) => {
    setActiveCategory(category);
    const subs = allSubcategories.filter(s => s.categoryId === category.id);
    if (subs.length > 0) {
        setViewState('subcategories');
    } else {
        setViewState('products');
    }
  };
  
  const handleSelectSubcategory = (subcategory: Subcategory) => {
    setActiveSubcategory(subcategory);
    setViewState('products');
  };

  const handleBack = () => {
    setActiveSubcategory(null);
    if (viewState === 'products') {
      if (currentSubcategories.length > 0) {
          setViewState('subcategories');
      } else {
          setActiveCategory(null);
          setViewState('categories');
      }
    } else if (viewState === 'subcategories') {
      setActiveCategory(null);
      setViewState('categories');
    }
  }

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return prevCart.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
            toast({ variant: 'destructive', title: 'Stock máximo alcanzado', description: `No hay más stock disponible para ${product.name}.` });
            return prevCart;
        }
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart => cart.map(item => {
        if(item.id === productId) {
          const quantity = Math.min(newQuantity, item.stock);
          return { ...item, quantity };
        }
        return item;
      })
    );
  };
  
  const removeFromCart = (productId: string) => {
    setCart(cart => cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setActiveCategory(null);
    setActiveSubcategory(null);
    setViewState('categories');
  }

  const total = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);

  const handleCreateOrder = () => {
    if (cart.length === 0) {
      toast({ variant: "destructive", title: "El carrito está vacío" });
      return;
    }
    localStorage.setItem('pendingOrderCart', JSON.stringify(cart));
    router.push('/admin/orders/create');
  };

  const handleSaleSuccess = () => {
    clearCart();
    setIsSaleDialogOpen(false);
    toast({ title: 'Venta Completada', description: 'La venta ha sido registrada.' });
  }

  const getBreadcrumb = () => {
    if (searchQuery) return `Resultados para "${searchQuery}"`;
    if (activeSubcategory) return `${activeCategory?.name} > ${activeSubcategory.name}`;
    if (activeCategory) return activeCategory.name;
    return "Catálogo";
  }

  const renderContent = () => {
      if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-16 w-16 animate-spin" /></div>
      }

      if (searchQuery) {
         return (
            <div className="space-y-6">
                {searchResults.categories.length > 0 && (
                    <div>
                        <h3 className="font-bold text-lg mb-2">Categorías</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 animate-in fade-in-50">
                            {searchResults.categories.map(cat => (
                                <button key={cat.id} onClick={() => {setSearchQuery(''); handleSelectCategory(cat);}} className="group relative flex flex-col items-center justify-center rounded-full aspect-square overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl" style={{backgroundImage: `linear-gradient(0deg, rgba(20, 20, 20, 0.4) 0%, rgba(20, 20, 20, 0.4) 100%), url(${cat.imageUrl || 'https://placehold.co/200x200.png'})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                                    <p className="text-white text-base font-bold leading-tight w-[80%] text-center line-clamp-2 z-10">{cat.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {searchResults.subcategories.length > 0 && (
                    <div>
                        <h3 className="font-bold text-lg mb-2">Subcategorías</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 animate-in fade-in-50">
                            {searchResults.subcategories.map(sub => (
                                <button key={sub.id} onClick={() => {setSearchQuery(''); handleSelectCategory(categories.find(c => c.id === sub.categoryId)!); handleSelectSubcategory(sub);}} className="group relative flex flex-col items-center justify-center rounded-full aspect-square overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl" style={{backgroundImage: `linear-gradient(0deg, rgba(20, 20, 20, 0.4) 0%, rgba(20, 20, 20, 0.4) 100%), url(${sub.imageUrl || 'https://placehold.co/200x200.png'})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                                    <p className="text-white text-base font-bold leading-tight w-[80%] text-center line-clamp-2 z-10">{sub.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                 {searchResults.products.length > 0 && (
                    <div>
                        <h3 className="font-bold text-lg mb-2">Productos</h3>
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 animate-in fade-in-50">
                            {searchResults.products.map(product => (
                                <Card key={product.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group" onClick={() => addToCart(product)}>
                                    <Image src={product.images[0] || 'https://placehold.co/150x150.png'} alt={product.name} width={150} height={150} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" data-ai-hint="product image" />
                                    <div className="p-3">
                                        <h4 className="text-sm font-semibold truncate">{product.name}</h4>
                                        <p className="text-xs text-primary font-bold">S/{product.price.toFixed(2)}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                 )}
                 {searchResults.products.length === 0 && searchResults.categories.length === 0 && searchResults.subcategories.length === 0 && (
                    <p className="text-center text-muted-foreground pt-10">No se encontraron resultados para "{searchQuery}".</p>
                 )}
            </div>
         )
      }

      if(viewState === 'products') {
        const displayedProducts = products.filter(p => activeSubcategory ? p.subcategoryId === activeSubcategory.id : p.categoryId === activeCategory?.id);
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 animate-in fade-in-50">
                {displayedProducts.map(product => (
                    <Card key={product.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group" onClick={() => addToCart(product)}>
                        <Image src={product.images[0] || 'https://placehold.co/150x150.png'} alt={product.name} width={150} height={150} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" data-ai-hint="product image" />
                        <div className="p-3">
                            <h4 className="text-sm font-semibold truncate">{product.name}</h4>
                            <p className="text-xs text-primary font-bold">S/{product.price.toFixed(2)}</p>
                        </div>
                    </Card>
                ))}
                 {displayedProducts.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground pt-10">
                        No hay productos en esta categoría.
                    </div>
                )}
            </div>
         )
      }

      const itemsToShow = viewState === 'categories' ? categories : currentSubcategories;
      const handleItemClick = viewState === 'categories' ? handleSelectCategory : handleSelectSubcategory;

      return (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 animate-in fade-in-50">
              {itemsToShow.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => handleItemClick(item as any)} 
                    className="group relative flex flex-col items-center justify-center rounded-full aspect-square overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    style={{ 
                      backgroundImage: `linear-gradient(0deg, rgba(20, 20, 20, 0.4) 0%, rgba(20, 20, 20, 0.4) 100%), url(${item.imageUrl || 'https://placehold.co/200x200.png'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                      <p className="text-white text-base font-bold leading-tight w-[80%] text-center line-clamp-2 z-10">{item.name}</p>
                  </button>
              ))}
          </div>
      );
  }

  return (
    <>
    <div className="flex flex-col md:grid md:grid-cols-12 gap-6 h-full md:h-[calc(100vh-5rem)]">
      
      {/* Catalog Section */}
      <div className="md:col-span-7 lg:col-span-8 flex flex-col h-full">
         <header className="mb-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                 <div className="flex items-center gap-2">
                   {(viewState !== 'categories' || activeCategory) && !searchQuery && (
                        <Button variant="ghost" size="icon" onClick={handleBack} className="flex-shrink-0">
                            <ArrowLeft />
                        </Button>
                    )}
                   <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{getBreadcrumb()}</h1>
                 </div>
                 <div className="flex-1 min-w-[200px] sm:min-w-[250px] flex items-center justify-end">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar productos, categorías..." 
                            className="pl-9" 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6" onClick={clearSearch}>
                                <XCircle className="h-4 w-4"/>
                            </Button>
                        )}
                    </div>
                 </div>
              </div>
          </header>
          <main className="flex-1 min-h-0">
             <ScrollArea className="h-full pr-4">
                {renderContent()}
             </ScrollArea>
          </main>
      </div>

      {/* Cart Section */}
      <div className="md:col-span-5 lg:col-span-4 flex flex-col h-full">
         <Card className="flex-1 flex flex-col">
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Venta Actual</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearCart} disabled={cart.length === 0}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Limpiar
                </Button>
            </CardHeader>
            <CardContent className="flex-1 p-2 min-h-0">
                <ScrollArea className="h-full">
                    <div className="space-y-3 pr-2">
                        {cart.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-center text-muted-foreground p-10">
                                Añade productos para empezar una venta.
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <Image src={item.images[0] || 'https://placehold.co/64x64.png'} alt={item.name} width={48} height={48} className="rounded-md object-cover flex-shrink-0" data-ai-hint="product image" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">S/{item.price.toFixed(2)}</p>
                                    </div>
                                    <Input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))} className="w-16 h-8 text-center flex-shrink-0" />
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive flex-shrink-0" onClick={() => removeFromCart(item.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
             {cart.length > 0 && (
                <CardFooter className="flex-col p-4 border-t space-y-4">
                    <div className="w-full flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>S/{total.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full mt-2">
                    <Button size="lg" onClick={handleCreateOrder} variant="outline"><ClipboardCheck className="mr-2" />Crear Pedido</Button>
                    <Button size="lg" onClick={() => setIsSaleDialogOpen(true)}><PlusCircle className="mr-2" />Completar Venta</Button>
                    </div>
                </CardFooter>
            )}
        </Card>
      </div>
    </div>
      <CompleteSaleDialog
        isOpen={isSaleDialogOpen}
        setIsOpen={setIsSaleDialogOpen}
        cartItems={cart}
        totalAmount={total}
        onSaleSuccess={handleSaleSuccess}
      />
    </>
  );
}
