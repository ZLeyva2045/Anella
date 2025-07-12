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
  
  const handleWhatsAppOrder = () => {
    let header = "¡Hola Anella! 👋 Quiero hacer un pedido:\n\n";
    
    const productLines = cartItems.map(item => {
      let productMessage = `*${item.name}* (x${item.quantity}) - S/${(item.price * item.quantity).toFixed(2)}`;
      if (item.customizations && Object.keys(item.customizations).length > 0) {
        const customizationDetails = Object.values(item.customizations)
          .map(cust => `  - ${cust.label.split('(')[0].trim()}: ${cust.value}`)
          .join("\n");
        productMessage += `\n_Personalización:_\n${customizationDetails}`;
      }
      return productMessage;
    }).join("\n\n");

    const footer = `\n\n*Total:* S/${totalPrice.toFixed(2)}\n\n_Espero su pronta respuesta para coordinar los detalles y el pago._`;
    
    const message = encodeURIComponent(header + productLines + footer);
    const phoneNumber = "51987771610"; // Número de Anella
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
  };

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
                <Card key={item.cartItemId} className="flex items-center p-4">
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
                     {item.customizations && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {Object.values(item.customizations).map(cust => (
                          <div key={cust.label}>- {cust.value}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="ml-4 font-bold text-lg w-24 text-right">
                    S/{(item.price * item.quantity).toFixed(2)}
                  </div>
                  <Button variant="ghost" size="icon" className="ml-4" onClick={() => removeFromCart(item.cartItemId)}>
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
                   <Button size="lg" className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={handleWhatsAppOrder}>
                    <svg className="w-5 h-5 mr-2" role="img" viewBox="0 0 24 24"><path fill="currentColor" d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-1.07-.26-2.22-1.02-.93-.6-1.6-1.24-2.21-2.04-.18-.23-.37-.47-.55-.71-.57-.75-1.12-1.64-1.15-1.71-.03-.07-.03-.12 0-.18.08-.13.24-.18.39-.23.15-.05.28-.05.41-.03.18.02.35.03.5.18.15.15.24.36.24.51s.05.32 0 .51c-.05.18-.13.39-.24.54-.12.15-.2.24-.28.36.08.13.21.27.36.41.53.5 1.18 1.03 1.92 1.42.1.06.18.09.27.12.33.13.63.29.92.39.24.08.39.03.54-.08.15-.11.41-.58.54-.78.13-.2.24-.18.41-.12.18.06.9.44 1.06.51.16.07.28.1.31.15.04.05.04.1 0 .2zM12 2a10 10 0 0 0-10 10 10 10 0 0 0 10 10c.05 0 .1 0 .15-.02-1.42.76-2.95 1.13-4.5 1.13-1.03 0-2.03-.2-2.96-.58-.3-.13-.48-.44-.43-.78.05-.33.33-.58.66-.58.05 0 .11 0 .16.03.88.33 1.81.5 2.78.5 1.34 0 2.65-.3 3.86-.88.24-.12.51-.03.66.19s.03.51-.19.66a9.5 9.5 0 0 1-5.12 1.41 10 10 0 0 1 5.4-15.42 10 10 0 0 0-5.4 15.41c-.48-.23-1.12-1-1.12-1s-.19.04-.5.31c-.31.28-.73.68-1.03.95-.3.27-.58.5-1.13.44-.55-.06-1.18-.3-1.55-.54-.37-.24-.71-.55-1.01-.92-.3-.37-.58-.78-.79-1.24-.21-.46-.4-.96-.4-1.48 0-.51.03-.98.08-1.43.05-.45.1-.88.2-1.3.1-.41.23-.8.4-1.17.18-.37.38-.72.63-1.04.25-.32.53-.61.84-.87s.65-.5 1.01-.71c.36-.21.74-.39 1.13-.53S10.98 2 12 2z"></path></svg>
                    Pedir por WhatsApp
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
              Parece que aún no has añadido ningún regalo.
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
