// src/components/anella/GiftGallery.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { collection, onSnapshot, query, limit, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Gift, Theme } from "@/types/firestore";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";

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

    // We create a listener that changes based on the active theme
    const giftsQuery =
      activeTheme === "Todos"
        ? query(
            collection(db, "gifts"),
            where("showInWebsite", "!=", false),
            limit(6)
          )
        : query(
            collection(db, "gifts"),
            where("showInWebsite", "!=", false),
            where("themes", "array-contains", activeTheme),
            limit(6)
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
    <section id="gallery" className="bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight">
            Nuestras Creaciones
          </h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Un vistazo a los regalos personalizados que amamos crear.
          </p>
        </div>

        <div className="flex justify-center flex-wrap gap-2 mb-8">
          <Button
            key="Todos"
            variant={activeTheme === "Todos" ? "default" : "secondary"}
            onClick={() => setActiveTheme("Todos")}
          >
            Todos
          </Button>
          {themes.map((theme) => (
            <Button
              key={theme.id}
              variant={activeTheme === theme.name ? "default" : "secondary"}
              onClick={() => setActiveTheme(theme.name)}
            >
              {theme.name}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {gifts.map((gift) => (
              <Link href={`/products/${gift.id}`} key={gift.id} className="group">
                <Card
                  className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 h-full"
                >
                  <CardHeader className="p-0">
                    <Image
                      src={gift.images[0] || "https://placehold.co/600x400.png"}
                      alt={gift.name}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint={gift.name.split(" ").slice(0, 2).join(" ")}
                    />
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="mb-2">{gift.name}</CardTitle>
                    <CardDescription>{gift.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
