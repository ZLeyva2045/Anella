// src/components/products/ProductFilters.tsx
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Star } from "lucide-react";
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
    const newSelection = selectedThemes.includes(themeName) ? [] : [themeName];
    setSelectedThemes(newSelection);
  };
  
  return (
    <div className="sticky top-28 bg-background-surface/50 backdrop-blur-lg border border-warm-white rounded-2xl p-6 shadow-[8px_8px_20px_#EBDCCD,-8px_-8px_20px_#FFF] transition-all duration-300">
        <h2 className="text-xl font-bold mb-6 text-main-text">Filtros</h2>
        <div className="space-y-6">
            <div>
                <h3 className="text-base font-semibold mb-3 text-secondary-text">Temática</h3>
                <div className="space-y-2">
                    {themes.map(theme => (
                        <a 
                          key={theme.id}
                          className="block text-main-text hover:text-brand-pink transition-colors cursor-pointer"
                          onClick={() => handleThemeChange(theme.name)}
                        >
                            {theme.name}
                        </a>
                    ))}
                </div>
            </div>
             <div>
                <h3 className="text-base font-semibold mb-3 text-secondary-text">Precio</h3>
                <Slider
                    defaultValue={[500]}
                    max={500}
                    step={10}
                    onValueChange={(value) => setPriceRange(value as [number])}
                    className="w-full h-2 bg-border-subtle rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-brand-pink [&::-webkit-slider-thumb]:rounded-full"
                />
                <div className="flex justify-between text-sm text-secondary-text mt-2">
                    <span>S/0</span>
                    <span>S/{priceRange[0]}</span>
                </div>
            </div>
            <div>
                <h3 className="text-base font-semibold mb-3 text-secondary-text">Calificación</h3>
                <div className="flex items-center gap-1 text-soft-gold">
                    {[...Array(5)].map((_, i) => (
                        <Star 
                            key={i} 
                            onClick={() => setRating(i + 1)}
                            className={`cursor-pointer ${rating > i ? 'fill-current' : 'text-border-subtle'}`}
                        />
                    ))}
                    <span className="text-sm text-secondary-text ml-2">{rating.toFixed(1)}+</span>
                </div>
            </div>
        </div>
    </div>
  );
}
