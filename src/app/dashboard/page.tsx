// src/app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Loader2, Settings, ShoppingCart, Heart, Award, Gift, Star, Gem, Crown, Sparkles, Pencil } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const loyaltyTiers = {
  Start: { level: 0, next: 100, icon: <Star className="h-5 w-5" /> },
  Plus: { level: 1, next: 500, icon: <Gift className="h-5 w-5" /> },
  Pro: { level: 2, next: 2000, icon: <Gem className="h-5 w-5" /> },
  Elite: { level: 3, next: Infinity, icon: <Crown className="h-5 w-5" /> },
};

const getCurrentTier = (points: number) => {
  if (points >= 2000) return loyaltyTiers.Elite;
  if (points >= 500) return loyaltyTiers.Pro;
  if (points >= 100) return loyaltyTiers.Plus;
  return loyaltyTiers.Start;
};

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
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  if (firestoreUser.role !== 'customer') {
      return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  const userPoints = firestoreUser.loyaltyPoints || 0;
  const currentTier = getCurrentTier(userPoints);
  const tierProgress = (userPoints / currentTier.next) * 100;

  return (
     <div className="min-h-screen w-full bg-cover bg-center p-4 md:p-8" style={{backgroundImage: 'url(https://i.ibb.co/mSBNfPZ/Fondo.png)'}}>
        <main className="max-w-4xl mx-auto bg-card/60 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg">
            {/* --- Header --- */}
            <header className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Image
                        src={firestoreUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firestoreUser.name)}&background=random`}
                        alt="Avatar"
                        width={64}
                        height={64}
                        className="rounded-full border-4 border-white shadow-md"
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">¡Hola, {firestoreUser.name.split(' ')[0]}!</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-600 text-xs font-semibold rounded-full">Nivel: Pro</span>
                            <span className="px-2 py-0.5 bg-pink-400/20 text-pink-600 text-xs font-semibold rounded-full">12 Regalos</span>
                            <span className="px-2 py-0.5 bg-green-400/20 text-green-600 text-xs font-semibold rounded-full">850 Coins</span>
                        </div>
                    </div>
                </div>
                 <div className="hidden md:flex items-center gap-2">
                    <p className="text-sm font-medium text-muted-foreground">Tus favoritos:</p>
                     <div className="flex -space-x-3">
                      <div className="h-10 w-10 rounded-full bg-red-200 border-2 border-white flex items-center justify-center shadow-sm">🍫</div>
                      <div className="h-10 w-10 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center shadow-sm">🍺</div>
                      <div className="h-10 w-10 rounded-full bg-blue-200 border-2 border-white flex items-center justify-center shadow-sm">🧸</div>
                      <div className="h-10 w-10 rounded-full bg-pink-200 border-2 border-white flex items-center justify-center shadow-sm">🌹</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                {/* --- Main Content --- */}
                <div className="md:col-span-2 space-y-6">
                    {/* Loyalty Card */}
                    <Card className="neumorphic-shadow-inset bg-background/80">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Award className="text-primary" />
                          Anella Club
                        </CardTitle>
                        <div className="flex items-center gap-2 font-bold text-primary">
                          {currentTier.icon}
                          <span>{Object.keys(loyaltyTiers).find(key => loyaltyTiers[key as keyof typeof loyaltyTiers] === currentTier)}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          Has acumulado <span className="font-bold">{userPoints}</span> puntos. ¡Te faltan {Math.max(0, currentTier.next - userPoints)} para el siguiente nivel!
                        </p>
                        <Progress value={tierProgress} className="h-3" />
                      </CardContent>
                      <CardFooter>
                         <Button variant="outline" size="sm" className="ml-auto">Ver Beneficios</Button>
                      </CardFooter>
                    </Card>

                    {/* Anella Coins */}
                    <Card className="relative overflow-hidden neumorphic-shadow bg-background/80">
                        <Sparkles className="absolute -top-4 -right-4 h-24 w-24 text-yellow-300/30" />
                        <CardHeader>
                            <CardTitle>Anella Coins</CardTitle>
                            <CardDescription>Tus monedas para descuentos y sorpresas.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute h-16 w-16 bg-yellow-400/50 rounded-full blur-lg animate-pulse"></div>
                                    <Image src="https://i.ibb.co/Vvz1kSb/Anella-Coin.png" alt="Anella Coin" width={64} height={64} className="relative animate-bounce" />
                                </div>
                                <span className="text-4xl font-bold text-foreground">850</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button size="sm">Ganar Coins</Button>
                                <Button size="sm" variant="outline">Canjear</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* --- Sidebar --- */}
                <aside className="md:col-span-1 space-y-6">
                    {/* Quick Actions */}
                     <Card className="neumorphic-shadow-inset bg-background/80">
                        <CardHeader><CardTitle>Acceso Rápido</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                          <Button variant="outline" className="flex flex-col h-20 gap-1"><Award/><span className="text-xs">Beneficios</span></Button>
                          <Button variant="outline" className="flex flex-col h-20 gap-1"><ShoppingCart/><span className="text-xs">Mis Compras</span></Button>
                          <Button variant="outline" className="flex flex-col h-20 gap-1"><Heart/><span className="text-xs">Deseos</span></Button>
                          <Button variant="outline" className="flex flex-col h-20 gap-1"><Settings/><span className="text-xs">Configurar</span></Button>
                        </CardContent>
                    </Card>

                    {/* Quick Settings */}
                    <Card className="neumorphic-shadow-inset bg-background/80">
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Pencil className="h-4 w-4"/>Configuración Rápida</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-1">
                                <Label htmlFor="alias">Alias</Label>
                                <Input id="alias" defaultValue={firestoreUser.name} />
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input id="phone" defaultValue={firestoreUser.phone || ''} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="location">Ubicación</Label>
                                 <Select defaultValue="pe">
                                    <SelectTrigger id="location"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pe">Perú</SelectItem>
                                        <SelectItem value="co">Colombia</SelectItem>
                                        <SelectItem value="mx">Mexico</SelectItem>
                                    </SelectContent>
                                 </Select>
                            </div>
                        </CardContent>
                    </Card>
                </aside>
            </div>
             <CardFooter className="p-6 border-t border-white/10 mt-6">
                <Button onClick={handleSignOut} variant="destructive">
                    Cerrar Sesión
                </Button>
            </CardFooter>
        </main>
    </div>
  );
}