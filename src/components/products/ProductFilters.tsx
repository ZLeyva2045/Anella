// src/components/products/ProductFilters.tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ListFilter, Star } from "lucide-react";
import type { Theme } from "@/types/firestore";
import Image from 'next/image';
import { cn } from "@/lib/utils";

interface ProductFiltersProps {
  themes: Theme[];
  selectedThemes: string[];
  setSelectedThemes: (themes: string[]) => void;
  priceRange: [number];
  setPriceRange: (range: [number]) => void;
  rating: number;
  setRating: (rating: number) => void;
}

export function ProductFilters({
  themes,
  selectedThemes,
  setSelectedThemes,
  priceRange,
  setPriceRange,
  rating,
  setRating,
}: ProductFiltersProps) {

  const handleThemeChange = (themeName: string) => {
    // Only allow one theme to be selected at a time for this feature
    const newSelection = selectedThemes.includes(themeName) ? [] : [themeName];
    setSelectedThemes(newSelection);
  };
  
  const handleClearFilters = () => {
    setSelectedThemes([]);
    setPriceRange([500]);
    setRating(0);
  }

  return (
    <Card className="sticky top-24">
      <CardHeader className="flex-row items-center justify-between border-b">
        <div className="flex items-center gap-2">
            <ListFilter className="h-5 w-5" />
            <CardTitle className="text-xl">Filtros</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>Limpiar</Button>
      </CardHeader>
      <CardContent className="p-4">
        <Accordion type="multiple" defaultValue={["themes", "price", "rating"]} className="w-full">
          
          <AccordionItem value="themes">
            <AccordionTrigger className="text-base font-semibold">Temática</AccordionTrigger>
            <AccordionContent className="pt-2">
                <div className="flex flex-wrap gap-2">
                    {themes.map(theme => (
                        <button 
                            key={theme.id}
                            onClick={() => handleThemeChange(theme.name)}
                            className={cn(
                                "h-14 w-14 rounded-full border-2 p-1 transition-all duration-200 hover:scale-105 hover:border-primary/80",
                                selectedThemes.includes(theme.name) ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                            )}
                            title={theme.name}
                        >
                           <Image 
                                src={theme.logoUrl || '/placeholder.svg'} 
                                alt={theme.name} 
                                width={56} 
                                height={56}
                                className="w-full h-full object-contain rounded-full bg-secondary/50"
                           />
                        </button>
                    ))}
                </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="price">
            <AccordionTrigger className="text-base font-semibold">Precio</AccordionTrigger>
            <AccordionContent className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <Label>Hasta S/{priceRange[0]}</Label>
              </div>
              <Slider
                defaultValue={[500]}
                max={500}
                step={10}
                onValueChange={(value) => setPriceRange(value as [number])}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rating">
            <AccordionTrigger className="text-base font-semibold">Valoración</AccordionTrigger>
            <AccordionContent className="pt-2">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <Button key={star} variant="ghost" size="icon" onClick={() => setRating(star)} className="p-1 h-auto w-auto">
                            <Star className={`w-6 h-6 transition-colors ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        </Button>
                    ))}
                </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </CardContent>
    </Card>
  );
}
