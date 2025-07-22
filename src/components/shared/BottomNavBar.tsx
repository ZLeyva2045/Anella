// src/components/shared/BottomNavBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';


export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface BottomNavBarProps {
  navItems: NavItem[];
}

export function BottomNavBar({ navItems }: BottomNavBarProps) {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border md:hidden">
      <ScrollArea className="w-full h-full whitespace-nowrap">
        <div className="flex w-max mx-auto h-full">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex flex-col items-center justify-center px-4 hover:bg-muted group min-w-[80px]',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-[10px] text-center font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
         <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
