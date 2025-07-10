"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const gifts = [
  { id: 1, title: 'Personalized Coffee Mug', category: 'Birthdays', description: 'A classic mug with a custom name and message.', imageUrl: 'https://placehold.co/600x400.png', hint: 'coffee mug' },
  { id: 2, title: 'Engraved Photo Frame', category: 'Anniversaries', description: 'Cherish memories with a beautifully engraved frame.', imageUrl: 'https://placehold.co/600x400.png', hint: 'photo frame' },
  { id: 3, title: 'Custom Star Map', category: 'Anniversaries', description: 'The night sky from your special date.', imageUrl: 'https://placehold.co/600x400.png', hint: 'star map' },
  { id: 4, title: 'Monogrammed T-Shirt', category: 'Birthdays', description: 'Stylish and personal, with their initial.', imageUrl: 'https://placehold.co/600x400.png', hint: 'custom t-shirt' },
  { id: 5, title: 'Personalized Story Book', category: 'All', description: 'A unique book where they are the main character.', imageUrl: 'https://placehold.co/600x400.png', hint: 'custom book' },
  { id: 6, title: 'Engraved Cutting Board', category: 'All', description: 'Perfect for the foodie in your life.', imageUrl: 'https://placehold.co/600x400.png', hint: 'cutting board' },
];

const filters = ["All", "Birthdays", "Anniversaries"];

export function GiftGallery() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredGifts = activeFilter === "All"
    ? gifts
    : gifts.filter(gift => gift.category === activeFilter);

  return (
    <section id="gallery" className="bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight">Our Creations</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            A glimpse into the personalized gifts we love to make.
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
