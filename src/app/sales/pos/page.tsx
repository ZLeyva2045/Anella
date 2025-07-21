// src/app/sales/pos/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, PlusCircle, Search, Trash2, XCircle, ClipboardCheck, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Product, Category, Subcategory } from '@/types/firestore';
import { useToast } from '@/hooks/use-toast';
import { CompleteSaleDialog } from '@/components/shared/CompleteSaleDialog';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PosCartItem extends Product {
  quantity: number;
}

const getIcon = (iconName?: string): React.ElementType => {
  if (iconName && (Icons as any)[iconName]) {
    return (Icons as any)[iconName];
  }
  return Icons.Package; // Default icon
};

type ViewState = 'categories' | 'subcategories' | 'products';

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  
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
    
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
        const cats = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Category)).sort((a,b) => (a.order || 99) - (b.order || 99));
        setCategories(cats);
        setLoading(false);
    });

    return () => {
        unsubProducts();
        unsubCategories();
    };
  }, []);
  
  useEffect(() => {
      if(activeCategory) {
          const unsubSubcategories = onSnapshot(collection(db, 'categories', activeCategory.id, 'subcategories'), (snapshot) => {
              const subs = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Subcategory)).sort((a,b) => (a.order || 99) - (b.order || 99));
              setSubcategories(subs);
          });
          return () => unsubSubcategories();
      }
  }, [activeCategory]);

  const displayedProducts = useMemo(() => {
    let filtered = products;

    if (activeSubcategory) {
        filtered = filtered.filter(p => p.subcategoryId === activeSubcategory.id);
    } else if (activeCategory) {
        filtered = filtered.filter(p => p.categoryId === activeCategory.id && !p.subcategoryId)
    }

    if (searchQuery) {
        return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    return filtered;
  }, [products, searchQuery, activeCategory, activeSubcategory]);
  
  const handleSelectCategory = (category: Category) => {
    setActiveCategory(category);
    const categorySubcategories = subcategories.filter(s => collection(db, 'categories', category.id, 'subcategories').path.includes(s.id));
    
    if (subcategories.length > 0) {
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
    setSearchQuery('');
    if (viewState === 'products') {
      if (subcategories.length > 0 && activeSubcategory) {
        setActiveSubcategory(null);
        setViewState('subcategories');
      } else {
        setActiveCategory(null);
        setViewState('categories');
      }
    } else if (viewState === 'subcategories') {
      setActiveCategory(null);
      setActiveSubcategory(null);
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

  const total = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);

  const handleCreateOrder = () => {
    if (cart.length === 0) {
      toast({ variant: "destructive", title: "El carrito está vacío" });
      return;
    }
    localStorage.setItem('pendingOrderCart', JSON.stringify(cart));
    router.push('/sales/orders/create');
  };

  const handleSaleSuccess = () => {
    clearCart();
    setIsSaleDialogOpen(false);
    toast({ title: 'Venta Completada', description: 'La venta ha sido registrada.' });
  }

  const renderContent = () => {
      if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>
      }

      if (searchQuery) {
         return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 p-4 animate-in fade-in-50">
                {displayedProducts.map(product => (
                    <Card key={product.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group" onClick={() => addToCart(product)}>
                        <Image src={product.images[0] || 'https://placehold.co/150x150.png'} alt={product.name} width={150} height={150} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" data-ai-hint="product image" />
                        <div className="p-2">
                            <h4 className="text-sm font-semibold truncate">{product.name}</h4>
                            <p className="text-xs text-primary font-bold">S/{product.price.toFixed(2)}</p>
                        </div>
                    </Card>
                ))}
            </div>
         )
      }

      switch (viewState) {
          case 'categories':
              return (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 p-4 animate-in fade-in-50">
                      {categories.map(cat => {
                          const Icon = getIcon(cat.icon);
                          return (
                              <button key={cat.id} onClick={() => handleSelectCategory(cat)} className="flex flex-col items-center justify-center gap-1 p-2 bg-primary text-primary-foreground rounded-lg h-24 hover:bg-primary/90 transition-all duration-200 aspect-square">
                                  <Icon className="w-8 h-8"/>
                                  <span className="text-sm font-semibold text-center leading-tight">{cat.name}</span>
                              </button>
                          );
                      })}
                  </div>
              );
          case 'subcategories':
               return (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 p-4 animate-in fade-in-50">
                      {subcategories.map(sub => {
                          const Icon = getIcon(sub.icon);
                          return (
                              <button key={sub.id} onClick={() => handleSelectSubcategory(sub)} className="flex flex-col items-center justify-center gap-1 p-2 bg-primary text-primary-foreground rounded-lg h-24 hover:bg-primary/90 transition-all duration-200 aspect-square">
                                  <Icon className="w-8 h-8"/>
                                  <span className="text-sm font-semibold text-center leading-tight">{sub.name}</span>
                              </button>
                          );
                      })}
                  </div>
              );
          case 'products':
               return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 p-4 animate-in fade-in-50">
                    {displayedProducts.map(product => (
                        <Card key={product.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group" onClick={() => addToCart(product)}>
                            <Image src={product.images[0] || 'https://placehold.co/150x150.png'} alt={product.name} width={150} height={150} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" data-ai-hint="product image" />
                            <div className="p-2">
                                <h4 className="text-sm font-semibold truncate">{product.name}</h4>
                                <p className="text-xs text-primary font-bold">S/{product.price.toFixed(2)}</p>
                            </div>
                        </Card>
                    ))}
                </div>
              );
          default:
              return null;
      }
  }


  return (
    <>
      <div className="flex flex-col h-full md:h-[calc(100vh-5rem)]">
          <header className="mb-4">
              <h1 className="text-3xl font-bold">Punto de Venta (POS)</h1>
              <p className="text-muted-foreground">
                  Gestiona las ventas en la tienda física de forma interactiva.
              </p>
          </header>

          <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-12 gap-6">
              <div className="md:col-span-7 lg:col-span-8 flex flex-col min-h-[300px] md:min-h-0">
                  <Card className="flex-1 flex flex-col">
                    <CardHeader className="p-4 border-b">
                         <div className="flex items-center gap-4">
                              {(viewState !== 'categories' || searchQuery) && (
                                <Button variant="ghost" size="icon" onClick={handleBack} className="flex-shrink-0">
                                    <ArrowLeft />
                                </Button>
                             )}
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Buscar productos..." 
                                    className="pl-9" 
                                    value={searchQuery} 
                                    onChange={(e) => setSearchQuery(e.target.value)} 
                                />
                            </div>
                         </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 min-h-0">
                         <ScrollArea className="h-full">
                           {renderContent()}
                         </ScrollArea>
                    </CardContent>
                  </Card>
              </div>

              <div className="md:col-span-5 lg:col-span-4 flex flex-col min-h-0">
                  <Card className="flex-1 flex flex-col">
                      <CardHeader className="flex-row items-center justify-between p-4">
                          <CardTitle>Venta Actual</CardTitle>
                          <Button variant="ghost" size="sm" onClick={clearCart} disabled={cart.length === 0}><XCircle className="mr-2 h-4 w-4" />Limpiar</Button>
                      </CardHeader>
                      <CardContent className="flex-1 p-2 min-h-0">
                        <ScrollArea className="h-full">
                              <div className="space-y-2 p-2">
                                  {cart.length === 0 ? (
                                      <div className="h-full flex items-center justify-center text-center text-muted-foreground p-10">Añade productos para empezar una venta.</div>
                                  ) : (
                                      cart.map(item => (
                                        <div key={item.id} className="flex items-center gap-2">
                                            <Image src={item.images[0] || 'https://placehold.co/40x40.png'} alt={item.name} width={40} height={40} className="rounded-md object-cover flex-shrink-0" data-ai-hint="product image" />
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
                      <CardFooter className="flex-col p-4 space-y-4 border-t">
                          <div className="w-full flex justify-between text-lg font-bold"><span>Total</span><span>S/{total.toFixed(2)}</span></div>
                          <div className="grid grid-cols-2 gap-2 w-full mt-2">
                             <Button size="lg" disabled={cart.length === 0} onClick={handleCreateOrder} variant="outline"><ClipboardCheck className="mr-2" />Crear Pedido</Button>
                              <Button size="lg" disabled={cart.length === 0} onClick={() => setIsSaleDialogOpen(true)}><PlusCircle className="mr-2" />Completar Venta</Button>
                          </div>
                      </CardFooter>
                  </Card>
              </div>
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
