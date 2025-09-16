// src/app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress"

import { Loader2, Settings, ShoppingCart, Heart, Award, Gift, Star, LogOut, Coins, Store } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const loyaltyTiers = {
  Start: { level: 0, name: "Anella Start", next: 200, benefits: ["Acumula puntos con cada compra"] },
  Plus: { level: 1, name: "Anella Plus", next: 500, benefits: ["Envío gratis en un pedido", "Regalo sorpresa pequeño"] },
  Pro: { level: 2, name: "Anella Pro", next: 1500, benefits: ["Envío gratis siempre", "Doble puntos en tu cumpleaños"] },
  Elite: { level: 3, name: "Anella Elite", next: Infinity, benefits: ["Acceso VIP a nuevos productos", "Regalo exclusivo anual"] },
};

const getCurrentTier = (points: number) => {
  if (points >= 1500) return loyaltyTiers.Elite;
  if (points >= 500) return loyaltyTiers.Pro;
  if (points >= 200) return loyaltyTiers.Plus;
  return loyaltyTiers.Start;
};


const wishlistItems = [
    { name: "Anillo de Oro Rosa", price: 120, image: "https://placehold.co/50x50/FFF9F2/D56B77?text=💍" },
    { name: "Collar Personalizado", price: 85, image: "https://placehold.co/50x50/FFF9F2/D56B77?text=💎" },
    { name: "Set de Broches", price: 45, image: "https://placehold.co/50x50/FFF9F2/D56B77?text=✨" },
]

export default function DashboardPage() {
  const { user, firestoreUser, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && firestoreUser) {
      if (firestoreUser.role === 'manager' || firestoreUser.role === 'designer') {
        router.replace('/admin');
      } else if (firestoreUser.role === 'sales') {
        router.replace('/sales');
      }
    }
  }, [user, firestoreUser, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };
  
  if (loading || !user || !firestoreUser) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F3E8DB]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  if (firestoreUser.role !== 'customer') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#F3E8DB]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  const anellaCoins = firestoreUser.loyaltyPoints || 0;
  const totalGiftsPurchased = firestoreUser.orders?.length || 0;
  const currentTier = getCurrentTier(anellaCoins);
  const tierProgress = currentTier.next === Infinity ? 100 : (anellaCoins / currentTier.next) * 100;
  const unlockedBenefits = currentTier.benefits;

  return (
     <div className="min-h-screen w-full bg-[#FFF9F2] p-4 md:p-8">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
            
            {/* --- Sidebar --- */}
            <aside className="bg-white rounded-2xl p-6 shadow-lg border border-[#EBDCCD] flex flex-col items-center animate-slideInLeft">
                <div className="flex flex-col items-center mb-6 text-center">
                    <Image
                        src={firestoreUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firestoreUser.name)}&background=D56B77&color=fff`}
                        alt="Avatar"
                        width={120}
                        height={120}
                        className="rounded-full object-cover border-4 border-primary p-1 mb-4 transition-transform duration-300 hover:scale-105"
                    />
                    <h2 className="text-xl font-semibold text-primary mb-1">¡Hola, bienvenido!</h2>
                    <p className="text-lg text-muted-foreground font-medium">{firestoreUser.name}</p>
                </div>

                <div className="w-full bg-gradient-to-br from-pink-400 to-primary rounded-xl p-4 text-white shadow-md mb-6 transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg">Tarjeta de Fidelización</h3>
                        <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full">{currentTier.name}</span>
                    </div>
                    <Progress value={tierProgress} className="h-2 bg-white/30 [&>div]:bg-white" />
                    <div className="flex justify-between text-xs font-semibold mt-1">
                        <span>{anellaCoins} pts</span>
                        <span>{currentTier.next === Infinity ? 'MAX' : `${currentTier.next} pts`}</span>
                    </div>
                </div>

                <nav className="w-full flex-1">
                    <ul className="space-y-2">
                        <li><Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-pink-100/50 hover:text-primary transition-colors font-medium"><Award className="h-5 w-5" /> Mi Panel</Link></li>
                        <li><Link href="/cart" className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-pink-100/50 hover:text-primary transition-colors font-medium"><ShoppingCart className="h-5 w-5" /> Mis Compras</Link></li>
                        <li><Link href="/wishlist" className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-pink-100/50 hover:text-primary transition-colors font-medium"><Heart className="h-5 w-5" /> Mi Lista de Deseos</Link></li>
                        <li><Link href="/dashboard/settings" className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-pink-100/50 hover:text-primary transition-colors font-medium"><Settings className="h-5 w-5" /> Configuración</Link></li>
                    </ul>
                </nav>

                 <div className="w-full mt-4 space-y-2">
                    <Button asChild className="w-full">
                        <Link href="/products">
                            <Store className="mr-2 h-4 w-4"/>
                            Ir a la Tienda
                        </Link>
                    </Button>
                    <Button onClick={handleSignOut} variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-red-100/50">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </div>
            </aside>
            
            {/* --- Main Content --- */}
            <main className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                <Card className="md:col-span-2 bg-gradient-to-br from-amber-300 to-yellow-500 text-yellow-900 shadow-lg border-none relative overflow-hidden transition-transform duration-300 hover:-translate-y-1">
                     <Coins className="absolute -right-5 -bottom-5 h-32 w-32 text-white/20 animate-pulse" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">Mis Anella Coins</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{anellaCoins.toLocaleString()}</p>
                        <p className="text-sm">Canjea tus coins por increíbles beneficios.</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-lg border border-[#EBDCCD] transition-transform duration-300 hover:-translate-y-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Gift/>Regalos Comprados</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-around text-center">
                         {totalGiftsPurchased > 0 ? (
                             <>
                                <div>
                                    <p className="text-3xl font-bold text-primary">0</p>
                                    <p className="text-sm text-muted-foreground">Este mes</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-primary">{totalGiftsPurchased}</p>
                                    <p className="text-sm text-muted-foreground">En total</p>
                                </div>
                             </>
                         ) : (
                            <div className="text-center py-4">
                                <p className="text-muted-foreground">¡Bienvenido! Aún no has comprado ningún regalo.</p>
                                <Button variant="link" asChild className="mt-2"><Link href="/products">Haz tu primera compra y empieza a ganar puntos</Link></Button>
                            </div>
                         )}
                    </CardContent>
                </Card>
                 
                <Card className="bg-white shadow-lg border border-[#EBDCCD] transition-transform duration-300 hover:-translate-y-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Star/>Mis Beneficios</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-center">
                        {unlockedBenefits.map(benefit => (
                             <div key={benefit} className="bg-pink-100/50 p-3 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-pink-100 transition-colors">
                                <div className="text-primary"><Award className="h-6 w-6"/></div>
                                <p className="text-xs font-semibold text-primary">{benefit}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                
                <Card className="md:col-span-2 bg-white shadow-lg border border-[#EBDCCD] transition-transform duration-300 hover:-translate-y-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Heart/>Mi Lista de Deseos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                         {wishlistItems.map((item, index) => (
                             <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-100/50">
                                 <Image src={item.image} alt={item.name} width={50} height={50} className="rounded-md" />
                                 <div className="flex-1">
                                     <p className="font-semibold">{item.name}</p>
                                     <p className="text-sm text-amber-600 font-bold">{item.price} Coins</p>
                                 </div>
                                 <Heart className="h-5 w-5 text-primary fill-current" />
                             </div>
                         ))}
                    </CardContent>
                </Card>
            </main>

        </div>
     </div>
  );
}
