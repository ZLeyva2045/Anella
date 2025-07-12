// src/components/products/Toolbar.tsx
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface ToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  productCount: number;
}

export function Toolbar({
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  productCount
}: ToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 p-4 rounded-lg bg-card border">
      <div className="relative w-full md:w-auto md:flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar regalos..."
          className="pl-9 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-4 w-full md:w-auto">
        <span className="text-sm text-muted-foreground whitespace-nowrap">{productCount} regalos</span>
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Más nuevos</SelectItem>
            <SelectItem value="rating">Mejor valorados</SelectItem>
            <SelectItem value="price-asc">Precio: Bajo a Alto</SelectItem>
            <SelectItem value="price-desc">Precio: Alto a Bajo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
