"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const gifts = [
  { id: 1, title: 'Taza de Café Personalizada', category: 'Cumpleaños', description: 'Una taza clásica con un nombre y mensaje personalizado.', imageUrl: 'https://placehold.co/600x400.png', hint: 'coffee mug' },
  { id: 2, title: 'Marco de Fotos Grabado', category: 'Aniversarios', description: 'Atresora recuerdos con un marco hermosamente grabado.', imageUrl: 'https://placehold.co/600x400.png', hint: 'photo frame' },
  { id: 3, title: 'Mapa Estelar Personalizado', category: 'Aniversarios', description: 'El cielo nocturno de tu fecha especial.', imageUrl: 'https://placehold.co/600x400.png', hint: 'star map' },
  { id: 4, title: 'Camiseta con Monograma', category: 'Cumpleaños', description: 'Elegante y personal, con su inicial.', imageUrl: 'https://placehold.co/600x400.png', hint: 'custom t-shirt' },
  { id: 5, title: 'Libro de Cuentos Personalizado', category: 'Todos', description: 'Un libro único donde son los protagonistas.', imageUrl: 'https://placehold.co/600x400.png', hint: 'custom book' },
  { id: 6, title: 'Tabla de Cortar Grabada', category: 'Todos', description: 'Perfecto para el amante de la cocina en tu vida.', imageUrl: 'https://placehold.co/600x400.png', hint: 'cutting board' },
];

const filters = ["Todos", "Cumpleaños", "Aniversarios"];

export function GiftGallery() {
  const [activeFilter, setActiveFilter] = useState("Todos");

  const filteredGifts = activeFilter === "Todos"
    ? gifts
    : gifts.filter(gift => gift.category === activeFilter);

  return (
    <section id="gallery" className="bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight">Nuestras Creaciones</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Un vistazo a los regalos personalizados que amamos crear.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {filters.map(filter => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "secondary"}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGifts.map(gift => (
            <Card key={gift.id} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="p-0">
                <Image
                  src={gift.imageUrl}
                  alt={gift.title}
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                  data-ai-hint={gift.hint}
                />
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="mb-2">{gift.title}</CardTitle>
                <CardDescription>{gift.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
