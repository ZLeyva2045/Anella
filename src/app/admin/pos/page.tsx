// src/app/admin/pos/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { Loader2, PlusCircle, Search, Trash2, XCircle, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Product, User } from '@/types/firestore';
import { useToast } from '@/hooks/use-toast';
import { CustomerForm } from '@/components/shared/CustomerForm';

interface PosCartItem extends Product {
  quantity: number;
}

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, searchQuery]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart => cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart => cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const igv = useMemo(() => subtotal * 0.18, [subtotal]);
  const total = useMemo(() => subtotal + igv, [subtotal, igv]);

  const handleCompleteSale = () => {
    // In a real app, this would integrate with a payment gateway,
    // create an order in Firestore, and update stock.
    toast({
      title: 'Venta Completada',
      description: `Venta por un total de S/${total.toFixed(2)} registrada.`,
    });
    clearCart();
  };

  return (
    <>
      <div className="h-[calc(100vh-5rem)] flex flex-col">
          <header className="mb-4">
              <h1 className="text-3xl font-bold">Punto de Venta (POS)</h1>
              <p className="text-muted-foreground">
                  Gestiona las ventas en la tienda física.
              </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
              {/* Product Selection */}
              <div className="lg:col-span-2 flex flex-col min-h-0">
                  <Card className="flex-1 flex flex-col">
                      <CardHeader>
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                  placeholder="Buscar productos..."
                                  className="pl-9"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                              />
                          </div>
                      </CardHeader>
                      <CardContent className="flex-1 p-4 min-h-0">
                          {loading ? (
                              <div className="flex justify-center items-center h-full">
                                  <Loader2 className="h-8 w-8 animate-spin" />
                              </div>
                          ) : (
                          <ScrollArea className="h-full">
                              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                  {filteredProducts.map(product => (
                                      <Card key={product.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => addToCart(product)}>
                                          <Image src={product.images[0]} alt={product.name} width={150} height={150} className="w-full h-24 object-cover" />
                                          <div className="p-2">
                                              <h4 className="text-sm font-semibold truncate">{product.name}</h4>
                                              <p className="text-xs text-primary font-bold">S/{product.price.toFixed(2)}</p>
                                          </div>
                                      </Card>
                                  ))}
                              </div>
                          </ScrollArea>
                          )}
                      </CardContent>
                  </Card>
              </div>

              {/* Cart Section */}
              <div className="lg:col-span-1 flex flex-col min-h-0">
                  <Card className="flex-1 flex flex-col">
                      <CardHeader className="flex-row items-center justify-between">
                          <CardTitle>Venta Actual</CardTitle>
                          <Button variant="ghost" size="sm" onClick={clearCart} disabled={cart.length === 0}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Limpiar
                          </Button>
                      </CardHeader>
                      <CardContent className="flex-1 p-2 min-h-0">
                        <div className="px-2 pb-2">
                           <Button variant="outline" className="w-full" onClick={() => setIsCustomerFormOpen(true)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Añadir / Buscar Cliente
                          </Button>
                        </div>
                        <Separator className="mb-2"/>
                        <ScrollArea className="h-full">
                              <div className="space-y-2 p-2">
                                  {cart.length === 0 ? (
                                      <p className="text-center text-muted-foreground py-10">Añade productos para empezar una venta.</p>
                                  ) : (
                                      cart.map(item => (
                                          <div key={item.id} className="flex items-center gap-2">
                                              <Image src={item.images[0]} alt={item.name} width={40} height={40} className="rounded-md object-cover" />
                                              <div className="flex-1">
                                                  <p className="text-sm font-medium truncate">{item.name}</p>
                                                  <p className="text-xs text-muted-foreground">S/{item.price.toFixed(2)}</p>
                                              </div>
                                              <Input 
                                                  type="number" 
                                                  value={item.quantity}
                                                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                  className="w-16 h-8 text-center"
                                              />
                                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeFromCart(item.id)}>
                                                  <Trash2 className="h-4 w-4" />
                                              </Button>
                                          </div>
                                      ))
                                  )}
                              </div>
                          </ScrollArea>
                      </CardContent>
                      <Separator />
                      <CardFooter className="flex-col p-4 space-y-2">
                          <div className="w-full flex justify-between text-sm"><span>Subtotal</span><span>S/{subtotal.toFixed(2)}</span></div>
                          <div className="w-full flex justify-between text-sm"><span>IGV (18%)</span><span>S/{igv.toFixed(2)}</span></div>
                          <div className="w-full flex justify-between text-lg font-bold pt-2 border-t"><span>Total</span><span>S/{total.toFixed(2)}</span></div>
                          <Button size="lg" className="w-full mt-2" disabled={cart.length === 0} onClick={handleCompleteSale}>
                              <PlusCircle className="mr-2" />
                              Completar Venta
                          </Button>
                      </CardFooter>
                  </Card>
              </div>
          </div>
      </div>
      <CustomerForm
        isOpen={isCustomerFormOpen}
        setIsOpen={setIsCustomerFormOpen}
      />
    </>
  );
}
