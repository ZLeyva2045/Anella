// src/app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress"
import { Separator } from '@/components/ui/separator';

import { Loader2, Settings, ShoppingCart, Heart, Award, Gift, Star, LogOut, Coins } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const loyaltyTiers = {
  Start: { level: 0, next: 100, name: "Anella Start" },
  Plus: { level: 1, next: 500, name: "Anella Plus" },
  Pro: { level: 2, next: 2000, name: "Anella Pro" },
  Elite: { level: 3, next: Infinity, name: "Anella Elite" },
};

const getCurrentTier = (points: number) => {
  if (points >= 2000) return loyaltyTiers.Elite;
  if (points >= 500) return loyaltyTiers.Pro;
  if (points >= 100) return loyaltyTiers.Plus;
  return loyaltyTiers.Start;
};

const benefits = [
    { icon: <Gift className="h-6 w-6"/>, name: "Regalo Sorpresa" },
    { icon: <ShoppingCart className="h-6 w-6"/>, name: "Envío Gratis" },
    { icon: <Award className="h-6 w-6"/>, name: "Acceso VIP" },
    { icon: <Heart className="h-6 w-6"/>, name: "Doble Puntos" },
]

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

  const userPoints = firestoreUser.loyaltyPoints || 0;
  const currentTier = getCurrentTier(userPoints);
  const tierProgress = currentTier.next === Infinity ? 100 : (userPoints / currentTier.next) * 100;

  return (
     <div className="min-h-screen w-full bg-[#F3E8DB] p-4 md:p-8">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
            
            {/* --- Sidebar --- */}
            <aside className="bg-[#FFF9F2] rounded-2xl p-6 shadow-lg border border-[#EBDCCD] flex flex-col items-center">
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
                    <div className="bg-white/30 h-2 rounded-full my-2">
                        <div className="bg-white h-full rounded-full" style={{ width: `${tierProgress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                        <span>{userPoints} pts</span>
                        <span>{currentTier.next === Infinity ? 'MAX' : `${currentTier.next} pts`}</span>
                    </div>
                </div>

                <nav className="w-full flex-1">
                    <ul className="space-y-2">
                        <li><Link href="#" className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-pink-100/50 hover:text-primary transition-colors"><Gift className="h-5 w-5" /> Regalos Comprados</Link></li>
                        <li><Link href="#" className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-pink-100/50 hover:text-primary transition-colors"><Coins className="h-5 w-5" /> Mis Anella Coins</Link></li>
                        <li><Link href="#" className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-pink-100/50 hover:text-primary transition-colors"><Star className="h-5 w-5" /> Mis Beneficios</Link></li>
                        <li><Link href="#" className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-pink-100/50 hover:text-primary transition-colors"><ShoppingCart className="h-5 w-5" /> Mis Compras</Link></li>
                        <li><Link href="/wishlist" className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-pink-100/50 hover:text-primary transition-colors"><Heart className="h-5 w-5" /> Mi Lista de Deseos</Link></li>
                        <li><Link href="/dashboard/settings" className="flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-pink-100/50 hover:text-primary transition-colors"><Settings className="h-5 w-5" /> Configuración</Link></li>
                    </ul>
                </nav>

                 <Button onClick={handleSignOut} variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-red-100/50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                </Button>
            </aside>
            
            {/* --- Main Content --- */}
            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="md:col-span-2 bg-gradient-to-br from-amber-300 to-yellow-500 text-yellow-900 shadow-lg border-none relative overflow-hidden transition-transform duration-300 hover:-translate-y-1">
                     <Coins className="absolute -right-5 -bottom-5 h-32 w-32 text-white/20" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">Mis Anella Coins</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">1,250</p>
                        <p className="text-sm">Canjea tus coins por increíbles beneficios.</p>
                    </CardContent>
                </Card>

                <Card className="bg-[#FFF9F2] shadow-lg border border-[#EBDCCD] transition-transform duration-300 hover:-translate-y-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Gift/>Regalos Comprados</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-around text-center">
                        <div>
                            <p className="text-3xl font-bold text-primary">12</p>
                            <p className="text-sm text-muted-foreground">Este mes</p>
                        </div>
                         <div>
                            <p className="text-3xl font-bold text-primary">47</p>
                            <p className="text-sm text-muted-foreground">En total</p>
                        </div>
                    </CardContent>
                </Card>
                 
                <Card className="bg-[#FFF9F2] shadow-lg border border-[#EBDCCD] transition-transform duration-300 hover:-translate-y-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Star/>Mis Beneficios</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-center">
                        {benefits.map(b => (
                             <div key={b.name} className="bg-pink-100/50 p-3 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-pink-100 transition-colors">
                                <div className="text-primary">{b.icon}</div>
                                <p className="text-xs font-semibold text-primary">{b.name}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                
                <Card className="md:col-span-2 bg-[#FFF9F2] shadow-lg border border-[#EBDCCD] transition-transform duration-300 hover:-translate-y-1">
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
