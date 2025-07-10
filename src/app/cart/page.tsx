// src/app/cart/page.tsx
'use client';

import React from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/anella/Header';
import { Footer } from '@/components/anella/Footer';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function ProgressStepper() {
  const steps = ["Carrito", "Información", "Pago", "Confirmación"];
  const currentStep = 1;

  return (
    <div className="w-full mb-12">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  index < currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </div>
              <p className={`mt-2 text-sm font-semibold ${index < currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
                {step}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-grow h-1 mx-4 ${index < currentStep - 1 ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}


export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartCount, totalPrice } = useCart();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <ProgressStepper />
        <h1 className="text-3xl font-bold mb-8">Tu Carrito de Compras</h1>

        {cartCount > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <Card key={item.id} className="flex items-center p-4">
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="rounded-md object-cover"
                  />
                  <div className="ml-4 flex-grow">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-muted-foreground text-sm">S/{item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="ml-4 font-bold text-lg w-24 text-right">
                    S/{(item.price * item.quantity).toFixed(2)}
                  </div>
                  <Button variant="ghost" size="icon" className="ml-4" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </Card>
              ))}
            </div>

            <aside className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>S/{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>Por calcular</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>S/{totalPrice.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                   <Button size="lg" className="w-full">
                    Continuar al Pago
                  </Button>
                   <Button variant="link" asChild>
                    <Link href="/products">Seguir comprando</Link>
                   </Button>
                </CardFooter>
              </Card>
            </aside>
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingCart className="mx-auto h-24 w-24 text-muted-foreground" />
            <h2 className="mt-6 text-2xl font-bold">Tu carrito está vacío</h2>
            <p className="mt-2 text-muted-foreground">
              Parece que aún no has añadido ningún producto.
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
