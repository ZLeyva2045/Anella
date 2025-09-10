// src/components/anella/GiftGallery.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { collection, onSnapshot, query, limit, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Gift, Theme } from "@/types/firestore";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function GiftGallery() {
  const [activeTheme, setActiveTheme] = useState("Todos");
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const themesUnsub = onSnapshot(collection(db, "themes"), (snapshot) => {
      const themesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Theme));
      setThemes(themesData);
    });

    const giftsQuery =
      activeTheme === "Todos"
        ? query(
            collection(db, "gifts"),
            where("showInWebsite", "!=", false),
            limit(4) // Show 4 for this layout
          )
        : query(
            collection(db, "gifts"),
            where("showInWebsite", "!=", false),
            where("themes", "array-contains", activeTheme),
            limit(4)
          );

    const giftsUnsub = onSnapshot(giftsQuery, (snapshot) => {
      const giftsData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Gift)
      );
      setGifts(giftsData);
      setLoading(false);
    });

    return () => {
      themesUnsub();
      giftsUnsub();
    };
  }, [activeTheme]);

  return (
    <section className="py-12">
        <h2 className="text-3xl font-bold leading-tight tracking-[-0.015em] px-4 pb-6 text-center">Nuestras Creaciones</h2>
        <div className="flex justify-center gap-2 sm:gap-4 mb-8 flex-wrap">
            <button className={cn("filter-btn py-2 px-4 rounded-full text-sm font-medium transition-colors duration-300", activeTheme === 'Todos' && 'active')} onClick={() => setActiveTheme('Todos')}>Todos</button>
            {themes.map((theme) => (
                 <button key={theme.id} className={cn("filter-btn py-2 px-4 rounded-full text-sm font-medium transition-colors duration-300", activeTheme === theme.name && 'active')} onClick={() => setActiveTheme(theme.name)}>
                    {theme.name}
                 </button>
            ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="glassmorphism p-4 group">
                <Skeleton className="w-full aspect-square bg-white/50 rounded-lg" />
                 <div className="mt-4">
                    <Skeleton className="h-6 w-3/4 mb-2 bg-white/50" />
                    <Skeleton className="h-4 w-full bg-white/50" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {gifts.map((gift) => (
              <Link href={`/products/${gift.id}`} key={gift.id} className="group">
                <div className="flex flex-col gap-4 rounded-xl glassmorphism p-4 h-full">
                    <div className="overflow-hidden rounded-lg">
                        <Image
                            src={gift.images[0] || "https://placehold.co/400x400.png"}
                            alt={gift.name}
                            width={400}
                            height={400}
                            className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col transform group-hover:scale-105 transition-transform duration-300"
                            data-ai-hint={gift.name.split(" ").slice(0, 2).join(" ")}
                        />
                    </div>
                    <div>
                        <p className="text-base font-bold leading-normal">{gift.name}</p>
                        <p className="text-[hsl(var(--secondary-text))] text-sm font-normal leading-normal line-clamp-2">{gift.description}</p>
                    </div>
                </div>
              </Link>
            ))}
          </div>
        )}
    </section>
  );
}
