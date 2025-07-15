// src/app/sales/calculator/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Trash2, XCircle, Percent } from 'lucide-react';
import Image from 'next/image';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Product } from '@/types/firestore';
import { useToast } from '@/hooks/use-toast';

export interface CalculatorCartItem extends Product {
  quantity: number;
}

export default function SalesCalculatorPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CalculatorCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

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
    setDiscountPercent(0);
  };

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const discountAmount = useMemo(() => (subtotal * discountPercent) / 100, [subtotal, discountPercent]);
  const total = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);
  
  const canApplyDiscount = subtotal >= 100;

  useEffect(() => {
    if (!canApplyDiscount) {
        setDiscountPercent(0);
    }
  }, [canApplyDiscount]);

  return (
    <div className="flex flex-col h-full md:h-[calc(100vh-5rem)]">
        <header className="mb-4">
            <h1 className="text-3xl font-bold">Calculadora de Precios para Regalos</h1>
            <p className="text-muted-foreground">
                Simula el costo de un regalo personalizado seleccionando productos.
            </p>
        </header>

        <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-12 gap-6">
            {/* Product Selection */}
            <div className="md:col-span-7 lg:col-span-8 flex flex-col min-h-[300px] md:min-h-0">
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
                                        <Image src={product.images[0] || 'https://placehold.co/150x150.png'} alt={product.name} width={150} height={150} className="w-full h-24 object-cover" data-ai-hint="product image" />
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

            {/* Calculator Section */}
            <div className="md:col-span-5 lg:col-span-4 flex flex-col min-h-0">
                <Card className="flex-1 flex flex-col">
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Regalo Actual</CardTitle>
                        <Button variant="ghost" size="sm" onClick={clearCart} disabled={cart.length === 0}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Limpiar
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-2 min-h-0">
                      <ScrollArea className="h-full">
                            <div className="space-y-2 p-2">
                                {cart.length === 0 ? (
                                    <div className="h-full flex items-center justify-center">
                                      <p className="text-center text-muted-foreground p-10">Selecciona productos para empezar a calcular.</p>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                      <div key={item.id} className="flex items-center gap-2">
                                          <Image src={item.images[0]} alt={item.name} width={40} height={40} className="rounded-md object-cover flex-shrink-0" data-ai-hint="product image" />
                                          <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium truncate">{item.name}</p>
                                              <p className="text-xs text-muted-foreground">S/{item.price.toFixed(2)}</p>
                                          </div>
                                          <Input 
                                              type="number" 
                                              value={item.quantity}
                                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                              className="w-16 h-8 text-center flex-shrink-0"
                                          />
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive flex-shrink-0" onClick={() => removeFromCart(item.id)}>
                                              <Trash2 className="h-4 w-4" />
                                          </Button>
                                      </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <Separator />
                    <CardFooter className="flex-col p-4 space-y-4">
                        <div className="w-full space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>S/{subtotal.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between items-center text-destructive">
                                <span className="text-sm">Descuento ({discountPercent}%)</span>
                                <span>- S/{discountAmount.toFixed(2)}</span>
                            </div>
                             <div className="w-full space-y-2 pt-2">
                                <Label htmlFor="discount" className={cn("flex items-center gap-2", !canApplyDiscount && "text-muted-foreground")}>
                                    <Percent className="h-4 w-4" /> Aplicar Descuento
                                </Label>
                                <Slider
                                    id="discount"
                                    min={0}
                                    max={10}
                                    step={1}
                                    value={[discountPercent]}
                                    onValueChange={(value) => setDiscountPercent(value[0])}
                                    disabled={!canApplyDiscount}
                                />
                                {!canApplyDiscount && <p className="text-xs text-center text-muted-foreground">El descuento se activa para compras mayores a S/100.</p>}
                            </div>
                        </div>
                        <div className="w-full flex justify-between text-xl font-bold pt-4 border-t">
                            <span>Total Estimado</span>
                            <span>S/{total.toFixed(2)}</span>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  );
}
