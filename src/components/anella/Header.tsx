// src/components/anella/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Gift,
  Search,
  ShoppingCart,
  User,
  LogOut,
  LogIn,
  Menu,
  Heart,
  Cake,
  Star,
  Sparkles,
  Car,
  Coffee,
  IceCream,
  Flower,
  Briefcase,
  PlusCircle,
  Package,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { useCart } from '@/hooks/useCart';

const categories = [
  { name: 'Listos en tienda', href: '/products?category=store-ready', icon: Package },
  { name: 'Románticos', href: '/products?category=romantic', icon: Heart },
  { name: 'Cumpleaños', href: '/products?category=birthday', icon: Cake },
  { name: 'Otras temáticas', href: '/products?category=themes', icon: Star },
  { name: 'Individuales', href: '/products?category=individual', icon: Sparkles },
  { name: 'Hot Wheels', href: '/products?category=hot-wheels', icon: Car },
  { name: 'Desayunos', href: '/products?category=breakfast', icon: Coffee },
  { name: 'Postres', href: '/products?category=desserts', icon: IceCream },
  { name: 'Flores', href: '/products?category=flowers', icon: Flower },
  { name: 'Ocasiones', href: '/products?category=occasions', icon: Gift },
  { name: 'Corporativos', href: '/products?category=corporate', icon: Briefcase },
  { name: 'Complementos', href: '/products?category=addons', icon: PlusCircle },
];

export function Header() {
  const { user, signOut, loading } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">Menú de usuario</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user ? (
          <>
            <DropdownMenuLabel>
              <p className="font-normal">Conectado como</p>
              <p className="font-semibold truncate">{user.displayName || user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <User />
                <span>Mi Cuenta</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel>Bienvenido</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login">
                <LogIn />
                <span>Iniciar Sesión</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/signup">
                <UserPlus />
                <span>Registrarse</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const MainNav = ({ className }: { className?: string }) => (
    <NavigationMenu className={className}>
      <NavigationMenuList>
        <NavigationMenuItem>
           <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
              Inicio
            </NavigationMenuLink>
        </NavigationMenuItem>
         <NavigationMenuItem>
           <NavigationMenuLink href="/products" className={navigationMenuTriggerStyle()}>
              Productos
            </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Categorías</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {categories.map((component) => (
                <ListItem
                  key={component.name}
                  title={component.name}
                  href={component.href}
                  icon={component.icon}
                >
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/#gallery" className={navigationMenuTriggerStyle()}>
            Galería
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
           <NavigationMenuLink href="/#contact" className={navigationMenuTriggerStyle()}>
            Contacto
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );

  const MobileNav = () => (
     <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        <nav className="flex flex-col h-full">
          <div className="p-4 border-b">
             <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <Gift className="h-7 w-7 text-primary" />
              <span className="text-2xl font-headline text-primary" style={{fontFamily: 'Amarillo'}}>Anella</span>
            </Link>
          </div>
          <div className="flex-grow p-4 space-y-2 overflow-y-auto">
             <Link href="/" className="block py-2 text-lg" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
             <Link href="/products" className="block py-2 text-lg" onClick={() => setMobileMenuOpen(false)}>Productos</Link>
             <p className="py-2 text-lg font-semibold">Categorías</p>
             {categories.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-4 pl-4 py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            <Link href="/#gallery" className="block pt-4 text-lg" onClick={() => setMobileMenuOpen(false)}>Galería</Link>
            <Link href="/#contact" className="block py-2 text-lg" onClick={() => setMobileMenuOpen(false)}>Contacto</Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-lg">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2">
            <Gift className="h-8 w-8 text-primary" />
            <span className="text-3xl" style={{fontFamily: 'Amarillo', color: 'hsl(var(--primary))'}}>Anella</span>
          </Link>
        </div>

        <div className="hidden md:flex flex-1 justify-center">
           <MainNav />
        </div>
        
        <div className="flex items-center gap-2">
           <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Buscar regalos..." className="pl-9 w-40 lg:w-64" />
          </div>
          <Button asChild variant="ghost" size="icon" className="rounded-full relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Carrito</span>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground transform translate-x-1/4 -translate-y-1/4">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
          {!loading && <UserMenu />}
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & { icon: React.ElementType }
>(({ className, title, children, icon: Icon, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href!}
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-primary" />
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
