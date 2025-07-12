// src/components/products/ProductFilters.tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ListFilter, Star } from "lucide-react";
import type { Theme } from "@/types/firestore";

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
    const newSelection = selectedThemes.includes(themeName)
      ? selectedThemes.filter(name => name !== themeName)
      : [...selectedThemes, themeName];
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
        <Accordion type="multiple" defaultValue={["price", "themes", "rating"]} className="w-full">
          
          <AccordionItem value="themes">
            <AccordionTrigger className="text-base font-semibold">Temática</AccordionTrigger>
            <AccordionContent className="pt-2 space-y-2">
              {themes.map(theme => (
                <div key={theme.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`theme-${theme.id}`}
                    checked={selectedThemes.includes(theme.name)}
                    onCheckedChange={() => handleThemeChange(theme.name)}
                  />
                  <Label htmlFor={`theme-${theme.id}`} className="font-normal cursor-pointer">{theme.name}</Label>
                </div>
              ))}
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
                value={priceRange}
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
